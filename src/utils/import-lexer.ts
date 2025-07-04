import { parse } from "es-module-lexer";

function insertIntoImport(
  code: string,
  imp: { ss: number; se: number },
  importName: string
): string {
  const importStatement = code.slice(imp.ss, imp.se);
  // Find the closing curly brace in the import statement
  const closingBraceIndex = importStatement.indexOf("}");
  if (closingBraceIndex === -1) {
    // Malformed import, just return as is
    return code;
  }
  // Check if importName is already present
  if (importStatement.includes(importName)) {
    return code;
  }
  // Insert 'importName' before the closing brace, handling whitespace
  const before = importStatement
    .slice(0, closingBraceIndex)
    .replace(/\s+$/, "");
  const after = importStatement.slice(closingBraceIndex);
  const newImportStatement =
    before +
    (before.endsWith("{") ? `${importName} ` : `, ${importName} `) +
    after;
  // Replace the old import statement with the new one
  return code.slice(0, imp.ss) + newImportStatement + code.slice(imp.se);
}

export const addPictureToFrontmatter = async (value: string) => {
  const results = parse(value);
  const [imports] = results;
  const importsAssets = imports.find((imp) => imp.n === "astro:assets");
  if (!importsAssets) {
    return `import { Picture } from "astro:assets";\n${value}`;
  }
  return insertIntoImport(value, importsAssets, "Picture");
};

export const addImageToFrontmatter = async (value: string) => {
  const results = parse(value);
  const [imports] = results;
  const importsAssets = imports.find((imp) => imp.n === "astro:assets");
  if (!importsAssets) {
    return `import { Image } from "astro:assets";\n${value}`;
  }
  return insertIntoImport(value, importsAssets, "Image");
};
