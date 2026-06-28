<?php
/** @var array $pages */
/** @var array $library */
/** @var array $config */

function ago_pp(int $t): string {
    if (!$t) return '';
    $d = max(0, time() - $t);
    if ($d < 60)        return 'just now';
    if ($d < 3600)      return intdiv($d, 60) . ' min ago';
    if ($d < 86400)     return intdiv($d, 3600) . ' h ago';
    if ($d < 86400 * 7) return intdiv($d, 86400) . ' days ago';
    return date('M j, Y', $t);
}
?>
<h2>Private pages</h2>
<p class="muted">
  Password-gated pages you share by link. Not listed in the public catalogue.
  <?= count($pages) ?> page<?= count($pages) === 1 ? '' : 's' ?>,
  <?= count($library) ?> library item<?= count($library) === 1 ? '' : 's' ?>.
</p>

<div class="actions" style="margin-bottom: 18px;">
  <a class="btn ember" href="/admin/private-new">+ New private page</a>
  <a class="btn secondary" href="/admin/private-library">Manage library</a>
</div>

<?php if (empty($pages)): ?>
  <div class="note">
    No private pages yet.
    Add items to <a href="/admin/private-library">the library</a> first if you want media to attach, then
    <a href="/admin/private-new">create your first page</a>.
  </div>
<?php else: ?>
  <table>
    <thead>
      <tr>
        <th>Title</th>
        <th>Link</th>
        <th>Items</th>
        <th>Status</th>
        <th>Updated</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($pages as $p):
        $url = 'https://praxivision.com/private/' . $p['slug'] . '/';
        $isActive = ($p['status'] ?? 'active') === 'active';
      ?>
        <tr>
          <td><strong><?= htmlspecialchars($p['title']) ?></strong></td>
          <td>
            <a href="<?= htmlspecialchars($url) ?>" target="_blank" rel="noopener" style="font-size: 12px; color: var(--ember);">
              <?= htmlspecialchars($url) ?>
            </a>
            <button type="button" class="btn secondary pp-copy" data-link="<?= htmlspecialchars($url) ?>"
                    style="padding: 2px 8px; font-size: 11px; margin-left: 8px;">Copy</button>
          </td>
          <td><?= count($p['items'] ?? []) ?></td>
          <td>
            <span style="font-size: 10px; letter-spacing: 0.18em; padding: 2px 6px; border-radius: 2px;
              background: <?= $isActive ? 'var(--ok)' : '#888' ?>; color: #fff;">
              <?= strtoupper($p['status'] ?? 'active') ?>
            </span>
          </td>
          <td style="color: var(--ink-dim); font-size: 13px;">
            <?= ago_pp((int)($p['updated_at'] ?? 0)) ?>
          </td>
          <td style="text-align: right;">
            <a href="/admin/private-edit/<?= (int)$p['id'] ?>">Edit</a> ·
            <button type="button" class="btn warn pp-delete"
                    data-id="<?= (int)$p['id'] ?>"
                    data-title="<?= htmlspecialchars($p['title']) ?>"
                    style="padding: 2px 8px; font-size: 12px;">Delete</button>
          </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
<?php endif; ?>

<script>
const CSRF = <?= json_encode(csrf_token()) ?>;

document.querySelectorAll('.pp-copy').forEach(btn => {
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.link);
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = orig; }, 1200);
    } catch {
      window.prompt('Copy link:', btn.dataset.link);
    }
  });
});

document.querySelectorAll('.pp-delete').forEach(btn => {
  btn.addEventListener('click', async () => {
    const title = btn.dataset.title;
    if (!confirm(`Delete "${title}"? Anyone with the link will get a wrong-code response forever.`)) return;
    btn.disabled = true;
    try {
      const r = await fetch('/admin/api/delete-private-page.php', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(btn.dataset.id), csrf: CSRF }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || ('HTTP ' + r.status));
      btn.closest('tr').remove();
    } catch (e) {
      alert('Delete failed: ' + e.message);
      btn.disabled = false;
    }
  });
});
</script>
