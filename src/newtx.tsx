import { useState } from "react";
import { Pressable, ScrollView, Switch, TextInput, View } from "react-native";
import { Calendar, ChevronRight, CreditCard, Pencil, Repeat, Sparkles, type LucideIcon } from "lucide-react-native";
import { Close, iconFor, T } from "./ui";
import { Button } from "./ui";
import { brl, c, catMeta, data, f } from "./theme";

const HINTS: [RegExp, string][] = [
  [/restaurante|ifood|padaria|lanche|caf[eé]/i, "alimentacao"], [/uber|99|posto|combust/i, "transporte"],
  [/netflix|spotify|assinatura/i, "assinaturas"], [/farm|drogasil|raia|consulta/i, "saude"],
  [/aluguel|condom|energia|luz|internet/i, "moradia"], [/renner|zara|amazon|loja/i, "compras"],
  [/cinema|bar|show|steam/i, "lazer"],
];
const accountsList = () => [...data.accounts.map((a: any) => ({ id: a.id as number, n: a.name })), ...data.cards.map((k: any) => ({ id: k.id as number, n: `${k.bank} •• ${k.last4}` }))];
const CHIPS = ["alimentacao", "transporte", "compras", "lazer", "saude", "moradia", "assinaturas"];

function Row({ icon: I, label, value, children, onPress }: { icon: LucideIcon; label: string; value?: string; children?: React.ReactNode; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: c.line, borderRadius: 18, padding: 12 }}>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}><I size={20} strokeWidth={1.75} color={c.ink} /></View>
      <View style={{ flex: 1 }}>
        <T style={{ color: c.muted, fontSize: 12 }}>{label}</T>
        {children ?? <T s="m" style={{ fontSize: 16, marginTop: 1 }}>{value}</T>}
      </View>
      {onPress && <ChevronRight size={18} color={c.subtle} />}
    </Pressable>
  );
}

export function NewTx({ onClose, onSave }: { onClose: () => void; onSave: (b: { description: string; amountCents: number; kind: "expense" | "income"; accountId: number; category?: string }) => Promise<void> }) {
  const ACCOUNTS = accountsList();
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [kind, setKind] = useState(0);
  const [cents, setCents] = useState(15000);
  const [desc, setDesc] = useState("Restaurante Sabor da Terra");
  const [cat, setCat] = useState("alimentacao");
  const [touched, setTouched] = useState(false);
  const [acc, setAcc] = useState(Math.max(0, ACCOUNTS.findIndex((a) => a.n.endsWith("4821"))));
  const [repeat, setRepeat] = useState(false);

  const hint = HINTS.find(([re]) => re.test(desc))?.[1];
  const category = kind === 1 ? "receita" : touched || !hint ? cat : hint;
  const onDesc = (t: string) => { setDesc(t); setTouched(false); };
  const save = async () => {
    if (saving || !cents || !desc.trim()) return setErr("Informe valor e descrição.");
    setSaving(true); setErr("");
    try {
      await onSave({ description: desc.trim(), amountCents: cents, kind: kind === 1 ? "income" : "expense", accountId: ACCOUNTS[acc].id, ...(touched ? { category } : {}) });
    } catch { setErr("Não foi possível salvar. Tente novamente."); setSaving(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.white, paddingHorizontal: 24 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <Close onPress={onClose} /><T s="s" style={{ fontSize: 17 }}>Nova transação</T><View style={{ width: 44 }} />
      </View>
      <View style={{ flexDirection: "row", backgroundColor: c.bg, borderRadius: 999, padding: 5, marginTop: 20 }}>
        {["Despesa", "Receita", "Transferir"].map((l, i) => (
          <Pressable key={l} onPress={() => setKind(i)} style={{ flex: 1, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: kind === i ? c.ink : "transparent" }}>
            <T s={kind === i ? "s" : "m"} style={{ color: kind === i ? c.white : c.muted }}>{l}</T>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 12 }}>
        <T style={{ color: c.muted, textAlign: "center", marginTop: 26 }}>Valor</T>
        <TextInput
          value={brl(cents / 100)} keyboardType="number-pad"
          onChangeText={(t) => setCents(Number(t.replace(/\D/g, "")) || 0)}
          style={{ fontFamily: f.s, fontSize: 52, letterSpacing: -1.5, textAlign: "center", color: c.ink, marginTop: 2 }}
        />
        {hint && kind !== 1 && (
          <View style={{ alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: c.bg, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, marginTop: 4 }}>
            <Sparkles size={16} strokeWidth={1.75} color={c.ink} /><T s="m" style={{ fontSize: 13 }}>Sugerido: {catMeta[hint].n} (94%)</T>
          </View>
        )}

        <T style={{ color: c.muted, marginTop: 24 }}>Categoria</T>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24, marginTop: 10 }} contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}>
          {CHIPS.map((k) => {
            const on = k === category;
            const Icon = iconFor(catMeta[k].ic);
            return (
              <Pressable key={k} onPress={() => { setCat(k); setTouched(true); }} style={{ height: 44, borderRadius: 999, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: on ? c.ink : c.bg }}>
                <Icon size={16} strokeWidth={1.75} color={on ? c.white : c.ink} /><T s="m" style={{ color: on ? c.white : c.ink }}>{catMeta[k].n}</T>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={{ gap: 10, marginTop: 18 }}>
          <Row icon={Pencil} label="Descrição">
            <TextInput value={desc} onChangeText={onDesc} style={{ fontFamily: f.m, fontSize: 16, color: c.ink, padding: 0, marginTop: 1 }} />
          </Row>
          <Row icon={CreditCard} label="Conta / cartão" value={ACCOUNTS[acc].n} onPress={() => setAcc((acc + 1) % ACCOUNTS.length)} />
          <Row icon={Calendar} label="Data" value="Hoje, 6 de outubro" onPress={() => {}} />
          <Row icon={Repeat} label="Repetir">
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <T s="m" style={{ fontSize: 16 }}>{repeat ? "Todo mês" : "Não repetir"}</T>
              <Switch value={repeat} onValueChange={setRepeat} trackColor={{ true: c.ink, false: c.gray }} />
            </View>
          </Row>
        </View>
      </ScrollView>
      <View style={{ paddingBottom: 24, paddingTop: 8 }}>{err ? <T style={{ color: c.negative, textAlign: "center", marginBottom: 8 }}>{err}</T> : null}<Button label={saving ? "Salvando…" : "Salvar transação"} onPress={save} /></View>
    </View>
  );
}
