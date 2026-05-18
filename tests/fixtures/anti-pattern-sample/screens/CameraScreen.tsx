// ANTI-PATTERN: Camera legacy export (removed in SDK 52). Use CameraView + useCameraPermissions.
import React from "react";
import { View } from "react-native";
import { Camera } from "expo-camera";

export default function CameraScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Camera type={Camera.Constants.Type.back} ratio="16:9" />
    </View>
  );
}
