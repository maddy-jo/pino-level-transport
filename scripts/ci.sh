#!/usr/bin/env sh

set -e
cd "$(dirname "$0")/.."

printf "\e[1;33mchecking format with prettier\e[;0m"
npm run format:check
printf "\e[1;32mprettier format check passed\e[;0m\n\n"

printf "\e[1;33mlinting with eslint\e[;0m"
npm run lint
printf "\e[1;32meslint passed\e[;0m\n\n"

printf "\e[1;33mbuilding index.ts\e[;0m"
npm run build
printf "\e[1;32mindex.js built\e[;0m\n"
