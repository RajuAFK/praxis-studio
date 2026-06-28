<?php /** @var array $config */ ?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Praxivision Admin</title>
<style>
:root {
  --ink: #111;
  --ink-dim: #555;
  --rule: #ddd;
  --ember: #d96a2a;
  --paper: #fafafa;
  --warn: #b00020;
  --ok: #1d7a3a;
}
* { box-sizing: border-box; }
body {
  font: 15px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  background: var(--paper); color: var(--ink); margin: 0;
}
.shell { max-width: 980px; margin: 0 auto; padding: 32px 24px 96px; }
.bar { display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 1px solid var(--rule); margin-bottom: 32px; }
.bar h1 { font-size: 18px; margin: 0; font-weight: 600; letter-spacing: 0.04em; }
.bar .right { font-size: 13px; color: var(--ink-dim); }
.bar a { color: var(--ember); text-decoration: none; }
h2 { font-size: 16px; font-weight: 600; margin: 28px 0 10px; }
h3 { font-size: 14px; font-weight: 600; margin: 22px 0 8px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-dim); }
input, textarea, select, button {
  font: inherit; padding: 8px 10px;
  border: 1px solid var(--rule); border-radius: 4px;
  background: #fff; color: var(--ink);
}
input:focus, textarea:focus { outline: none; border-color: var(--ember); }
textarea { width: 100%; min-height: 80px; resize: vertical; }
input[type=text], input[type=email], input[type=password], input[type=file] { width: 100%; }
label { display: block; font-size: 13px; color: var(--ink-dim); margin-bottom: 4px; }
.field { margin-bottom: 14px; }
.grid-2 { display: grid; gap: 16px; grid-template-columns: 1fr 1fr; }
.btn {
  display: inline-block; cursor: pointer; padding: 9px 16px;
  border: 1px solid var(--ink); background: var(--ink); color: #fff;
  border-radius: 4px; text-decoration: none;
}
.btn.secondary { background: #fff; color: var(--ink); }
.btn.warn { background: var(--warn); border-color: var(--warn); }
.btn.ember { background: var(--ember); border-color: var(--ember); }
.danger { color: var(--warn); }
.muted { color: var(--ink-dim); font-size: 13px; }
table { width: 100%; border-collapse: collapse; margin: 16px 0; }
th, td { padding: 10px 8px; text-align: left; border-bottom: 1px solid var(--rule); }
th { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-dim); font-weight: 600; }
.rowset { border: 1px solid var(--rule); border-radius: 4px; padding: 12px; margin-bottom: 12px; background: #fff; }
.rowset + .rowset { margin-top: -6px; }
.repeater-row { display: grid; gap: 10px; align-items: start; margin-bottom: 10px; }
.spec-row    { grid-template-columns: 1fr 2fr auto; }
.phase-row   { grid-template-columns: 60px 1fr; }
.phase-row textarea { grid-column: 1 / -1; }
.plate-row   { grid-template-columns: 1fr 1fr 1fr 1fr auto; }
.note { background: #fff; border: 1px solid var(--rule); padding: 10px 14px; border-radius: 4px; font-size: 13px; }
.note.error { border-color: var(--warn); color: var(--warn); }
.note.ok    { border-color: var(--ok);   color: var(--ok); }
.actions { display: flex; gap: 10px; margin-top: 24px; }
</style>
</head>
<body>
<div class="shell">
<?php if (!empty($_SESSION['authed_at'])): ?>
<div class="bar">
  <h1>Praxivision · CMS</h1>
  <div class="right">
    <a href="/admin/dashboard">Case studies</a> ·
    <a href="/admin/upload">Upload content</a> ·
    <a href="/admin/private">Private pages</a> ·
    <a href="/admin/private-library">Library</a> ·
    <a href="/admin/logout">Log out</a>
  </div>
</div>
<?php endif; ?>
