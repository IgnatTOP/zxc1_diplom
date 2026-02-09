<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/init.php';

$user = current_user();
if (!$user || $user['role'] !== 'admin') {
  header('Location: /login.php');
  exit;
}

$pdo = get_db();

// Get current content
$stmt = $pdo->prepare('SELECT key_name, value FROM content WHERE page = ?');
$stmt->execute(['about']);
$contentRows = $stmt->fetchAll();

$content = [];
foreach ($contentRows as $row) {
  $content[$row['key_name']] = $row['value'];
}

// Get team members
$teamMembers = $pdo->query('SELECT * FROM team_members ORDER BY sort_order ASC, id ASC')->fetchAll();

$pageTitle = 'Редактирование страницы "О нас" — Админ-панель';
$currentPage = 'about.php';
require_once __DIR__ . '/header.php';
?>

<div class="admin-content">
  <h2 class="section__title" style="margin-top: 0;">Редактирование страницы "О нас"</h2>
  
  <form id="aboutForm" style="display: grid; gap: 24px; max-width: 900px;">
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Заголовок страницы</label>
      <input type="text" id="title" value="<?= htmlspecialchars($content['title'] ?? 'О нас') ?>" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px;">
    </div>
    
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Подзаголовок</label>
      <input type="text" id="subtitle" value="<?= htmlspecialchars($content['subtitle'] ?? 'Узнайте больше о нашей студии') ?>" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px;">
    </div>
    
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Основной текст</label>
      <textarea id="mainText" rows="8" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px; font-family: inherit; resize: vertical;"><?= htmlspecialchars($content['main_text'] ?? '') ?></textarea>
      <small style="color: var(--muted); font-size: 14px; margin-top: 4px; display: block;">Поддерживается HTML-разметка</small>
    </div>
    
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Заголовок "Наша миссия"</label>
      <input type="text" id="missionTitle" value="<?= htmlspecialchars($content['mission_title'] ?? 'Наша миссия') ?>" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px;">
    </div>
    
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Текст "Наша миссия"</label>
      <textarea id="missionText" rows="5" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px; font-family: inherit; resize: vertical;"><?= htmlspecialchars($content['mission_text'] ?? '') ?></textarea>
      <small style="color: var(--muted); font-size: 14px; margin-top: 4px; display: block;">Поддерживается HTML-разметка</small>
    </div>
    
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Заголовок "Наши ценности"</label>
      <input type="text" id="valuesTitle" value="<?= htmlspecialchars($content['values_title'] ?? 'Наши ценности') ?>" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px;">
    </div>
    
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Текст "Наши ценности"</label>
      <textarea id="valuesText" rows="5" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px; font-family: inherit; resize: vertical;"><?= htmlspecialchars($content['values_text'] ?? '') ?></textarea>
      <small style="color: var(--muted); font-size: 14px; margin-top: 4px; display: block;">Поддерживается HTML-разметка</small>
    </div>
    
    <div style="margin-top: 32px; padding-top: 32px; border-top: 2px solid var(--brand);">
      <h3 style="font-size: 1.5rem; font-weight: 700; margin: 0 0 24px; color: var(--text);">Статистика</h3>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Цифра 1</label>
          <input type="text" id="stat1_number" value="<?= htmlspecialchars($content['stat1_number'] ?? '5+') ?>" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Подпись 1</label>
          <input type="text" id="stat1_label" value="<?= htmlspecialchars($content['stat1_label'] ?? 'Лет опыта') ?>" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Цифра 2</label>
          <input type="text" id="stat2_number" value="<?= htmlspecialchars($content['stat2_number'] ?? '500+') ?>" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Подпись 2</label>
          <input type="text" id="stat2_label" value="<?= htmlspecialchars($content['stat2_label'] ?? 'Учеников') ?>" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Цифра 3</label>
          <input type="text" id="stat3_number" value="<?= htmlspecialchars($content['stat3_number'] ?? '4') ?>" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Подпись 3</label>
          <input type="text" id="stat3_label" value="<?= htmlspecialchars($content['stat3_label'] ?? 'Направления') ?>" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Цифра 4</label>
          <input type="text" id="stat4_number" value="<?= htmlspecialchars($content['stat4_number'] ?? '10+') ?>" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Подпись 4</label>
          <input type="text" id="stat4_label" value="<?= htmlspecialchars($content['stat4_label'] ?? 'Преподавателей') ?>" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px;">
        </div>
      </div>
    </div>
    
    <div style="margin-top: 32px; padding-top: 32px; border-top: 2px solid var(--brand);">
      <h3 style="font-size: 1.5rem; font-weight: 700; margin: 0 0 24px; color: var(--text);">История</h3>
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Заголовок истории</label>
        <input type="text" id="historyTitle" value="<?= htmlspecialchars($content['history_title'] ?? 'Наша история') ?>" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px;">
      </div>
      <div style="margin-top: 16px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Текст истории</label>
        <textarea id="historyText" rows="6" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px; font-family: inherit; resize: vertical;"><?= htmlspecialchars($content['history_text'] ?? '') ?></textarea>
        <small style="color: var(--muted); font-size: 14px; margin-top: 4px; display: block;">Поддерживается HTML-разметка</small>
      </div>
    </div>
    
    <div style="margin-top: 32px; padding-top: 32px; border-top: 2px solid var(--brand);">
      <h3 style="font-size: 1.5rem; font-weight: 700; margin: 0 0 24px; color: var(--text);">Преимущества</h3>
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Заголовок секции преимуществ</label>
        <input type="text" id="advantagesTitle" value="<?= htmlspecialchars($content['advantages_title'] ?? 'Почему выбирают нас') ?>" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px;">
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 16px;">
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Преимущество 1 - Заголовок</label>
          <input type="text" id="advantage1_title" value="<?= htmlspecialchars($content['advantage1_title'] ?? 'Профессиональные преподаватели') ?>" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Преимущество 1 - Текст</label>
          <textarea id="advantage1_text" rows="3" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px; font-family: inherit; resize: vertical;"><?= htmlspecialchars($content['advantage1_text'] ?? '') ?></textarea>
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Преимущество 2 - Заголовок</label>
          <input type="text" id="advantage2_title" value="<?= htmlspecialchars($content['advantage2_title'] ?? 'Современное оборудование') ?>" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Преимущество 2 - Текст</label>
          <textarea id="advantage2_text" rows="3" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px; font-family: inherit; resize: vertical;"><?= htmlspecialchars($content['advantage2_text'] ?? '') ?></textarea>
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Преимущество 3 - Заголовок</label>
          <input type="text" id="advantage3_title" value="<?= htmlspecialchars($content['advantage3_title'] ?? 'Индивидуальный подход') ?>" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Преимущество 3 - Текст</label>
          <textarea id="advantage3_text" rows="3" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px; font-family: inherit; resize: vertical;"><?= htmlspecialchars($content['advantage3_text'] ?? '') ?></textarea>
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Преимущество 4 - Заголовок</label>
          <input type="text" id="advantage4_title" value="<?= htmlspecialchars($content['advantage4_title'] ?? 'Гибкий график') ?>" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px;">
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Преимущество 4 - Текст</label>
          <textarea id="advantage4_text" rows="3" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px; font-family: inherit; resize: vertical;"><?= htmlspecialchars($content['advantage4_text'] ?? '') ?></textarea>
        </div>
      </div>
    </div>
    
    <div style="margin-top: 32px; padding-top: 32px; border-top: 2px solid var(--brand);">
      <h3 style="font-size: 1.5rem; font-weight: 700; margin: 0 0 24px; color: var(--text);">Команда</h3>
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Заголовок секции команды</label>
        <input type="text" id="teamTitle" value="<?= htmlspecialchars($content['team_title'] ?? 'Наша команда') ?>" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px;">
      </div>
      <div style="margin-top: 16px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Текст о команде</label>
        <textarea id="teamText" rows="4" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px; font-family: inherit; resize: vertical;"><?= htmlspecialchars($content['team_text'] ?? '') ?></textarea>
        <small style="color: var(--muted); font-size: 14px; margin-top: 4px; display: block;">Поддерживается HTML-разметка</small>
      </div>
      
      <div style="margin-top: 32px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h4 style="font-size: 1.25rem; font-weight: 700; margin: 0; color: var(--text);">Преподаватели</h4>
          <button type="button" class="button" onclick="addTeamMember()" style="padding: 10px 20px; font-size: 14px;">Добавить преподавателя</button>
        </div>
        
        <div id="teamMembersList" style="display: grid; gap: 20px;">
          <?php foreach ($teamMembers as $member): ?>
            <div class="team-member-item" data-id="<?= $member['id'] ?>" style="background: var(--surface); border-radius: 16px; padding: 24px; border: 1px solid rgba(0,0,0,0.1);">
              <div style="display: grid; grid-template-columns: 120px 1fr auto; gap: 24px; align-items: center;">
                <div>
                  <?php if ($member['photo']): ?>
                    <img src="/diplo/assets/images/<?= htmlspecialchars($member['photo']) ?>" alt="<?= htmlspecialchars($member['name']) ?>" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid var(--brand);">
                  <?php else: ?>
                    <div style="width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, var(--brand), var(--accent)); display: flex; align-items: center; justify-content: center; font-size: 3rem; color: white; border: 3px solid var(--brand);">
                      <?= mb_substr($member['name'], 0, 1) ?>
                    </div>
                  <?php endif; ?>
                  <input type="file" accept="image/*" class="team-photo-upload" data-id="<?= $member['id'] ?>" style="width: 100%; margin-top: 8px; font-size: 12px; cursor: pointer;">
                </div>
                <div style="flex: 1;">
                  <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text); font-size: 14px;">ФИО</label>
                  <input type="text" class="team-name" data-id="<?= $member['id'] ?>" value="<?= htmlspecialchars($member['name']) ?>" required style="width: 100%; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 15px; margin-bottom: 12px;">
                  <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text); font-size: 14px;">Стаж работы</label>
                  <input type="text" class="team-experience" data-id="<?= $member['id'] ?>" value="<?= htmlspecialchars($member['experience']) ?>" placeholder="Например: 8 лет опыта" required style="width: 100%; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 15px;">
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <button type="button" class="button" onclick="saveTeamMember(<?= $member['id'] ?>)" style="padding: 10px 16px; font-size: 14px; white-space: nowrap;">Сохранить</button>
                  <button type="button" class="button button--ghost" onclick="deleteTeamMember(<?= $member['id'] ?>)" style="padding: 10px 16px; font-size: 14px; white-space: nowrap; color: #ff4d6d; border-color: #ff4d6d;">Удалить</button>
                </div>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
    
    <div id="saveMessage" style="display: none; padding: 12px 16px; border-radius: 8px; margin-top: 8px;"></div>
    
    <div style="display: flex; gap: 16px; margin-top: 16px;">
      <button type="submit" class="button" style="padding: 14px 32px;">Сохранить изменения</button>
      <a href="/about.php" target="_blank" class="button button--ghost" style="padding: 14px 32px; text-decoration: none;">Посмотреть страницу</a>
    </div>
  </form>
