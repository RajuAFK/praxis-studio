<?php
// Copy this file to config.php on the Hostinger server and fill in the real
// values. NEVER commit the real config.php — it contains secrets.
//
// chmod 600 config.php after creating it so only the web user can read it.

return [
    // Multi-user auth — keyed by email (lowercase). Add or remove entries to
    // grant/revoke access. Generate each bcrypt hash on a trusted local
    // machine with cost 12, never on the server.
    'admin_users' => [
        'praxisstudio@gmail.com' => 'CHANGE_ME_BCRYPT_HASH_$2y$12$...',
        'rishiraju314@gmail.com' => 'CHANGE_ME_BCRYPT_HASH_$2y$12$...',
    ],

    'github_repo'      => 'RajuAFK/praxis-studio',
    'github_branch'    => 'main',
    'github_pat'       => 'CHANGE_ME_FINE_GRAINED_PAT',
    'github_workflow'  => 'cms-rebuild.yml',

    'media_root'       => __DIR__ . '/../case-studies-media',
    'media_url_prefix' => '/case-studies-media',

    'session_lifetime' => 60 * 60 * 8,
];
