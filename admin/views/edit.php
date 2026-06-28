<?php
/** @var ?array $study */
/** @var array $config */
$isNew = $study === null;
$s = $study ?? [
    'slug' => '', 'client' => '', 'title' => '', 'titleHead' => '', 'titleTail' => '',
    'year' => '', 'tag' => '', 'instruments' => '', 'summary' => '', 'lede' => '',
    'jobSummary' => '', 'outcomeLede' => '',
    'phasesHeader' => 'Four phases,', 'phasesHeaderAccent' => 'on site.',
    'platesHeader' => 'Selected', 'platesHeaderAccent' => 'spreads.',
    'platesIntro' => '',
    'hero' => ['plateId' => '', 'src' => '', 'position' => '50% 50%', 'alt' => '',
               'frameLabel' => '', 'frameCode' => 'PL.01', 'frameExposure' => '', 'frameScale' => 'cover'],
    'specs' => [['Client', ''], ['Year', ''], ['Scope', ''], ['Format', ''], ['Delivery', '']],
    'phases' => [
        ['n' => 'I',   'tail' => 'Brief',   'body' => ''],
        ['n' => 'II',  'tail' => 'Capture', 'body' => ''],
        ['n' => 'III', 'tail' => 'Edit',    'body' => ''],
        ['n' => 'IV',  'tail' => 'Deliver', 'body' => ''],
    ],
    'plates' => [],
];
$flash = $_SESSION['flash_error'] ?? null;
unset($_SESSION['flash_error']);

// Layout editor — section visibility + order. Stored on the record as
// sections[] = [{type, visible}]. Defaults applied if missing.
$SECTION_LABELS = [
    'job'     => 'The job · specs grid',
    'method'  => 'Method · phases',
    'plates'  => 'Plates · image grid',
    'outcome' => 'Outcome',
];
$currentSections = $s['sections'] ?? [
    ['type' => 'job',     'visible' => true],
    ['type' => 'method',  'visible' => true],
    ['type' => 'plates',  'visible' => true],
    ['type' => 'outcome', 'visible' => true],
];
$currentStatus = $s['status'] ?? 'draft';
?>

<h2>
  <?= $isNew ? 'New case study' : 'Edit: ' . htmlspecialchars($s['title']) ?>
  <?php if (!$isNew): ?>
    <span style="margin-left: 10px; font-size: 11px; letter-spacing: 0.2em; padding: 3px 8px; border-radius: 3px;
      background: <?= $currentStatus === 'published' ? 'var(--ok)' : '#888' ?>;
      color: #fff; vertical-align: middle;">
      <?= strtoupper($currentStatus) ?>
    </span>
  <?php endif; ?>
</h2>

<?php if ($flash): ?>
  <div class="note error" style="margin-bottom: 16px;"><?= htmlspecialchars($flash) ?></div>
<?php endif; ?>

