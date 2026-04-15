#!/bin/bash
# Run this once in your project root to remove old conflicting folders
git rm -rf "app/sign-in/[[...sign-in]]" 2>/dev/null || true
git rm -rf "app/sign-up/[[...sign-up]]" 2>/dev/null || true
git rm -rf "app/signup" 2>/dev/null || true
git rm -rf "app/login" 2>/dev/null || true
echo "Cleaned old auth folders. Now run: git add . && git commit -m 'fix: remove old auth folders' && git push"
