#!/usr/bin/env node

import { argument, constant, object, option, or } from "@optique/core";
import { path, run } from "@optique/run";
import { transformAstroFile } from "./commands/transform";
import { mapOverDirectory } from "./utils/map-directory";

const parser = or(
  object({
    mode: constant("file"),
    pictures: constant(true),
    pictureSrcString: constant(true),
    input: option(
      "-f",
      "--file",
      path({ mustExist: true, type: "file", extensions: [".astro"] })
    ),
    netlifyForm: option("--netlify-form"),
    imageDir: option(
      "--image-dir",
      path({ mustExist: false, allowCreate: true, type: "directory" })
    ),
  }),
  object({
    mode: constant("directory"),
    pictures: constant(true),
    pictureSrcString: constant(true),
    input: option("-d", "--dir", path({ mustExist: true, type: "directory" })),
    netlifyForm: option("--netlify-form"),
    imageDir: option(
      "--image-dir",
      path({ mustExist: false, allowCreate: true, type: "directory" })
    ),
  })
);

const result = run(parser);

const main = async (options: typeof result) => {
  if (options.mode === "file") {
    await transformAstroFile(options.input, options);
    console.log("✅ File formatted");
  } else if (options.mode === "directory") {
    await mapOverDirectory(options.input, (filePath) =>
      transformAstroFile(filePath, options)
    );
    console.log("✅ Directory formatted");
  } else {
    console.log(
      "Please specify a file with -f or --file, or a directory with -d or --dir"
    );
  }
};

main(result);
