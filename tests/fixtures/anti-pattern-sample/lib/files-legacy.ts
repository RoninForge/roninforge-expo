// ANTI-PATTERN #24: classic expo-file-system function API assumed default.
// In SDK 54+ the new File / Directory API became the default export; the
// legacy function API moved to "expo-file-system/legacy". This import path
// silently resolves to a deprecated re-export and breaks in SDK 55+.
import * as FileSystem from "expo-file-system";

export async function writeProfile(json: string): Promise<string> {
  const target = FileSystem.documentDirectory + "profile.json";
  await FileSystem.writeAsStringAsync(target, json);
  return target;
}

export async function readProfile(): Promise<string | null> {
  const target = FileSystem.documentDirectory + "profile.json";
  const info = await FileSystem.getInfoAsync(target);
  if (!info.exists) return null;
  return FileSystem.readAsStringAsync(target);
}
