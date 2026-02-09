<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/init.php';

$user = current_user();
if (!$user || $user['role'] !== 'admin') {
  header('Location: /login.php');
  exit;
}

$pdo = get_db();
$groups = $pdo->query('SELECT * FROM groups ORDER BY day_of_week, time')->fetchAll();

$pageTitle = 'Управление группами — Админ-панель';
require_once __DIR__ . '/header.php';
?>

<div class="admin-content">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
    <h2 class="section__title" style="margin: 0;">Управление группами</h2>
    <button class="button" onclick="openAddModal()">Добавить группу</button>
  </div>
  
  <div style="display: grid; gap: 1rem;">
    <?php foreach ($groups as $group): ?>
      <div class="card" style="padding: 1.5rem;">
        <div style="display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: start;">
          <div>
            <h3 style="margin: 0 0 1rem; font-size: 20px;"><?= htmlspecialchars($group['name']) ?></h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
              <div>
                <strong style="color: var(--muted); font-size: 12px; text-transform: uppercase;">Направление:</strong>
                <div style="margin-top: 4px; font-weight: 600;"><?= htmlspecialchars($group['style']) ?></div>
              </div>
              <div>
                <strong style="color: var(--muted); font-size: 12px; text-transform: uppercase;">Уровень:</strong>
                <div style="margin-top: 4px; font-weight: 600;"><?= htmlspecialchars($group['level']) ?></div>
              </div>
              <div>
                <strong style="color: var(--muted); font-size: 12px; text-transform: uppercase;">День недели:</strong>
                <div style="margin-top: 4px; font-weight: 600;"><?= htmlspecialchars($group['day_of_week']) ?></div>
              </div>
              <div>
                <strong style="color: var(--muted); font-size: 12px; text-transform: uppercase;">Время:</strong>
                <div style="margin-top: 4px; font-weight: 600;"><?= htmlspecialchars($group['time']) ?></div>
              </div>
              <?php if ($group['age_min'] || $group['age_max']): ?>
                <div>
                  <strong style="color: var(--muted); font-size: 12px; text-transform: uppercase;">Возраст:</strong>
                  <div style="margin-top: 4px; font-weight: 600;">
                    <?= $group['age_min'] ? $group['age_min'] : '?' ?> - <?= $group['age_max'] ? $group['age_max'] : '?' ?> лет
                  </div>
                </div>
              <?php endif; ?>
              <div>
                <strong style="color: var(--muted); font-size: 12px; text-transform: uppercase;">Студентов:</strong>
                <div style="margin-top: 4px; font-weight: 600;">
                  <?= $group['current_students'] ?> / <?= $group['max_students'] ?>
                </div>
              </div>
              <div>
                <strong style="color: var(--muted); font-size: 12px; text-transform: uppercase;">Статус:</strong>
                <div style="margin-top: 4px;">
                  <span style="display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; background: <?= $group['is_active'] ? 'rgba(32,201,151,.2)' : 'rgba(255,77,109,.2)' ?>; color: <?= $group['is_active'] ? '#20c997' : '#ff4d6d' ?>;">
                    <?= $group['is_active'] ? 'Активна' : 'Неактивна' ?>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <button class="button" style="padding: 8px 16px; font-size: 14px;" onclick="editGroup(<?= $group['id'] ?>)">
              Редактировать
            </button>
            <button class="button" style="padding: 8px 16px; font-size: 14px; background: <?= $group['is_active'] ? '#ff4d6d' : '#20c997' ?>; border-color: <?= $group['is_active'] ? '#ff4d6d' : '#20c997' ?>;" onclick="toggleGroup(<?= $group['id'] ?>, <?= $group['is_active'] ? 0 : 1 ?>)">
              <?= $group['is_active'] ? 'Деактивировать' : 'Активировать' ?>
            </button>
            <button class="button" style="padding: 8px 16px; font-size: 14px; background: #ff4d6d; border-color: #ff4d6d;" onclick="deleteGroup(<?= $group['id'] ?>)">
              Удалить
            </button>
          </div>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
</div>

