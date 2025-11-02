import { parse } from "es-module-lexer";

function getImportInsertionPoint(code: string): number {
  const lines = code.split("\n");
  let insertAfterLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // Check if this line is whitespace or a comment
    if (
      trimmed === "" ||
      trimmed.startsWith("//") ||
      trimmed.startsWith("/*") ||
      (trimmed.startsWith("*") && !trimmed.startsWith("*/"))
    ) {
      insertAfterLine = i;
    } else {
      // Found first non-comment, non-whitespace line
      break;
    }
  }

  // If we found comment lines, insert after them
  if (insertAfterLine >= 0) {
    // Calculate the position after this line (including the newline)
    let pos = 0;
    for (let i = 0; i <= insertAfterLine; i++) {
      pos += lines[i].length + 1; // +1 for \n
    }
    return pos;
  }

  return 0; // Insert at beginning if no comments found
}

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
  // The await is important for WASM loading reasons
  const [imports] = await parse(value);
  const importsAssets = imports.find((imp) => imp.n === "astro:assets");
  if (!importsAssets) {
    const insertPos = getImportInsertionPoint(value);
    if (insertPos === 0) {
      return `\nimport { Picture } from "astro:assets";\n${value}`;
    } else {
      return (
        value.slice(0, insertPos) +
        `import { Picture } from "astro:assets";\n` +
        value.slice(insertPos)
      );
    }
  }
  return insertIntoImport(value, importsAssets, "Picture");
};

export const addImageToFrontmatter = async (value: string) => {
  // The await is important for WASM loading reasons
  const [imports] = await parse(value);
  const importsAssets = imports.find((imp) => imp.n === "astro:assets");
  if (!importsAssets) {
    const insertPos = getImportInsertionPoint(value);
    if (insertPos === 0) {
      return `\nimport { Image } from "astro:assets";\n${value}`;
    } else {
      return (
        value.slice(0, insertPos) +
        `import { Image } from "astro:assets";\n` +
        value.slice(insertPos)
      );
    }
  }
  return insertIntoImport(value, importsAssets, "Image");
};
