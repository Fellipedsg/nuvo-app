import { ReactNode, useEffect, useLayoutEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, Platform, StyleProp, ViewStyle } from "react-native";

export const TRANSITION_MS = 500;
const native = Platform.OS !== "web";

function useReduceMotion() {
  const reduce = useRef(false);
  useEffect(() => { AccessibilityInfo.isReduceMotionEnabled().then((v) => { reduce.current = v; }).catch(() => {}); }, []);
  return reduce;
}

/**
 * Plays a 500ms fade (+ slide) whenever `routeKey` changes. The new screen is mounted immediately,
 * so taps are never blocked while it animates. dir: 1 = forward (from right), -1 = back (from left), 0 = fade only.
 */
export function ScreenTransition({ routeKey, dir, children, style }: { routeKey: string; dir: -1 | 0 | 1; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const x = useRef(new Animated.Value(0)).current;
  const first = useRef(true);
  const reduce = useReduceMotion();

  useLayoutEffect(() => {
    if (first.current) { first.current = false; return; } // no animation on the very first screen
    const duration = reduce.current ? 0 : TRANSITION_MS;
    opacity.setValue(0);
    x.setValue(dir * 32);
    const a = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration, easing: Easing.out(Easing.cubic), useNativeDriver: native }),
      Animated.timing(x, { toValue: 0, duration, easing: Easing.out(Easing.cubic), useNativeDriver: native }),
    ]);
    a.start();
    return () => a.stop();
  }, [routeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return <Animated.View style={[{ flex: 1, opacity, transform: [{ translateX: x }] }, style]}>{children}</Animated.View>;
}

/** Slide-up + fade for overlays (e.g. the "Nova transação" sheet). Plays on mount. */
export function EnterFromBottom({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useRef(new Animated.Value(0)).current;
  const reduce = useReduceMotion();
  useLayoutEffect(() => {
    Animated.timing(t, { toValue: 1, duration: reduce.current ? 0 : TRANSITION_MS, easing: Easing.out(Easing.cubic), useNativeDriver: native }).start();
  }, [t]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Animated.View style={[{ opacity: t, transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }, style]}>
      {children}
    </Animated.View>
  );
}
