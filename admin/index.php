<?php
declare(strict_types=1);

// Front controller for the Praxivision admin portal.
// All routes flow through here; the .htaccess routes everything that doesn't
// match a real file to this script.

require __DIR__ . '/auth.php';
require __DIR__ . '/lib/csrf.php';
require __DIR__ . '/lib/github.php';
require __DIR__ . '/lib/image.php';
require __DIR__ . '/lib/slug.php';

session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/admin/',
    'secure'   => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

$config = require __DIR__ . '/config.php';
$path   = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/admin/';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Trim the /admin/ prefix
$route = preg_replace('#^/admin/?#', '', $path);

// Public routes (no auth)
if ($route === '' || $route === 'login' || $route === 'login.php') {
    if ($method === 'POST') {
        admin_login_post($config);
    } else {
        admin_login_view($config);
    }
    exit;
}

if ($route === 'logout') {
    admin_logout();
    header('Location: /admin/');
    exit;
}

// Auth gate
if (!admin_is_authed($config)) {
    header('Location: /admin/');
    exit;
}

// Protected routes
switch (true) {
    case $route === 'dashboard':
        admin_dashboard($config);
        break;

    case $route === 'new':
        if ($method === 'POST') admin_save($config, null);
        else                    admin_edit_view($config, null);
        break;

    case preg_match('#^edit/([a-z0-9-]+)$#', $route, $m):
        if ($method === 'POST') admin_save($config, $m[1]);
        else                    admin_edit_view($config, $m[1]);
        break;

    case preg_match('#^delete/([a-z0-9-]+)$#', $route, $m):
        admin_delete($config, $m[1]);
        break;

    case $route === 'publishing':
        admin_publishing_view($config);
        break;

    default:
        http_response_code(404);
        echo '<h1>404</h1>';
        exit;
}

/* ----- view + action handlers ------------------------------------------ */

function admin_login_view(array $config): void {
    $error = $_GET['error'] ?? null;
    include __DIR__ . '/views/header.php';
    include __DIR__ . '/views/login.php';
    include __DIR__ . '/views/footer.php';
}

function admin_login_post(array $config): void {
    csrf_check();
    $email    = strtolower(trim((string)($_POST['username'] ?? '')));
    $password = (string)($_POST['password'] ?? '');

    if (admin_is_locked_out()) {
        header('Location: /admin/?error=locked');
        exit;
    }

    $users = $config['admin_users'] ?? [];
    $hash  = $users[$email] ?? null;

    if ($hash === null || !password_verify($password, $hash)) {
        admin_record_failure();
        header('Location: /admin/?error=bad');
        exit;
    }

    admin_clear_failures();
    session_regenerate_id(true);
    $_SESSION['authed_at']    = time();
    $_SESSION['authed_user']  = $email;
    header('Location: /admin/dashboard');
    exit;
}

