import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFound() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Stack.Screen options={{ title: "Not found" }} />
      <Text style={{ fontSize: 18 }}>This screen does not exist.</Text>
      <Link href="/" style={{ marginTop: 16 }}>
        <Text>Go home</Text>
      </Link>
    </View>
  );
}
