import { useEffect, useState } from "react";
import { ScrollView, View, Pressable } from "react-native";
import { Eye, IdCard, Lock, Mail, ShieldCheck, Smartphone, User, XCircle, CircleAlert, Landmark } from "lucide-react-native";
import { Button, T } from "./ui";
import { Checkbox, CountdownText, DevCode, Field, NumericKeypad, OtpInput, PasswordStrength, RequirementList, ResendRow, StepHeader, SuccessMark } from "./authui";
import { auth, setToken } from "./api";
import { flow, getDevice, saveToken } from "./session";
import { Ctx } from "./flowtypes";
import { c } from "./theme";
import { isValidCpf, isValidEmail, isValidName, isValidPhone, maskCpf, maskPhone, maskEmail, pwChecks, pwScore } from "./validate";

const Footer = ({ children }: { children: React.ReactNode }) => <View style={{ paddingBottom: 20, paddingTop: 8 }}>{children}</View>;

export function Signup({ ctx }: { ctx: Ctx }) {
  const [v, setV] = useState({ name: "", email: "", cpf: "", phone: "" });
  const [server, setServer] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const set = (k: keyof typeof v) => (t: string) => { setV({ ...v, [k]: k === "cpf" ? maskCpf(t) : k === "phone" ? maskPhone(t) : t }); setServer({}); };
  const valid = { name: isValidName(v.name), email: isValidEmail(v.email), cpf: isValidCpf(v.cpf), phone: isValidPhone(v.phone) };
  const msg = { name: "Informe nome e sobrenome.", email: "E-mail inválido.", cpf: "CPF inválido.", phone: "Celular inválido. Use (DD) 9XXXX-XXXX." };
  const err = (k: keyof typeof v) => server[k] ?? (touched[k] && !valid[k] ? msg[k] : undefined);
  const ok = Object.values(valid).every(Boolean);
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  const submit = async () => {
    if (!ok || busy) return;
    setBusy(true);
    try {
      const r = await auth.signup({ name: v.name, email: v.email, cpf: v.cpf, phone: v.phone }, await getDevice());
      setToken(r.token); await saveToken(r.token);
      flow.email = v.email.trim().toLowerCase();
      ctx.go("signupPassword");
    } catch (e: any) {
      if (e.status === 409) setServer(Object.fromEntries((e.data.fields as string[]).map((f) => [f, f === "email" ? "E-mail já cadastrado." : f === "cpf" ? "CPF já cadastrado." : "Celular já cadastrado."])));
      else setServer({ name: "Não foi possível conectar ao servidor." });
    } finally { setBusy(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.white, paddingHorizontal: 24 }}>
      <StepHeader step={1} onBack={ctx.back} />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <T s="s" style={{ fontSize: 30, letterSpacing: -0.8, marginTop: 22 }}>Vamos começar</T>
        <T style={{ color: c.muted, fontSize: 14, marginTop: 6 }}>Precisamos de alguns dados para criar sua conta.</T>
        <Field label="Nome completo" icon={User} value={v.name} onChangeText={set("name")} onBlur={blur("name")} autoCapitalize="words" textContentType="name" error={err("name")} />
        <Field label="E-mail" icon={Mail} value={v.email} onChangeText={set("email")} onBlur={blur("email")} autoCapitalize="none" keyboardType="email-address" textContentType="emailAddress" error={err("email")} />
        <Field label="CPF" icon={IdCard} value={v.cpf} onChangeText={set("cpf")} onBlur={blur("cpf")} keyboardType="number-pad" error={err("cpf")} />
        <Field label="Celular" icon={Smartphone} value={v.phone} onChangeText={set("phone")} onBlur={blur("phone")} keyboardType="phone-pad" textContentType="telephoneNumber" error={err("phone")} />
        <T style={{ color: c.muted, fontSize: 12, marginTop: 14 }}>Usamos o CPF para conectar suas contas pelo Open Finance.</T>
      </ScrollView>
      <Footer>
        <Button label={busy ? "Criando…" : "Continuar"} onPress={submit} style={{ opacity: ok ? 1 : 0.35 }} />
        <Pressable onPress={() => ctx.reset("login")} style={{ alignItems: "center", paddingVertical: 14 }}>
          <T style={{ color: c.muted }}>Já tem conta? <T s="s">Entrar</T></T>
        </Pressable>
      </Footer>
    </View>
  );
}

