mv public/fonts public/icons public/website/ && npm run build && mv public/website/* public/ && mv dist/website/* dist/ && mv dist ../ && git switch pages && rm -rf assets fonts icons index.html manifest.json public favicon.ico && mv ../dist/* . && rm -r ../dist