<form method="post"
      action="<?= $isNew ? '/admin/new' : '/admin/edit/' . htmlspecialchars($s['slug']) ?>"
      enctype="multipart/form-data">
  <?= csrf_input() ?>

  <h3>Basics</h3>
  <div class="grid-2">
    <div class="field">
      <label>Title</label>
      <input type="text" name="title" value="<?= htmlspecialchars($s['title']) ?>" required>
    </div>
    <div class="field">
      <label>Client</label>
      <input type="text" name="client" value="<?= htmlspecialchars($s['client']) ?>" required>
    </div>
  </div>
  <div class="grid-2">
    <div class="field">
      <label>Title head <span class="muted">(e.g. "TTD")</span></label>
      <input type="text" name="titleHead" value="<?= htmlspecialchars($s['titleHead']) ?>">
    </div>
    <div class="field">
      <label>Title tail <span class="muted">(italic, e.g. "Calendar.")</span></label>
      <input type="text" name="titleTail" value="<?= htmlspecialchars($s['titleTail']) ?>">
    </div>
  </div>
  <div class="grid-2">
    <div class="field">
      <label>Year</label>
      <input type="text" name="year" value="<?= htmlspecialchars($s['year']) ?>" required>
    </div>
    <div class="field">
      <label>Tag <span class="muted">(e.g. "DEVOTIONAL · ANNUAL CALENDAR")</span></label>
      <input type="text" name="tag" value="<?= htmlspecialchars($s['tag']) ?>">
    </div>
  </div>
  <div class="field">
    <label>Instruments line <span class="muted">(shown in the list row)</span></label>
    <input type="text" name="instruments" value="<?= htmlspecialchars($s['instruments']) ?>">
  </div>
  <div class="field">
    <label>Summary <span class="muted">(1–2 sentences, shown in list + meta description)</span></label>
    <textarea name="summary" required><?= htmlspecialchars($s['summary']) ?></textarea>
  </div>
  <div class="field">
    <label>Lede <span class="muted">(top of detail page; falls back to summary if empty)</span></label>
    <textarea name="lede"><?= htmlspecialchars($s['lede'] ?? '') ?></textarea>
  </div>

  <h3>Hero image</h3>
  <div class="rowset">
    <?php if (!empty($s['hero']['src'])): ?>
      <p class="muted">Current: <code><?= htmlspecialchars($s['hero']['src']) ?></code></p>
      <input type="hidden" name="hero_existing_src" value="<?= htmlspecialchars($s['hero']['src']) ?>">
    <?php endif; ?>
    <div class="field">
      <label>Upload <span class="muted">(replaces existing; JPG/PNG/WebP, max 25 MB)</span></label>
      <input type="file" name="hero_image" accept="image/jpeg,image/png,image/webp">
      <div style="margin-top: 6px;">
        <button type="button" class="btn secondary cs-pick-archive" data-target="hero_existing_src" style="padding: 4px 10px; font-size: 12px;">
          Pick from archive →
        </button>
        <span class="muted" id="hero-pick-status" style="font-size: 12px; margin-left: 8px;"></span>
      </div>
    </div>
    <div class="grid-2">
      <div class="field">
        <label>Alt text</label>
        <input type="text" name="hero_alt" value="<?= htmlspecialchars($s['hero']['alt'] ?? '') ?>">
      </div>
      <div class="field">
        <label>Position <span class="muted">(e.g. "50% 50%")</span></label>
        <input type="text" name="hero_position" value="<?= htmlspecialchars($s['hero']['position'] ?? '50% 50%') ?>">
      </div>
    </div>
    <div class="grid-2">
      <div class="field">
        <label>Frame label</label>
        <input type="text" name="hero_frame_label" value="<?= htmlspecialchars($s['hero']['frameLabel'] ?? '') ?>">
      </div>
      <div class="field">
        <label>Frame code</label>
        <input type="text" name="hero_frame_code" value="<?= htmlspecialchars($s['hero']['frameCode'] ?? 'PL.01') ?>">
      </div>
    </div>
    <div class="grid-2">
      <div class="field">
        <label>Frame exposure</label>
        <input type="text" name="hero_frame_exposure" value="<?= htmlspecialchars($s['hero']['frameExposure'] ?? '') ?>">
      </div>
      <div class="field">
        <label>Frame scale</label>
        <input type="text" name="hero_frame_scale" value="<?= htmlspecialchars($s['hero']['frameScale'] ?? 'cover') ?>">
      </div>
    </div>
  </div>

  <h3>Specs <span class="muted">(key / value rows shown on the detail page)</span></h3>
  <div class="field">
    <label>Job summary <span class="muted">(headline above the specs grid)</span></label>
    <textarea name="jobSummary"><?= htmlspecialchars($s['jobSummary'] ?? '') ?></textarea>
  </div>
  <div id="specs">
    <?php foreach ($s['specs'] as [$k, $v]): ?>
      <div class="repeater-row spec-row">
        <input type="text" name="spec_key[]" placeholder="Key (e.g. Client)" value="<?= htmlspecialchars($k) ?>">
        <input type="text" name="spec_value[]" placeholder="Value" value="<?= htmlspecialchars($v) ?>">
        <button type="button" class="btn secondary" onclick="this.parentNode.remove()">−</button>
      </div>
    <?php endforeach; ?>
  </div>
  <button type="button" class="btn secondary"
          onclick="addRow('specs','spec-row','spec_key[]','spec_value[]')">+ Add spec</button>

  <h3>Phases</h3>
  <div class="grid-2">
    <div class="field">
      <label>Phases header</label>
      <input type="text" name="phasesHeader" value="<?= htmlspecialchars($s['phasesHeader'] ?? 'Four phases,') ?>">
    </div>
    <div class="field">
      <label>Phases header accent <span class="muted">(italic)</span></label>
      <input type="text" name="phasesHeaderAccent" value="<?= htmlspecialchars($s['phasesHeaderAccent'] ?? 'on site.') ?>">
    </div>
  </div>
  <div id="phases">
    <?php foreach ($s['phases'] as $p): ?>
      <div class="rowset">
        <div class="grid-2">
          <div class="field">
            <label>Roman numeral</label>
            <input type="text" name="phase_n[]" value="<?= htmlspecialchars($p['n']) ?>">
          </div>
          <div class="field">
            <label>Phase name (italic accent)</label>
            <input type="text" name="phase_tail[]" value="<?= htmlspecialchars($p['tail']) ?>">
          </div>
        </div>
        <div class="field">
          <label>Body</label>
          <textarea name="phase_body[]"><?= htmlspecialchars($p['body']) ?></textarea>
        </div>
      </div>
    <?php endforeach; ?>
  </div>

  <h3>Plates <span class="muted">(image grid on the detail page)</span></h3>
  <div class="grid-2">
    <div class="field">
      <label>Plates header</label>
      <input type="text" name="platesHeader" value="<?= htmlspecialchars($s['platesHeader'] ?? 'Selected') ?>">
    </div>
    <div class="field">
      <label>Plates header accent</label>
      <input type="text" name="platesHeaderAccent" value="<?= htmlspecialchars($s['platesHeaderAccent'] ?? 'spreads.') ?>">
    </div>
  </div>
  <div class="field">
    <label>Intro paragraph</label>
    <textarea name="platesIntro"><?= htmlspecialchars($s['platesIntro'] ?? '') ?></textarea>
  </div>
  <div id="plates">
    <?php foreach ($s['plates'] as $i => $p): ?>
      <div class="rowset">
        <?php if (!empty($p['src'])): ?>
          <p class="muted">Current: <code><?= htmlspecialchars($p['src']) ?></code></p>
          <input type="hidden" name="plate_existing_src[]" value="<?= htmlspecialchars($p['src']) ?>">
        <?php else: ?>
          <input type="hidden" name="plate_existing_src[]" value="">
        <?php endif; ?>
        <div class="repeater-row plate-row">
          <input type="text"  name="plate_label[]"    placeholder="Label (e.g. PL.01 · COVER)" value="<?= htmlspecialchars($p['label'] ?? '') ?>">
          <input type="text"  name="plate_caption[]"  placeholder="Caption" value="<?= htmlspecialchars($p['caption'] ?? '') ?>">
          <input type="text"  name="plate_position[]" placeholder="Position" value="<?= htmlspecialchars($p['position'] ?? '50% 50%') ?>">
          <input type="file"  name="plate_image[]"    accept="image/jpeg,image/png,image/webp">
          <button type="button" class="btn secondary" onclick="this.closest('.rowset').remove()">−</button>
        </div>
        <div style="margin-top: 4px;">
          <button type="button" class="btn secondary cs-pick-archive" data-target="plate" data-idx="<?= $i ?>" style="padding: 4px 10px; font-size: 12px;">
            Pick from archive →
          </button>
          <span class="muted plate-pick-status" style="font-size: 12px; margin-left: 8px;"></span>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
  <button type="button" class="btn secondary" onclick="addPlate()">+ Add plate</button>

  <h3>Outcome</h3>
  <div class="field">
    <label>Outcome line</label>
    <textarea name="outcomeLede"><?= htmlspecialchars($s['outcomeLede'] ?? '') ?></textarea>
  </div>

  <h3>Page layout <span class="muted">(toggle and reorder sections)</span></h3>
  <div class="note" style="margin-bottom: 12px;">
    Hero (title + lede + cover image) is always shown first.
    Use the up/down buttons to reorder these four sections; uncheck to hide one entirely.
  </div>
  <div id="sections" class="rowset">
    <?php foreach ($currentSections as $sec):
      $type = $sec['type'];
      if (!isset($SECTION_LABELS[$type])) continue;
      $visible = !empty($sec['visible']);
    ?>
      <div class="section-row" data-type="<?= htmlspecialchars($type) ?>"
           style="display: grid; grid-template-columns: auto 1fr auto auto; gap: 14px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--rule);">
        <input type="hidden" name="section_type[]" value="<?= htmlspecialchars($type) ?>">
        <label style="display: flex; align-items: center; gap: 8px; margin: 0;">
          <input type="checkbox" name="section_visible[]" value="<?= htmlspecialchars($type) ?>" <?= $visible ? 'checked' : '' ?>>
          <span class="muted" style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Visible</span>
        </label>
        <div style="font-weight: 500;"><?= htmlspecialchars($SECTION_LABELS[$type]) ?></div>
        <button type="button" class="btn secondary section-up"   style="padding: 4px 10px;">↑</button>
        <button type="button" class="btn secondary section-down" style="padding: 4px 10px;">↓</button>
      </div>
    <?php endforeach; ?>
  </div>

  <div class="actions">
    <button class="btn secondary" type="submit" name="_action" value="draft">
      Save as draft
    </button>
    <button class="btn ember" type="submit" name="_action" value="publish">
      <?= $currentStatus === 'published' ? 'Update (stay published)' : 'Publish' ?> &nbsp;→
    </button>
    <a class="btn secondary" href="/admin/dashboard">Cancel</a>
  </div>
  <p class="muted" style="margin-top: 10px;">
    Both actions commit to GitHub and trigger a rebuild. Drafts get a noindex preview URL
    that isn't listed publicly. Publishing makes it live and indexable. ~2 minutes either way.
  </p>
