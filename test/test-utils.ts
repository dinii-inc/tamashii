import type { test as TestType } from "@oclif/test";

import { mkdir, rm } from "node:fs/promises";
import * as path from "node:path";

type Test = typeof TestType;

const SANDBOX_DIR = "test/sandbox";
const rand = Math.random().toString().split(".")[1];

let id = 0;

const withCwd = (test: Test, cwd: string) =>
  test
    .add("cwd", async () => {
      await mkdir(cwd);
      return cwd;
    })
    .finally(async () => {
      await rm(cwd, { force: true, recursive: true });
    });

export const withWorkingDirectory = <T>(
  test: Test,
  label: string,
  callback: (test: ReturnType<typeof withCwd>, cwd: string) => T,
) => {
  const cwd = path.join(SANDBOX_DIR, `${label}-${rand}-${(id++).toString().padStart(4, "0")}`);
  return callback(withCwd(test, cwd), cwd);
};
