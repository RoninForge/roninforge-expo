---
name: expo-migrate-from-rn-cli
description: Walks a project step-by-step from either bare React Native CLI or an older Expo SDK (51, 52, 53, 54) up to Expo SDK 55. Each step is a small atomic diff with before/after. Covers expo bump and npx expo install --fix, babel.config.js plugin swap (react-native-reanimated/plugin to react-native-worklets/plugin), FlashList v1 to v2 (drop estimatedItemSize), expo-file-system classic API to new File/Directory API (or explicit /legacy import), expo-av split to expo-video and expo-audio, dropping newArchEnabled and jsEngine flags (no-ops in SDK 55), runtimeVersion to fingerprint policy, expo-cli to npx expo + eas, migrating Camera to CameraView, useAnimatedGestureHandler to GestureDetector + Gesture.Pan, expo-permissions to per-module APIs, react-native-fast-image to expo-image, react-native-vector-icons to @expo/vector-icons, react-native-fs to expo-file-system, AsyncStorage tokens to expo-secure-store, NavigationContainer + createStackNavigator to file-based routing.
---

# expo-migrate-from-rn-cli

Use when the user says "migrate to SDK 55", "upgrade Expo", "move off bare React Native", "convert from React Navigation".

## Stage 0: Baseline

Confirm the current state:

```sh
node -p "require('./package.json').dependencies.expo || 'bare-rn'"
```

Pick a stage based on the answer:

- `bare-rn` -> start at Stage 1
- `^51`, `^52` -> Stage 2
- `^53`, `^54` -> Stage 3
- already `^55` -> use the reviewer agent instead

## Stage 1: Bare RN to Expo (skip if already on Expo)

```sh
npx install-expo-modules@latest
npx expo install expo-router expo-secure-store
```

This is the largest step. Document each native module currently linked in `react-native.config.js` and verify each has an Expo equivalent before committing.

## Stage 2: SDK 51/52 -> 55

```sh
npx expo install expo@~55.0.0
npx expo install --fix
```

Then apply:

A. **Camera**:

```diff
-import { Camera } from "expo-camera";
-<Camera type={Camera.Constants.Type.back} />
+import { CameraView, useCameraPermissions } from "expo-camera";
+const [permission, requestPermission] = useCameraPermissions();
+<CameraView facing="back" />
```

B. **expo-permissions**:

```diff
-import * as Permissions from "expo-permissions";
-await Permissions.askAsync(Permissions.CAMERA);
+import { useCameraPermissions } from "expo-camera";
+const [permission, requestPermission] = useCameraPermissions();
+await requestPermission();
```

C. **react-native-fast-image**:

```diff
-import FastImage from "react-native-fast-image";
+import { Image } from "expo-image";
```

D. **react-native-vector-icons**:

```diff
-import Icon from "react-native-vector-icons/MaterialIcons";
+import { MaterialIcons } from "@expo/vector-icons";
```

E. **react-native-fs**:

```diff
-import RNFS from "react-native-fs";
+import { File, Paths } from "expo-file-system";
```

F. **AsyncStorage for tokens**:

```diff
-await AsyncStorage.setItem("access_token", token);
+await SecureStore.setItemAsync("access_token", token);
```

G. **NavigationContainer + createStackNavigator** (if not yet on Expo Router):

```diff
-<NavigationContainer>
-  <Stack.Navigator>
-    <Stack.Screen name="Home" component={HomeScreen} />
-  </Stack.Navigator>
-</NavigationContainer>
+// Move HomeScreen to app/index.tsx
+// app/_layout.tsx
+<Stack>
+  <Stack.Screen name="index" options={{ title: "Home" }} />
+</Stack>
```

## Stage 3: SDK 53/54 -> 55

A. **Babel worklets plugin**:

```diff
-plugins: ["react-native-reanimated/plugin"]
+plugins: ["react-native-worklets/plugin"]
```

B. **FlashList v2**:

```diff
-<FlashList data={items} estimatedItemSize={64} renderItem={...} />
+<FlashList data={items} renderItem={...} keyExtractor={(i) => i.id} />
```

C. **expo-file-system new API** (or import `/legacy`):

```diff
-import * as FileSystem from "expo-file-system";
-await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + "x.txt", "hi");
+import { File, Paths } from "expo-file-system";
+const file = new File(Paths.document, "x.txt");
+await file.write("hi");
```

D. **expo-av split**:

```diff
-import { Video, Audio } from "expo-av";
+import { useVideoPlayer, VideoView } from "expo-video";
+import { useAudioPlayer } from "expo-audio";
```

E. **Drop New Architecture flags**:

```diff
 {
   "expo": {
-    "newArchEnabled": true,
-    "jsEngine": "hermes",
   }
 }
```

F. **useAnimatedGestureHandler**:

```diff
-const handler = useAnimatedGestureHandler({ onActive: (e, ctx) => { x.value = e.translationX; } });
-<PanGestureHandler onGestureEvent={handler}>...</PanGestureHandler>
+const pan = Gesture.Pan().onUpdate((e) => { x.value = e.translationX; });
+<GestureDetector gesture={pan}>...</GestureDetector>
```

## Stage 4: Build and runtime fingerprint

```diff
 {
   "expo": {
-    "runtimeVersion": "1.0.0",
+    "runtimeVersion": { "policy": "fingerprint" },
   }
 }
```

## Stage 5: Scripts and CLI

```diff
 "scripts": {
-  "start": "expo start",
-  "build:android": "expo build:android"
+  "start": "npx expo start",
+  "build:android": "eas build -p android --profile production"
 }
```

Remove `"expo-cli": "^6"` from `dependencies`.

## Stage 6: Validate

```sh
npx expo-doctor
npx tsc --noEmit
eas build -p ios --profile preview
```

Address every `expo-doctor` warning before submitting to TestFlight or Play Console.

Source: https://docs.expo.dev/upgrading-expo-sdk-walkthrough/
