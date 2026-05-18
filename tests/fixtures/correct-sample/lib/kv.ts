import AsyncStorage from "expo-sqlite/kv-store";

export const kv = {
  async get(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  },
  async set(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  },
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};
