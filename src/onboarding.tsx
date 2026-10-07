import { useEffect, useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import { Bell, Sparkles, Utensils } from "lucide-react-native";
import { CardVisual } from "./card";
import { Button, T } from "./ui";
import { brl, c, data, useAppWidth } from "./theme";

const ART_H = 380;

function Slide1() {
  const W = useAppWidth();
  return (
    <View style={{ width: W, height: ART_H, paddingHorizontal: 24 }}>
      <CardVisual theme="silver" label="Fatura atual" value={brl(data.cards[2].invoice)} height={170} style={{ position: "absolute", top: 0, left: 70, right: 24 }} />
      <CardVisual theme="graphite" label="Fatura atual" value={brl(data.cards[1].invoice)} height={170} style={{ position: "absolute", top: 80, left: 50, right: 44 }} />
      <CardVisual theme="black" label="Saldo total · 3 contas" value={brl(data.balance)} last4="4821" name="Felipe Andrade" brand="nuvo" height={190} style={{ position: "absolute", top: 160, left: 30, right: 64 }} />
    </View>
  );
}

const SEG = [0.31, 0.21, 0.16, 0.11, 0.09, 0.07, 0.04];
const SEG_COL = ["#FFFFFF", "#CECECE", "#A9A9A9", "#8F8F8F", "#6B6B6B", "#4A4A4A", "#333333"];
function Slide2() {
  const W = useAppWidth();
  const R = 66, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <View style={{ width: W, height: ART_H, paddingHorizontal: 24 }}>
      <View style={{ marginTop: 14, height: 330, borderRadius: 26, backgroundColor: "#161616", borderWidth: 1, borderColor: "#262626", padding: 20 }}>
        <T style={{ color: "#8F8F8F", fontSize: 13 }}>Gastos de outubro</T>
        <T s="s" style={{ color: c.white, fontSize: 24, letterSpacing: -0.5, marginTop: 4 }}>{brl(data.expenses)}</T>
        <View style={{ alignItems: "center", marginTop: 16 }}>
          <Svg width={190} height={190} viewBox="0 0 190 190">
            {SEG.map((p, i) => {
              const len = p * C; const el = <Circle key={i} cx={95} cy={95} r={R} fill="none" stroke={SEG_COL[i]} strokeWidth={30} strokeDasharray={`${Math.max(len - 2, 1)} ${C}`} strokeDashoffset={-acc} rotation={-90} origin="95,95" />; acc += len; return el;
            })}
          </Svg>
          <View style={{ position: "absolute", top: 82 }}><T style={{ color: "#A9A9A9", fontSize: 12 }}>7 categorias</T></View>
        </View>
      </View>
      <View style={{ position: "absolute", left: 14, top: 112, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: c.white, borderRadius: 999, paddingHorizontal: 12, height: 40 }}>
        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}><Utensils size={13} color={c.ink} strokeWidth={1.75} /></View>
        <T s="s" style={{ fontSize: 13 }}>Alimentação 21%</T>
      </View>
      <View style={{ position: "absolute", right: 14, top: 270, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: c.white, borderRadius: 999, paddingHorizontal: 12, height: 40 }}>
        <Sparkles size={16} color={c.ink} strokeWidth={1.75} /><T s="s" style={{ fontSize: 13 }}>Categorizado com IA</T>
      </View>
    </View>
  );
}

function Slide3() {
  const W = useAppWidth();
  const rows = [["10", "Fatura Inter", "em 4 dias", "R$ 412,00", true], ["12", "Energia", "em 6 dias", "R$ 238,70", false], ["15", "Fatura Nubank", "em 9 dias", "R$ 2.184,90", false], ["20", "Fatura Itaú", "em 14 dias", "R$ 1.326,40", false]] as const;
  return (
    <View style={{ width: W, height: ART_H, paddingHorizontal: 24 }}>
      <View style={{ marginTop: 14, borderRadius: 26, backgroundColor: "#161616", borderWidth: 1, borderColor: "#262626", padding: 20, height: 330 }}>
        <T style={{ color: "#8F8F8F", fontSize: 13 }}>Próximos vencimentos</T>
        {rows.map(([d, n, when, v, warn]) => (
          <View key={n} style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 14 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#262626", alignItems: "center", justifyContent: "center" }}>
              <T s="s" style={{ color: c.white, fontSize: 16, lineHeight: 18 }}>{d}</T><T style={{ color: "#8F8F8F", fontSize: 8, letterSpacing: 0.6 }}>OUT</T>
            </View>
            <View style={{ flex: 1 }}><T s="m" style={{ color: c.white, fontSize: 14 }}>{n}</T><T style={{ color: warn ? "#F5B33D" : "#8F8F8F", fontSize: 12 }}>{when}</T></View>
            <T s="s" style={{ color: c.white, fontSize: 14 }}>{v}</T>
          </View>
        ))}
      </View>
      <View style={{ position: "absolute", left: 60, right: 24, top: 290, backgroundColor: c.white, borderRadius: 18, padding: 12, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.ink, alignItems: "center", justifyContent: "center" }}><Bell size={18} color={c.white} strokeWidth={1.75} /></View>
        <View style={{ flex: 1 }}><T s="s" style={{ fontSize: 13 }}>Fatura Inter vence em 4 dias</T><T style={{ color: c.muted, fontSize: 11, marginTop: 1 }}>R$ 412,00 · débito automático</T></View>
      </View>
    </View>
  );
}

