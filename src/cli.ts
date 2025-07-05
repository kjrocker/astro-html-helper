#!/usr/bin/env node

import { Command } from "commander";
import { version } from "../package.json";
import { transformAstroFile } from "./commands/transform";
import { mapOverDirectory } from "./utils/map-directory";
import { extname } from "path";

const program = new Command();

program
  .name("astro-html-helper")
  .description("CLI helper for Astro HTML manipulation")
  .version(version);

program
  .command("transform")
  .description("Transform Astro Files that were created from plain HTML")
  .option("-f, --file <file>", "Astro file to transform")
  .option("-d, --dir <directory>", "Directory to transform")
  .option("--netlify-form", "Enable Netlify form transformation")
  .option("--no-pictures", "Disable picture component transformation")
  .option("--no-picture-src-string", "Disable picture src string extraction")
  .option("--image-dir <directory>", "Download remote images to this directory and create imports")
  .action(async (options) => {
    const formatOptions = {
      netlifyForm: options.netlifyForm || false,
      pictures: options.pictures !== false,
      pictureSrcString: options.pictureSrcString !== false,
      imageDir: options.imageDir,
    };

    if (options.file) {
      if (extname(options.file) !== ".astro") {
        console.error("❌ Error: This command only works on .astro files");
        process.exit(1);
      }
      await transformAstroFile(options.file, formatOptions);
      console.log("✅ File formatted");
    } else if (options.dir) {
      await mapOverDirectory(options.dir, (filePath) =>
        transformAstroFile(filePath, formatOptions)
      );
      console.log("✅ Directory formatted");
    } else {
      console.log(
        "Please specify a file with -f or --file, or a directory with -d or --dir"
      );
    }
  });

program.parse();
