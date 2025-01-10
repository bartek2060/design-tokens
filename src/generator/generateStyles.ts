import type { DesignToken, FileBuild, TokenSettings } from "../types";
import { SCSS_UTILITY_BREAKPOINT_SEPARATOR, SCSS_VARIABLE_SEPARATOR, SETTINGS_KEY } from "../constants";

export default function generateStyles(obj: DesignToken) {
  const output: FileBuild = {
    SCSS_VARIABLES: [],
    SCSS_UTILITIES: [],
  };
  // Store breakpoint utilities to group them later
  const breakpointUtilities: Record<string, string[]> = {};

  function generateStylesInner(obj: DesignToken, path: string[] = [], settings: TokenSettings = {}) {
    const currentSettings = { ...obj[SETTINGS_KEY], ...settings };

    for (const [key, v] of Object.entries(obj)) {
      if (key === SETTINGS_KEY || typeof v === "undefined") continue;

      const designToken = v as DesignToken;
      const currentObjectPath = [...path, key];

      if (typeof currentSettings.utilityBreakpoints === "string") {
        if (obj[currentSettings.utilityBreakpoints]) {
          currentSettings.utilityBreakpoints = obj[currentSettings.utilityBreakpoints];
        }
      }

      if (typeof designToken === "string") {
        generateToken({
          tokenValue: designToken,
          tokenPath: currentObjectPath,
          settings: currentSettings,
          addToOutput: (key, value) => {
            output[key]!.push(value);
          },
          addToBreakpointUtilities: (breakpoint, value) => {
            breakpointUtilities[breakpoint] = breakpointUtilities[breakpoint] || [];
            breakpointUtilities[breakpoint].push(value);
          },
        });

        continue;
      }

      generateStylesInner(designToken, currentObjectPath, { ...currentSettings, ...designToken?.[SETTINGS_KEY] });
      output.SCSS_VARIABLES!.push("");
      output.SCSS_UTILITIES!.push("");
    }
  }

  generateStylesInner(obj);

  // Add grouped breakpoint utilities to the output
  Object.entries(breakpointUtilities).forEach(([breakpoint, utilities]) => {
    output.SCSS_UTILITIES!.push(`@media (min-width: ${breakpoint}) {\n  ${utilities.join("\n  ")}\n}`);
  });

  return output;
}

function generateToken({
  tokenValue,
  tokenPath,
  settings,
  addToOutput,
  addToBreakpointUtilities,
}: {
  tokenValue: string;
  tokenPath: string[];
  settings?: TokenSettings;
  addToOutput: (key: keyof FileBuild, value: string) => void;
  addToBreakpointUtilities: (breakpoint: string, value: string) => void;
}) {
  const variableName = cssKey("$", tokenPath);
  addToOutput("SCSS_VARIABLES", `${variableName}: ${tokenValue};`);

  if (!settings) return;
  const { generateUtility } = settings;

  if (generateUtility) {
    const utilities = ensureArray(generateUtility);

    utilities.forEach((util) => {
      const tokenValueName = tokenPath[tokenPath.length - 1];
      const properties = ensureArray(util.property);
      const declaration = properties.map((prop) => `${prop}: ${tokenValue} !important;`).join(" ");

      // Add the default utility class
      const className = cssKey(".", [util.className, tokenValueName]);
      addToOutput("SCSS_UTILITIES", `${className} {  ${declaration}  }`);

      // Generate breakpoint-specific utilities if breakpoints are defined
      if (settings.utilityBreakpoints && typeof settings.utilityBreakpoints !== "string") {
        const breakpoints = settings.utilityBreakpoints;
        Object.entries(breakpoints).forEach(([breakpoint, minWidth]) => {
          const breakpointClassName = cssKey(".", [
            breakpoint + SCSS_UTILITY_BREAKPOINT_SEPARATOR + util.className,
            tokenValueName,
          ]);
          addToBreakpointUtilities(String(minWidth), `${breakpointClassName} {  ${declaration}  }`);
        });
      }
    });
  }
}

// just some functions for readability
export function cssKey(prefix: string, path: string[]): string {
  return prefix + path.join(SCSS_VARIABLE_SEPARATOR);
}

export function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}
