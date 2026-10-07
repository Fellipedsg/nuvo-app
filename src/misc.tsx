import { Pressable, ScrollView, View } from "react-native";
import { Back, T, TxRow } from "./ui";
import { c, data, Tx } from "./theme";

export function TxList({ txs, onBack }: { txs: Tx[]; onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 130 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, marginBottom: 12 }}>
        <Back onPress={onBack} /><T s="s" style={{ fontSize: 17 }}>Transações</T><View style={{ width: 44 }} />
      </View>
      {txs.map((t, i) => <TxRow key={i} t={t} />)}
    </ScrollView>
  );
}

export function Profile({ onLogout }: { onLogout: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: "center", paddingTop: 48, paddingHorizontal: 24 }}>
      <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: c.ink, alignItems: "center", justifyContent: "center" }}>
        <T s="s" style={{ color: c.white, fontSize: 30 }}>{data.user.initials}</T>
      </View>
      <T s="s" style={{ fontSize: 24, marginTop: 16 }}>{data.user.full}</T>
      <T style={{ color: c.muted, marginTop: 4 }}>{data.user.email}</T>
      <Pressable onPress={onLogout} style={{ marginTop: 32, borderWidth: 1, borderColor: c.gray, borderRadius: 999, paddingHorizontal: 28, paddingVertical: 14 }}><T s="s">Sair</T></Pressable>
    </View>
  );
}
