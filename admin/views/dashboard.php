<?php /** @var array $studies */ /** @var array $config */ ?>
<h2>Case studies</h2>

<p class="muted">
  <?= count($studies['studies'] ?? []) ?> entries in
  <code>data/case-studies.json</code> on
  <code><?= htmlspecialchars($config['github_branch'] ?? 'main') ?></code>.
</p>

<?php if (empty($studies['studies'])): ?>
  <div class="note">No case studies yet. <a href="/admin/new">Publish the first one.</a></div>
<?php else: ?>
  <table>
    <thead>
      <tr>
        <th>Title</th>
        <th>Client</th>
        <th>Year</th>
        <th>Slug</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
    <?php foreach ($studies['studies'] as $s): ?>
      <tr>
        <td><strong><?= htmlspecialchars($s['title']) ?></strong></td>
        <td><?= htmlspecialchars($s['client']) ?></td>
        <td><?= htmlspecialchars($s['year']) ?></td>
        <td><code><?= htmlspecialchars($s['slug']) ?></code></td>
        <td style="text-align: right;">
          <a href="/admin/edit/<?= htmlspecialchars($s['slug']) ?>">Edit</a> ·
          <form method="post" action="/admin/delete/<?= htmlspecialchars($s['slug']) ?>" style="display:inline" onsubmit="return confirm('Delete this case study? This will trigger a rebuild.');">
            <?= csrf_input() ?>
            <button class="btn warn" type="submit" style="padding: 2px 8px; font-size: 12px;">Delete</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
<?php endif; ?>

<div class="actions">
  <a class="btn ember" href="/admin/new">+ New case study</a>
</div>
