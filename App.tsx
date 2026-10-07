import { useEffect, useState } from "react";
import { Platform, View, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { Home } from "./src/home";
import { Analysis } from "./src/analysis";
import { Cards } from "./src/cards";
import { Agenda } from "./src/agenda";
import { Connect } from "./src/connect";
import { NewTx } from "./src/newtx";
import { Profile, TxList } from "./src/misc";
import { OnboardingPager } from "./src/onboarding";
import { Done, Signup, SignupPassword, Terms, VerifyEmail } from "./src/signup";
import { FaceCapture, FaceFail, FaceIdSetup, FaceIntro } from "./src/face";
import { CreatePin, Forgot, Locked, Login, PinLogin, QuickFace, ResetCode, ResetDone, ResetNew, Splash, TwoFactor } from "./src/access";
import { Ctx, Route, routeForStep } from "./src/flowtypes";
import { TabBar, Tab } from "./src/ui";
import { AppWidth, c, data, setData, Tx } from "./src/theme";
import { auth, createTransaction, fetchOverview, setToken, Step } from "./src/api";
import { clearToken, flow, loadRemembered, loadToken, Remembered, saveRemembered, saveToken } from "./src/session";

const TABS: Tab[] = ["home", "analysis", "agenda", "profile"];
const MAIN: Route[] = ["home", "analysis", "agenda", "profile", "cards", "tx"];
const DARK: Route[] = ["splash", "onb", "faceCapture"];

function Shell() {
  const insets = useSafeAreaInsets();
  const [stack, setStack] = useState<Route[]>(["splash"]);
  const [newTx, setNewTx] = useState(false);
  const [txs, setTxs] = useState<Tx[]>(data.transactions);
  const [rem, setRem] = useState<Remembered | null>(null);
  const [revoked, setRevoked] = useState({ count: 0, devices: [] as string[] });
  const [, bump] = useState(0);
  const route = stack[stack.length - 1];

  const go = (r: Route) => setStack((s) => [...s, r]);
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const reset = (r: Route) => setStack([r]);
  const reload = async () => { const o = await fetchOverview(); setData(o); setTxs(o.transactions); bump((n) => n + 1); };

  const enterApp = async (opts?: { thenConnect?: boolean }) => {
    await reload();
    setStack(opts?.thenConnect ? ["home", "connect"] : ["home"]);
  };
  const authed = async (token: string, step: Step, email?: string) => {
    setToken(token); await saveToken(token);
    const me = await auth.me();
    const prev = await loadRemembered();
    const next: Remembered = { email: me.email, name: me.name, initials: me.initials, biometric: me.biometricEnabled && !!prev?.deviceSecret && prev.email === me.email, deviceSecret: prev?.email === me.email ? prev.deviceSecret : undefined };
    await saveRemembered(next); setRem(next);
    flow.email = email ?? me.email;
    if (step !== "DONE") return reset(routeForStep(step));
    if (flow.pinReset) return reset("createPin"); // forgot PIN: password re-auth done, set a new one
    await enterApp();
  };
  const ctx: Ctx = { go, back, reset, authed, enterApp };

  const boot = async () => {
    const r = await loadRemembered();
    setRem(r);
    const tok = await loadToken();
    if (tok) {
      setToken(tok);
      try {
        const me = await auth.me();
        flow.email = me.email;
        if (me.onboardingStep === "DONE") return enterApp();
        return reset(routeForStep(me.onboardingStep));
      } catch { setToken(null); await clearToken(); }
    }
    reset(r ? "quickFace" : "onb");
  };
  const logout = async () => {
    await auth.logout(); setToken(null); await clearToken();
    reset(rem ? "quickFace" : "onb");
  };

  const mainScreen = MAIN.includes(route);
  const dark = DARK.includes(route);
  // Web: tint the browser/status bar to match the current screen.
  useEffect(() => {
    if (Platform.OS === "web") document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#050505" : "#FFFFFF");
  }, [dark]);
  let body;
  switch (route) {
    case "splash": body = <Splash onDone={boot} />; break;
    case "onb": body = <OnboardingPager onCreate={() => go("signup")} onLogin={() => go("login")} />; break;
    case "login": body = <Login ctx={ctx} canFace={!!rem?.biometric} />; break;
    case "signup": body = <Signup ctx={ctx} />; break;
    case "signupPassword": body = <SignupPassword ctx={ctx} />; break;
    case "verifyEmail": body = <VerifyEmail ctx={ctx} />; break;
    case "terms": body = <Terms ctx={ctx} />; break;
    case "faceIntro": body = <FaceIntro ctx={ctx} />; break;
    case "faceCapture": body = <FaceCapture ctx={ctx} />; break;
    case "faceFail": body = <FaceFail ctx={ctx} />; break;
    case "faceId": body = <FaceIdSetup ctx={ctx} />; break;
    case "createPin": body = <CreatePin ctx={ctx} />; break;
    case "done": body = <Done ctx={ctx} name={rem?.name ?? ""} />; break;
    case "quickFace": body = rem ? <QuickFace ctx={ctx} rem={rem} /> : <Login ctx={ctx} canFace={false} />; break;
    case "pinLogin": body = rem ? <PinLogin ctx={ctx} rem={rem} /> : <Login ctx={ctx} canFace={false} />; break;
    case "twoFactor": body = <TwoFactor ctx={ctx} />; break;
    case "locked": body = <Locked ctx={ctx} />; break;
    case "forgot": body = <Forgot ctx={ctx} />; break;
    case "resetCode": body = <ResetCode ctx={ctx} />; break;
    case "resetNew": body = <ResetNew ctx={ctx} onDone={setRevoked} />; break;
    case "resetDone": body = <ResetDone ctx={ctx} revoked={revoked} />; break;
    case "home": body = <Home txs={txs} go={(r) => go(r as Route)} onNewTx={() => setNewTx(true)} />; break;
    case "analysis": body = <Analysis onBack={() => reset("home")} />; break;
    case "agenda": body = <Agenda onBack={() => reset("home")} onAdd={() => setNewTx(true)} />; break;
    case "cards": body = <Cards onBack={back} txs={txs} onAdd={() => go("connect")} />; break;
    case "connect": body = <Connect onBack={back} onDone={back} />; break;
    case "tx": body = <TxList txs={txs} onBack={back} />; break;
    case "profile": body = <Profile onLogout={logout} />; break;
  }

  return (
    <View style={{ flex: 1, backgroundColor: dark ? "#050505" : c.white, paddingTop: insets.top, paddingBottom: mainScreen ? 0 : insets.bottom }}>
      <StatusBar style={dark || route === "faceCapture" ? "light" : "dark"} />
      {body}
      {mainScreen && <TabBar active={TABS.includes(route as Tab) ? (route as Tab) : undefined} bottom={insets.bottom} onAdd={() => setNewTx(true)} onTab={(t) => reset(t)} />}
      {newTx && (
        <View style={{ position: "absolute", inset: 0, backgroundColor: c.white, paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <NewTx onClose={() => setNewTx(false)} onSave={async (b) => { await createTransaction(b); await reload(); setNewTx(false); }} />
        </View>
      )}
    </View>
  );
}

export default function App() {
  const [ok] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const { width, height } = useWindowDimensions();
  if (!ok) return null;
  // Native and phones: fill the screen. Wide web screens: phone-sized frame (tablet/desktop) or a centered column (landscape phone).
  const web = Platform.OS === "web";
  const framed = web && width > 500 && height >= 600;
  const column = web && width > 500 && !framed;
  const appW = framed ? 402 : column ? Math.min(width, 480) : width;
  const fullHeight = web ? ({ height: "100dvh" } as object) : { height: "100%" as const };
  return (
    <SafeAreaProvider>
      <AppWidth.Provider value={appW}>
        <View style={[{ width: "100%", backgroundColor: framed || column ? "#E5E5E5" : "#FFFFFF", alignItems: "center", justifyContent: "center" }, fullHeight]}>
          <View style={{ width: appW, height: framed ? Math.min(height - 32, 874) : "100%", borderRadius: framed ? 36 : 0, overflow: "hidden", backgroundColor: "#FFFFFF" }}>
            <Shell />
          </View>
        </View>
      </AppWidth.Provider>
    </SafeAreaProvider>
  );
}
