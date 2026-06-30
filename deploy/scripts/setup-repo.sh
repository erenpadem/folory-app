#!/usr/bin/env bash
# Sunucuda ilk kurulum — GitHub SSH ile clone (HTTPS/token gerekmez).
set -euo pipefail

REPO_SSH="${GIT_REPO_SSH:-git@github.com:erenpadem/folory-app.git}"
INSTALL_DIR="${1:-/opt/folory}"

echo "GitHub SSH bağlantısı test ediliyor..."
if ! ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new -T git@github.com 2>&1 | grep -qi 'successfully authenticated'; then
    echo "" >&2
    echo "GitHub SSH anahtarı tanınmıyor." >&2
    echo "Sunucuda (root veya deploy kullanıcısı ile):" >&2
    echo "  ssh-keygen -t ed25519 -C \"folory-server\" -f ~/.ssh/id_ed25519 -N \"\"" >&2
    echo "  cat ~/.ssh/id_ed25519.pub   # çıktıyı GitHub → Settings → SSH keys'e ekle" >&2
    echo "  ssh -T git@github.com" >&2
    exit 1
fi

if [[ -d "$INSTALL_DIR/.git" ]]; then
    echo "Repo zaten var: $INSTALL_DIR"
    git -C "$INSTALL_DIR" remote set-url origin "$REPO_SSH"
    export GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=accept-new"
    git -C "$INSTALL_DIR" pull --ff-only origin main 2>/dev/null || git -C "$INSTALL_DIR" pull --ff-only origin master
else
    echo "Clone: $REPO_SSH → $INSTALL_DIR"
    git clone "$REPO_SSH" "$INSTALL_DIR"
fi

DEPLOY_DIR="$INSTALL_DIR/deploy"
cd "$DEPLOY_DIR"

if [[ ! -f .env ]]; then
    cp .env.example .env
    echo ""
    echo "→ $DEPLOY_DIR/.env oluşturuldu. Düzenle: APP_KEY, DB_PASSWORD, GHCR_TOKEN"
fi

chmod +x scripts/*.sh

echo ""
echo "Kurulum hazır. Sıradaki adımlar:"
echo "  1. nano $DEPLOY_DIR/.env"
echo "  2. $DEPLOY_DIR/scripts/bootstrap.sh latest"
echo "  3. curl -I http://127.0.0.1:8082/up"
