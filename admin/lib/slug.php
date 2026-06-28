<?php
declare(strict_types=1);

function slugify(string $raw): string {
    $s = strtolower(trim($raw));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s) ?? '';
    $s = trim($s, '-');
    return $s;
}
