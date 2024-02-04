import { Command } from "@oclif/core";

export default class Vscode extends Command {
  static args = {};

  static description =
    "Shows instruction to make your development experience with tamashii and VSCode more comfortable";

  static flags = {};

  async run(): Promise<void> {
    this.log(
      "By adding these settings to your VSCode User Settings, VSCode will treat the .tamashii folder just like it does with node_modules.\n",
    );

    this.logJson({
      "explorer.autoRevealExclude": {
        "**/.tamashii": true,
      },
      "search.exclude": {
        "**/.tamashii": true,
      },
    });
  }
}
