import * as fs from "node:fs/promises";
import * as path from "node:path";

export const syncFiles = async ({ dist, src }: { dist: string; src: string }) => {
  const srcFiles = await fs.readdir(src);
  const distFiles = await fs.readdir(dist);

  await Promise.all(
    distFiles
      .filter((file) => !srcFiles.includes(file) && !["node_modules"].includes(file))
      .map((file) =>
        fs.rm(path.join(dist, file), {
          force: true,
          recursive: true,
        }),
      ),
  );

  await Promise.all(
    srcFiles
      .filter((file) => ![".node-version", "node_modules"].includes(file))
      .map((file) =>
        fs.cp(path.join(src, file), path.join(dist, file), {
          dereference: true,
          force: true,
          recursive: true,
        }),
      ),
  );
};
