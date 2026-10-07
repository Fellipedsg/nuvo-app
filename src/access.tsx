import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Easing, Linking, Pressable, ScrollView, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import Svg, { Circle as SvgCircle, Path } from "react-native-svg";
import { Headphones, Lock, Mail, MailCheck, MessageSquare, MonitorSmartphone, ScanFace, ShieldCheck, Smartphone, KeyRound, Eye, CircleCheck } from "lucide-react-native";
import { Back, Button, Close, T } from "./ui";
import { CountdownText, Field, HeroIcon, NumericKeypad, PasswordStrength, PinDots, RequirementList, SuccessMark } from "./authui";
import { OtpScreen } from "./signup";
import { auth, setToken, SHOW_DEV } from "./api";
import { flow, notify, forgetAccount, getDevice, Remembered } from "./session";
import { Ctx } from "./flowtypes";
import { c, f } from "./theme";
import { isValidCpf, isValidEmail, maskEmail, pwChecks, pwScore, pinError } from "./validate";

const Avatar = ({ initials, size }: { initials: string; size: number }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c.ink, alignItems: "center", justifyContent: "center" }}><T s="s" style={{ color: c.white, fontSize: size * 0.36 }}>{initials}</T></View>
);

export function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 1200); return () => clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <LinearGradient colors={["#262626", "#0A0A0A", "#050505"]} style={{ flex: 1, alignItems: "center" }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <View style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: c.white, alignItems: "center", justifyContent: "center" }}><T s="b" style={{ fontSize: 40, color: c.ink }}>n</T></View>
          <T s="b" style={{ color: c.white, fontSize: 48, letterSpacing: -1.5 }}>nuvo</T>
        </View>
        <T style={{ color: "#A9A9A9", fontSize: 14, marginTop: 14 }}>Suas finanças, num só lugar.</T>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingBottom: 48 }}>
        <ShieldCheck size={15} strokeWidth={1.75} color="#A9A9A9" /><T style={{ color: "#A9A9A9", fontSize: 12 }}>Open Finance Brasil · Dados protegidos</T>
      </View>
    </LinearGradient>
  );
}

