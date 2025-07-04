import { parse } from "@astrojs/compiler";
import type { AttributeNode, ElementNode, Node } from "@astrojs/compiler/types";
import { is, serialize, walk } from "@astrojs/compiler/utils";

const netlifyRecaptchaNode: ElementNode = {
  type: "element",
  name: "div",
  children: [],
  attributes: [
    {
      name: "data-netlify-recaptcha",
      value: "true",
      kind: "expression",
      type: "attribute",
    },
  ],
};

const netlifyFormAttribute: AttributeNode = {
  name: "data-netlify",
  value: "true",
  type: "attribute",
  kind: "expression",
};

export const netlifyFormsTransform = async (input: string): Promise<string> => {
  const result = await parse(input);

  await walk(result.ast, (node) => {
    if (is.element(node) && node.name === "form") {
      const hasNetlifyAttr =
        node.attributes.findIndex(
          (val) => val.name === "data-netlify" && val.value === "true"
        ) >= 0;
      if (!hasNetlifyAttr) {
        node.attributes.push(netlifyFormAttribute);
      }
      const newChildren = node.children.flatMap((child): Node[] => {
        const isSubmitButton =
          is.element(child) &&
          child.name === "button" &&
          child.attributes.findIndex(
            (attribute) =>
              attribute.name === "type" && attribute.value === "submit"
          ) >= 0;
        if (isSubmitButton) {
          return [netlifyRecaptchaNode, child];
        }
        return [child];
      });
      node.children = newChildren;
    }
  });

  return serialize(result.ast);
};