export function SignupPassword({ ctx }: { ctx: Ctx }) {
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
    try { await auth.setPassword(pw); ctx.go("verifyEmail"); }
    catch (e: any) { setErr(e.data?.reason === "personal_data" ? "A senha não pode conter seu nome, e-mail ou CPF." : e.status === 409 ? "Senha já definida." : "Não foi possível salvar a senha."); }
    finally { setBusy(false); }
  };
  return (
    <View style={{ flex: 1, backgroundColor: c.white, paddingHorizontal: 24 }}>
      <StepHeader step={2} onBack={ctx.back} />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <T s="s" style={{ fontSize: 30, letterSpacing: -0.8, marginTop: 22 }}>Crie uma senha forte</T>
        <T style={{ color: c.muted, fontSize: 14, marginTop: 6 }}>Ela protege seus dados financeiros.</T>
        <Field label="Senha" icon={Lock} value={pw} onChangeText={setPw} secure autoCapitalize="none" textContentType="newPassword" error={err || undefined} />
        <PasswordStrength password={pw} />
        <Field label="Confirmar senha" icon={Lock} value={pw2} onChangeText={setPw2} secure autoCapitalize="none" />
        <RequirementList title="Sua senha precisa ter:" checks={checks} />
      </ScrollView>
      <Footer><Button label={busy ? "Salvando…" : "Continuar"} onPress={submit} style={{ opacity: ok ? 1 : 0.35 }} /></Footer>
    </View>
  );
}

/** One OTP screen for sign-up e-mail, 2FA and password reset. */
export function OtpScreen({ top, title, subtitle, hero, extra, target, submit, resend, link, onBack }: {
  top?: React.ReactNode; title: string; subtitle: React.ReactNode; hero?: React.ReactNode; extra?: React.ReactNode; target: string;
  submit: (code: string) => Promise<{ ok: boolean; attemptsLeft?: number }>; resend: () => Promise<void>;
  link?: { label: string; onPress: () => void }; onBack?: () => void;
}) {
  const [code, setCode] = useState("");
  const [bad, setBad] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);
  const press = async (d: string) => {
    if (busy || code.length >= 6) return;
    setBad(null);
    const next = code + d;
    setCode(next);
    if (next.length < 6) return;
    setBusy(true);
    try {
      const r = await submit(next);
      if (!r.ok) { setBad(r.attemptsLeft ?? 0); setTimeout(() => { setCode(""); setBusy(false); }, 700); return; }
    } catch { setBad(0); setTimeout(() => { setCode(""); setBusy(false); }, 700); return; }
    setBusy(false);
  };
  const error = bad !== null;
  return (
    <View style={{ flex: 1, backgroundColor: c.white, paddingHorizontal: 24 }}>
      {top}
      {hero}
      <T s="s" style={{ fontSize: 30, letterSpacing: -0.8, marginTop: hero ? 18 : 22 }}>{title}</T>
      <T style={{ color: c.muted, fontSize: 14, lineHeight: 20, marginTop: 6 }}>{subtitle}</T>
      {extra}
      <View style={{ marginTop: 22 }}><OtpInput value={code} error={error} loading={busy} /></View>
      {error ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14, alignSelf: "center" }} accessibilityLiveRegion="polite">
          <CircleAlert size={16} color={c.negative} strokeWidth={1.75} />
          <T style={{ color: c.negative, fontSize: 13 }}>{bad && bad > 0 ? `Código incorreto. ${bad} ${bad === 1 ? "tentativa restante" : "tentativas restantes"}.` : "Código inválido ou expirado. Peça um novo."}</T>
        </View>
      ) : null}
      <CountdownText seconds={60} restartKey={tick} render={(t, done) => <ResendRow left={t} done={done} onResend={async () => { setBad(null); setCode(""); await resend().catch(() => {}); setTick((n) => n + 1); }} />} />
      {link && <Pressable onPress={link.onPress} style={{ alignSelf: "center", marginTop: 14, padding: 6 }}><T s="s" style={{ fontSize: 14 }}>{link.label}</T></Pressable>}
      <DevCode target={target} tick={tick} />
      <View style={{ flex: 1 }} />
      <View style={{ paddingBottom: 12 }}><NumericKeypad onKey={press} onDelete={() => { setBad(null); setCode(code.slice(0, -1)); }} disabled={busy} /></View>
    </View>
  );
}

export function VerifyEmail({ ctx }: { ctx: Ctx }) {
  const email = flow.email ?? "";
  useEffect(() => { auth.otpSend("EMAIL_VERIFY").catch(() => {}); }, []);
  return (
    <OtpScreen top={<StepHeader step={2} onBack={ctx.back} />} title="Confirme seu e-mail" target={email}
      subtitle={<>Digite o código de 6 dígitos que enviamos{"\n"}para {email}</>}
      submit={async (code) => {
        try { await auth.otpVerify("EMAIL_VERIFY", code); ctx.go("terms"); return { ok: true }; }
        catch (e: any) { return { ok: false, attemptsLeft: e.data?.attemptsLeft ?? 0 }; }
      }}
      resend={async () => { await auth.otpSend("EMAIL_VERIFY"); }}
      link={{ label: "Alterar e-mail", onPress: () => ctx.reset("signup") }} />
  );
}

