---
name: expo-new-protected-flow
description: Scaffolds an Expo Router 55 Stack.Protected authentication flow. Creates a root app/_layout.tsx that gates two route groups (auth) and (app) declaratively using Stack.Protected with a guard prop reading useSession(), an (auth)/_layout.tsx and (auth)/sign-in.tsx for the unauthenticated stack, an (app)/_layout.tsx and (app)/index.tsx for the authenticated stack, and a lib/auth.tsx module that wraps expo-secure-store and exposes useSession plus signIn / signOut. Refuses useEffect-based router.replace auth redirects (which flash the protected route for one frame) and refuses AsyncStorage for token persistence.
---

# expo-new-protected-flow

Use when the user asks for "an auth flow", "a login screen", "protected routes", "sign-in", or "session gating" in an Expo Router 55 project.

## Prerequisites

```sh
npx expo install expo-secure-store expo-constants
```

`expo-constants` is bundled with managed-workflow templates; the install is a no-op there but documenting it keeps bare projects honest.

## Files to create

```
app/
  _layout.tsx          # gates (auth) vs (app)
  (auth)/
    _layout.tsx        # stack for unauthenticated routes
    sign-in.tsx        # email + password form
  (app)/
    _layout.tsx        # stack for authenticated routes
    index.tsx          # home (after login)
lib/
  auth.tsx             # useSession, signIn, signOut, useSecureStore (JSX provider, so .tsx)
```

## Root layout

```tsx
// app/_layout.tsx
import { Stack } from "expo-router";
import { useSession, SessionProvider } from "../lib/auth";

function RootStack() {
  const { session, loading } = useSession();
  if (loading) return null;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <RootStack />
    </SessionProvider>
  );
}
```

## lib/auth.tsx

```ts
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
      await SecureStore.setItemAsync("access_token", token);
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
```

## Auth stack

```tsx
// app/(auth)/_layout.tsx
import { Stack } from "expo-router";
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

```tsx
// app/(auth)/sign-in.tsx
import Constants from "expo-constants";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { useSession } from "../../lib/auth";

const apiBase = (Constants.expoConfig?.extra?.apiBase as string) ?? "";

export default function SignIn() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    const res = await fetch(apiBase + "/auth/sign-in", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const { token, userId } = await res.json();
    await signIn(token, userId);
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Sign in</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      <Button title="Sign in" onPress={submit} />
    </View>
  );
}
```

## App stack

```tsx
// app/(app)/_layout.tsx
import { Stack } from "expo-router";
export default function AppLayout() {
  return <Stack />;
}
```

```tsx
// app/(app)/index.tsx
import { Button, Text, View } from "react-native";
import { useSession } from "../../lib/auth";

export default function Home() {
  const { session, signOut } = useSession();
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Hello {session?.userId}</Text>
      <Button title="Sign out" onPress={signOut} />
    </View>
  );
}
```

## Refuses

- `useEffect(() => { if (!session) router.replace("/sign-in") }, ...)` (use Stack.Protected; see anti-pattern #33)
- `AsyncStorage.setItem("access_token", ...)` (use expo-secure-store; see #1)
- Storing tokens in `EXPO_PUBLIC_*` env vars (see #2)
- Hardcoded OAuth `client_secret` (see #3)
