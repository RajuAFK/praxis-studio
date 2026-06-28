<?php
/**
 * POST /private/api/unlock.php
 * Body (JSON or form): { slug, password }
 *
 * Outcomes (existence indistinguishable):
 *   200 { ok: true }     correct, cookie set 8h
 *   401 { error: ... }   wrong / no such slug / archived
 *   429 { error: ... }   too many attempts → 15 min lock
 */
declare(strict_types=1);

require __DIR__ . '/../lib/_pp.php';
$config = require __DIR__ . '/../config-bridge.php';
$SECRET    = $config['app_secret'];
$DATA_ROOT = $config['private_data_root'];

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST only']);
    exit;
}

function pp_deny(int $code = 401): void {
    usleep(400000); // 400ms — throttle and obscure timing differences
    http_response_code($code);
    echo json_encode(['error' => 'denied']);
    exit;
}

try {
    // Parse body — JSON or form-encoded
    $body = $_POST;
    if (empty($body)) {
        $raw = file_get_contents('php://input');
        if ($raw) $body = json_decode($raw, true) ?: [];
    }
    $slug     = trim((string)($body['slug']     ?? ''));
    $password = (string)($body['password'] ?? '');

    if (!preg_match('/^[a-z0-9-]{1,120}$/', $slug) || $password === '' || mb_strlen($password) > 200) {
        pp_deny(401);
    }

    $ip      = pp_client_ip();
    $ipHash  = pp_ip_hash($ip, $SECRET);
    $attPath = pp_attempts_path($DATA_ROOT, $slug, $ipHash);
    $now     = time();

    pp_attempts_maybe_cleanup($DATA_ROOT);

    $att = pp_attempts_read($attPath);
    if ($att['locked_until'] > $now) {
        pp_deny(429);
    }

    $page = pp_page_by_slug($DATA_ROOT, $slug);
    $ok = $page && password_verify($password, (string)($page['password_hash'] ?? ''));

    if (!$ok) {
        $window = PP_LOCK_WINDOW;
        $attempts = ($now - $att['last_attempt']) > $window ? 1 : ($att['attempts'] + 1);
        $locked   = $attempts >= PP_LOCK_LIMIT ? $now + PP_LOCK_FOR : 0;
        pp_attempts_write($attPath, [
            'attempts'     => $attempts,
            'last_attempt' => $now,
            'locked_until' => $locked,
        ]);
        pp_deny($locked > 0 ? 429 : 401);
    }

    // Success
    pp_attempts_clear($attPath);
    pp_set_cookie($slug, (int)($page['password_version'] ?? 1), $SECRET);
    http_response_code(200);
    echo json_encode(['ok' => true]);

} catch (Throwable $e) {
    error_log('[private-page/unlock] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'internal error']);
}
