import { Args, Command, Flags } from "@oclif/core";
import { hashElement } from "folder-hash";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import PQueue from "p-queue";
import * as tar from "tar";

import {
  SCRIPTS_POST_SYNC,
  SCRIPTS_PRE_SYNC,
  TAMASHII_ARCHIVE_FILE,
  TAMASHII_DIR,
  TAMASHII_HASH_FILE,
  TAMASHII_INTERMEDIATE_DIR,
  TAMASHII_LINKS_DIR,
  TAMASHII_PACKAGES_DIR,
} from "../../utils/constants.js";
import { execAsync } from "../../utils/cp.js";
import {
  ensureDirectory,
  isDirectory,
  isFile,
  isSymbolicLink,
  readFileSafely,
} from "../../utils/fs.js";
import { getPackageJson } from "../../utils/package-json.js";
import { toAbsolute } from "../../utils/path.js";
import { prepareTamashii } from "../../utils/prepare.js";
import { syncFiles } from "../../utils/sync-files.js";

type Options = {
  cwd: string;
  force: boolean | undefined;
  npm: boolean | undefined;
  verbose: boolean | undefined;
};

type SyncResult = "ignored" | "invalid-symlink" | "skipped" | "synced";
const processedLinkPromises = new Map<string, Promise<SyncResult>>();

const queue = new PQueue({ concurrency: 1 });

export default class Sync extends Command {
  static args = {
    package: Args.string({ description: "Target package name to sync" }),
  };

  static description = `\
Syncs local packages from source

This updates package builds under ".tamashii" based on the source code linked via symbolic link in ".tamashii/.links".
To reflect the latest builds in node_modules, where you have installed internal packages, you need to execute "tamashii refresh".

This also prevents the copying of the "node_modules" directory within the source directory that contains "devDependencies".

Consider placing this command in the "preinstall" section of npm scripts so that the required builds are prepared even during the initial run of yarn in the package directory where you have installed internal packages.
`;

  static examples = [
    "tamashii sync # all packages will be synced",
    "tamashii sync your-internal-package",
  ];

  static flags = {
    cwd: Flags.string({ description: "Current working directory of the child process" }),
    force: Flags.boolean({ description: "never skip even if no changes detected at source" }),
    npm: Flags.boolean({ description: "Use npm instead of yarn" }),
    verbose: Flags.boolean({ description: "Print verbose output" }),
  };

  static syncAll = async (self: Command, packages: string[], options: Options) =>
    Promise.all(
      packages
        .filter((name) => name !== ".gitkeep")
        .map(async (packageName) => {
          const absCwd = toAbsolute(options.cwd);
          const key = [absCwd, packageName].join(";");

          const processed = processedLinkPromises.get(key);
          if (processed) {
            return processed;
          }

          const promise = (async () => {
            const result = await Sync.syncSingle(self, packageName, options);
            switch (result) {
              case "skipped": {
                self.log(`Skipped "${packageName}" as no change is detected at ${absCwd}`);
                break;
              }

              case "invalid-symlink": {
                self.warn(`Skipped "${packageName}" due to invalid symbolic link at ${absCwd}`);
                break;
              }

              case "synced": {
                self.log(`Synced "${packageName}" successfully at ${absCwd}`);
                break;
              }
            }

            return result;
          })();

          processedLinkPromises.set(key, promise);

          return promise;
        }),
    );

