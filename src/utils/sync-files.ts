import * as fs from "node:fs/promises";
import * as path from "node:path";

import { TAMASHII_DIR } from "./constants.js";

export const syncFiles = async ({
  dist,
  hard,
  src,
}: {
  dist: string;
  hard?: boolean;
  src: string;
}) => {
  const srcFiles = await fs.readdir(src);
  const distFiles = await fs.readdir(dist);

  await Promise.all(
    distFiles
      .filter(
        (file) =>
          (hard ? true : !srcFiles.includes(file)) &&
          ![TAMASHII_DIR, "node_modules"].includes(file),
      )
      .map((file) =>
        fs.rm(path.join(dist, file), {
          force: true,
          recursive: true,
        }),
      ),
  );

  await Promise.all(
    srcFiles
      .filter((file) => ![TAMASHII_DIR, "node_modules"].includes(file))
      .map((file) =>
        fs.cp(path.join(src, file), path.join(dist, file), {
          dereference: true,
          filter: (source) => !source.endsWith("node_modules"),
          force: true,
          recursive: true,
        }),
      ),
  );
};
