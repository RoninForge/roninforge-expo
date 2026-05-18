// ANTI-PATTERN: expo-permissions was removed in SDK 41. Use per-module permission APIs.
import * as Permissions from "expo-permissions";

export async function askCamera(): Promise<boolean> {
  const { status } = await Permissions.askAsync(Permissions.CAMERA);
  return status === "granted";
}
