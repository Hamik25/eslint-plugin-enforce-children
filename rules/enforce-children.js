"use strict";

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce certain parent/child constraints in JSX, defined via user config.",
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

  create(context) {
    // Retrieve user options for this rule
    const config = context.options[0] || {};
    const userRules = config.rules || {};

    /**
     * Helper: get the simple tag name of a JSX element if it's a JSXIdentifier.
     * e.g. <Grid> -> "Grid"
     */
    function getTagName(openingElement) {
      if (!openingElement || !openingElement.name) return null;
      if (openingElement.name.type === "JSXIdentifier") {
        return openingElement.name.name;
      }
      return null;
    }

    return {
      JSXElement(node) {
        const parentTagName = getTagName(node.openingElement);
        if (!parentTagName) return;

        // Check if there's a rule for this parent
        const allowedChildren = userRules[parentTagName];
        if (!allowedChildren) {
          // No constraints for this parent => do nothing
          return;
        }

        // Enforce constraints on children
        for (const child of node.children) {
          // We only check JSX child elements
          if (child.type === "JSXElement") {
            const childTagName = getTagName(child.openingElement);
            if (!allowedChildren.includes(childTagName)) {
              context.report({
                node: child,
                messageId: "invalidChild",
                data: {
                  parent: parentTagName,
                  child: childTagName,
                  allowedChildren: allowedChildren.join(", ")
                }
              });
            }
          }
        }
      }
    };
  }
};
