// ANTI-PATTERN: Video and Audio from expo-av. SDK 55 splits into expo-video and expo-audio.
import React, { useRef } from "react";
import { View } from "react-native";
import { Video, Audio } from "expo-av";

export default function VideoScreen() {
  const videoRef = useRef<Video>(null);
  Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  return (
    <View style={{ flex: 1 }}>
      <Video
        ref={videoRef}
        source={{ uri: "https://example.com/movie.mp4" }}
        useNativeControls
        resizeMode={"contain" as any}
        style={{ flex: 1 }}
      />
    </View>
  );
}
