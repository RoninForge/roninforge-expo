// ANTI-PATTERN: FlashList 1.x estimatedItemSize prop. In v2 this is a no-op (deprecated warning).
import React from "react";
import { Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";

export default function BigList({ items }: { items: { id: string; title: string }[] }) {
  return (
    <FlashList
      data={items}
      estimatedItemSize={64}
      renderItem={({ item }) => (
        <View>
          <Text>{item.title}</Text>
        </View>
      )}
    />
  );
}
