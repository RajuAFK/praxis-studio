<?php
declare(strict_types=1);

/**
 * Cloudflare R2 SigV4 helpers — pure PHP, no SDK, no Composer.
 *
 * Adapted from touritvirtually/backend/public_html/admin/api/_r2.php.
 * R2 is S3-compatible. Path-style endpoint:
 *     https://{accountid}.r2.cloudflarestorage.com/{bucket}/{key}
 *
 * Two functions exposed:
 *   r2_presign_put(key, expires)        → presigned PUT URL + public URL
 *   r2_list_objects(prefix, max_keys)   → array of object keys/sizes under prefix
 *
 * Caller must have loaded config with R2_* values. Wrap them in defines:
 *
 *   define('R2_ACCOUNT_ID',  $cfg['r2_account_id']);
 *   define('R2_ACCESS_KEY',  $cfg['r2_access_key']);
 *   define('R2_SECRET_KEY',  $cfg['r2_secret_key']);
 *   define('R2_BUCKET',      $cfg['r2_bucket']);
 *   define('R2_PUBLIC_BASE', $cfg['r2_public_base']);
 *   define('R2_PRESIGN_TTL', $cfg['r2_presign_ttl'] ?? 900);
 */

function r2_check_constants(): void {
    foreach (['R2_ACCOUNT_ID', 'R2_ACCESS_KEY', 'R2_SECRET_KEY', 'R2_BUCKET', 'R2_PUBLIC_BASE'] as $k) {
        if (!defined($k) || constant($k) === '') {
            throw new RuntimeException("R2 config missing: $k");
        }
    }
}

function r2_encode_path(string $path): string {
    return implode('/', array_map('rawurlencode', explode('/', $path)));
}

function r2_canonical_query(array $params): string {
    ksort($params);
    $out = [];
    foreach ($params as $k => $v) {
        $out[] = rawurlencode($k) . '=' . rawurlencode($v);
    }
    return implode('&', $out);
}

function r2_signing_key(string $short_date): string {
    $k = hash_hmac('sha256', $short_date,    'AWS4' . R2_SECRET_KEY, true);
    $k = hash_hmac('sha256', 'auto',         $k, true);
    $k = hash_hmac('sha256', 's3',           $k, true);
    return hash_hmac('sha256', 'aws4_request', $k, true);
}

/**
 * Generate a presigned PUT URL.
 *
 * @return array{upload_url:string, public_url:string, expires_at:int}
 */
function r2_presign_put(string $key, int $expires = 900): array {
    r2_check_constants();
    if ($key === '' || $expires < 1 || $expires > 604800) {
        throw new InvalidArgumentException('bad key or expires');
    }

    $host       = R2_ACCOUNT_ID . '.r2.cloudflarestorage.com';
    $encoded    = r2_encode_path($key);
    $uri        = '/' . rawurlencode(R2_BUCKET) . '/' . $encoded;

    $now        = gmdate('Ymd\THis\Z');
    $short_date = gmdate('Ymd');
    $scope      = "$short_date/auto/s3/aws4_request";

    $query = [
        'X-Amz-Algorithm'     => 'AWS4-HMAC-SHA256',
        'X-Amz-Credential'    => R2_ACCESS_KEY . '/' . $scope,
        'X-Amz-Date'          => $now,
        'X-Amz-Expires'       => (string)$expires,
        'X-Amz-SignedHeaders' => 'host',
    ];
    $canonical_query   = r2_canonical_query($query);
    $canonical_request = implode("\n", [
        'PUT', $uri, $canonical_query,
        'host:' . $host, '', 'host',
        'UNSIGNED-PAYLOAD',
    ]);
    $string_to_sign = implode("\n", [
        'AWS4-HMAC-SHA256', $now, $scope,
        hash('sha256', $canonical_request),
    ]);
    $signature = hash_hmac('sha256', $string_to_sign, r2_signing_key($short_date));

    return [
        'upload_url' => 'https://' . $host . $uri . '?' . $canonical_query . '&X-Amz-Signature=' . $signature,
        'public_url' => rtrim(R2_PUBLIC_BASE, '/') . '/' . $encoded,
        'expires_at' => time() + $expires,
    ];
}

/**
 * GET https://{host}/{bucket}?list-type=2&prefix=...&max-keys=...
 * SigV4 signed in the query string (same trick as the presigned PUT).
 *
 * Returns an array of [['key' => string, 'size' => int, 'last_modified' => string], ...].
 * If $delimiter is set, also returns common_prefixes (the "subdirectories").
 *
 * @return array{objects: array<array{key:string,size:int,last_modified:string}>, prefixes: string[]}
 */
function r2_list_objects(string $prefix = '', int $max_keys = 1000, string $delimiter = ''): array {
    r2_check_constants();
    if ($max_keys < 1 || $max_keys > 1000) {
        throw new InvalidArgumentException('max_keys must be 1..1000');
    }

    $host = R2_ACCOUNT_ID . '.r2.cloudflarestorage.com';
    $uri  = '/' . rawurlencode(R2_BUCKET);

    $now        = gmdate('Ymd\THis\Z');
    $short_date = gmdate('Ymd');
    $scope      = "$short_date/auto/s3/aws4_request";

    $query = [
        'list-type'           => '2',
        'max-keys'            => (string)$max_keys,
        'X-Amz-Algorithm'     => 'AWS4-HMAC-SHA256',
        'X-Amz-Credential'    => R2_ACCESS_KEY . '/' . $scope,
        'X-Amz-Date'          => $now,
        'X-Amz-Expires'       => '60',
        'X-Amz-SignedHeaders' => 'host',
    ];
    if ($prefix    !== '') $query['prefix']    = $prefix;
    if ($delimiter !== '') $query['delimiter'] = $delimiter;

    $canonical_query   = r2_canonical_query($query);
    $canonical_request = implode("\n", [
        'GET', $uri, $canonical_query,
        'host:' . $host, '', 'host',
        'UNSIGNED-PAYLOAD',
    ]);
    $string_to_sign = implode("\n", [
        'AWS4-HMAC-SHA256', $now, $scope,
        hash('sha256', $canonical_request),
    ]);
    $signature = hash_hmac('sha256', $string_to_sign, r2_signing_key($short_date));

    $url = 'https://' . $host . $uri . '?' . $canonical_query . '&X-Amz-Signature=' . $signature;

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_FAILONERROR    => false,
    ]);
    $body   = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err    = curl_error($ch);
    curl_close($ch);

    if ($body === false) throw new RuntimeException("R2 list failed: $err");
    if ($status !== 200) throw new RuntimeException("R2 list HTTP $status: " . substr((string)$body, 0, 400));

    // S3 returns XML.
    libxml_use_internal_errors(true);
    $xml = simplexml_load_string((string)$body);
    if (!$xml) throw new RuntimeException('R2 list response not valid XML');

    $objects = [];
    foreach ($xml->Contents ?? [] as $obj) {
        $objects[] = [
            'key'           => (string)$obj->Key,
            'size'          => (int)(string)$obj->Size,
            'last_modified' => (string)$obj->LastModified,
        ];
    }
    $prefixes = [];
    foreach ($xml->CommonPrefixes ?? [] as $cp) {
        $prefixes[] = (string)$cp->Prefix;
    }

    return ['objects' => $objects, 'prefixes' => $prefixes];
}

/** Resolve a key to its public URL (under the configured R2_PUBLIC_BASE). */
function r2_public_url(string $key): string {
    r2_check_constants();
    return rtrim(R2_PUBLIC_BASE, '/') . '/' . r2_encode_path($key);
}
