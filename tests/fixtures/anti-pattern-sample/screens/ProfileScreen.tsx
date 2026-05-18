// ANTI-PATTERN #18: edge-to-edge default on Android (SDK 53+) but no
// SafeAreaView around the screen content. The header text draws under the
// system status bar; with translucent navigation it also clips the bottom.
// The canonical fix is to wrap the content in SafeAreaView from
// react-native-safe-area-context (or SystemBars from react-native-edge-to-edge)
// rather than relying on the deprecated StatusBar.backgroundColor / translucent
// props.
import { StatusBar, Text, View } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar backgroundColor="#fff" translucent={false} />
      <Text style={{ fontSize: 24, fontWeight: "600", padding: 16 }}>
        Profile (clipped under status bar)
      </Text>
    </View>
  );
}
