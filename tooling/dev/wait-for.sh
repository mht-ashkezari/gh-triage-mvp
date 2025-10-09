#!/usr/bin/env bash
set -euo pipefail
host="$1"; shift; port="$1"; shift
until nc -z "$host" "$port"; do echo "waiting for $host:$port"; sleep 1; done
exec "$@"
