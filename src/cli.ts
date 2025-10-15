#!/usr/bin/env node

import { Command } from "commander";
import { version } from "../package.json";
import { transformAstroFile } from "./commands/transform";
import { mapOverDirectory } from "./utils/map-directory";
import { extname } from "path";
// import {
//   argument,
//   command,
//   constant,
//   map,
//   object,
//   option,
//   or,
// } from "@optique/core";
// import { path, run } from "@optique/run";

// const parser = or(
//   object({
//     mode: constant("file"),
//     input: argument(path({ mustExist: true, type: "file" })),
//     netlifyForm: option("--netlify-form"),
//     imageDirectory: option(
//       "--image-dir",
//       path({ mustExist: false, allowCreate: true, type: "directory" })
//     ),
//   }),
//   object({
//     mode: constant("directory"),
//     input: argument(path({ mustExist: true, type: "directory" })),
//     netlifyForm: option("--netlify-form"),
//     imageDirectory: option(
//       "--image-dir",
//       path({ mustExist: false, allowCreate: true, type: "directory" })
//     ),
//   })
// );

// const result = run(parser);
// console.log(`Starting server ${result.mode} on port ${result.mode}`);

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
  .option(
    "--image-dir <directory>",
    "Download remote images to this directory and create imports"
  )
  .action(async (options) => {
    const formatOptions = {
      netlifyForm: options.netlifyForm || false,
      pictures: true,
      pictureSrcString: true,
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
