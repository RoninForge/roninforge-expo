# roninforge-expo

Cursor plugin for Expo SDK 55. Catches the SDK 51-54 leftovers that pre-Oct-2024 LLMs still emit when you tell them to build an Expo app.

## Why this exists

Expo SDK 54 (Oct 2025) and SDK 55 (May 2026) reshuffled the canonical stack:

- **Reanimated 4** replaced Reanimated 3. The Babel plugin moved from `react-native-reanimated/plugin` to `react-native-worklets/plugin`.
- **FlashList 2.0** replaced FlashList 1.x. `estimatedItemSize` is now a no-op.
- **expo-file-system** swapped its default export. The classic functional API now lives at `expo-file-system/legacy`; the new `File`/`Directory` API is the default.
- **expo-av** was split into `expo-video` and `expo-audio` and removed from Expo Go.
- **Legacy Architecture** was removed entirely. `newArchEnabled` and `jsEngine` are noise; Hermes is the only supported engine and bridgeless is the only mode.
- **Expo Router** ships at major `55` (synced with the SDK number, not as an independent semver). `Stack.Protected` is the canonical auth gate; `router.dismissTo` is the only way to pop multiple screens.

LLM training cutoffs before Oct 2024 still suggest the SDK 51-53 stack. This plugin pins, validates, and migrates.

## Quick install

```sh
git clone https://github.com/RoninForge/roninforge-expo ~/.tmp/rf-expo
cd /path/to/your/project
mkdir -p .cursor/rules .cursor/skills .cursor/agents
cp -rn ~/.tmp/rf-expo/rules/*  .cursor/rules/
cp -rn ~/.tmp/rf-expo/skills/* .cursor/skills/
cp -rn ~/.tmp/rf-expo/agents/* .cursor/agents/
```

## What is inside

### Rules (10)

| File | Scope |
|------|-------|
| `expo-anti-patterns.mdc` | 45 anti-patterns, severity-grouped (centerpiece) |
| `expo-router-file-conventions.mdc` | `app/` tree, `_layout.tsx`, `(group)`, `[id]`, `[...rest]`, `+api`, typed routes, `Stack.Protected` |
| `expo-data-and-storage.mdc` | `expo-secure-store`, `expo-sqlite`, `expo-sqlite/kv-store`, `expo-file-system` new API, env vars |
| `expo-images-and-media.mdc` | `expo-image` with `contentFit`, `CameraView`, `expo-video`, `expo-audio` |
| `expo-animations-and-gestures.mdc` | Reanimated 4 worklets, `react-native-worklets/plugin`, `GestureDetector` + `Gesture.Pan` |
| `expo-lists-and-perf.mdc` | FlashList 2.x without `estimatedItemSize`, `keyExtractor`, `getItemType` |
| `expo-auth-and-permissions.mdc` | PKCE via `expo-auth-session`, Apple sign-in, per-module permissions, `Stack.Protected` |
| `expo-build-and-config.mdc` | `app.config.ts`, CNG, `expo-build-properties`, runtimeVersion fingerprint, `eas.json` |
| `expo-typescript-and-tsconfig.mdc` | `expo/tsconfig.base`, typed routes, `useLocalSearchParams<T>()` |
| `expo-migration-from-sdk-53.mdc` | Stage-by-stage upgrade from SDK 51-54 to 55 |

### Skills (5)

| Dir | Purpose |
|-----|---------|
| `expo-new-route` | Scaffolds a route file under `app/` with typed params |
| `expo-new-api-route` | Scaffolds a `+api.ts` server route returning `Response` |
| `expo-new-protected-flow` | Scaffolds the `Stack.Protected` auth pattern |
| `expo-migrate-from-rn-cli` | Walks SDK 51-54 to 55 with atomic diffs |
| `expo-validate` | Runs the plugin validator, `expo-doctor`, `tsc --noEmit`, grep audit |

### Agent

`agents/expo-reviewer.md` reviews a codebase against all 45 anti-patterns by file type. Output is CRIT/ERR/WARN/NIT findings with file:line.

## Anti-pattern severity totals

