<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/init.php';

$user = current_user();
if (!$user || $user['role'] !== 'admin') {
  header('Location: /login.php');
  exit;
}

$pdo = get_db();

// Get statistics in real-time
$stats = [
  'users' => (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn(),
  'users_today' => (int)$pdo->query("SELECT COUNT(*) FROM users WHERE DATE(created_at) = DATE('now')")->fetchColumn(),
  'applications' => (int)$pdo->query('SELECT COUNT(*) FROM applications')->fetchColumn(),
  'applications_pending' => (int)$pdo->query("SELECT COUNT(*) FROM applications WHERE status = 'pending'")->fetchColumn(),
  'applications_assigned' => (int)$pdo->query("SELECT COUNT(*) FROM applications WHERE status = 'assigned'")->fetchColumn(),
  'groups' => (int)$pdo->query('SELECT COUNT(*) FROM groups')->fetchColumn(),
  'groups_active' => (int)$pdo->query('SELECT COUNT(*) FROM groups WHERE is_active = 1')->fetchColumn(),
  'gallery' => (int)$pdo->query('SELECT COUNT(*) FROM gallery')->fetchColumn(),
  'gallery_active' => (int)$pdo->query('SELECT COUNT(*) FROM gallery WHERE is_active = 1')->fetchColumn(),
  'collages' => (int)$pdo->query('SELECT COUNT(*) FROM collages')->fetchColumn(),
  'blog_posts' => (int)$pdo->query('SELECT COUNT(*) FROM blog_posts')->fetchColumn(),
  'blog_published' => (int)$pdo->query('SELECT COUNT(*) FROM blog_posts WHERE is_published = 1')->fetchColumn(),
  'team_members' => (int)$pdo->query('SELECT COUNT(*) FROM team_members WHERE is_active = 1')->fetchColumn(),
  'schedule_items' => (int)$pdo->query('SELECT COUNT(*) FROM schedule WHERE is_active = 1')->fetchColumn(),
];

$pageTitle = 'Админ-панель — DanceWave';
require_once __DIR__ . '/header.php';
?>

<div class="admin-content" style="background: var(--bg); border-radius: 32px; padding: 48px; box-shadow: var(--shadow); border: 1px solid rgba(125, 184, 213, 0.15);">
  <div style="text-align: center; margin-bottom: 48px;">
    <h2 class="section__title" style="margin-top: 0; margin-bottom: 12px; text-align: center;">Статистика</h2>
    <p style="color: var(--muted); font-size: 1.125rem; max-width: 600px; margin: 0 auto;">Обзор всех данных вашей студии</p>
  </div>
  
  <!-- Users & Applications -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; margin-bottom: 48px;">
    <div style="background: linear-gradient(135deg, rgba(125, 184, 213, 0.1) 0%, rgba(168, 213, 226, 0.1) 100%); border-radius: 20px; padding: 28px; border: 2px solid rgba(125, 184, 213, 0.2); transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='var(--shadow)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="color: var(--muted); font-size: 13px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Пользователи</h3>
        <span style="font-size: 28px;">👥</span>
      </div>
      <div style="font-size: 42px; font-weight: 800; color: var(--text); margin-bottom: 8px; line-height: 1;"><?= $stats['users'] ?></div>
      <div style="font-size: 13px; color: var(--muted);">+<?= $stats['users_today'] ?> сегодня</div>
    </div>
    
    <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%); border-radius: 20px; padding: 28px; border: 2px solid rgba(16, 185, 129, 0.2); transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='var(--shadow)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="color: var(--muted); font-size: 13px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Заявки</h3>
        <span style="font-size: 28px;">📋</span>
      </div>
      <div style="font-size: 42px; font-weight: 800; color: var(--text); margin-bottom: 8px; line-height: 1;"><?= $stats['applications'] ?></div>
      <div style="font-size: 13px; color: var(--muted);"><?= $stats['applications_pending'] ?> ожидают · <?= $stats['applications_assigned'] ?> назначены</div>
    </div>
    
    <div style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(252, 211, 77, 0.1) 100%); border-radius: 20px; padding: 28px; border: 2px solid rgba(251, 191, 36, 0.2); transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='var(--shadow)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="color: var(--muted); font-size: 13px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Группы</h3>
        <span style="font-size: 28px;">🎯</span>
      </div>
      <div style="font-size: 42px; font-weight: 800; color: var(--text); margin-bottom: 8px; line-height: 1;"><?= $stats['groups'] ?></div>
      <div style="font-size: 13px; color: var(--muted);"><?= $stats['groups_active'] ?> активных</div>
    </div>
    
    <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%); border-radius: 20px; padding: 28px; border: 2px solid rgba(139, 92, 246, 0.2); transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='var(--shadow)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="color: var(--muted); font-size: 13px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Галерея</h3>
        <span style="font-size: 28px;">📸</span>
      </div>
      <div style="font-size: 42px; font-weight: 800; color: var(--text); margin-bottom: 8px; line-height: 1;"><?= $stats['gallery'] ?></div>
      <div style="font-size: 13px; color: var(--muted);"><?= $stats['gallery_active'] ?> активных · <?= $stats['collages'] ?> коллажей</div>
    </div>
    
    <div style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(244, 114, 182, 0.1) 100%); border-radius: 20px; padding: 28px; border: 2px solid rgba(236, 72, 153, 0.2); transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='var(--shadow)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="color: var(--muted); font-size: 13px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Блог</h3>
        <span style="font-size: 28px;">📝</span>
      </div>
      <div style="font-size: 42px; font-weight: 800; color: var(--text); margin-bottom: 8px; line-height: 1;"><?= $stats['blog_posts'] ?></div>
      <div style="font-size: 13px; color: var(--muted);"><?= $stats['blog_published'] ?> опубликовано</div>
    </div>
    
    <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(96, 165, 250, 0.1) 100%); border-radius: 20px; padding: 28px; border: 2px solid rgba(59, 130, 246, 0.2); transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='var(--shadow)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="color: var(--muted); font-size: 13px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Команда</h3>
        <span style="font-size: 28px;">👨‍🏫</span>
      </div>
      <div style="font-size: 42px; font-weight: 800; color: var(--text); margin-bottom: 8px; line-height: 1;"><?= $stats['team_members'] ?></div>
      <div style="font-size: 13px; color: var(--muted);">преподавателей</div>
    </div>
    
    <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(74, 222, 128, 0.1) 100%); border-radius: 20px; padding: 28px; border: 2px solid rgba(34, 197, 94, 0.2); transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='var(--shadow)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="color: var(--muted); font-size: 13px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Расписание</h3>
        <span style="font-size: 28px;">📅</span>
      </div>
      <div style="font-size: 42px; font-weight: 800; color: var(--text); margin-bottom: 8px; line-height: 1;"><?= $stats['schedule_items'] ?></div>
      <div style="font-size: 13px; color: var(--muted);">активных занятий</div>
    </div>
  </div>
  
  <div style="margin-top: 48px; padding-top: 48px; border-top: 2px solid rgba(125, 184, 213, 0.2); position: relative;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h3 class="section__title" style="font-size: 28px; margin-bottom: 12px; text-align: center;">Быстрые действия</h3>
      <p style="color: var(--muted); font-size: 1rem; max-width: 500px; margin: 0 auto;">Управление контентом и настройками студии</p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
      <a href="applications.php" class="button" style="text-align: center; text-decoration: none; padding: 16px; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <span>📋</span>
        <span>Заявки</span>
      </a>
      <a href="groups.php" class="button button--ghost" style="text-align: center; text-decoration: none; padding: 16px; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <span>🎯</span>
        <span>Группы</span>
      </a>
      <a href="schedule.php" class="button button--ghost" style="text-align: center; text-decoration: none; padding: 16px; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <span>📅</span>
        <span>Расписание</span>
      </a>
      <a href="gallery.php" class="button button--ghost" style="text-align: center; text-decoration: none; padding: 16px; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <span>📸</span>
        <span>Галерея</span>
      </a>
      <a href="blog.php" class="button button--ghost" style="text-align: center; text-decoration: none; padding: 16px; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <span>📝</span>
        <span>Блог</span>
      </a>
      <a href="about.php" class="button button--ghost" style="text-align: center; text-decoration: none; padding: 16px; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <span>ℹ️</span>
        <span>О нас</span>
      </a>
      <a href="users.php" class="button button--ghost" style="text-align: center; text-decoration: none; padding: 16px; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <span>👥</span>
        <span>Пользователи</span>
      </a>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
