import * as path from "node:path";

export const toAbsolute = (p: string) => (path.isAbsolute(p) ? p : path.resolve(process.cwd(), p));
