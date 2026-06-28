<?php
/** @var array $config */
/** @var ?array $page */
/** @var array $library */
$isNew = empty($page);
$p = $page ?? [
    'id' => 0, 'slug' => '', 'title' => '', 'intro' => '',
    'status' => 'active', 'items' => [],
];
$selectedIds = array_column($p['items'] ?? [], 'item_id');
?>

<h2>
  <?= $isNew ? 'New private page' : 'Edit: ' . htmlspecialchars($p['title']) ?>
  <?php if (!$isNew): ?>
    <span style="margin-left: 10px; font-size: 11px; letter-spacing: 0.2em; padding: 3px 8px; border-radius: 3px;
      background: <?= ($p['status'] ?? 'active') === 'active' ? 'var(--ok)' : '#888' ?>; color: #fff; vertical-align: middle;">
      <?= strtoupper($p['status'] ?? 'active') ?>
    </span>
  <?php endif; ?>
</h2>

<form id="pp-edit-form" autocomplete="off">
  <input type="hidden" name="id" value="<?= (int)$p['id'] ?>">

  <h3>Basics</h3>
  <div class="grid-2">
    <div class="field">
      <label>Title</label>
      <input type="text" name="title" value="<?= htmlspecialchars($p['title']) ?>" required>
    </div>
    <div class="field">
      <label>Slug <span class="muted">(lowercase letters, digits, hyphens)</span></label>
      <input type="text" name="slug" value="<?= htmlspecialchars($p['slug']) ?>" pattern="[a-z0-9-]{1,120}" required>
    </div>
  </div>
  <div class="field">
    <label>Intro <span class="muted">(shown above the items, optional)</span></label>
    <textarea name="intro" rows="4"><?= htmlspecialchars($p['intro'] ?? '') ?></textarea>
  </div>

  <h3>Access</h3>
  <div class="grid-2">
    <div class="field">
      <label>
        <?= $isNew ? 'Password' : 'New password (leave blank to keep current)' ?>
      </label>
      <input type="text" name="password" placeholder="<?= $isNew ? 'min 6 chars' : 'leave blank to keep current' ?>" <?= $isNew ? 'required minlength="6"' : '' ?> maxlength="200">
      <p class="muted" style="font-size: 12px; margin-top: 4px;">
        Sent to the client by you, separately from the URL. Changing the password
        invalidates any currently-unlocked browser session.
      </p>
    </div>
    <div class="field">
      <label>Status</label>
      <select name="status">
        <option value="active"   <?= ($p['status'] ?? 'active') === 'active' ? 'selected' : '' ?>>Active</option>
        <option value="archived" <?= ($p['status'] ?? 'active') === 'archived' ? 'selected' : '' ?>>Archived</option>
      </select>
      <p class="muted" style="font-size: 12px; margin-top: 4px;">
        Archived pages return "wrong code" to anyone hitting the link.
      </p>
    </div>
  </div>

  <h3>Items <span class="muted">(<?= count($library) ?> in library)</span></h3>
  <?php if (empty($library)): ?>
    <div class="note">No library items yet. <a href="/admin/private-library">Add some first</a>, then come back.</div>
  <?php else: ?>
    <p class="muted" style="font-size: 13px;">
      Tick the items you want on this page. Drag-reorder is not implemented yet — order in the list below
      is the order they'll appear on the page. (Edit the JSON manually if you need different ordering.)
    </p>
    <div class="rowset">
      <?php foreach ($library as $i => $it):
        $checked = in_array((int)$it['id'], $selectedIds, true);
        $thumb = $it['thumbnail_url'] ?: $it['image_url'] ?: '';
      ?>
        <label style="display: grid; grid-template-columns: 24px 80px 1fr auto; gap: 12px; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--rule); margin: 0;">
          <input type="checkbox" name="item_ids[]" value="<?= (int)$it['id'] ?>" <?= $checked ? 'checked' : '' ?>>
          <div style="width: 80px; height: 50px; background: #eee; background-size: cover; background-position: center;
                      <?= $thumb ? 'background-image: url(\'' . htmlspecialchars($thumb) . '\');' : '' ?>"></div>
          <div>
            <div style="font-weight: 500;"><?= htmlspecialchars($it['title']) ?></div>
            <div class="muted" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em;">
              <?= htmlspecialchars($it['kind']) ?>
            </div>
          </div>
          <div class="muted" style="font-size: 11px;">#<?= (int)$it['id'] ?></div>
        </label>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>

  <div class="actions">
    <button class="btn ember" type="submit">
      <?= $isNew ? 'Save page' : 'Update page' ?>
    </button>
    <a class="btn secondary" href="/admin/private">Cancel</a>
  </div>
  <div class="muted" id="pp-status" style="margin-top: 10px;"></div>
</form>

<script>
const CSRF = <?= json_encode(csrf_token()) ?>;
const isNew = <?= $isNew ? 'true' : 'false' ?>;
const form = document.getElementById('pp-edit-form');
const statusEl = document.getElementById('pp-status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const itemIds = fd.getAll('item_ids[]').map(Number);
  const items = itemIds.map((id, i) => ({ item_id: id, position: i }));
  const body = {
    id:       Number(fd.get('id') || 0),
    slug:     (fd.get('slug') || '').toString().trim(),
    title:    (fd.get('title') || '').toString().trim(),
    intro:    (fd.get('intro') || '').toString(),
    password: (fd.get('password') || '').toString(),
    status:   (fd.get('status') || 'active').toString(),
    items,
    csrf: CSRF,
  };
  statusEl.textContent = 'Saving…';
  try {
    const r = await fetch('/admin/api/save-private-page.php', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      const f = j.fields ? ' (' + Object.values(j.fields).join('; ') + ')' : '';
      throw new Error((j.error || ('HTTP ' + r.status)) + f);
    }
    statusEl.textContent = '✓ Saved. Redirecting…';
    setTimeout(() => { window.location.href = '/admin/private'; }, 600);
  } catch (e) {
    statusEl.textContent = 'Failed: ' + e.message;
  }
});
</script>
