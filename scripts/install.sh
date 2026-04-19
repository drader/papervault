#!/bin/bash
set -e

echo "==> ai-project-template kurulumu"

# 1. Node bağımlılıkları
echo "--> npm install"
npm install

# 2. .env oluştur
if [ ! -f .env ]; then
  cp .env.example .env
  echo "--> .env oluşturuldu — ANTHROPIC_API_KEY değerini gir"
fi

# 3. obsidian-hybrid-search global kurulum
if ! command -v obsidian-hybrid-search &> /dev/null; then
  echo "--> obsidian-hybrid-search kuruluyor..."
  npm install -g obsidian-hybrid-search
else
  echo "--> obsidian-hybrid-search zaten kurulu: $(obsidian-hybrid-search --version 2>/dev/null || echo 'versiyon alınamadı')"
fi

# 4. Daemon kurulumu (MacOS: launchd)
if [[ "$OSTYPE" == "darwin"* ]]; then
  PLIST_PATH="$HOME/Library/LaunchAgents/com.memex.daemon.plist"
  PROJECT_DIR="$(pwd)"

  cat > "$PLIST_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.memex.daemon</string>
  <key>ProgramArguments</key>
  <array>
    <string>$(which node)</string>
    <string>$(which tsx)</string>
    <string>$PROJECT_DIR/src/index.ts</string>
  </array>
  <key>WorkingDirectory</key>
  <string>$PROJECT_DIR</string>
  <key>RunAtLoad</key>
  <false/>
  <key>StandardOutPath</key>
  <string>$PROJECT_DIR/logs/daemon.log</string>
  <key>StandardErrorPath</key>
  <string>$PROJECT_DIR/logs/daemon-error.log</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
  </dict>
</dict>
</plist>
EOF

  echo "--> launchd plist yazıldı: $PLIST_PATH"
  echo "--> Başlatmak için: launchctl load $PLIST_PATH"
  echo "--> Durdurmak için: launchctl unload $PLIST_PATH"

# Linux: systemd
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  PROJECT_DIR="$(pwd)"
  SERVICE_PATH="$HOME/.config/systemd/user/memex.service"
  mkdir -p "$(dirname "$SERVICE_PATH")"

  cat > "$SERVICE_PATH" << EOF
[Unit]
Description=Memex Daemon
After=network.target

[Service]
Type=simple
WorkingDirectory=$PROJECT_DIR
ExecStart=$(which npx) tsx $PROJECT_DIR/src/index.ts
Restart=on-failure
StandardOutput=append:$PROJECT_DIR/logs/daemon.log
StandardError=append:$PROJECT_DIR/logs/daemon-error.log

[Install]
WantedBy=default.target
EOF

  echo "--> systemd service yazıldı: $SERVICE_PATH"
  echo "--> Başlatmak için: systemctl --user enable --now memex"
fi

echo ""
echo "==> Kurulum tamamlandı!"
echo "    Sonraki adım: ANTHROPIC_API_KEY değerini .env dosyasına yaz"
echo "    İlk kurulum:  npm run setup"
echo "    Daemon başlat: npm start"
