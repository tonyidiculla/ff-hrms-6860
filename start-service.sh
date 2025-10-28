#!/bin/bash
# Auto-generated start script for ff-hrms-6860

cd "$(dirname "$0")"

# Force webpack for compatibility if Next.js 16
if grep -q '"next": ".*16\.' package.json; then
    echo "Starting ff-hrms-6860 with webpack (Next.js 16)..."
    npm run dev -- --webpack
else
    echo "Starting ff-hrms-6860..."
    npm run dev
fi
