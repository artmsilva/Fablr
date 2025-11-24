#!/bin/bash
# Automated project rename script
# Usage: ./rename-project.sh newprojectname

set -e

if [ -z "$1" ]; then
  echo "❌ Error: Please provide a new project name"
  echo "Usage: ./rename-project.sh newprojectname"
  exit 1
fi

NEW_NAME=$1
OLD_NAME=$(grep 'export const PROJECT_NAME' src/config.js | sed 's/.*= "\(.*\)";/\1/')

echo "🔄 Renaming project from '$OLD_NAME' to '$NEW_NAME'..."
echo ""

# 1. Update config file
echo "📝 Updating config.js..."
sed -i '' "s/PROJECT_NAME = \"$OLD_NAME\"/PROJECT_NAME = \"$NEW_NAME\"/" src/config.js
sed -i '' "s/PROJECT_PREFIX = \"$OLD_NAME\"/PROJECT_PREFIX = \"$NEW_NAME\"/" src/config.js

# 2. Component files don't need renaming (they're prefix-free)
echo "📁 Component files are prefix-free, no renaming needed..."

# 3. Update component definitions (custom element names and HTML tags)
echo "⚙️  Updating component definitions..."
cd src/components
for file in *.js; do
  if [ -f "$file" ]; then
    # Update custom element names
    sed -i '' "s/\"${OLD_NAME}-/\"${NEW_NAME}-/g" "$file"
    # Update HTML tags
    sed -i '' "s/<${OLD_NAME}-/<${NEW_NAME}-/g" "$file"
    sed -i '' "s/<\/${OLD_NAME}-/<\/${NEW_NAME}-/g" "$file"
  fi
done
cd ../..

# 5. Update package files
echo "📦 Updating package.json..."
sed -i '' "s/\"name\": \"$OLD_NAME\"/\"name\": \"$NEW_NAME\"/" package.json

if [ -f "package-lock.json" ]; then
  echo "📦 Updating package-lock.json..."
  sed -i '' "s/\"name\": \"$OLD_NAME\"/\"name\": \"$NEW_NAME\"/" package-lock.json
fi

# 6. Update README
echo "📄 Updating README.md..."
sed -i '' "s/# $OLD_NAME/# $NEW_NAME/g" README.md
sed -i '' "s/${OLD_NAME}/${NEW_NAME}/g" README.md

# 7. Update index.html
echo "🌐 Updating index.html..."
sed -i '' "s/<title>$OLD_NAME<\/title>/<title>$NEW_NAME<\/title>/" src/index.html

echo ""
echo "✅ Project renamed successfully from '$OLD_NAME' to '$NEW_NAME'!"
echo ""
echo "⚠️  Manual steps remaining:"
echo "  1. Review changes with: git diff"
echo "  2. Update GitHub repository name if needed"
echo "  3. Update any deployment URLs"
echo "  4. Test the application: npm run dev"
