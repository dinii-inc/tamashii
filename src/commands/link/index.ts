import { Args, Command, Flags } from "@oclif/core";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { TAMASHII_DIR, TAMASHII_LINKS_DIR } from "../../utils/constants.js";
import { execAsync } from "../../utils/cp.js";
import { isDirectory } from "../../utils/fs.js";
import { getPackageJson } from "../../utils/package-json.js";
import { normalizePackageName } from "../../utils/path.js";
import Sync from "../sync/index.js";

export default class Link extends Command {
  static args = {
    source: Args.string({ description: "Package path", required: true }),
  };

  static description = "Links package";

  static examples = ["tamashii link ../path/to/your/internal/package"];

  static flags = {
    cwd: Flags.string({ description: "Current working directory of the child process" }),
    installFlags: Flags.string({ description: `Flags to pass "yarn add" or "npm install"` }),
    npm: Flags.boolean({ description: "Use npm instead of yarn" }),
    verbose: Flags.boolean({ description: "Print verbose output" }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Link);
    const cwd = flags.cwd ?? process.cwd();
    const src = path.resolve(cwd, args.source);

    const yarnAdd = flags.npm ? "npm install" : "yarn add";

    const isDirectoryRes = await isDirectory(src);
    if ("error" in isDirectoryRes) {
      this.error("source is not a valid directory");
    }

    const packageJson = await getPackageJson(src);
    if (!packageJson?.name) {
      this.error("source does not have a valid package.json");
    }

    const packageName = normalizePackageName(packageJson.name);
    const link = path.join(cwd, TAMASHII_LINKS_DIR, packageName);

    await fs.rm(link, { force: true });
    await fs.symlink(path.relative(path.dirname(link), src), link);

    await Sync.syncSingle(this, packageName, {
      cwd,
      npm: flags.npm,
      verbose: flags.verbose,
    });

    await execAsync(
      `${yarnAdd} ${flags.installFlags ?? ""} file:${path.join(TAMASHII_DIR, packageName)}`,
      { cwd },
      flags.verbose,
    );

    this.log(`Linked "${packageJson.name}" successfully`);
  }
}
