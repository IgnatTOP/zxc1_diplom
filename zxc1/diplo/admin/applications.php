<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/init.php';

$user = current_user();
if (!$user || $user['role'] !== 'admin') {
  header('Location: /login.php');
  exit;
}

$pdo = get_db();
$applications = $pdo->query('SELECT * FROM applications ORDER BY created_at DESC')->fetchAll();
$groups = $pdo->query('SELECT * FROM groups WHERE is_active = 1 ORDER BY day_of_week, time')->fetchAll();

// Helper function to auto-assign group
function autoAssignGroup($pdo, $application) {
  $style = $application['style'];
  $level = $application['level'];
  $age = $application['age'];
  
  // Find suitable group
  $sql = 'SELECT * FROM groups WHERE style = :style AND level = :level AND is_active = 1';
  $params = [':style' => $style, ':level' => $level];
  
  if ($age !== null) {
    $sql .= ' AND (age_min IS NULL OR age_min <= :age) AND (age_max IS NULL OR age_max >= :age)';
    $params[':age'] = $age;
  }
  
  $sql .= ' AND current_students < max_students ORDER BY current_students ASC LIMIT 1';
  
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $group = $stmt->fetch();
  
  if ($group) {
    // Update application
    $pdo->prepare('UPDATE applications SET 
      assigned_group = :group_name,
      assigned_day = :day,
      assigned_time = :time,
      status = "assigned",
      updated_at = CURRENT_TIMESTAMP
      WHERE id = :id')
      ->execute([
        ':group_name' => $group['name'],
        ':day' => $group['day_of_week'],
        ':time' => $group['time'],
        ':id' => $application['id']
      ]);
    
    // Update group student count
    $pdo->prepare('UPDATE groups SET current_students = current_students + 1 WHERE id = :id')
      ->execute([':id' => $group['id']]);
    
    return $group;
  }
  
  return null;
}

$pageTitle = 'Управление заявками — Админ-панель';
require_once __DIR__ . '/header.php';
?>

<div class="admin-content">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
    <h2 class="section__title" style="margin: 0;">Управление заявками</h2>
    <div style="display: flex; gap: 0.75rem;">
      <button class="button" onclick="autoAssignAll()" style="padding: 10px 18px; font-size: 14px;">Автораспределить все</button>
      <a href="groups.php" class="button button--ghost" style="padding: 10px 18px; font-size: 14px;">Управление группами</a>
    </div>
  </div>
  
  <div style="display: grid; gap: 1rem;">
    <?php foreach ($applications as $app): ?>
      <div class="card" style="padding: 1.5rem;">
        <div style="display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: start;">
          <div>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;">
              <div>
                <strong style="color: var(--muted); font-size: 12px; text-transform: uppercase;">Имя:</strong>
                <div style="font-weight: 600; margin-top: 4px;"><?= htmlspecialchars($app['name']) ?></div>
              </div>
              <div>
                <strong style="color: var(--muted); font-size: 12px; text-transform: uppercase;">Телефон:</strong>
                <div style="margin-top: 4px;"><?= htmlspecialchars($app['phone']) ?></div>
              </div>
              <?php if ($app['email']): ?>
                <div>
                  <strong style="color: var(--muted); font-size: 12px; text-transform: uppercase;">Email:</strong>
                  <div style="margin-top: 4px;"><?= htmlspecialchars($app['email']) ?></div>
                </div>
              <?php endif; ?>
              <?php if ($app['age']): ?>
                <div>
                  <strong style="color: var(--muted); font-size: 12px; text-transform: uppercase;">Возраст:</strong>
                  <div style="margin-top: 4px;"><?= $app['age'] ?> лет</div>
                </div>
              <?php endif; ?>
              <?php if ($app['weight']): ?>
                <div>
                  <strong style="color: var(--muted); font-size: 12px; text-transform: uppercase;">Вес:</strong>
                  <div style="margin-top: 4px;"><?= $app['weight'] ?> кг</div>
                </div>
              <?php endif; ?>
            </div>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <div>
                <strong style="color: var(--muted); font-size: 12px; text-transform: uppercase;">Направление:</strong>
                <div style="margin-top: 4px; font-weight: 600;"><?= htmlspecialchars($app['style']) ?></div>
              </div>
              <div>
                <strong style="color: var(--muted); font-size: 12px; text-transform: uppercase;">Уровень:</strong>
                <div style="margin-top: 4px; font-weight: 600;"><?= htmlspecialchars($app['level']) ?></div>
              </div>
              <div>
                <strong style="color: var(--muted); font-size: 12px; text-transform: uppercase;">Статус:</strong>
                <div style="margin-top: 4px;">
                  <span style="display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; background: <?= $app['status'] === 'assigned' ? 'rgba(32,201,151,.2)' : ($app['status'] === 'rejected' ? 'rgba(255,77,109,.2)' : 'rgba(161,192,212,.2)') ?>; color: <?= $app['status'] === 'assigned' ? '#20c997' : ($app['status'] === 'rejected' ? '#ff4d6d' : 'var(--brand)') ?>;">
                    <?= $app['status'] === 'assigned' ? 'Назначена' : ($app['status'] === 'rejected' ? 'Отклонена' : 'Ожидает') ?>
                  </span>
                </div>
              </div>
            </div>
            <?php if ($app['assigned_group']): ?>
              <div style="margin-top: 1rem; padding: 1rem; background: var(--surface); border-radius: 10px;">
                <strong style="color: var(--text);">Назначена группа:</strong>
                <div style="margin-top: 0.5rem;">
                  <div><strong>Группа:</strong> <?= htmlspecialchars($app['assigned_group']) ?></div>
                  <div><strong>День:</strong> <?= htmlspecialchars($app['assigned_day']) ?></div>
                  <div><strong>Время:</strong> <?= htmlspecialchars($app['assigned_time']) ?></div>
                  <?php if ($app['assigned_date']): ?>
                    <div><strong>Дата:</strong> <?= date('d.m.Y', strtotime($app['assigned_date'])) ?></div>
                  <?php endif; ?>
                </div>
              </div>
            <?php endif; ?>
            <div style="margin-top: 0.5rem; color: var(--muted); font-size: 12px;">
              Подана: <?= date('d.m.Y H:i', strtotime($app['created_at'])) ?>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <button class="button" style="padding: 8px 16px; font-size: 14px;" onclick="assignGroup(<?= $app['id'] ?>)">
              Назначить группу
            </button>
            <button class="button" style="padding: 8px 16px; font-size: 14px; background: #20c997; border-color: #20c997;" onclick="autoAssign(<?= $app['id'] ?>)">
              Автораспределить
            </button>
            <button class="button" style="padding: 8px 16px; font-size: 14px; background: #ff4d6d; border-color: #ff4d6d;" onclick="reject(<?= $app['id'] ?>)">
              Отклонить
            </button>
          </div>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
</div>

<!-- Assign Group Modal -->
<div class="modal" id="assignModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); z-index: 1000; align-items: center; justify-content: center;">
  <div class="auth-card" style="max-width: 500px; width: 90%; position: relative; z-index: 1001; background: var(--bg); padding: 40px; border-radius: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid rgba(255,255,255,0.1);">
    <h2 class="section__title" style="margin: 0 0 24px; text-align: left; font-size: 28px;">Назначить группу</h2>
    <form id="assignForm" class="form form--auth">
      <input type="hidden" id="assignAppId">
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Группа *</label>
        <select id="assignGroup" required style="width: 100%; padding: 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px; font-size: 16px; background: var(--bg); color: var(--text);">
          <option value="">Выберите группу</option>
          <?php foreach ($groups as $g): ?>
            <option value="<?= htmlspecialchars($g['name']) ?>" data-day="<?= htmlspecialchars($g['day_of_week']) ?>" data-time="<?= htmlspecialchars($g['time']) ?>">
              <?= htmlspecialchars($g['name']) ?> - <?= htmlspecialchars($g['day_of_week']) ?> <?= htmlspecialchars($g['time']) ?>
            </option>
          <?php endforeach; ?>
        </select>
      </div>
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Дата начала</label>
        <input type="date" id="assignDate" style="width: 100%; padding: 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px; font-size: 16px; background: var(--bg); color: var(--text);">
      </div>
      <div style="margin-bottom: 24px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Примечания</label>
        <textarea id="assignNotes" style="width: 100%; min-height: 80px; padding: 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px; font-family: inherit; font-size: 16px; background: var(--bg); color: var(--text); resize: vertical;"></textarea>
      </div>
      <div style="display: flex; gap: 12px;">
        <button type="submit" class="button button--full">Назначить</button>
        <button type="button" class="button button--ghost button--full" onclick="closeAssignModal()">Отмена</button>
      </div>
    </form>
  </div>
</div>

<script>
  function assignGroup(id) {
    document.getElementById('assignAppId').value = id;
    document.getElementById('assignModal').style.display = 'flex';
  }
  
  function closeAssignModal() {
    document.getElementById('assignModal').style.display = 'none';
  }
  
  function autoAssign(id) {
    if (!confirm('Автоматически распределить эту заявку в подходящую группу?')) return;
    
    fetch(`/diplo/public/api/applications.php?id=${id}&auto=1`, { method: 'PUT' })
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          location.reload();
        } else {
          alert(data.error || 'Ошибка распределения');
        }
      });
  }
  
  function autoAssignAll() {
    if (!confirm('Автоматически распределить все ожидающие заявки?')) return;
    
    fetch('/diplo/public/api/applications.php?action=auto_assign_all', { method: 'PUT' })
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          alert('Распределено заявок: ' + (data.assigned || 0));
          location.reload();
        } else {
          alert(data.error || 'Ошибка');
        }
      });
  }
  
  function reject(id) {
    if (!confirm('Отклонить эту заявку?')) return;
    
    fetch('/diplo/public/api/applications.php', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'rejected' })
    })
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          location.reload();
        }
      });
  }
  
  document.getElementById('assignForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('assignAppId').value;
    const groupSelect = document.getElementById('assignGroup');
    const selectedOption = groupSelect.options[groupSelect.selectedIndex];
    
    const data = {
      id: parseInt(id),
      status: 'assigned',
      assigned_group: groupSelect.value,
      assigned_day: selectedOption.dataset.day,
      assigned_time: selectedOption.dataset.time,
      assigned_date: document.getElementById('assignDate').value || null,
      notes: document.getElementById('assignNotes').value || null
    };
    
    const res = await fetch('/diplo/public/api/applications.php', {
      method: 'PUT',
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
  
  document.getElementById('assignModal').addEventListener('click', (e) => {
    if (e.target.id === 'assignModal') {
      closeAssignModal();
    }
  });
</script>

<?php require_once __DIR__ . '/footer.php'; ?>

