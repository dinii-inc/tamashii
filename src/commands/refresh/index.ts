import { Args, Command, Flags } from "@oclif/core";
import * as path from "node:path";

import { getPackageJson } from "../../utils/package-json.js";
import { syncFiles } from "../../utils/sync-files.js";

export default class Refresh extends Command {
  static args = {
    package: Args.string({ description: "Package name" }),
  };

  static description = `\
Refreshes package in node_modules

At times, yarn may not update the content under "node_modules" even if changes are made to locally installed packages using "file:[path to package]" instead of a specific version number.
In such cases, it may be necessary to delete the entire contents of "node_modules" and then re-run "yarn install".
This command resolves the issue by copying files directly from the source to "node_modules".

Consider placing this command in the "prepare" section of npm scripts to ensure that the content under "node_modules" is always kept up to date.
`;

  static examples = [
    "tamashii refresh # all packages will be refreshed",
    "tamashii refresh your-internal-package",
  ];

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
