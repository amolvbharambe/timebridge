#!/bin/bash
# Convenient one-click launcher for office VPN sharing
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

PORT=${1:-8080}
python3 "$DIR/serve.py" "$PORT"
