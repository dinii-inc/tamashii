import { Args, Command, Flags } from "@oclif/core";
import fs from "node:fs/promises";
import path from "node:path";

import {
  SCRIPTS_POST_SYNC,
  SCRIPTS_PRE_SYNC,
  TAMASHII_DIR,
  TAMASHII_LINKS_DIR,
} from "../../utils/constants.js";
import { execAsync } from "../../utils/cp.js";
import { ensureDirectory, getPackageJson, isSymbolicLink, syncFiles } from "../../utils/fs.js";

export default class Sync extends Command {
  static args = {
    package: Args.string({ description: "Target package name to sync" }),
  };

  static description = "Sync local package from source";

  static examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`,
  ];

  static flags = {
    npm: Flags.boolean({ description: "Use npm instead of yarn" }),
    verbose: Flags.boolean({ description: "Print verbose output" }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Sync);

    const packages = args.package ? [args.package] : await fs.readdir(TAMASHII_LINKS_DIR);

    await Promise.all(
      packages.map(async (pkg) => {
        await sync(this, pkg, {
          npm: flags.npm,
          verbose: flags.verbose,
        });
      }),
    );
  }
}

// eslint-disable-next-line valid-jsdoc
/**
 * tamashii/.links 配下に存在する symbolic link を元に tamashii/* にローカルパッケージをコピーする。
 * ローカルパッケージ側の node_modules はあえてコピーしていない。これはコピーにコストがかかるだけではなく、最終的に
 * node_modules/{ローカルパッケージ名}/node_modules としてコピーが作成され、モジュールの解決上意図しないコンフリクト
 * が発生する可能性があるためである。
 *
 * local_packages 直下には以下の内容の .gitignore を配置する必要がある。
 * ```gitignore
 * /*
 * !/.links
 * ```
 * このスクリプトは対象のパッケージのコピーをプロジェクト内に作成するが、それらは Git のツリーに含まれてほしくないため基本的には
 * すべて ignore する必要がある(1行目)。しかし、 .links 配下の symbolic link はいわば利用するローカルパッケージの宣言のようなもの
 * になるため、それらは Git のツリーに含める(2行目)。
 */
export const sync = async (
  self: Command,
  packageName: string,
  options: {
    npm: boolean | undefined;
    verbose?: boolean | undefined;
  },
) => {
  const src = path.join(TAMASHII_DIR, ".links", packageName);
  const temp = path.join(TAMASHII_DIR, ".temp", packageName);
  const pkg = path.join(TAMASHII_DIR, packageName);

  // NOTE: This step will be skipped in an environment where the target of the 'src' symlink does not exist,
  // such as Cloud Build. However, dependencies will be resolved properly, as necessary files are updated
  // along with other source files, if you run this command before uploading files.
  const isSymbolicLinkRes = isSymbolicLink(src);
  if ("error" in isSymbolicLinkRes) {
    self.warn(`Skipped "${packageName}" as it is not a valid symlink`);
    return;
  }

  await ensureDirectory(temp);
  await syncFiles({ dist: temp, src });

  const yarn = options.npm ? "npm run" : "yarn";

  const packageJson = await getPackageJson(temp);
  const hasPreRefresh = Boolean(packageJson?.scripts?.[SCRIPTS_PRE_SYNC]);
  if (hasPreRefresh) {
    await execAsync(`${yarn} --production=false`, { cwd: temp }, options.verbose);
    await execAsync(`${yarn} ${SCRIPTS_PRE_SYNC}`, { cwd: temp }, options.verbose);
  }

  await ensureDirectory(pkg);
  await syncFiles({
    dist: pkg,
    src: hasPreRefresh ? path.join(temp, packageJson?.tamashii?.dist ?? "dist") : temp,
  });

  if (packageJson?.scripts?.[SCRIPTS_POST_SYNC]) {
    await execAsync(`${yarn} ${SCRIPTS_POST_SYNC}`, { cwd: pkg }, options.verbose);
  }

  self.log(`Synced "${packageName}" successfully`);
};
