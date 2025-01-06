"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generateStyles;
exports.cssKey = cssKey;
exports.ensureArray = ensureArray;
const constants_1 = require("../constants");
function generateStyles(obj) {
    const output = {
        SCSS_VARIABLES: [],
        SCSS_UTILITIES: [],
    };
    function generateStylesInner(obj, path = [], settings = {}) {
        const currentSettings = { ...obj[constants_1.SETTINGS_KEY], ...settings };
        for (const [key, v] of Object.entries(obj)) {
            if (key === constants_1.SETTINGS_KEY || typeof v === "undefined")
                continue;
            const designToken = v;
            const currentObjectPath = [...path, key];
            if (typeof currentSettings.utilityBreakpoints === "string") {
                // if we still haven't found the exact breakpoints
                if (obj[currentSettings.utilityBreakpoints]) {
                    // then we look for them again, and set them for the next iteration
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
                });
                continue;
            }
            generateStylesInner(designToken, currentObjectPath, { ...currentSettings, ...designToken?.[constants_1.SETTINGS_KEY] });
            output.SCSS_VARIABLES.push("");
            output.SCSS_UTILITIES.push("");
        }
    }
    generateStylesInner(obj);
    return output;
}
function generateToken({ tokenValue, tokenPath, settings, addToOutput, }) {
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
                const breakpoints = settings.utilityBreakpoints;
                Object.entries(breakpoints).forEach(([breakpoint, minWidth]) => {
                    const breakpointClassName = cssKey(".", [
                        breakpoint + constants_1.SCSS_UTILITY_BREAKPOINT_SEPARATOR + util.className,
                        tokenValueName,
                    ]);
                    addToOutput("SCSS_UTILITIES", `@media (min-width: ${minWidth}) {\n  ${breakpointClassName} {  ${declaration}  }\n}`);
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
