/**
 * TrackRide Design System — Apple Human Interface Guidelines (HIG)
 *
 * This is the single source of truth for all design tokens used in the app.
 * Organized into semantic roles to ensure consistent, accessible design across light and dark modes.
 *
 * References:
 * - Apple HIG: https://developer.apple.com/design/human-interface-guidelines
 * - Color Semantics: https://developer.apple.com/design/human-interface-guidelines/color
 * - Typography Scale: https://developer.apple.com/design/human-interface-guidelines/typography
 */

import { Platform } from "react-native";

// ============================================================================
// COLOR TOKENS
// ============================================================================

/**
 * Semantic color roles based on HIG principles.
 * All colors include light and dark mode variants for consistent accessibility.
 *
 * Role definitions:
 * - label: Primary text, highest contrast
 * - secondaryLabel: Secondary text, slightly reduced contrast
 * - tertiaryLabel: Tertiary text, further reduced contrast
 * - quaternaryLabel: Placeholder or disabled text, lowest contrast
 * - background: App background
 * - surface: Card, sheet, modal backgrounds
 * - surfaceSecondary: Secondary surface (grouped cells, etc)
 * - separator: Dividers and borders
 * - accent: Interactive elements (buttons, links, highlights)
 * - accentText: Text on accent backgrounds
 */