export function Login({ ctx, canFace }: { ctx: Ctx; canFace: boolean }) {
  const [email, setEmail] = useState(SHOW_DEV ? "felipe@email.com" : "");
  const [pass, setPass] = useState(SHOW_DEV ? "senha12345" : "");
  const [focus, setFocus] = useState<"e" | "p">("e");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = async () => {
    if (busy) return;
    setBusy(true); setErr("");
    const e = email.trim().toLowerCase();
    try {
      const r = await auth.login(e, pass, await getDevice());
      flow.email = e;
      if ("require2fa" in r) {
        flow.challenge = r.challengeToken; flow.phoneMasked = r.phoneMasked; flow.deviceName = r.deviceName;
        ctx.go("twoFactor");
      } else await ctx.authed(r.token, r.onboardingStep, e);
    } catch (x: any) {
      if (x.status === 423) { flow.lockedUntil = x.data.lockedUntil; flow.email = e; ctx.go("locked"); }
      else if (x.status === 401) setErr(x.data?.attemptsLeft ? `E-mail ou senha incorretos. ${x.data.attemptsLeft} tentativas restantes.` : "E-mail ou senha incorretos.");
      else setErr(x.status === 429 ? "Muitas tentativas. Aguarde um minuto." : "Não foi possível conectar ao servidor.");
    } finally { setBusy(false); }
  };
  const field = (on: boolean) => ({ height: 56, borderRadius: 16, backgroundColor: c.bg, borderWidth: on ? 1.5 : 0, borderColor: c.ink, flexDirection: "row" as const, alignItems: "center" as const, paddingHorizontal: 16, gap: 12 });
  const input = { flex: 1, fontFamily: f.m, fontSize: 16, color: c.ink };
  return (
    <View style={{ flex: 1, paddingHorizontal: 24, backgroundColor: c.white }}>
      <View style={{ marginTop: 8, alignItems: "flex-start" }}><Back onPress={ctx.back} /></View>
      <T s="s" style={{ fontSize: 38, lineHeight: 42, letterSpacing: -1.1, marginTop: 36 }}>Bem-vindo{"\n"}de volta</T>
      <T style={{ color: c.muted, fontSize: 15, marginTop: 10 }}>Entre para acompanhar seus gastos.</T>
      <T s="m" style={{ color: c.muted, marginTop: 28, marginBottom: 8 }}>E-mail</T>
      <View style={field(focus === "e")}>
        <Mail size={20} strokeWidth={1.75} color={c.muted} />
        <TextInput value={email} onChangeText={setEmail} onFocus={() => setFocus("e")} autoCapitalize="none" keyboardType="email-address" textContentType="username" style={input} />
      </View>
      <T s="m" style={{ color: c.muted, marginTop: 20, marginBottom: 8 }}>Senha</T>
      <View style={field(focus === "p")}>
        <Lock size={20} strokeWidth={1.75} color={c.muted} />
        <TextInput value={pass} onChangeText={setPass} onFocus={() => setFocus("p")} secureTextEntry={!show} textContentType="password" style={input} />
        <Pressable onPress={() => setShow(!show)}><Eye size={20} strokeWidth={1.75} color={c.muted} /></Pressable>
      </View>
      <Pressable onPress={() => { flow.resetTarget = email.trim(); ctx.go("forgot"); }} style={{ alignItems: "flex-end", marginTop: 14 }}><T s="s" style={{ fontSize: 13 }}>Esqueci minha senha</T></Pressable>
      {err ? <T style={{ color: c.negative, marginTop: 14 }} accessibilityLiveRegion="polite">{err}</T> : null}
      <Button label={busy ? "Entrando…" : "Entrar"} onPress={submit} style={{ marginTop: 24 }} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 22 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: c.line }} /><T style={{ color: c.subtle, fontSize: 13 }}>ou</T><View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
      </View>
      <Button label="Entrar com Face ID" variant="outline" icon={ScanFace}
        onPress={() => (canFace ? ctx.go("quickFace") : notify("Face ID", "Entre uma vez com e-mail e senha e ative o Face ID no cadastro para usar este atalho."))} />
      <View style={{ flex: 1 }} />
      <Pressable onPress={() => ctx.go("signup")} style={{ flexDirection: "row", justifyContent: "center", gap: 6, paddingBottom: 24 }}>
        <T style={{ color: c.muted }}>Não tem conta?</T><T s="s">Criar conta</T>
      </Pressable>
    </View>
  );
}

