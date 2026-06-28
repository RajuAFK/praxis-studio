<?php
/**
 * Bridges the public /private/* PHP to the admin config so APP_SECRET and
 * private_data_root live in one place (admin/config.php on Hostinger).
 *
 * Returns the subset of admin config that the public side needs.
 * Includes a thin fallback path so the public side can run even if the
 * admin tree is moved or its config is missing — in that case it reports
 * a misconfiguration and the unlock/get endpoints 500.
 */
declare(strict_types=1);

$adminConfig = null;
$candidates = [
    __DIR__ . '/../admin/config.php',                     // same webroot, sibling /admin/
    realpath(__DIR__ . '/../../admin/config.php') ?: '',  // legacy / dev nesting
];
foreach ($candidates as $p) {
    if ($p && is_file($p)) {
        $loaded = require $p;
        if (is_array($loaded)) { $adminConfig = $loaded; break; }
    }
}

if ($adminConfig === null) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'private-pages config not found']);
    exit;
}

$secret = (string)($adminConfig['app_secret'] ?? '');
if ($secret === '' || strlen($secret) < 32) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'APP_SECRET missing or too short']);
    exit;
}

$dataRoot = (string)($adminConfig['private_data_root'] ?? '');
if ($dataRoot === '') {
    // Fallback: assume sibling /public_html/private-data/
    $dataRoot = realpath(__DIR__ . '/../private-data') ?: '';
}
if ($dataRoot === '' || !is_dir($dataRoot)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'private-data directory missing']);
    exit;
}

return [
    'app_secret'        => $secret,
    'private_data_root' => $dataRoot,
];
