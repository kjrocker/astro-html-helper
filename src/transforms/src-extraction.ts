import type { FrontmatterNode } from "@astrojs/compiler/types";
import { parse } from "@astrojs/compiler";
import { serialize } from "@astrojs/compiler/utils";

const urlToVariableName = (url: string): string => {
  return url.split("/").pop()?.split(".")[0] || "image";
};

const hasSrcAttribute = (node: any): boolean => {
  return node.attributes?.some((attr: any) => attr.name === "src");
};

const isSrcContainingNode = (node: any): boolean => {
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
  input: string
): Promise<string> => {
  const result = await parse(input);

  let frontmatterNode: FrontmatterNode | null = null;
  const srcMap = new Map<string, string>(); // variable name -> URL

  // Manual recursive walk to handle all nodes properly
  function walkNode(node: any): void {
    if (node.type === "frontmatter") {
      frontmatterNode = node as FrontmatterNode;
    } else if (isSrcContainingNode(node)) {
      const srcAttr = node.attributes.find((attr: any) => attr.name === "src");
      if (srcAttr && srcAttr.kind === "quoted") {
        const url = srcAttr.value;
        const variableName = urlToVariableName(url);
        srcMap.set(variableName, url);
        srcAttr.kind = "expression";
        srcAttr.value = variableName;
      }
    }

    // Recursively walk children
    if (node.children) {
      for (const child of node.children) {
        walkNode(child);
      }
    }
  }

  walkNode(result.ast);

  // Update frontmatter with variable declarations
  if (frontmatterNode && srcMap.size > 0) {
    const fmNode = frontmatterNode as FrontmatterNode;
    let frontmatterContent = fmNode.value;

    for (const [variableName, url] of srcMap) {
      const varDeclaration = `const ${variableName} = "${url}";`;
      if (!frontmatterContent.includes(varDeclaration)) {
        frontmatterContent += `\n${varDeclaration}`;
      }
    }

    fmNode.value = frontmatterContent;
  }

  return serialize(result.ast);
};
