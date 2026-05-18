// ANTI-PATTERN BUNDLE:
// - useAnimatedGestureHandler (removed in Reanimated 4)
// - PanGestureHandler imperative wrapper (deprecated)
// - sharedValue.value read inside JSX render (undefined behavior)
// - setState from worklet without runOnJS
import React, { useState } from "react";
import { View, Text } from "react-native";
import {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import Animated from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";

export default function AnimatedThing() {
  const x = useSharedValue(0);
  const [count, setCount] = useState(0);

  const handler = useAnimatedGestureHandler({
    onActive: (event: any) => {
      x.value = event.translationX;
      // anti-pattern #45: setState from worklet without runOnJS
      setCount((c) => c + 1);
    },
  });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <PanGestureHandler onGestureEvent={handler}>
      <Animated.View style={style}>
        {/* anti-pattern #41: reading shared value in render */}
        <Text>x is {x.value}</Text>
        <Text>count: {count}</Text>
        <View style={{ width: 64, height: 64, backgroundColor: "tomato" }} />
      </Animated.View>
    </PanGestureHandler>
  );
}
