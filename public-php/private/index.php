<?php
/**
 * Public-facing private page renderer.
 *
 * Served at https://praxivision.com/private/{slug}/ via .htaccess rewrite.
 *
 * Always returns the locked-shell HTML — content is fetched client-side
 * via /private/api/get.php only after the cookie verification passes.
 * The unlock flow POSTs to /private/api/unlock.php.
 *
 * carrying noindex,nofollow always — these URLs must never be in search.
 */
declare(strict_types=1);

$slug = (string)($_GET['slug'] ?? '');
if (!preg_match('/^[a-z0-9-]{1,120}$/', $slug)) {
    http_response_code(404);
    echo '404 — page not found';
    exit;
}

header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('X-Frame-Options: DENY');
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
<title>Private — Praxivision</title>
<link rel="stylesheet" href="/private/private.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,300;0,400;1,300&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">
</head>
<body data-slug="<?= htmlspecialchars($slug, ENT_QUOTES) ?>">
<main class="pp-main">

  <section class="pp-locked" id="pp-locked">
    <div class="pp-frame">
      <div class="pp-bracket pp-bracket-tl"></div>
      <div class="pp-bracket pp-bracket-tr"></div>
      <div class="pp-bracket pp-bracket-bl"></div>
      <div class="pp-bracket pp-bracket-br"></div>
      <div class="pp-kicker">● PRIVATE · ACCESS REQUIRED</div>
      <h1 class="pp-title">A page made <em>just</em> for you.</h1>
      <p class="pp-lede">
        This page is gated. Enter the code you were sent to view it.
      </p>
      <form id="pp-form" autocomplete="off">
        <input type="password" id="pp-pw" name="password" placeholder="Access code" autofocus required maxlength="200">
        <button type="submit" id="pp-submit">Unlock →</button>
      </form>
      <div class="pp-status" id="pp-status" aria-live="polite"></div>
    </div>
  </section>

  <section class="pp-unlocked" id="pp-unlocked" hidden>
    <div class="pp-header">
      <div class="pp-kicker">● PRIVATE · UNLOCKED</div>
      <h1 class="pp-title" id="pp-doc-title"></h1>
      <div class="pp-intro" id="pp-doc-intro"></div>
    </div>
    <div class="pp-items" id="pp-items"></div>
    <footer class="pp-footer">
      <div class="pp-footer-mono">PRAXIVISION · PRIVATE</div>
    </footer>
  </section>

</main>

<script>
(function () {
  const slug = document.body.dataset.slug;
  const lockedEl   = document.getElementById('pp-locked');
  const unlockedEl = document.getElementById('pp-unlocked');
  const form    = document.getElementById('pp-form');
  const pwEl    = document.getElementById('pp-pw');
  const subEl   = document.getElementById('pp-submit');
  const statusEl= document.getElementById('pp-status');

  function showLocked(msg) {
    lockedEl.hidden = false;
    unlockedEl.hidden = true;
    if (msg) statusEl.textContent = msg;
  }
  function showUnlocked(data) {
    lockedEl.hidden = true;
    unlockedEl.hidden = false;
    document.getElementById('pp-doc-title').textContent = data.title || '';
    const intro = document.getElementById('pp-doc-intro');
    intro.textContent = data.intro || '';
    intro.style.display = (data.intro && data.intro.trim()) ? '' : 'none';
    const itemsEl = document.getElementById('pp-items');
    itemsEl.innerHTML = '';
    (data.items || []).forEach(it => itemsEl.appendChild(renderItem(it)));
    document.title = (data.title || 'Private') + ' — Praxivision';
  }

  function renderItem(it) {
    const card = document.createElement('article');
    card.className = 'pp-item pp-item-' + (it.kind || 'image');
    const title = document.createElement('h3');
    title.className = 'pp-item-title';
    title.textContent = it.title || '';
    if (it.kind === 'image') {
      const a = document.createElement('a');
      a.href = it.image_url || it.thumbnail_url || '#';
      a.target = '_blank';
      a.rel = 'noopener';
      const img = document.createElement('img');
      img.src = it.image_url || it.thumbnail_url || '';
      img.alt = it.title || '';
      img.loading = 'lazy';
      a.appendChild(img);
      card.appendChild(a);
    } else {
      // tour / model — render a thumbnail-gated iframe
      const wrap = document.createElement('div');
      wrap.className = 'pp-iframe-gate';
      wrap.style.backgroundImage = it.thumbnail_url ? "url('" + it.thumbnail_url.replace(/'/g, "%27") + "')" : '';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pp-load-btn';
      btn.textContent = '▶ Load this content';
      btn.addEventListener('click', () => {
        const iframe = document.createElement('iframe');
        iframe.src = it.iframe_url || '';
        iframe.allow = 'fullscreen; xr-spatial-tracking';
        iframe.loading = 'lazy';
        wrap.innerHTML = '';
        wrap.appendChild(iframe);
        wrap.classList.add('pp-iframe-loaded');
      });
      wrap.appendChild(btn);
      card.appendChild(wrap);
    }
    if (it.title) card.appendChild(title);
    return card;
  }

  async function tryFetch() {
    try {
      const r = await fetch('/private/api/get.php?slug=' + encodeURIComponent(slug), {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (r.ok) {
        const j = await r.json();
        if (j && j.data) { showUnlocked(j.data); return true; }
      }
    } catch (e) {}
    return false;
  }

  // On load: maybe the cookie is still valid from a previous unlock.
  (async () => {
    const ok = await tryFetch();
    if (!ok) showLocked('');
  })();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = 'Checking…';
    subEl.disabled = true;
    try {
      const r = await fetch('/private/api/unlock.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, password: pwEl.value }),
      });
      if (r.ok) {
        const got = await tryFetch();
        if (got) return;
        statusEl.textContent = 'Unlocked but could not fetch content. Reload?';
      } else if (r.status === 429) {
        statusEl.textContent = 'Too many tries. Locked for 15 minutes.';
      } else {
        statusEl.textContent = 'Wrong code.';
      }
    } catch (e) {
      statusEl.textContent = 'Network error. Try again.';
    } finally {
      subEl.disabled = false;
      pwEl.select();
    }
  });
})();
</script>
</body>
</html>
