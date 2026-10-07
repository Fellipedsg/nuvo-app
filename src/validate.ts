// Client-side twins of nuvo-api/lib/auth/{cpf,password,pin}.ts (instant feedback; the server stays the authority).
export const digits = (s: string) => s.replace(/\D/g, "");

export function isValidCpf(input: string) {
  const d = digits(input);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const dv = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dv(9) === Number(d[9]) && dv(10) === Number(d[10]);
}
export const isValidPhone = (s: string) => /^[1-9]{2}9\d{8}$/.test(digits(s));
export const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
export const isValidName = (s: string) => s.trim().split(/\s+/).length >= 2 && s.trim().length >= 3 && s.trim().length <= 80;

export const maskCpf = (s: string) => {
  const d = digits(s).slice(0, 11);
  return d.replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1-$2");
};
export const maskPhone = (s: string) => {
  const d = digits(s).slice(0, 11);
  return d.length <= 2 ? d : d.length <= 7 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};
export const maskEmail = (e: string) => e.replace(/^(.)[^@]*/, "$1•••••");

export const pwChecks = (pw: string) => [
  { label: "Pelo menos 8 caracteres", ok: pw.length >= 8 },
  { label: "Uma letra maiúscula", ok: /[A-Z]/.test(pw) },
  { label: "Um número", ok: /\d/.test(pw) },
  { label: "Um caractere especial (!@#$)", ok: /[^A-Za-z0-9]/.test(pw) },
];
const COMMON = /^(senha|password|qwerty|abc123|12345|brasil|admin)/i;
export function pwScore(pw: string) {
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  if (!pw) return 0;
  if (COMMON.test(pw)) return 1;
  return Math.min(4, +(pw.length >= 8) + +(pw.length >= 10) + +(classes >= 3) + +(pw.length >= 12 && classes === 4));
}
export const PW_LABELS = ["", "Fraca", "Média", "Boa", "Forte"];

export function pinError(pin: string): string | null {
  if (/^(\d)\1{5}$/.test(pin)) return "Evite dígitos repetidos.";
  const d = [...pin].map(Number), step = d[1] - d[0];
  if ((step === 1 || step === -1) && d.every((x, i) => i === 0 || x - d[i - 1] === step)) return "Evite sequências como 123456.";
  return null;
}
