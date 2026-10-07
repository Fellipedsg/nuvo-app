import { useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, View } from "react-native";
import { FileText, Snowflake } from "lucide-react-native";
import { CardVisual, CardTheme } from "./card";
import { AddBtn, Back, Button, SectionHeader, T, TxRow } from "./ui";
import { brl, c, data, Tx, useAppWidth } from "./theme";

export function Cards({ onBack, txs, onAdd }: { onBack: () => void; txs: Tx[]; onAdd: () => void }) {
  const CW = useAppWidth() - 48 - 16; // card width leaves a peek of the next card
  const [i, setI] = useState(0);
  const sv = useRef<ScrollView>(null);
  const [blocked, setBlocked] = useState<Record<number, boolean>>({});
  const card = data.cards[i];
  const used = card.invoice / card.limit;
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setI(Math.round(e.nativeEvent.contentOffset.x / (CW + 12)));
  const list = txs.filter((t) => t.s.includes(card.last4));
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, marginTop: 8 }}>
        <Back onPress={onBack} /><T s="s" style={{ fontSize: 17 }}>Cartões</T><AddBtn onPress={onAdd} />
      </View>
      <ScrollView ref={sv} horizontal pagingEnabled={false} snapToInterval={CW + 12} decelerationRate="fast" showsHorizontalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16} style={{ marginTop: 20 }} contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}>
        {data.cards.map((k, idx) => (
          <View key={k.last4} style={{ width: CW, opacity: blocked[idx] ? 0.45 : 1 }}>
            <CardVisual theme={k.theme as CardTheme} label="Fatura atual" value={brl(k.invoice)} last4={k.last4} name={k.name} brand={k.bank} height={180} />
          </View>
        ))}
      </ScrollView>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 14 }}>
        {data.cards.map((_, k) => (
          <Pressable key={k} onPress={() => { sv.current?.scrollTo({ x: k * (CW + 12), animated: true }); setI(k); }} hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }} accessibilityLabel={`Ver cartão ${k + 1}`}>
            <View style={{ width: k === i ? 22 : 6, height: 6, borderRadius: 3, backgroundColor: k === i ? c.ink : c.gray }} />
          </Pressable>
        ))}
      </View>

      <View style={{ paddingHorizontal: 24 }}>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
          <Button label="Detalhes" variant="outline" icon={FileText} style={{ flex: 1, height: 52 }} />
          <Button label={blocked[i] ? "Desbloquear" : "Bloquear"} variant="outline" icon={Snowflake} style={{ flex: 1, height: 52 }} onPress={() => setBlocked({ ...blocked, [i]: !blocked[i] })} />
        </View>

        <View style={{ backgroundColor: c.bg, borderRadius: 20, padding: 20, marginTop: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <T style={{ color: c.muted, fontSize: 13 }}>Fatura de outubro</T>
            <View style={{ backgroundColor: c.warningBg, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}><T s="m" style={{ color: c.warning, fontSize: 12 }}>Aberta</T></View>
          </View>
          <T s="s" style={{ fontSize: 30, letterSpacing: -0.8, marginTop: 6 }}>{brl(card.invoice)}</T>
          <T style={{ color: c.muted, fontSize: 13, marginTop: 6 }}>Vence {card.due} · fecha {card.close}</T>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: c.gray, marginTop: 14, overflow: "hidden" }}>
            <View style={{ width: `${used * 100}%`, height: 8, borderRadius: 4, backgroundColor: c.ink }} />
          </View>
          <T style={{ color: c.muted, fontSize: 13, marginTop: 10 }}>Limite disponível {brl(card.limit - card.invoice)}</T>
        </View>

        <View style={{ marginTop: 26 }}><SectionHeader title="Lançamentos da fatura" action="Ver todos" /></View>
        <View style={{ marginTop: 6 }}>{list.map((t, k) => <TxRow key={k} t={t} />)}</View>
      </View>
    </ScrollView>
  );
}
