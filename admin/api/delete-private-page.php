<?php
/**
 * POST /admin/api/delete-private-page.php
 * Body JSON: { id, csrf }
 * Returns: { ok:true } or { error, ... }
 */
declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';
require __DIR__ . '/../lib/private-store.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') json_err('POST only', 405);

$body = get_json_body();
$_POST['csrf'] = (string)($body['csrf'] ?? '');
csrf_check();

$id = (int)($body['id'] ?? 0);
if ($id <= 0) json_err('id required', 400);

try {
    $ok = pp_pages_delete($config, $id);
    if (!$ok) json_err('not found', 404);
    json_ok(['ok' => true]);
} catch (Throwable $e) {
    error_log('[delete-private-page] ' . $e->getMessage());
    json_err('internal error', 500);
}
