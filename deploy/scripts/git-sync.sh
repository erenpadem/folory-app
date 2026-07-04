#!/usr/bin/env bash
# Repo güncelle — SSH remote (HTTPS/token kullanmaz).
set -euo pipefail

DEPLOY_DIR="${1:-/opt/folory/deploy}"
REPO_SSH="${GIT_REPO_SSH:-git@github.com:erenpadem/folory-app.git}"
REPO_DIR="$(cd "$DEPLOY_DIR/.." && pwd)"

if [[ ! -d "$REPO_DIR/.git" ]]; then
    echo "Git repo yok: $REPO_DIR" >&2
    echo "Önce: git clone $REPO_SSH $REPO_DIR" >&2
    exit 1
fi

cd "$REPO_DIR"

current="$(git remote get-url origin 2>/dev/null || true)"
if [[ "$current" != "$REPO_SSH" ]]; then
    echo "origin → $REPO_SSH (eski: ${current:-yok})"
    git remote set-url origin "$REPO_SSH"
fi

export GIT_SSH_COMMAND="${GIT_SSH_COMMAND:-ssh -o StrictHostKeyChecking=accept-new}"
git fetch origin

BRANCH="main"
if ! git show-ref --verify --quiet refs/remotes/origin/main; then
    if git show-ref --verify --quiet refs/remotes/origin/master; then
        BRANCH="master"
    else
        echo "origin/main veya origin/master bulunamadı" >&2
        exit 1
    fi
fi

# Deploy sunucusu: tracked dosyalarda yerel değişiklik olmamalı (.env hariç, gitignore'da)
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Yerel değişiklikler atılıyor (deploy sunucusu → origin/${BRANCH})"
    git reset --hard "HEAD"
fi

git reset --hard "origin/${BRANCH}"

echo "Repo güncel: $(git rev-parse --short HEAD)"

# git pull active.conf'u repo şablonuna (blue) döndürebilir — çalışan slot'u geri yükle
if [[ -f "$DEPLOY_DIR/.active-slot" ]]; then
    SLOT="$(tr -d '[:space:]' < "$DEPLOY_DIR/.active-slot")"
    if [[ "$SLOT" == "blue" || "$SLOT" == "green" ]] && [[ -f "$DEPLOY_DIR/nginx/upstreams/${SLOT}.conf" ]]; then
        cp "$DEPLOY_DIR/nginx/upstreams/${SLOT}.conf" "$DEPLOY_DIR/nginx/upstreams/active.conf"
        echo "active.conf → ${SLOT} slot (git pull sonrası senkron)"
        if docker ps --format '{{.Names}}' 2>/dev/null | grep -qx folory-edge; then
            docker compose -f "$DEPLOY_DIR/docker-compose.yml" exec edge nginx -s reload 2>/dev/null || true
        fi
    fi
fi
