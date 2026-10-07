import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { Check, ChevronRight, Lock, Search, ShieldCheck } from "lucide-react-native";
import { Back, BankLogo, Button, T } from "./ui";
import { banks, c, f } from "./theme";

const POPULAR = ["bradesco", "bb", "santander", "caixa", "c6", "btg", "picpay"];

export function Connect({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [step, setStep] = useState(1);
  const [sel, setSel] = useState("bradesco");
  const [q, setQ] = useState("");
  const list = POPULAR.filter((k) => banks[k].n.toLowerCase().includes(q.toLowerCase()));
  return (
    <View style={{ flex: 1, paddingHorizontal: 24, backgroundColor: c.white }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <Back onPress={() => (step > 1 ? setStep(step - 1) : onBack())} /><T style={{ color: c.muted }}>Passo {step} de 3</T>
      </View>
      <View style={{ flexDirection: "row", gap: 4, marginTop: 16 }}>
        {[1, 2, 3].map((s) => <View key={s} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: s <= step ? c.ink : c.line }} />)}
      </View>

      {step === 1 && (
        <>
          <T s="s" style={{ fontSize: 32, letterSpacing: -0.9, marginTop: 28 }}>Escolha seu banco</T>
          <T style={{ color: c.muted, fontSize: 15, lineHeight: 21, marginTop: 8 }}>Conexão segura via Open Finance Brasil.{"\n"}O Nuvo só tem acesso de leitura.</T>
          <View style={{ height: 56, borderRadius: 999, backgroundColor: c.bg, flexDirection: "row", alignItems: "center", paddingHorizontal: 18, gap: 12, marginTop: 20 }}>
            <Search size={20} color={c.muted} strokeWidth={1.75} />
            <TextInput value={q} onChangeText={setQ} placeholder="Buscar instituição" placeholderTextColor={c.subtle} style={{ flex: 1, fontFamily: f.r, fontSize: 16 }} />
          </View>
          <T s="s" style={{ color: c.subtle, fontSize: 11, letterSpacing: 0.9, marginTop: 22, marginBottom: 10 }}>POPULARES</T>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 12 }}>
            {list.map((k) => {
              const on = k === sel;
              return (
                <Pressable key={k} onPress={() => setSel(k)} style={{ height: 56, borderRadius: 16, borderWidth: on ? 1.5 : 1, borderColor: on ? c.ink : c.line, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 12 }}>
                  <BankLogo k={k} />
                  <T s="m" style={{ flex: 1, fontSize: 16 }}>{banks[k].n}</T>
                  {on ? <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.ink, alignItems: "center", justifyContent: "center" }}><Check size={14} color={c.white} strokeWidth={3} /></View> : <ChevronRight size={18} color={c.subtle} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      )}

      {step === 2 && (
        <View style={{ flex: 1 }}>
          <T s="s" style={{ fontSize: 32, letterSpacing: -0.9, marginTop: 28 }}>Permissões</T>
          <T style={{ color: c.muted, fontSize: 15, lineHeight: 21, marginTop: 8 }}>Você autoriza o Nuvo a consultar, por 12 meses:</T>
          <View style={{ marginTop: 22, gap: 12 }}>
            {[["Saldos e extratos", true], ["Faturas e limites de cartão", true], ["Movimentar dinheiro ou pagar contas", false], ["Senhas e credenciais", false]].map(([l, ok]) => (
              <View key={String(l)} style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.bg, borderRadius: 16, padding: 16 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: ok ? c.positiveBg : c.negativeBg, alignItems: "center", justifyContent: "center" }}>
                  {ok ? <Check size={16} color={c.positive} strokeWidth={2.5} /> : <Lock size={14} color={c.negative} strokeWidth={2} />}
                </View>
                <T s="m" style={{ flex: 1 }}>{String(l)}</T><T style={{ color: c.muted, fontSize: 12 }}>{ok ? "Lê" : "Nunca"}</T>
              </View>
            ))}
          </View>
        </View>
      )}

      {step === 3 && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 14 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: c.ink, alignItems: "center", justifyContent: "center" }}><ShieldCheck size={36} color={c.white} strokeWidth={1.75} /></View>
          <T s="s" style={{ fontSize: 28, letterSpacing: -0.7 }}>{banks[sel].n} conectado</T>
          <T style={{ color: c.muted, textAlign: "center", lineHeight: 21 }}>Estamos importando suas transações e categorizando automaticamente.</T>
        </View>
      )}

      <View style={{ paddingBottom: 24, paddingTop: 8 }}>
        <Button label={step === 3 ? "Concluir" : "Continuar"} onPress={() => (step === 3 ? onDone() : setStep(step + 1))} />
      </View>
    </View>
  );
}
