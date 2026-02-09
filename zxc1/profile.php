<?php
declare(strict_types=1);
require_once __DIR__ . '/diplo/includes/init.php';

$user = current_user();
if (!$user) {
  header('Location: /login.php');
  exit;
}

$pdo = get_db();
// Получаем дополнительную информацию о пользователе
$stmt = $pdo->prepare('SELECT * FROM users WHERE id = :id');
$stmt->execute([':id' => $user['id']]);
$userData = $stmt->fetch();

$pageTitle = 'Личный кабинет — DanceWave';
$pageDescription = 'Личный кабинет пользователя DanceWave';
$canonicalUrl = '/profile.php';
$additionalHead = '<style>
    .profile-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
    }
    .profile-card {
      background: var(--surface);
      border-radius: var(--radius);
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow);
    }
    .profile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .profile-info {
      display: grid;
      gap: 1rem;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .info-label {
      color: var(--muted);
      font-weight: 500;
    }
    .info-value {
      color: var(--text);
    }
    .admin-link {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: var(--brand);
      color: white;
      text-decoration: none;
      border-radius: 999px;
      font-weight: 600;
    }
  </style>';

include __DIR__ . '/diplo/includes/header.php';
?>

  <main>
    <div class="container profile-container">
      <div class="profile-card">
        <div class="profile-header">
          <h1>Личный кабинет</h1>
          <?php if ($user['role'] === 'admin'): ?>
            <a href="/diplo/admin/" class="admin-link">Админ-панель</a>
          <?php endif; ?>
        </div>
        
        <div class="profile-info">
          <div class="info-item">
            <span class="info-label">Имя:</span>
            <span class="info-value"><?= htmlspecialchars($userData['name'] ?? 'Не указано') ?></span>
          </div>
          <div class="info-item">
            <span class="info-label">Email:</span>
            <span class="info-value"><?= htmlspecialchars($userData['email']) ?></span>
          </div>
          <div class="info-item">
            <span class="info-label">Роль:</span>
            <span class="info-value"><?= $userData['role'] === 'admin' ? 'Администратор' : 'Пользователь' ?></span>
          </div>
          <div class="info-item">
            <span class="info-label">Дата регистрации:</span>
            <span class="info-value"><?= date('d.m.Y H:i', strtotime($userData['created_at'])) ?></span>
          </div>
        </div>
      </div>

      <div class="profile-card">
        <h2 style="margin-bottom: 1rem;">Быстрые ссылки</h2>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <a href="/" class="button button--ghost" style="text-align: center;">Главная страница</a>
          <a href="/gallery.php" class="button button--ghost" style="text-align: center;">Галерея</a>
          <?php if ($user['role'] === 'admin'): ?>
            <a href="/diplo/admin/" class="button" style="text-align: center;">Админ-панель</a>
          <?php endif; ?>
          <a href="#" id="logoutBtn" class="button button--ghost" style="text-align: center; color: #ff4d6d; border-color: #ff4d6d;">Выйти из аккаунта</a>
        </div>
      </div>
    </div>
  </main>

<script>
  document.getElementById("logoutBtn").addEventListener("click", async (e) => {
    e.preventDefault();
    if (!confirm("Вы действительно хотите выйти?")) return;
    
    try {
      const res = await fetch("/diplo/public/auth/logout.php", {
        method: "POST"
      });
      const data = await res.json();
      if (data.ok) {
        window.location.href = "/";
      } else {
        alert("Ошибка выхода: " + (data.error || "Неизвестная ошибка"));
      }
    } catch (e) {
      console.error(e);
      alert("Ошибка сети");
    }
  });
</script>

<?php include __DIR__ . '/diplo/includes/footer.php'; ?>

