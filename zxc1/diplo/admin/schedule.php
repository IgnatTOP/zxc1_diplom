<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/init.php';

$user = current_user();
if (!$user || $user['role'] !== 'admin') {
  header('Location: /login.php');
  exit;
}

$pdo = get_db();
$schedule = $pdo->query('SELECT * FROM schedule ORDER BY sort_order ASC, day_of_week, time')->fetchAll();

$pageTitle = 'Управление расписанием — Админ-панель';
require_once __DIR__ . '/header.php';
?>

<div class="admin-content">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
    <h2 class="section__title" style="margin: 0;">Управление расписанием</h2>
    <button class="button" onclick="openAddModal()">Добавить занятие</button>
  </div>
  
  <div style="overflow-x: auto;">
    <table class="schedule-table" style="width: 100%; border-collapse: collapse; background: var(--surface); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-sm);">
      <thead>
        <tr style="background: linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%); color: white;">
          <th style="padding: 16px; text-align: left; font-weight: 600;">День недели</th>
          <th style="padding: 16px; text-align: left; font-weight: 600;">Дата</th>
          <th style="padding: 16px; text-align: left; font-weight: 600;">Время</th>
          <th style="padding: 16px; text-align: left; font-weight: 600;">Направление</th>
          <th style="padding: 16px; text-align: left; font-weight: 600;">Уровень</th>
          <th style="padding: 16px; text-align: left; font-weight: 600;">Преподаватель</th>
          <th style="padding: 16px; text-align: left; font-weight: 600;">Статус</th>
          <th style="padding: 16px; text-align: center; font-weight: 600;">Действия</th>
        </tr>
      </thead>
      <tbody>
        <?php if (count($schedule) > 0): ?>
          <?php foreach ($schedule as $item): ?>
            <tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
              <td data-label="День недели" style="padding: 14px 16px; color: var(--text); font-weight: 600;"><?= htmlspecialchars($item['day_of_week']) ?></td>
              <td data-label="Дата" style="padding: 14px 16px; color: var(--text);">
                <?= $item['date'] ? date('d.m.Y', strtotime($item['date'])) : '<span style="color: var(--muted);">—</span>' ?>
              </td>
              <td data-label="Время" style="padding: 14px 16px; color: var(--text);"><?= htmlspecialchars($item['time']) ?></td>
              <td data-label="Направление" style="padding: 14px 16px; color: var(--text);"><?= htmlspecialchars($item['style']) ?></td>
              <td data-label="Уровень" style="padding: 14px 16px; color: var(--muted);"><?= htmlspecialchars($item['level']) ?></td>
              <td data-label="Преподаватель" style="padding: 14px 16px; color: var(--text);"><?= htmlspecialchars($item['instructor']) ?></td>
              <td data-label="Статус" style="padding: 14px 16px;">
                <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: <?= $item['is_active'] ? 'rgba(32,201,151,.1)' : 'rgba(255,77,109,.1)' ?>; color: <?= $item['is_active'] ? '#20c997' : '#ff4d6d' ?>;">
                  <?= $item['is_active'] ? 'Активно' : 'Неактивно' ?>
                </span>
              </td>
              <td data-label="Действия" style="padding: 14px 16px; text-align: center;">
                <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                  <button class="button" style="padding: 6px 12px; font-size: 13px;" onclick="editSchedule(<?= $item['id'] ?>)">Редактировать</button>
                  <button class="button" style="padding: 6px 12px; font-size: 13px; background: #ff4d6d; border-color: #ff4d6d;" onclick="deleteSchedule(<?= $item['id'] ?>)">Удалить</button>
                </div>
              </td>
            </tr>
          <?php endforeach; ?>
        <?php else: ?>
          <tr>
            <td colspan="8" style="padding: 48px; text-align: center; color: var(--muted);">
              Расписание пусто. Добавьте первое занятие!
            </td>
          </tr>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</div>

