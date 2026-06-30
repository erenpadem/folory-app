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
if git show-ref --verify --quiet refs/remotes/origin/main; then
    git pull --ff-only origin main
elif git show-ref --verify --quiet refs/remotes/origin/master; then
    git pull --ff-only origin master
else
    echo "origin/main veya origin/master bulunamadı" >&2
    exit 1
fi

echo "Repo güncel: $(git rev-parse --short HEAD)"
