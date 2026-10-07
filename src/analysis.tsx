import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { ChevronLeft, ChevronRight, ListFilter } from "lucide-react-native";
import { Back, CircleBtn, iconFor, SectionHeader, T } from "./ui";
import { brl, c, catMeta, data } from "./theme";

const R = 106, SW = 28, CIRC = 2 * Math.PI * R;

function Donut({ values, total }: { values: number[]; total: number }) {
  const gap = 4;
  let acc = 0;
  return (
    <View style={{ width: 260, height: 260, alignSelf: "center", marginTop: 8 }}>
      <Svg width={260} height={260} viewBox="0 0 260 260" accessibilityLabel="Gastos por categoria">
        <Circle cx={130} cy={130} r={R} stroke={c.line} strokeWidth={SW} fill="none" opacity={0} />
        {values.map((v, i) => {
          const len = (v / total) * CIRC;
          const el = (
            <Circle key={i} cx={130} cy={130} r={R} fill="none" stroke={c.chart[i]} strokeWidth={SW}
              strokeDasharray={`${Math.max(len - gap, 1)} ${CIRC}`} strokeDashoffset={-acc} rotation={-90} origin="130,130" />
          );
          acc += len;
          return el;
        })}
      </Svg>
      <View style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>
        <T style={{ color: c.muted, fontSize: 13 }}>Gasto total</T>
        <T s="s" style={{ fontSize: 26, letterSpacing: -0.6, marginTop: 2 }}>{brl(total)}</T>
        <View style={{ backgroundColor: (data.delta ?? 0) > 0 ? c.negativeBg : c.positiveBg, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8 }}>
          <T s="m" style={{ color: (data.delta ?? 0) > 0 ? c.negative : c.positive, fontSize: 12 }}>{data.delta == null ? "—" : `${data.delta > 0 ? "+" : "−"}${Math.abs(data.delta).toFixed(1).replace(".", ",")}% vs set`}</T>
        </View>
      </View>
    </View>
  );
}

export function Analysis({ onBack }: { onBack: () => void }) {
  const [range, setRange] = useState(1);
  const total = data.expenses;
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <Back onPress={onBack} /><T s="s" style={{ fontSize: 17 }}>Análise de gastos</T><CircleBtn icon={ListFilter} />
      </View>
      <View style={{ flexDirection: "row", backgroundColor: c.bg, borderRadius: 999, padding: 5, marginTop: 20 }}>
        {["Semana", "Mês", "Ano"].map((l, i) => (
          <Pressable key={l} onPress={() => setRange(i)} style={{ flex: 1, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: range === i ? c.ink : "transparent" }}>
            <T s={range === i ? "s" : "m"} style={{ color: range === i ? c.white : c.muted }}>{l}</T>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
        <ChevronLeft size={20} color={c.muted} /><T s="s" style={{ fontSize: 16 }}>Outubro 2026</T><ChevronRight size={20} color={c.ink} />
      </View>
      <Donut values={data.categories.map((x) => x.v)} total={total} />

      <View style={{ marginTop: 28 }}><SectionHeader title="Por categoria" action="Orçamentos" /></View>
      <View style={{ marginTop: 14, gap: 18 }}>
        {data.categories.map((cat, i) => {
          const pct = Math.round((cat.v / cat.budget) * 100);
          const col = pct > 100 ? c.negative : pct >= 90 ? c.warning : c.ink;
          const Icon = iconFor(catMeta[cat.k].ic);
          return (
            <View key={cat.k} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
                <Icon size={20} strokeWidth={1.75} color={c.ink} />
                <View style={{ position: "absolute", right: 0, bottom: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: c.chart[i], borderWidth: 1.5, borderColor: c.white }} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <T s="m" style={{ fontSize: 16 }}>{catMeta[cat.k].n}</T><T s="s" style={{ fontSize: 16 }}>{brl(cat.v)}</T>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: c.bg2, overflow: "hidden" }}>
                    <View style={{ width: `${Math.min(pct, 100)}%`, height: 6, borderRadius: 3, backgroundColor: col }} />
                  </View>
                  <T s="m" style={{ color: col, fontSize: 12, width: 38, textAlign: "right" }}>{pct}%</T>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
