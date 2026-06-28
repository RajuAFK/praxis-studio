# Praxivision admin portal

This directory is uploaded to `public_html/admin/` on Hostinger via SFTP. It is **not** part of the Next.js build — do not commit the live `config.php` (it contains the GitHub PAT and the admin password hash).

## What it does

Dad logs in, fills a form, hits publish, and ~2 minutes later a new case study is live on praxivision.com. Mechanics:

1. PHP validates form + uploaded images.
2. Images are resized (GD, max 2000px wide, JPEG q85) and saved to `public_html/case-studies-media/[slug]/`.
3. The case-studies JSON is read from GitHub via the Contents API, the new entry is inserted, and the updated JSON is committed back to `main`.
4. A `workflow_dispatch` call kicks the `cms-rebuild` GitHub Action, which builds the site and force-pushes `out/` to the `deploy` branch.
5. Hostinger's webhook pulls `deploy` into `public_html/`.

Images survive deploys because Hostinger's git pull only touches files tracked in the deploy branch — `case-studies-media/` is invisible to it.

## First-time setup on Hostinger

1. SFTP the contents of this directory (everything except `config.example.php`) into `public_html/admin/`.
2. Copy `config.example.php` to `config.php` on the server. Edit it with the real values (see "What goes in config.php" below). `chmod 600 config.php` so only the web user can read it.
3. Create the empty media root: `mkdir -m 755 public_html/case-studies-media`.
4. Create the lockout dir: `mkdir -m 700 public_html/admin/.lockout`.
5. Browse to `https://praxivision.com/admin/`, log in.

## What goes in config.php

```php
return [
  // Multi-user auth — keyed by email (lowercase)
  'admin_users' => [
    'praxisstudio@gmail.com' => '$2y$12$abc...',     // dad's bcrypt hash
    'rishiraju314@gmail.com' => '$2y$12$xyz...',     // your bcrypt hash
  ],

  // GitHub
  'github_repo'      => 'RajuAFK/praxis-studio',      // owner/repo
  'github_branch'    => 'main',                       // commit target for case-studies.json
  'github_pat'       => 'github_pat_11AAA...',        // fine-grained PAT, Contents+Actions scoped to this repo
  'github_workflow'  => 'cms-rebuild.yml',            // filename in .github/workflows/

  // Filesystem
  'media_root'       => '/home/u123456789/domains/praxivision.com/public_html/case-studies-media',
  'media_url_prefix' => '/case-studies-media',        // public URL prefix

  // Optional
  'session_lifetime' => 60 * 60 * 8,                  // 8h
];
```

Add or remove entries from `admin_users` to grant or revoke access. Each value is a bcrypt hash — never store plaintext. Emails are matched case-insensitively (the form input is lowercased before lookup).

## Generating the password hash

On the user's local machine (never on the server, the password should never touch a remote shell history):

```bash
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 12))" "the-password-here"
```

Or in PHP CLI:
```bash
php -r "echo password_hash('the-password-here', PASSWORD_BCRYPT, ['cost' => 12]).PHP_EOL;"
```

Paste the resulting `$2y$12$...` string into `config.php`.

## Rotating the GitHub PAT

GitHub fine-grained PATs are scoped per repo. Rotate every 90 days:

1. https://github.com/settings/personal-access-tokens
2. Revoke the existing token.
3. Generate a new fine-grained token with the same scope: only the `praxis-studio` repo, permissions Contents (Read+Write), Actions (Read+Write), Metadata (Read).
4. Update `github_pat` in `config.php` on Hostinger. No service restart needed.

## Local development

You don't need this admin locally — case studies can be edited by hand in `data/case-studies.json` and committed normally. The admin is purely for the father's workflow on the live site.
