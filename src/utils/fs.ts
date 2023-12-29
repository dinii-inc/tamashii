import type { Stats } from "node:fs";

import fs from "node:fs/promises";
import path from "node:path";

import { Result } from "./result.js";

export const isSymbolicLink = async (file: string): Promise<Result<Stats, { reason: string }>> => {
  const stat = await fs.stat(file).catch(() => null);
  return stat?.isSymbolicLink
    ? { data: stat }
    : { error: { reason: stat ? "no such a file" : "file is not symbolic link" } };
};

export const isDirectory = async (file: string): Promise<Result<Stats, { reason: string }>> => {
  const stat = await fs.stat(file).catch(() => null);
  return stat?.isDirectory
    ? { data: stat }
    : { error: { reason: stat ? "no such a file" : "file is not directory" } };
};

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

export const ensureDirectory = async (dir: string) => {
  const stat = await fs.stat(dir).catch(() => null);
  if (!stat?.isDirectory) {
    if (stat) {
      await fs.rm(dir, { force: true, recursive: true });
    }

    await fs.mkdir(dir);
  }
};

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
