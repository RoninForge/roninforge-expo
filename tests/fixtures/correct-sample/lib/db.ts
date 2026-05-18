import { useSQLiteContext, type SQLiteDatabase } from "expo-sqlite";

export type Post = { id: string; body: string };

export function usePosts() {
  const db = useSQLiteContext();
  return {
    list: async (): Promise<Post[]> => db.getAllAsync<Post>("SELECT id, body FROM posts"),
    insert: async (post: Post) =>
      db.runAsync("INSERT INTO posts (id, body) VALUES (?, ?)", post.id, post.body),
  };
}

export async function migrate(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, body TEXT);
  `);
}
