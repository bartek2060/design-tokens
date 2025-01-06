#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs_1 = require("fs");
const path_1 = require("path");
const generator_1 = __importDefault(require("./generator"));
const constants_1 = require("./constants");
const program = new commander_1.Command();
program
    .name("design-tokens")
    .description("Process design tokens from JSON to SCSS and TypeScript")
    .requiredOption("-i, --input <path>", "Input JSON file path")
    .option("-o, --output <path>", "Output directory path", "./dist")
    .action(async (options) => {
    try {
        // Resolve paths relative to current working directory
        const inputPath = (0, path_1.join)(process.cwd(), options.input);
        const outputPath = (0, path_1.join)(process.cwd(), options.output);
        // Read and parse the input JSON file
        let jsonContent;
        try {
            jsonContent = (0, fs_1.readFileSync)(inputPath, "utf-8");
        }
        catch (error) {
            console.error(`Error reading input file: ${options.input}`);
            console.error("Make sure the file exists and you have permission to read it.");
            process.exit(1);
        }
        let tokens;
        try {
            tokens = JSON.parse(jsonContent);
        }
        catch (error) {
            console.error("Error parsing JSON file. Make sure it contains valid JSON.");
            process.exit(1);
        }
        // Process the tokens
        try {
            (0, generator_1.default)(tokens, outputPath);
            // Save the output
            console.log("✨ Design tokens processed successfully!");
            console.log(`📁 Output directory: ${outputPath}`);
            console.log(``);
            console.log("Generated files:");
            Object.values(constants_1.OUTPUT_FILES).forEach((value) => {
                console.log(`    ${value}`);
            });
        }
        catch (error) {
            console.error(`Error saving output to directory: ${outputPath}`);
            console.error("Make sure you have permission to write to this directory.");
            process.exit(1);
        }
    }
    catch (error) {
        console.error("An unexpected error occurred:", error);
        process.exit(1);
    }
});
program.parse();
