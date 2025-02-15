"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generateStyles;
exports.cssKey = cssKey;
exports.ensureArray = ensureArray;
const constants_1 = require("../constants");
function generateStyles(obj) {
    const output = {
        SCSS_VARIABLES: [],
        SCSS_UTILITIES: [`@use "${constants_1.OUTPUT_FILES.SCSS_VARIABLES}" as *;`],
    };
    // Store breakpoint utilities to group them later
    const breakpointUtilities = {};
    function generateStylesInner(obj, path = [], settings = {}) {
        const currentSettings = { ...obj[constants_1.SETTINGS_KEY], ...settings };
        const currentMapEntries = [];
        for (const [key, v] of Object.entries(obj)) {
            if (key === constants_1.SETTINGS_KEY || typeof v === "undefined")
                continue;
            const designToken = v;
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
                        output[key].push(value);
                    },
                    addToBreakpointUtilities: (breakpoint, value) => {
                        breakpointUtilities[breakpoint] = breakpointUtilities[breakpoint] || [];
                        breakpointUtilities[breakpoint].push(value);
                    },
                });
                // Add entry to current map
                const tokenName = currentObjectPath[currentObjectPath.length - 1];
                currentMapEntries.push(`  "${tokenName}": ${designToken}`);
                continue;
            }
            generateStylesInner(designToken, currentObjectPath, { ...currentSettings, ...designToken?.[constants_1.SETTINGS_KEY] });
            output.SCSS_VARIABLES.push("");
            output.SCSS_UTILITIES.push("");
        }
        // Generate map for current level if there are entries
        if (currentMapEntries.length > 0) {
            const mapName = cssKey("$", [...path, "values", "map"]);
            output.SCSS_VARIABLES.push(`${mapName}: (\n${currentMapEntries.join(",\n")}\n);`);
        }
    }
    generateStylesInner(obj);
    // Add grouped breakpoint utilities to the output
    Object.entries(breakpointUtilities).forEach(([breakpoint, utilities]) => {
        output.SCSS_UTILITIES.push(`@media (min-width: ${breakpoint}) {\n  ${utilities.join("\n  ")}\n}`);
    });
    return output;
}
function generateToken({ tokenValue, tokenPath, settings, addToOutput, addToBreakpointUtilities, }) {
    const variableName = cssKey("$", tokenPath);
    addToOutput("SCSS_VARIABLES", `${variableName}: ${tokenValue};`);
    if (!settings)
        return;
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
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [constants_1.SETTINGS_KEY]: _omittedSettingsKey_, ...breakpoints } = settings.utilityBreakpoints;
                Object.entries(breakpoints).forEach(([breakpoint, minWidth]) => {
                    const breakpointClassName = cssKey(".", [
                        breakpoint + constants_1.SCSS_UTILITY_BREAKPOINT_SEPARATOR + util.className,
                        tokenValueName,
                    ]);
                    addToBreakpointUtilities(String(minWidth), `${breakpointClassName} {  ${declaration}  }`);
                });
            }
        });
    }
}
// just some functions for readability
function cssKey(prefix, path) {
    return prefix + path.join(constants_1.SCSS_VARIABLE_SEPARATOR);
}
function ensureArray(value) {
    return Array.isArray(value) ? value : [value];
}
