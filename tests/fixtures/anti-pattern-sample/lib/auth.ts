// ANTI-PATTERN BUNDLE:
// - Lucia auth library on a mobile client (server-only)
// - Hardcoded OAuth client_secret in bundle
// - AsyncStorage for refresh token
// - Hardcoded staging API URL
import { Lucia } from "lucia";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const OAUTH_CONFIG = {
  clientId: "abc123",
  clientSecret: "shh_super_secret_xyz", // SECRET in client bundle
  redirectUri: "myapp://auth",
};

export const API_BASE = "https://staging-api.example.com/v1"; // hardcoded; ships to prod

export const lucia = new Lucia({} as any, { sessionCookie: { name: "session", attributes: {} } } as any);

export async function persistRefresh(token: string): Promise<void> {
  // anti-pattern #1: refresh token in AsyncStorage
  await AsyncStorage.setItem("refresh_token", token);
}
