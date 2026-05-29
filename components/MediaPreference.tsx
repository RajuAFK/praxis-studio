"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type MediaPreference = "wifi" | "mobile" | null;
const STORAGE_KEY = "mediaPreference";
const EVENT_NAME = "mediapreferencechange";

interface MediaPreferenceCtx {
  preference: MediaPreference;
  ready: boolean; // true once the client has read sessionStorage
  setPreference: (p: Exclude<MediaPreference, null>) => void;
  clear: () => void;
}

const Ctx = createContext<MediaPreferenceCtx>({
  preference: null,
  ready: false,
  setPreference: () => {},
  clear: () => {},
});

export function MediaPreferenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preference, setPreferenceState] = useState<MediaPreference>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "wifi" || stored === "mobile") {
      setPreferenceState(stored);
    }
    setReady(true);

    const onChange = () => {
      const v = sessionStorage.getItem(STORAGE_KEY);
      setPreferenceState(v === "wifi" || v === "mobile" ? v : null);
    };
    window.addEventListener(EVENT_NAME, onChange);
    return () => window.removeEventListener(EVENT_NAME, onChange);
  }, []);

  const setPreference = useCallback(
    (p: Exclude<MediaPreference, null>) => {
      sessionStorage.setItem(STORAGE_KEY, p);
      setPreferenceState(p);
      window.dispatchEvent(new Event(EVENT_NAME));
    },
    []
  );

  const clear = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setPreferenceState(null);
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);

  return (
    <Ctx.Provider value={{ preference, ready, setPreference, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export function useMediaPreference() {
  return useContext(Ctx);
}

/** Best-effort connection auto-detect. */
export function detectConnection():
  | { hint: "wifi" | "mobile"; reason: string }
  | { hint: "unknown"; reason: string } {
  if (typeof navigator === "undefined") return { hint: "unknown", reason: "ssr" };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = (navigator as any).connection;
  if (!c) return { hint: "unknown", reason: "api-unsupported" };

  const type = c.type as string | undefined;
  const eff = c.effectiveType as string | undefined;

  // Explicit cellular ALWAYS wins → mobile.
  if (type === "cellular") return { hint: "mobile", reason: "type=cellular" };
  if (eff === "slow-2g" || eff === "2g" || eff === "3g") {
    return { hint: "mobile", reason: `effectiveType=${eff}` };
  }
  if (type === "wifi" || type === "ethernet") {
    return { hint: "wifi", reason: `type=${type}` };
  }
  if (eff === "4g") return { hint: "wifi", reason: "effectiveType=4g" };
  return { hint: "unknown", reason: "no-signals" };
}
