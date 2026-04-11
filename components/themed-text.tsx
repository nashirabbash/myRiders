import { Platform, StyleSheet, Text, type TextProps } from "react-native";

import { Colors, Fonts, Typography, type ThemeColor, type TypographyVariant } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export type ThemedTextType =
  | "default"
  | "defaultSemiBold"
  | "title"
  | "small"
  | "smallBold"
  | "subtitle"
  | "link"
  | "linkPrimary"
  | "code";

export type ThemedTextProps = TextProps & {
  type?: ThemedTextType;
  themeColor?: ThemeColor;
};

/**
 * Maps text type variants to HIG typography styles.
 * Each mapping includes the typography style name and variant (regular, bold, etc).
 */
const typeToTypography: Record<
  ThemedTextType,
  { style: keyof typeof Typography; variant: TypographyVariant }
> = {
  default: { style: "body", variant: "regular" },
  defaultSemiBold: { style: "body", variant: "bold" },
  title: { style: "title1", variant: "bold" },
  small: { style: "footnote", variant: "regular" },
  smallBold: { style: "footnote", variant: "bold" },
  subtitle: { style: "title2", variant: "bold" },
  link: { style: "footnote", variant: "regular" },
  linkPrimary: { style: "footnote", variant: "regular" },
  code: { style: "caption1", variant: "regular" },
};

/**
 * Returns the semantic color for a given text type and theme mode.
 * Most types use the primary label color; only linkPrimary uses accent color.
 * Regular link maintains the default label color for backward compatibility.
 */
const getColorForType = (
  type: ThemedTextType,
  colorScheme: "light" | "dark",
  themeColor?: ThemeColor,
): string => {
  // If explicit themeColor is provided, use it (for backward compatibility)
  if (themeColor) {
    const colorMap = colorScheme === "light" ? Colors.light : Colors.dark;
    return colorMap[themeColor];
  }

  // Map types to semantic colors
  const colorMap = colorScheme === "light" ? Colors.light : Colors.dark;

  switch (type) {
    case "linkPrimary":
      return colorMap.accent;
    default:
      return colorMap.label;
  }
};

export function ThemedText({
  style,
  type = "default",
  themeColor,
  ...rest
}: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // Get typography tokens for this type
  const { style: typographyStyle, variant } = typeToTypography[type];
  const typographyTokens = Typography[typographyStyle][variant];

  // Get semantic color
  const textColor = getColorForType(type, isDarkMode ? "dark" : "light", themeColor);

  return (
    <Text
      style={[
        // Apply typography tokens as base
        {
          fontSize: typographyTokens.fontSize,
          lineHeight: typographyTokens.lineHeight,
          fontWeight: typographyTokens.fontWeight,
          letterSpacing: typographyTokens.letterSpacing,
          fontFamily: typographyTokens.fontFamily,
        },
        // Override fontSize/lineHeight for custom large title (48px) for backward compatibility
        // but keep fontFamily, fontWeight, letterSpacing from tokens
        type === "title" && styles.customTitle,
        // Handle special cases
        type === "code" && styles.code,
        // Color
        { color: textColor },
        // User-provided styles override
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  /**
   * Custom large title (48px) that exceeds HIG typography scale.
   * Overrides only fontSize and lineHeight for backward compatibility.
   * fontFamily, fontWeight, and letterSpacing are inherited from Typography.title1.bold.
   */
  customTitle: {
    fontSize: 48,
    lineHeight: 52,
  },
  /**
   * Code style with monospace font.
   * Uses caption1 size (12px) as base with monospace font family.
   */
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: "700" }) ?? "500",
  },
});
