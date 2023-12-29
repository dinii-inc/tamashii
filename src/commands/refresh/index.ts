import { Args, Command } from "@oclif/core";
import path from "node:path";

import { getPackageJson, syncFiles } from "../../utils/fs.js";

export default class Refresh extends Command {
  static args = {
    package: Args.string({ description: "Package name" }),
  };

  static description = "Refresh package in node_modules";

  static examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`,
  ];

  static flags = {};

  async run(): Promise<void> {
    const { args } = await this.parse(Refresh);

    const packageJson = await getPackageJson("./");

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
      const dist = path.join("./node_modules", packageName);

      await syncFiles({ dist, src });

      this.log(`Refreshed "${packageName}" successfully`);
    });
  }
}
