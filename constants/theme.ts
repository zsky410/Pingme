/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#6D5FFD";
const tintColorDark = "#8B7FFF";

export const Colors = {
  light: {
    text: "#000000",
    background: "#FFFFFF",
    tint: tintColorLight,
    icon: "#9E9E9E",
    tabIconDefault: "#9E9E9E",
    tabIconSelected: tintColorLight,
    primary: "#6D5FFD",
    secondary: "#757575",
    border: "#F0F0F0",
    messageBubbleMine: "#6D5FFD",
    messageBubbleTheirs: "#F0F0F0",
    success: "#4CAF50",
    error: "#F44336",
  },
  dark: {
    text: "#FFFFFF",
    background: "#1A1A1A",
    tint: tintColorDark,
    icon: "#BDBDBD",
    tabIconDefault: "#9E9E9E",
    tabIconSelected: tintColorDark,
    primary: "#8B7FFF",
    secondary: "#BDBDBD",
    border: "#2A2A2A",
    messageBubbleMine: "#8B7FFF",
    messageBubbleTheirs: "#2A2A2A",
    success: "#66BB6A",
    error: "#EF5350",
  },
};

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
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