export function Terms({ ctx }: { ctx: Ctx }) {
  const [a, setA] = useState(true), [b, setB] = useState(true), [cp, setCp] = useState(true), [m, setM] = useState(false);
  const [busy, setBusy] = useState(false);
  const ok = a && b && cp;
  const submit = async () => {
    if (!ok || busy) return;
    setBusy(true);
    try { await auth.consents({ terms: a, privacy: b, openFinanceCpf: cp, marketing: m }); ctx.go("faceIntro"); }
    catch { /* stays on screen; button re-enabled */ } finally { setBusy(false); }
  };
  const row = (Icon: any, t: string, d: string) => (
    <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.white, alignItems: "center", justifyContent: "center" }}><Icon size={18} strokeWidth={1.75} color={c.ink} /></View>
      <View style={{ flex: 1 }}><T s="s" style={{ fontSize: 14 }}>{t}</T><T style={{ color: c.muted, fontSize: 13, lineHeight: 18, marginTop: 2 }}>{d}</T></View>
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: c.white, paddingHorizontal: 24 }}>
      <StepHeader step={3} onBack={ctx.back} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <T s="s" style={{ fontSize: 30, letterSpacing: -0.8, marginTop: 22 }}>Seus dados, suas regras</T>
        <T style={{ color: c.muted, fontSize: 14, marginTop: 6 }}>Leia e aceite para continuar.</T>
        <View style={{ backgroundColor: c.bg, borderRadius: 20, padding: 18, marginTop: 18 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><ShieldCheck size={20} strokeWidth={1.75} color={c.ink} /><T s="s" style={{ fontSize: 15 }}>Como usamos seus dados</T></View>
          {row(Eye, "Só leitura", "Vemos saldos e extratos. Nunca movimentamos dinheiro.")}
          {row(Lock, "Criptografia", "Dados protegidos em trânsito e em repouso.")}
          {row(XCircle, "Você no controle", "Revogue o acesso ou exclua sua conta quando quiser (LGPD).")}
        </View>
        <View style={{ gap: 18, marginTop: 24 }}>
          <Checkbox checked={a} onChange={setA}>Li e aceito os Termos de Uso</Checkbox>
          <Checkbox checked={b} onChange={setB}>Li e aceito a Política de Privacidade</Checkbox>
          <Checkbox checked={cp} onChange={setCp}>Autorizo o uso do meu CPF para conexão via Open Finance</Checkbox>
          <Checkbox checked={m} onChange={setM}>Quero receber dicas financeiras por e-mail</Checkbox>
        </View>
      </ScrollView>
      <Footer><Button label={busy ? "Salvando…" : "Aceitar e continuar"} onPress={submit} style={{ opacity: ok ? 1 : 0.35 }} /></Footer>
    </View>
  );
}

export function Done({ ctx, name }: { ctx: Ctx; name: string }) {
  const item = (t: string, d: string) => (
    <View key={t} style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.positiveBg, alignItems: "center", justifyContent: "center" }}><T s="b" style={{ color: c.positive, fontSize: 13 }}>✓</T></View>
      <View style={{ flex: 1 }}><T s="s" style={{ fontSize: 14 }}>{t}</T><T style={{ color: c.muted, fontSize: 12, marginTop: 1 }}>{d}</T></View>
    </View>
  );
  const dots = [[16, 24, 14, "#0A0A0A"], [150, 24, 10, "#6B6B6B"], [300, 40, 8, "#CECECE"], [6, 70, 10, "#A9A9A9"], [230, 110, 8, "#1F9D55"], [280, 120, 6, "#0A0A0A"], [70, 150, 10, "#CECECE"], [320, 160, 8, "#3A3A3A"]] as const;
  return (
    <View style={{ flex: 1, backgroundColor: c.white, paddingHorizontal: 24 }}>
      <View style={{ alignItems: "center", marginTop: 40, height: 190 }}>
        {dots.map(([x, y, s, col], i) => <View key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: s / 2, backgroundColor: col }} />)}
        <SuccessMark size={72} />
      </View>
      <T s="s" style={{ fontSize: 32, letterSpacing: -0.9, textAlign: "center", lineHeight: 36 }}>Tudo pronto,{"\n"}{name}!</T>
      <T style={{ color: c.muted, textAlign: "center", marginTop: 10 }}>Sua conta foi criada e está protegida.</T>
      <View style={{ backgroundColor: c.bg, borderRadius: 20, padding: 18, marginTop: 24, gap: 14 }}>
        {item("Dados pessoais", "Confirmados")}
        {item("E-mail", `${flow.email ?? ""} verificado`)}
        {item("Reconhecimento facial", "Prova de vida aprovada")}
        {item("Face ID e PIN", "Ativos para acesso rápido")}
      </View>
      <View style={{ flex: 1 }} />
      <Footer>
        <Button label="Conectar meu primeiro banco" icon={Landmark} onPress={() => ctx.enterApp({ thenConnect: true })} />
        <Pressable onPress={() => ctx.enterApp()} style={{ alignItems: "center", paddingVertical: 16 }}><T s="s" style={{ color: c.muted }}>Explorar o app primeiro</T></Pressable>
      </Footer>
    </View>
  );
}