<!-- Add/Edit Modal -->
<div class="modal" id="scheduleModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); z-index: 1000; align-items: center; justify-content: center;">
  <div class="auth-card" style="max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 1001; background: var(--bg); padding: 40px; border-radius: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
    <h2 class="section__title" style="margin: 0 0 24px;" id="scheduleModalTitle">Добавить занятие</h2>
    <form id="scheduleForm">
      <input type="hidden" id="scheduleId" value="">
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">День недели *</label>
        <select id="scheduleDay" required style="width: 100%; padding: 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px; font-size: 16px; background: var(--bg); color: var(--text);">
          <option value="">Выберите день</option>
          <option value="Понедельник">Понедельник</option>
          <option value="Вторник">Вторник</option>
          <option value="Среда">Среда</option>
          <option value="Четверг">Четверг</option>
          <option value="Пятница">Пятница</option>
          <option value="Суббота">Суббота</option>
          <option value="Воскресенье">Воскресенье</option>
        </select>
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Дата</label>
        <input type="date" id="scheduleDate" style="width: 100%; padding: 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px; font-size: 16px; background: var(--bg); color: var(--text);">
        <p style="margin: 8px 0 0; color: var(--muted); font-size: 14px;">Оставьте пустым для регулярного занятия</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Время *</label>
        <input type="time" id="scheduleTime" required style="width: 100%; padding: 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px; font-size: 16px; background: var(--bg); color: var(--text);">
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Направление *</label>
        <select id="scheduleStyle" required style="width: 100%; padding: 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px; font-size: 16px; background: var(--bg); color: var(--text);">
          <option value="">Выберите направление</option>
          <option value="Hip-Hop">Hip-Hop</option>
          <option value="Contemporary">Contemporary</option>
          <option value="Latin">Latin</option>
          <option value="Kids">Kids</option>
        </select>
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Уровень *</label>
        <input type="text" id="scheduleLevel" required placeholder="Начальный, Средний, Продвинутый, 4-6 лет" style="width: 100%; padding: 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px; font-size: 16px; background: var(--bg); color: var(--text);">
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Преподаватель *</label>
        <input type="text" id="scheduleInstructor" required style="width: 100%; padding: 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px; font-size: 16px; background: var(--bg); color: var(--text);">
      </div>
      
      <div style="margin-bottom: 24px;">
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input type="checkbox" id="scheduleActive" checked style="width: 20px; height: 20px;">
          <span style="font-weight: 600; color: var(--text);">Активное занятие</span>
        </label>
      </div>
      
      <div id="scheduleFormError" style="display: none; padding: 12px; background: rgba(255,77,109,.1); border: 1px solid rgba(255,77,109,.3); border-radius: 10px; color: #ff4d6d; margin-bottom: 20px;"></div>
      
      <div style="display: flex; gap: 12px;">
        <button type="submit" class="button button--full">Сохранить</button>
        <button type="button" class="button button--ghost button--full" onclick="closeScheduleModal()">Отмена</button>
      </div>
    </form>
  </div>
</div>

<script>
let editingScheduleId = null;

function openAddModal() {
  editingScheduleId = null;
  document.getElementById('scheduleModalTitle').textContent = 'Добавить занятие';
  document.getElementById('scheduleForm').reset();
  document.getElementById('scheduleId').value = '';
  document.getElementById('scheduleActive').checked = true;
  document.getElementById('scheduleFormError').style.display = 'none';
  document.getElementById('scheduleModal').style.display = 'flex';
}

function editSchedule(id) {
  editingScheduleId = id;
  document.getElementById('scheduleModalTitle').textContent = 'Редактировать занятие';
  
  fetch(`/diplo/public/api/schedule.php?id=${id}`)
    .then(r => r.json())
    .then(data => {
      if (data.ok) {
        const item = data.item;
        document.getElementById('scheduleId').value = item.id;
        document.getElementById('scheduleDay').value = item.day_of_week;
        document.getElementById('scheduleDate').value = item.date || '';
        document.getElementById('scheduleTime').value = item.time;
        document.getElementById('scheduleStyle').value = item.style;
        document.getElementById('scheduleLevel').value = item.level;
        document.getElementById('scheduleInstructor').value = item.instructor;
        document.getElementById('scheduleActive').checked = item.is_active == 1;
        document.getElementById('scheduleFormError').style.display = 'none';
        document.getElementById('scheduleModal').style.display = 'flex';
      } else {
        alert('Ошибка загрузки: ' + (data.error || 'Неизвестная ошибка'));
      }
    })
    .catch(err => {
      console.error(err);
      alert('Ошибка сети');
    });
}

function closeScheduleModal() {
  document.getElementById('scheduleModal').style.display = 'none';
  editingScheduleId = null;
}

function deleteSchedule(id) {
  if (!confirm('Вы уверены, что хотите удалить это занятие?')) return;
  
  fetch(`/diplo/public/api/schedule.php`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  })
    .then(r => r.json())
    .then(data => {
      if (data.ok) {
        location.reload();
      } else {
        alert('Ошибка удаления: ' + (data.error || 'Неизвестная ошибка'));
      }
    })
    .catch(err => {
      console.error(err);
      alert('Ошибка сети');
    });
}

document.getElementById('scheduleForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const errorDiv = document.getElementById('scheduleFormError');
  errorDiv.style.display = 'none';
  
  const data = {
    day_of_week: document.getElementById('scheduleDay').value,
    date: document.getElementById('scheduleDate').value || null,
    time: document.getElementById('scheduleTime').value,
    style: document.getElementById('scheduleStyle').value,
    level: document.getElementById('scheduleLevel').value,
    instructor: document.getElementById('scheduleInstructor').value,
    is_active: document.getElementById('scheduleActive').checked ? 1 : 0
  };
  
  if (editingScheduleId) {
    data.id = editingScheduleId;
  }
  
  try {
    const res = await fetch('/diplo/public/api/schedule.php', {
      method: editingScheduleId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await res.json();
    
    if (result.ok) {
      location.reload();
    } else {
      errorDiv.textContent = result.error || 'Ошибка сохранения';
      errorDiv.style.display = 'block';
    }
  } catch (err) {
    console.error(err);
    errorDiv.textContent = 'Ошибка сети';
    errorDiv.style.display = 'block';
  }
});

// Close modal on click outside
document.getElementById('scheduleModal').addEventListener('click', (e) => {
  if (e.target.id === 'scheduleModal') {
    closeScheduleModal();
  }
});
</script>

<?php require_once __DIR__ . '/footer.php'; ?>

