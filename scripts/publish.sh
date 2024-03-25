#!/usr/bin/env bash

PUBLIC=false

function printHelp {
    echo "Usage: ./publish.sh [<flags>]

          Description:
            Helper script to publish circuits to npm/registry.

          Flags:
            -h, --help       Show this help message.
            -p, --public     Publish with `--access public` flag."
}

function parseArgs {
    while [[ -n "$1" ]]
    do
        case "$1" in
            -h | --help)
                printHelp && exit 0
                ;;
            -p | --public) shift
                PUBLIC=true
                ;;
            *)
                echo "invalid flag: $1" && exit 1
                ;;
        esac
    done
}

parseArgs "$@"

cp README.md package.json circuits/

if [ ${PUBLIC} == true ]
then
  npm publish circuits/ --access public
else
  npm publish circuits/
fi

rm circuits/README.md circuits/package.json
