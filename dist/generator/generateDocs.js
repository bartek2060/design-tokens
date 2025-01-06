"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDocs = void 0;
const constants_1 = require("../constants");
const generateStyles_1 = require("./generateStyles");
const generatePreview = (value) => {
    if (typeof value !== "string")
        return "";
    // Color values (hex, rgb, rgba, hsl)
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb[a]?\(.*\)$|^hsl[a]?\(.*\)$/.test(value)) {
        return `
      <div class="token-preview color-preview" style="background-color: ${value}">
        <div class="token-preview-value">${value}</div>
      </div>
    `;
    }
    // Spacing/Size values (px, rem, em, %, vh, vw)
    if (/^[\d.]+(px|rem|em|%|vh|vw)$/.test(value)) {
        return `
      <div class="token-preview spacing-preview">
        <div class="spacing-box" style="width: ${value}"></div>
        <div class="spacing-line"></div>
        <div class="spacing-label">${value}</div>
      </div>
    `;
    }
    // Font family values
    if (value.includes("serif") || value.includes("sans") || value.includes("mono") || value.includes(",")) {
        return `
      <div class="token-preview font-preview" style="font-family: ${value}">
        <div class="font-sample">The quick brown fox jumps over the lazy dog</div>
        <div class="token-preview-value">${value}</div>
      </div>
    `;
    }
    // For all other values (breakpoints, plain text, etc)
    return `
    <div class="token-preview value-preview">
      <div class="token-preview-value">${value}</div>
    </div>
  `;
};
const generateUtilityDocs = (utility, tokenPath, settings) => {
    if (!utility)
        return "";
    const utilities = (0, generateStyles_1.ensureArray)(utility);
    const tokenValueName = tokenPath[tokenPath.length - 1];
    const utilityClasses = utilities.map((util) => {
        const classes = [`${(0, generateStyles_1.cssKey)(".", [util.className, tokenValueName])}`];
        // Add breakpoint-specific classes if available
        if (settings.utilityBreakpoints && typeof settings.utilityBreakpoints !== "string") {
            const breakpoints = settings.utilityBreakpoints;
            Object.keys(breakpoints).forEach((breakpoint) => {
                classes.push((0, generateStyles_1.cssKey)(".", [breakpoint + constants_1.SCSS_UTILITY_BREAKPOINT_SEPARATOR + util.className, tokenValueName]));
            });
        }
        return {
            classes,
            properties: (0, generateStyles_1.ensureArray)(util.property),
        };
    });
    // If this is a section-level utility doc (not in a token card)
    if (tokenPath.length === 1) {
        return `
      <div class="utility-docs">
        <h4>Available Utility Classes</h4>
        ${utilities
            .map((util, index) => `
            <div class="utility-item">
              <div class="utility-classes">
                ${utilityClasses[index].classes
            .map((className) => `
                    <code class="utility-class">${className}</code>
                  `)
            .join("")}
              </div>
              <div class="utility-details">
                Sets <code>${utilityClasses[index].properties.join(", ")}</code>
              </div>
            </div>
          `)
            .join("")}
      </div>
    `;
    }
    // For token card utility docs, show a more compact version
    return `
    <div class="usage-item utility-usage">
      <span class="usage-label">Utility Classes:</span>
      <div class="utility-classes-compact">
        ${utilityClasses
        .map((util) => util.classes
        .map((className) => `<code class="utility-class-compact" title="Sets: ${util.properties.join(", ")}">${className}</code>`)
        .join(""))
        .join("")}
      </div>
    </div>
  `;
};
const shouldShowSection = (name, tokens) => {
    if (name === constants_1.SETTINGS_KEY)
        return false;
    return Object.entries(tokens).some(([key]) => key !== constants_1.SETTINGS_KEY);
};
const generateTokenSection = (name, tokens, settings) => {
    if (!shouldShowSection(name, tokens))
        return "";
    const tokenEntries = Object.entries(tokens).filter(([key, value]) => {
        return key !== constants_1.SETTINGS_KEY && (typeof value === "string" || (typeof value === "object" && value !== null));
    });
    const processedEntries = tokenEntries
        .map(([key, value]) => {
        if (typeof value === "object" && value !== null) {
            const nestedSettings = { ...settings, ...value[constants_1.SETTINGS_KEY] };
            return Object.entries(value)
                .filter(([nestedKey]) => nestedKey !== constants_1.SETTINGS_KEY)
                .map(([nestedKey, nestedValue]) => ({
                key,
                nestedKey,
                value: nestedValue,
                settings: nestedSettings,
            }));
        }
        return [
            {
                key,
                value: value,
                settings,
            },
        ];
    })
        .flat();
    if (processedEntries.length === 0)
        return "";
    return `
    <section class="token-section">
      <div class="section-header">
        <h2>${name}</h2>
        ${settings?.generateUtility ? generateUtilityDocs(settings.generateUtility, [name], settings) : ""}
      </div>
      <div class="token-grid">
        ${processedEntries
        .map((entry) => {
        if (typeof entry.value === "object")
            return "";
        const tokenPath = entry.nestedKey ? [name, entry.key, entry.nestedKey] : [name, entry.key];
        const preview = generatePreview(entry.value);
        const variableName = (0, generateStyles_1.cssKey)("$", tokenPath);
        return `
              <div class="token-item">
                <div class="token-header">
                  <h3>${entry.nestedKey || entry.key}</h3>
                  ${preview}
                </div>
                <div class="token-details">
                  <div class="token-usage">
                    <div class="usage-item">
                      <span class="usage-label">SCSS Variable:</span>
                      <code>${variableName}</code>
                    </div>
                    ${entry.settings?.generateUtility ? generateUtilityDocs(entry.settings.generateUtility, tokenPath, entry.settings) : ""}
                  </div>
                </div>
              </div>
            `;
    })
        .join("")}
      </div>
    </section>
  `;
};
const generateStyles = () => `
  <style>
    :root {
      --primary-color: #1976d2;
      --background-color: #f8f9fa;
      --text-color: #2c3e50;
      --border-color: #e9ecef;
      --code-bg: #f1f3f5;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
      --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
      --radius-sm: 4px;
      --radius-md: 8px;
      --spacing-xs: 0.5rem;
      --spacing-sm: 1rem;
      --spacing-md: 1.5rem;
      --spacing-lg: 2rem;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: var(--text-color);
      background: var(--background-color);
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: var(--spacing-lg);
    }

    .header {
      text-align: center;
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-lg) 0;
      background: white;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
    }

    .header h1 {
      color: var(--primary-color);
      margin-bottom: var(--spacing-xs);
    }

    .header p {
      color: #666;
      max-width: 600px;
      margin: 0 auto;
    }

    .token-section {
      background: white;
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-lg);
      box-shadow: var(--shadow-sm);
    }

    .section-header {
      margin-bottom: var(--spacing-md);
    }

    .section-header h2 {
      color: var(--text-color);
      margin-bottom: var(--spacing-sm);
    }

    .utility-docs {
      background: var(--code-bg);
      padding: var(--spacing-sm);
      border-radius: var(--radius-sm);
      margin-top: var(--spacing-sm);
    }

    .utility-docs h4 {
      margin-bottom: var(--spacing-xs);
      color: #666;
      font-size: 0.9rem;
    }

    .utility-item {
      margin-bottom: var(--spacing-xs);
    }

    .utility-classes {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
      margin-bottom: var(--spacing-xs);
    }

    .utility-class {
      font-weight: 500;
      color: var(--primary-color);
      white-space: nowrap;
    }

    .utility-details {
      color: #666;
      font-size: 0.9em;
    }

    .utility-usage {
      border-top: 1px solid var(--border-color);
      margin-top: var(--spacing-xs);
      padding-top: var(--spacing-xs);
    }

    .utility-classes-compact {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      font-size: 0.8rem;
    }

    .utility-class-compact {
      padding: 2px 6px !important;
      background: var(--primary-color) !important;
      color: white !important;
      border-radius: 3px !important;
      cursor: help;
      font-size: 0.8rem !important;
    }

    .token-usage {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .usage-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .usage-label {
      font-size: 0.75rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    code {
      display: block;
      background: white;
      padding: var(--spacing-xs);
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
      word-break: break-all;
      color: var(--text-color);
    }

    .token-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: var(--spacing-md);
    }

    .token-item {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      background: white;
    }

    .token-item:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .token-header {
      padding: var(--spacing-sm);
    }

    .token-header h3 {
      margin-bottom: var(--spacing-xs);
      color: var(--text-color);
      font-size: 1rem;
    }

    .token-preview {
      margin: var(--spacing-xs) 0;
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .color-preview {
      height: 100px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: var(--spacing-xs);
    }

    .spacing-preview {
      position: relative;
      height: 60px;
      display: flex;
      align-items: center;
      padding: 0 var(--spacing-sm);
      background: var(--code-bg);
    }

    .spacing-box {
      height: 24px;
      background: var(--primary-color);
      opacity: 0.2;
      border-radius: 2px;
    }

    .spacing-line {
      position: absolute;
      top: 50%;
      left: var(--spacing-sm);
      right: var(--spacing-sm);
      height: 1px;
      background: var(--primary-color);
      opacity: 0.3;
    }

    .spacing-label {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 0 var(--spacing-xs);
      font-size: 0.875rem;
      color: var(--text-color);
    }

    .font-preview {
      padding: var(--spacing-sm);
      background: var(--code-bg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .font-sample {
      font-size: 1rem;
      line-height: 1.5;
      color: var(--text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .value-preview {
      padding: var(--spacing-xs);
      background: var(--code-bg);
      text-align: center;
    }

    .token-preview-value {
      font-size: 0.875rem;
      color: #666;
      background: rgba(255,255,255,0.9);
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      backdrop-filter: blur(4px);
    }

    .token-details {
      border-top: 1px solid var(--border-color);
      padding: var(--spacing-sm);
      background: var(--code-bg);
    }

    @media (max-width: 768px) {
      .container {
        padding: var(--spacing-sm);
      }

      .token-section {
        padding: var(--spacing-sm);
      }

      .token-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
`;
const generateDocs = (tokens) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Design System Documentation</title>
      ${generateStyles()}
    </head>
    <body>
      <div class="container">
        <header class="header">
          <h1>Design System Documentation</h1>
          <p>A comprehensive guide to your design tokens, including colors, spacing, and their corresponding utility classes.</p>
        </header>
        ${Object.entries(tokens)
        .filter(([key]) => key !== "__settings")
        .map(([name, value]) => generateTokenSection(name, value, tokens[name]?.__settings))
        .join("")}
      </div>
    </body>
    </html>
  `;
    return {
        DOCUMENTATION: [html],
    };
};
exports.generateDocs = generateDocs;
