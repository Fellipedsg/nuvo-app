import mock from "../mock.json";
import { demoCall } from "./demo";

/** Hosted web demo: no server, in-memory fake API. */
export const DEMO = process.env.EXPO_PUBLIC_DEMO === "1";
/** Dev affordances (prefilled login, code banner, simulated-failure toggle). */
export const SHOW_DEV = __DEV__ || DEMO;

// iOS simulator shares the Mac's network. For a physical device set EXPO_PUBLIC_API_URL to the Mac's LAN IP.
const BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:3200";
let token: string | null = null;

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  if (DEMO) return demoCall(path, init) as Promise<T>;
  const res = await fetch(BASE + path, {
    ...init,
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}), ...init?.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error ?? `http_${res.status}`), { status: res.status, data: body });
  return body as T;
}

export const setToken = (t: string | null) => { token = t; };
export const hasToken = () => !!token;
const post = <T,>(path: string, b?: object, tok?: string) =>
  call<T>(path, { method: "POST", body: JSON.stringify(b ?? {}), ...(tok ? { headers: { authorization: `Bearer ${tok}` } } : {}) });

type Dev = { deviceId: string; deviceName: string };
export type Step = "PERSONAL_DATA" | "PASSWORD" | "EMAIL_VERIFY" | "TERMS" | "FACE" | "BIOMETRIC" | "PIN" | "DONE";
type Authed = { token: string; onboardingStep: Step };
type Challenge = { require2fa: true; challengeToken: string; phoneMasked: string | null; deviceName: string };

export const auth = {
  login: (email: string, password: string, d: Dev) => post<Authed | Challenge>("/api/auth/login", { email, password, ...d }),
  signup: (b: { name: string; email: string; cpf: string; phone: string }, d: Dev) => post<Authed>("/api/auth/signup", { ...b, ...d }),
  setPassword: (password: string) => post<{ onboardingStep: Step }>("/api/auth/password", { password }),
  otpSend: (purpose: string, o: { target?: string; channel?: "email" | "sms" } = {}, tok?: string) => post<{ ok: true }>("/api/auth/otp/send", { purpose, ...o }, tok),
  otpVerify: (purpose: string, code: string, o: { target?: string; channel?: "email" | "sms" } = {}, tok?: string) =>
    post<{ ok: boolean; attemptsLeft: number; onboardingStep?: Step }>("/api/auth/otp/verify", { purpose, code, ...o }, tok),
  consents: (c: { terms: boolean; privacy: boolean; openFinanceCpf: boolean; marketing: boolean }) => post<{ onboardingStep: Step }>("/api/auth/consents", c),
  kycStart: (simulateFail?: boolean) => post<{ sessionId: string }>("/api/kyc/liveness/session", { simulateFail }),
  kycPoll: (id: string) => call<{ status: "PENDING" | "APPROVED" | "REJECTED"; progress: number; attempt: number; attemptsLeft: number }>(`/api/kyc/liveness/${id}`),
  bioEnable: () => post<{ deviceSecret: string }>("/api/auth/biometric/enable"),
  bioSkip: () => post("/api/auth/biometric/skip"),
  bioLogin: (email: string, deviceSecret: string, d: Dev) => post<Authed>("/api/auth/biometric/login", { email, deviceSecret, ...d }),
  setPin: (pin: string) => post<{ onboardingStep: Step }>("/api/auth/pin", { pin }),
  pinLogin: (email: string, pin: string, d: Dev) => post<Authed>("/api/auth/pin/login", { email, pin, ...d }),
  reset: (target: string, channel: "email" | "sms", code: string, newPassword: string) =>
    post<{ ok: true; revoked: { count: number; devices: string[] } }>("/api/auth/password/reset", { target, channel, code, newPassword }),
  me: () => call<{ name: string; fullName: string; email: string; initials: string; onboardingStep: Step; biometricEnabled: boolean; kycStatus: string }>("/api/auth/me"),
  logout: () => post("/api/auth/logout").catch(() => {}),
  devCode: (target: string) => call<{ code: string | null }>(`/api/dev/code?target=${encodeURIComponent(target)}`),
};

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const dateLabel = (iso: string) => `${iso.slice(8, 10)} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;
const r = (cents: number) => cents / 100; // API is in cents; screens format reais at the edge only

type ApiAccount = { id: number; bank: string; name: string; label: string | null; type: string; last4: string | null; balance_cents: number; limit_cents: number | null; due: string | null; close: string | null; theme: string | null; sync_label: string | null };
type ApiTx = { id: number; account_name: string; date: string; description: string; subtitle: string; amount_cents: number; category: string; source: string };
type ApiBill = { kind: string; description: string; due_date: string; amount_cents: number; status: string; icon: string | null; account_name: string | null };

export async function fetchOverview() {
  const o = await call<any>("/api/overview");
  const accounts = o.accounts as ApiAccount[];
  const day = (d: string) => Number(d.slice(8, 10));
  return {
    ...mock, // static metadata (category icons, bank logos) stays client-side
    user: { ...o.user, full: o.user.full_name } as { name: string; full: string; email: string; initials: string },
    today: day(o.today),
    delta: o.expense_delta_pct as number | null,
    balance: r(o.balance_cents), income: r(o.income_cents), expenses: r(o.expense_cents), savings: r(o.savings_cents),
    accounts: accounts.filter((a) => a.type === "checking").map((a) => ({ id: a.id, bank: a.bank, name: a.name, type: a.label ?? "Conta corrente", balance: r(a.balance_cents), sync: a.sync_label ?? "" })),
    cards: accounts.filter((a) => a.type === "credit_card").map((a) => ({ id: a.id, bank: (mock.banks as Record<string, { n: string }>)[a.bank]?.n ?? a.bank, key: a.bank, name: a.name, last4: a.last4!, invoice: r(a.balance_cents), limit: r(a.limit_cents!), due: a.due!, close: a.close!, theme: a.theme! })),
    categories: (o.categories as { key: string; spent_cents: number; budget_cents: number }[]).map((c) => ({ k: c.key, v: r(c.spent_cents), budget: r(c.budget_cents) })),
    transactions: (o.transactions as ApiTx[]).map((t) => ({ d: t.description, s: t.subtitle, cat: t.category, acc: t.account_name, date: dateLabel(t.date), v: r(t.amount_cents), auto: t.source !== "USER" })),
    bills: (o.bills as ApiBill[]).filter((b) => b.kind === "PAYABLE").map((b) => ({ d: b.description, day: day(b.due_date), v: r(b.amount_cents), st: b.status === "PAID" ? "paid" : "due", ic: b.icon ?? "credit-card", acc: b.account_name ?? "" })),
    receivables: (o.bills as ApiBill[]).filter((b) => b.kind === "RECEIVABLE").map((b) => ({ d: b.description, day: day(b.due_date), v: r(b.amount_cents), st: b.status === "PAID" ? "received" : "expected" })),
  };
}

export const createTransaction = (b: { description: string; amountCents: number; kind: "expense" | "income"; accountId: number; category?: string }) =>
  call("/api/transactions", { method: "POST", body: JSON.stringify(b) });