function admin_logout(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

function admin_is_authed(array $config): bool {
    if (empty($_SESSION['authed_at'])) return false;
    if (time() - $_SESSION['authed_at'] > ($config['session_lifetime'] ?? 28800)) {
        admin_logout();
        return false;
    }
    $user = $_SESSION['authed_user'] ?? null;
    return $user !== null && isset($config['admin_users'][$user]);
}

function admin_dashboard(array $config): void {
    [$studies, $sha] = github_read_json($config);
    include __DIR__ . '/views/header.php';
    include __DIR__ . '/views/dashboard.php';
    include __DIR__ . '/views/footer.php';
}

function admin_edit_view(array $config, ?string $slug): void {
    [$studies, $sha] = github_read_json($config);
    $study = null;
    if ($slug !== null) {
        foreach ($studies['studies'] as $s) {
            if ($s['slug'] === $slug) { $study = $s; break; }
        }
        if ($study === null) { http_response_code(404); echo 'Not found'; exit; }
    }
    include __DIR__ . '/views/header.php';
    include __DIR__ . '/views/edit.php';
    include __DIR__ . '/views/footer.php';
}

function admin_save(array $config, ?string $editingSlug): void {
    csrf_check();

    // The form has two submit buttons:
    //   <button name="_action" value="draft">Save draft</button>
    //   <button name="_action" value="publish">Publish</button>
    // Default to "draft" when neither was clicked (shouldn't happen with
    // a normal form submit, but defensive).
    $action = (string)($_POST['_action'] ?? 'draft');
    $statusToWrite = ($action === 'publish') ? 'published' : 'draft';

    $title       = trim((string)($_POST['title'] ?? ''));
    $client      = trim((string)($_POST['client'] ?? ''));
    $titleHead   = trim((string)($_POST['titleHead'] ?? ''));
    $titleTail   = trim((string)($_POST['titleTail'] ?? ''));
    $year        = trim((string)($_POST['year'] ?? ''));
    $tag         = trim((string)($_POST['tag'] ?? ''));
    $instruments = trim((string)($_POST['instruments'] ?? ''));
    $summary     = trim((string)($_POST['summary'] ?? ''));
    $lede        = trim((string)($_POST['lede'] ?? ''));
    $jobSummary  = trim((string)($_POST['jobSummary'] ?? ''));
    $outcomeLede = trim((string)($_POST['outcomeLede'] ?? ''));
    $phasesHeader      = trim((string)($_POST['phasesHeader'] ?? 'Four phases,'));
    $phasesHeaderAccent= trim((string)($_POST['phasesHeaderAccent'] ?? 'on site.'));
    $platesHeader      = trim((string)($_POST['platesHeader'] ?? 'Selected'));
    $platesHeaderAccent= trim((string)($_POST['platesHeaderAccent'] ?? 'spreads.'));
    $platesIntro       = trim((string)($_POST['platesIntro'] ?? ''));

    $slug = $editingSlug ?? slugify($title);
    if ($slug === '' || $title === '' || $client === '' || $year === '') {
        admin_flash_error('Title, client, year, and slug are all required.');
        header('Location: /admin/' . ($editingSlug ? "edit/$editingSlug" : 'new'));
        exit;
    }

    // Specs: parallel arrays of keys + values
    $specs = [];
    $specKeys   = (array)($_POST['spec_key']   ?? []);
    $specVals   = (array)($_POST['spec_value'] ?? []);
    for ($i = 0; $i < count($specKeys); $i++) {
        $k = trim((string)$specKeys[$i]);
        $v = trim((string)$specVals[$i]);
        if ($k !== '' || $v !== '') $specs[] = [$k, $v];
    }

    // Phases
    $phases = [];
    $phaseN    = (array)($_POST['phase_n']    ?? []);
    $phaseTail = (array)($_POST['phase_tail'] ?? []);
    $phaseBody = (array)($_POST['phase_body'] ?? []);
    for ($i = 0; $i < count($phaseN); $i++) {
        if (trim((string)$phaseBody[$i]) === '') continue;
        $phases[] = [
            'n'    => trim((string)$phaseN[$i]),
            'tail' => trim((string)$phaseTail[$i]),
            'body' => trim((string)$phaseBody[$i]),
        ];
    }

    // Handle uploaded images
    $mediaDir = rtrim($config['media_root'], '/') . '/' . $slug;
    if (!is_dir($mediaDir)) {
        @mkdir($mediaDir, 0755, true);
    }
    $mediaPrefix = rtrim($config['media_url_prefix'], '/') . '/' . $slug;

    // Hero image
    $hero = ['plateId' => '', 'src' => '', 'position' => '50% 50%', 'alt' => $title];
    if (!empty($_FILES['hero_image']['tmp_name'])) {
        $saved = image_save_upload($_FILES['hero_image'], $mediaDir, 'hero');
        if ($saved !== null) $hero['src'] = "$mediaPrefix/$saved";
    } elseif (!empty($_POST['hero_existing_src'])) {
        $hero['src'] = (string)$_POST['hero_existing_src'];
    } elseif (!empty($_POST['hero_plate_id'])) {
        $hero['plateId'] = (string)$_POST['hero_plate_id'];
    }
    $hero['position']  = trim((string)($_POST['hero_position']   ?? '50% 50%'));
    $hero['alt']       = trim((string)($_POST['hero_alt']        ?? "$client — $title"));
    $hero['frameLabel']    = trim((string)($_POST['hero_frame_label']    ?? strtoupper("$title · COVER")));
    $hero['frameCode']     = trim((string)($_POST['hero_frame_code']     ?? 'PL.01'));
    $hero['frameExposure'] = trim((string)($_POST['hero_frame_exposure'] ?? "$client · $year"));
    $hero['frameScale']    = trim((string)($_POST['hero_frame_scale']    ?? 'cover'));

    // Plates (multiple uploads named plate_image[0], plate_image[1] etc.)
    $plates = [];
    $plateLabels    = (array)($_POST['plate_label']    ?? []);
    $plateCaptions  = (array)($_POST['plate_caption']  ?? []);
    $platePositions = (array)($_POST['plate_position'] ?? []);
    $plateExisting  = (array)($_POST['plate_existing_src'] ?? []);
    $uploadedPlates = $_FILES['plate_image'] ?? null;
    for ($i = 0; $i < count($plateLabels); $i++) {
        if (trim((string)$plateLabels[$i]) === '') continue;
        $src = (string)($plateExisting[$i] ?? '');
        if ($uploadedPlates && !empty($uploadedPlates['tmp_name'][$i])) {
            $upload = [
                'name'     => $uploadedPlates['name'][$i],
                'type'     => $uploadedPlates['type'][$i],
                'tmp_name' => $uploadedPlates['tmp_name'][$i],
                'error'    => $uploadedPlates['error'][$i],
                'size'     => $uploadedPlates['size'][$i],
            ];
            $saved = image_save_upload($upload, $mediaDir, "plate-" . str_pad((string)$i, 2, '0', STR_PAD_LEFT));
            if ($saved !== null) $src = "$mediaPrefix/$saved";
        }
        $plates[] = [
            'src'      => $src,
            'label'    => trim((string)$plateLabels[$i]),
            'caption'  => trim((string)$plateCaptions[$i] ?? ''),
            'position' => trim((string)$platePositions[$i] ?? '50% 50%'),
        ];
    }

    // Sections array — visibility + order from the layout editor (B-4).
    // Falls back to the default order if the form didn't post any.
    $sectionsTypes = (array)($_POST['section_type']    ?? []);
    $sectionsVis   = (array)($_POST['section_visible'] ?? []);
    $sectionVisLookup = [];
    foreach ($sectionsVis as $t) { $sectionVisLookup[(string)$t] = true; }
    $sections = [];
    foreach ($sectionsTypes as $t) {
        $t = (string)$t;
        if (!in_array($t, ['job','method','plates','outcome'], true)) continue;
        $sections[] = [
            'type'    => $t,
            'visible' => isset($sectionVisLookup[$t]),
        ];
    }
    if (empty($sections)) {
        $sections = [
            ['type' => 'job',     'visible' => true],
            ['type' => 'method',  'visible' => true],
            ['type' => 'plates',  'visible' => true],
            ['type' => 'outcome', 'visible' => true],
        ];
    }

    $record = [
        'slug'        => $slug,
        'status'      => $statusToWrite,
        'sections'    => $sections,
        'client'      => $client,
        'title'       => $title,
        'titleHead'   => $titleHead !== '' ? $titleHead : $title,
        'titleTail'   => $titleTail !== '' ? $titleTail : '.',
        'year'        => $year,
        'tag'         => $tag,
        'instruments' => $instruments,
        'summary'     => $summary,
        'lede'        => $lede !== '' ? $lede : $summary,
        'kicker'      => sprintf('01 / 01 · %s · %s', strtoupper($tag), $year),
        'hero'        => $hero,
        'jobSummary'  => $jobSummary !== '' ? $jobSummary : $summary,
        'specs'       => $specs,
        'phasesHeader'       => $phasesHeader,
        'phasesHeaderAccent' => $phasesHeaderAccent,
        'phases'             => $phases,
        'platesHeader'       => $platesHeader,
        'platesHeaderAccent' => $platesHeaderAccent,
        'platesIntro'        => $platesIntro,
        'plates'             => $plates,
        'outcomeLede'        => $outcomeLede,
    ];

    [$file, $sha] = github_read_json($config);
    $studies = $file['studies'] ?? [];
    $found = false;
    foreach ($studies as $i => $existing) {
        if ($existing['slug'] === $slug) {
            $studies[$i] = $record;
            $found = true;
            break;
        }
    }
    if (!$found) $studies[] = $record;

    $newFile = [
        'version' => $file['version'] ?? 1,
        'studies' => $studies,
    ];

    $verb = $statusToWrite === 'published' ? 'publish' : 'draft';
    $msg = $found
        ? "cms: {$verb} case study {$client} {$year}"
        : "cms: add case study {$client} {$year} ({$verb})";

    github_write_json($config, $newFile, $sha, $msg);
    github_dispatch_workflow($config);

    $_SESSION['just_published_slug']   = $slug;
    $_SESSION['just_published_status'] = $statusToWrite;
    header('Location: /admin/publishing');
    exit;
}

function admin_delete(array $config, string $slug): void {
    csrf_check();
    [$file, $sha] = github_read_json($config);
    $studies = array_values(array_filter(
        $file['studies'] ?? [],
        fn($s) => ($s['slug'] ?? '') !== $slug
    ));
    $newFile = ['version' => $file['version'] ?? 1, 'studies' => $studies];
    github_write_json($config, $newFile, $sha, "cms: remove case study $slug");
    github_dispatch_workflow($config);
    header('Location: /admin/dashboard');
    exit;
}

function admin_publishing_view(array $config): void {
    $slug = $_SESSION['just_published_slug'] ?? null;
    include __DIR__ . '/views/header.php';
    include __DIR__ . '/views/publishing.php';
    include __DIR__ . '/views/footer.php';
}

/* ----- lockout (file-based, IP-keyed) ---------------------------------- */

function admin_lockout_path(): string {
    $ip = preg_replace('/[^a-f0-9.:]/i', '_', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
    return __DIR__ . "/.lockout/$ip.json";
}

function admin_record_failure(): void {
    $dir = __DIR__ . '/.lockout';
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    $path = admin_lockout_path();
    $now = time();
    $data = ['attempts' => [], 'locked_until' => 0];
    if (is_file($path)) {
        $data = json_decode((string)file_get_contents($path), true) ?: $data;
    }
    // Drop attempts older than 15 min
    $data['attempts'] = array_values(array_filter(
        $data['attempts'] ?? [],
        fn($t) => $t > ($now - 15 * 60)
    ));
    $data['attempts'][] = $now;
    if (count($data['attempts']) >= 5) {
        $data['locked_until'] = $now + 15 * 60;
        $data['attempts'] = [];
    }
    file_put_contents($path, json_encode($data));
}

function admin_clear_failures(): void {
    $path = admin_lockout_path();
    if (is_file($path)) @unlink($path);
}

function admin_is_locked_out(): bool {
    $path = admin_lockout_path();
    if (!is_file($path)) return false;
    $data = json_decode((string)file_get_contents($path), true) ?: [];
    return (int)($data['locked_until'] ?? 0) > time();
}

function admin_flash_error(string $msg): void {
    $_SESSION['flash_error'] = $msg;
}
