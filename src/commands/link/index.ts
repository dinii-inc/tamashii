import { Args, Command, Flags } from "@oclif/core";
import fs from "node:fs/promises";
import path from "node:path";

import { TAMASHII_DIR, TAMASHII_LINKS_DIR } from "../../utils/constants.js";
import { execAsync } from "../../utils/cp.js";
import { getPackageJson, isDirectory } from "../../utils/fs.js";
import { sync } from "../sync/index.js";

export default class Link extends Command {
  static args = {
    source: Args.string({ description: "Package path", required: true }),
  };

  static description = "Link package";

  static examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`,
  ];

  static flags = {
    installFlags: Flags.string({ description: `Flags to pass "yarn add" or "npm install"` }),
    npm: Flags.boolean({ description: "Use npm instead of yarn" }),
    verbose: Flags.boolean({ description: "Print verbose output" }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Link);

    const src = path.resolve(process.cwd(), args.source);
    const isDirectoryRes = await isDirectory(src);
    if ("error" in isDirectoryRes) {
      this.error("source is not a valid directory");
    }

    const packageJson = await getPackageJson(src);
    if (!packageJson?.name) {
      this.error("source does not have a valid package.json");
    }

    const link = path.join(TAMASHII_LINKS_DIR, packageJson.name);

    await fs.symlink(path.relative(path.dirname(link), src), link);

    await sync(this, packageJson.name, {
      npm: flags.npm,
      verbose: flags.verbose,
    });

    const yarn = flags.npm ? "npm install" : "yarn add";
    await execAsync(
      `${yarn} ${flags.installFlags ?? ""} file:${path.join(TAMASHII_DIR, packageJson.name)}`,
      {},
      flags.verbose,
    );

    this.log(`Linked "${packageJson.name}" successfully`);
  }
}
