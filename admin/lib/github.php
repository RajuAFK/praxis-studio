<?php
declare(strict_types=1);

/**
 * GitHub Contents + Actions API helpers.
 *
 * - github_read_json: returns [array $decoded, string $sha] for data/case-studies.json
 * - github_write_json: PUTs a new version, given the previous SHA
 * - github_dispatch_workflow: triggers the cms-rebuild workflow on main
 */

function github_api(array $config, string $path, string $method = 'GET', ?array $body = null): array {
    $url = "https://api.github.com$path";
    $headers = [
        'Authorization: Bearer ' . $config['github_pat'],
        'Accept: application/vnd.github+json',
        'X-GitHub-Api-Version: 2022-11-28',
        'User-Agent: praxivision-admin/1.0',
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_TIMEOUT        => 20,
        CURLOPT_FOLLOWLOCATION => true,
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body, JSON_UNESCAPED_SLASHES));
        $headers[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }

    $raw    = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err    = curl_error($ch);
    curl_close($ch);

    if ($raw === false) {
        http_response_code(502);
        exit("GitHub API request failed: $err");
    }
    if ($status >= 400) {
        http_response_code(502);
        exit("GitHub API $status on $method $path: " . substr((string)$raw, 0, 500));
    }
    $decoded = json_decode((string)$raw, true);
    return is_array($decoded) ? $decoded : [];
}

function github_read_json(array $config): array {
    $repo   = rawurlencode($config['github_repo']);
    $branch = rawurlencode($config['github_branch'] ?? 'main');
    $path   = 'data/case-studies.json';
    $resp = github_api($config, "/repos/{$config['github_repo']}/contents/$path?ref=$branch");
    $sha     = (string)($resp['sha'] ?? '');
    $content = base64_decode((string)($resp['content'] ?? ''), true);
    $file    = json_decode((string)$content, true);
    if (!is_array($file)) $file = ['version' => 1, 'studies' => []];
    return [$file, $sha];
}

function github_write_json(array $config, array $file, string $sha, string $commitMessage): void {
    $path = 'data/case-studies.json';
    $body = [
        'message' => $commitMessage,
        'content' => base64_encode(json_encode($file, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)),
        'branch'  => $config['github_branch'] ?? 'main',
    ];
    if ($sha !== '') $body['sha'] = $sha;
    github_api($config, "/repos/{$config['github_repo']}/contents/$path", 'PUT', $body);
}

function github_dispatch_workflow(array $config): void {
    $workflow = $config['github_workflow'] ?? 'cms-rebuild.yml';
    $branch   = $config['github_branch']   ?? 'main';
    github_api($config,
        "/repos/{$config['github_repo']}/actions/workflows/$workflow/dispatches",
        'POST',
        ['ref' => $branch]
    );
}
