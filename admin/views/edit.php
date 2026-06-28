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
?>

<h2><?= $isNew ? 'New case study' : 'Edit: ' . htmlspecialchars($s['title']) ?></h2>

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
      </div>
    <?php endforeach; ?>
  </div>
  <button type="button" class="btn secondary" onclick="addPlate()">+ Add plate</button>

  <h3>Outcome</h3>
  <div class="field">
    <label>Outcome line</label>
    <textarea name="outcomeLede"><?= htmlspecialchars($s['outcomeLede'] ?? '') ?></textarea>
  </div>

  <div class="actions">
    <button class="btn ember" type="submit">
      <?= $isNew ? 'Publish' : 'Update' ?> &nbsp;→
    </button>
    <a class="btn secondary" href="/admin/dashboard">Cancel</a>
  </div>
  <p class="muted" style="margin-top: 10px;">
    Publishing commits to GitHub and triggers a rebuild. Live in ~2 minutes.
  </p>
</form>

<script>
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
