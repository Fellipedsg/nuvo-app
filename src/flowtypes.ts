import type { Step } from "./api";

export type Route =
  | "splash" | "onb" | "login" | "signup" | "signupPassword" | "verifyEmail" | "terms" | "faceIntro" | "faceCapture" | "faceFail"
  | "faceId" | "createPin" | "done" | "quickFace" | "pinLogin" | "twoFactor" | "locked" | "forgot" | "resetCode" | "resetNew" | "resetDone"
  | "home" | "analysis" | "agenda" | "profile" | "cards" | "connect" | "tx";

export type Ctx = {
  go: (r: Route) => void;
  back: () => void;
  reset: (r: Route) => void;
  /** Store the session and route to wherever the account left off. */
  authed: (token: string, step: Step, email?: string) => Promise<void>;
  /** Finished (or resumed) onboarding: load data and show the app. */
  enterApp: (opts?: { thenConnect?: boolean }) => Promise<void>;
};

export const routeForStep = (s: Step): Route =>
  ({ PERSONAL_DATA: "signup", PASSWORD: "signupPassword", EMAIL_VERIFY: "verifyEmail", TERMS: "terms", FACE: "faceIntro", BIOMETRIC: "faceId", PIN: "createPin", DONE: "home" } as const)[s];
