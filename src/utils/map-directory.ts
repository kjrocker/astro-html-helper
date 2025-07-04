import { readdir, stat } from "fs/promises";
import { join, extname } from "path";

export const mapOverDirectory = async (
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
        if (extname(entry) === ".astro") {
          await fn(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${directory}: ${error}`);
  }
};
