import type {
  ElementNode,
  ComponentNode,
  FrontmatterNode,
  Node,
} from "@astrojs/compiler/types";
import { parse } from "@astrojs/compiler";
import { serialize } from "@astrojs/compiler/utils";
import { walkNode } from "../utils/walk-node";
import { writeFile, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { existsSync } from "fs";

/**
 * Converts an SVG ID to a PascalCase component name
 * Example: "my-icon" -> "MyIcon", "user_profile" -> "UserProfile"
 */
const svgIdToComponentName = (id: string): string => {
  // Remove non-alphanumeric characters except hyphens and underscores
  let clean = id.replace(/[^a-zA-Z0-9-_]/g, "");

  // Split on hyphens and underscores, capitalize each word
  const words = clean.split(/[-_]/);
  const pascalCase = words
    .map((word) => {
      if (!word) return "";
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");

  // Ensure it starts with a letter
  if (/^[0-9]/.test(pascalCase)) {
    return "Svg" + pascalCase;
  }

  return pascalCase || "Svg";
};

/**
 * Converts an SVG ID to a valid filename
 * Example: "MyIcon" -> "my-icon", "user_profile" -> "user-profile"
 */
const svgIdToFilename = (id: string): string => {
  // Remove non-alphanumeric characters except hyphens and underscores
  let clean = id.replace(/[^a-zA-Z0-9-_]/g, "");

  // Convert to lowercase and replace underscores with hyphens
  return clean.toLowerCase().replace(/_/g, "-");
};

/**
 * Generates SVG filename and component name
 */
const generateSvgFilename = (
  id: string | undefined,
  counter: number
): { filename: string; componentName: string } => {
  if (id) {
    const filename = svgIdToFilename(id) + ".svg";
    const componentName = svgIdToComponentName(id);
    return { filename, componentName };
  }

  // No ID: use incrementing counter
  const paddedCounter = counter.toString().padStart(2, "0");
  const filename = `svg_${paddedCounter}.svg`;
  const componentName = `SVG${paddedCounter}`;
  return { filename, componentName };
};

/**
 * Writes SVG content to a file
 */
const writeSvgFile = async (
  content: string,
  dir: string,
  filename: string
): Promise<string> => {
  // Ensure directory exists
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  const filePath = join(dir, filename);
  await writeFile(filePath, content, "utf-8");
  return filePath;
};

interface SvgInfo {
  node: ElementNode;
  content: string;
  filename: string;
  componentName: string;
  importPath: string;
}

/**
 * Transform that extracts inline SVG elements to separate files
 * and replaces them with imported components
 */
export const svgExtractionTransform = async (
  input: string,
  currentFilePath?: string
): Promise<string> => {
  if (!currentFilePath) {
    // If no file path provided, we can't write SVG files
    return input;
  }

  const result = await parse(input);
  const svgsToExtract: SvgInfo[] = [];
  let frontmatterNode: FrontmatterNode | null = null;
  let svgCounter = 1;

  // First pass: find all top-level SVG elements and collect info
  walkNode(result.ast, (node: Node) => {
    if (node.type === "frontmatter") {
      frontmatterNode = node as FrontmatterNode;
    } else if (node.type === "element" && (node as ElementNode).name === "svg") {
      const svgNode = node as ElementNode;

      // Get ID attribute if present
      const idAttr = svgNode.attributes.find((attr: any) => attr.name === "id");
      const svgId = idAttr?.value;

      // Generate filename and component name
      const { filename, componentName } = generateSvgFilename(
        svgId,
        svgCounter++
      );

      // Serialize the SVG node to get its content
      const svgContent = serialize(svgNode);

      // Calculate import path (relative to the Astro file)
      const importPath = `./${filename}`;

      svgsToExtract.push({
        node: svgNode,
        content: svgContent,
        filename,
        componentName,
        importPath,
      });
    }
  });

  // If no SVGs found, return original input
  if (svgsToExtract.length === 0) {
    return input;
  }

  // Write all SVG files
  const fileDir = dirname(currentFilePath);
  for (const svgInfo of svgsToExtract) {
    await writeSvgFile(svgInfo.content, fileDir, svgInfo.filename);
  }

  // Second pass: replace SVG elements with component nodes
  for (const svgInfo of svgsToExtract) {
    const { node, componentName } = svgInfo;

    // Convert the SVG element to a component
    const componentNode: ComponentNode = {
      type: "component",
      name: componentName,
      attributes: [],
      children: [],
    };

    // Mutate the node in-place
    (node as any).type = componentNode.type;
    (node as any).name = componentNode.name;
    (node as any).attributes = componentNode.attributes;
    (node as any).children = componentNode.children;
  }

  // Update frontmatter with imports
  if (frontmatterNode) {
    const fmNode = frontmatterNode as FrontmatterNode;
    let frontmatterContent = fmNode.value;

    for (const svgInfo of svgsToExtract) {
      const importStatement = `import ${svgInfo.componentName} from "${svgInfo.importPath}";`;

      // Only add if not already present
      if (!frontmatterContent.includes(importStatement)) {
        frontmatterContent += `\n${importStatement}`;
      }
    }

    frontmatterContent += "\n"; // Ensure trailing newline
    fmNode.value = frontmatterContent;
  }

  return serialize(result.ast);
};
