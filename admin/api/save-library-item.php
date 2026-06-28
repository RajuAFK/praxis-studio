<?php
/**
 * POST /admin/api/save-library-item.php
 * Body JSON: { kind, title, iframe_url?, image_url?, thumbnail_url?, notes?, csrf }
 * Returns: { ok:true, id }
 */
declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';
require __DIR__ . '/../lib/private-store.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') json_err('POST only', 405);

$body = get_json_body();
$_POST['csrf'] = (string)($body['csrf'] ?? '');
csrf_check();

$kind         = (string)($body['kind']  ?? '');
$title        = trim((string)($body['title'] ?? ''));
$iframeUrl    = trim((string)($body['iframe_url']    ?? ''));
$imageUrl     = trim((string)($body['image_url']     ?? ''));
$thumbnailUrl = trim((string)($body['thumbnail_url'] ?? ''));
$notes        = trim((string)($body['notes'] ?? ''));

$errors = [];
if (!in_array($kind, ['image', 'tour', 'model'], true)) $errors['kind'] = 'Invalid kind';
if ($title === '' || mb_strlen($title) > 200)           $errors['title'] = 'Title required (≤200 chars)';
if ($kind === 'image' && $imageUrl === '')              $errors['image_url']  = 'Image URL required';
if (($kind === 'tour' || $kind === 'model') && $iframeUrl === '') $errors['iframe_url'] = 'Iframe URL required';
foreach (['iframe_url' => $iframeUrl, 'image_url' => $imageUrl, 'thumbnail_url' => $thumbnailUrl] as $f => $v) {
    if ($v !== '' && !preg_match('#^https?://#i', $v)) $errors[$f] = 'Must be https:// URL';
    if (mb_strlen($v) > 500) $errors[$f] = 'URL too long (≤500)';
}
if (mb_strlen($notes) > 2000) $errors['notes'] = 'Notes too long (≤2000)';

if ($errors) json_err('validation failed', 422, ['fields' => $errors]);

try {
    $saved = pp_library_insert($config, $kind, $title, $iframeUrl, $imageUrl, $thumbnailUrl, $notes);
    json_ok(['ok' => true, 'id' => (int)$saved['id']]);
} catch (Throwable $e) {
    error_log('[save-library-item] ' . $e->getMessage());
    json_err('internal error', 500);
}