const COPY = [
  { t: "Suas finanças,\nnum só lugar.", d: "Conecte bancos e cartões, veja para onde vai seu dinheiro e nunca perca um vencimento." },
  { t: "Seus gastos,\norganizados sozinhos.", d: "O Nuvo categoriza cada compra e mostra para onde vai seu dinheiro em gráficos." },
  { t: "Nunca mais pague\njuros por esquecer.", d: "Agenda de contas com lembretes, faturas e recorrências num só lugar." },
];

/** 3 slides (A02/A03 are slides 2 and 3 of the existing M01). Swipe or tap "Próximo". */
export function OnboardingPager({ onCreate, onLogin }: { onCreate: () => void; onLogin: () => void }) {
  const W = useAppWidth();
  const [page, setPage] = useState(0);
  const sv = useRef<ScrollView>(null);
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => setPage(Math.round(e.nativeEvent.contentOffset.x / W));
  useEffect(() => { sv.current?.scrollTo({ x: page * W, animated: false }); }, [W]); // eslint-disable-line react-hooks/exhaustive-deps
  const goTo = (p: number) => { sv.current?.scrollTo({ x: p * W, animated: true }); setPage(p); };
  return (
    <LinearGradient colors={["#161616", "#050505"]} style={[{ flex: 1 }, { userSelect: "none" } as object]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, marginTop: 8, height: 36 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.white, alignItems: "center", justifyContent: "center" }}><T s="b" style={{ fontSize: 22, color: c.ink }}>n</T></View>
          <T s="s" style={{ color: c.white, fontSize: 22 }}>nuvo</T>
        </View>
        {page > 0 && <Pressable onPress={onCreate} hitSlop={10}><T s="s" style={{ color: "#A9A9A9", fontSize: 14 }}>Pular</T></Pressable>}
      </View>
      <ScrollView ref={sv} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onEnd} style={{ flexGrow: 0, marginTop: 18 }}>
        <Slide1 /><Slide2 /><Slide3 />
      </ScrollView>
      <View style={{ paddingHorizontal: 24, flex: 1 }}>
        <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }} accessibilityLabel={`Slide ${page + 1} de 3`}>
          {[0, 1, 2].map((i) => (
            <Pressable key={i} onPress={() => goTo(i)} hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }} accessibilityLabel={`Ir para o slide ${i + 1}`}>
              <View style={{ width: i === page ? 24 : 6, height: 6, borderRadius: 3, backgroundColor: i === page ? c.white : "#555" }} />
            </Pressable>
          ))}
        </View>
        <T s="s" style={{ color: c.white, fontSize: page === 0 ? 38 : 34, lineHeight: page === 0 ? 42 : 38, letterSpacing: -1, marginTop: 20 }}>{COPY[page].t}</T>
        <T style={{ color: "#9A9A9A", fontSize: 15, lineHeight: 22, marginTop: 12 }}>{COPY[page].d}</T>
        <View style={{ flex: 1 }} />
        <Button label={page === 1 ? "Próximo" : "Criar minha conta"} variant="light" onPress={page === 1 ? () => goTo(2) : onCreate} />
        <Pressable onPress={onLogin} style={{ alignItems: "center", paddingVertical: 18 }}><T s="s" style={{ color: c.white, fontSize: 14 }}>Já tenho conta · Entrar</T></Pressable>
      </View>
    </LinearGradient>
  );
}
