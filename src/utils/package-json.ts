import * as fs from "node:fs/promises";
import * as path from "node:path";

export const getPackageJson = async (dir: string) => {
  try {
    return JSON.parse(await fs.readFile(path.join(dir, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      name?: string;
      scripts?: Record<string, string>;
      tamashii?: {
        dist?: string;
      };
    };
  } catch {
    return null;
  }
};
