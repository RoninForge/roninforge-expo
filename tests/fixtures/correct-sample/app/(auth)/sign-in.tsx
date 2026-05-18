import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { useSession } from "../../lib/auth";

export default function SignIn() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const apiBase = (Constants.expoConfig?.extra?.apiBase as string) ?? "";

  async function submit() {
    setError(null);
    try {
      const res = await fetch(`${apiBase}/auth/sign-in`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw Object.assign(new Error("invalid credentials"), { code: "AUTH" });
      const { token, userId } = (await res.json()) as { token: string; userId: string };
      await signIn(token, userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown");
    }
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, padding: 16, gap: 12, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Sign in</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, padding: 8, borderRadius: 4 }}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={{ borderWidth: 1, padding: 8, borderRadius: 4 }}
      />
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      <Button title="Sign in" onPress={submit} />
    </SafeAreaView>
  );
}