</div>

<script>
document.getElementById('aboutForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const messageEl = document.getElementById('saveMessage');
  messageEl.style.display = 'none';
  
  const data = {
    title: document.getElementById('title').value.trim(),
    subtitle: document.getElementById('subtitle').value.trim(),
    main_text: document.getElementById('mainText').value.trim(),
    mission_title: document.getElementById('missionTitle').value.trim(),
    mission_text: document.getElementById('missionText').value.trim(),
    values_title: document.getElementById('valuesTitle').value.trim(),
    values_text: document.getElementById('valuesText').value.trim(),
    stat1_number: document.getElementById('stat1_number').value.trim(),
    stat1_label: document.getElementById('stat1_label').value.trim(),
    stat2_number: document.getElementById('stat2_number').value.trim(),
    stat2_label: document.getElementById('stat2_label').value.trim(),
    stat3_number: document.getElementById('stat3_number').value.trim(),
    stat3_label: document.getElementById('stat3_label').value.trim(),
    stat4_number: document.getElementById('stat4_number').value.trim(),
    stat4_label: document.getElementById('stat4_label').value.trim(),
    history_title: document.getElementById('historyTitle').value.trim(),
    history_text: document.getElementById('historyText').value.trim(),
    advantages_title: document.getElementById('advantagesTitle').value.trim(),
    advantage1_title: document.getElementById('advantage1_title').value.trim(),
    advantage1_text: document.getElementById('advantage1_text').value.trim(),
    advantage2_title: document.getElementById('advantage2_title').value.trim(),
    advantage2_text: document.getElementById('advantage2_text').value.trim(),
    advantage3_title: document.getElementById('advantage3_title').value.trim(),
    advantage3_text: document.getElementById('advantage3_text').value.trim(),
    advantage4_title: document.getElementById('advantage4_title').value.trim(),
    advantage4_text: document.getElementById('advantage4_text').value.trim(),
    team_title: document.getElementById('teamTitle').value.trim(),
    team_text: document.getElementById('teamText').value.trim(),
  };
  
  try {
    const res = await fetch('/diplo/public/api/about.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await res.json();
    
    if (result.ok) {
      messageEl.style.display = 'block';
      messageEl.style.background = 'rgba(16, 185, 129, 0.1)';
      messageEl.style.border = '1px solid rgba(16, 185, 129, 0.3)';
      messageEl.style.color = '#10b981';
      messageEl.textContent = 'Изменения успешно сохранены!';
      
      setTimeout(() => {
        messageEl.style.display = 'none';
      }, 3000);
    } else {
      messageEl.style.display = 'block';
      messageEl.style.background = 'rgba(255, 77, 109, 0.1)';
      messageEl.style.border = '1px solid rgba(255, 77, 109, 0.3)';
      messageEl.style.color = '#ff4d6d';
      messageEl.textContent = result.error || 'Ошибка сохранения';
    }
  } catch (err) {
    messageEl.style.display = 'block';
    messageEl.style.background = 'rgba(255, 77, 109, 0.1)';
    messageEl.style.border = '1px solid rgba(255, 77, 109, 0.3)';
    messageEl.style.color = '#ff4d6d';
    messageEl.textContent = 'Ошибка соединения. Попробуйте позже.';
  }
});

