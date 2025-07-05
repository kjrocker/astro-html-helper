/**
 * Generic AST node walker utility
 * Recursively walks through an AST node and its children, applying a callback function
 */
export function walkNode(node: any, callback: (node: any) => void): void {
  callback(node);

  // Recursively walk children
  if (node.children) {
    for (const child of node.children) {
      walkNode(child, callback);
    }
  }
}