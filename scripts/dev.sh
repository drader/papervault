#!/bin/bash
set -e

echo "==> Geliştirme modu (watch)"
echo "    src/ değiştiğinde otomatik yeniden başlar"
echo ""

npx tsx watch src/index.ts
