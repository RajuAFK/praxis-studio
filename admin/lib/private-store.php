<?php
declare(strict_types=1);

/**
 * File-backed JSON store for private pages + library items.
 *
 * Storage layout (on Hostinger):
 *
 *   /public_html/private-data/
 *     ├─ pages.json
 *     ├─ library.json
 *     └─ attempts/                (per-(slug, ip-hash) rate-limit files)
 *
 * Concurrency: every read/write goes through flock(LOCK_EX). Writes are
 * atomic (write to a temp file in the same dir, rename over the original).
 *
 * Schemas:
 *   pages.json   — { version:1, next_id:int, pages:[ {id, slug, title, intro,
 *                    password_hash, password_version, status, items:[{item_id,position}],
 *                    created_at, updated_at} ] }
 *   library.json — { version:1, next_id:int, items:[ {id, kind, title, iframe_url,
 *                    image_url, thumbnail_url, notes, created_at} ] }
 */

function pp_store_root(array $config): string {
    return rtrim((string)($config['private_data_root'] ?? ''), '/');
}

function pp_store_init(array $config): void {
    $root = pp_store_root($config);
    if ($root === '') throw new RuntimeException('private_data_root not configured');
    if (!is_dir($root))           @mkdir($root, 0700, true);
    if (!is_dir("$root/attempts")) @mkdir("$root/attempts", 0700, true);
    foreach (['pages.json' => ['version' => 1, 'next_id' => 1, 'pages' => []],
              'library.json' => ['version' => 1, 'next_id' => 1, 'items' => []]] as $name => $seed) {
        $path = "$root/$name";
        if (!is_file($path)) {
            file_put_contents($path, json_encode($seed, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n");
            @chmod($path, 0600);
        }
    }
}

/** Read a JSON file under flock(LOCK_SH). Returns [] if file missing. */
function pp_store_read(array $config, string $name): array {
    pp_store_init($config);
    $path = pp_store_root($config) . '/' . $name;
    if (!is_file($path)) return [];
    $fh = @fopen($path, 'r');
    if (!$fh) throw new RuntimeException("cannot open $path");
    try {
        @flock($fh, LOCK_SH);
        $raw = stream_get_contents($fh);
    } finally {
        @flock($fh, LOCK_UN);
        @fclose($fh);
    }
    $decoded = json_decode((string)$raw, true);
    return is_array($decoded) ? $decoded : [];
}

/**
 * Update a JSON file with flock(LOCK_EX) + atomic rename.
 * Callback receives the current decoded array and returns the new array.
 *
 * @param callable(array): array $mutator
 */
function pp_store_update(array $config, string $name, callable $mutator): array {
    pp_store_init($config);
    $path  = pp_store_root($config) . '/' . $name;
    $lockH = @fopen($path, 'c+');
    if (!$lockH) throw new RuntimeException("cannot lock $path");
    try {
        if (!flock($lockH, LOCK_EX)) throw new RuntimeException("cannot lock $path");
        rewind($lockH);
        $raw = stream_get_contents($lockH);
        $current = json_decode((string)$raw, true);
        if (!is_array($current)) $current = [];
        $next = $mutator($current);
        $payload = json_encode($next, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n";
        $tmp = $path . '.tmp.' . bin2hex(random_bytes(4));
        file_put_contents($tmp, $payload);
        @chmod($tmp, 0600);
        if (!rename($tmp, $path)) {
            @unlink($tmp);
            throw new RuntimeException("atomic rename failed for $path");
        }
        return $next;
    } finally {
        @flock($lockH, LOCK_UN);
        @fclose($lockH);
    }
}

/* ----- pages.json operations ----- */

function pp_pages_all(array $config): array {
    $f = pp_store_read($config, 'pages.json');
    return $f['pages'] ?? [];
}

function pp_pages_find_slug(array $config, string $slug): ?array {
    foreach (pp_pages_all($config) as $p) {
        if (($p['slug'] ?? '') === $slug) return $p;
    }
    return null;
}

function pp_pages_find_id(array $config, int $id): ?array {
    foreach (pp_pages_all($config) as $p) {
        if ((int)($p['id'] ?? 0) === $id) return $p;
    }
    return null;
}

/**
 * Upsert a page. On insert pass id=0/null; on update pass real id.
 * If $newPassword is non-null and non-empty, password_hash is reset and
 * password_version is bumped (invalidates all live cookies for this page).
 *
 * @return array the saved record
 */
function pp_pages_upsert(array $config, ?int $id, string $slug, string $title, string $intro,
                        ?string $newPassword, string $status, array $items): array {
    $saved = null;
    pp_store_update($config, 'pages.json', function (array $file) use (
        &$saved, $id, $slug, $title, $intro, $newPassword, $status, $items
    ) {
        $file['version'] ??= 1;
        $file['next_id'] ??= 1;
        $file['pages']   ??= [];
        $now = time();

        // Slug uniqueness (excluding self)
        foreach ($file['pages'] as $p) {
            if (($p['slug'] ?? '') === $slug && (int)($p['id'] ?? 0) !== (int)$id) {
                throw new RuntimeException('slug already in use');
            }
        }

        $found = false;
        foreach ($file['pages'] as &$p) {
            if ((int)($p['id'] ?? 0) === (int)$id && $id > 0) {
                $p['slug']  = $slug;
                $p['title'] = $title;
                $p['intro'] = $intro;
                $p['status'] = $status;
                $p['items'] = $items;
                $p['updated_at'] = $now;
                if ($newPassword !== null && $newPassword !== '') {
                    $p['password_hash']    = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
                    $p['password_version'] = (int)($p['password_version'] ?? 0) + 1;
                }
                $saved = $p;
                $found = true;
                break;
            }
        }
        unset($p);

        if (!$found) {
            if ($newPassword === null || $newPassword === '') {
                throw new RuntimeException('password required on create');
            }
            $newId = (int)$file['next_id'];
            $rec = [
                'id'               => $newId,
                'slug'             => $slug,
                'title'            => $title,
                'intro'            => $intro,
                'password_hash'    => password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]),
                'password_version' => 1,
                'status'           => $status,
                'items'            => $items,
                'created_at'       => $now,
                'updated_at'       => $now,
            ];
            $file['pages'][] = $rec;
            $file['next_id'] = $newId + 1;
            $saved = $rec;
        }
        return $file;
    });
    return $saved;
}

function pp_pages_delete(array $config, int $id): bool {
    $removed = false;
    pp_store_update($config, 'pages.json', function (array $file) use ($id, &$removed) {
        $file['pages'] ??= [];
        $before = count($file['pages']);
        $file['pages'] = array_values(array_filter(
            $file['pages'],
            fn($p) => (int)($p['id'] ?? 0) !== $id
        ));
        $removed = count($file['pages']) !== $before;
        return $file;
    });
    return $removed;
}

/* ----- library.json operations ----- */

function pp_library_all(array $config): array {
    $f = pp_store_read($config, 'library.json');
    return $f['items'] ?? [];
}

function pp_library_find(array $config, int $id): ?array {
    foreach (pp_library_all($config) as $it) {
        if ((int)($it['id'] ?? 0) === $id) return $it;
    }
    return null;
}

/** Insert a library item. Returns saved record. */
function pp_library_insert(array $config, string $kind, string $title,
                           string $iframeUrl, string $imageUrl, string $thumbnailUrl, string $notes): array {
    if (!in_array($kind, ['image', 'tour', 'model'], true)) {
        throw new RuntimeException('invalid kind');
    }
    $saved = null;
    pp_store_update($config, 'library.json', function (array $file) use (
        &$saved, $kind, $title, $iframeUrl, $imageUrl, $thumbnailUrl, $notes
    ) {
        $file['version'] ??= 1;
        $file['next_id'] ??= 1;
        $file['items']   ??= [];
        $newId = (int)$file['next_id'];
        $rec = [
            'id'            => $newId,
            'kind'          => $kind,
            'title'         => $title,
            'iframe_url'    => $iframeUrl,
            'image_url'     => $imageUrl,
            'thumbnail_url' => $thumbnailUrl,
            'notes'         => $notes,
            'created_at'    => time(),
        ];
        $file['items'][] = $rec;
        $file['next_id'] = $newId + 1;
        $saved = $rec;
        return $file;
    });
    return $saved;
}

/**
 * Delete a library item.
 * Returns ['ok' => true] on success.
 * Returns ['ok' => false, 'pages' => [{slug, title}, ...]] if the item
 * is still referenced by one or more pages (caller must remove references first).
 */
function pp_library_delete(array $config, int $id): array {
    // Block if referenced
    $referenced = [];
    foreach (pp_pages_all($config) as $p) {
        foreach (($p['items'] ?? []) as $row) {
            if ((int)($row['item_id'] ?? 0) === $id) {
                $referenced[] = ['slug' => $p['slug'], 'title' => $p['title']];
                break;
            }
        }
    }
    if ($referenced) return ['ok' => false, 'pages' => $referenced];

    $removed = false;
    pp_store_update($config, 'library.json', function (array $file) use ($id, &$removed) {
        $file['items'] ??= [];
        $before = count($file['items']);
        $file['items'] = array_values(array_filter(
            $file['items'],
            fn($it) => (int)($it['id'] ?? 0) !== $id
        ));
        $removed = count($file['items']) !== $before;
        return $file;
    });
    return ['ok' => $removed];
}

/**
 * Materialise the ordered library items for a page record — used by the
 * /private/api/get.php endpoint after successful cookie verification.
 */
function pp_page_items_resolved(array $config, array $page): array {
    $library = pp_library_all($config);
    $byId = [];
    foreach ($library as $it) $byId[(int)$it['id']] = $it;
    $rows = $page['items'] ?? [];
    usort($rows, fn($a, $b) => ((int)($a['position'] ?? 0)) <=> ((int)($b['position'] ?? 0)));
    $out = [];
    foreach ($rows as $r) {
        $iid = (int)($r['item_id'] ?? 0);
        if (isset($byId[$iid])) $out[] = $byId[$iid];
    }
    return $out;
}