export const Colors = {
  light: {
    // Text hierarchy (from HIG Label Colors)
    label: "#000000",
    secondaryLabel: "#3C3C4399",
    tertiaryLabel: "#3C3C434D",
    quaternaryLabel: "#3C3C432E",

    // Surface roles
    background: "#ffffff",
    surface: "#F0F0F3",
    surfaceSecondary: "#E0E1E6",

    // Interactive
    separator: "#D1D5DB",
    accent: "#0E7C7B",
    accentText: "#ffffff",

    // Feedback (for future use)
    success: "#34C759",
    warning: "#FF9500",
    danger: "#FF3B30",

    // Backward compatibility aliases (deprecated, use semantic names above)
    text: "#000000",
    textSecondary: "#60646C",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    border: "#D1D5DB",
    icon: "#000000", // Icon color (same as label)
  },
  dark: {
    // Text hierarchy (from HIG Label Colors)
    label: "#FFFFFF",
    secondaryLabel: "#EBEBF599",
    tertiaryLabel: "#EBEBF54D",
    quaternaryLabel: "#EBEBF52E",

    // Surface roles
    background: "#000000",
    surface: "#212225",
    surfaceSecondary: "#2E3135",

    // Interactive
    separator: "#3A3A3C",
    accent: "#14A39E",
    accentText: "#ffffff",

    // Feedback (for future use)
    success: "#30B0C0",
    warning: "#FF9500",
    danger: "#FF453A",

    // Backward compatibility aliases (deprecated, use semantic names above)
    text: "#ffffff",
    textSecondary: "#B0B4BA",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    border: "#3A3A3C",
    icon: "#FFFFFF", // Icon color (same as label)
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type ThemeMode = keyof typeof Colors;

/**
 * Legacy export for backward compatibility.
 * @deprecated Use Colors.light[colorKey] or Colors.dark[colorKey] directly
 */
export const LabelColors = {
  light: {
    label: Colors.light.label,
    secondaryLabel: Colors.light.secondaryLabel,
    tertiaryLabel: Colors.light.tertiaryLabel,
    quaternaryLabel: Colors.light.quaternaryLabel,
  },
  dark: {
    label: Colors.dark.label,
    secondaryLabel: Colors.dark.secondaryLabel,
    tertiaryLabel: Colors.dark.tertiaryLabel,
    quaternaryLabel: Colors.dark.quaternaryLabel,
  },
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

const isIOS = Platform.OS === "ios";

const FontFamily = {
  regular: isIOS ? "System" : "Roboto",
  medium: isIOS ? "System" : "Roboto",
  semibold: isIOS ? "System" : "Roboto",
  bold: isIOS ? "System" : "Roboto",
  italic: isIOS ? "System" : "Roboto",
  boldItalic: isIOS ? "System" : "Roboto",
} as const;

type TextVariant = {
  fontSize: number;
  lineHeight: number;
  fontWeight: "400" | "500" | "600" | "700";
  letterSpacing: number;
  fontFamily: string;
  fontStyle?: "normal" | "italic";
};

type TextStyle = {
  regular: TextVariant;
  bold: TextVariant;
  italic: TextVariant;
  boldItalic: TextVariant;
};

const createStyle = (
  fontSize: number,
  lineHeight: number,
  letterSpacing: number,
  regularWeight: "400" | "500" | "600" | "700" = "400",
  boldWeight: "400" | "500" | "600" | "700" = "700",
): TextStyle => ({
  regular: {
    fontSize,
    lineHeight,
    fontWeight: regularWeight,
    letterSpacing,
    fontFamily: FontFamily.regular,
    fontStyle: "normal",
  },
  bold: {
    fontSize,
    lineHeight,
    fontWeight: boldWeight,
    letterSpacing,
    fontFamily: FontFamily.bold,
    fontStyle: "normal",
  },
  italic: {
    fontSize,
    lineHeight,
    fontWeight: regularWeight,
    letterSpacing,
    fontFamily: FontFamily.italic,
    fontStyle: "italic",
  },
  boldItalic: {
    fontSize,
    lineHeight,
    fontWeight: boldWeight,
    letterSpacing,
    fontFamily: FontFamily.boldItalic,
    fontStyle: "italic",
  },
});

/**
 * Typography scale based on Apple HIG.
 * Each style includes variants: regular, bold, italic, boldItalic
 *
 * Reference: https://developer.apple.com/design/human-interface-guidelines/typography
 */
export const Typography = {
  largeTitle: createStyle(34, 41, 0.37, "400", "700"),
  title1: createStyle(28, 34, 0.36, "400", "700"),
  title2: createStyle(22, 28, 0.35, "400", "700"),
  title3: createStyle(20, 25, 0.38, "400", "600"),
  headline: createStyle(17, 22, -0.41, "600", "700"),
  body: createStyle(17, 22, -0.41, "400", "700"),
  callout: createStyle(16, 21, -0.32, "400", "700"),
  subheadline: createStyle(15, 20, -0.24, "400", "700"),
  footnote: createStyle(13, 18, -0.08, "400", "700"),
  caption1: createStyle(12, 16, 0, "400", "700"),
  caption2: createStyle(11, 13, 0.07, "400", "700"),
} as const;

export type TypographyStyle = keyof typeof Typography;
export type TypographyVariant = keyof TextStyle;

// ============================================================================
// SPACING TOKENS
// ============================================================================

/**
 * 8-point spacing system for consistent, scalable layouts.
 * Use these for padding, margin, and gaps throughout the app.
 */
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export type SpacingToken = keyof typeof Spacing;

// ============================================================================
// RADIUS TOKENS
// ============================================================================

/**
 * Corner radius values for components and surfaces.
 * Follows HIG principles: larger radius for larger surfaces, smaller for details.
 */
export const Radius = {
  none: 0,
  small: 4,
  medium: 8,
  large: 12,
  extraLarge: 16,
  full: 9999, // For pills and circles
} as const;

export type RadiusToken = keyof typeof Radius;

// ============================================================================
// BORDER TOKENS
// ============================================================================

/**
 * Border width values for dividers, outlines, and emphasis.
 */
export const BorderWidth = {
  hairline: 0.5,
  thin: 1,
  medium: 2,
} as const;

export type BorderWidthToken = keyof typeof BorderWidth;

// ============================================================================
// LAYOUT TOKENS
// ============================================================================

/**
 * Layout constraints and insets for screen-level styling.
 * Helps establish consistent container widths and safe areas.
 */
export const Layout = {
  maxContentWidth: 800,
  screenEdgePadding: Spacing.three, // 16pt
  bottomTabInset: Platform.select({ ios: 50, android: 80 }) ?? 0,
  bottomTabHeight: 56,
} as const;

// ============================================================================
// LEGACY EXPORTS (Backward Compatibility)
// ============================================================================

/**
 * @deprecated Use Layout.bottomTabInset instead
 */
export const BottomTabInset = Layout.bottomTabInset;

/**
 * @deprecated Use Layout.maxContentWidth instead
 */
export const MaxContentWidth = Layout.maxContentWidth;
