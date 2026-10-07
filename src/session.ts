import * as SecureStore from "expo-secure-store";
import { getRandomBytes } from "expo-crypto";
import { Alert, Platform } from "react-native";

// Keychain-backed storage: session token, device id, and the biometric device secret.
// On web (demo) there is no keychain: fall back to localStorage.
const web = Platform.OS === "web";
const ls = () => { try { return globalThis.localStorage; } catch { return undefined; } };
const get = (k: string): Promise<string | null> => (web ? Promise.resolve(ls()?.getItem(k) ?? null) : SecureStore.getItemAsync(k).catch(() => null));
const set = (k: string, v: string) => (web ? Promise.resolve(void ls()?.setItem(k, v)) : SecureStore.setItemAsync(k, v).catch(() => {}));
const del = (k: string) => (web ? Promise.resolve(void ls()?.removeItem(k)) : SecureStore.deleteItemAsync(k).catch(() => {}));

/** Alert.alert is a no-op on react-native-web. */
export const notify = (title: string, msg: string) => (web ? globalThis.alert?.(`${title}\n\n${msg}`) : Alert.alert(title, msg));

export type Remembered = { email: string; name: string; initials: string; biometric: boolean; deviceSecret?: string };

let deviceId: string | null = null;
export async function getDevice() {
  deviceId ??= await get("nuvo.deviceId");
  if (!deviceId) {
    deviceId = [...getRandomBytes(16)].map((b) => b.toString(16).padStart(2, "0")).join("");
    await set("nuvo.deviceId", deviceId);
  }
  return { deviceId, deviceName: `${Platform.OS === "ios" ? "iPhone" : "Android"} · App Nuvo` };
}

export const saveToken = (t: string) => set("nuvo.token", t);
export const loadToken = () => get("nuvo.token");
export const clearToken = () => del("nuvo.token");

export async function loadRemembered(): Promise<Remembered | null> {
  const r = await get("nuvo.remembered");
  try { return r ? (JSON.parse(r) as Remembered) : null; } catch { return null; }
}
export const saveRemembered = (r: Remembered) => set("nuvo.remembered", JSON.stringify(r));
export const forgetAccount = async () => { await del("nuvo.remembered"); await clearToken(); };

/** State that spans several screens of one flow (sign-up, reset, 2FA). In memory only. */
export const flow: {
  email?: string; resetTarget?: string; resetChannel?: "email" | "sms"; resetCode?: string;
  challenge?: string; phoneMasked?: string | null; deviceName?: string; lockedUntil?: number;
  pinReset?: boolean; simFail?: boolean; kyc?: { attempt: number; left: number };
} = {};
