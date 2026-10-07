import { useEffect, useRef, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, Switch, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useKeepAwake } from "expo-keep-awake";
import * as LocalAuthentication from "expo-local-authentication";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, Check, Glasses, IdCard, LogIn, ScanFace, ShieldCheck, Smartphone, Sun, X } from "lucide-react-native";
import { Back, Button, CircleBtn, T } from "./ui";
import { FaceIllustration, HeroIcon, OvalRing, StepHeader } from "./authui";
import { auth, SHOW_DEV } from "./api";
import { flow, notify, saveRemembered } from "./session";
import { Ctx } from "./flowtypes";
import { c } from "./theme";

const tip = (Icon: any, text: string) => (
  <View key={text} style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.bg, borderRadius: 14, paddingHorizontal: 16, height: 48 }}>
    <Icon size={18} strokeWidth={1.75} color={c.ink} /><T s="m" style={{ fontSize: 14 }}>{text}</T>
  </View>
);

const Corners = ({ size = 96, color = c.ink }: { size?: number; color?: string }) => (
  <View style={{ position: "absolute", width: size, height: size }}>
    {([[0, 0], [1, 0], [0, 1], [1, 1]] as const).map(([x, y]) => (
      <View key={`${x}${y}`} style={{ position: "absolute", [x ? "right" : "left"]: 0, [y ? "bottom" : "top"]: 0, width: 26, height: 26, borderColor: color,
        [x ? "borderRightWidth" : "borderLeftWidth"]: 3, [y ? "borderBottomWidth" : "borderTopWidth"]: 3,
        [x ? (y ? "borderBottomRightRadius" : "borderTopRightRadius") : y ? "borderBottomLeftRadius" : "borderTopLeftRadius"]: 12 }} />
    ))}
  </View>
);

export function FaceIntro({ ctx }: { ctx: Ctx }) {
  const [perm, requestPerm] = useCameraPermissions();
  const [denied, setDenied] = useState(false);
  const start = async () => {
    const p = perm?.granted ? perm : await requestPerm();
    if (p.granted) { setDenied(false); ctx.go("faceCapture"); } else setDenied(true);
  };
  return (
    <View style={{ flex: 1, backgroundColor: c.white, paddingHorizontal: 24 }}>
      <StepHeader step={4} onBack={ctx.back} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: "center" }}>
        <View style={{ width: 168, height: 168, borderRadius: 84, backgroundColor: c.bg, alignItems: "center", justifyContent: "center", marginTop: 28 }}>
          <Corners size={186} />
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: c.ink, alignItems: "center", justifyContent: "center" }}><ScanFace size={60} strokeWidth={1.5} color={c.white} /></View>
        </View>
        <T s="s" style={{ fontSize: 28, letterSpacing: -0.7, textAlign: "center", marginTop: 30, lineHeight: 32 }}>Vamos confirmar{"\n"}que é você</T>
        <T style={{ color: c.muted, textAlign: "center", lineHeight: 20, marginTop: 10 }}>Uma selfie rápida protege sua conta contra fraudes. Leva menos de 30 segundos.</T>
        <View style={{ gap: 10, alignSelf: "stretch", marginTop: 24 }}>
          {tip(Sun, "Fique num lugar bem iluminado")}{tip(Glasses, "Tire óculos escuros, boné ou máscara")}{tip(Smartphone, "Segure o celular na altura do rosto")}
        </View>
        {denied && (
          <View style={{ alignSelf: "stretch", backgroundColor: c.negativeBg, borderRadius: 14, padding: 14, marginTop: 14 }}>
            <T s="s" style={{ color: c.negative, fontSize: 13 }}>Permissão da câmera negada</T>
            <T style={{ color: c.ink2, fontSize: 12, lineHeight: 17, marginTop: 4 }}>Abra Ajustes › Nuvo › Câmera e ative o acesso. Depois volte e toque em “Iniciar verificação”.</T>
            <Pressable onPress={() => Linking.openSettings()}><T s="s" style={{ fontSize: 13, marginTop: 8 }}>Abrir Ajustes</T></Pressable>
          </View>
        )}
      </ScrollView>
      <View style={{ paddingBottom: 20, paddingTop: 8 }}>
        <Button label="Iniciar verificação" icon={Camera} onPress={start} />
        <T style={{ color: c.muted, fontSize: 12, textAlign: "center", marginTop: 12 }}>Seus dados biométricos são criptografados.</T>
        {SHOW_DEV && <Pressable onPress={() => { flow.simFail = !flow.simFail; notify("dev", flow.simFail ? "Próxima verificação vai falhar (simulado)." : "Verificação volta ao normal."); }}><T style={{ color: c.subtle, fontSize: 11, textAlign: "center", marginTop: 6 }}>dev · alternar falha simulada</T></Pressable>}
      </View>
    </View>
  );
}

