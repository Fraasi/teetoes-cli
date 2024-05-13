#!/bin/bash
# Allows us to read user input below, assigns stdin to keyboard
exec < /dev/tty

read -p "Did you remember to run build script? (y/n) " ANSWER
case ${ANSWER:0:1} in
    y|Y )
        echo "Pushing to remote $1 at $2"; exit 0
    ;;
    * )
        echo "Canceled git push"; exit 1
    ;;
esac

