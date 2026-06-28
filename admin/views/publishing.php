<?php /** @var ?string $slug */ ?>
<h2>Publishing…</h2>

<div class="note ok" style="margin-bottom: 20px;">
  Your changes are committed to GitHub and a rebuild is running.
</div>

<p>
  GitHub Actions typically finishes in ~90 seconds.
  Then Hostinger pulls the new build (~30 more seconds).
</p>

<?php if ($slug): ?>
  <p>
    Live URL when it's ready:<br>
    <a href="https://praxivision.com/case-studies/<?= htmlspecialchars($slug) ?>/" target="_blank">
      https://praxivision.com/case-studies/<?= htmlspecialchars($slug) ?>/
    </a>
  </p>
<?php endif; ?>

<p class="muted">
  This page does not auto-refresh — refresh the live URL above in ~2 minutes.
</p>

<div class="actions">
  <a class="btn secondary" href="/admin/dashboard">Back to dashboard</a>
</div>
