import type {
  ElementNode,
  ComponentNode,
  AttributeNode,
  FrontmatterNode,
} from "@astrojs/compiler/types";
import { parse } from "@astrojs/compiler";
import { serialize, walk, is } from "@astrojs/compiler/utils";
import {
  addImageToFrontmatter,
  addPictureToFrontmatter,
} from "../utils/import-lexer";

const isPicture = (node: ElementNode) => node.name === "picture";

const isImage = (node: ElementNode) => node.name === "img";

export const calculateNewPicture = (node: ElementNode): ComponentNode => {
  const { attributes: pictureAttributes, children } = node;

  // Find the img child element
  const imgChild = children.find(
    (child) => child.type === "element" && (child as ElementNode).name === "img"
  ) as ElementNode | undefined;

  if (!imgChild) {
    return { type: "component", name: "Picture", attributes: [], children: [] };
  }

  const newAttributes: AttributeNode[] = [];

  // First, add src attribute
  const srcAttr = imgChild.attributes.find((attr) => attr.name === "src");
  if (srcAttr) {
    newAttributes.push(srcAttr);
  }

  // Handle class attributes specially
  const pictureClassAttr = pictureAttributes.find(
    (attr) => attr.name === "class"
  );
  const imgClassAttr = imgChild.attributes.find(
    (attr) => attr.name === "class"
  );

  if (imgClassAttr) {
    // Convert img class to expression
    newAttributes.push({
      type: "attribute",
      kind: "expression",
      name: "class",
      value: `"${imgClassAttr.value}"`,
    });
  }

  if (pictureClassAttr) {
    // Add pictureAttributes with picture class
    newAttributes.push({
      type: "attribute",
      kind: "expression",
      name: "pictureAttributes",
      value: `{ class: "${pictureClassAttr.value}" }`,
    });
  }

  // Add other attributes from img, converting specific numeric ones to expressions
  // Exclude src, class, decoding, and loading
  const excludedAttrs = ["src", "class", "decoding", "loading"];
  const numericAttrs = ["width", "height"];

  for (const attr of imgChild.attributes) {
    if (!excludedAttrs.includes(attr.name)) {
      // Only convert to numeric expressions for specific attributes like width/height
      const numericValue = parseInt(attr.value, 10);
      if (
        numericAttrs.includes(attr.name) &&
        !isNaN(numericValue) &&
        numericValue.toString() === attr.value
      ) {
        newAttributes.push({
          type: "attribute",
          kind: "expression",
          name: attr.name,
          value: attr.value,
        });
      } else {
        newAttributes.push(attr);
      }
    }
  }

  return {
    type: "component",
    name: "Picture",
    attributes: newAttributes,
    children: [],
  };
};

export const calculateNewImage = (node: ElementNode): ComponentNode => {
  const { attributes } = node;

  const newAttributes: AttributeNode[] = [];

  // First, add src attribute
  const srcAttr = attributes.find((attr) => attr.name === "src");
  if (srcAttr) {
    newAttributes.push(srcAttr);
  }

  // Handle class attributes specially - convert to expression
  const classAttr = attributes.find((attr) => attr.name === "class");
  if (classAttr) {
    newAttributes.push({
      type: "attribute",
      kind: "expression",
      name: "class",
      value: `"${classAttr.value}"`,
    });
  }

  // Add other attributes, converting specific numeric ones to expressions
  // Exclude src, class, decoding, and loading
  const excludedAttrs = ["src", "class", "decoding", "loading"];
  const numericAttrs = ["width", "height"];

  for (const attr of attributes) {
    if (!excludedAttrs.includes(attr.name)) {
      // Only convert to numeric expressions for specific attributes like width/height
      const numericValue = parseInt(attr.value, 10);
      if (
        numericAttrs.includes(attr.name) &&
        !isNaN(numericValue) &&
        numericValue.toString() === attr.value
      ) {
        newAttributes.push({
          type: "attribute",
          kind: "expression",
          name: attr.name,
          value: attr.value,
        });
      } else {
        newAttributes.push(attr);
      }
    }
  }

  return {
    type: "component",
    name: "Image",
    attributes: newAttributes,
    children: [],
  };
};

export const pictureTransform = async (input: string): Promise<string> => {
  const result = await parse(input);

  let hasPicture = false;
  let hasImage = false;
  let frontmatterNode: FrontmatterNode | null = null;

  // First pass: find frontmatter node and transform elements
  await walk(result.ast, (node) => {
    if (is.frontmatter(node)) {
      frontmatterNode = node as FrontmatterNode;
    } else if (is.element(node) && isPicture(node)) {
      const newNode = calculateNewPicture(node);
      // Transform the node in place by casting to any
      (node as any).type = newNode.type;
      (node as any).name = newNode.name;
      (node as any).attributes = newNode.attributes;
      (node as any).children = newNode.children;
      hasPicture = true;
    } else if (is.element(node) && isImage(node)) {
      const newNode = calculateNewImage(node);
      // Transform the node in place by casting to any
      (node as any).type = newNode.type;
      (node as any).name = newNode.name;
      (node as any).attributes = newNode.attributes;
      (node as any).children = newNode.children;
      hasImage = true;
    }
  });

  // Second pass: update frontmatter if we have transformations
  if (frontmatterNode && (hasPicture || hasImage)) {
    const fmNode = frontmatterNode as FrontmatterNode;
    if (hasPicture) {
      fmNode.value = await addPictureToFrontmatter(fmNode.value);
    }
    if (hasImage) {
      fmNode.value = await addImageToFrontmatter(fmNode.value);
    }
  }

  return serialize(result.ast);
};
