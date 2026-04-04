/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#000000",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
    accent: "#0E7C7B",
    accentText: "#ffffff",
    border: "#D1D5DB",
  },
  dark: {
    text: "#ffffff",
    background: "#000000",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    textSecondary: "#B0B4BA",
    accent: "#14A39E",
    accentText: "#ffffff",
    border: "#3A3A3C",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

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

// Platform-specific font families
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

// Apple HIG Typography Scale
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

// HIG Label Colors (for text hierarchy)
export const LabelColors = {
  light: {
    label: "#000000",
    secondaryLabel: "#3C3C4399",
    tertiaryLabel: "#3C3C434D",
    quaternaryLabel: "#3C3C432E",
  },
  dark: {
    label: "#FFFFFF",
    secondaryLabel: "#EBEBF599",
    tertiaryLabel: "#EBEBF54D",
    quaternaryLabel: "#EBEBF52E",
  },
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
