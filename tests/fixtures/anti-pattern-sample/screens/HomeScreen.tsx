// ANTI-PATTERN BUNDLE:
// - Class component
// - useRoute / useNavigation from @react-navigation/native (inside Expo Router context)
// - Image from "react-native" for a remote URL
// - AsyncStorage for an access token
// - EXPO_PUBLIC_STRIPE_SECRET referenced from client bundle
// - router.navigate expecting stack-pop semantics
import React from "react";
import { View, Text, Image, Button } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STRIPE = process.env.EXPO_PUBLIC_STRIPE_SECRET; // SECRET in client bundle

class HomeScreenInner extends React.Component {
  async componentDidMount() {
    // anti-pattern #1: JWT in AsyncStorage
    await AsyncStorage.setItem("access_token", "eyJhbGciOi...fake");
  }
  render() {
    return (
      <View>
        <Text>Stripe key: {STRIPE}</Text>
        <Image
          source={{ uri: "https://example.com/banner.jpg" }}
          style={{ width: 200, height: 200 }}
          resizeMode="cover"
        />
      </View>
    );
  }
}

export default function HomeScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  // anti-pattern #34: navigation.navigate from React Navigation's useNavigation
  // hook used inside an app that already has Expo Router files. Expo Router
  // ships its own navigator; mixing this React Navigation call breaks deep
  // links and typed routes. The Expo Router replacement is router.push or,
  // when collapsing the stack to an existing screen, router.dismissTo.
  const goFeed = () => navigation.navigate("Feed");
  return (
    <View>
      <Text>Route: {route.name}</Text>
      <HomeScreenInner />
      <Button title="Back to Feed" onPress={goFeed} />
    </View>
  );
}
