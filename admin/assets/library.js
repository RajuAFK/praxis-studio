/**
 * Private library admin page — kind picker, R2 uploads, save handler.
 *
 * Also exposes window.PPAdmin.uploadFile and window.PPAdmin.uploadFolder
 * for reuse by the case-study editor + the category upload form.
 *
 * Depends on:
 *   /admin/api/r2-upload-url.php          (presigned PUTs)
 *   /admin/api/save-library-item.php      (library save)
 *   /admin/api/delete-library-item.php    (library delete)
 */
(function () {
  const PPAdmin = window.PPAdmin = window.PPAdmin || {};

  /** Get a presigned PUT URL for {prefix}/{filename}. */
  async function presign(prefix, filename) {
    const q = new URLSearchParams({ prefix, filename });
    const r = await fetch('/admin/api/r2-upload-url.php?' + q, { credentials: 'same-origin' });
    if (r.status === 401) throw new Error('Session expired — sign in again at /admin/');
    if (!r.ok) throw new Error('Presign failed (HTTP ' + r.status + ')');
    return r.json(); // { upload_url, public_url, expires_at }
  }
  PPAdmin.presign = presign;

  /** PUT a single file to R2 via XHR (gives us per-byte progress). */
  function putFile(url, file, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(e.loaded);
      };
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300)
        ? resolve() : reject(new Error('PUT failed: HTTP ' + xhr.status));
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.ontimeout = () => reject(new Error('Upload timed out'));
      xhr.timeout = 60 * 60 * 1000;
      xhr.open('PUT', url);
      if (file.type) xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  }
  PPAdmin.putFile = putFile;

  /** Upload one file to {prefix}/{filename}. Returns the public URL. */
  PPAdmin.uploadFile = async function (prefix, filename, file, onProgress) {
    const { upload_url, public_url } = await presign(prefix, filename);
    await putFile(upload_url, file, onProgress);
    return public_url;
  };

  /**
   * Upload a folder of files in parallel (4 at a time) under {prefix}/.
   * Each file's webkitRelativePath (minus the top folder) becomes the key.
   * Returns [{ relpath, url }, ...].
   */
  PPAdmin.uploadFolder = async function (prefix, files, onProgress) {
    const list = Array.from(files);
    const totalBytes = list.reduce((s, f) => s + f.size, 0);
    const perFile = new Map();
    const out = new Array(list.length);
    let nextIdx = 0, completed = 0, fatal = null;

    function report() {
      let summed = 0;
      perFile.forEach((v) => { summed += v; });
      onProgress && onProgress({
        loadedBytes: summed, totalBytes,
        completedFiles: completed, totalFiles: list.length,
      });
    }

    async function worker() {
      while (!fatal) {
        const i = nextIdx++;
        if (i >= list.length) return;
        const f = list[i];
        const relpath = f.webkitRelativePath
          ? f.webkitRelativePath.split('/').slice(1).join('/')
          : f.name;
        perFile.set(i, 0); report();
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const { upload_url, public_url } = await presign(prefix, relpath);
            await putFile(upload_url, f, (loaded) => { perFile.set(i, loaded); report(); });
            perFile.set(i, f.size); completed++; report();
            out[i] = { relpath, url: public_url };
            break;
          } catch (e) {
            if (attempt === 1 || /HTTP 401|HTTP 403|Session expired/.test(e.message)) {
              fatal = e;
              throw e;
            }
            await new Promise((r) => setTimeout(r, 800));
          }
        }
      }
    }
    await Promise.all([0, 1, 2, 3].map(worker));
    return out;
  };

  /** Pick the most likely entry .html in an uploaded folder. */
  PPAdmin.pickEntry = function (uploaded) {
    const htmls = uploaded.filter((u) => u.relpath.toLowerCase().endsWith('.html'));
    if (!htmls.length) return { entry: null, candidates: [] };
    const idxHit = htmls.find((u) => /(^|\/)index\.html$/i.test(u.relpath));
    return { entry: (idxHit || htmls[0]).url, candidates: htmls };
  };

  /** Folder name from the first file's webkitRelativePath. */
  PPAdmin.folderNameFromFiles = function (files, fallback) {
    const first = files && files[0];
    const name = first && first.webkitRelativePath
      ? first.webkitRelativePath.split('/')[0]
      : (fallback || 'bundle');
    return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '').slice(0, 120)
      || ('bundle-' + Date.now());
  };

  /** Random 12-hex unguessable prefix for private-library uploads. */
  PPAdmin.randomPrivateLibPrefix = function () {
    const hex = Array.from(crypto.getRandomValues(new Uint8Array(6)))
                     .map((b) => b.toString(16).padStart(2, '0')).join('');
    return 'private-lib/' + hex;
  };

  /* ----- archive picker (modal) -------------------------------------------- */

  /** List R2 objects + prefixes under {prefix}. */
  PPAdmin.listR2 = async function (prefix, delimiter = '/') {
    const q = new URLSearchParams({ prefix, max: '200' });
    if (delimiter) q.set('delimiter', delimiter);
    const r = await fetch('/admin/api/r2-list.php?' + q, { credentials: 'same-origin' });
    if (!r.ok) throw new Error('list failed (HTTP ' + r.status + ')');
    return r.json(); // { objects: [{key,size,last_modified,url}], prefixes: [...] }
  };

  /**
   * Open the archive picker modal.
   *
   * @param {object} opts
   * @param {string} opts.slug    - current case-study slug (for the "This case study" tab)
   * @param {function} opts.onPick - called with the picked URL string
   */
  PPAdmin.openPicker = function (opts) {
    const slug = opts && opts.slug || '';

    // Build the modal once and reuse
    let modal = document.getElementById('pp-picker-modal');
    if (modal) modal.remove();
    modal = document.createElement('div');
    modal.id = 'pp-picker-modal';
    modal.innerHTML = `
      <style>
        #pp-picker-modal {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.55);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        #pp-picker-modal .ppm-card {
          background: #fff; border-radius: 6px;
          width: 100%; max-width: 960px;
          max-height: calc(100vh - 48px);
          display: flex; flex-direction: column;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        #pp-picker-modal .ppm-head {
          padding: 14px 18px;
          border-bottom: 1px solid #ddd;
          display: flex; justify-content: space-between; align-items: center;
        }
        #pp-picker-modal .ppm-head h3 { margin: 0; font-size: 16px; }
        #pp-picker-modal .ppm-close {
          font: 18px/1 sans-serif; cursor: pointer;
          background: none; border: 0; padding: 4px 10px;
        }
        #pp-picker-modal .ppm-tabs {
          padding: 12px 18px 0; display: flex; gap: 6px; border-bottom: 1px solid #ddd;
        }
        #pp-picker-modal .ppm-tab {
          padding: 8px 14px; cursor: pointer;
          background: none; border: 0;
          font-size: 13px; color: #555;
          border-bottom: 2px solid transparent;
        }
        #pp-picker-modal .ppm-tab.is-active {
          color: #d96a2a; border-bottom-color: #d96a2a;
        }
        #pp-picker-modal .ppm-bread {
          padding: 8px 18px; font-size: 12px; color: #777;
          font-family: ui-monospace, monospace;
        }
        #pp-picker-modal .ppm-grid {
          flex: 1; overflow: auto; padding: 12px 18px 18px;
          display: grid; gap: 12px;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        }
        #pp-picker-modal .ppm-item {
          border: 1px solid #ddd; border-radius: 4px;
          padding: 8px; cursor: pointer; background: #fff;
          display: flex; flex-direction: column; gap: 6px;
          font-size: 11px; color: #333; word-break: break-all;
          transition: border-color 120ms;
        }
        #pp-picker-modal .ppm-item:hover { border-color: #d96a2a; }
        #pp-picker-modal .ppm-thumb {
          aspect-ratio: 1; background: #f0eadc no-repeat center/cover;
          border-radius: 3px;
          display: flex; align-items: center; justify-content: center;
          font: 11px/1 ui-monospace, monospace;
          color: #888; text-transform: uppercase; letter-spacing: 0.12em;
        }
        #pp-picker-modal .ppm-folder { background: #fff8ee; }
        #pp-picker-modal .ppm-loading {
          padding: 32px; text-align: center; color: #888;
        }
      </style>
      <div class="ppm-card">
        <div class="ppm-head">
          <h3>Pick from archive</h3>
          <button type="button" class="ppm-close" aria-label="Close">×</button>
        </div>
        <div class="ppm-tabs">
          <button type="button" class="ppm-tab is-active" data-prefix="portfolio/">Archive</button>
          <button type="button" class="ppm-tab" data-prefix="case-studies/${slug}/">This case study</button>
        </div>
        <div class="ppm-bread"></div>
        <div class="ppm-grid"><div class="ppm-loading">Loading…</div></div>
      </div>
    `;
    document.body.appendChild(modal);

    let currentPrefix = 'portfolio/';
    const gridEl  = modal.querySelector('.ppm-grid');
    const breadEl = modal.querySelector('.ppm-bread');

    function close() { modal.remove(); }
    modal.querySelector('.ppm-close').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    function setBreadcrumb(p) {
      breadEl.textContent = p || '/';
    }
    function isImage(key) {
      return /\.(jpe?g|png|webp|gif)$/i.test(key);
    }

    async function load(prefix) {
      currentPrefix = prefix;
      setBreadcrumb(prefix);
      gridEl.innerHTML = '<div class="ppm-loading">Loading…</div>';
      try {
        const data = await PPAdmin.listR2(prefix, '/');
        const tiles = [];

        // Up-one-level tile
        if (prefix.split('/').filter(Boolean).length > 1) {
          const parent = prefix.replace(/[^\/]+\/?$/, '');
          tiles.push({ kind: 'up', label: '↑ Up', prefix: parent });
        }

        for (const p of data.prefixes || []) {
          const label = p.replace(prefix, '').replace(/\/$/, '');
          tiles.push({ kind: 'folder', label, prefix: p });
        }
        for (const o of data.objects || []) {
          if (!o.key) continue;
          // skip "directory-marker" entries
          if (o.key === prefix) continue;
          tiles.push({ kind: 'object', label: o.key.replace(prefix, ''), url: o.url, key: o.key });
        }

        if (!tiles.length) {
          gridEl.innerHTML = '<div class="ppm-loading">Empty.</div>';
          return;
        }

        gridEl.innerHTML = '';
        for (const t of tiles) {
          const el = document.createElement('div');
          el.className = 'ppm-item';
          if (t.kind === 'up') {
            el.innerHTML = `<div class="ppm-thumb ppm-folder">↑</div><div>Up</div>`;
            el.addEventListener('click', () => load(t.prefix));
          } else if (t.kind === 'folder') {
            el.innerHTML = `<div class="ppm-thumb ppm-folder">DIR</div><div>${t.label}/</div>`;
            el.addEventListener('click', () => load(t.prefix));
          } else if (t.kind === 'object') {
            if (isImage(t.url)) {
              el.innerHTML = `<div class="ppm-thumb" style="background-image:url('${t.url.replace(/'/g, '%27')}');"></div><div>${t.label}</div>`;
            } else if (/\.html?$/i.test(t.label)) {
              el.innerHTML = `<div class="ppm-thumb">HTML</div><div>${t.label}</div>`;
            } else if (/\.(glb|gltf)$/i.test(t.label)) {
              el.innerHTML = `<div class="ppm-thumb">3D</div><div>${t.label}</div>`;
            } else {
              el.innerHTML = `<div class="ppm-thumb">FILE</div><div>${t.label}</div>`;
            }
            el.addEventListener('click', () => { opts.onPick(t.url); close(); });
          }
          gridEl.appendChild(el);
        }
      } catch (e) {
        gridEl.innerHTML = '<div class="ppm-loading">Error: ' + (e.message || e) + '</div>';
      }
    }

    modal.querySelectorAll('.ppm-tab').forEach((t) => {
      t.addEventListener('click', () => {
        modal.querySelectorAll('.ppm-tab').forEach((x) => x.classList.remove('is-active'));
        t.classList.add('is-active');
        load(t.dataset.prefix);
      });
    });

    load('portfolio/');
  };

  /* ----- private-library page glue ----- */

  window.__PP_LIBRARY_INIT = function () {
    const CSRF = window.__PP_CSRF;
    let currentKind = 'image';
    const titleEl    = document.getElementById('lib-title');
    const statusEl   = document.getElementById('lib-add-status');
    const modes      = document.querySelectorAll('.lib-mode');
    const activeSrc  = { tour: 'bundle', model: 'bundle' };

    // Kind picker
    document.querySelectorAll('.lib-kind').forEach((b) => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.lib-kind').forEach((x) => x.classList.remove('is-active'));
        b.classList.add('is-active');
        currentKind = b.dataset.kind;
        modes.forEach((m) => { m.hidden = m.dataset.mode !== currentKind; });
      });
    });

    // Image upload
    const imgInput = document.getElementById('lib-img-file');
    const imgStat  = document.getElementById('lib-img-status');
    const imgUrlH  = document.getElementById('lib-image-url');
    imgInput && imgInput.addEventListener('change', async () => {
      if (!imgInput.files || !imgInput.files.length) return;
      const f = imgInput.files[0];
      const prefix = PPAdmin.randomPrivateLibPrefix();
      const safe = f.name.replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 200) || 'image.jpg';
      imgStat.textContent = `Uploading ${f.name}…`;
      try {
        const url = await PPAdmin.uploadFile(prefix, safe, f, (loaded) => {
          const pct = Math.round((loaded / f.size) * 100);
          imgStat.textContent = `Uploading ${f.name}… ${pct}%`;
        });
        imgUrlH.value = url;
        imgStat.textContent = `✓ ${f.name}`;
      } catch (e) {
        imgStat.textContent = 'Upload failed: ' + e.message;
      }
    });

    // Source picker (bundle vs URL) per kind
    document.querySelectorAll('.lib-source').forEach((btn) => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.kind;
        document.querySelectorAll(`.lib-source[data-kind="${k}"]`).forEach((x) => x.classList.remove('is-active'));
        btn.classList.add('is-active');
        activeSrc[k] = btn.dataset.source;
        document.querySelectorAll(`.lib-source-panel[data-kind="${k}"]`).forEach((p) => {
          p.hidden = p.dataset.source !== btn.dataset.source;
        });
        // Update the hidden -final field when switching to URL mode
        const finalEl = document.querySelector(`.lib-iframe-final[data-kind="${k}"]`);
        const urlEl   = document.querySelector(`.lib-url-input[data-kind="${k}"]`);
        if (btn.dataset.source === 'url' && urlEl) {
          finalEl.value = urlEl.value.trim();
        }
      });
    });
    document.querySelectorAll('.lib-url-input').forEach((el) => {
      el.addEventListener('input', () => {
        const k = el.dataset.kind;
        if (activeSrc[k] === 'url') {
          document.querySelector(`.lib-iframe-final[data-kind="${k}"]`).value = el.value.trim();
        }
      });
    });

    // Bundle upload (per kind)
    document.querySelectorAll('.lib-bundle-input').forEach((input) => {
      const k       = input.dataset.kind;
      const stat    = document.querySelector(`.lib-bundle-status[data-kind="${k}"]`);
      const pick    = document.querySelector(`.lib-entry-pick[data-kind="${k}"]`);
      const finalEl = document.querySelector(`.lib-iframe-final[data-kind="${k}"]`);
      input.addEventListener('change', async () => {
        if (!input.files || !input.files.length) return;
        pick.hidden = true;
        const prefix = PPAdmin.randomPrivateLibPrefix();
        stat.textContent = `Uploading ${input.files.length} files…`;
        try {
          const uploaded = await PPAdmin.uploadFolder(prefix, input.files, (p) => {
            const pct = p.totalBytes > 0 ? Math.round(p.loadedBytes / p.totalBytes * 100) : 0;
            stat.textContent = `Uploading… ${pct}% (${p.completedFiles}/${p.totalFiles})`;
          });
          const { entry, candidates } = PPAdmin.pickEntry(uploaded);
          if (!entry) {
            stat.textContent = '✗ No .html found in folder. Switch to "Paste iframe URL" instead.';
            finalEl.value = '';
            return;
          }
          finalEl.value = entry;
          if (candidates.length > 1) {
            pick.hidden = false;
            pick.innerHTML = '';
            for (const c of candidates) {
              const o = document.createElement('option');
              o.value = c.url; o.textContent = c.relpath;
              if (c.url === entry) o.selected = true;
              pick.appendChild(o);
            }
            pick.onchange = () => { finalEl.value = pick.value; };
          }
          stat.textContent = `✓ Uploaded ${uploaded.length} files.`;
        } catch (e) {
          stat.textContent = 'Upload failed: ' + e.message;
        }
      });
    });

    // Thumbnail upload (per kind)
    document.querySelectorAll('.lib-thumb-input').forEach((input) => {
      const k     = input.dataset.kind;
      const stat  = document.querySelector(`.lib-thumb-status[data-kind="${k}"]`);
      const urlH  = document.querySelector(`.lib-thumb-url[data-kind="${k}"]`);
      input.addEventListener('change', async () => {
        if (!input.files || !input.files.length) return;
        const f = input.files[0];
        const prefix = PPAdmin.randomPrivateLibPrefix();
        const safe = f.name.replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 200) || 'thumb.jpg';
        stat.textContent = `Uploading thumbnail…`;
        try {
          const url = await PPAdmin.uploadFile(prefix, safe, f, (loaded) => {
            stat.textContent = `Uploading thumbnail… ${Math.round((loaded / f.size) * 100)}%`;
          });
          urlH.value = url;
          stat.textContent = `✓ ${f.name}`;
        } catch (e) {
          stat.textContent = 'Upload failed: ' + e.message;
        }
      });
    });

    // Save button
    document.getElementById('lib-add-btn').addEventListener('click', async () => {
      const title = (titleEl.value || '').trim();
      if (!title) { statusEl.textContent = 'Title required.'; return; }
      const body = { kind: currentKind, title, csrf: CSRF };

      if (currentKind === 'image') {
        const url = imgUrlH.value;
        if (!url) { statusEl.textContent = 'Upload an image first.'; return; }
        body.image_url = url;
        body.thumbnail_url = url;
      } else {
        const iframe = (document.querySelector(`.lib-iframe-final[data-kind="${currentKind}"]`).value || '').trim();
        if (!iframe) {
          statusEl.textContent = activeSrc[currentKind] === 'bundle'
            ? 'Upload a folder first.' : 'Iframe URL required.';
          return;
        }
        body.iframe_url = iframe;
        const t = (document.querySelector(`.lib-thumb-url[data-kind="${currentKind}"]`).value || '').trim();
        if (t) body.thumbnail_url = t;
      }

      statusEl.textContent = 'Saving…';
      try {
        const r = await fetch('/admin/api/save-library-item.php', {
          method: 'POST', credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) {
          const f = j.fields ? ' (' + Object.values(j.fields).join('; ') + ')' : '';
          throw new Error((j.error || ('HTTP ' + r.status)) + f);
        }
        window.location.reload();
      } catch (e) {
        statusEl.textContent = 'Failed: ' + e.message;
      }
    });

    // Delete buttons
    document.querySelectorAll('.lib-del').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const title = btn.dataset.title;
        if (!confirm(`Delete "${title}" from the library? This cannot be undone.`)) return;
        btn.disabled = true;
        try {
          const r = await fetch('/admin/api/delete-library-item.php', {
            method: 'POST', credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: Number(btn.dataset.id), csrf: CSRF }),
          });
          const j = await r.json().catch(() => ({}));
          if (!r.ok) {
            if (j.error === 'in_use' && Array.isArray(j.pages)) {
              const list = j.pages.map((p) => '· ' + p.title + ' (/private/' + p.slug + '/)').join('\n');
              alert(`Can't delete — still used by:\n\n${list}\n\nRemove from each page first.`);
            } else {
              throw new Error(j.error || ('HTTP ' + r.status));
            }
            btn.disabled = false;
            return;
          }
          btn.closest('div[style*="border"]').remove();
        } catch (e) {
          alert('Delete failed: ' + e.message);
          btn.disabled = false;
        }
      });
    });
  };
})();
