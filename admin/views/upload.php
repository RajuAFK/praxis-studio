<?php
/**
 * Top-level content upload — non-case-study archive content.
 *
 *   Photography → multi-image, each lands at portfolio/Photography/{title}/{file}
 *   3D Model    → one GLB + optional cover, at portfolio/3D Models/{title}/
 *   VR tour     → folder upload (webkitdirectory) at portfolio/Praxis VRs/{title}/
 *   Gigapan     → folder upload at portfolio/Gigapans/{title}/
 *
 * Uploads go to R2 directly. After upload, on the NEXT build the live R2
 * listing in CI picks them up — they appear in the archive automatically.
 * No commit needed for image-category uploads (R2 IS the source of truth).
 */
/** @var array $config */
?>

<h2>Upload new content</h2>
<p class="muted">
  Pick a category, upload, you're done. The site rebuild picks it up on its
  next deploy (~2 minutes after a case study save, or immediately for the
  next CI run).
</p>

<div class="rowset">
  <div class="field">
    <label>Category</label>
    <div id="up-cat-pick" style="display: flex; gap: 8px; flex-wrap: wrap;">
      <button type="button" class="btn secondary up-cat is-active" data-cat="photography">Photography</button>
      <button type="button" class="btn secondary up-cat"           data-cat="3d">3D model (GLB)</button>
      <button type="button" class="btn secondary up-cat"           data-cat="vr">360° tour (folder)</button>
      <button type="button" class="btn secondary up-cat"           data-cat="gigapan">Gigapan (folder)</button>
    </div>
  </div>

  <div class="field">
    <label>Title <span class="muted">(becomes the folder name on R2)</span></label>
    <input type="text" id="up-title" maxlength="200" placeholder="e.g. Hampi Ruins — South Plinth">
  </div>

  <!-- PHOTOGRAPHY MODE -->
  <div class="up-mode" data-mode="photography">
    <div class="field">
      <label>Photos (multi-select JPG/PNG/WebP)</label>
      <input type="file" id="up-photo-files" accept="image/jpeg,image/png,image/webp" multiple>
      <div class="muted" id="up-photo-status" style="margin-top: 6px; font-size: 12px;"></div>
    </div>
  </div>

  <!-- 3D MODE -->
  <div class="up-mode" data-mode="3d" hidden>
    <div class="field">
      <label>GLB file</label>
      <input type="file" id="up-glb-file" accept=".glb,.gltf">
      <div class="muted" id="up-glb-status" style="margin-top: 6px; font-size: 12px;"></div>
    </div>
    <div class="field">
      <label>Cover image (optional, recommended)</label>
      <input type="file" id="up-glb-cover" accept="image/jpeg,image/png,image/webp">
      <div class="muted" id="up-glb-cover-status" style="margin-top: 6px; font-size: 12px;"></div>
    </div>
  </div>

  <!-- VR + GIGAPAN MODE (same shape) -->
  <?php foreach (['vr' => 'Praxis VRs', 'gigapan' => 'Gigapans'] as $cat => $folder): ?>
    <div class="up-mode" data-mode="<?= $cat ?>" hidden>
      <div class="field">
        <label>Folder <span class="muted">(must include index.html or another HTML entry point — desktop Chrome/Firefox/Edge only)</span></label>
        <input type="file" class="up-folder-input" data-cat="<?= $cat ?>" webkitdirectory directory multiple>
        <div class="muted up-folder-status" data-cat="<?= $cat ?>" style="margin-top: 6px; font-size: 12px;"></div>
        <select class="up-folder-entry" data-cat="<?= $cat ?>" hidden style="margin-top: 8px;"></select>
        <p class="muted" style="font-size: 12px; margin-top: 6px;">
          Will upload to <code>portfolio/<?= $folder ?>/{title}/...</code>.
          Mobile Safari does not support folder upload — use a desktop browser.
        </p>
      </div>
    </div>
  <?php endforeach; ?>

  <div class="actions">
    <button class="btn ember" type="button" id="up-go-btn">Start upload</button>
    <a class="btn secondary" href="/admin/dashboard">Cancel</a>
  </div>
  <div class="muted" id="up-go-status" style="margin-top: 8px; font-size: 12px;"></div>
</div>

