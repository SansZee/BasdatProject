#!/bin/bash
cd "$(dirname "$0")"
go build -o api.exe ./cmd/api
echo "Build complete: api.exe"
