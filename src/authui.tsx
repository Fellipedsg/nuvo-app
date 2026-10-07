import { ReactNode, useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, TextInput, TextInputProps, View } from "react-native";
import Svg, { Ellipse, Path } from "react-native-svg";
import { Check, Delete, Eye, EyeOff, ScanFace, TimerReset, X, type LucideIcon } from "lucide-react-native";
import { Back, T } from "./ui";
import { auth as api, SHOW_DEV } from "./api";
import { c, f } from "./theme";
import { PW_LABELS, pwChecks, pwScore } from "./validate";

export function StepHeader({ step, total = 4, onBack }: { step: number; total?: number; onBack?: () => void }) {
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        {onBack ? <Back onPress={onBack} /> : <View style={{ width: 44 }} />}
        <T style={{ color: c.muted }}>Passo {step} de {total}</T>
      </View>
      <View style={{ flexDirection: "row", gap: 4, marginTop: 16 }}>
        {Array.from({ length: total }, (_, i) => <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < step ? c.ink : c.line }} />)}
      </View>
    </View>
  );
}

export function Field({ label, icon: I, error, secure, ...rest }: { label: string; icon: LucideIcon; error?: string; secure?: boolean } & TextInputProps) {
  const [focus, setFocus] = useState(false);
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginTop: 14 }}>
      <T s="m" style={{ color: c.muted, fontSize: 13, marginBottom: 8 }}>{label}</T>
      <View style={{ height: 56, borderRadius: 16, backgroundColor: c.bg, borderWidth: focus || error ? 1.5 : 0, borderColor: error ? c.negative : c.ink, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 12 }}>
        <I size={20} strokeWidth={1.75} color={c.muted} />
        <TextInput {...rest} secureTextEntry={secure && !show} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} placeholderTextColor={c.subtle}
          style={{ flex: 1, fontFamily: f.m, fontSize: 16, color: c.ink }} />
        {secure && <Pressable onPress={() => setShow(!show)} hitSlop={10}>{show ? <EyeOff size={20} strokeWidth={1.75} color={c.muted} /> : <Eye size={20} strokeWidth={1.75} color={c.muted} />}</Pressable>}
      </View>
      {error ? <T style={{ color: c.negative, fontSize: 12, marginTop: 6 }}>{error}</T> : null}
    </View>
  );
}

/** Shows the digits typed on `NumericKeypad`; caret on the active box, red + shake on error. */
export function OtpInput({ length = 6, value, error, loading }: { length?: number; value: string; error?: boolean; loading?: boolean }) {
  const shake = useShake(error);
  return (
    <Animated.View style={{ flexDirection: "row", justifyContent: "space-between", transform: [{ translateX: shake }] }} accessibilityLabel={`Código de ${length} dígitos, ${value.length} digitados`}>
      {Array.from({ length }, (_, i) => {
        const active = i === value.length && !error;
        return (
          <View key={i} accessibilityLabel={`Dígito ${i + 1}`} style={{ width: 48, height: 58, borderRadius: 14, alignItems: "center", justifyContent: "center",
            backgroundColor: error ? c.negativeBg : i > value.length ? c.bg : c.white, borderWidth: active ? 1.5 : 1,
            borderColor: error ? c.negative : active ? c.ink : i < value.length ? c.gray : "transparent" }}>
            {value[i] ? <T s="m" style={{ fontSize: 24, color: error ? c.negative : c.ink }}>{value[i]}</T> : active ? <View style={{ width: 2, height: 26, backgroundColor: loading ? "transparent" : c.ink }} /> : null}
          </View>
        );
      })}
    </Animated.View>
  );
}

function useShake(trigger?: boolean) {
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!trigger) return;
    Animated.sequence([10, -10, 8, -8, 4, 0].map((v) => Animated.timing(x, { toValue: v, duration: 50, easing: Easing.linear, useNativeDriver: true }))).start();
  }, [trigger, x]);
  return x;
}

export function PinDots({ length = 6, filled, error }: { length?: number; filled: number; error?: boolean }) {
  const shake = useShake(error);
  return (
    <Animated.View style={{ flexDirection: "row", justifyContent: "center", gap: 18, transform: [{ translateX: shake }] }} accessibilityLabel={`${filled} de ${length} dígitos`}>
      {Array.from({ length }, (_, i) => (
        <View key={i} style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: i < filled ? (error ? c.negative : c.ink) : "transparent", borderWidth: 1.5, borderColor: i < filled ? (error ? c.negative : c.ink) : error ? c.negative : c.gray }} />
      ))}
    </Animated.View>
  );
}

