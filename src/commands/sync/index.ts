import { Args, Command, Flags } from "@oclif/core";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import {
  SCRIPTS_POST_SYNC,
  SCRIPTS_PRE_SYNC,
  TAMASHII_DIR,
  TAMASHII_LINKS_DIR,
  TAMASHII_POOLS_DIR,
} from "../../utils/constants.js";
import { execAsync } from "../../utils/cp.js";
import { ensureDirectory, isSymbolicLink } from "../../utils/fs.js";
import { getPackageJson } from "../../utils/package-json.js";
import { syncFiles } from "../../utils/sync-files.js";

export default class Sync extends Command {
  static args = {
    package: Args.string({ description: "Target package name to sync" }),
  };

  static description = "Sync local package from source";

  static examples = [`TODO`];

  static flags = {
    cwd: Flags.string({ description: "Current working directory of the child process" }),
    npm: Flags.boolean({ description: "Use npm instead of yarn" }),
    verbose: Flags.boolean({ description: "Print verbose output" }),
  };

  static syncSingle = async (
    self: Command,
    packageName: string,
    options: {
      cwd: string;
      npm: boolean | undefined;
      verbose: boolean | undefined;
    },
  ) => {
    // eslint-disable-next-line prefer-destructuring
    const cwd = options.cwd;
    const link = path.join(cwd, TAMASHII_LINKS_DIR, packageName);
    const pool = path.join(cwd, TAMASHII_POOLS_DIR, packageName);
    const pkg = path.join(cwd, TAMASHII_DIR, packageName);

    // NOTE: This step will be skipped in an environment where the target of the 'src' symlink does not exist,
    // such as Cloud Build. However, dependencies will be resolved properly, as necessary files are updated
    // along with other source files, if you run this command before uploading files.
    const isSymbolicLinkRes = isSymbolicLink(link);
    if ("error" in isSymbolicLinkRes) {
      self.warn(`Skipped "${packageName}" as "${link}" is not a valid symlink`);
      return;
    }

    await ensureDirectory(pool);
    await syncFiles({ dist: pool, src: link });

    const yarn = options.npm ? "npm run" : "yarn";

    const packageJson = await getPackageJson(pool);
    const hasPreRefresh = Boolean(packageJson?.scripts?.[SCRIPTS_PRE_SYNC]);
    if (hasPreRefresh) {
      await execAsync(`${yarn} --production=false`, { cwd: pool }, options.verbose);
      await execAsync(`${yarn} ${SCRIPTS_PRE_SYNC}`, { cwd: pool }, options.verbose);
    }

    await ensureDirectory(pkg);
    await syncFiles({
      dist: pkg,
      src: hasPreRefresh ? path.join(pool, packageJson?.tamashii?.dist ?? "dist") : pool,
    });

    if (packageJson?.scripts?.[SCRIPTS_POST_SYNC]) {
      await execAsync(`${yarn} ${SCRIPTS_POST_SYNC}`, { cwd: pkg }, options.verbose);
    }
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Sync);
    const cwd = flags.cwd ?? process.cwd();

    const packages = args.package ? [args.package] : await fs.readdir(TAMASHII_LINKS_DIR);

    await Promise.all(
      packages.map(async (packageName) => {
        await Sync.syncSingle(this, packageName, {
          cwd,
          npm: flags.npm,
          verbose: flags.verbose,
        });
        this.log(`Synced "${packageName}" successfully`);
      }),
    );
  }
}
