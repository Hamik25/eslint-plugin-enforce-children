# eslint-plugin-enforce-children

> Enforce certain parent/child constraints in JSX, defined via user config.

[![NPM registry](https://img.shields.io/npm/v/eslint-plugin-enforce-children?style=for-the-badge&color=red)](https://www.npmjs.com/package/eslint-plugin-enforce-children)
[![License](https://img.shields.io/badge/license-mit-green.svg?style=for-the-badge)](https://github.com/Hamik25/eslint-plugin-enforce-children/blob/update-readme/LICENSE)

## Install

1. If you haven’t already, install ESLint:
```bash
npm install --save eslint
```

2. Install the plugin:
```bash
npm install --save eslint-plugin-enforce-children
```

## Usage

1. **Add** `parent-child` **to your ESLint configuration**. For example, if you use an .eslintrc.json file:
```bash
{
  "plugins": ["enforce-children"],
  "rules": {
    "enforce-children/enforce-children": [
      "error",
      {
        "rules": {
          // Each key is a parent component, and the array is the list of allowed children.
          "Grid": ["Row"],
          "Row": ["Col"],
          // etc.
        }
      }
    ]
  }
}
```
2. **Configure the rule:** Pass an object with a rules property to define which child components are allowed under specific parents. The rule’s configuration expects a structure like this:
```bash
{
  "rules": {
    "Grid": ["Row"],
    "Row": ["Col"],
    // ...
  }
}
```
- **Key:** The name of the parent JSX component.
- **Value:** An array of allowed child JSX component names.
3. **Lint your code:** Run ESLint, and it will report any invalid children.

## Setup

- **Rule Name:** `enforce-children/enforce-children`
- **Type:** `problem`
- **Description:** Ensures that only specified child components appear within certain parent components.

## Options

| Option           | Description                                                                                                                 | Type         | Required |
| -----------------| ----------------------------------------------------------------------------------------------------------------------------| -------------| -------- |
| `rules`          | An object whose keys are parent component names and values are arrays of allowed children                                   |`Object`      | yes      |

## Examples

**Valid**
Given a configuration:
```bash
{
  "rules": {
    "Grid": ["GridItem"]
  }
}
```
This is **valid:**
```jsx
function App() {
  return (
    <Grid>
        <Row>
            <Col size={2} offset={2}>
                <div style={style}>Col-2 offset-2</div>
            </Col>
            <Col size={6} offset={0}>
                <div style={style}>Col-6 offset-0</div>
            </Col>
        </Row>
  
        <Row>
            <Col size={5} offset={2}>
                <div style={style}>Col-5 offset-2</div>
            </Col>
            <Col size={3} offset={0}>
                <div style={style}>Col-3 offset-0</div>
            </Col>
        </Row>
    </Grid>
  );
}
```
**Invalid** With the same configuration above:
```jsx
function App() {
  return (
    <Grid>
      <Col size={3} offset={0}> {/* ❌ Only these children (Row) are allowed inside <Grid>. Found <Col>. */}
        <div>Col-3 offset-0</div>
      </Col>  
    </Grid>
  );
}
```

## How It Works

1. The rule checks each `JSXElement` node.
2. It identifies the parent component name (e.g., `Grid`).
3. It looks up the array of allowed children from your user-defined config (e.g., `[ "Row"]` ).
4. It checks each JSX child to see if it is in the allowed list.
5. If not, it reports an error.

## License

[MIT Licensed](https://github.com/Hamik25/eslint-plugin-enforce-children/blob/main/LICENSE) © 2025
[Hamik25](https://github.com/Hamik25)
