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
  TAMASHII_LINKS_DIR,
  TAMASHII_POOLS_DIR,
} from "../../utils/constants.js";
import { execAsync } from "../../utils/cp.js";
import { ensureDirectory, isDirectory, isFile, isSymbolicLink } from "../../utils/fs.js";
import { getPackageJson } from "../../utils/package-json.js";
import { toAbsolute } from "../../utils/path.js";
import { syncFiles } from "../../utils/sync-files.js";

type Options = {
  cwd: string;
  npm: boolean | undefined;
  verbose: boolean | undefined;
};

const processedLinkPromises = new Map<string, Promise<void>>();

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
    npm: Flags.boolean({ description: "Use npm instead of yarn" }),
    verbose: Flags.boolean({ description: "Print verbose output" }),
  };

  static syncAll = async (self: Command, packages: string[], options: Options) => {
    await Promise.all(
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
          })();

          processedLinkPromises.set(key, promise);

          await promise;
        }),
    );
  };

  static syncSingle = async (self: Command, packageName: string, options: Options) => {
    const cwd = toAbsolute(options.cwd);
    const link = path.join(cwd, TAMASHII_LINKS_DIR, packageName);
    const pool = path.join(cwd, TAMASHII_POOLS_DIR, packageName);
    const pkg = path.join(cwd, TAMASHII_DIR, packageName);

    const yarn = options.npm ? "npm run" : "yarn";

    if (cwd.includes(TAMASHII_DIR) || cwd.includes("node_modules")) {
      return "ignored";
    }

    // NOTE: This step will be skipped in an environment where the target of the "src" symlink does not exist,
    // such as Cloud Build. However, dependencies will be resolved properly, as necessary files are updated
    // along with other source files, if you run this command before uploading files.
    const isSymbolicLinkRes = isSymbolicLink(link);
    if ("error" in isSymbolicLinkRes) {
      return "invalid-symlink";
    }

    const source = path.resolve(path.dirname(link), await fs.readlink(link));
    if ("data" in (await isDirectory(path.join(source, TAMASHII_LINKS_DIR)))) {
      await this.syncAll(self, await fs.readdir(path.join(source, TAMASHII_LINKS_DIR)), {
        ...options,
        cwd: source,
      });
    }

    await ensureDirectory(pool);
    await ensureDirectory(pkg);

    const packageJson = await getPackageJson(pool);
    const hasPreRefresh = Boolean(packageJson?.scripts?.[SCRIPTS_PRE_SYNC]);
    const dirToPackage = hasPreRefresh ? packageJson?.tamashii?.dist ?? "dist" : null;

    const hashFile = path.join(pkg, TAMASHII_HASH_FILE);
    const previousHash =
      "data" in (await isFile(hashFile)) ? await fs.readFile(hashFile, "utf8") : null;

    const { hash: currentHash } = await hashElement(source, {
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

    if (previousHash === currentHash) {
      return "skipped";
    }

    await syncFiles({ dist: pool, src: link });

    if ("data" in (await isFile(path.join(pool, TAMASHII_ARCHIVE_FILE)))) {
      await tar.extract({
        cwd: pool,
        file: path.join(pool, TAMASHII_ARCHIVE_FILE),
      });
    }

    if (hasPreRefresh) {
      await queue.add(() =>
        execAsync(`${yarn} --production=false`, { cwd: pool }, options.verbose),
      );
      await execAsync(`${yarn} ${SCRIPTS_PRE_SYNC}`, { cwd: pool }, options.verbose);
    }

    await syncFiles({
      dist: pkg,
      src: dirToPackage ? path.join(pool, dirToPackage) : pool,
    });

    if (packageJson?.scripts?.[SCRIPTS_POST_SYNC]) {
      await execAsync(`${yarn} ${SCRIPTS_POST_SYNC}`, { cwd: pkg }, options.verbose);
    }

    await fs.writeFile(hashFile, currentHash);

    return "synced";
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Sync);
    const cwd = flags.cwd ?? process.cwd();

    if ("error" in (await isDirectory(path.join(cwd, TAMASHII_LINKS_DIR)))) {
      this.log(`Skipped tamashii sync as ${cwd} is not initialized.`);
      return;
    }

    const packages = args.package
      ? [args.package]
      : await fs.readdir(path.join(cwd, TAMASHII_LINKS_DIR));

    await Sync.syncAll(this, packages, {
      cwd,
      npm: flags.npm,
      verbose: flags.verbose,
    });
  }
}
