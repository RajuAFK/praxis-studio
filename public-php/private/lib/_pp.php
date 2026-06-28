<?php
declare(strict_types=1);

/**
 * Shared helpers for the public /private/* endpoints.
 *
 * Mirrors touritvirtually/backend/public_html/api/private-page/_lib.php
 * but reads APP_SECRET + private_data_root from a passed-in config array
 * (see config-bridge.php) instead of constants.
 *
 *   pp_client_ip()                    — CF-Connecting-IP first, REMOTE_ADDR fallback
 *   pp_ip_hash($ip, $secret)          — sha256(ip + '|' + secret)
 *   pp_cookie_name($slug)             — "praxis_pp_<slug>"
 *   pp_mint_cookie($slug, $pwver, $secret) → ['value', 'expires']
 *   pp_verify_cookie($slug, $pwver, $raw, $secret) → bool
 *   pp_set_cookie($slug, $pwver, $secret) — sets the HTTP cookie
 *   pp_pages_read($dataRoot)          — returns pages[]
 *   pp_resolve_items($dataRoot, $page) — returns library items in order
 *   pp_attempts_*                     — file-backed rate limiter
 */

define('PP_COOKIE_TTL', 8 * 60 * 60);   // 8h
define('PP_LOCK_WINDOW', 600);          // 10 min
define('PP_LOCK_LIMIT',  8);            // failures in the window before lock
define('PP_LOCK_FOR',    15 * 60);      // 15 min lockout

function pp_client_ip(): string {
    $cf = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '';
    if ($cf !== '' && filter_var($cf, FILTER_VALIDATE_IP)) return $cf;
    $ra = $_SERVER['REMOTE_ADDR'] ?? '';
    return $ra !== '' ? $ra : '0.0.0.0';
}

function pp_ip_hash(string $ip, string $secret): string {
    return hash('sha256', $ip . '|' . $secret);
}

function pp_cookie_name(string $slug): string {
    return 'praxis_pp_' . $slug;
}

function pp_mint_cookie(string $slug, int $password_version, string $secret): array {
    $expires = time() + PP_COOKIE_TTL;
    $sig = hash_hmac('sha256', $slug . '|' . $expires . '|' . $password_version, $secret);
    return [
        'value'   => 'v1.' . $expires . '.' . $password_version . '.' . $sig,
        'expires' => $expires,
    ];
}

function pp_verify_cookie(string $slug, int $password_version, string $raw, string $secret): bool {
    if ($raw === '') return false;
    $parts = explode('.', $raw, 4);
    if (count($parts) !== 4) return false;
    [$ver, $exp_s, $pwver_s, $sig] = $parts;
    if ($ver !== 'v1') return false;
    $exp   = (int)$exp_s;
    $pwver = (int)$pwver_s;
    if ($exp < time())                return false;
    if ($pwver !== $password_version) return false;
    $expect = hash_hmac('sha256', $slug . '|' . $exp . '|' . $pwver, $secret);
    return hash_equals($expect, $sig);
}

function pp_set_cookie(string $slug, int $password_version, string $secret): void {
    $c = pp_mint_cookie($slug, $password_version, $secret);
    setcookie(pp_cookie_name($slug), $c['value'], [
        'expires'  => $c['expires'],
        'path'     => '/',
        'secure'   => !empty($_SERVER['HTTPS']) || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

/* ----- attempts (rate limiter) ----- */

function pp_attempts_path(string $dataRoot, string $slug, string $ipHash): string {
    $safe = preg_replace('/[^a-f0-9]/', '_', $ipHash);
    return rtrim($dataRoot, '/') . '/attempts/' . $slug . '-' . substr($safe, 0, 32) . '.json';
}

function pp_attempts_read(string $path): array {
    if (!is_file($path)) return ['attempts' => 0, 'last_attempt' => 0, 'locked_until' => 0];
    $raw = @file_get_contents($path);
    $d = json_decode((string)$raw, true);
    if (!is_array($d)) return ['attempts' => 0, 'last_attempt' => 0, 'locked_until' => 0];
    return [
        'attempts'     => (int)($d['attempts']     ?? 0),
        'last_attempt' => (int)($d['last_attempt'] ?? 0),
        'locked_until' => (int)($d['locked_until'] ?? 0),
    ];
}

function pp_attempts_write(string $path, array $rec): void {
    @file_put_contents($path, json_encode($rec));
    @chmod($path, 0600);
}

function pp_attempts_clear(string $path): void {
    if (is_file($path)) @unlink($path);
}

/**
 * Opportunistic cleanup — ~1% of unlock requests prune attempt files
 * older than 7 days. No cron needed.
 */
function pp_attempts_maybe_cleanup(string $dataRoot): void {
    if (mt_rand(0, 99) !== 0) return;
    $dir = rtrim($dataRoot, '/') . '/attempts';
    if (!is_dir($dir)) return;
    $cutoff = time() - 7 * 86400;
    foreach (@scandir($dir) ?: [] as $f) {
        if ($f === '.' || $f === '..') continue;
        $p = $dir . '/' . $f;
        if (is_file($p) && @filemtime($p) < $cutoff) @unlink($p);
    }
}

/* ----- thin read-only helpers over pages.json + library.json ----- */

function pp_pages_read(string $dataRoot): array {
    $f = rtrim($dataRoot, '/') . '/pages.json';
    if (!is_file($f)) return [];
    $d = json_decode((string)@file_get_contents($f), true);
    return is_array($d) ? ($d['pages'] ?? []) : [];
}

function pp_page_by_slug(string $dataRoot, string $slug): ?array {
    foreach (pp_pages_read($dataRoot) as $p) {
        if (($p['slug'] ?? '') === $slug && ($p['status'] ?? 'active') === 'active') return $p;
    }
    return null;
}

function pp_library_read(string $dataRoot): array {
    $f = rtrim($dataRoot, '/') . '/library.json';
    if (!is_file($f)) return [];
    $d = json_decode((string)@file_get_contents($f), true);
    return is_array($d) ? ($d['items'] ?? []) : [];
}

function pp_resolve_items(string $dataRoot, array $page): array {
    $byId = [];
    foreach (pp_library_read($dataRoot) as $it) $byId[(int)$it['id']] = $it;
    $rows = $page['items'] ?? [];
    usort($rows, fn($a, $b) => ((int)($a['position'] ?? 0)) <=> ((int)($b['position'] ?? 0)));
    $out = [];
    foreach ($rows as $r) {
        $iid = (int)($r['item_id'] ?? 0);
        if (isset($byId[$iid])) {
            $i = $byId[$iid];
            $out[] = [
                'id'            => (int)$i['id'],
                'kind'          => (string)($i['kind'] ?? ''),
                'title'         => (string)($i['title'] ?? ''),
                'iframe_url'    => (string)($i['iframe_url'] ?? ''),
                'image_url'     => (string)($i['image_url'] ?? ''),
                'thumbnail_url' => (string)($i['thumbnail_url'] ?? ''),
            ];
        }
    }
    return $out;
}
