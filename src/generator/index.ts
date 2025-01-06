import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import { OUTPUT_FILES } from "../constants";
import { DesignToken, FileBuild } from "../types";

import styles from "./generateStyles";
import types from "./generateTypes";
import { generateDocs } from "./generateDocs";

export default function generate(tokens: DesignToken, outputDir: string): void {
  const output: FileBuild = {
    ...styles(tokens),
    ...types(tokens),
    ...generateDocs(tokens),
  };

  mkdirSync(outputDir, { recursive: true });

  // Generate standard files (SCSS and TypeScript)
  for (const [key, value] of Object.entries(output)) {
    writeFileSync(join(outputDir, OUTPUT_FILES[key as keyof FileBuild]), value.join("\n"));
  }
}
