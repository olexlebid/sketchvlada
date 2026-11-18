#!/bin/sh
# Build with the GitHub Pages base path and publish dist/ to the gh-pages branch
set -e
# Wrap the palette preview (authored as an artifact body) into a standalone page
mkdir -p public/palettes
{
  printf '<!doctype html>\n<html lang="uk">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="robots" content="noindex">\n'
  printf '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%%}[hidden]{display:none!important}</style>\n'
  cat palettes/index.html
  printf '\n</html>\n'
} > public/palettes/index.html
cp palettes/img.js public/palettes/img.js
BASE_PATH=/sketchvlada/ npm run build
cd dist
touch .nojekyll
rm -rf .git
git init -q -b gh-pages
git add -A
git commit -qm "Deploy"
git push -f "$(git -C .. remote get-url origin)" gh-pages
rm -rf .git
