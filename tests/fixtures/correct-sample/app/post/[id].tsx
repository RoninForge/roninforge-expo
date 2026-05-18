import { Stack, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Post() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <Stack.Screen options={{ title: `Post ${id}` }} />
      <Image
        source={`https://example.com/post/${id}/cover.jpg`}
        style={{ width: "100%", aspectRatio: 16 / 9 }}
        contentFit="cover"
        transition={200}
      />
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18 }}>Post id: {id}</Text>
      </View>
    </SafeAreaView>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Text>Failed to load post: {error.message}</Text>
    </View>
  );
}
