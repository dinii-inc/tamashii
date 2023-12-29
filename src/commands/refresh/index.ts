import { Args, Command, Flags } from "@oclif/core";
import * as path from "node:path";

import { getPackageJson } from "../../utils/package-json.js";
import { syncFiles } from "../../utils/sync-files.js";

export default class Refresh extends Command {
  static args = {
    package: Args.string({ description: "Package name" }),
  };

  static description = "Refresh package in node_modules";

  static examples = [`TODO`];

  static flags = {
    cwd: Flags.string({ description: "Current working directory of the child process" }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Refresh);
    const cwd = flags.cwd ?? process.cwd();

    const packageJson = await getPackageJson(cwd);

    const targets = [
      ...Object.entries(packageJson?.dependencies ?? {}),
      ...Object.entries(
        process.env.NODE_ENV === "production" ? {} : packageJson?.devDependencies ?? {},
      ),
    ]
      .map(([packageName, version]) => ({ packageName, version }))
      .filter(
        ({ packageName, version }) =>
          version.startsWith("file:") && (args.package ? packageName === args.package : true),
      );

    targets.map(async ({ packageName, version }) => {
      const src = version.replace("file:", "");
      const dist = path.join(cwd, "node_modules", packageName);

      await syncFiles({ dist, src });

      this.log(`Refreshed "${packageName}" successfully`);
    });
  }
}
