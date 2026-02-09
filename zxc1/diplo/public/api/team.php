<?php
declare(strict_types=1);
require_once __DIR__ . '/../../includes/init.php';

if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$pdo = get_db();

if ($method === 'GET') {
  $members = $pdo->query('SELECT * FROM team_members WHERE is_active = 1 ORDER BY sort_order ASC, id ASC')->fetchAll();
  json_ok(['members' => $members]);
}

if ($method === 'POST') {
  require_admin();
  
  $data = read_json();
  $name = trim($data['name'] ?? '');
  $experience = trim($data['experience'] ?? '');
  $photo = trim($data['photo'] ?? '');
  
  if (empty($name) || empty($experience)) {
    json_error(422, 'Заполните все обязательные поля');
  }
  
  try {
    $stmt = $pdo->prepare('INSERT INTO team_members (name, experience, photo, sort_order) VALUES (:name, :experience, :photo, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM team_members))');
    $stmt->execute([
      ':name' => $name,
      ':experience' => $experience,
      ':photo' => $photo ?: null,
    ]);
    json_ok(['id' => (int)$pdo->lastInsertId(), 'message' => 'Преподаватель добавлен']);
  } catch (Exception $e) {
    error_log('Team member create error: ' . $e->getMessage());
    json_error(500, 'Ошибка сохранения: ' . $e->getMessage());
  }
}

if ($method === 'PUT') {
  require_admin();
  
  $data = read_json();
  $id = (int)($data['id'] ?? 0);
  $name = trim($data['name'] ?? '');
  $experience = trim($data['experience'] ?? '');
  $photo = isset($data['photo']) ? trim($data['photo']) : null;
  
  if ($id === 0 || empty($name) || empty($experience)) {
    json_error(422, 'Заполните все обязательные поля');
  }
  
  try {
    // If photo is not provided in request, keep existing photo
    if ($photo === null) {
      $stmt = $pdo->prepare('SELECT photo FROM team_members WHERE id = :id');
      $stmt->execute([':id' => $id]);
      $current = $stmt->fetch();
      $photo = $current['photo'] ?? null;
      
      // Update only name and experience
      $stmt = $pdo->prepare('UPDATE team_members SET name = :name, experience = :experience, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
      $stmt->execute([
        ':id' => $id,
        ':name' => $name,
        ':experience' => $experience,
      ]);
    } else {
      // Update with new photo (even if empty string - to remove photo)
      $stmt = $pdo->prepare('UPDATE team_members SET name = :name, experience = :experience, photo = :photo, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
      $stmt->execute([
        ':id' => $id,
        ':name' => $name,
        ':experience' => $experience,
        ':photo' => empty($photo) ? null : $photo,
      ]);
    }
    
    json_ok(['message' => 'Изменения сохранены']);
  } catch (Exception $e) {
    error_log('Team member update error: ' . $e->getMessage());
    json_error(500, 'Ошибка сохранения: ' . $e->getMessage());
  }
}

if ($method === 'DELETE') {
  require_admin();
  
  $data = read_json();
  $id = (int)($data['id'] ?? 0);
  
  if ($id === 0) {
    json_error(422, 'Не указан ID');
  }
  
  try {
    $stmt = $pdo->prepare('UPDATE team_members SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
    $stmt->execute([':id' => $id]);
    json_ok(['message' => 'Преподаватель удален']);
  } catch (Exception $e) {
    error_log('Team member delete error: ' . $e->getMessage());
    json_error(500, 'Ошибка удаления: ' . $e->getMessage());
  }
}

json_error(405, 'Метод не разрешён');

