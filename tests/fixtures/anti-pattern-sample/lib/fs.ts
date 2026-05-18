// ANTI-PATTERN: react-native-fs is bare-RN-only.
// Use expo-file-system (new File/Directory API) for the New Architecture.
import RNFS from "react-native-fs";

export async function writeNote(name: string, body: string): Promise<void> {
  await RNFS.writeFile(RNFS.DocumentDirectoryPath + "/" + name, body, "utf8");
}
