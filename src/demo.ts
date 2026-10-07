import mock from "../mock.json";

// In-browser stand-in for nuvo-api, used by the hosted web demo (EXPO_PUBLIC_DEMO=1). State resets on reload.
const cents = (v: number) => Math.round(v * 100);
const THEMES = ["black", "graphite", "silver"];
type Tx = { id: number; account_id: number; account_name: string; date: string; description: string; subtitle: string; amount_cents: number; category: string; source: string; status: string };

const accounts = [
  ...mock.accounts.map((a, i) => ({ id: i + 1, bank: a.bank, name: a.name, label: a.type, type: "checking", last4: null as string | null, balance_cents: cents(a.balance), limit_cents: null as number | null, due: null as string | null, close: null as string | null, theme: null as string | null, sync_label: a.sync })),
  ...mock.cards.map((k, i) => ({ id: i + 4, bank: k.key, name: k.name, label: null, type: "credit_card", last4: k.last4, balance_cents: cents(k.invoice), limit_cents: cents(k.limit), due: k.due, close: k.close, theme: THEMES[i], sync_label: null })),
];
const byName = (n: string) => accounts.find((a) => a.name === n)!;
const day = (s: string) => `2026-10-${s.slice(0, 2)}`;

const txs: Tx[] = mock.transactions.map((t, i) => {
  const last4 = t.s.match(/•• (\d{4})/)?.[1];
  const acc = last4 ? accounts.find((a) => a.last4 === last4)! : byName(t.acc);
  return { id: i + 1, account_id: acc.id, account_name: acc.name, date: day(t.date), description: t.d, subtitle: t.s, amount_cents: cents(t.v), category: t.cat, source: t.auto ? "RULE" : "USER", status: "POSTED" };
});
let nextId = 100;
const state = { extra: { income: 0, expense: 0 } };

const RULES: [RegExp, string][] = [
  [/ifood|restaurante|padaria|lanche|caf[eé]/i, "alimentacao"], [/mercado|assa[ií]|carrefour|pão de a/i, "alimentacao"],
  [/uber|99|posto|shell/i, "transporte"], [/netflix|spotify|assinatura/i, "assinaturas"], [/farm|drogasil|raia/i, "saude"],
  [/aluguel|condom|energia|internet/i, "moradia"], [/renner|zara|amazon|loja/i, "compras"], [/cinema|bar |show|steam/i, "lazer"],
];

function overview() {
  const spent = mock.categories.map((c) => ({ key: c.k, spent_cents: cents(c.v), budget_cents: cents(c.budget) }));
  for (const t of txs.filter((t) => t.id >= 100 && t.amount_cents < 0)) {
    const row = spent.find((s) => s.key === t.category);
    if (row) row.spent_cents += -t.amount_cents;
  }
  return {
    user: { name: mock.user.name, full_name: mock.user.full, email: mock.user.email, initials: mock.user.initials },
    today: "2026-10-06", month: "2026-10",
    income_cents: cents(mock.income) + state.extra.income, expense_cents: cents(mock.expenses) + state.extra.expense,
    savings_cents: cents(mock.income) + state.extra.income - cents(mock.expenses) - state.extra.expense,
    expense_delta_pct: -9.7,
    balance_cents: accounts.filter((a) => a.type === "checking").reduce((s, a) => s + a.balance_cents, 0),
    accounts, categories: spent,
    transactions: [...txs].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id)),
    bills: [
      ...mock.bills.map((b) => ({ kind: "PAYABLE", description: b.d, due_date: `2026-10-${String(b.day).padStart(2, "0")}`, amount_cents: cents(b.v), status: b.st === "paid" ? "PAID" : "OPEN", icon: b.ic, account_name: b.acc })),
      ...mock.receivables.map((b) => ({ kind: "RECEIVABLE", description: b.d, due_date: `2026-10-${String(b.day).padStart(2, "0")}`, amount_cents: cents(b.v), status: b.st === "received" ? "PAID" : "OPEN", icon: null, account_name: null })),
    ],
  };
}