</form>

<script src="/admin/assets/library.js"></script>
<script>
// "Pick from archive" — works for any button with data-target = name of the hidden field.
// For the hero, target is "hero_existing_src". For plates, we wire it dynamically since the
// hidden fields are array-indexed.
(function () {
  const slug = <?= json_encode($s['slug'] ?? '') ?>;
  document.querySelectorAll('.cs-pick-archive').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      const idx    = btn.dataset.idx;
      PPAdmin.openPicker({
        slug,
        onPick: (url) => {
          if (target === 'hero_existing_src') {
            let h = document.querySelector('input[name="hero_existing_src"]');
            if (!h) {
              h = document.createElement('input');
              h.type = 'hidden'; h.name = 'hero_existing_src';
              btn.closest('.rowset').appendChild(h);
            }
            h.value = url;
            document.getElementById('hero-pick-status').textContent = '✓ ' + url.split('/').slice(-2).join('/');
          } else if (target === 'plate' && idx != null) {
            const wrap = btn.closest('.rowset');
            const existing = wrap.querySelectorAll('input[name="plate_existing_src[]"]')[0];
            if (existing) existing.value = url;
            const label = wrap.querySelector('.plate-pick-status');
            if (label) label.textContent = '✓ ' + url.split('/').slice(-2).join('/');
          }
        },
      });
    });
  });
})();

