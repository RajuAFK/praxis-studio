<?php
/** @var array $config */
/** @var array $items */
?>

<h2>Private library</h2>
<p class="muted">
  Media you can attach to private pages. Items here never appear on the public
  site unless added to a page. <?= count($items) ?> item<?= count($items) === 1 ? '' : 's' ?>.
</p>

<div class="note" style="margin-bottom: 18px; background: rgba(217,106,42,0.06); border-color: var(--ember);">
  <strong>Note:</strong> uploaded files are served from a public R2 URL. Anyone with
  the direct file URL can view that one file. Page passwords protect the <em>listing</em>,
  not the underlying media. Don't share direct file URLs.
</div>

<h3>Add an item</h3>
<div class="rowset">
  <div class="field">
    <label>Kind</label>
    <div id="lib-kind-pick" style="display: flex; gap: 8px;">
      <button type="button" class="btn secondary lib-kind is-active" data-kind="image">Image</button>
      <button type="button" class="btn secondary lib-kind" data-kind="tour">360° tour</button>
      <button type="button" class="btn secondary lib-kind" data-kind="model">3D model</button>
    </div>
  </div>

  <div class="field">
    <label>Title</label>
    <input type="text" id="lib-title" maxlength="200" placeholder="e.g. Living room — main view">
  </div>

  <!-- IMAGE mode: simple file upload -->
  <div class="lib-mode" data-mode="image">
    <div class="field">
      <label>Image file (JPG/PNG/WebP, max 25 MB)</label>
      <input type="file" id="lib-img-file" accept="image/jpeg,image/png,image/webp">
      <div class="muted" id="lib-img-status" style="margin-top: 6px; font-size: 12px;"></div>
      <input type="hidden" id="lib-image-url" value="">
    </div>
  </div>

  <!-- TOUR / MODEL mode: bundle upload OR URL paste -->
  <?php foreach (['tour', 'model'] as $k):
    $label = $k === 'tour' ? '360° tour' : '3D model';
  ?>
    <div class="lib-mode" data-mode="<?= $k ?>" hidden>
      <div class="field">
        <label>Source</label>
        <div style="display: flex; gap: 6px;">
          <button type="button" class="btn secondary lib-source is-active" data-kind="<?= $k ?>" data-source="bundle">Upload folder</button>
          <button type="button" class="btn secondary lib-source"           data-kind="<?= $k ?>" data-source="url">Paste iframe URL</button>
        </div>
      </div>

      <div class="lib-source-panel" data-kind="<?= $k ?>" data-source="bundle">
        <div class="field">
          <label>Folder (must include an HTML entry point — index.html ideally)</label>
          <input type="file" class="lib-bundle-input" data-kind="<?= $k ?>" webkitdirectory directory multiple>
          <div class="muted lib-bundle-status" data-kind="<?= $k ?>" style="margin-top: 6px; font-size: 12px;"></div>
          <select class="lib-entry-pick" data-kind="<?= $k ?>" hidden style="margin-top: 8px;"></select>
        </div>
      </div>

      <div class="lib-source-panel" data-kind="<?= $k ?>" data-source="url" hidden>
        <div class="field">
          <label>Iframe URL</label>
          <input type="url" class="lib-url-input" data-kind="<?= $k ?>" maxlength="500"
                 placeholder="<?= $k === 'tour' ? 'https://...index.html' : 'https://sketchfab.com/.../embed' ?>">
        </div>
      </div>

      <input type="hidden" class="lib-iframe-final" data-kind="<?= $k ?>" value="">

      <div class="field">
        <label>Thumbnail (optional)</label>
        <input type="file" class="lib-thumb-input" data-kind="<?= $k ?>" accept="image/jpeg,image/png,image/webp">
        <div class="muted lib-thumb-status" data-kind="<?= $k ?>" style="margin-top: 6px; font-size: 12px;"></div>
        <input type="hidden" class="lib-thumb-url" data-kind="<?= $k ?>" value="">
      </div>
    </div>
  <?php endforeach; ?>

  <div class="actions">
    <button class="btn ember" type="button" id="lib-add-btn">Add to library</button>
  </div>
  <div class="muted" id="lib-add-status" style="margin-top: 8px; font-size: 12px;"></div>
</div>

<h3>Library</h3>
<?php if (empty($items)): ?>
  <div class="note">Nothing yet. Add the first item above.</div>
<?php else: ?>
  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px;">
    <?php foreach ($items as $it):
      $thumb = $it['thumbnail_url'] ?: $it['image_url'] ?: '';
    ?>
      <div style="border: 1px solid var(--rule); border-radius: 4px; overflow: hidden; background: #fff;">
        <div style="aspect-ratio: 4/3; background-color: #cbb79a; background-size: cover; background-position: center;
                    <?= $thumb ? 'background-image: url(\'' . htmlspecialchars($thumb) . '\');' : '' ?>"></div>
        <div style="padding: 10px 12px;">
          <div style="font-size: 13px; font-weight: 600;"><?= htmlspecialchars($it['title']) ?></div>
          <div class="muted" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em;">
            <?= htmlspecialchars($it['kind']) ?> · #<?= (int)$it['id'] ?>
          </div>
          <button type="button" class="btn warn lib-del" data-id="<?= (int)$it['id'] ?>" data-title="<?= htmlspecialchars($it['title']) ?>"
                  style="padding: 3px 8px; font-size: 11px; margin-top: 8px;">Delete</button>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
<?php endif; ?>

<script src="/admin/assets/library.js"></script>
<script>
window.__PP_CSRF = <?= json_encode(csrf_token()) ?>;
window.__PP_LIBRARY_INIT();
</script>
