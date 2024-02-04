import * as path from "node:path";
import PQueue from "p-queue";

import {
  TAMASHII_DIR,
  TAMASHII_GITIGNORE,
  TAMASHII_INTERMEDIATE_DIR,
  TAMASHII_LINKS_DIR,
  TAMASHII_PACKAGES_DIR,
} from "./constants.js";
import { ensureDirectory, ensureFile } from "./fs.js";

const queue = new PQueue({ concurrency: 1 });

export const prepareTamashii = async (options: { cwd: string }) => {
  const { cwd } = options;

  await queue.add(async () => {
    await ensureDirectory(path.join(cwd, TAMASHII_DIR));
    await Promise.all([
      ensureDirectory(path.join(cwd, TAMASHII_LINKS_DIR)),
      ensureDirectory(path.join(cwd, TAMASHII_INTERMEDIATE_DIR)),
      ensureDirectory(path.join(cwd, TAMASHII_PACKAGES_DIR)),
      ensureFile(path.join(cwd, TAMASHII_DIR, ".gitignore"), TAMASHII_GITIGNORE, "utf8"),
    ]);
  });
};
