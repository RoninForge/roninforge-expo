import { Button, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "../../lib/auth";
import { Avatar } from "../../components/Avatar";

export default function Profile() {
  const { session, signOut } = useSession();
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, padding: 16, gap: 12 }}>
      <Avatar uri={`https://example.com/u/${session?.userId}.jpg`} />
      <Text style={{ fontSize: 22, fontWeight: "600" }}>{session?.userId}</Text>
      <Button title="Sign out" onPress={signOut} />
    </SafeAreaView>
  );
}
