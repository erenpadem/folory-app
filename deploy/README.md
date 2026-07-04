# Fo-lory Production Deploy (Blue-Green)

**Domain:** [fo-lory.com](https://fo-lory.com) · **Sunucu:** `178.104.191.166` · **Repo:** [erenpadem/folory-app](https://github.com/erenpadem/folory-app)

Modern mimari: **build GitHub Actions (GHCR)** → **sunucu sadece pull & run**.

## Marka vs domain

| Ne | Değer | Nerede |
|----|-------|--------|
| **Marka / uygulama adı** | `Fo-lory` | UI, navbar, e-posta imzası, `APP_NAME` |
| **Domain / URL** | `fo-lory.com` | `.env`, OAuth callback, CORS, SEO, mail adresleri |
| **E-posta** | `@fo-lory.com` | `destek@`, `noreply@` |

UI'da **Fo-lory** markası görünür; arka planda domain `fo-lory.com` olur.

## Portlar (sunucu çakışması yok)

Fo-lory stack'i **host'a sadece `127.0.0.1:8082`** bind eder. Postgres, Redis, API ve frontend container'ları dışarıya port açmaz. API için **4000 veya 4010 kullanılmaz** — backend edge nginx arkasında iç ağda `:80` üzerinden çalışır.

| Fo-lory | Host | Not |
|---------|------|-----|
| edge nginx | `127.0.0.1:8082` | Tek public bind (localhost) |
| postgres | — | Sadece `folory` Docker ağı |
| redis | — | Sadece `folory` Docker ağı |
| api / frontend | — | Sadece `folory` Docker ağı |

**Sunucuda başka projeler tarafından kullanılan portlar** (Fo-lory bunları kullanmaz):

`3000` `3001` `3010` `4000` `4010` `5432` `6379` `7880-7882` `9010-9011` `1025` `8025` `50000-50500`

### fo-lory.com → Fo-lory yönlendirme

Host'ta 80/443'te çalışan nginx/Caddy varsa `fo-lory.com` için upstream:

```nginx
# /etc/nginx/sites-available/fo-lory.com
server {
    listen 80;
    server_name fo-lory.com www.fo-lory.com;

    location / {
        proxy_pass http://127.0.0.1:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

SSL için certbot veya Cloudflare kullanın. `.env` içinde `HTTP_PORT=8082` ve `HTTP_BIND=127.0.0.1` bırakın.

## DNS

Domain sağlayıcınızda A kaydı:

```
fo-lory.com      →  178.104.191.166
www.fo-lory.com  →  178.104.191.166   (opsiyonel CNAME veya A)
```

## Sunucu kurulumu (ilk kez)

GitHub artık HTTPS + şifre/PAT ile `git clone` kabul etmiyor. Sunucuda **SSH anahtarı** kullanın.

### 1. GitHub SSH anahtarı (sunucuda bir kez)

```bash
# root veya deploy kullanıcısı ile
ssh-keygen -t ed25519 -C "folory-server" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```

Çıkan public key'i GitHub → **Settings → SSH and GPG keys → New SSH key** ile ekleyin.

```bash
ssh -T git@github.com
# "Hi erenpadem! You've successfully authenticated..." görmelisiniz
```

### 2. Repoyu SSH ile clone

```bash
git clone git@github.com:erenpadem/folory-app.git /opt/folory
cd /opt/folory/deploy
chmod +x scripts/*.sh
./scripts/setup-repo.sh /opt/folory
```

`setup-repo.sh` `.env` oluşturur. Düzenleyin:

```bash
nano /opt/folory/deploy/.env
# APP_KEY, DB_PASSWORD, GHCR_TOKEN
./scripts/bootstrap.sh latest
curl -I http://127.0.0.1:8082/up
```

### HTTPS remote hatası (daha önce clone ettiyseniz)

```bash
cd /opt/folory
git remote set-url origin git@github.com:erenpadem/folory-app.git
./deploy/scripts/git-sync.sh /opt/folory/deploy
```

`.env` içinde `HTTP_BIND=127.0.0.1` ve `HTTP_PORT=8082` olduğundan emin olun.

## GitHub ayarları

**Secrets** (Settings → Secrets and variables → Actions):

Otomatik deploy istiyorsan doldur. **Boş bırakırsan** Build and Push yine çalışır; Deploy workflow uyarı verip atlanır (kırmızı hata vermez).

| Secret | Değer |
|--------|-------|
| `DEPLOY_HOST` | `178.104.191.166` |
| `DEPLOY_USER` | SSH kullanıcı adınız |
| `DEPLOY_SSH_KEY` | **Private key** (aşağıya bak) |
| `DEPLOY_PATH` | `/opt/folory/deploy` |

### DEPLOY_SSH_KEY nasıl alınır?

Sunucuya bağlandığın **private key** gerekir (public key değil).

**Windows (PowerShell):**
```powershell
Get-Content $env:USERPROFILE\.ssh\id_ed25519
```

**Linux/Mac:**
```bash
cat ~/.ssh/id_ed25519
```

Çıktı şöyle başlamalı:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

GitHub secret'a **tamamını** yapıştır (başlık + satırlar + son satır).  
`ssh-ed25519 AAAA...` ile başlayan satır **public key** — yanlış.

Sunucuda bu private key'in **public** kısmı `~/.ssh/authorized_keys` içinde olmalı.

Sunucuda repo **SSH remote** ile kurulu olmalı (`git@github.com:erenpadem/folory-app.git`). CI deploy `git-sync.sh` ile günceller — HTTPS/token gerekmez.

**Variables** (Settings → Variables → Actions):

| Variable | Değer |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://fo-lory.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://fo-lory.com` |

**GHCR** (org gerekmez — kişisel repo yeterli):

- İmaj yolu: `ghcr.io/erenpadem/folory-app/backend:<tag>`
- İmaj yolu: `ghcr.io/erenpadem/folory-app/frontend:<tag>`
- Sunucu `.env`: `IMAGE_NAME=erenpadem/folory-app`, `GHCR_USERNAME=erenpadem`
- Sunucu pull için `GHCR_TOKEN` (PAT, `read:packages`)

İlk push sonrası GitHub → **Packages** → `folory-app/backend` ve `folory-app/frontend` görünür.

Sunucuda pull (tam yol):

```bash
docker pull ghcr.io/erenpadem/folory-app/backend:latest
docker pull ghcr.io/erenpadem/folory-app/frontend:latest
```

Package private ise: GitHub → Package → **Package settings** → **Change visibility** → **Public**  
veya sunucu `.env` içinde `GHCR_TOKEN` (PAT, `read:packages`).

**GitHub repo ayarı:** Settings → Actions → General → Workflow permissions → **Read and write permissions** açık olmalı (GHCR push için).

## CI/CD

| Workflow | Görev |
|----------|-------|
| `ci.yml` | Test + lint |
| `build-and-push.yml` | GHCR'a imaj push |
| `deploy.yml` | SSH → `./scripts/deploy.sh` |

## SSL

DNS aktif olduktan sonra host nginx/Caddy üzerinde Let's Encrypt (certbot) veya Cloudflare proxy ekleyin — Fo-lory container'ı `127.0.0.1:8082`'de kalır, SSL host katmanında sonlanır.

## Önemli

- `NEXT_PUBLIC_*` build-time'da bake edilir — domain değişince yeni frontend build gerekir.
- OAuth (Google/Apple) callback: `https://fo-lory.com/api/auth/google/callback`
- Tek domain: API `https://fo-lory.com/api/...` üzerinden edge nginx ile backend'e gider.