| Severity | Count |
|----------|------:|
| CRIT | 4 |
| ERR | 21 |
| WARN | 16 |
| NIT | 4 |
| **Total** | **45** |

## Pinned versions (SDK 55)

Source of truth: [`expo/sdk-55/packages/expo/bundledNativeModules.json`](https://github.com/expo/expo/blob/sdk-55/packages/expo/bundledNativeModules.json).

| Package | Version |
|---------|---------|
| `expo` | `~55.0.0` |
| `expo-router` | `~55.0.14` |
| `react` | `19.2.0` |
| `react-native` | `0.83.6` |
| `react-native-reanimated` | `~4.2.1` |
| `react-native-worklets` | `0.7.4` |
| `react-native-gesture-handler` | `~2.30.0` |
| `@shopify/flash-list` | `2.0.2` |
| `expo-image` | `~55.0.10` |
| `expo-camera` | `~55.0.18` |
| `expo-video` | `~55.0.17` |
| `expo-audio` | `~55.0.14` |
| `expo-file-system` | `~55.0.20` |
| `expo-secure-store` | `~55.0.14` |
| `expo-sqlite` | `~55.0.16` |
| `@expo/vector-icons` | `^15.0.2` |
| Node | `>= 20.19.4` |
| TypeScript | `~6.0.3` |
| eas-cli | `>= 18.13.0` |

Use `~` (tilde), never `^`. Expo's compatibility matrix is minor-version-locked; always run `npx expo install --fix` after a bump.

## Validator

```sh
bash tests/validation/validate-plugin.sh
```

Checks:

1. `plugin.json` is valid JSON with required fields
2. Every `rules/*.mdc` has `---` frontmatter, `description:`, `globs:`
3. Every `skills/*/SKILL.md` has `name:` matching the directory and `description:`
4. Every `agents/*.md` has `name:` + `description:`
5. `correct-sample` is free of all banned patterns (Camera legacy, NavigationContainer, react-native-reanimated/plugin, AsyncStorage, expo-cli, expo-av, FlashList estimatedItemSize, EXPO_PUBLIC_*_SECRET, etc.)
6. `correct-sample` pins expo `~55`, flash-list `2.x`, reanimated `~4.x`, node `>=20.19.4`
7. `correct-sample/babel.config.js` uses `react-native-worklets/plugin`, NOT `react-native-reanimated/plugin`
8. `correct-sample/tsconfig.json` extends `expo/tsconfig.base`
9. `anti-pattern-sample` contains every required marker (the banned patterns above plus manually-edited `ios/MyApp/Info.plist`)
10. No em dashes or emojis anywhere in `rules/`, `skills/`, `agents/`, `README.md`

## License

MIT. See [LICENSE](./LICENSE).

## Links

- Expo SDK 55 changelog: https://expo.dev/changelog/sdk-55
- bundledNativeModules.json (SDK 55): https://github.com/expo/expo/blob/sdk-55/packages/expo/bundledNativeModules.json
- Expo Router: https://docs.expo.dev/router/introduction/
- Reanimated 4 migration: https://docs.swmansion.com/react-native-reanimated/docs/guides/migration-from-3.x/
- FlashList 2 changes: https://shopify.github.io/flash-list/docs/v2-changes
- expo-file-system new API: https://docs.expo.dev/versions/v55.0.0/sdk/filesystem/
- expo-auth-session PKCE: https://docs.expo.dev/versions/v55.0.0/sdk/auth-session/
- CNG: https://docs.expo.dev/workflow/continuous-native-generation/
- EAS runtimeVersion fingerprint policy: https://docs.expo.dev/eas-update/runtime-versions/
- RoninForge: https://roninforge.org


## More from RoninForge

[RoninForge](https://roninforge.org) builds free tools for developers working with AI coding assistants:

- [LLM API pricing comparison](https://roninforge.org/llm-pricing) - Claude, GPT, Gemini, DeepSeek, Mistral, and Grok token prices side by side, verified against official pricing pages
- [GitHub Copilot AI Credits calculator](https://roninforge.org/copilot-credits-calculator) - estimate your monthly credit burn under usage-based billing
- [All Cursor plugins](https://roninforge.org/#plugins)
