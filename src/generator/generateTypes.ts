/* eslint-disable @typescript-eslint/no-unused-vars */
import type { DesignToken, FileBuild } from "../types";
import { SETTINGS_KEY } from "../constants";

export default function generateTypes(obj: DesignToken) {
  const output: FileBuild = {
    TYPES: [],
  };

  // Helper function to convert token path to type name
  function pathToTypeName(path: string[]): string {
    return path.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
  }

  // Helper function to generate types recursively
  function generateTypesInner(obj: DesignToken, path: string[] = []) {
    const entries = Object.entries(obj);
    const typeProperties: string[] = [];
    const subTypes: string[] = [];

    for (const [key, value] of entries) {
      if (key === SETTINGS_KEY) continue;

      if (typeof value === "string") {
        typeProperties.push(`  "${key}": "${value}";`);
      } else {
        const subPath = [...path, key];
        const subTypeName = pathToTypeName(subPath);
        subTypes.push(...generateTypesInner(value as DesignToken, subPath));
        typeProperties.push(`  "${key}": ${subTypeName};`);
      }
    }

    if (typeProperties.length > 0) {
      const typeName = path.length === 0 ? "DesignTokens" : pathToTypeName(path);
      const typeDefinition = [`export interface ${typeName} {`, ...typeProperties, "}", ""];
      return [...subTypes, ...typeDefinition];
    }

    return subTypes;
  }

  const types = generateTypesInner(obj);
  output.TYPES!.push(...types);

  return output;
}
