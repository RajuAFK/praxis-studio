# Praxivision admin portal

Lives at `https://praxivision.com/admin/`. Uploaded to `public_html/admin/` on Hostinger via SFTP. **Not** part of the Next.js build — do not commit the live `config.php` (it contains the GitHub PAT, admin password hashes, R2 keys, and the private-pages `APP_SECRET`).

## What it does

1. **Case studies** — full CMS with drafts, layout editor, image uploads to R2. Save commits to `data/case-studies.json` in the repo, GitHub Action rebuilds + Hostinger pulls. Live in ~2 minutes.
2. **Private pages** — password-gated client share pages (`praxivision.com/private/{slug}/`). Backed by JSON on Hostinger filesystem at `public_html/private-data/`. No rebuild needed — pure runtime PHP.
3. **Library** — a media pool (images, 360° tours, 3D models) that can be attached to private pages. Files upload directly to R2 under unguessable random prefixes.

## First-time Hostinger setup

One-time, on Hostinger File Manager / SFTP / SSH:

```bash
# 1. Upload admin/ via SFTP to public_html/admin/
#    (everything EXCEPT config.example.php — that's a template only)

# 2. Create config.php directly on the server (don't commit it):
cp public_html/admin/config.example.php public_html/admin/config.php
nano public_html/admin/config.php          # fill in values, see below
chmod 600 public_html/admin/config.php

# 3. Lockout dir for failed-login throttling
mkdir -m 700 public_html/admin/.lockout

# 4. Case-studies media is on R2 now, so no on-server directory needed
#    (skip the old case-studies-media/ step)

# 5. Private-pages JSON storage. Must be writable by the web user.
mkdir -m 700 public_html/private-data
mkdir -m 700 public_html/private-data/attempts
echo '{"version":1,"next_id":1,"pages":[]}' > public_html/private-data/pages.json
echo '{"version":1,"next_id":1,"items":[]}' > public_html/private-data/library.json
chmod 600 public_html/private-data/pages.json public_html/private-data/library.json

# 6. Deny direct web access to private-data
cat > public_html/private-data/.htaccess <<'EOF'
Require all denied
EOF
```

Then browse to `https://praxivision.com/admin/` and log in.

## What goes in `config.php`

See `config.example.php` for the full template. Key fields:

- **`admin_users`** — email-keyed bcrypt hashes (`$2y$12$...`). Generate locally so the plaintext password never leaves your machine.
- **`github_pat`** — fine-grained PAT scoped to the praxis-studio repo only. Permissions: Contents (R+W), Actions (R+W), Metadata (R). 90-day expiry, rotate periodically.
- **`r2_access_key` / `r2_secret_key`** — Cloudflare R2 token, **bucket-scoped** to `praxivision`, Read+Write. Created via Cloudflare dashboard → R2 → Manage R2 API Tokens.
- **`app_secret`** — 64-hex random string. HMAC-signs private-page unlock cookies + salts IP hashes. Rotating it logs out every active client session.
- **`private_data_root`** — absolute server path to the private-pages JSON dir. Default of `__DIR__ . '/../private-data'` works if you created it at `public_html/private-data/` as above.

## Generating the password hashes

Locally (never on the server — plaintext shouldn't enter shell history):

```bash
node -e "console.log(require('bcryptjs').hashSync('the-password-here', 12))"
```

or:

```bash
php -r "echo password_hash('the-password-here', PASSWORD_BCRYPT, ['cost' => 12]).PHP_EOL;"
```

Paste the resulting `$2y$12$...` (or `$2b$12$...`) hash into `config.php`.

## Generating the APP_SECRET

Once, locally:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the 64-character hex into `config.php`'s `app_secret`.

## Rotating tokens

| Secret | Rotation cadence | Mechanism |
|---|---|---|
| GitHub PAT | 90 days (its own expiry) | https://github.com/settings/personal-access-tokens → revoke + regenerate, paste into `config.php`. |
| R2 R+W token | 90 days suggested | Cloudflare R2 dashboard → Manage tokens. Issue a new one, swap into `config.php`, revoke the old one. |
| R2 read-only token (CI) | Same | Cloudflare R2 dashboard. Update `R2_LIST_KEY`/`R2_LIST_SECRET` in the GitHub repo Actions Secrets. |
| `app_secret` | Only when compromised | Updates `config.php`. Every active private-page unlock cookie becomes invalid immediately. |
| Admin passwords | When a user leaves or password is known to a non-owner | Regenerate the bcrypt locally, update `config.php`. |

## Private pages — operational notes

- Each private page record carries a `password_version`. Editing the password (admin form) bumps it, invalidating every existing cookie for that page.
- Failed-attempt counters are per (slug, IP-hash). Locks at 8 failures in 10 min for 15 min. Files stored at `public_html/private-data/attempts/{slug}-{ip-hash-prefix}.json`. ~1% of unlock requests opportunistically prune attempt files older than 7 days.
- **The R2 files attached to a library item are public-CDN URLs**. The password protects the *listing* (which items belong to which page), not the underlying media. Anyone with a direct file URL can view that file. Don't share file URLs separately from the gated page.
- Library files upload under `private-lib/{12-hex}/` — random prefix per upload, unguessable by enumeration.

## CI secrets (GitHub Actions Secrets)

The `cms-rebuild.yml` workflow refreshes the portfolio manifest from R2 on every build. The repo Actions Secrets must contain:

- `R2_ACCOUNT_ID` — same as in `config.php`
- `R2_BUCKET` — `praxivision`
- `R2_LIST_KEY` / `R2_LIST_SECRET` — separate **Read-only** R2 token (different from the admin's R+W token, for blast-radius reasons)

If those secrets aren't set, the workflow falls back to the committed `data/portfolio-manifest.json` (won't auto-pick up new R2 uploads).

## Local development

You don't usually need this admin locally — case studies can be edited by hand in `data/case-studies.json` and committed normally. The admin is purely for runtime editing on the live site.

For local PHP testing, `php -S localhost:8080 -t admin` works, but you'd need to point `config.php`'s `private_data_root` at a local directory you can write to.
