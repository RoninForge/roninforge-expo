import { File, Directory, Paths } from "expo-file-system";

export async function writeNote(name: string, body: string): Promise<void> {
  const file = new File(Paths.document, name);
  await file.write(body);
}

export async function readNote(name: string): Promise<string | null> {
  const file = new File(Paths.document, name);
  if (!file.exists) return null;
  return file.text();
}

export function listNotes(): string[] {
  const dir = new Directory(Paths.document);
  if (!dir.exists) return [];
  return dir.list().map((f) => f.name);
}
