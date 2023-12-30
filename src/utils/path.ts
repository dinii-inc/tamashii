import * as path from "node:path";

export const toAbsolute = (p: string) => (path.isAbsolute(p) ? p : path.resolve(process.cwd(), p));

export const normalizePackageName = (name: string) => name.replaceAll("/", "~");
export const resolveNormalizedPackageName = (name: string) => name.replaceAll("~", "/");
