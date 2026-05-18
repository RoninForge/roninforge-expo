#!/usr/bin/env bash
# Validates the roninforge-expo plugin structure and content.
# Run: bash tests/validation/validate-plugin.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ERRORS=0
WARNINGS=0

red()    { printf "\033[31m%s\033[0m\n" "$1"; }
green()  { printf "\033[32m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }

error() { red "ERROR: $1"; ERRORS=$((ERRORS + 1)); }
warn()  { yellow "WARN:  $1"; WARNINGS=$((WARNINGS + 1)); }
pass()  { green "PASS:  $1"; }

echo "=== Plugin Structure Validation ==="
echo ""

# 1. plugin.json valid JSON
PLUGIN_JSON="$REPO_ROOT/.cursor-plugin/plugin.json"
if [ -f "$PLUGIN_JSON" ]; then
    if python3 -c "import json; json.load(open('$PLUGIN_JSON'))" 2>/dev/null; then
        pass "plugin.json is valid JSON"
        NAME_VAL=$(python3 -c "import json; print(json.load(open('$PLUGIN_JSON')).get('name',''))")
        if [ "$NAME_VAL" = "roninforge-expo" ]; then
            pass "plugin.json name is roninforge-expo"
        else
            error "plugin.json name is '$NAME_VAL', expected 'roninforge-expo'"
        fi
        for field in name version description license; do
            HAS=$(python3 -c "import json; d=json.load(open('$PLUGIN_JSON')); print('1' if '$field' in d else '0')")
            if [ "$HAS" = "1" ]; then
                pass "plugin.json has '$field'"
            else
                warn "plugin.json missing '$field'"
            fi
        done
    else
        error "plugin.json is not valid JSON"
    fi
else
    error ".cursor-plugin/plugin.json not found"
fi

echo ""
echo "=== Rule Files ==="
echo ""

RULE_COUNT=0
for rule_file in "$REPO_ROOT"/rules/*.mdc; do
    [ -f "$rule_file" ] || continue
    RULE_COUNT=$((RULE_COUNT + 1))
    fname=$(basename "$rule_file")
    first_line=$(head -1 "$rule_file")
    if [ "$first_line" = "---" ]; then
        pass "$fname has frontmatter"
        if grep -qE "^description:" "$rule_file"; then
            pass "$fname has description"
        else
            error "$fname missing description"
        fi
        if grep -qE "^globs:" "$rule_file"; then
            pass "$fname has globs"
        else
            warn "$fname missing globs"
        fi
    else
        error "$fname missing frontmatter"
    fi
done
echo "Total rule files: $RULE_COUNT"
if [ "$RULE_COUNT" -lt 10 ]; then
    error "Expected at least 10 rule files, found $RULE_COUNT"
fi

echo ""
echo "=== Skill Files ==="
echo ""

SKILL_COUNT=0
for skill_dir in "$REPO_ROOT"/skills/*/; do
    [ -d "$skill_dir" ] || continue
    SKILL_COUNT=$((SKILL_COUNT + 1))
    dname=$(basename "$skill_dir")
    skill_file="$skill_dir/SKILL.md"
    if [ -f "$skill_file" ]; then
        first_line=$(head -1 "$skill_file")
        if [ "$first_line" = "---" ]; then
            pass "$dname/SKILL.md has frontmatter"
            NAME=$(awk '/^name:/ {print $2; exit}' "$skill_file")
            if [ "$NAME" = "$dname" ]; then
                pass "$dname/SKILL.md name matches dir"
            else
                error "$dname/SKILL.md name '$NAME' != dir '$dname'"
            fi
            if grep -qE "^description:" "$skill_file"; then
                pass "$dname/SKILL.md has description"
            else
                error "$dname/SKILL.md missing description"
            fi
        else
            error "$dname/SKILL.md missing frontmatter"
        fi
    else
        error "$dname/SKILL.md not found"
    fi
done
echo "Total skill dirs: $SKILL_COUNT"
if [ "$SKILL_COUNT" -lt 5 ]; then
    error "Expected at least 5 skills, found $SKILL_COUNT"
fi

echo ""
echo "=== Agent Files ==="
echo ""

AGENT_COUNT=0
for agent_file in "$REPO_ROOT"/agents/*.md; do
    [ -f "$agent_file" ] || continue
    AGENT_COUNT=$((AGENT_COUNT + 1))
    fname=$(basename "$agent_file")
    first_line=$(head -1 "$agent_file")
    if [ "$first_line" = "---" ]; then
        pass "$fname has frontmatter"
        if grep -qE "^name:" "$agent_file"; then
            pass "$fname has name"
        else
            error "$fname missing name"
        fi
        if grep -qE "^description:" "$agent_file"; then
            pass "$fname has description"
        else
            error "$fname missing description"
        fi
    else
        error "$fname missing frontmatter"
    fi
done
echo "Total agents: $AGENT_COUNT"

echo ""
echo "=== Correct Sample (must be clean) ==="
echo ""

CORRECT="$REPO_ROOT/tests/fixtures/correct-sample"
if [ ! -d "$CORRECT" ]; then
    error "correct-sample dir not found"
else
    declare -a FORBID=(
        'from ["'"'"']@react-navigation/native["'"'"']'
        'useAnimatedGestureHandler'
        'react-native-reanimated/plugin'
        'useRoute\(\)'
        'react-native-fast-image'
        'react-native-vector-icons'
        'react-native-fs'
        'expo-permissions'
        'react-native-async-storage/async-storage'
        '"expo-cli"'
        '"expo install"'
        '"expo start"'
        '"expo build'
        'enableHermes'
        '"bridgeless"'
        '"newArchEnabled"'
        '"jsEngine"'
        'estimatedItemSize'
        'EXPO_PUBLIC_[A-Z_]*SECRET'
        'NavigationContainer'
        'createStackNavigator'
        'from ["'"'"']expo-av["'"'"']'
        'import\s*\{[^}]*\bCamera\b[^}]*\}\s*from\s*["'"'"']expo-camera["'"'"']'
        'resizeMode\s*=\s*\{?FastImage'
        'from ["'"'"']lucia["'"'"']'
        'clientSecret\s*:\s*["'"'"']'
    )
    for pat in "${FORBID[@]}"; do
        if grep -rEn "$pat" "$CORRECT" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" --include="*.mjs" --include="*.cjs" 2>/dev/null; then
            error "correct-sample contains forbidden pattern: $pat"
        else
            pass "correct-sample free of: $pat"
        fi
    done

    # Must NOT have raw 'import { Image } from "react-native"' for content rendering.
    # Heuristic: search for that exact destructured import.
    if grep -rEn 'import\s*\{[^}]*\bImage\b[^}]*\}\s*from\s*["'"'"']react-native["'"'"']' "$CORRECT" --include="*.ts" --include="*.tsx" 2>/dev/null; then
        error "correct-sample imports Image from react-native (use expo-image)"
    else
        pass "correct-sample free of: Image from react-native"
    fi

    # Required files
    if [ -f "$CORRECT/app.config.ts" ]; then
        pass "correct-sample has app.config.ts"
    else
        error "correct-sample missing app.config.ts (anti-pattern #42)"
    fi
    if [ -f "$CORRECT/app/_layout.tsx" ]; then
        pass "correct-sample has app/_layout.tsx"
    else
        error "correct-sample missing app/_layout.tsx (anti-pattern #7)"
    fi
    if [ -f "$CORRECT/babel.config.js" ]; then
        pass "correct-sample has babel.config.js"
        if grep -q 'react-native-worklets/plugin' "$CORRECT/babel.config.js"; then
            pass "babel.config.js contains react-native-worklets/plugin"
        else
            error "babel.config.js missing react-native-worklets/plugin"
        fi
        if grep -q 'react-native-reanimated/plugin' "$CORRECT/babel.config.js"; then
            error "babel.config.js contains the deprecated react-native-reanimated/plugin"
        else
            pass "babel.config.js free of react-native-reanimated/plugin"
        fi
    else
        error "correct-sample missing babel.config.js"
    fi

    if [ -f "$CORRECT/tsconfig.json" ]; then
        if grep -q '"extends"\s*:\s*"expo/tsconfig.base"' "$CORRECT/tsconfig.json"; then
            pass "tsconfig extends expo/tsconfig.base"
        else
            error "tsconfig does not extend expo/tsconfig.base (anti-pattern #44)"
        fi
    fi

    # Pinned versions
    if python3 -c "
import json,sys
p=json.load(open('$CORRECT/package.json'))
deps=p.get('dependencies',{})
e=deps.get('expo','')
fl=deps.get('@shopify/flash-list','')
ra=deps.get('react-native-reanimated','')
wk=deps.get('react-native-worklets','')
ok = e.startswith('~55') and fl.startswith('2.') and ra.startswith('~4.') and wk
sys.exit(0 if ok else 1)
"; then
        pass "correct-sample pins expo ~55, flash-list 2.x, reanimated ~4.x, worklets present"
    else
        error "correct-sample version pins do not match SDK 55 bundle"
    fi

    if python3 -c "
import json,sys
p=json.load(open('$CORRECT/package.json'))
n=p.get('engines',{}).get('node','')
sys.exit(0 if '20.19' in n or '>=20.19' in n else 1)
"; then
        pass "correct-sample pins node >=20.19.4"
    else
        error "correct-sample node engine not >=20.19.4"
    fi
fi

echo ""
echo "=== Anti-Pattern Sample (must CONTAIN markers) ==="
echo ""

ANTI="$REPO_ROOT/tests/fixtures/anti-pattern-sample"
if [ ! -d "$ANTI" ]; then
    error "anti-pattern-sample dir not found"
else
    declare -a REQUIRE=(
        'useAnimatedGestureHandler'
        'react-native-reanimated/plugin'
        'NavigationContainer'
        'createStackNavigator'
        'from ["'"'"']@react-navigation/native["'"'"']'
        'useRoute\('
        'react-native-fast-image'
        'react-native-vector-icons'
        'react-native-fs'
        'expo-permissions'
        '@react-native-async-storage/async-storage'
        '"expo-cli"'
        '"expo start"'
        '"expo build'
        '"newArchEnabled"'
        '"jsEngine"'
        '"bridgeless"'
        'estimatedItemSize'
        'EXPO_PUBLIC_STRIPE_SECRET'
        'from ["'"'"']expo-av["'"'"']'
        'from ["'"'"']expo-camera["'"'"']'
        'Camera\.Constants'
        'clientSecret\s*:'
        'from ["'"'"']lucia["'"'"']'
        'FileSystem\.writeAsStringAsync'
        'StatusBar.*translucent'
        'router\.navigate\('
    )
    for pat in "${REQUIRE[@]}"; do
        if grep -rEn "$pat" "$ANTI" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" --include="*.mjs" --include="*.cjs" >/dev/null 2>&1; then
            pass "anti-pattern-sample contains: $pat"
        else
            error "anti-pattern-sample missing marker: $pat"
        fi
    done
    if [ -f "$ANTI/app.json" ]; then
        pass "anti-pattern-sample has app.json (without app.config.ts)"
    else
        error "anti-pattern-sample missing app.json marker"
    fi
    if [ -f "$ANTI/app.config.ts" ]; then
        error "anti-pattern-sample should NOT have app.config.ts (the anti-pattern is app.json only)"
    else
        pass "anti-pattern-sample has no app.config.ts (correctly demonstrating anti-pattern #42)"
    fi
    if [ -f "$ANTI/ios/MyApp/Info.plist" ]; then
        pass "anti-pattern-sample has manually-edited ios/MyApp/Info.plist"
    else
        error "anti-pattern-sample missing ios/MyApp/Info.plist marker"
    fi
    if [ ! -f "$ANTI/app/_layout.tsx" ]; then
        pass "anti-pattern-sample correctly missing app/_layout.tsx (anti-pattern #7)"
    else
        error "anti-pattern-sample should NOT have app/_layout.tsx (anti-pattern is missing layout)"
    fi
fi

echo ""
echo "=== Em-Dash and Emoji Audit ==="
echo ""

EMDASH=$(grep -rln $'\xe2\x80\x94' "$REPO_ROOT/rules" "$REPO_ROOT/skills" "$REPO_ROOT/agents" "$REPO_ROOT/README.md" 2>/dev/null || true)
if [ -z "$EMDASH" ]; then
    pass "No em dashes in rules/skills/agents/README"
else
    error "Em dashes found in: $EMDASH"
fi

EMOJI_HITS=$(python3 - <<PY
import os,sys
roots=["$REPO_ROOT/rules","$REPO_ROOT/skills","$REPO_ROOT/agents","$REPO_ROOT/README.md"]
RANGES=[
    (0x1F300,0x1FAFF),
    (0x2600,0x27BF),
    (0x1F000,0x1F02F),
]
def is_emoji(c):
    o=ord(c)
    for a,b in RANGES:
        if a<=o<=b: return True
    return False
hits=[]
def scan(p):
    try:
        with open(p,encoding="utf-8",errors="ignore") as f:
            for i,line in enumerate(f,1):
                for c in line:
                    if is_emoji(c):
                        hits.append(f"{p}:{i}:{c}")
                        break
    except Exception:
        pass
for r in roots:
    if os.path.isfile(r): scan(r)
    elif os.path.isdir(r):
        for dp,_,fs in os.walk(r):
            for fn in fs:
                if fn.endswith((".md",".mdc")):
                    scan(os.path.join(dp,fn))
print("\n".join(hits))
PY
)
if [ -z "$EMOJI_HITS" ]; then
    pass "No emojis in rules/skills/agents/README"
else
    error "Emojis found:
$EMOJI_HITS"
fi

echo ""
echo "=========================="
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"
echo "=========================="

if [ "$ERRORS" -gt 0 ]; then
    red "VALIDATION FAILED"
    exit 1
fi
green "ALL CHECKS PASSED"
exit 0
