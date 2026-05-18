import { FlashList } from "@shopify/flash-list";
import { Text, View } from "react-native";

type Post = { id: string; title: string };

export function PostList({ posts }: { posts: Post[] }) {
  return (
    <FlashList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" }}>
          <Text style={{ fontSize: 16 }}>{item.title}</Text>
        </View>
      )}
    />
  );
}