export function FaceCapture({ ctx }: { ctx: Ctx }) {
  useKeepAwake();
  const [state, setState] = useState<"scanning" | "success">("scanning");
  const [progress, setProgress] = useState(0);
  const [camOk, setCamOk] = useState(false);
  const alive = useRef(true);
  const W = 260, H = 340;

  useEffect(() => { CameraView.isAvailableAsync().then(setCamOk).catch(() => setCamOk(false)); }, []);
  useEffect(() => {
    alive.current = true;
    (async () => {
      try {
        const { sessionId } = await auth.kycStart(!!flow.simFail);
        while (alive.current) {
          const r = await auth.kycPoll(sessionId);
          if (!alive.current) return;
          setProgress(r.progress);
          if (r.status === "APPROVED") { setState("success"); return; }
          if (r.status === "REJECTED") { flow.kyc = { attempt: r.attempt, left: r.attemptsLeft }; ctx.go("faceFail"); return; }
          await new Promise((res) => setTimeout(res, 500));
        }
      } catch { if (alive.current) { flow.kyc = { attempt: 1, left: 2 }; ctx.go("faceFail"); } }
    })();
    return () => { alive.current = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ok = state === "success";
  const instr = progress < 30 ? "Olhe para frente" : progress < 75 ? "Agora, vire levemente a cabeça para a direita" : "Agora, vire levemente para a esquerda";
  const pill = (t: string) => (
    <View key={t} style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: c.white, borderRadius: 999, paddingHorizontal: 14, height: 36 }}>
      <Check size={14} strokeWidth={2.5} color={c.ink} /><T s="m" style={{ fontSize: 12 }}>{t}</T>
    </View>
  );
  return (
    <LinearGradient colors={["#1C1C1C", "#050505"]} style={{ flex: 1, paddingHorizontal: 24 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <Pressable onPress={ctx.back} accessibilityLabel="Fechar" style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.white, alignItems: "center", justifyContent: "center" }}><X size={20} color={c.ink} strokeWidth={1.75} /></Pressable>
        <T s="s" style={{ color: c.white, fontSize: 17 }}>Verificação facial</T>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center" }}><Sun size={20} color={c.white} strokeWidth={1.75} /></View>
      </View>

      <View style={{ alignSelf: "center", marginTop: 34, width: W, height: H, alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: W - 8, height: H - 8, borderRadius: (W - 8) / 2, overflow: "hidden", backgroundColor: "#262626", alignItems: "center", justifyContent: "center" }}>
          {camOk ? <CameraView style={{ width: W - 8, height: H - 8 }} facing="front" mirror /> : <FaceIllustration w={W - 8} h={H - 8} />}
        </View>
        <OvalRing w={W} h={H} progress={ok ? 1 : Math.max(0.02, progress / 100)} tone={ok ? "green" : "white"} />
        {ok && <View style={{ position: "absolute", bottom: -24, width: 72, height: 72, borderRadius: 36, backgroundColor: c.positive, alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: "#111" }}><Check size={34} strokeWidth={3} color={c.white} /></View>}
      </View>

      {ok ? (
        <>
          <T s="b" style={{ color: c.white, fontSize: 24, textAlign: "center", marginTop: 52 }}>Rosto verificado!</T>
          <T style={{ color: "#CFCFCF", textAlign: "center", marginTop: 6 }}>Prova de vida concluída com sucesso.</T>
          <View style={{ flex: 1 }} />
          <View style={{ paddingBottom: 20 }}><Button label="Continuar" variant="light" onPress={() => ctx.go("faceId")} /></View>
        </>
      ) : (
        <>
          <T s="s" style={{ color: c.white, fontSize: 17, textAlign: "center", marginTop: 34 }}>Mantenha o rosto dentro do contorno</T>
          <T style={{ color: "#CFCFCF", textAlign: "center", marginTop: 6 }} >{instr}</T>
          <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", marginTop: 18 }}>{pill("Iluminação boa")}{pill("Rosto centralizado")}</View>
          <View style={{ flex: 1 }} />
          <View style={{ paddingBottom: 28 }} accessibilityLabel={`Verificando, ${progress}%`}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}><T style={{ color: "#CFCFCF", fontSize: 13 }}>Verificando…</T><T s="s" style={{ color: c.white, fontSize: 13 }}>{progress}%</T></View>
            <View style={{ height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.2)" }}><View style={{ width: `${progress}%`, height: 5, borderRadius: 3, backgroundColor: c.white }} /></View>
          </View>
        </>
      )}
    </LinearGradient>
  );
}

export function FaceFail({ ctx }: { ctx: Ctx }) {
  const k = flow.kyc ?? { attempt: 1, left: 2 };
  const reason = (Icon: any, t: string) => (
    <View key={t} style={{ flexDirection: "row", gap: 12, alignItems: "center" }}><Icon size={18} strokeWidth={1.75} color={c.ink} /><T style={{ fontSize: 13, flex: 1 }}>{t}</T></View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: c.white, paddingHorizontal: 24 }}>
      <View style={{ marginTop: 8, alignItems: "flex-start" }}><CircleBtn icon={X} onPress={() => ctx.reset("faceIntro")} /></View>
      <View style={{ alignItems: "center", marginTop: 26 }}><HeroIcon icon={ScanFace} tone="negative" size={76} /></View>
      <T s="s" style={{ fontSize: 28, letterSpacing: -0.7, textAlign: "center", marginTop: 26, lineHeight: 32 }}>Não conseguimos{"\n"}verificar seu rosto</T>
      <T style={{ color: c.muted, textAlign: "center", lineHeight: 20, marginTop: 10 }}>Isso acontece às vezes. Confira as dicas abaixo e tente de novo.</T>
      <View style={{ backgroundColor: c.bg, borderRadius: 20, padding: 18, marginTop: 22, gap: 14 }}>
        <T s="s" style={{ fontSize: 13 }}>Possíveis motivos</T>
        {reason(Sun, "Pouca luz ou luz forte atrás de você")}{reason(ScanFace, "Rosto fora do contorno ou muito longe")}{reason(Glasses, "Óculos escuros, boné ou máscara")}
      </View>
      <View style={{ alignSelf: "center", backgroundColor: c.warningBg, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6, marginTop: 18 }}>
        <T s="m" style={{ color: c.warning, fontSize: 12 }}>{k.left > 0 ? `Tentativa ${k.attempt} de 3` : "Limite de tentativas atingido · revisão manual"}</T>
      </View>
      <View style={{ flex: 1 }} />
      <View style={{ paddingBottom: 20, gap: 10 }}>
        {k.left > 0 && <Button label="Tentar novamente" icon={Camera} onPress={() => ctx.go("faceCapture")} />}
        {/* TODO(kyc): document-based verification flow (out of scope for now). */}
        <Pressable onPress={() => notify("Em breve", "A verificação por documento ainda não está disponível.")} style={{ height: 52, borderRadius: 999, backgroundColor: c.bg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <IdCard size={18} strokeWidth={1.75} color={c.ink} /><T s="s" style={{ fontSize: 15 }}>Verificar com documento</T>
        </Pressable>
      </View>
    </View>
  );
}

export function FaceIdSetup({ ctx }: { ctx: Ctx }) {
  const [a, setA] = useState(true), [b, setB] = useState(true);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const skip = async () => { await auth.bioSkip().catch(() => {}); ctx.go("createPin"); };
  const enable = async () => {
    if (busy) return;
    setBusy(true); setMsg("");
    try {
      const hw = await LocalAuthentication.hasHardwareAsync(), enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hw || !enrolled) return setMsg("Face ID indisponível neste aparelho. Você pode usar o PIN.");
      const r = await LocalAuthentication.authenticateAsync({ promptMessage: "Ativar Face ID no Nuvo", cancelLabel: "Cancelar", disableDeviceFallback: true });
      if (!r.success) return setMsg(`Não foi possível confirmar o Face ID. Tente de novo ou toque em “Agora não”.${SHOW_DEV ? ` (${r.error})` : ""}`);
      const { deviceSecret } = await auth.bioEnable();
      const me = await auth.me();
      await saveRemembered({ email: me.email, name: me.name, initials: me.initials, biometric: true, deviceSecret });
      ctx.go("createPin");
    } catch { setMsg("Algo deu errado. Tente novamente."); } finally { setBusy(false); }
  };
  const row = (Icon: any, t: string, v: boolean, set: (x: boolean) => void, last?: boolean) => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.line }}>
      <Icon size={20} strokeWidth={1.75} color={c.ink} /><T s="m" style={{ flex: 1, fontSize: 15 }}>{t}</T>
      <Switch value={v} onValueChange={set} trackColor={{ true: c.ink, false: c.gray }} />
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: c.white, paddingHorizontal: 24 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <Back onPress={ctx.back} /><Pressable onPress={skip} hitSlop={10}><T s="s" style={{ color: c.muted }}>Pular</T></Pressable>
      </View>
      <View style={{ alignSelf: "center", width: 150, height: 150, borderRadius: 40, backgroundColor: c.ink, alignItems: "center", justifyContent: "center", marginTop: 26 }}><ScanFace size={84} strokeWidth={1.4} color={c.white} /></View>
      <T s="s" style={{ fontSize: 28, letterSpacing: -0.7, textAlign: "center", marginTop: 28, lineHeight: 32 }}>Entre só com{"\n"}seu rosto</T>
      <T style={{ color: c.muted, textAlign: "center", lineHeight: 20, marginTop: 10 }}>Use o Face ID para abrir o app e confirmar ações importantes, sem digitar senha.</T>
      <View style={{ borderWidth: 1, borderColor: c.line, borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, marginTop: 24 }}>
        <T s="m" style={{ color: c.muted, fontSize: 12 }}>Usar Face ID para</T>
        {row(LogIn, "Entrar no app", a, setA)}{row(ShieldCheck, "Confirmar pagamentos e PIN", b, setB, true)}
      </View>
      {msg ? <T style={{ color: c.negative, fontSize: 13, textAlign: "center", marginTop: 14 }}>{msg}</T> : null}
      <View style={{ flex: 1 }} />
      <View style={{ paddingBottom: 20 }}>
        <Button label={busy ? "Aguardando…" : "Ativar Face ID"} icon={ScanFace} onPress={enable} />
        <Pressable onPress={skip} style={{ alignItems: "center", paddingVertical: 16 }}><T s="s" style={{ color: c.muted }}>Agora não</T></Pressable>
      </View>
    </View>
  );
}
