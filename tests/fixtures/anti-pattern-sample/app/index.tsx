// ANTI-PATTERN: An Expo Router page coexists with App.tsx that mounts NavigationContainer.
// Also: useEffect + router.replace auth redirect (flashes protected route), and missing _layout.tsx.
import React, { useEffect } from "react";
import { Text, View, Image } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) router.replace("/sign-in");
    })();
  }, []);

  return (
    <View>
      {/* anti-pattern #26: raw Image from react-native for remote content */}
      <Image source={{ uri: "https://example.com/banner.jpg" }} style={{ width: 100, height: 100 }} />
      <Text>Home</Text>
    </View>
  );
}
