---
name: expo-new-route
description: Scaffolds a new Expo Router 55 route file under app/ following file-based routing conventions. Produces either a static route (app/<segment>/index.tsx), a dynamic route (app/<segment>/[id].tsx with useLocalSearchParams<{ id: string }>()), or a catch-all route (app/<segment>/[...rest].tsx). The scaffolded file includes a default exported function component, typed useLocalSearchParams when applicable, a Stack.Screen options block for the route title, an optional ErrorBoundary export, and uses expo-image for any image imports. Refuses class components, useRoute and useNavigation from @react-navigation/native, raw Image from react-native for remote content, untyped useLocalSearchParams, NavigationContainer, createStackNavigator, and any router.navigate calls expecting stack-pop semantics (use router.dismissTo instead).
---

# expo-new-route

Use when the user asks for "a new screen", "a new route", "a new page", "a profile screen", etc. in an Expo Router 55 project.

## Decide the file path

| Intent | Filename |
|--------|----------|
| Single screen at `/foo` | `app/foo.tsx` |
| Nested screens sharing a layout at `/foo/*` | `app/foo/_layout.tsx` + `app/foo/index.tsx` |
| Dynamic id route at `/post/:id` | `app/post/[id].tsx` |
| Catch-all under `/docs/*` | `app/docs/[...rest].tsx` |
| Group with shared layout but no URL prefix | `app/(group)/_layout.tsx` + screens |

## Template: static route

```tsx
// app/about.tsx
import { Stack } from "expo-router";
import { Text, View } from "react-native";

export default function About() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Stack.Screen options={{ title: "About" }} />
      <Text>About this app.</Text>
    </View>
  );
}
```

## Template: dynamic route

```tsx
// app/post/[id].tsx
import { Stack, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { Image } from "expo-image";

export default function Post() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Stack.Screen options={{ title: `Post ${id}` }} />
      <Image
        source={`https://example.com/post/${id}/cover.jpg`}
        style={{ width: "100%", aspectRatio: 16 / 9 }}
        contentFit="cover"
        transition={200}
      />
      <Text>Post id: {id}</Text>
    </View>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <Text>Failed to load post: {error.message}</Text>;
}
```

## Template: catch-all

```tsx
// app/docs/[...rest].tsx
import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";

export default function Docs() {
  const { rest } = useLocalSearchParams<{ rest: string[] }>();
  return <Text>Docs path: {rest?.join("/")}</Text>;
}
```

## Refuses

- Class components (use function components)
- `import { useRoute, useNavigation } from "@react-navigation/native"` (use `useLocalSearchParams` and `router` from `expo-router`)
- `import { Image } from "react-native"` for remote URLs (use `expo-image`)
- `useLocalSearchParams()` without type parameter
- Imports from `@react-navigation/native` for navigation primitives
- `router.navigate("/feed")` expecting it to pop the stack (use `router.dismissTo("/feed")`)
- Adding the file to a routes config (not needed; file-based routing is implicit)

After scaffolding, remind the user to run `npx expo start` so the typed-routes generator can pick up the new file.
