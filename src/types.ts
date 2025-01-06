import { SETTINGS_KEY, OUTPUT_FILES } from "./constants";

export interface UtilitySettings {
  className: string;
  property: string | string[];
}

export interface TokenSettings {
  generateUtility?: UtilitySettings | UtilitySettings[];
  utilityBreakpoints?: string | DesignToken;
}

export type DesignToken = { [SETTINGS_KEY]?: TokenSettings } & {
  [valueName: string]: string | DesignToken;
};

export type FileBuild = {
  [K in keyof typeof OUTPUT_FILES]?: string[];
};