  static syncSingle = async (self: Command, packageName: string, options: Options) => {
    const cwd = toAbsolute(options.cwd);

    await prepareTamashii({ cwd });

    const link = path.join(cwd, TAMASHII_LINKS_DIR, packageName);
    const intermediate = path.join(cwd, TAMASHII_INTERMEDIATE_DIR, packageName);
    const pkg = path.join(cwd, TAMASHII_PACKAGES_DIR, packageName);

    const install = options.npm ? "npm install" : "yarn";
    const runScript = options.npm ? "npm run" : "yarn";
    const isInIntermediateDir = cwd.includes(TAMASHII_DIR);

    if (cwd.includes("node_modules")) {
      return "ignored";
    }

    // NOTE: This step will be skipped in an environment where the target of the "src" symlink does not exist,
    // such as Cloud Build. However, dependencies will be resolved properly, as necessary files are updated
    // along with other source files, if you run this command before uploading files.
    if (!isInIntermediateDir && "error" in isSymbolicLink(link)) {
      return "invalid-symlink";
    }

    await Promise.all([ensureDirectory(intermediate), ensureDirectory(pkg)]);

    const source = isInIntermediateDir
      ? link
      : path.resolve(path.dirname(link), await fs.readlink(link));
    const packageJson = await getPackageJson(source);
    const hasPreRefresh = Boolean(packageJson?.scripts?.[SCRIPTS_PRE_SYNC]);
    const dirToPackage = hasPreRefresh ? packageJson?.tamashii?.dist ?? "dist" : null;

    const syncChildren = async () => {
      const sourceLinksDir = path.join(source, TAMASHII_LINKS_DIR);
      const intermediateLinksDir = path.join(intermediate, TAMASHII_LINKS_DIR);
      const intermediatePackagesDir = path.join(intermediate, TAMASHII_PACKAGES_DIR);

      if ("data" in (await isDirectory(sourceLinksDir))) {
        const [childLinks] = await Promise.all([
          fs
            .readdir(sourceLinksDir)
            .then((links) => links.filter((name) => name !== ".gitkeep").sort()),
          prepareTamashii({ cwd: intermediate }),
        ]);

        await Promise.all(
          childLinks.map(async (name) => {
            const src = path.join(sourceLinksDir, name);
            const dist = path.join(intermediateLinksDir, name);
            await ensureDirectory(dist);
            return syncFiles({ dist, hard: true, src });
          }),
        );

        const result = await this.syncAll(self, childLinks, { ...options, cwd: intermediate });
        const hashes = await Promise.all(
          childLinks.map(async (name) => {
            const hashFile = path.join(intermediatePackagesDir, name, TAMASHII_HASH_FILE);
            return readFileSafely(hashFile);
          }),
        );

        return { hashes, result };
      }

      return { hashes: [], result: [] };
    };

    const childResult = await syncChildren();
    const isChildSynced = childResult.result.includes("synced");

    const hashFile = path.join(pkg, TAMASHII_HASH_FILE);
    const previousHash = await readFileSafely(hashFile);
    const currentHash = [
      await Sync.calculateHash({ dirToPackage, source }),
      ...childResult.hashes,
    ].join("\n");

    if (!options.force && !isChildSynced && previousHash === currentHash) {
      return "skipped";
    }

    await syncFiles({ dist: intermediate, hard: true, src: link });

    if ("data" in (await isFile(path.join(intermediate, TAMASHII_ARCHIVE_FILE)))) {
      await tar.extract({
        cwd: intermediate,
        file: path.join(intermediate, TAMASHII_ARCHIVE_FILE),
      });
    }

    if (hasPreRefresh) {
      await queue.add(() =>
        execAsync(
          `${install} --production=false`,
          { cwd: intermediate, env: { ...process.env, SKIP_TAMASHII_SYNC: "yes" } },
          options.verbose,
        ),
      );
      await execAsync(`${runScript} ${SCRIPTS_PRE_SYNC}`, { cwd: intermediate }, options.verbose);
    }

    await syncFiles({
      dist: pkg,
      hard: true,
      src: dirToPackage ? path.join(intermediate, dirToPackage) : intermediate,
    });

    if (packageJson?.scripts?.[SCRIPTS_POST_SYNC]) {
      await execAsync(`${runScript} ${SCRIPTS_POST_SYNC}`, { cwd: pkg }, options.verbose);
    }

    if (currentHash) {
      await fs.writeFile(hashFile, currentHash);
    }

    return "synced";
  };

  private static calculateHash = async ({
    dirToPackage,
    source,
  }: {
    dirToPackage: null | string;
    source: string;
  }) => {
    const { hash } = await hashElement(source, {
      encoding: "hex",
      files: {
        exclude: ["**/.DS_Store", "*.log"],
      },
      folders: {
        exclude: [
          "**/node_modules",
          "**/.vscode",
          "**/.git",
          "**/.tamashii",
          ...(dirToPackage ? [dirToPackage] : []),
        ],
        matchBasename: true,
        matchPath: true,
      },
    });

    return hash;
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Sync);
    const cwd = flags.cwd ?? process.cwd();

    if (process.env.SKIP_TAMASHII_SYNC === "yes") {
      this.log(`Skipped tamashii sync as SKIP_TAMASHII_SYNC is "yes"`);
      return;
    }

    if ("error" in (await isDirectory(path.join(cwd, TAMASHII_LINKS_DIR)))) {
      this.log(`Skipped tamashii sync as ${cwd} is not initialized.`);
      return;
    }

    const packages = args.package
      ? [args.package]
      : await fs.readdir(path.join(cwd, TAMASHII_LINKS_DIR));

    await Sync.syncAll(this, packages, {
      cwd,
      force: flags.force,
      npm: flags.npm,
      verbose: flags.verbose,
    });
  }
}
