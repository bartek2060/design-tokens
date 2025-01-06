import type { DesignToken, FileBuild } from "../types";
export default function generateStyles(obj: DesignToken): FileBuild;
export declare function cssKey(prefix: string, path: string[]): string;
export declare function ensureArray<T>(value: T | T[]): T[];