export function NumericKeypad({ onKey, onDelete, leftAction, onLeft, disabled }: { onKey: (d: string) => void; onDelete: () => void; leftAction?: "biometric"; onLeft?: () => void; disabled?: boolean }) {
  const key = (label: string, onPress: () => void, node?: ReactNode) => (
    <Pressable key={label} disabled={disabled} onPress={onPress} accessibilityRole="button" accessibilityLabel={label === "del" ? "Apagar" : label}
      style={({ pressed }) => ({ flex: 1, height: 58, borderRadius: 16, backgroundColor: pressed ? c.bg2 : c.bg, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.5 : 1 })}>
      {node ?? <T s="m" style={{ fontSize: 26 }}>{label}</T>}
    </Pressable>
  );
  const blank = <View key="blank" style={{ flex: 1 }} />;
  const rows = [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"]];
  return (
    <View style={{ gap: 8, paddingHorizontal: 4 }}>
      {rows.map((r) => <View key={r[0]} style={{ flexDirection: "row", gap: 8 }}>{r.map((d) => key(d, () => onKey(d)))}</View>)}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {leftAction === "biometric" ? key("Face ID", () => onLeft?.(), <ScanFace size={26} strokeWidth={1.75} color={c.ink} />) : blank}
        {key("0", () => onKey("0"))}
        {key("del", onDelete, <Delete size={24} strokeWidth={1.75} color={c.ink} />)}
      </View>
    </View>
  );
}

export function PasswordStrength({ password }: { password: string }) {
  const s = pwScore(password);
  const col = s <= 1 ? c.negative : s === 2 ? c.warning : c.positive;
  return (
    <View style={{ marginTop: 10 }}>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {[1, 2, 3, 4].map((i) => <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= s ? col : c.line }} />)}
      </View>
      <T style={{ color: c.muted, fontSize: 12, marginTop: 8 }}>Força da senha:  <T s="s" style={{ color: col, fontSize: 12 }}>{PW_LABELS[s]}</T></T>
    </View>
  );
}

export function RequirementList({ title, checks }: { title: string; checks: { label: string; ok: boolean }[] }) {
  return (
    <View style={{ backgroundColor: c.bg, borderRadius: 20, padding: 18, marginTop: 18, gap: 12 }}>
      <T s="s" style={{ fontSize: 13 }}>{title}</T>
      {checks.map((k) => (
        <View key={k.label} style={{ flexDirection: "row", alignItems: "center", gap: 10 }} accessibilityLabel={`${k.label}: ${k.ok ? "atendido" : "pendente"}`}>
          <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: k.ok ? c.positiveBg : "transparent", alignItems: "center", justifyContent: "center" }}>
            {k.ok ? <Check size={12} strokeWidth={3} color={c.positive} /> : <X size={12} strokeWidth={2.5} color={c.subtle} />}
          </View>
          <T style={{ fontSize: 13, color: k.ok ? c.ink : c.muted }}>{k.label}</T>
        </View>
      ))}
    </View>
  );
}
export const passwordRequirements = pwChecks;

export function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <Pressable onPress={() => onChange(!checked)} accessibilityRole="checkbox" accessibilityState={{ checked }} style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
      <View style={{ width: 22, height: 22, borderRadius: 7, backgroundColor: checked ? c.ink : c.white, borderWidth: checked ? 0 : 1.5, borderColor: c.gray, alignItems: "center", justifyContent: "center", marginTop: 1 }}>
        {checked && <Check size={14} strokeWidth={3} color={c.white} />}
      </View>
      <T style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>{children}</T>
    </Pressable>
  );
}

export function HeroIcon({ icon: I, tone = "neutral", size = 76 }: { icon: LucideIcon; tone?: "neutral" | "negative" | "positive"; size?: number }) {
  const core = tone === "negative" ? c.negative : tone === "positive" ? c.positive : c.ink;
  const halo = tone === "negative" ? c.negativeBg : tone === "positive" ? c.positiveBg : c.bg;
  return (
    <View style={{ width: size * 1.58, height: size * 1.58, borderRadius: size, backgroundColor: halo, alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: core, alignItems: "center", justifyContent: "center" }}>
        <I size={size * 0.42} strokeWidth={1.75} color={c.white} />
      </View>
    </View>
  );
}

