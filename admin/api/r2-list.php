<?php
/**
 * GET /admin/api/r2-list.php?prefix=<prefix>&max=<n>&delimiter=<d>
 *
 * Returns objects + common prefixes under {prefix} in the praxivision R2 bucket.
 * Used by the case-study editor's archive picker and the upload form's
 * "pick from archive" modal.
 *
 * Response:
 *   { objects: [ { key, size, last_modified, url } ],
 *     prefixes: [ "portfolio/Photography/Foo/", ... ] }
 */
declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';
require __DIR__ . '/../lib/r2.php';

define('R2_ACCOUNT_ID',  (string)($config['r2_account_id']  ?? ''));
define('R2_ACCESS_KEY',  (string)($config['r2_access_key']  ?? ''));
define('R2_SECRET_KEY',  (string)($config['r2_secret_key']  ?? ''));
define('R2_BUCKET',      (string)($config['r2_bucket']      ?? ''));
define('R2_PUBLIC_BASE', (string)($config['r2_public_base'] ?? ''));

try {
    $prefix    = (string)($_GET['prefix']    ?? '');
    $max       = (int)   ($_GET['max']       ?? 200);
    $delimiter = (string)($_GET['delimiter'] ?? '');

    if (strlen($prefix) > 240) json_err('prefix too long', 400);
    if (
        strpos($prefix, '..')   !== false ||
        strpos($prefix, '\\')   !== false ||
        preg_match('/[\x00-\x1F\x7F]/', $prefix)
    ) {
        json_err('invalid prefix', 400);
    }
    if ($max < 1) $max = 1;
    if ($max > 1000) $max = 1000;

    $result = r2_list_objects($prefix, $max, $delimiter);

    // Decorate objects with public URLs (saves a round trip on the client).
    foreach ($result['objects'] as &$o) {
        $o['url'] = r2_public_url($o['key']);
    }
    unset($o);

    json_ok($result);

} catch (Throwable $e) {
    error_log('[r2-list] ' . $e->getMessage());
    json_err('internal error', 500);
}
