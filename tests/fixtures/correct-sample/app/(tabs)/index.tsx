import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import { PostList } from "../../components/PostList";

const posts = [
  { id: "a", title: "First" },
  { id: "b", title: "Second" },
  { id: "c", title: "Third" },
];

export default function Home() {
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "600" }}>Feed</Text>
        <Image
          source="https://example.com/banner.jpg"
          style={{ width: "100%", aspectRatio: 16 / 9 }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />
      </View>
      <PostList posts={posts} />
    </SafeAreaView>
  );
}
