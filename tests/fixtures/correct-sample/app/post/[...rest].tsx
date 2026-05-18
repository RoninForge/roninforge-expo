import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function PostCatchAll() {
  const { rest } = useLocalSearchParams<{ rest: string[] }>();
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Catch-all: {rest?.join("/")}</Text>
    </View>
  );
}
