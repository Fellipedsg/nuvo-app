import { ReactNode } from "react";
import { Pressable, StyleProp, Text, TextProps, TextStyle, View, ViewStyle } from "react-native";
import {
  ArrowDownLeft, ArrowLeftRight, Calendar, CreditCard, Car, ChevronLeft, ChevronRight, Gamepad2,
  HeartPulse, House, ShoppingBag, Tags, Tv, Utensils, Wifi, Zap, X, Plus, ChartPie, User, Check,
  type LucideIcon,
} from "lucide-react-native";
import { banks, c, catMeta, f, signed, Tx } from "./theme";

const ICONS: Record<string, LucideIcon> = {
  house: House, utensils: Utensils, car: Car, "shopping-bag": ShoppingBag, "gamepad-2": Gamepad2,
  "heart-pulse": HeartPulse, tv: Tv, "arrow-down-left": ArrowDownLeft, tags: Tags,
  "credit-card": CreditCard, zap: Zap, wifi: Wifi,
};
export const iconFor = (name: string) => ICONS[name] ?? Tags;

export function T({ s, children, style, lines, ...rest }: TextProps & { s?: "r" | "m" | "s" | "b"; children: ReactNode; style?: StyleProp<TextStyle>; lines?: number }) {
  return <Text {...rest} numberOfLines={lines} style={[{ fontFamily: f[s ?? "r"], color: c.ink, fontSize: 14 }, style]}>{children}</Text>;
}

export function CircleBtn({ icon: I, onPress, dot, size = 44 }: { icon: LucideIcon; onPress?: () => void; dot?: boolean; size?: number }) {
  return (
    <Pressable onPress={onPress} style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 1, borderColor: c.line, backgroundColor: c.white, alignItems: "center", justifyContent: "center" }}>
      <I size={20} strokeWidth={1.75} color={c.ink} />
      {dot && <View style={{ position: "absolute", top: 9, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: c.negative, borderWidth: 1.5, borderColor: c.white }} />}
    </Pressable>
  );
}
export const Back = ({ onPress }: { onPress: () => void }) => <CircleBtn icon={ChevronLeft} onPress={onPress} />;
export const Close = ({ onPress }: { onPress: () => void }) => <CircleBtn icon={X} onPress={onPress} />;
export const AddBtn = ({ onPress }: { onPress?: () => void }) => <CircleBtn icon={Plus} onPress={onPress} />;

export function Button({ label, onPress, variant = "dark", icon: I, style }: { label: string; onPress?: () => void; variant?: "dark" | "light" | "outline" | "ghost"; icon?: LucideIcon; style?: StyleProp<ViewStyle> }) {
  const bg = { dark: c.ink, light: c.white, outline: c.white, ghost: "#1F1F1F" }[variant];
  const fg = variant === "dark" || variant === "ghost" ? c.white : c.ink;
  return (
    <Pressable onPress={onPress} style={[{ height: 56, borderRadius: 999, backgroundColor: bg, borderWidth: variant === "outline" ? 1 : 0, borderColor: c.gray, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, style]}>
      {I && <I size={18} strokeWidth={1.75} color={fg} />}
      <T s="s" style={{ color: fg, fontSize: 16 }}>{label}</T>
    </Pressable>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <T s="s" style={{ fontSize: 18 }}>{title}</T>
      {action && <Pressable onPress={onAction}><T s="m" style={{ color: c.muted }}>{action}</T></Pressable>}
    </View>
  );
}

export function BankLogo({ k, size = 36 }: { k: string; size?: number }) {
  const b = banks[k.toLowerCase()] ?? { i: k.slice(0, 2), bg: c.ink };
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: b.bg, alignItems: "center", justifyContent: "center" }}>
      <T s="b" style={{ color: (b as { fg?: string }).fg ?? c.white, fontSize: size * 0.36 }}>{b.i}</T>
    </View>
  );
}

export function TxRow({ t }: { t: Tx }) {
  const meta = catMeta[t.cat];
  const income = t.v > 0;
  const Icon = iconFor(meta.ic);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: income ? c.ink : c.bg, alignItems: "center", justifyContent: "center" }}>
        <Icon size={20} strokeWidth={1.75} color={income ? c.white : c.ink} />
      </View>
      <View style={{ flex: 1 }}>
        <T s="m" lines={1} style={{ fontSize: 16 }}>{t.d}</T>
        <T style={{ color: c.muted, fontSize: 13, marginTop: 2 }}>{meta.n} · {t.date}</T>
      </View>
      <T s="s" style={{ fontSize: 16, color: income ? c.positive : c.ink }}>{signed(t.v)}</T>
    </View>
  );
}

export type Tab = "home" | "analysis" | "agenda" | "profile";
const TABS: { k: Tab; label: string; icon: LucideIcon }[] = [
  { k: "home", label: "Início", icon: House }, { k: "analysis", label: "Análise", icon: ChartPie },
  { k: "agenda", label: "Agenda", icon: Calendar }, { k: "profile", label: "Perfil", icon: User },
];
export function TabBar({ active, onTab, onAdd, bottom }: { active?: Tab; onTab: (t: Tab) => void; onAdd: () => void; bottom: number }) {
  const item = (t: (typeof TABS)[number]) => {
    const on = t.k === active;
    return (
      <Pressable key={t.k} onPress={() => onTab(t.k)} style={{ flex: 1, alignItems: "center", gap: 4, paddingTop: 12 }}>
        <t.icon size={24} strokeWidth={1.75} color={on ? c.ink : c.gray} />
        <T s={on ? "s" : "m"} style={{ fontSize: 11, color: on ? c.ink : c.gray }}>{t.label}</T>
      </Pressable>
    );
  };
  return (
    <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 64 + bottom, paddingBottom: bottom, backgroundColor: c.white, borderTopWidth: 1, borderTopColor: c.line, flexDirection: "row" }}>
      {item(TABS[0])}{item(TABS[1])}
      <View style={{ flex: 1 }} />
      {item(TABS[2])}{item(TABS[3])}
      <Pressable onPress={onAdd} style={{ position: "absolute", alignSelf: "center", left: "50%", marginLeft: -28, top: -18, width: 56, height: 56, borderRadius: 28, backgroundColor: c.ink, alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: c.white }}>
        <Plus size={26} strokeWidth={2} color={c.white} />
      </Pressable>
    </View>
  );
}

export { ChevronLeft, ChevronRight, ArrowLeftRight, Check };
