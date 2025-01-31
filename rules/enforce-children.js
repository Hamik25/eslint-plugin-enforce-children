"use strict";

/**
 * Finds the nearest parent in the AST that is a `JSXElement`.
 * This ensures we correctly identify which JSX element is the "real" parent,
 * even if the child is inside expressions, loops, etc.
 *
 * @param {ASTNode} node - The node for which we want to find a parent.
 * @returns {ASTNode | null} - The nearest JSXElement parent node, or null if none found.
 */
function findNearestJSXParent(node) {
  let current = node.parent;
  while (current) {
    if (current.type === "JSXElement") {
      return current;
    }
    current = current.parent;
  }
  return null;
}

/**
 * Extracts the simple tag name from a JSXOpeningElement if it's an identifier (e.g., <Grid> -> "Grid").
 * Returns null if it's a more complex expression like <My.Components.Grid>.
 *
 * @param {ASTNode} openingElement - The node representing <Tag ...>
 * @returns {string | null} The tag name or null if unavailable.
 */
function getTagName(openingElement) {
  if (!openingElement || !openingElement.name) return null;
  if (openingElement.name.type === "JSXIdentifier") {
    return openingElement.name.name;
  }
  return null; // e.g., <Some.Component>, <this.Component>, <Foo['bar']>
}

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce parent-child constraints in JSX, defined via user config.",
      recommended: false
    },
    schema: [
      {
        type: "object",
        properties: {
          rules: {
            type: "object",
            patternProperties: {
              ".*": {
                type: "array",
                items: { type: "string" }
              }
            },
            additionalProperties: true
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      invalidChild:
        "Only these children ({{allowedChildren}}) are allowed inside <{{parent}}>. Found <{{child}}>."
    }
  },

  /**
   * Core logic: For each JSXElement in the AST, find its nearest JSX parent.
   * If there's a rule for that parent, and the child's tag is not in the allowed list,
   * report an error.
   */
  create(context) {
    const config = context.options[0] || {};
    const userRules = config.rules || {};

    return {
      JSXElement(node) {
        // Find the nearest JSX parent (the real parent in the React element tree)
        const parentElement = findNearestJSXParent(node);
        if (!parentElement) {
          // This element has no JSX parent (it might be at the top level),
          // so there's no constraint to check.
          return;
        }

        // Get the parent's tag name (e.g., "Grid", "Row", etc.)
        const parentTagName = getTagName(parentElement.openingElement);
        if (!parentTagName) {
          // If we can't identify the parent's tag (e.g. <Some.Component>),
          // we skip enforcement.
          return;
        }

        // Check if there's a constraint for this parent
        const allowedChildren = userRules[parentTagName];
        if (!allowedChildren) {
          // No constraints configured for this parent => do nothing
          return;
        }

        // Now get the child's tag name (the current node)
        const childTagName = getTagName(node.openingElement);
        if (!childTagName) {
          // Could be a complex child tag name that we don't handle
          return;
        }

        // If this child's tag name isn't in the allowed list for the parent, report
        if (!allowedChildren.includes(childTagName)) {
          context.report({
            node,
            messageId: "invalidChild",
            data: {
              parent: parentTagName,
              child: childTagName,
              allowedChildren: allowedChildren.join(", ")
            }
          });
        }
      }
    };
  }
};
