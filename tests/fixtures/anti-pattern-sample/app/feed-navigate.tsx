// ANTI-PATTERN #21: router.navigate inside Expo Router used as a "pop to
// existing route" helper. It is not a guaranteed pop-to-existing; it follows
// React Navigation 7 navigate semantics and may add a screen. To collapse the
// stack back to /feed, the canonical call is router.dismissTo('/feed').
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function FeedNavigate() {
  return (
    <View>
      <Text>Feed-navigate anti-pattern</Text>
      <Pressable onPress={() => router.navigate("/feed")}>
        <Text>Back to feed (broken)</Text>
      </Pressable>
    </View>
  );
}
