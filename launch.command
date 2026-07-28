#!/bin/bash
#
# Double-click this file in Finder to run the site locally.
#
# It installs dependencies if needed, downloads the real images from the live
# WordPress site, starts the dev server and opens your browser.
#
# To stop the server: press Ctrl+C in the Terminal window, or just close it.

cd "$(dirname "$0")" || exit 1

BOLD=$'\033[1m'; DIM=$'\033[2m'; RED=$'\033[31m'; GREEN=$'\033[32m'; RESET=$'\033[0m'

echo ""
echo "${BOLD}Unique Cash For Cars — local preview${RESET}"
echo "${DIM}$(pwd)${RESET}"
echo ""

# --- Node check -------------------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  echo "${RED}Node.js isn't installed.${RESET}"
  echo ""
  echo "Install it from https://nodejs.org (choose the LTS version),"
  echo "then double-click this file again."
  echo ""
  read -r -p "Press Return to close."
  exit 1
fi

NODE_MAJOR=$(node -v | sed 's/v\([0-9]*\).*/\1/')
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "${RED}Node $(node -v) is too old — this project needs Node 20 or newer.${RESET}"
  echo "Update from https://nodejs.org, then try again."
  echo ""
  read -r -p "Press Return to close."
  exit 1
fi

echo "${GREEN}✓${RESET} Node $(node -v)"

# --- Dependencies -----------------------------------------------------------
if [ ! -d node_modules ]; then
  echo ""
  echo "Installing dependencies — first run only, takes a minute…"
  if ! npm install; then
    echo ""
    echo "${RED}npm install failed.${RESET} Scroll up for the error."
    read -r -p "Press Return to close."
    exit 1
  fi
else
  echo "${GREEN}✓${RESET} Dependencies already installed"
fi

# --- Real images ------------------------------------------------------------
# public/img ships with tiny placeholder rectangles because the machine that
# built this project couldn't reach uniquecashforcars.com.au. Anything under
# 1 KB is a placeholder.
NEEDS_ASSETS=false
for f in public/img/*; do
  [ -e "$f" ] || continue
  if [ "$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f")" -lt 1024 ]; then
    NEEDS_ASSETS=true
    break
  fi
done

if [ "$NEEDS_ASSETS" = true ]; then
  echo ""
  echo "Downloading real images from the live site…"
  rm -f public/img/*
  npm run fetch:assets || echo "${RED}Image download failed — the site will still run, with gaps.${RESET}"
else
  echo "${GREEN}✓${RESET} Images in place"
fi

# --- Sanity checks ----------------------------------------------------------
echo ""
echo "Running checks…"
npm run check:urls --silent > /dev/null 2>&1 \
  && echo "${GREEN}✓${RESET} All 32 legacy URLs resolve or redirect" \
  || echo "${RED}✗${RESET} URL check failed — run 'npm run check:urls' to see why"

# --- Go ---------------------------------------------------------------------
echo ""
echo "${BOLD}Starting the site at http://localhost:3000${RESET}"
echo "${DIM}Your browser will open in a few seconds.${RESET}"
echo "${DIM}Press Ctrl+C here to stop it.${RESET}"
echo ""

# Open the browser once the server is actually responding.
(
  for _ in $(seq 1 40); do
    if curl -s -o /dev/null http://localhost:3000; then
      open http://localhost:3000
      exit 0
    fi
    sleep 0.5
  done
) &

npm run dev
