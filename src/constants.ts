export const SETTINGS_KEY = "__settings" as const;

export const SCSS_VARIABLE_SEPARATOR = "-" as const;
export const SCSS_UTILITY_BREAKPOINT_SEPARATOR = "\\:" as const;

export const OUTPUT_FILES = {
  SCSS_VARIABLES: "_variables.scss",
  SCSS_UTILITIES: "_utilities.scss",
  TYPES: "types.ts",
  DOCUMENTATION: "documentation.html",
} as const;
