<?php
/**
 * POST /admin/api/save-private-page.php
 *
 * Body JSON:
 *   { id:int|0, slug, title, intro, password (blank to keep), status, items:[{item_id,position}], csrf }
 *
 * Returns: { ok:true, id, slug }
 *
 * Saves to private-data/pages.json (admin/lib/private-store.php).
 * NO GitHub commit needed — private pages are pure runtime PHP data,
 * not built into the static export.
 */
declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';
require __DIR__ . '/../lib/private-store.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') json_err('POST only', 405);

$body = get_json_body();
$_POST['csrf'] = (string)($body['csrf'] ?? '');
csrf_check();

$id       = (int)($body['id'] ?? 0);
$slug     = trim((string)($body['slug']     ?? ''));
$title    = trim((string)($body['title']    ?? ''));
$intro    = trim((string)($body['intro']    ?? ''));
$password = (string)($body['password'] ?? '');
$status   = (string)($body['status']   ?? 'active');
$itemsIn  = $body['items'] ?? [];
if (!is_array($itemsIn)) $itemsIn = [];

$errors = [];
if ($title === '' || mb_strlen($title) > 200)            $errors['title'] = 'Title required (≤200 chars)';
if (!preg_match('/^[a-z0-9-]{1,120}$/', $slug))           $errors['slug']  = 'Slug must be lowercase letters/digits/hyphens (≤120)';
if (mb_strlen($intro) > 10000)                            $errors['intro'] = 'Intro too long (≤10000 chars)';
if (!in_array($status, ['active', 'archived'], true))     $status = 'active';
if ($id <= 0 && $password === '')                         $errors['password'] = 'Password required on create';
if ($password !== '' && mb_strlen($password) < 6)         $errors['password'] = 'Password must be at least 6 characters';
if ($password !== '' && mb_strlen($password) > 200)       $errors['password'] = 'Password too long (≤200 chars)';

$items = [];
$seen  = [];
foreach ($itemsIn as $i => $row) {
    if (!is_array($row)) continue;
    $iid = (int)($row['item_id'] ?? 0);
    $pos = (int)($row['position'] ?? $i);
    if ($iid <= 0 || isset($seen[$iid])) continue;
    if ($pos < 0 || $pos > 10000) $pos = $i;
    $seen[$iid] = true;
    $items[] = ['item_id' => $iid, 'position' => $pos];
    if (count($items) >= 100) break;
}

if ($errors) json_err('validation failed', 422, ['fields' => $errors]);

// Verify referenced library items exist
if ($items) {
    $libIds = array_column(pp_library_all($config), 'id');
    $libSet = array_flip(array_map('intval', $libIds));
    $missing = [];
    foreach ($items as $row) {
        if (!isset($libSet[$row['item_id']])) $missing[] = $row['item_id'];
    }
    if ($missing) {
        json_err('one or more library items not found', 422, ['missing_item_ids' => array_values($missing)]);
    }
}

try {
    $saved = pp_pages_upsert(
        $config,
        $id > 0 ? $id : null,
        $slug,
        $title,
        $intro,
        $password !== '' ? $password : null,
        $status,
        $items
    );
    json_ok(['ok' => true, 'id' => (int)$saved['id'], 'slug' => $saved['slug']]);
} catch (Throwable $e) {
    if ($e->getMessage() === 'slug already in use') {
        json_err('slug already in use', 422, ['fields' => ['slug' => 'Already taken']]);
    }
    if ($e->getMessage() === 'password required on create') {
        json_err('password required on create', 422, ['fields' => ['password' => 'Required']]);
    }
    error_log('[save-private-page] ' . $e->getMessage());
    json_err('internal error', 500);
}
