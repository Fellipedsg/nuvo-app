import { createContext, useContext } from "react";
import mock from "../mock.json";

/** Width the app is laid out in. On wide web screens the app is framed as a phone (see App.tsx). */
export const AppWidth = createContext(402);
export const useAppWidth = () => useContext(AppWidth);

export const c = {
  ink: "#0A0A0A", ink2: "#3A3A3A", muted: "#6B6B6B", subtle: "#A9A9A9", gray: "#CECECE",
  line: "#E8E8E8", bg: "#F5F5F5", bg2: "#EFEFEF", white: "#FFFFFF",
  positive: "#1F9D55", positiveBg: "#E7F6EE", negative: "#E5484D", negativeBg: "#FDECEC",
  warning: "#C27C0E", warningBg: "#FDF3E1",
  chart: ["#0A0A0A", "#3A3A3A", "#6B6B6B", "#8F8F8F", "#A9A9A9", "#CECECE", "#E3E3E3"],
};

export const f = { r: "Inter_400Regular", m: "Inter_500Medium", s: "Inter_600SemiBold", b: "Inter_700Bold" };

const nf = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
// Mock holds reais as floats; round to cents before formatting.
export const brl = (v: number) => nf.format(Math.round(v * 100) / 100).replace(/ /g, " ");
export const signed = (v: number) => (v < 0 ? "− " : "+ ") + brl(Math.abs(v));

export type Tx = (typeof mock.transactions)[number];
export type Card = (typeof mock.cards)[number] & { id?: number };
// Overview from the API replaces the mock after login (live binding: importers see the new value on re-render).
export type Overview = typeof mock & { delta?: number | null };
export let data: Overview = mock;
export const setData = (d: Overview) => { data = d; };
export const catMeta = mock.categoriesMeta as Record<string, { n: string; ic: string }>;
export const banks = mock.banks as Record<string, { n: string; i: string; bg: string; fg?: string }>;
