<?php
/**
 * GET /admin/api/r2-upload-url.php?prefix=<prefix>&filename=<relpath>
 *
 * Returns a 15-min presigned PUT URL for {prefix}/{filename} on R2.
 *
 * Allowed prefix patterns:
 *   - case-studies/<slug>/                    -> case study media
 *   - portfolio/Photography/<title>/          -> archive photography
 *   - portfolio/3D Models/<title>/            -> archive 3D model
 *   - portfolio/Praxis VRs/<title>/           -> archive VR tour
 *   - portfolio/Gigapans/<title>/             -> archive gigapan
 *   - private-lib/<random-12-hex>/            -> private library uploads
 *
 * Filename is a relative path under the prefix; we sanitize traversal +
 * control chars but otherwise allow standard chars (R2 accepts almost anything).
 */
declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';
require __DIR__ . '/../lib/r2.php';

// Define the R2 constants the lib expects.
define('R2_ACCOUNT_ID',  (string)($config['r2_account_id']  ?? ''));
define('R2_ACCESS_KEY',  (string)($config['r2_access_key']  ?? ''));
define('R2_SECRET_KEY',  (string)($config['r2_secret_key']  ?? ''));
define('R2_BUCKET',      (string)($config['r2_bucket']      ?? ''));
define('R2_PUBLIC_BASE', (string)($config['r2_public_base'] ?? ''));
define('R2_PRESIGN_TTL', (int)($config['r2_presign_ttl']    ?? 900));

try {
    $prefix   = trim((string)($_GET['prefix']   ?? ''));
    $filename = trim((string)($_GET['filename'] ?? ''));

    if ($prefix === '' || strlen($prefix) > 240) {
        json_err('invalid prefix', 400);
    }
    // Allowed top-level prefix roots
    $allowedRoots = ['case-studies/', 'portfolio/', 'private-lib/'];
    $rootOk = false;
    foreach ($allowedRoots as $r) {
        if (str_starts_with($prefix, $r)) { $rootOk = true; break; }
    }
    if (!$rootOk) {
        json_err('prefix not allowed', 400);
    }
    if (
        strpos($prefix, '..')   !== false ||
        strpos($prefix, '\\')   !== false ||
        preg_match('/[\x00-\x1F\x7F]/', $prefix)
    ) {
        json_err('invalid prefix', 400);
    }
    // Filename validation: relative, no traversal, length cap
    if ($filename === '' || strlen($filename) > 500) {
        json_err('invalid filename', 400);
    }
    if ($filename[0] === '/' || $filename[0] === '\\') {
        json_err('filename must be relative', 400);
    }
    if (
        strpos($filename, '..')   !== false ||
        strpos($filename, '\\')   !== false ||
        strpos($filename, '//')   !== false ||
        preg_match('/[\x00-\x1F\x7F]/', $filename)
    ) {
        json_err('invalid filename', 400);
    }

    $key = rtrim($prefix, '/') . '/' . ltrim($filename, '/');
    $result = r2_presign_put($key, R2_PRESIGN_TTL);

    json_ok($result);

} catch (Throwable $e) {
    error_log('[r2-upload-url] ' . $e->getMessage());
    json_err('internal error', 500);
}