function Ring({ spin }: { spin: boolean }) {
  const r = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!spin) { r.setValue(0); return; }
    const a = Animated.loop(Animated.timing(r, { toValue: 1, duration: 1100, easing: Easing.linear, useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [spin, r]);
  const rot = r.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  return (
    <View style={{ width: 164, height: 164, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={{ position: "absolute", transform: [{ rotate: rot }] }}>
        <Svg width={164} height={164}>
          <SvgCircle cx={82} cy={82} r={79} stroke={c.line} strokeWidth={3} fill="none" />
          <Path d="M82 3 A79 79 0 0 1 161 82" stroke={c.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
        </Svg>
      </Animated.View>
      <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}><ScanFace size={64} strokeWidth={1.5} color={c.ink} /></View>
    </View>
  );
}

async function biometricLogin(rem: Remembered, ctx: Ctx): Promise<string | null> {
  if (!rem.biometric || !rem.deviceSecret) return "Face ID não está ativo neste aparelho. Use o PIN ou a senha.";
  const hw = await LocalAuthentication.hasHardwareAsync(), enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!hw || !enrolled) return "Face ID indisponível neste aparelho. Use o PIN ou a senha.";
  const r = await LocalAuthentication.authenticateAsync({ promptMessage: "Entrar no Nuvo", cancelLabel: "Cancelar", disableDeviceFallback: true });
  if (!r.success) return "Não reconhecemos seu rosto. Tente de novo ou use o PIN.";
  try {
    const a = await auth.bioLogin(rem.email, rem.deviceSecret, await getDevice());
    await ctx.authed(a.token, a.onboardingStep, rem.email);
    return null;
  } catch (e: any) {
    if (e.status === 423) { flow.lockedUntil = e.data.lockedUntil; flow.email = rem.email; ctx.go("locked"); return null; }
    return "Sessão do Face ID expirou. Entre com o PIN ou a senha.";
  }
}

export function QuickFace({ ctx, rem }: { ctx: Ctx; rem: Remembered }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const go = async () => {
    if (busy) return;
    setBusy(true); setMsg("");
    const m = await biometricLogin(rem, ctx).catch(() => "Algo deu errado. Tente de novo.");
    if (m) setMsg(m);
    setBusy(false);
  };
  useEffect(() => { if (rem.biometric) go(); }, []); // eslint-disable-line react-hooks/exhaustive-deps -- auto-prompt once on open
  return (
    <View style={{ flex: 1, backgroundColor: c.white, paddingHorizontal: 24, alignItems: "center" }}>
      <View style={{ marginTop: 48 }}><Avatar initials={rem.initials} size={88} /></View>
      <T s="s" style={{ fontSize: 26, letterSpacing: -0.6, marginTop: 16 }}>Olá, {rem.name}</T>
      <T style={{ color: c.muted, marginTop: 4 }}>{rem.email}</T>
      <View style={{ marginTop: 40 }}><Ring spin={busy} /></View>
      <T s="m" style={{ marginTop: 22, textAlign: "center", color: msg ? c.negative : c.ink }} accessibilityLiveRegion="polite">{msg || "Olhe para a tela para entrar"}</T>
      <View style={{ flex: 1 }} />
      <View style={{ alignSelf: "stretch", paddingBottom: 14 }}>
        <Button label="Entrar com Face ID" icon={ScanFace} onPress={go} />
        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 14, marginTop: 18 }}>
          <Pressable onPress={() => ctx.go("pinLogin")}><T s="s" style={{ fontSize: 14 }}>Usar PIN</T></Pressable>
          <T style={{ color: c.subtle }}>·</T>
          <Pressable onPress={() => ctx.go("login")}><T s="s" style={{ fontSize: 14 }}>Usar senha</T></Pressable>
        </View>
        <Pressable onPress={async () => { await forgetAccount(); ctx.reset("onb"); }} style={{ alignItems: "center", marginTop: 22, paddingBottom: 6 }}><T style={{ color: c.muted, fontSize: 13 }}>Não é você? Trocar de conta</T></Pressable>
      </View>
    </View>
  );
}

export function PinLogin({ ctx, rem }: { ctx: Ctx; rem: Remembered }) {
  const [pin, setPin] = useState("");
  const [bad, setBad] = useState(false);
  const [busy, setBusy] = useState(false);
  const press = async (d: string) => {
    if (busy || pin.length >= 6) return;
    setBad(false);
    const next = pin + d;
    setPin(next);
    if (next.length < 6) return;
    setBusy(true);
    try {
      const a = await auth.pinLogin(rem.email, next, await getDevice());
      await ctx.authed(a.token, a.onboardingStep, rem.email);
    } catch (e: any) {
      if (e.status === 423) { flow.lockedUntil = e.data.lockedUntil; flow.email = rem.email; ctx.go("locked"); return; }
      setBad(true); setTimeout(() => { setPin(""); setBusy(false); }, 600);
      return;
    }
    setBusy(false);
  };
  return (
    <View style={{ flex: 1, backgroundColor: c.white, paddingHorizontal: 24, alignItems: "center" }}>
      <View style={{ alignSelf: "flex-start", marginTop: 8 }}><Back onPress={ctx.back} /></View>
      <View style={{ marginTop: 6 }}><Avatar initials={rem.initials} size={64} /></View>
      <T s="s" style={{ fontSize: 24, letterSpacing: -0.5, marginTop: 14 }}>Digite seu PIN</T>
      <Pressable onPress={async () => { await forgetAccount(); ctx.reset("login"); }}><T style={{ color: c.muted, fontSize: 13, marginTop: 4 }}>Olá, {rem.name} · não é você?</T></Pressable>
      <View style={{ marginTop: 28 }}><PinDots filled={pin.length} error={bad} /></View>
      {bad ? <T style={{ color: c.negative, fontSize: 13, marginTop: 12 }} accessibilityLiveRegion="polite">PIN incorreto.</T> : null}
      <Pressable onPress={() => { flow.pinReset = true; flow.email = rem.email; ctx.go("login"); }} style={{ marginTop: bad ? 10 : 22, padding: 6 }}><T s="s" style={{ fontSize: 13 }}>Esqueci meu PIN</T></Pressable>
      <View style={{ flex: 1 }} />
      <View style={{ alignSelf: "stretch", paddingBottom: 12 }}>
        <NumericKeypad onKey={press} onDelete={() => { setBad(false); setPin(pin.slice(0, -1)); }} disabled={busy} leftAction="biometric"
          onLeft={async () => { const m = await biometricLogin(rem, ctx).catch(() => "Face ID indisponível."); if (m) notify("Face ID", m); }} />
      </View>
    </View>
  );
}

