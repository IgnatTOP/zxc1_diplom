<?php
declare(strict_types=1);
require_once __DIR__ . '/../../includes/init.php';

require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // Create group
  $payload = read_json();
  
  $name = trim($payload['name'] ?? '');
  $style = trim($payload['style'] ?? '');
  $level = trim($payload['level'] ?? '');
  $day = trim($payload['day_of_week'] ?? '');
  $time = trim($payload['time'] ?? '');
  $ageMin = isset($payload['age_min']) && $payload['age_min'] ? (int)$payload['age_min'] : null;
  $ageMax = isset($payload['age_max']) && $payload['age_max'] ? (int)$payload['age_max'] : null;
  $maxStudents = (int)($payload['max_students'] ?? 15);
  $isActive = isset($payload['is_active']) ? (int)$payload['is_active'] : 1;
  
  if ($name === '' || $style === '' || $level === '' || $day === '' || $time === '') {
    json_error(422, 'Заполните все обязательные поля');
  }
  
  try {
    $pdo = get_db();
    $stmt = $pdo->prepare('INSERT INTO groups (name, style, level, day_of_week, time, age_min, age_max, max_students, is_active) VALUES (:name, :style, :level, :day, :time, :age_min, :age_max, :max_students, :is_active)');
    $stmt->execute([
      ':name' => $name,
      ':style' => $style,
      ':level' => $level,
      ':day' => $day,
      ':time' => $time,
      ':age_min' => $ageMin,
      ':age_max' => $ageMax,
      ':max_students' => $maxStudents,
      ':is_active' => $isActive
    ]);
    
    json_ok(['message' => 'Группа создана']);
  } catch (Throwable $e) {
    json_error(500, 'Ошибка сервера');
  }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
  // Get groups
  $pdo = get_db();
  $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
  
  if ($id) {
    $stmt = $pdo->prepare('SELECT * FROM groups WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $group = $stmt->fetch();
    if ($group) {
      json_ok(['group' => $group]);
    } else {
      json_error(404, 'Группа не найдена');
    }
  } else {
    $groups = $pdo->query('SELECT * FROM groups ORDER BY day_of_week, time')->fetchAll();
    json_ok(['groups' => $groups]);
  }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
  // Update group
  $payload = read_json();
  $id = (int)($payload['id'] ?? 0);
  
  if ($id === 0) {
    json_error(422, 'Не указан ID группы');
  }
  
  try {
    $pdo = get_db();
    $updates = [];
    $params = [':id' => $id];
    
    if (isset($payload['name'])) {
      $updates[] = 'name = :name';
      $params[':name'] = $payload['name'];
    }
    if (isset($payload['style'])) {
      $updates[] = 'style = :style';
      $params[':style'] = $payload['style'];
    }
    if (isset($payload['level'])) {
      $updates[] = 'level = :level';
      $params[':level'] = $payload['level'];
    }
    if (isset($payload['day_of_week'])) {
      $updates[] = 'day_of_week = :day_of_week';
      $params[':day_of_week'] = $payload['day_of_week'];
    }
    if (isset($payload['time'])) {
      $updates[] = 'time = :time';
      $params[':time'] = $payload['time'];
    }
    if (isset($payload['age_min'])) {
      $updates[] = 'age_min = :age_min';
      $params[':age_min'] = $payload['age_min'] ?: null;
    }
    if (isset($payload['age_max'])) {
      $updates[] = 'age_max = :age_max';
      $params[':age_max'] = $payload['age_max'] ?: null;
    }
    if (isset($payload['max_students'])) {
      $updates[] = 'max_students = :max_students';
      $params[':max_students'] = (int)$payload['max_students'];
    }
    if (isset($payload['is_active'])) {
      $updates[] = 'is_active = :is_active';
      $params[':is_active'] = (int)$payload['is_active'];
    }
    
    if (empty($updates)) {
      json_error(422, 'Нет данных для обновления');
    }
    
    $updates[] = 'updated_at = CURRENT_TIMESTAMP';
    $sql = 'UPDATE groups SET ' . implode(', ', $updates) . ' WHERE id = :id';
    $pdo->prepare($sql)->execute($params);
    
    json_ok(['message' => 'Группа обновлена']);
  } catch (Throwable $e) {
    json_error(500, 'Ошибка сервера');
  }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  // Delete group
  $id = (int)($_GET['id'] ?? 0);
  
  if ($id === 0) {
    json_error(422, 'Не указан ID группы');
  }
  
  try {
    $pdo = get_db();
    $pdo->prepare('DELETE FROM groups WHERE id = :id')->execute([':id' => $id]);
    json_ok(['message' => 'Группа удалена']);
  } catch (Throwable $e) {
    json_error(500, 'Ошибка сервера');
  }
} else {
  json_error(405, 'Метод не поддерживается');
}

