# Design Tokens Processor

A tool to convert design tokens from JSON format into SCSS variables, utility classes, TypeScript types, and a simple HTML doc.

See `example` for a very simple example of how you would hook this up in your project.

## Installation

```bash
npm install @mogielski/design-tokens
```

## Usage

### Command Line Interface

```bash
npx @mogielski/design-tokens -i tokens.json -o ./dist
```

Options:

- `-i, --input <path>`: Input JSON file path (required)
- `-o, --output <path>`: Output directory path (default: "./dist")

### JSON Format

Your design tokens should be structured like this:

```json
{
  "colors": {
    "__settings": {
      "utility": {
        "className": "bg",
        "property": "background-color"
      }
    },
    "primary": {
      "main": "#1976d2",
      "light": "#42a5f5",
      "dark": "#1565c0"
    }
  },
  "spacing": {
    "__settings": {
      "utility": [
        {
          "className": "m",
          "property": "margin"
        },
        {
          "className": "mx-",
          "property": ["margin-left", "margin-right"]
        }
      ]
    },
    "small": "0.5rem",
    "medium": "1rem",
    "large": "2rem"
  }
}
```

### Output

The processor will generate:

1. SCSS Variables (`_variables.scss`):

```scss
$colors-primary-main: #1976d2;
$colors-primary-light: #42a5f5;
$colors-primary-dark: #1565c0;
$spacing-small: 0.5rem;
$spacing-medium: 1rem;
$spacing-large: 2rem;
```

2. Utility Classes (`_utilities.scss`):

```scss
.bg-main {
  background-color: #1976d2;
}
.bg-light {
  background-color: #42a5f5;
}
.bg-dark {
  background-color: #1565c0;
}
.m-small {
  margin: 0.5rem;
}
.mx-small {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}
```

3. TypeScript Types (`types.ts`)

4. Documentation (`documentation.html`):
   - Interactive HTML documentation showcasing all your design tokens
   - Visual previews for colors and spacing
   - Reference for variables and utility classes
   - Responsive layout for easy browsing

## Special Settings

- `__settings`: Special key to configure how tokens are processed
  - `utility`: Define utility class generation
    - `className`: Prefix for the utility class
    - `property`: CSS property or properties to set
  - `utilityBreakpoints`: Reference to breakpoints for responsive utilities
