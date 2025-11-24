# Project Rename Guide

This guide explains how to rename the project in the future.

## Quick Rename (Recommended)

### 1. Update the Config File

Edit `src/config.js` and change the constants:

```javascript
export const PROJECT_NAME = "yournewname";
export const PROJECT_PREFIX = "yournewname";
```

### 2. Update Component Internals

Component files are now prefix-free (button.js, input.js, etc.), so no file renaming needed!
Run this script to update all component definitions:

```bash
cd src/components
for file in *.js; do
  # Update custom element names
  sed -i '' 's/"fable-/"yournewname-/g' "$file"

  # Update component metadata
  sed -i '' 's/component: "fable-/component: "yournewname-/g' "$file"

  # Update HTML tags in stories
  sed -i '' 's/<fable-/<yournewname-/g' "$file"
  sed -i '' 's/<\/fable-/<\/yournewname-/g' "$file"
done
```

### 3. Update Package Files

```bash
# Update package.json
sed -i '' 's/"fable"/"yournewname"/g' package.json

# Update package-lock.json if it exists
sed -i '' 's/"fable"/"yournewname"/g' package-lock.json

# Update README.md
sed -i '' 's/fable/yournewname/g' README.md
```

### 4. Update Page Title

Edit `src/index.html`:

```html
<title>yournewname</title>
```

## What Gets Updated Automatically

Thanks to the centralized config file (`src/config.js`), these are automatically updated:

- ✅ Global stories registry (`window[STORIES_KEY]`)
- ✅ localStorage theme key
- ✅ Welcome message in the app
- ✅ All component story registrations

## What Needs Manual Updates

- Custom element names in component definitions
- HTML tags in component stories
- Package name in package.json
- Documentation in README.md
- Page title in index.html

## ✅ Prefix-Free Components

Component files are now named generically (button.js, input.js, etc.) which means:

- **No file renaming needed** when changing the project name
- Just update `src/config.js` and run the rename script
- Custom element names in the HTML still use the prefix (e.g., `<fable-button>`)

## Automated Rename Script (Future Enhancement)

Consider creating a `rename-project.sh` script that takes the new name as an argument:

```bash
#!/bin/bash
NEW_NAME=$1
./rename-project.sh mynewproject
```

This would automate all the steps above.
