<?php
/**
 * Shared bootstrap for every admin/api/*.php endpoint.
 *
 *   require __DIR__ . '/_bootstrap.php';
 *
 * On require, this:
 *   - starts the same session admin/index.php uses
 *   - loads config.php
 *   - 401s if the request is not authenticated
 *   - exposes $config, json_ok(), json_err(), get_json_body()
 *
 * Direct HTTP access to this file is blocked by admin/.htaccess
 * (RedirectMatch 404 /admin/api/_.*).
 */
declare(strict_types=1);

session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/admin/',
    'secure'   => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

require __DIR__ . '/../lib/csrf.php';

$config = require __DIR__ . '/../config.php';

if (
    empty($_SESSION['authed_at'])
    || !isset($config['admin_users'][$_SESSION['authed_user'] ?? ''])
) {
    http_response_code(401);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode(['error' => 'not authenticated']);
    exit;
}

if (time() - (int)$_SESSION['authed_at'] > ($config['session_lifetime'] ?? 28800)) {
    $_SESSION = [];
    session_destroy();
    http_response_code(401);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'session expired']);
    exit;
}

function json_ok(array $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function json_err(string $msg, int $status = 400, array $extra = []): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode(['error' => $msg] + $extra, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function get_json_body(): array {
    if (!empty($_POST)) return $_POST;
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $decoded = json_decode((string)$raw, true);
    return is_array($decoded) ? $decoded : [];
}
