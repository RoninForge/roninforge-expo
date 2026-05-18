// ANTI-PATTERN: react-native-fast-image is unmaintained (archived) and not New-Architecture compatible.
// Use expo-image with contentFit + cachePolicy.
import React from "react";
import FastImage from "react-native-fast-image";

export function Avatar({ uri, size = 64 }: { uri: string; size?: number }) {
  return (
    <FastImage
      source={{ uri }}
      style={{ width: size, height: size }}
      resizeMode={FastImage.resizeMode.cover}
    />
  );
}
