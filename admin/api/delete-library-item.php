<?php
/**
 * POST /admin/api/delete-library-item.php
 * Body JSON: { id, csrf }
 *
 * Refuses if the item is still attached to one or more pages (returns the list).
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
    $result = pp_library_delete($config, $id);
    if (!$result['ok']) {
        json_err('in_use', 409, ['pages' => $result['pages'] ?? []]);
    }
    json_ok(['ok' => true]);
} catch (Throwable $e) {
    error_log('[delete-library-item] ' . $e->getMessage());
    json_err('internal error', 500);
}