export function SuccessMark({ size = 96 }: { size?: number }) {
  const scale = useRef(new Animated.Value(0.6)).current;
  useEffect(() => { Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start(); }, [scale]);
  return (
    <Animated.View style={{ transform: [{ scale }], width: size * 1.7, height: size * 1.7, borderRadius: size, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: size * 1.3, height: size * 1.3, borderRadius: size, backgroundColor: c.bg2, alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c.ink, alignItems: "center", justifyContent: "center" }}><Check size={size * 0.46} strokeWidth={2.5} color={c.white} /></View>
      </View>
    </Animated.View>
  );
}

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
export function CountdownText({ seconds, restartKey, onEnd, render }: { seconds: number; restartKey?: unknown; onEnd?: () => void; render: (t: string, done: boolean) => ReactNode }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    setLeft(seconds);
    const end = Date.now() + seconds * 1000;
    const id = setInterval(() => {
      const l = Math.max(0, Math.round((end - Date.now()) / 1000));
      setLeft(l);
      if (l === 0) { clearInterval(id); onEnd?.(); }
    }, 500);
    return () => clearInterval(id);
  }, [seconds, restartKey]); // eslint-disable-line react-hooks/exhaustive-deps
  return <>{render(mmss(left), left === 0)}</>;
}

/** Dev-only: shows the code the mock e-mail/SMS sender just "sent". Never rendered in production builds. */
export function DevCode({ target, tick }: { target: string; tick?: unknown }) {
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => {
    if (!SHOW_DEV) return;
    let alive = true;
    const t = setTimeout(() => api.devCode(target).then((r) => alive && setCode(r.code)).catch(() => {}), 400);
    return () => { alive = false; clearTimeout(t); };
  }, [target, tick]);
  if (!SHOW_DEV || !code) return null;
  return (
    <View style={{ alignSelf: "center", backgroundColor: c.warningBg, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, marginTop: 14 }}>
      <T s="m" style={{ color: c.warning, fontSize: 12 }}>dev · código enviado: {code}</T>
    </View>
  );
}

export const ResendRow = ({ left, done, onResend }: { left: string; done: boolean; onResend: () => void }) => (
  <Pressable disabled={!done} onPress={onResend} style={{ flexDirection: "row", alignSelf: "center", alignItems: "center", gap: 8, marginTop: 22 }}>
    <TimerReset size={16} strokeWidth={1.75} color={c.muted} />
    <T style={{ color: done ? c.ink : c.muted, fontSize: 14 }} >{done ? "Reenviar código" : `Reenviar código em ${left}`}</T>
  </Pressable>
);

export function FaceIllustration({ w = 250, h = 340 }: { w?: number; h?: number }) {
  return (
    <Svg width={w} height={h} viewBox="0 0 250 340">
      <Path d="M20 340 C20 280 70 262 125 262 C180 262 230 280 230 340 Z" fill="#3c3c3c" />
      <Path d="M95 250 L155 250 L155 290 L95 290 Z" fill="#7b7b7b" />
      <Ellipse cx="125" cy="115" rx="102" ry="125" fill="#2a2a2a" />
      <Ellipse cx="125" cy="150" rx="68" ry="88" fill="#8f8f8f" />
      <Ellipse cx="100" cy="140" rx="9" ry="6" fill="#2b2b2b" />
      <Ellipse cx="152" cy="140" rx="9" ry="6" fill="#2b2b2b" />
      <Path d="M104 188 Q125 202 146 188" stroke="#3a3a3a" strokeWidth="4" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/** Oval progress ring. `progress` 0..1; `tone` colors the stroke. Starts at 12 o'clock, clockwise. */
export function OvalRing({ w, h, progress, tone = "white" }: { w: number; h: number; progress: number; tone?: "white" | "green" }) {
  const rx = w / 2 - 4, ry = h / 2 - 4, cx = w / 2, cy = h / 2;
  const per = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry))); // Ramanujan approximation
  const col = tone === "green" ? "#4ADE80" : "#FFFFFF";
  const d = `M ${cx} ${cy - ry} A ${rx} ${ry} 0 1 1 ${cx} ${cy + ry} A ${rx} ${ry} 0 1 1 ${cx} ${cy - ry}`;
  return (
    <Svg width={w} height={h} style={{ position: "absolute" }}>
      <Path d={d} stroke="rgba(255,255,255,0.35)" strokeWidth={4} fill="none" />
      <Path d={d} stroke={col} strokeWidth={5} fill="none" strokeLinecap="round" strokeDasharray={`${per * progress} ${per}`} />
    </Svg>
  );
}