// Team members functions
function addTeamMember() {
  const list = document.getElementById('teamMembersList');
  const newId = 'new_' + Date.now();
  
  const memberHtml = `
    <div class="team-member-item" data-id="${newId}" style="background: var(--surface); border-radius: 16px; padding: 24px; border: 1px solid rgba(0,0,0,0.1);">
      <div style="display: grid; grid-template-columns: 120px 1fr auto; gap: 24px; align-items: center;">
        <div>
          <div style="width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, var(--brand), var(--accent)); display: flex; align-items: center; justify-content: center; font-size: 3rem; color: white; border: 3px solid var(--brand);">
            ?
          </div>
          <input type="file" accept="image/*" class="team-photo-upload" data-id="${newId}" style="width: 100%; margin-top: 8px; font-size: 12px; cursor: pointer;">
        </div>
        <div style="flex: 1;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text); font-size: 14px;">ФИО</label>
          <input type="text" class="team-name" data-id="${newId}" placeholder="Иванов Иван Иванович" required style="width: 100%; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 15px; margin-bottom: 12px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text); font-size: 14px;">Стаж работы</label>
          <input type="text" class="team-experience" data-id="${newId}" value="" placeholder="Например: 8 лет опыта" required style="width: 100%; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 15px;">
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button type="button" class="button" onclick="saveTeamMember('${newId}')" style="padding: 10px 16px; font-size: 14px; white-space: nowrap;">Сохранить</button>
          <button type="button" class="button button--ghost" onclick="deleteTeamMember('${newId}')" style="padding: 10px 16px; font-size: 14px; white-space: nowrap; color: #ff4d6d; border-color: #ff4d6d;">Отмена</button>
        </div>
      </div>
    </div>
  `;
  
  list.insertAdjacentHTML('beforeend', memberHtml);
  list.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function saveTeamMember(id) {
  const item = document.querySelector(`.team-member-item[data-id="${id}"]`);
  if (!item) return;
  
  const nameInput = item.querySelector('.team-name');
  const experienceInput = item.querySelector('.team-experience');
  const photoInput = item.querySelector('.team-photo-upload');
  
  const name = nameInput.value.trim();
  const experience = experienceInput.value.trim();
  
  if (!name || !experience) {
    alert('Заполните все поля');
    return;
  }
  
  let photo = null;
  if (photoInput.files && photoInput.files[0]) {
    const formData = new FormData();
    formData.append('file', photoInput.files[0]);
    
    try {
      const uploadRes = await fetch('/diplo/public/api/upload.php', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (uploadData.ok) {
        photo = uploadData.filename;
      } else {
        alert('Ошибка загрузки фото: ' + (uploadData.error || 'Неизвестная ошибка'));
        return;
      }
    } catch (e) {
      alert('Ошибка загрузки фото');
      return;
    }
  }
  
  try {
    const requestData = {
      id: id.toString().startsWith('new_') ? null : parseInt(id),
      name,
      experience
    };
    
    // Only include photo if it was uploaded
    if (photo) {
      requestData.photo = photo;
    }
    
    const res = await fetch('/diplo/public/api/team.php', {
      method: id.toString().startsWith('new_') ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    
    const data = await res.json();
    
    if (data.ok) {
      if (id.toString().startsWith('new_')) {
        location.reload();
      } else {
        alert('Изменения сохранены!');
        // Reload to show updated photo if it was changed
        if (photo) {
          location.reload();
        }
      }
    } else {
      alert('Ошибка: ' + (data.error || 'Неизвестная ошибка'));
    }
  } catch (err) {
    console.error('Error saving team member:', err);
    alert('Ошибка соединения: ' + err.message);
  }
}

async function deleteTeamMember(id) {
  if (id.toString().startsWith('new_')) {
    document.querySelector(`.team-member-item[data-id="${id}"]`).remove();
    return;
  }
  
  if (!confirm('Удалить этого преподавателя?')) return;
  
  try {
    const res = await fetch('/diplo/public/api/team.php', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: parseInt(id) })
    });
    
    const data = await res.json();
    
    if (data.ok) {
      location.reload();
    } else {
      alert('Ошибка: ' + (data.error || 'Неизвестная ошибка'));
    }
  } catch (err) {
    alert('Ошибка соединения');
  }
}

// Photo upload preview
document.addEventListener('change', (e) => {
  if (e.target.classList.contains('team-photo-upload')) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const item = e.target.closest('.team-member-item');
        const imgContainer = item.querySelector('div > div:first-child');
        const currentInput = imgContainer.querySelector('input');
        imgContainer.innerHTML = `
          <img src="${ev.target.result}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid var(--brand);">
          <input type="file" accept="image/*" class="team-photo-upload" data-id="${currentInput.dataset.id}" style="width: 100%; margin-top: 8px; font-size: 12px; cursor: pointer;">
        `;
      };
      reader.readAsDataURL(file);
    }
  }
});
</script>

<?php require_once __DIR__ . '/footer.php'; ?>