export function CreatePin({ ctx }: { ctx: Ctx }) {
  const [first, setFirst] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");
  const [bad, setBad] = useState(false);
  const [busy, setBusy] = useState(false);
  const press = async (d: string) => {
    if (busy || pin.length >= 6) return;
    setBad(false); setMsg("");
    const next = pin + d;
    setPin(next);
    if (next.length < 6) return;
    if (first === null) {
      const e = pinError(next);
      if (e) { setBad(true); setMsg(e); setTimeout(() => setPin(""), 600); return; }
      setTimeout(() => { setFirst(next); setPin(""); }, 250);
      return;
    }
    if (next !== first) { setBad(true); setMsg("Os PINs não conferem. Digite novamente."); setTimeout(() => { setPin(""); setFirst(null); }, 700); return; }
    setBusy(true);
    try {
      await auth.setPin(next);
      if (flow.pinReset) { flow.pinReset = false; await ctx.enterApp(); } else ctx.go("done");
    } catch { setBad(true); setMsg("Não foi possível salvar o PIN."); setTimeout(() => { setPin(""); setFirst(null); setBusy(false); }, 700); return; }
    setBusy(false);
  };
  return (
    <View style={{ flex: 1, backgroundColor: c.white, paddingHorizontal: 24 }}>
      <View style={{ marginTop: 8, alignItems: "flex-start" }}><Back onPress={() => (first ? (setFirst(null), setPin("")) : ctx.back())} /></View>
      <T s="s" style={{ fontSize: 30, letterSpacing: -0.8, marginTop: 26, lineHeight: 34 }}>{first ? "Confirme seu\nPIN" : "Crie um PIN de\n6 dígitos"}</T>
      <T style={{ color: c.muted, fontSize: 14, marginTop: 8 }}>{first ? "Digite o mesmo PIN novamente." : "Use quando o Face ID não estiver disponível."}</T>
      <View style={{ marginTop: 40 }}><PinDots filled={pin.length} error={bad} /></View>
      <T style={{ color: bad ? c.negative : c.muted, fontSize: 12, textAlign: "center", marginTop: 16 }} accessibilityLiveRegion="polite">{msg || "Evite sequências como 123456 ou datas."}</T>
      <View style={{ flex: 1 }} />
      <View style={{ paddingBottom: 12 }}><NumericKeypad onKey={press} onDelete={() => { setBad(false); setMsg(""); setPin(pin.slice(0, -1)); }} disabled={busy} /></View>
    </View>
  );
}

