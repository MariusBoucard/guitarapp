---
name: i18n-keys
description: Use when adding, modifying, or removing translatable strings in Vue components. Ensures keys are added to both locale files (en.json and fr.json) and follow the project's i18n conventions. Use ONLY when the task involves user-facing text, labels, messages, or translations.
---

# i18n Keys

This project uses **vue-i18n** for internationalization with two locales:

- `src/locales/en.json` (English)
- `src/locales/fr.json` (French, fallback locale)

## Rules

1. **Always update both files.** Every key in `en.json` must have a corresponding key in `fr.json` and vice versa.
2. Keys use **snake_case** naming.
3. Keys are organized in **top-level objects** named after the component or feature (e.g., `training`, `video_component`, `manche`).
4. Never hardcode user-facing strings in Vue templates — always use `$t('key')`.

## Adding a new key

1. Determine the component namespace (top-level key). Use the existing one if it matches, or create a new one.
2. Add the key to `src/locales/en.json` under the appropriate namespace:
   ```json
   "my_component": {
     "existing_key": "Existing value",
     "new_key": "New English value"
   }
   ```
3. Add the same key to `src/locales/fr.json` under the same namespace:
   ```json
   "my_component": {
     "existing_key": "Valeur existante",
     "new_key": "Nouvelle valeur en français"
   }
   ```
4. Use it in the Vue template: `{{ $t('my_component.new_key') }}`

## Interpolation

Use `{{variable}}` syntax (double curly braces) for named interpolation:

```json
"delete_confirm": "Are you sure you want to delete user {{name}}?"
```

```html
<p>{{ $t('user.delete_confirm', { name: userName }) }}</p>
```

## Pluralization

Use pipe-separated forms for pluralization:

```json
"note_count": "{count} note selected | {count} notes selected"
```

```html
{{ $t('keyboard_component.note_count', selectedKey.size, { count: selectedKey.size }) }}
```

## Verification

After adding keys, run `npm run lint` to check for any issues. Then restart opencode if config changes were made.
