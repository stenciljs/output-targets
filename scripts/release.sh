#!/bin/bash

# Automated release script using semantic-release
# This script runs semantic-release for each package in the monorepo

set -e

PACKAGES=("packages/vue" "packages/react" "packages/angular" "packages/ssr")
DRY_RUN=${1:-""}
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$DRY_RUN" = "--dry-run" ]; then
  echo "🔍 Running in DRY RUN mode - no changes will be made"
  echo ""
fi

if [ "$CURRENT_BRANCH" != "main" ] && [[ ! "$CURRENT_BRANCH" =~ ^release/ ]] && [ "$DRY_RUN" != "--dry-run" ]; then
  echo "⚠️  WARNING: You are on branch '$CURRENT_BRANCH', not 'main' or a release branch"
  echo "   Releases can only be created from the 'main' branch or a 'release/*' branch"
  echo ""
  exit 1
fi

if [ "$CURRENT_BRANCH" != "main" ] && [[ ! "$CURRENT_BRANCH" =~ ^release/ ]]; then
  echo "ℹ️  Note: You are on branch '$CURRENT_BRANCH'."
  echo "   Dry run will analyze commits, but actual releases only work from 'main' branch."
  echo ""
fi

echo "📦 Analyzing packages for release..."
echo ""

HAS_CHANGES=false

for PKG_DIR in "${PACKAGES[@]}"; do
  if [ -d "$PKG_DIR" ]; then
    PKG_NAME=$(node -p "require('./$PKG_DIR/package.json').name")
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 Checking $PKG_NAME ($PKG_DIR)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    cd "$PKG_DIR"

    if [ "$DRY_RUN" = "--dry-run" ]; then
      OUTPUT=$(npx semantic-release --dry-run --no-ci 2>&1)

      # Check if branch mismatch message appears
      if echo "$OUTPUT" | grep -q "while semantic-release is configured to only publish from main"; then
        # Manually check for commits since last tag to give user feedback
        LAST_TAG=$(git tag -l "${PKG_NAME}@*" --sort=-version:refname | head -n 1)
        if [ -z "$LAST_TAG" ]; then
          echo "ℹ️  No previous release found"
        else
          # Extract scope from package name (e.g., react from @stencil/react-output-target)
          SCOPE=$(echo "$PKG_NAME" | sed 's/@stencil\/\(.*\)-output-target/\1/' | sed 's/@stencil\///')

          # Count commits with this scope since last tag
          COMMIT_COUNT=$(git log "$LAST_TAG..HEAD" --oneline --grep="feat($SCOPE):" --grep="fix($SCOPE):" --grep="perf($SCOPE):" 2>/dev/null | wc -l | tr -d ' ')

          if [ "$COMMIT_COUNT" -gt 0 ]; then
            echo "📋 Found $COMMIT_COUNT commit(s) since $LAST_TAG with scope '$SCOPE'"
            git log "$LAST_TAG..HEAD" --oneline --grep="feat($SCOPE):" --grep="fix($SCOPE):" --grep="perf($SCOPE):" 2>/dev/null | head -5
            echo "   ⚠️  Note: Run this on 'main' branch to see what version would be released"
          else
            echo "ℹ️  No commits with scope '$SCOPE' since $LAST_TAG"
          fi
        fi
      elif echo "$OUTPUT" | grep -q "The next release version is"; then
        HAS_CHANGES=true
        echo "✅ Changes detected for $PKG_NAME"
        echo "$OUTPUT" | grep -A 2 "The next release version is"
      else
        echo "ℹ️  No changes for $PKG_NAME"
      fi
    else
      if npx semantic-release --no-ci; then
        HAS_CHANGES=true
        echo "✅ Released $PKG_NAME"
      else
        echo "ℹ️  No changes for $PKG_NAME"
      fi
    fi

    cd - > /dev/null
    echo ""
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$HAS_CHANGES" = true ]; then
  echo "✅ Done! Packages have been analyzed/updated"
else
  echo "ℹ️  No releasable changes detected in any package"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
