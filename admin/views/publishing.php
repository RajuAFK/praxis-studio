<?php
/** @var ?string $slug */
$status = $_SESSION['just_published_status'] ?? 'draft';
$isPublished = $status === 'published';
?>

<h2><?= $isPublished ? 'Publishing…' : 'Saving draft…' ?></h2>

<div class="note ok" style="margin-bottom: 20px;">
  <?php if ($isPublished): ?>
    Published — your changes are committed to GitHub and a rebuild is running.
  <?php else: ?>
    Saved as draft — committed to GitHub and a rebuild is running.
    The page will be reachable at the preview URL but excluded from the public listing and search engines.
  <?php endif; ?>
</div>

<p>
  GitHub Actions typically finishes in ~90 seconds.
  Then Hostinger pulls the new build (~30 more seconds).
</p>

<?php if ($slug): ?>
  <p>
    <?= $isPublished ? 'Live URL' : 'Preview URL' ?> when the build finishes:<br>
    <a href="https://praxivision.com/case-studies/<?= htmlspecialchars($slug) ?>/" target="_blank">
      https://praxivision.com/case-studies/<?= htmlspecialchars($slug) ?>/
    </a>
  </p>
  <?php if (!$isPublished): ?>
    <p class="muted">
      The draft renders with a "DRAFT PREVIEW" banner and a <code>noindex</code> meta tag.
      Click <strong>Publish</strong> on the edit page when you're ready to go public.
    </p>
  <?php endif; ?>
<?php endif; ?>

<p class="muted">
  This page does not auto-refresh — refresh the URL above in ~2 minutes.
</p>

<div class="actions">
  <a class="btn secondary" href="/admin/dashboard">Back to dashboard</a>
  <?php if ($slug): ?>
    <a class="btn" href="/admin/edit/<?= htmlspecialchars($slug) ?>">Keep editing</a>
  <?php endif; ?>
</div>
