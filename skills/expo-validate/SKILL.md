---
name: expo-validate
description: Validates an Expo SDK 55 project structure and code by running the plugin validator (tests/validation/validate-plugin.sh) and then expo-doctor, tsc --noEmit, and a grep audit for every tracked anti-pattern marker (react-navigation/native imports, useAnimatedGestureHandler, react-native-reanimated/plugin, legacy Camera export, raw Image from react-native, useRoute, useNavigation.navigate, AsyncStorage usage, react-native-fast-image, react-native-vector-icons, react-native-fs, expo-permissions, expo install vs npx expo install, expo-cli dependency, enableHermes, bridgeless and newArchEnabled flags, FlashList estimatedItemSize, EXPO_PUBLIC_*_SECRET, NavigationContainer, createStackNavigator, expo-av imports). Reports findings grouped by severity (CRIT, ERR, WARN, NIT) with file:line and the canonical replacement.
---

# expo-validate

Use when the user asks "validate my project", "lint for Expo anti-patterns", "is my project SDK 55 compliant", or before opening a PR.

## Steps

### 1. Plugin validator

```sh
bash tests/validation/validate-plugin.sh
```

Checks: plugin.json valid, all rule MDC files have frontmatter, all SKILL.md files have name matching dir, all agent files have name + description, correct-sample is free of banned patterns, anti-pattern-sample contains required markers, no em dashes, no emojis.

### 2. expo-doctor

```sh
npx expo-doctor
```

Flags: bundled module version drift, missing config-plugin entries for installed native packages, unknown app.config fields, react-native New Architecture mismatch.

### 3. TypeScript strict check

```sh
npx tsc --noEmit
```

Confirms typed-routes consumption is correct (caught by `useLocalSearchParams<T>()` mismatches).

### 4. Grep audit

Run each pattern and report file:line. Map to severity per the anti-patterns rule.

```sh
# CRIT
grep -rEn 'EXPO_PUBLIC_[A-Z_]*SECRET' --include='*.{ts,tsx,env,json}' .
grep -rEn 'AsyncStorage\.setItem\(["'"'"']access_token' --include='*.{ts,tsx}' .
grep -rEn 'client_?[Ss]ecret\s*:\s*["'"'"']' --include='*.{ts,tsx}' .

# ERR
grep -rEn 'useAnimatedGestureHandler' --include='*.{ts,tsx}' .
grep -rEn 'from ["'"'"']@react-navigation/native["'"'"']' --include='*.{ts,tsx}' .
grep -rEn 'NavigationContainer' --include='*.{ts,tsx}' .
grep -rEn 'createStackNavigator' --include='*.{ts,tsx}' .
grep -rEn 'react-native-reanimated/plugin' --include='*.{js,ts}' babel.config.js
grep -rEn 'import\s*\{[^}]*\bCamera\b[^}]*\}\s*from\s*["'"'"']expo-camera' --include='*.{ts,tsx}' .
grep -rEn 'from ["'"'"']expo-av["'"'"']' --include='*.{ts,tsx}' .
grep -rEn 'import\s*\*\s*as\s+Permissions\s+from\s+["'"'"']expo-permissions' --include='*.{ts,tsx}' .
grep -rEn '"expo-cli"' package.json
grep -rEn '"expo\s+(install|build|run)"' package.json
grep -rEn 'estimatedItemSize' --include='*.{ts,tsx}' .

# WARN
grep -rEn 'from ["'"'"']react-native-fast-image["'"'"']' --include='*.{ts,tsx}' .
grep -rEn 'from ["'"'"']react-native-vector-icons' --include='*.{ts,tsx}' .
grep -rEn 'from ["'"'"']react-native-fs["'"'"']' --include='*.{ts,tsx}' .
grep -rEn 'useRoute\(\)' --include='*.{ts,tsx}' .
grep -rEn 'router\.navigate\(' --include='*.{ts,tsx}' .
grep -rEn 'resizeMode' --include='*.{ts,tsx}' .
grep -rEn '"newArchEnabled"' app.json app.config.ts 2>/dev/null
grep -rEn '"jsEngine"' app.json app.config.ts 2>/dev/null
grep -rEn '"bridgeless"' app.json app.config.ts 2>/dev/null

# Additional ERR-level checks
# AP #24: classic expo-file-system API assumed default (it moved to /legacy in SDK 54+).
grep -rEn '\bFileSystem\.(documentDirectory|cacheDirectory|writeAsStringAsync|readAsStringAsync|downloadAsync|getInfoAsync)' --include='*.{ts,tsx}' .
grep -rEn 'from ["'"'"']expo-file-system["'"'"']' --include='*.{ts,tsx}' . | grep -v '/legacy' | grep -v '/next'

# AP #18: SafeAreaView absent in root layout / screens. Heuristic: warn if no SafeAreaView import anywhere in app/.
grep -rqE 'from ["'"'"']react-native-safe-area-context["'"'"']' app/ --include='*.{ts,tsx}' || echo "WARN: no react-native-safe-area-context import in app/; verify edge-to-edge handling on Android (#18)"

# AP #43: useFonts without a render gate. Heuristic: file uses useFonts but no `if (!loaded` guard.
for f in $(grep -rEl 'useFonts\(' --include='*.{ts,tsx}' .); do
  if ! grep -qE 'if\s*\(\s*!\s*(loaded|fontsLoaded)' "$f"; then
    echo "WARN [$f]: useFonts() called but no 'if (!loaded ...) return null' gate found (#43)"
  fi
done

# NIT
test -f app.config.ts || echo "WARN: no app.config.ts (using app.json only)"
grep -qE '"extends"\s*:\s*"expo/tsconfig.base"' tsconfig.json || echo "NIT: tsconfig.json does not extend expo/tsconfig.base"
```

### 5. Report

Group findings by severity. For each:

```
[CRIT #2 expo-public-secret]
  .env:3
  EXPO_PUBLIC_STRIPE_SECRET=sk_live_...
  Fix: move to EAS Secret; never EXPO_PUBLIC_*_SECRET
```

End with totals and a pass/fail verdict.
