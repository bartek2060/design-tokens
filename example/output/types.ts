export interface ColorsPrimary {
  "main": "#1976d2";
  "light": "#42a5f5";
  "dark": "#1565c0";
}

export interface ColorsText {
  "primary": "#000000";
  "secondary": "#666666";
}

export interface Colors {
  "primary": ColorsPrimary;
  "text": ColorsText;
}

export interface Spacing {
  "small": "0.5rem";
  "medium": "1rem";
  "large": "2rem";
}

export interface Breakpoints {
  "mobile": "320px";
  "tablet": "768px";
  "desktop": "1024px";
}

export interface TypographyFontFamily {
  "primary": "Arial, sans-serif";
  "secondary": "Georgia, serif";
}

export interface TypographyFontSize {
  "small": "0.875rem";
  "medium": "1rem";
  "large": "1.25rem";
}

export interface Typography {
  "fontFamily": TypographyFontFamily;
  "fontSize": TypographyFontSize;
}

export interface DesignTokens {
  "colors": Colors;
  "spacing": Spacing;
  "breakpoints": Breakpoints;
  "typography": Typography;
}