<script src="/admin/assets/library.js"></script>
<script>
(function () {
  const PPAdmin = window.PPAdmin;
  let currentCat = 'photography';
  const titleEl  = document.getElementById('up-title');
  const goStatus = document.getElementById('up-go-status');

  document.querySelectorAll('.up-cat').forEach((b) => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.up-cat').forEach((x) => x.classList.remove('is-active'));
      b.classList.add('is-active');
      currentCat = b.dataset.cat;
      document.querySelectorAll('.up-mode').forEach((m) => {
        m.hidden = m.dataset.mode !== currentCat;
      });
    });
  });

  function safeTitleSlug() {
    const t = (titleEl.value || '').trim();
    if (!t) return null;
    return t.replace(/[^A-Za-z0-9 _.-]+/g, '').slice(0, 120);
  }

  // Map UI cat → R2 prefix base
  function prefixFor(cat, titleFolder) {
    switch (cat) {
      case 'photography': return `portfolio/Photography/${titleFolder}`;
      case '3d':          return `portfolio/3D Models/${titleFolder}`;
      case 'vr':          return `portfolio/Praxis VRs/${titleFolder}`;
      case 'gigapan':     return `portfolio/Gigapans/${titleFolder}`;
    }
  }

  document.getElementById('up-go-btn').addEventListener('click', async () => {
    const titleFolder = safeTitleSlug();
    if (!titleFolder) { goStatus.textContent = 'Title required.'; return; }
    const prefix = prefixFor(currentCat, titleFolder);

    try {
      if (currentCat === 'photography') {
        const inp = document.getElementById('up-photo-files');
        const stat = document.getElementById('up-photo-status');
        if (!inp.files || !inp.files.length) { goStatus.textContent = 'Pick at least one image.'; return; }
        let done = 0;
        for (const f of inp.files) {
          const safe = f.name.replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 200) || `image-${done}.jpg`;
          stat.textContent = `Uploading ${f.name}…`;
          await PPAdmin.uploadFile(prefix, safe, f, (loaded) => {
            const pct = Math.round((loaded / f.size) * 100);
            stat.textContent = `Uploading ${f.name}… ${pct}% (${done + 1}/${inp.files.length})`;
          });
          done++;
        }
        stat.textContent = `✓ ${done} images uploaded.`;
        goStatus.textContent = '✓ Done. They appear in /archive/photography/ after the next build.';
      }

      else if (currentCat === '3d') {
        const glb = document.getElementById('up-glb-file');
        const cov = document.getElementById('up-glb-cover');
        const glbStat = document.getElementById('up-glb-status');
        if (!glb.files || !glb.files[0]) { goStatus.textContent = 'Pick a GLB file.'; return; }
        const f = glb.files[0];
        glbStat.textContent = `Uploading ${f.name}…`;
        await PPAdmin.uploadFile(prefix, f.name.replace(/[^A-Za-z0-9._-]+/g, '-'), f, (loaded) => {
          glbStat.textContent = `Uploading ${f.name}… ${Math.round((loaded / f.size) * 100)}%`;
        });
        glbStat.textContent = `✓ ${f.name}`;
        if (cov.files && cov.files[0]) {
          const covStat = document.getElementById('up-glb-cover-status');
          const c = cov.files[0];
          covStat.textContent = `Uploading cover…`;
          await PPAdmin.uploadFile(prefix, 'cover-' + c.name.replace(/[^A-Za-z0-9._-]+/g, '-'), c);
          covStat.textContent = `✓ cover uploaded`;
        }
        goStatus.textContent = '✓ Done. The model appears in /archive/3d/ after the next build.';
      }

      else if (currentCat === 'vr' || currentCat === 'gigapan') {
        const input = document.querySelector(`.up-folder-input[data-cat="${currentCat}"]`);
        const stat  = document.querySelector(`.up-folder-status[data-cat="${currentCat}"]`);
        const pick  = document.querySelector(`.up-folder-entry[data-cat="${currentCat}"]`);
        if (!input.files || !input.files.length) { goStatus.textContent = 'Pick a folder.'; return; }
        stat.textContent = `Uploading ${input.files.length} files…`;
        const uploaded = await PPAdmin.uploadFolder(prefix, input.files, (p) => {
          const pct = p.totalBytes > 0 ? Math.round(p.loadedBytes / p.totalBytes * 100) : 0;
          stat.textContent = `Uploading… ${pct}% (${p.completedFiles}/${p.totalFiles})`;
        });
        const { entry, candidates } = PPAdmin.pickEntry(uploaded);
        if (!entry) {
          stat.textContent = '✗ No .html found in folder — upload aborted.';
          goStatus.textContent = 'Folder needs an HTML entry point (index.html ideally).';
          return;
        }
        if (candidates.length > 1) {
          pick.hidden = false;
          pick.innerHTML = '';
          for (const c of candidates) {
            const o = document.createElement('option');
            o.value = c.url; o.textContent = c.relpath;
            if (c.url === entry) o.selected = true;
            pick.appendChild(o);
          }
        }
        stat.textContent = `✓ ${uploaded.length} files uploaded.`;
        const where = currentCat === 'vr' ? '/archive/vr/' : '/archive/gigapixel/';
        goStatus.textContent = `✓ Done. The piece appears in ${where} after the next build.`;
      }
    } catch (e) {
      goStatus.textContent = 'Upload failed: ' + e.message;
    }
  });
})();
</script>