export function TwoFactor({ ctx }: { ctx: Ctx }) {
  const [channel, setChannel] = useState<"sms" | "email">("sms");
  const email = flow.email ?? "";
  useEffect(() => { auth.otpSend("LOGIN_2FA", { channel }, flow.challenge).catch(() => {}); }, [channel]);
  return (
    <OtpScreen
      top={<View style={{ marginTop: 8, alignItems: "flex-start" }}><Back onPress={ctx.back} /></View>}
      title="Confirme que é você" target={devTarget(channel)}
      subtitle={channel === "sms" ? <>Enviamos um código por SMS para{"\n"}{flow.phoneMasked ?? ""}</> : <>Enviamos um código por e-mail para{"\n"}{maskEmail(email)}</>}
      extra={(
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center", backgroundColor: c.warningBg, borderRadius: 18, padding: 14, marginTop: 18 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.white, alignItems: "center", justifyContent: "center" }}><Smartphone size={20} strokeWidth={1.75} color={c.warning} /></View>
          <View style={{ flex: 1 }}><T s="s" style={{ fontSize: 14 }}>Novo dispositivo detectado</T><T style={{ color: c.muted, fontSize: 12, marginTop: 2 }}>{flow.deviceName ?? "Este aparelho"} · agora</T></View>
        </View>
      )}
      submit={async (code) => {
        try {
          await auth.otpVerify("LOGIN_2FA", code, { channel }, flow.challenge);
          const tok = flow.challenge!; flow.challenge = undefined;
          const me = await (setToken(tok), auth.me());
          await ctx.authed(tok, me.onboardingStep, email);
          return { ok: true };
        } catch (e: any) {
          setToken(null);
          if (e.status === 423) { flow.lockedUntil = e.data.lockedUntil; ctx.go("locked"); return { ok: true }; }
          return { ok: false, attemptsLeft: e.data?.attemptsLeft ?? 0 };
        }
      }}
      resend={async () => { await auth.otpSend("LOGIN_2FA", { channel }, flow.challenge); }}
      link={{ label: channel === "sms" ? "Receber por e-mail" : "Receber por SMS", onPress: () => setChannel(channel === "sms" ? "email" : "sms") }}
    />
  );
  function devTarget(ch: "sms" | "email") { return ch === "sms" ? "+5579999994821" : email; }
}

