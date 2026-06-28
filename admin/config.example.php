<?php
// Copy this file to config.php on the Hostinger server and fill in the real
// values. NEVER commit the real config.php — it contains secrets.
//
// chmod 600 config.php after creating it so only the web user can read it.

return [
    /* ─────────────────────────  Auth  ───────────────────────── */

    // Multi-user auth — keyed by email (lowercase). Add or remove entries to
    // grant/revoke access. Generate each bcrypt hash on a trusted local
    // machine with cost 12, never on the server.
    'admin_users' => [
        'praxisstudio@gmail.com' => 'CHANGE_ME_BCRYPT_HASH_$2y$12$...',
        'rishiraju314@gmail.com' => 'CHANGE_ME_BCRYPT_HASH_$2y$12$...',
    ],
    'session_lifetime' => 60 * 60 * 8,   // 8h

    /* ─────────────────────────  GitHub  ───────────────────────── */

    'github_repo'      => 'RajuAFK/praxis-studio',
    'github_branch'    => 'main',
    'github_pat'       => 'CHANGE_ME_FINE_GRAINED_PAT',
    'github_workflow'  => 'cms-rebuild.yml',

    /* ───────────────────────  Cloudflare R2  ─────────────────── */
    // Read+Write token, bucket-scoped to praxivision.
    // Used by the admin's R2 presigner (admin/lib/r2.php) for browser uploads.
    'r2_account_id'  => 'CHANGE_ME_32_HEX',
    'r2_bucket'      => 'praxivision',
    'r2_access_key'  => 'CHANGE_ME_R2_ACCESS_KEY',
    'r2_secret_key'  => 'CHANGE_ME_R2_SECRET_KEY',
    'r2_public_base' => 'https://pub-b6df9c86ce26430caf9d07b91b02796f.r2.dev',
    'r2_presign_ttl' => 900,   // seconds — admin browser-uploads time out after this

    /* ────────────────────  Private pages + library  ──────────── */

    // 64-hex random secret. Used to HMAC-sign client unlock cookies and
    // salt IP hashes in the rate-limit table. Generate once with:
    //   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    //   (or: php -r "echo bin2hex(random_bytes(32));")
    // Rotating this invalidates every existing unlock session — clients
    // would need their codes again. Don't rotate casually.
    'app_secret' => 'CHANGE_ME_64_HEX',

    // Absolute path on Hostinger to the JSON storage directory. Must be
    // writable by the web user; chmod 700. Sample paths:
    //   /home/uXXXXXXXXX/domains/praxivision.com/public_html/private-data
    //   /home/uXXXXXXXXX/public_html/private-data
    // The /private/ public PHP and the admin both read/write this.
    'private_data_root' => __DIR__ . '/../private-data',
];
