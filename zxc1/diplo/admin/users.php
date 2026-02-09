<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/init.php';

$user = current_user();
if (!$user || $user['role'] !== 'admin') {
  header('Location: /login.php');
  exit;
}

$pdo = get_db();
$users = $pdo->query('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC')->fetchAll();

$pageTitle = 'Управление пользователями — Админ-панель';
require_once __DIR__ . '/header.php';
?>

<div class="admin-content">
  <h2 class="section__title" style="margin-top: 0;">Управление пользователями</h2>
  
  <div style="overflow-x: auto;">
    <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
      <thead>
        <tr style="background: var(--surface); border-bottom: 2px solid var(--brand);">
          <th style="padding: 1rem; text-align: left; font-weight: 600; color: var(--text);">ID</th>
          <th style="padding: 1rem; text-align: left; font-weight: 600; color: var(--text);">Email</th>
          <th style="padding: 1rem; text-align: left; font-weight: 600; color: var(--text);">Имя</th>
          <th style="padding: 1rem; text-align: left; font-weight: 600; color: var(--text);">Роль</th>
          <th style="padding: 1rem; text-align: left; font-weight: 600; color: var(--text);">Дата регистрации</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($users as $u): ?>
          <tr style="border-bottom: 1px solid rgba(0,0,0,.1); transition: background 0.2s ease;">
            <td data-label="ID" style="padding: 1rem; color: var(--text);"><?= $u['id'] ?></td>
            <td data-label="Email" style="padding: 1rem; color: var(--text);"><?= htmlspecialchars($u['email']) ?></td>
            <td data-label="Имя" style="padding: 1rem; color: var(--text);"><?= htmlspecialchars($u['name'] ?? '-') ?></td>
            <td data-label="Роль" style="padding: 1rem;">
              <span style="display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; background: <?= $u['role'] === 'admin' ? 'rgba(255, 77, 109, .2)' : 'rgba(161, 192, 212, .2)' ?>; color: <?= $u['role'] === 'admin' ? '#ff4d6d' : 'var(--brand)' ?>;">
                <?= $u['role'] === 'admin' ? 'Админ' : 'Пользователь' ?>
              </span>
            </td>
            <td data-label="Дата регистрации" style="padding: 1rem; color: var(--muted);"><?= date('d.m.Y H:i', strtotime($u['created_at'])) ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>

<style>
  tbody tr:hover {
    background: var(--surface);
  }
</style>

<?php require_once __DIR__ . '/footer.php'; ?>
