import type { Stats } from "node:fs";

import * as fs from "node:fs/promises";

import { Result } from "./result.js";

export const isSymbolicLink = async (
  target: string,
): Promise<Result<{ stat: Stats }, { reason: string; stat?: Stats }>> => {
  try {
    const stat = await fs.stat(target);
    return stat.isSymbolicLink()
      ? {
          data: { stat },
        }
      : {
          error: { reason: "Target is not a symbolic link", stat },
        };
  } catch (error) {
    return { error: { reason: error instanceof Error ? error.message : `${error}` } };
  }
};

export const isDirectory = async (
  target: string,
): Promise<Result<{ stat: Stats }, { reason: string; stat?: Stats }>> => {
  try {
    const stat = await fs.stat(target);
    return stat.isDirectory()
      ? {
          data: { stat },
        }
      : {
          error: { reason: "Target is not a directory", stat },
        };
  } catch (error) {
    return { error: { reason: error instanceof Error ? error.message : `${error}` } };
  }
};

export const isFile = async (
  target: string,
): Promise<Result<{ stat: Stats }, { reason: string; stat?: Stats }>> => {
  try {
    const stat = await fs.stat(target);
    return stat.isFile()
      ? {
          data: { stat },
        }
      : {
          error: { reason: "Target is not a file", stat },
        };
  } catch (error) {
    return { error: { reason: error instanceof Error ? error.message : `${error}` } };
  }
};

export const ensureDirectory = async (target: string) => {
  const isDirectoryRes = await isDirectory(target);
  if ("error" in isDirectoryRes) {
    if (isDirectoryRes.error.stat) {
      await fs.rm(target, { force: true, recursive: true });
    }

    await fs.mkdir(target);
  }
};

export const ensureFile = async (target: string, content: string, encoding: BufferEncoding) => {
  const isDirectoryRes = await isFile(target);
  if ("error" in isDirectoryRes) {
    if (isDirectoryRes.error.stat) {
      await fs.rm(target, { force: true, recursive: true });
    }

    await fs.writeFile(target, content, encoding);
  }
};