// Layout editor — up/down reordering
document.querySelectorAll('.section-up').forEach(btn => {
  btn.addEventListener('click', () => {
    const row = btn.closest('.section-row');
    if (row && row.previousElementSibling && row.previousElementSibling.classList.contains('section-row')) {
      row.parentNode.insertBefore(row, row.previousElementSibling);
    }
  });
});
document.querySelectorAll('.section-down').forEach(btn => {
  btn.addEventListener('click', () => {
    const row = btn.closest('.section-row');
    if (row && row.nextElementSibling && row.nextElementSibling.classList.contains('section-row')) {
      row.parentNode.insertBefore(row.nextElementSibling, row);
    }
  });
});

function addRow(containerId, rowClass, ...names) {
  const el = document.getElementById(containerId);
  const row = document.createElement('div');
  row.className = 'repeater-row ' + rowClass;
  row.innerHTML = names.map(n => `<input type="text" name="${n}">`).join('') +
    '<button type="button" class="btn secondary" onclick="this.parentNode.remove()">−</button>';
  el.appendChild(row);
}
function addPlate() {
  const el = document.getElementById('plates');
  const wrap = document.createElement('div');
  wrap.className = 'rowset';
  wrap.innerHTML = `
    <input type="hidden" name="plate_existing_src[]" value="">
    <div class="repeater-row plate-row">
      <input type="text" name="plate_label[]"    placeholder="Label (e.g. PL.01 · COVER)">
      <input type="text" name="plate_caption[]"  placeholder="Caption">
      <input type="text" name="plate_position[]" placeholder="Position" value="50% 50%">
      <input type="file" name="plate_image[]"    accept="image/jpeg,image/png,image/webp">
      <button type="button" class="btn secondary" onclick="this.closest('.rowset').remove()">−</button>
    </div>`;
  el.appendChild(wrap);
}
</script>
