import * as childProcess from "node:child_process";

export const execAsync = (command: string, options: childProcess.ExecOptions, verbose?: boolean) =>
  new Promise<void>((resolve, reject) => {
    childProcess.exec(command, options, (err, stdout, stderr) => {
      if (verbose) {
        console.info({ stderr, stdout });
      }

      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
