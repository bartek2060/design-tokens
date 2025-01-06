"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generate;
const fs_1 = require("fs");
const path_1 = require("path");
const constants_1 = require("../constants");
const generateStyles_1 = __importDefault(require("./generateStyles"));
const generateTypes_1 = __importDefault(require("./generateTypes"));
const generateDocs_1 = require("./generateDocs");
function generate(tokens, outputDir) {
    const output = {
        ...(0, generateStyles_1.default)(tokens),
        ...(0, generateTypes_1.default)(tokens),
        ...(0, generateDocs_1.generateDocs)(tokens),
    };
    (0, fs_1.mkdirSync)(outputDir, { recursive: true });
    // Generate standard files (SCSS and TypeScript)
    for (const [key, value] of Object.entries(output)) {
        (0, fs_1.writeFileSync)((0, path_1.join)(outputDir, constants_1.OUTPUT_FILES[key]), value.join("\n"));
    }
}
