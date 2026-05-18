// ANTI-PATTERN: react-native-vector-icons requires manual font linking.
// Use @expo/vector-icons which is pre-linked via CNG.
import React from "react";
import Icon from "react-native-vector-icons/MaterialIcons";

export function HomeIcon() {
  return <Icon name="home" size={24} color="black" />;
}
