<?php
/**
 * GET /private/api/get.php?slug=<slug>
 *
 * Returns page content if the request carries a valid cookie. Otherwise 401
 * (same response whether the slug exists or not — existence never leaks).
 *
 *   200 { data: { title, intro, items: [{id, kind, title, iframe_url, image_url, thumbnail_url}, ...] } }
 *   401 { error: "locked" }
 */
declare(strict_types=1);

require __DIR__ . '/../lib/_pp.php';
$config = require __DIR__ . '/../config-bridge.php';
$SECRET    = $config['app_secret'];
$DATA_ROOT = $config['private_data_root'];

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');

if (($_SERVER['REQUEST_METHOD'] ?? 'POST') !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'GET only']);
    exit;
}

try {
    $slug = trim((string)($_GET['slug'] ?? ''));
    if (!preg_match('/^[a-z0-9-]{1,120}$/', $slug)) {
        http_response_code(401);
        echo json_encode(['error' => 'locked']);
        exit;
    }

    $page = pp_page_by_slug($DATA_ROOT, $slug);
    $cookie = $_COOKIE[pp_cookie_name($slug)] ?? '';
    if (!$page || !pp_verify_cookie($slug, (int)($page['password_version'] ?? 1), $cookie, $SECRET)) {
        http_response_code(401);
        echo json_encode(['error' => 'locked']);
        exit;
    }

    $items = pp_resolve_items($DATA_ROOT, $page);

    http_response_code(200);
    echo json_encode([
        'data' => [
            'title' => (string)($page['title'] ?? ''),
            'intro' => (string)($page['intro'] ?? ''),
            'items' => $items,
        ],
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    error_log('[private-page/get] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'internal error']);
}
