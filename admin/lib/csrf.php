<?php
declare(strict_types=1);

function csrf_token(): string {
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrf_input(): string {
    return '<input type="hidden" name="csrf" value="' . htmlspecialchars(csrf_token(), ENT_QUOTES) . '">';
}

function csrf_check(): void {
    $given = (string)($_POST['csrf'] ?? '');
    $expected = (string)($_SESSION['csrf'] ?? '');
    if ($expected === '' || !hash_equals($expected, $given)) {
        http_response_code(403);
        exit('CSRF token mismatch — refresh and try again.');
    }
}
