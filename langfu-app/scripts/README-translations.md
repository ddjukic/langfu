# Translation Fix Scripts

This directory contains scripts to fix and maintain proper English translations in story vocabulary data.

## Problem

Stories in the database had placeholder translations like `"[Translation for estadio needed]"` instead of proper English translations like `"stadium"`. This caused QA tests to fail when checking hover tooltips on story vocabulary.

## Solution

Created comprehensive scripts to:

1. Identify all stories with placeholder translations
2. Replace placeholders with proper English translations
3. Verify all stories have correct translations
4. Test that translations display correctly in the UI

## Scripts

### 1. `fix-all-story-translations.ts`

**Purpose**: Comprehensive fix for ALL placeholder translations in stories

**Usage**:

```bash
pnpm fix:translations
# or
pnpm tsx scripts/fix-all-story-translations.ts
```

**What it does**:

- Scans all stories in the database
- Identifies placeholder translations like `[Translation for word needed]`
- Replaces them with proper English translations
- Updates both `keywords` and `words` JSON fields
- Supports Spanish and German vocabulary

**Translation Coverage**:

- **Spanish**: Football vocabulary (estadio→stadium, jugadores→players, etc.)
- **German**: Football vocabulary + breakfast vocabulary (Stadion→stadium, Kaffee→coffee, etc.)

### 2. `verify-all-translations.ts`

**Purpose**: Verify all stories have proper translations (no placeholders)

**Usage**:

```bash
pnpm verify:translations
# or
pnpm tsx scripts/verify-all-translations.ts
```

**What it does**:

- Scans ALL stories in database
- Identifies any remaining placeholder translations
- Provides summary statistics
- Shows sample translations for verification

### 3. `test-translation-display.ts`

**Purpose**: Test that translations will display correctly in hover tooltips

**Usage**:

```bash
pnpm test:translations
# or
pnpm tsx scripts/test-translation-display.ts
```

**What it does**:

- Focuses on the specific football stories mentioned in QA testing
- Verifies key vocabulary has proper English translations
- Provides URLs for manual testing
- Gives QA testing instructions

### 4. `fix-story-translations.ts` (Legacy)

**Purpose**: Original script that fixed only the two specific football stories

**Status**: Superseded by `fix-all-story-translations.ts`

## Vocabulary Translations

### Spanish Football Vocabulary

```json
{
  "estadio": "stadium",
  "jugadores": "players",
  "equipo": "team",
  "gol": "goal",
  "pelota": "ball",
  "hinchada": "fans",
  "gritar": "to shout",
  "tiempo": "time",
  "ataque": "attack",
  "defensa": "defense"
  // ... and more
}
```

### German Vocabulary

```json
{
  "Stadion": "stadium",
  "Spieler": "players",
  "Mannschaft": "team",
  "Tor": "goal",
  "Ball": "ball",
  "Kaffee": "coffee",
  "Brot": "bread",
  "Butter": "butter"
  // ... and more
}
```

## QA Testing

After running the fix scripts:

1. **Navigate to stories**:
   - German: http://localhost:3000/library/story/cmeloo62u000ndffku0hijo9e
   - Spanish: http://localhost:3000/library/story/cmelonq6a000ldffkhxvz30r6

2. **Test hover tooltips**:
   - Look for purple highlighted words
   - Hover over them to see translations
   - Verify tooltips show proper English (e.g., "stadium", "players")
   - Verify NO placeholders like "[Translation for estadio needed]"

3. **Expected result**: ✅ All hover tooltips show proper English words

## Results

✅ **Fixed**: 146 placeholder translations across 3 stories
✅ **Verified**: All 5 stories now have proper English translations
✅ **Ready**: QA tests should now pass

## Future Maintenance

If new stories are added with placeholder translations:

1. Add the translations to the dictionaries in `fix-all-story-translations.ts`
2. Run `pnpm fix:translations` to apply fixes
3. Run `pnpm verify:translations` to confirm all fixed
4. Run `pnpm test:translations` to verify UI display

## Database Schema

Stories use these JSON fields for vocabulary:

- `keywords`: Primary vocabulary array
- `words`: Secondary vocabulary array (may duplicate keywords)

Each vocabulary entry structure:

```json
{
  "l2": "estadio", // Target language word
  "l1": "stadium", // English translation
  "pos": "noun" // Part of speech
}
```
