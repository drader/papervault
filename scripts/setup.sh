#!/bin/bash
set -e

echo "==> ai-project-template — İlk Kurulum (Intake Interview)"
echo ""
echo "Claude Code içinde /setup komutunu çalıştırarak başlayabilirsin."
echo "Bu script Claude Code CLI'yi /setup prompt'uyla başlatır."
echo ""

# .env kontrolü
if [ ! -f .env ]; then
  echo "HATA: .env dosyası bulunamadı. Önce 'bash scripts/install.sh' çalıştır."
  exit 1
fi

source .env

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "HATA: ANTHROPIC_API_KEY tanımlanmamış. .env dosyasını düzenle."
  exit 1
fi

# Claude Code CLI ile /setup prompt'unu çalıştır
SETUP_PROMPT=$(cat commands/setup.md)

echo "--> Claude Code başlatılıyor..."
claude --print "$SETUP_PROMPT"
