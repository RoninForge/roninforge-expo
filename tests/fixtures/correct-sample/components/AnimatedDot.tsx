import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { useState } from "react";
import { Text, View } from "react-native";

export function AnimatedDot() {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const start = useSharedValue({ x: 0, y: 0 });
  const [released, setReleased] = useState(false);

  const pan = Gesture.Pan()
    .onStart(() => {
      start.value = { x: x.value, y: y.value };
      runOnJS(setReleased)(false);
    })
    .onUpdate((e) => {
      x.value = start.value.x + e.translationX;
      y.value = start.value.y + e.translationY;
    })
    .onEnd(() => {
      x.value = withSpring(0);
      y.value = withSpring(0);
      runOnJS(setReleased)(true);
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <View style={{ alignItems: "center", padding: 16, gap: 8 }}>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            style,
            { width: 64, height: 64, borderRadius: 32, backgroundColor: "steelblue" },
          ]}
        />
      </GestureDetector>
      <Text>{released ? "released" : "drag me"}</Text>
    </View>
  );
}
