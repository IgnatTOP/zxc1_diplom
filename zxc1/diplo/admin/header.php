<?php
// Admin header component
$user = current_user();
if (!$user || $user['role'] !== 'admin') {
  header('Location: /login.php');
  exit;
}

$currentPage = basename($_SERVER['PHP_SELF']);
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= isset($pageTitle) ? htmlspecialchars($pageTitle) : 'Админ-панель — DanceWave' ?></title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/diplo/assets/css/styles.css">
  <style>
    .admin-header {
      background: rgba(252, 250, 251, 0.95);
      backdrop-filter: blur(12px);
      border-bottom: 2px solid var(--brand);
      box-shadow: 0 4px 20px rgba(0,0,0,.08);
      padding: 1.5rem 0;
      margin-bottom: 2rem;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    [data-theme="dark"] .admin-header {
      background: rgba(43, 43, 43, 0.95);
      border-bottom-color: rgba(125, 184, 213, 0.3);
    }
    .admin-header__inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }
    .admin-header__title {
      font-size: 28px;
      font-weight: 800;
      color: var(--text);
      margin: 0;
      background: linear-gradient(135deg, var(--text) 0%, var(--muted) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .admin-header__user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .admin-header__user span {
      color: var(--text);
      font-weight: 600;
      font-size: 15px;
    }
    .admin-nav {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      padding: 0;
    }
    .admin-nav a {
      padding: 12px 20px;
      background: var(--surface);
      border: 2px solid rgba(125, 184, 213, 0.2);
      border-radius: 12px;
      color: var(--text);
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
      box-shadow: var(--shadow-sm);
    }
    .admin-nav a:hover {
      background: rgba(125, 184, 213, 0.1);
      border-color: var(--brand);
      transform: translateY(-2px);
      box-shadow: var(--shadow);
    }
    .admin-nav a.active {
      background: var(--brand);
      color: #fff;
      border-color: var(--brand);
      box-shadow: 0 4px 12px rgba(125, 184, 213, 0.4);
    }
    .admin-content {
      background: var(--bg);
      border-radius: 32px;
      padding: 48px;
      box-shadow: var(--shadow);
      border: 1px solid rgba(125, 184, 213, 0.15);
    }
    @media (max-width: 768px) {
      .admin-header {
        padding: 1rem 0;
      }
      .admin-header__title {
        font-size: 20px;
      }
      .admin-nav {
        gap: 0.5rem;
      }
      .admin-nav a {
        padding: 10px 16px;
        font-size: 13px;
      }
      .admin-content {
        padding: 24px;
        border-radius: 24px;
      }
    }
  </style>
</head>
<body>
  <header class="admin-header">
    <div class="container admin-header__inner">
      <h1 class="admin-header__title">Админ-панель DanceWave</h1>
      <div class="admin-header__user">
        <span><?= htmlspecialchars($user['name'] ?? $user['email']) ?></span>
        <a href="/" class="button button--ghost" style="padding: 8px 16px; font-size: 14px;">На сайт</a>
        <a href="#" id="adminLogoutBtn" class="button" style="padding: 8px 16px; font-size: 14px;">Выйти</a>
      </div>
    </div>
  </header>
  
  <div class="container">
    <nav class="admin-nav">
      <a href="/diplo/admin/" class="<?= $currentPage === 'index.php' ? 'active' : '' ?>">Главная</a>
      <a href="/diplo/admin/applications.php" class="<?= $currentPage === 'applications.php' ? 'active' : '' ?>">Заявки</a>
      <a href="/diplo/admin/groups.php" class="<?= $currentPage === 'groups.php' ? 'active' : '' ?>">Группы</a>
      <a href="/diplo/admin/schedule.php" class="<?= $currentPage === 'schedule.php' ? 'active' : '' ?>">Расписание</a>
      <a href="/diplo/admin/gallery.php" class="<?= $currentPage === 'gallery.php' ? 'active' : '' ?>">Галерея</a>
      <a href="/diplo/admin/about.php" class="<?= $currentPage === 'about.php' ? 'active' : '' ?>">О нас</a>
      <a href="/diplo/admin/blog.php" class="<?= $currentPage === 'blog.php' ? 'active' : '' ?>">Блог</a>
      <a href="/diplo/admin/users.php" class="<?= $currentPage === 'users.php' ? 'active' : '' ?>">Пользователи</a>
    </nav>

