import { writeFile, mkdir } from "fs/promises";
import { join, dirname, extname, relative } from "path";
import { existsSync } from "fs";

/**
 * Downloads an image from a URL and saves it to a local directory
 * @param url - The URL of the image to download
 * @param imageDir - The directory to save the image to
 * @returns The local file path of the downloaded image
 */
export async function downloadImage(url: string, imageDir: string): Promise<string> {
  try {
    // Create directory if it doesn't exist
    if (!existsSync(imageDir)) {
      await mkdir(imageDir, { recursive: true });
    }

    // Extract filename from URL
    const urlObj = new URL(url);
    const filename = urlObj.pathname.split('/').pop() || 'image';
    const extension = extname(filename) || '.jpg';
    const baseFilename = filename.replace(extname(filename), '');
    
    // Create a safe filename
    const safeFilename = `${baseFilename}${extension}`;
    const localPath = join(imageDir, safeFilename);

    // Check if file already exists
    if (existsSync(localPath)) {
      return localPath;
    }

    // Download the image
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    await writeFile(localPath, new Uint8Array(buffer));

    return localPath;
  } catch (error) {
    console.warn(`⚠️  Failed to download image from ${url}:`, error);
    throw error;
  }
}

/**
 * Converts a local file path to a relative import path
 * @param filePath - The local file path
 * @param fromDir - The directory to calculate the relative path from
 * @returns The relative import path
 */
export function getRelativeImportPath(filePath: string, fromDir: string): string {
  const relativePath = relative(fromDir, filePath);
  // Ensure the path starts with ./ or ../
  if (!relativePath.startsWith('./') && !relativePath.startsWith('../')) {
    return `./${relativePath}`;
  }
  return relativePath;
}

/**
 * Checks if a URL is a remote image URL
 * @param url - The URL to check
 * @returns True if it's a remote image URL
 */
export function isRemoteImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Converts a URL to a valid variable name for imports
 * @param url - The URL to convert
 * @returns A valid variable name
 */
export function urlToImportName(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // If pathname is just "/" or empty, use "image"
    if (pathname === "/" || pathname === "") {
      return "image";
    }
    
    const filename = pathname.split("/").pop();
    
    // If no filename or no extension, use "image"
    if (!filename || !filename.includes(".")) {
      return "image";
    }
    
    const title = filename.split(".")[0];
    if (!title) return "image";
    
    // Convert kebab-case and snake_case to camelCase
    // Remove non-alphanumeric characters except hyphens and underscores first
    let cleanTitle = title.replace(/[^a-zA-Z0-9-_]/g, '');
    
    // Convert to camelCase
    cleanTitle = cleanTitle.replace(/[-_]([a-zA-Z0-9])/g, (match, char) => 
      char.toUpperCase()
    );
    
    // Ensure it starts with a letter or underscore (valid JS identifier)
    if (/^[0-9]/.test(cleanTitle)) {
      cleanTitle = 'img' + cleanTitle;
    }
    
    return cleanTitle || "image";
  } catch {
    // If URL parsing fails, fallback to simple string processing
    return "image";
  }
}