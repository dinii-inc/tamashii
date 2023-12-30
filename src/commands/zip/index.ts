import { Args, Command } from "@oclif/core";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as tar from "tar";

import { TAMASHII_ARCHIVE_FILE } from "../../utils/constants.js";
import { isDirectory } from "../../utils/fs.js";
import { getPackageJson } from "../../utils/package-json.js";

export default class Zip extends Command {
  static args = {
    source: Args.string({ description: "Package path", required: true }),
  };

  static description = "Zips package";

  static examples = ["tamashii zip ../path/to/your/internal/package"];

  static flags = {};

  async run(): Promise<void> {
    const { args } = await this.parse(Zip);

    const src = args.source;

    const isDirectoryRes = await isDirectory(src);
    if ("error" in isDirectoryRes) {
      this.error("source is not a valid directory");
    }

    const packageJson = await getPackageJson(src);
    if (!packageJson?.name) {
      this.error("source does not have a valid package.json");
    }

    const files = await fs.readdir(src);
    const targets = files.filter((name) => ![".git", TAMASHII_ARCHIVE_FILE].includes(name));
    await tar.create(
      {
        cwd: src,
        file: path.join(src, TAMASHII_ARCHIVE_FILE),
        gzip: true,
      },
      targets,
    );

    this.log(`Zipped "${packageJson.name}" successfully`);
  }
}
