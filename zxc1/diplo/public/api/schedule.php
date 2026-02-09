<?php
declare(strict_types=1);
require_once __DIR__ . '/../../includes/init.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = get_db();

if ($method === 'GET') {
  // Get single item
  if (isset($_GET['id'])) {
    $stmt = $pdo->prepare('SELECT * FROM schedule WHERE id = :id');
    $stmt->execute([':id' => $_GET['id']]);
    $item = $stmt->fetch();
    
    if ($item) {
      json_ok(['item' => $item]);
    } else {
      json_error(404, 'Занятие не найдено');
    }
    exit;
  }
  
  // Get all active schedule items
  $stmt = $pdo->query('SELECT * FROM schedule WHERE is_active = 1 ORDER BY sort_order ASC, day_of_week, time');
  $items = $stmt->fetchAll();
  
  json_ok(['items' => $items]);
}

if ($method === 'POST') {
  require_admin();
  
  $data = read_json();
  $day_of_week = trim($data['day_of_week'] ?? '');
  $date = !empty($data['date']) ? trim($data['date']) : null;
  $time = trim($data['time'] ?? '');
  $style = trim($data['style'] ?? '');
  $level = trim($data['level'] ?? '');
  $instructor = trim($data['instructor'] ?? '');
  $is_active = isset($data['is_active']) ? (int)$data['is_active'] : 1;
  $sort_order = isset($data['sort_order']) ? (int)$data['sort_order'] : 0;
  
  if (empty($day_of_week) || empty($time) || empty($style) || empty($level) || empty($instructor)) {
    json_error(422, 'Заполните все обязательные поля');
  }
  
  $stmt = $pdo->prepare('INSERT INTO schedule (day_of_week, date, time, style, level, instructor, is_active, sort_order) 
                          VALUES (:day_of_week, :date, :time, :style, :level, :instructor, :is_active, :sort_order)');
  $stmt->execute([
    ':day_of_week' => $day_of_week,
    ':date' => $date,
    ':time' => $time,
    ':style' => $style,
    ':level' => $level,
    ':instructor' => $instructor,
    ':is_active' => $is_active,
    ':sort_order' => $sort_order,
  ]);
  
  json_ok(['id' => (int)$pdo->lastInsertId(), 'message' => 'Занятие добавлено']);
}

if ($method === 'PUT') {
  require_admin();
  
  $data = read_json();
  $id = isset($data['id']) ? (int)$data['id'] : 0;
  
  if ($id <= 0) {
    json_error(422, 'Неверный ID');
  }
  
  $day_of_week = trim($data['day_of_week'] ?? '');
  $date = !empty($data['date']) ? trim($data['date']) : null;
  $time = trim($data['time'] ?? '');
  $style = trim($data['style'] ?? '');
  $level = trim($data['level'] ?? '');
  $instructor = trim($data['instructor'] ?? '');
  $is_active = isset($data['is_active']) ? (int)$data['is_active'] : 1;
  $sort_order = isset($data['sort_order']) ? (int)$data['sort_order'] : 0;
  
  if (empty($day_of_week) || empty($time) || empty($style) || empty($level) || empty($instructor)) {
    json_error(422, 'Заполните все обязательные поля');
  }
  
  $stmt = $pdo->prepare('UPDATE schedule SET day_of_week = :day_of_week, date = :date, time = :time, style = :style, level = :level, instructor = :instructor, is_active = :is_active, sort_order = :sort_order, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
  $stmt->execute([
    ':id' => $id,
    ':day_of_week' => $day_of_week,
    ':date' => $date,
    ':time' => $time,
    ':style' => $style,
    ':level' => $level,
    ':instructor' => $instructor,
    ':is_active' => $is_active,
    ':sort_order' => $sort_order,
  ]);
  
  if ($stmt->rowCount() > 0) {
    json_ok(['message' => 'Занятие обновлено']);
  } else {
    json_error(404, 'Занятие не найдено');
  }
}

if ($method === 'DELETE') {
  require_admin();
  
  $data = read_json();
  $id = isset($data['id']) ? (int)$data['id'] : 0;
  
  if ($id <= 0) {
    json_error(422, 'Неверный ID');
  }
  
  $stmt = $pdo->prepare('DELETE FROM schedule WHERE id = :id');
  $stmt->execute([':id' => $id]);
  
  if ($stmt->rowCount() > 0) {
    json_ok(['message' => 'Занятие удалено']);
  } else {
    json_error(404, 'Занятие не найдено');
  }
}

json_error(405, 'Method Not Allowed');


