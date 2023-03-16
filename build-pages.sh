npm run build && mv dist ../ && git switch pages && rm -rf assets fonts icons index.html manifest.json public favicon.ico website && mv ../dist/* . && rm -r ../dist && git add -A && git commit -m 'update' && git push hipo pages && git switch main

