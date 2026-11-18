#!/bin/sh
# Build with the GitHub Pages base path and publish dist/ to the gh-pages branch
set -e
BASE_PATH=/sketchvlada/ npm run build
cd dist
touch .nojekyll
rm -rf .git
git init -q -b gh-pages
git add -A
git commit -qm "Deploy"
git push -f "$(git -C .. remote get-url origin)" gh-pages
rm -rf .git
