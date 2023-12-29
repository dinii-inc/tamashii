import { expect, test } from "@oclif/test";
import * as path from "node:path";

import { isDirectory } from "../../../src/utils/fs";
import { withWorkingDirectory } from "../../test-utils";

describe("init", () => {
  withWorkingDirectory(test, "init", (test, cwd) =>
    test
      .stdout()
      .command(["init", `--cwd=${cwd}`])
      .it("creates necessary directories and files", async (ctx) => {
        expect(ctx.stdout).to.contain(".tamashii has been created");

        expect(await isDirectory(path.join(cwd, ".tamashii"))).to.haveOwnProperty("data");
      }),
  );
});
