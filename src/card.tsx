import { LinearGradient } from "expo-linear-gradient";
import { StyleProp, View, ViewStyle } from "react-native";
import { T } from "./ui";
import { c } from "./theme";

const THEMES = {
  black: { g: ["#161616", "#050505"] as const, fg: c.white, sub: "#BDBDBD", sheen: "rgba(255,255,255,0.07)" },
  graphite: { g: ["#6B6B6B", "#4A4A4A"] as const, fg: c.white, sub: "#E0E0E0", sheen: "rgba(255,255,255,0.10)" },
  silver: { g: ["#F4F4F4", "#CFCFCF"] as const, fg: c.ink, sub: "#555", sheen: "rgba(255,255,255,0.45)" },
};
export type CardTheme = keyof typeof THEMES;

export function CardVisual({ theme, label, value, last4, name, brand, height = 180, style, small }: {
  theme: CardTheme; label: string; value: string; last4?: string; name?: string; brand?: string;
  height?: number; style?: StyleProp<ViewStyle>; small?: boolean;
}) {
  const t = THEMES[theme];
  return (
    <LinearGradient colors={t.g} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[{ borderRadius: 24, height, padding: 24, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }, style]}>
      <View style={{ position: "absolute", right: -60, top: -80, width: 260, height: 260, backgroundColor: t.sheen, transform: [{ rotate: "35deg" }] }} />
      <T style={{ color: t.sub, fontSize: 13 }}>{label}</T>
      <T s="s" style={{ color: t.fg, fontSize: small ? 26 : 30, letterSpacing: -0.6, marginTop: 4 }}>{value}</T>
      <View style={{ position: "absolute", right: 24, top: 22, flexDirection: "row" }}>
        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: theme === "silver" ? "#3A3A3A" : "#E8E8E8" }} />
        <View style={{ width: 30, height: 30, borderRadius: 15, marginLeft: -12, backgroundColor: theme === "silver" ? "#8A8A8A" : "#9A9A9A", opacity: 0.9 }} />
      </View>
      <View style={{ position: "absolute", right: 24, top: 78, width: 44, height: 32, borderRadius: 8, backgroundColor: "#E3C56B" }} />
      {last4 && (
        <View style={{ position: "absolute", left: 24, bottom: 22 }}>
          <T s="m" style={{ color: t.fg, fontSize: 15 }}>•••• {last4}</T>
          {name && <T style={{ color: t.sub, fontSize: 13, marginTop: 2 }}>{name}</T>}
        </View>
      )}
      {brand && <T s="b" style={{ position: "absolute", right: 24, bottom: 22, color: t.fg, fontSize: 18, letterSpacing: -0.3 }}>{brand}</T>}
    </LinearGradient>
  );
}
