import { Command, Flags } from "@oclif/core";
import * as path from "node:path";

import {
  TAMASHII_DIR,
  TAMASHII_GITIGNORE,
  TAMASHII_LINKS_DIR,
  TAMASHII_POOLS_DIR,
} from "../../utils/constants.js";
import { ensureDirectory, ensureFile } from "../../utils/fs.js";

export default class Init extends Command {
  static args = {};

  static description = "Initialize tamashii directories";

  static examples = ["tamashii init"];

  static flags = {
    cwd: Flags.string({ description: "Current working directory of the child process" }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Init);
    const cwd = flags.cwd ?? process.cwd();

    await ensureDirectory(path.join(cwd, TAMASHII_DIR));
    await ensureDirectory(path.join(cwd, TAMASHII_LINKS_DIR));
    await ensureDirectory(path.join(cwd, TAMASHII_POOLS_DIR));

    await ensureFile(path.join(cwd, TAMASHII_DIR, ".gitignore"), TAMASHII_GITIGNORE, "utf8");
    await ensureFile(path.join(cwd, TAMASHII_LINKS_DIR, ".gitkeep"), "", "utf8");
    await ensureFile(path.join(cwd, TAMASHII_POOLS_DIR, ".gitkeep"), "", "utf8");

    this.log(".tamashii has been created");
  }
}
