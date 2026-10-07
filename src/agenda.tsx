import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { AddBtn, Back, SectionHeader, T } from "./ui";
import { brl, c, data } from "./theme";

const TODAY = data.today;
const WEEK = [4, 5, 6, 7, 8, 9, 10];
const LETTERS = ["D", "S", "T", "Q", "Q", "S", "S"];
const events = new Set([...data.bills, ...data.receivables].map((b) => b.day));

export function Agenda({ onBack, onAdd }: { onBack: () => void; onAdd: () => void }) {
  const [sel, setSel] = useState(TODAY);
  const paid = data.bills.filter((b) => b.st === "paid").reduce((s, b) => s + b.v, 0);
  const total = data.bills.reduce((s, b) => s + b.v, 0);
  const open = total - paid;
  const upcoming = data.bills.filter((b) => b.st === "due").sort((a, b) => a.day - b.day).slice(0, 5);
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <Back onPress={onBack} /><T s="s" style={{ fontSize: 17 }}>Agenda de contas</T><AddBtn onPress={onAdd} />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
        {WEEK.map((d, i) => {
          const on = d === sel;
          return (
            <Pressable key={d} onPress={() => setSel(d)} style={{ width: 44, height: 72, borderRadius: 14, alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: on ? c.ink : c.white, borderWidth: on ? 0 : 1, borderColor: c.line }}>
              <T s="m" style={{ fontSize: 12, color: on ? c.white : c.muted }}>{LETTERS[i]}</T>
              <T s="s" style={{ fontSize: 17, color: on ? c.white : c.ink }}>{d}</T>
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: events.has(d) && !on ? c.warning : "transparent" }} />
            </Pressable>
          );
        })}
      </View>

      <View style={{ backgroundColor: c.ink, borderRadius: 24, padding: 20, marginTop: 18 }}>
        <T style={{ color: "#A9A9A9", fontSize: 13 }}>Em aberto em outubro</T>
        <T s="s" style={{ color: c.white, fontSize: 34, letterSpacing: -1, marginTop: 6 }}>{brl(open)}</T>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: "#333", marginTop: 14, overflow: "hidden" }}>
          <View style={{ width: `${(paid / total) * 100}%`, height: 6, borderRadius: 3, backgroundColor: c.white }} />
        </View>
        <T style={{ color: "#A9A9A9", fontSize: 12, marginTop: 10 }}>{brl(paid)} pagos de {brl(total)}</T>
      </View>

      <View style={{ marginTop: 26 }}><SectionHeader title="Próximos vencimentos" action="Ver mês" /></View>
      <View style={{ marginTop: 12, gap: 12 }}>
        {upcoming.map((b) => {
          const n = b.day - TODAY;
          const warn = n <= 4;
          return (
            <View key={b.d} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
                <T s="s" style={{ fontSize: 18, lineHeight: 20 }}>{b.day}</T><T s="s" style={{ fontSize: 10, color: c.muted, letterSpacing: 0.5 }}>OUT</T>
              </View>
              <View style={{ flex: 1 }}>
                <T s="m" lines={1} style={{ fontSize: 16 }}>{b.d}</T>
                <T style={{ color: c.muted, fontSize: 13, marginTop: 2 }}>{b.acc} · débito automático</T>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <T s="s" style={{ fontSize: 16 }}>{brl(b.v)}</T>
                <View style={{ backgroundColor: warn ? c.warningBg : c.bg, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 3 }}>
                  <T s="m" style={{ fontSize: 12, color: warn ? c.warning : c.ink2 }}>em {n} dias</T>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
