import type {
  ComponentNode,
  ElementNode,
  FrontmatterNode,
  Node,
} from "@astrojs/compiler/types";
import { parse } from "@astrojs/compiler";
import { serialize } from "@astrojs/compiler/utils";
import { walkNode } from "../utils/walk-node";
import {
  downloadImage,
  getRelativeImportPath,
  isRemoteImageUrl,
  urlToImportName,
} from "../utils/image-downloader";
import { dirname } from "path";

const urlToVariableName = (url: string): string => {
  const title = url.split("/").pop()?.split(".")[0];
  if (!title) return "image";

  // Convert kebab-case and snake_case to camelCase
  // Remove non-alphanumeric characters except hyphens and underscores first
  let cleanTitle = title.replace(/[^a-zA-Z0-9-_]/g, "");

  // Convert to camelCase
  cleanTitle = cleanTitle.replace(/[-_]([a-zA-Z0-9])/g, (match, char) =>
    char.toUpperCase()
  );

  // Ensure it starts with a letter or underscore (valid JS identifier)
  if (/^[0-9]/.test(cleanTitle)) {
    cleanTitle = "img" + cleanTitle;
  }

  return cleanTitle || "image";
};

const hasSrcAttribute = (node: any): boolean => {
  return node.attributes?.some((attr: any) => attr.name === "src");
};

const isSrcContainingNode = (
  node: Node
): node is ComponentNode | ElementNode => {
  if (
    node.type === "component" &&
    (node.name === "Picture" || node.name === "Image")
  ) {
    return hasSrcAttribute(node);
  }
  if (
    node.type === "element" &&
    (node.name === "img" || node.name === "source")
  ) {
    return hasSrcAttribute(node);
  }
  return false;
};

export const sourceExtractionTransform = async (
  input: string,
  imageDir?: string,
  currentFilePath?: string
): Promise<string> => {
  const result = await parse(input);

  let frontmatterNode: FrontmatterNode | null = null;
  const srcMap = new Map<string, string>(); // variable name -> URL or import path
  const importMap = new Map<string, string>(); // variable name -> import path (for downloaded images)

  // Walk all nodes and apply transformations
  walkNode(result.ast, (node: Node) => {
    if (node.type === "frontmatter") {
      frontmatterNode = node as FrontmatterNode;
    } else if (isSrcContainingNode(node)) {
      const srcAttr = node.attributes.find((attr: any) => attr.name === "src");
      if (srcAttr && srcAttr.kind === "quoted") {
        const url = srcAttr.value;
        const variableName =
          imageDir && isRemoteImageUrl(url)
            ? urlToImportName(url)
            : urlToVariableName(url);

        srcMap.set(variableName, url);
        srcAttr.kind = "expression";
        srcAttr.value = variableName;
      }
    }
  });

  // Download remote images if imageDir is provided
  if (imageDir && srcMap.size > 0) {
    for (const [variableName, url] of srcMap) {
      if (isRemoteImageUrl(url)) {
        try {
          const localPath = await downloadImage(url, imageDir);
          // Calculate relative import path
          const currentDir = currentFilePath
            ? dirname(currentFilePath)
            : process.cwd();
          const relativePath = getRelativeImportPath(localPath, currentDir);
          importMap.set(variableName, relativePath);
        } catch (error) {
          console.warn(`⚠️  Failed to download ${url}, keeping original URL`);
        }
      }
    }
  }

  // Remove height/width attributes from Picture/Image components 
  // for successfully downloaded images placed in 'src' directory, except for SVGs
  if (imageDir && importMap.size > 0) {
    const downloadedVariables = new Set(importMap.keys());
    
    walkNode(result.ast, (node: Node) => {
      if (
        (node.type === "component" &&
          (node.name === "Picture" || node.name === "Image")) ||
        (node.type === "element" &&
          (node.name === "img" || node.name === "picture"))
      ) {
        // Check if this node or its children have src attributes that match downloaded images
        let shouldRemoveAttributes = false;
        let imageUrl = "";
        
        // Check if this node has a src attribute pointing to a downloaded image
        const srcAttr = node.attributes.find((attr: any) => attr.name === "src");
        if (srcAttr && srcAttr.kind === "expression") {
          const variableName = srcAttr.value;
          if (downloadedVariables.has(variableName)) {
            imageUrl = srcMap.get(variableName) || "";
            shouldRemoveAttributes = true;
          }
        }
        
        // For picture elements, also check child nodes (source, img)
        let childVariableName = "";
        if (node.type === "element" && node.name === "picture") {
          walkNode(node, (childNode: Node) => {
            if (childNode.type === "element" && 
                (childNode.name === "source" || childNode.name === "img")) {
              const childSrcAttr = childNode.attributes.find((attr: any) => attr.name === "src");
              if (childSrcAttr && childSrcAttr.kind === "expression") {
                const variableName = childSrcAttr.value;
                if (downloadedVariables.has(variableName)) {
                  imageUrl = srcMap.get(variableName) || "";
                  childVariableName = variableName;
                  shouldRemoveAttributes = true;
                }
              }
            }
          });
        }
        
        if (shouldRemoveAttributes) {
          // Use the appropriate variable name for path lookup
          const variableToCheck = childVariableName || (srcAttr?.value || "");
          const imagePath = importMap.get(variableToCheck);
          const isInSrcDirectory = imagePath && imagePath.includes("/src/");
          const isSvg = imageUrl.toLowerCase().endsWith(".svg");
          
          // Only remove height/width if image is in 'src' directory AND not an SVG
          if (isInSrcDirectory && !isSvg) {
            // Remove height and width attributes
            node.attributes = node.attributes.filter(
              (attr: any) => attr.name !== "height" && attr.name !== "width"
            );
          }
        }
      }
    });
  }

  // Update frontmatter with import statements or variable declarations
  if (frontmatterNode && srcMap.size > 0) {
    const fmNode = frontmatterNode as FrontmatterNode;
    let frontmatterContent = fmNode.value;

    for (const [variableName, url] of srcMap) {
      // Check if this is a downloaded image (has import path)
      const importPath = importMap.get(variableName);

      if (importPath) {
        // Create import statement for downloaded image
        const importStatement = `import ${variableName} from "${importPath}";`;
        if (!frontmatterContent.includes(importStatement)) {
          frontmatterContent += `\n${importStatement}`;
        }
      } else {
        // Create variable declaration for non-downloaded URLs
        const varDeclaration = `const ${variableName} = "${url}";`;
        if (!frontmatterContent.includes(varDeclaration)) {
          frontmatterContent += `\n${varDeclaration}`;
        }
      }
    }
    frontmatterContent += "\n"; // Ensure a newline at the end

    fmNode.value = frontmatterContent;
  }

  return serialize(result.ast);
};
