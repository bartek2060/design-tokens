"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generateTypes;
const constants_1 = require("../constants");
function generateTypes(obj) {
    const output = {
        TYPES: [],
    };
    // Helper function to convert token path to type name
    function pathToTypeName(path) {
        return capitalizeStringArray(path).join("").split("-").join("");
    }
    // Helper function to generate types recursively
    function generateTypesInner(obj, path = []) {
        const entries = Object.entries(obj);
        const typeProperties = [];
        const subTypes = [];
        for (const [key, value] of entries) {
            if (key === constants_1.SETTINGS_KEY)
                continue;
            if (typeof value === "string") {
                typeProperties.push(`  "${key}": "${value}";`);
            }
            else {
                const subPath = [...path, key];
                const subTypeName = pathToTypeName(subPath);
                subTypes.push(...generateTypesInner(value, subPath));
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
    output.TYPES.push(...types);
    return output;
}
function capitalizeStringArray(str) {
    return str.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
}
