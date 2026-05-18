import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "CorrectSample",
  slug: "correct-sample",
  scheme: "correctsample",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  userInterfaceStyle: "automatic",
  runtimeVersion: { policy: "fingerprint" },
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    bundleIdentifier: "org.roninforge.correctsample",
    supportsTablet: true,
  },
  android: {
    package: "org.roninforge.correctsample",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
  },
  web: {
    bundler: "metro",
    output: "server",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    [
      "expo-build-properties",
      {
        ios: { deploymentTarget: "15.1" },
        android: { compileSdkVersion: 35, targetSdkVersion: 35 },
      },
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/images/notification-icon.png",
        color: "#ffffff",
        defaultChannel: "default",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    apiBase: process.env.API_BASE,
    eas: { projectId: process.env.EAS_PROJECT_ID },
  },
};

export default config;
