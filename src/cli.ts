#!/usr/bin/env node

import { Command } from "commander";
import { version } from "../package.json";
import { transformAstroFile } from "./commands/format";
import { readdir, stat } from "fs/promises";
import { join, extname } from "path";

const program = new Command();

program
  .name("astro-html-helper")
  .description("CLI helper for Astro HTML manipulation")
  .version(version);

program
  .command("validate")
  .description("Validate HTML structure")
  .option("-f, --file <file>", "HTML file to validate")
  .option("-d, --dir <directory>", "Directory to validate")
  .action((options) => {
    console.log("Validating HTML...", options);
  });

const mapOverDirectory = async (
  directory: string,
  fn: (filePath: string) => Promise<string> | Promise<void>
) => {
  try {
    const entries = await readdir(directory);
    
    for (const entry of entries) {
      const fullPath = join(directory, entry);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        // Recursively process subdirectories
        await mapOverDirectory(fullPath, fn);
      } else if (stats.isFile()) {
        // Process files with .astro extension
        if (extname(entry) === '.astro') {
          await fn(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${directory}: ${error}`);
  }
};

program
  .command("format")
  .description("Format HTML files")
  .option("-f, --file <file>", "HTML file to format")
  .option("-d, --dir <directory>", "Directory to format")
  .option("--netlify-form", "Enable Netlify form transformation")
  .option("--no-pictures", "Disable picture component transformation")
  .option("--no-picture-src-string", "Disable picture src string extraction")
  .action(async (options) => {
    const formatOptions = {
      netlifyForm: options.netlifyForm || false,
      pictures: options.pictures !== false,
      pictureSrcString: options.pictureSrcString !== false,
    };

    if (options.file) {
      await transformAstroFile(options.file, formatOptions);
      console.log("✅ File formatted");
    } else if (options.dir) {
      await mapOverDirectory(options.dir, (filePath) => 
        transformAstroFile(filePath, formatOptions)
      );
      console.log("✅ Directory formatted");
    } else {
      console.log("Please specify a file with -f or --file, or a directory with -d or --dir");
    }
  });

program.parse();