export function Locked({ ctx }: { ctx: Ctx }) {
  const secs = Math.max(0, Math.round(((flow.lockedUntil ?? Date.now()) - Date.now()) / 1000));
  return (
    <View style={{ flex: 1, backgroundColor: c.white, paddingHorizontal: 24 }}>
      <View style={{ marginTop: 8, alignItems: "flex-start" }}><Close onPress={() => ctx.reset("login")} /></View>
      <View style={{ alignItems: "center", marginTop: 34 }}><HeroIcon icon={Lock} tone="negative" size={76} /></View>
      <T s="s" style={{ fontSize: 28, letterSpacing: -0.7, textAlign: "center", marginTop: 26, lineHeight: 32 }}>Acesso bloqueado{"\n"}temporariamente</T>
      <T style={{ color: c.muted, textAlign: "center", lineHeight: 20, marginTop: 10 }}>Detectamos muitas tentativas incorretas. Por segurança, pausamos o acesso.</T>
      <View style={{ backgroundColor: c.bg, borderRadius: 20, paddingVertical: 20, alignItems: "center", marginTop: 26 }}>
        <T style={{ color: c.muted, fontSize: 13 }}>Tente novamente em</T>
        <CountdownText seconds={secs} render={(t, done) => <T s="s" style={{ fontSize: 44, letterSpacing: -1.5, marginTop: 4 }} accessibilityLabel={done ? "Você já pode tentar novamente" : `Tente novamente em ${t}`}>{done ? "00:00" : t}</T>} />
      </View>
      <T style={{ color: c.muted, textAlign: "center", fontSize: 13, lineHeight: 19, marginTop: 24 }}>Enviamos um alerta para {flow.email ?? "seu e-mail"}.{"\n"}Se não foi você, redefina sua senha agora.</T>
      <View style={{ flex: 1 }} />
      <View style={{ paddingBottom: 20, gap: 10 }}>
        <Button label="Redefinir senha" onPress={() => { flow.resetTarget = flow.email; ctx.go("forgot"); }} />
        <Pressable onPress={() => Linking.openURL("mailto:suporte@nuvo.app").catch(() => notify("Suporte", "suporte@nuvo.app"))} style={{ height: 52, borderRadius: 999, backgroundColor: c.bg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Headphones size={18} strokeWidth={1.75} color={c.ink} /><T s="s" style={{ fontSize: 15 }}>Falar com o suporte</T>
        </Pressable>
      </View>
    </View>
  );
}

export function Forgot({ ctx }: { ctx: Ctx }) {
  const [target, setTarget] = useState(flow.resetTarget ?? "");
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const valid = isValidEmail(target) || isValidCpf(target);
  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true); setErr("");
    try {
      await auth.otpSend("PASSWORD_RESET", { target: target.trim(), channel });
      flow.resetTarget = target.trim(); flow.resetChannel = channel;
      ctx.go("resetCode");
    } catch { setErr("Não foi possível enviar agora. Tente novamente."); } finally { setBusy(false); }
  };
  const card = (k: "email" | "sms", Icon: any, label: string) => (
    <Pressable key={k} onPress={() => setChannel(k)} style={{ flex: 1, height: 56, borderRadius: 16, borderWidth: channel === k ? 1.5 : 1, borderColor: channel === k ? c.ink : c.line, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14 }}>
      <Icon size={20} strokeWidth={1.75} color={channel === k ? c.ink : c.subtle} /><T s={channel === k ? "s" : "m"} style={{ color: channel === k ? c.ink : c.muted, fontSize: 14 }}>{label}</T>
    </Pressable>
  );
  return (
    <View style={{ flex: 1, backgroundColor: c.white, paddingHorizontal: 24 }}>
      <View style={{ marginTop: 8, alignItems: "flex-start" }}><Back onPress={ctx.back} /></View>
      <View style={{ marginTop: 14, marginLeft: -8, alignItems: "flex-start" }}><HeroIcon icon={KeyRound} size={60} /></View>
      <T s="s" style={{ fontSize: 30, letterSpacing: -0.8, marginTop: 14 }}>Esqueceu sua senha?</T>
      <T style={{ color: c.muted, fontSize: 14, lineHeight: 20, marginTop: 6 }}>Sem problemas. Informe o e-mail ou CPF da sua conta e enviaremos um código.</T>
      <Field label="E-mail ou CPF" icon={Mail} value={target} onChangeText={setTarget} autoCapitalize="none" keyboardType="email-address" error={err || undefined} />
      <T s="m" style={{ color: c.muted, fontSize: 13, marginTop: 20, marginBottom: 10 }}>Enviar código por</T>
      <View style={{ flexDirection: "row", gap: 12 }}>{card("email", Mail, "E-mail")}{card("sms", MessageSquare, "SMS")}</View>
      <View style={{ flex: 1 }} />
      <View style={{ paddingBottom: 20 }}>
        <Button label={busy ? "Enviando…" : "Enviar código"} onPress={submit} style={{ opacity: valid ? 1 : 0.35 }} />
        <Pressable onPress={ctx.back} style={{ alignItems: "center", paddingVertical: 16 }}><T s="s" style={{ fontSize: 14 }}>Lembrei minha senha</T></Pressable>
      </View>
    </View>
  );
}

export function ResetCode({ ctx }: { ctx: Ctx }) {
  const target = flow.resetTarget ?? "";
  const channel = flow.resetChannel ?? "email";
  // Dev banner only: the mock sender indexes codes by the address it "sent" to.
  const addr = target.includes("@") ? target.toLowerCase() : "felipe@email.com";
  return (
    <OtpScreen
      top={<View style={{ marginTop: 8, alignItems: "flex-start" }}><Back onPress={ctx.back} /></View>}
      hero={<View style={{ marginTop: 14, marginLeft: -8 }}><HeroIcon icon={MailCheck} size={60} /></View>}
      title="Verifique seu e-mail" target={channel === "email" ? addr : "+5579999994821"}
      subtitle={<>Digite o código enviado para {target.includes("@") ? maskEmail(target) : "sua conta"}</>}
      submit={async (code) => {
        try {
          const r = await auth.otpVerify("PASSWORD_RESET", code, { target, channel });
          if (!r.ok) return { ok: false, attemptsLeft: r.attemptsLeft };
          flow.resetCode = code; ctx.go("resetNew"); return { ok: true };
        } catch { return { ok: false, attemptsLeft: 0 }; }
      }}
      resend={async () => { await auth.otpSend("PASSWORD_RESET", { target, channel }); }}
    />
  );
}

