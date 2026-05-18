import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

type Session = { token: string; userId: string } | null;

type Ctx = {
  session: Session;
  loading: boolean;
  signIn: (token: string, userId: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionCtx = createContext<Ctx | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync("access_token");
      const userId = await SecureStore.getItemAsync("user_id");
      if (token && userId) setSession({ token, userId });
      setLoading(false);
    })();
  }, []);

  const value: Ctx = {
    session,
    loading,
    async signIn(token, userId) {
      await SecureStore.setItemAsync("access_token", token, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      await SecureStore.setItemAsync("user_id", userId);
      setSession({ token, userId });
    },
    async signOut() {
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("user_id");
      setSession(null);
    },
  };

  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error("useSession must be inside SessionProvider");
  return ctx;
}
