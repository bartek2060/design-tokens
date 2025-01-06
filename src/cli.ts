#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync } from "fs";
import { join } from "path";
import generate from "./generator";
import { OUTPUT_FILES } from "./constants";

const program = new Command();

program
  .name("design-tokens")
  .description("Process design tokens from JSON to SCSS and TypeScript")
  .requiredOption("-i, --input <path>", "Input JSON file path")
  .option("-o, --output <path>", "Output directory path", "./dist")
  .action(async (options) => {
    try {
      // Resolve paths relative to current working directory
      const inputPath = join(process.cwd(), options.input);
      const outputPath = join(process.cwd(), options.output);

      // Read and parse the input JSON file
      let jsonContent: string;
      try {
        jsonContent = readFileSync(inputPath, "utf-8");
      } catch (error) {
        console.error(`Error reading input file: ${options.input}`);
        console.error("Make sure the file exists and you have permission to read it.");
        process.exit(1);
      }

      let tokens: any;
      try {
        tokens = JSON.parse(jsonContent);
      } catch (error) {
        console.error("Error parsing JSON file. Make sure it contains valid JSON.");
        process.exit(1);
      }

      // Process the tokens
      try {
        generate(tokens, outputPath);

        // Save the output
        console.log("✨ Design tokens processed successfully!");
        console.log(`📁 Output directory: ${outputPath}`);
        console.log(``);
        console.log("Generated files:");
        Object.values(OUTPUT_FILES).forEach((value) => {
          console.log(`    ${value}`);
        });
      } catch (error) {
        console.error(`Error saving output to directory: ${outputPath}`);
        console.error("Make sure you have permission to write to this directory.");
        process.exit(1);
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      process.exit(1);
    }
  });

program.parse();