export function ResetNew({ ctx, onDone }: { ctx: Ctx; onDone: (r: { count: number; devices: string[] }) => void }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const checks = pwChecks(pw);
  const match = pw.length > 0 && pw === pw2;
  const ok = checks.every((k) => k.ok) && pwScore(pw) >= 2 && match;
  const submit = async () => {
    if (!ok || busy) return;
    setBusy(true); setErr("");
    try {
      const r = await auth.reset(flow.resetTarget ?? "", flow.resetChannel ?? "email", flow.resetCode ?? "", pw);
      flow.resetCode = undefined; onDone(r.revoked); ctx.go("resetDone");
    } catch (e: any) {
      const code = e.data?.error;
      setErr(code === "password_reused" ? "Use uma senha diferente das 3 últimas." : code === "invalid_code" ? "O código expirou. Peça um novo." : e.data?.reason === "personal_data" ? "A senha não pode conter seu nome, e-mail ou CPF." : "Não foi possível redefinir a senha.");
    } finally { setBusy(false); }
  };
  return (
    <View style={{ flex: 1, backgroundColor: c.white, paddingHorizontal: 24 }}>
      <View style={{ marginTop: 8, alignItems: "flex-start" }}><Back onPress={ctx.back} /></View>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <T s="s" style={{ fontSize: 30, letterSpacing: -0.8, marginTop: 22 }}>Crie uma nova senha</T>
        <T style={{ color: c.muted, fontSize: 14, marginTop: 6 }}>Ela deve ser diferente das 3 últimas.</T>
        <Field label="Nova senha" icon={Lock} value={pw} onChangeText={setPw} secure autoCapitalize="none" textContentType="newPassword" error={err || undefined} />
        <PasswordStrength password={pw} />
        <Field label="Confirmar nova senha" icon={Lock} value={pw2} onChangeText={setPw2} secure autoCapitalize="none" />
        {match && <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}><CircleCheck size={16} color={c.positive} strokeWidth={1.75} /><T s="m" style={{ color: c.positive, fontSize: 13 }}>As senhas são iguais</T></View>}
        <RequirementList title="Requisitos" checks={checks} />
      </ScrollView>
      <View style={{ paddingBottom: 20, paddingTop: 8 }}><Button label={busy ? "Salvando…" : "Redefinir senha"} onPress={submit} style={{ opacity: ok ? 1 : 0.35 }} /></View>
    </View>
  );
}

export function ResetDone({ ctx, revoked }: { ctx: Ctx; revoked: { count: number; devices: string[] } }) {
  const names = revoked.devices.length > 1 ? `${revoked.devices.slice(0, -1).join(", ")} e ${revoked.devices.at(-1)}` : revoked.devices[0] ?? "";
  return (
    <View style={{ flex: 1, backgroundColor: c.white, paddingHorizontal: 24 }}>
      <View style={{ alignItems: "center", marginTop: 90 }}><SuccessMark size={72} /></View>
      <T s="s" style={{ fontSize: 30, letterSpacing: -0.8, textAlign: "center", marginTop: 34 }}>Senha redefinida!</T>
      <T style={{ color: c.muted, textAlign: "center", lineHeight: 20, marginTop: 10 }}>Por segurança, encerramos as sessões abertas em outros dispositivos.</T>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.bg, borderRadius: 18, padding: 14, marginTop: 28 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.white, alignItems: "center", justifyContent: "center" }}><MonitorSmartphone size={20} strokeWidth={1.75} color={c.ink} /></View>
        <View style={{ flex: 1 }}>
          <T s="s" style={{ fontSize: 14 }}>{revoked.count === 0 ? "Nenhuma outra sessão ativa" : `${revoked.count} ${revoked.count === 1 ? "sessão encerrada" : "sessões encerradas"}`}</T>
          {names ? <T style={{ color: c.muted, fontSize: 12, marginTop: 2 }}>{names}</T> : null}
        </View>
      </View>
      <View style={{ flex: 1 }} />
      <View style={{ paddingBottom: 20 }}><Button label="Entrar na minha conta" onPress={() => { flow.pinReset = false; ctx.reset("login"); }} /></View>
    </View>
  );
}
