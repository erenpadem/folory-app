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

```bash
git clone https://github.com/erenpadem/folory-app.git /opt/folory
cd /opt/folory/deploy
cp .env.example .env
# APP_KEY üret: docker run --rm php:8.3-cli php -r "echo 'base64:'.base64_encode(random_bytes(32));"
# DB_PASSWORD ve GHCR_TOKEN doldur
chmod +x scripts/*.sh
./scripts/bootstrap.sh latest
# Test: curl -I http://127.0.0.1:8082/up
```

`.env` içinde `HTTP_BIND=127.0.0.1` ve `HTTP_PORT=8082` olduğundan emin olun.

## GitHub ayarları

**Secrets** (Settings → Secrets and variables → Actions):

| Secret | Değer |
|--------|-------|
| `DEPLOY_HOST` | `178.104.191.166` |
| `DEPLOY_USER` | SSH kullanıcı adınız |
| `DEPLOY_SSH_KEY` | Private key |
| `DEPLOY_PATH` | `/opt/folory/deploy` |

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

İlk push sonrası GitHub → Packages → package visibility **public** veya token ile private pull.

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