<!-- Add/Edit Group Modal -->
<div class="modal" id="groupModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); z-index: 1000; align-items: center; justify-content: center;">
  <div class="auth-card" style="max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 1001; background: var(--bg); padding: 40px; border-radius: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid rgba(255,255,255,0.1);">
    <h2 id="groupModalTitle" class="section__title" style="margin: 0 0 24px; text-align: left; font-size: 28px;">Добавить группу</h2>
    <form id="groupForm" class="form form--auth">
      <input type="hidden" id="groupId">
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Название группы *</label>
        <input type="text" id="groupName" required style="width: 100%; padding: 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px; font-size: 16px; background: var(--bg); color: var(--text);">
      </div>
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Направление *</label>
        <select id="groupStyle" required style="width: 100%; padding: 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px; font-size: 16px; background: var(--bg); color: var(--text);">
          <option value="">Выберите направление</option>
          <option>Hip-Hop</option>
          <option>Contemporary</option>
          <option>Latin</option>
          <option>Kids</option>
        </select>
      </div>
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Уровень *</label>
        <select id="groupLevel" required style="width: 100%; padding: 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px; font-size: 16px; background: var(--bg); color: var(--text);">
          <option value="">Выберите уровень</option>
          <option>Начальный</option>
          <option>Средний</option>
          <option>Продвинутый</option>
        </select>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">День недели *</label>
          <select id="groupDay" required style="width: 100%; padding: 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px; font-size: 16px; background: var(--bg); color: var(--text);">
            <option value="">Выберите день</option>
            <option>Понедельник</option>
            <option>Вторник</option>
            <option>Среда</option>
            <option>Четверг</option>
            <option>Пятница</option>
            <option>Суббота</option>
            <option>Воскресенье</option>
          </select>
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Время *</label>
          <input type="time" id="groupTime" required style="width: 100%; padding: 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px; font-size: 16px; background: var(--bg); color: var(--text);">
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Возраст от</label>
          <input type="number" id="groupAgeMin" min="4" max="100" style="width: 100%; padding: 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px; font-size: 16px; background: var(--bg); color: var(--text);">
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Возраст до</label>
          <input type="number" id="groupAgeMax" min="4" max="100" style="width: 100%; padding: 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px; font-size: 16px; background: var(--bg); color: var(--text);">
        </div>
      </div>
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Макс. студентов *</label>
        <input type="number" id="groupMaxStudents" value="15" min="1" max="50" required style="width: 100%; padding: 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px; font-size: 16px; background: var(--bg); color: var(--text);">
      </div>
      <div style="margin-bottom: 24px;">
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input type="checkbox" id="groupActive" checked style="width: 20px; height: 20px; cursor: pointer;">
          <span style="font-weight: 600; color: var(--text);">Активна</span>
        </label>
      </div>
      <div style="display: flex; gap: 12px;">
        <button type="submit" class="button button--full">Сохранить</button>
        <button type="button" class="button button--ghost button--full" onclick="closeGroupModal()">Отмена</button>
      </div>
    </form>
  </div>
</div>

<script>
  function openAddModal() {
    document.getElementById('groupModalTitle').textContent = 'Добавить группу';
    document.getElementById('groupForm').reset();
    document.getElementById('groupId').value = '';
    document.getElementById('groupModal').style.display = 'flex';
  }
  
  function editGroup(id) {
    fetch(`/diplo/public/api/groups.php?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.ok && data.group) {
          const g = data.group;
          document.getElementById('groupModalTitle').textContent = 'Редактировать группу';
          document.getElementById('groupId').value = g.id;
          document.getElementById('groupName').value = g.name || '';
          document.getElementById('groupStyle').value = g.style || '';
          document.getElementById('groupLevel').value = g.level || '';
          document.getElementById('groupDay').value = g.day_of_week || '';
          document.getElementById('groupTime').value = g.time || '';
          document.getElementById('groupAgeMin').value = g.age_min || '';
          document.getElementById('groupAgeMax').value = g.age_max || '';
          document.getElementById('groupMaxStudents').value = g.max_students || 15;
          document.getElementById('groupActive').checked = g.is_active == 1;
          document.getElementById('groupModal').style.display = 'flex';
        }
      });
  }
  
  function closeGroupModal() {
    document.getElementById('groupModal').style.display = 'none';
  }
  
  document.getElementById('groupModal').addEventListener('click', (e) => {
    if (e.target.id === 'groupModal') {
      closeGroupModal();
    }
  });
  
  function toggleGroup(id, status) {
    fetch('/diplo/public/api/groups.php', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: status })
    })
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          location.reload();
        }
      });
  }
  
  function deleteGroup(id) {
    if (!confirm('Удалить эту группу?')) return;
    
    fetch(`/diplo/public/api/groups.php?id=${id}`, { method: 'DELETE' })
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          location.reload();
        }
      });
  }
  
  document.getElementById('groupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('groupId').value;
    const time = document.getElementById('groupTime').value;
    
    const data = {
      name: document.getElementById('groupName').value,
      style: document.getElementById('groupStyle').value,
      level: document.getElementById('groupLevel').value,
      day_of_week: document.getElementById('groupDay').value,
      time: time.length === 5 ? time : time + ':00',
      age_min: document.getElementById('groupAgeMin').value || null,
      age_max: document.getElementById('groupAgeMax').value || null,
      max_students: parseInt(document.getElementById('groupMaxStudents').value),
      is_active: document.getElementById('groupActive').checked ? 1 : 0
    };
    
    if (id) {
      data.id = parseInt(id);
    }
    
    const res = await fetch('/diplo/public/api/groups.php', {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await res.json();
    if (result.ok) {
      location.reload();
    } else {
      alert(result.error || 'Ошибка');
    }
  });
</script>

<?php require_once __DIR__ . '/footer.php'; ?>