const fail = (status: number, data: object = {}) => Promise.reject(Object.assign(new Error("demo"), { status, data }));
let kyc: { start: number; fail: boolean; rejections: number } = { start: 0, fail: false, rejections: 0 };
export const DEMO_CODE = "123456";

export async function demoCall(path: string, init?: RequestInit): Promise<any> {
  const body = init?.body ? JSON.parse(String(init.body)) : {};
  await new Promise((r) => setTimeout(r, 250));
  const user = { name: mock.user.name, fullName: mock.user.full, email: mock.user.email, initials: mock.user.initials, onboardingStep: "DONE", biometricEnabled: false, kycStatus: "APPROVED" };

  if (path === "/api/overview") return overview();
  if (path === "/api/auth/login") return { token: "demo", onboardingStep: "DONE" }; // demo: no 2FA on the shared link
  if (path === "/api/auth/me") return user;
  if (path === "/api/auth/signup") return { token: "demo", onboardingStep: "PASSWORD" };
  if (path === "/api/auth/password") return { onboardingStep: "EMAIL_VERIFY" };
  if (path === "/api/auth/otp/send") return { ok: true };
  if (path === "/api/auth/otp/verify") return body.code === DEMO_CODE ? { ok: true, attemptsLeft: 3, onboardingStep: "TERMS" } : fail(400, { attemptsLeft: 2 });
  if (path === "/api/auth/consents") return { onboardingStep: "FACE" };
  if (path === "/api/kyc/liveness/session") { kyc = { start: Date.now(), fail: !!body.simulateFail, rejections: kyc.rejections }; return { sessionId: "demo-kyc" }; }
  if (path.startsWith("/api/kyc/liveness/")) {
    const ms = Date.now() - kyc.start;
    if (ms < 3000) return { status: "PENDING", progress: Math.min(99, Math.floor((ms / 3000) * 100)), attempt: kyc.rejections, attemptsLeft: 3 - kyc.rejections };
    if (kyc.fail) { if (kyc.start) { kyc.rejections += 1; kyc.start = 0; } return { status: "REJECTED", progress: 100, attempt: kyc.rejections, attemptsLeft: Math.max(0, 3 - kyc.rejections) }; }
    return { status: "APPROVED", progress: 100, attempt: kyc.rejections, attemptsLeft: 3 - kyc.rejections };
  }
  if (path === "/api/auth/biometric/enable") return { deviceSecret: "demo" };
  if (path === "/api/auth/biometric/skip") return { onboardingStep: "PIN" };
  if (path === "/api/auth/biometric/login" || path === "/api/auth/pin/login") return { token: "demo", onboardingStep: "DONE" };
  if (path === "/api/auth/pin") return { onboardingStep: "DONE" };
  if (path === "/api/auth/password/reset") return { ok: true, revoked: { count: 2, devices: ["MacBook Air · Chrome", "iPad · App Nuvo"] } };
  if (path === "/api/auth/logout") return { ok: true };
  if (path.startsWith("/api/dev/code")) return { code: DEMO_CODE };

  if (path === "/api/transactions" && init?.method === "POST") {
    const signed = body.kind === "income" ? body.amountCents : -body.amountCents;
    const acc = accounts.find((a) => a.id === body.accountId) ?? accounts[0];
    const guess = RULES.find(([re]) => re.test(body.description))?.[1];
    const category = body.category ?? (body.kind === "income" ? "receita" : guess ?? "outros");
    const t: Tx = { id: nextId++, account_id: acc.id, account_name: acc.name, date: "2026-10-06", description: body.description, subtitle: acc.type === "credit_card" ? `Cartão ${acc.name} •• ${acc.last4}` : "Lançamento manual", amount_cents: signed, category, source: body.category ? "USER" : "RULE", status: "POSTED" };
    txs.push(t);
    acc.balance_cents += acc.type === "credit_card" ? -signed : signed;
    if (signed > 0) state.extra.income += signed; else state.extra.expense += -signed;
    return t;
  }
  return fail(404);
}
