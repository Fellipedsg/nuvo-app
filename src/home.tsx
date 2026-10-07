import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Bell, Calendar, ChartPie, CreditCard, Eye, EyeOff, ArrowLeftRight, Plus, Search, TrendingUp, type LucideIcon } from "lucide-react-native";
import { BankLogo, CircleBtn, SectionHeader, T, TxRow } from "./ui";
import { brl, c, data, Tx } from "./theme";

export function Home({ txs, go, onNewTx }: { txs: Tx[]; go: (r: string) => void; onNewTx: () => void }) {
  const [hide, setHide] = useState(false);
  const quick: [string, LucideIcon, string][] = [["Transações", ArrowLeftRight, "tx"], ["Agenda", Calendar, "agenda"], ["Cartões", CreditCard, "cards"], ["Relatórios", ChartPie, "analysis"]];
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.ink, alignItems: "center", justifyContent: "center" }}>
          <T s="s" style={{ color: c.white, fontSize: 16 }}>{data.user.initials}</T>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <T style={{ color: c.muted, fontSize: 13 }}>Boa noite,</T>
          <T s="s" style={{ fontSize: 18 }}>{data.user.name}</T>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}><CircleBtn icon={Search} /><CircleBtn icon={Bell} dot /></View>
      </View>

      <LinearGradient colors={["#1B1B1B", "#050505"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 24, padding: 20, marginTop: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Pressable onPress={() => setHide(!hide)} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <T style={{ color: "#A9A9A9", fontSize: 13 }}>Saldo total</T>
            {hide ? <EyeOff size={16} color="#A9A9A9" strokeWidth={1.75} /> : <Eye size={16} color="#A9A9A9" strokeWidth={1.75} />}
          </Pressable>
          <View style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 }}><T s="m" style={{ color: c.white, fontSize: 12 }}>Out 2026</T></View>
        </View>
        <T s="s" style={{ color: c.white, fontSize: 38, letterSpacing: -1.1, marginTop: 8 }}>{hide ? "R$ ••••••" : brl(data.balance)}</T>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
          <TrendingUp size={14} color="#3DD68C" strokeWidth={2} /><T s="m" style={{ color: "#3DD68C", fontSize: 13 }}>+ {brl(data.savings)} este mês</T>
        </View>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
          <Pressable onPress={() => go("connect")} style={{ flex: 1, height: 48, borderRadius: 999, backgroundColor: c.white, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Plus size={18} strokeWidth={2} color={c.ink} /><T s="s" style={{ fontSize: 15 }}>Conectar</T>
          </Pressable>
          <Pressable onPress={onNewTx} style={{ flex: 1, height: 48, borderRadius: 999, backgroundColor: "#262626", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <ArrowLeftRight size={18} strokeWidth={1.75} color={c.white} /><T s="s" style={{ fontSize: 15, color: c.white }}>Transação</T>
          </Pressable>
        </View>
      </LinearGradient>

      <View style={{ marginTop: 28 }}><SectionHeader title="Contas" action="Ver todas" onAction={() => go("connect")} /></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24, marginTop: 14 }} contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}>
        {data.accounts.map((a) => (
          <View key={a.bank} style={{ width: 158, borderRadius: 20, borderWidth: 1, borderColor: c.line, padding: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><BankLogo k={a.bank} size={34} /><T s="s" style={{ fontSize: 15 }}>{a.name}</T></View>
            <T style={{ color: c.muted, fontSize: 12, marginTop: 14 }}>{a.type}</T>
            <T s="s" style={{ fontSize: 16, marginTop: 2 }}>{brl(a.balance)}</T>
          </View>
        ))}
      </ScrollView>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 26 }}>
        {quick.map(([label, I, to]) => (
          <Pressable key={label} onPress={() => go(to)} style={{ alignItems: "center", gap: 8, width: 80 }}>
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}><I size={22} strokeWidth={1.75} color={c.ink} /></View>
            <T s="m" style={{ fontSize: 12 }}>{label}</T>
          </Pressable>
        ))}
      </View>

      <View style={{ marginTop: 28 }}><SectionHeader title="Transações recentes" action="Ver todas" onAction={() => go("tx")} /></View>
      <View style={{ marginTop: 6 }}>{txs.slice(0, 6).map((t, i) => <TxRow key={i} t={t} />)}</View>
    </ScrollView>
  );
}
