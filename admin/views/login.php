<?php /** @var ?string $error */ ?>
<div style="max-width: 360px; margin: 80px auto 0;">
  <h1 style="font-size: 20px; margin: 0 0 24px;">Praxivision · Admin</h1>

  <?php if ($error === 'bad'): ?>
    <div class="note error" style="margin-bottom: 16px;">Username or password is wrong.</div>
  <?php elseif ($error === 'locked'): ?>
    <div class="note error" style="margin-bottom: 16px;">Too many failed attempts. Try again in 15 minutes.</div>
  <?php endif; ?>

  <form method="post" action="/admin/">
    <?= csrf_input() ?>
    <div class="field">
      <label for="u">Email</label>
      <input type="email" id="u" name="username" autocomplete="email" required autofocus>
    </div>
    <div class="field">
      <label for="p">Password</label>
      <input type="password" id="p" name="password" autocomplete="current-password" required>
    </div>
    <button class="btn ember" type="submit">Log in</button>
  </form>
</div>
