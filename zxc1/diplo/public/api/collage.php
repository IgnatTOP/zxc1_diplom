<?php
declare(strict_types=1);
require_once __DIR__ . '/../../includes/init.php';

$pdo = get_db();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  // Get all collages or single collage by id
  $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
  
  if ($id) {
    // Get single collage
    $stmt = $pdo->prepare('SELECT * FROM collages WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $collage = $stmt->fetch();
    
    if ($collage) {
      $collage['photos'] = $collage['photos'] ? json_decode($collage['photos'], true) : [];
      json_ok(['collage' => $collage]);
    } else {
      json_error(404, 'Коллаж не найден');
    }
  } else {
    // Get all collages
    $stmt = $pdo->query('SELECT * FROM collages ORDER BY id DESC');
    $collages = $stmt->fetchAll();
    
    foreach ($collages as &$collage) {
      $collage['photos'] = $collage['photos'] ? json_decode($collage['photos'], true) : [];
    }
    
    json_ok(['collages' => $collages]);
  }
  exit;
}

// All other methods require admin
require_admin();

if ($method === 'POST') {
  error_log('[collage.php] POST request received');
  $input = file_get_contents('php://input');
  error_log('[collage.php] Raw input: ' . $input);
  
  $data = json_decode($input, true);
  error_log('[collage.php] Decoded data: ' . print_r($data, true));
  
  if (json_last_error() !== JSON_ERROR_NONE) {
    error_log('[collage.php] JSON decode error: ' . json_last_error_msg());
    json_error(400, 'Неверный формат JSON: ' . json_last_error_msg());
    exit;
  }
  
  $title = trim($data['title'] ?? '');
  $main_image = trim($data['main_image'] ?? '');
  $photos = isset($data['photos']) && is_array($data['photos']) ? $data['photos'] : [];
  $photo_count = isset($data['photo_count']) ? (int)$data['photo_count'] : 4;
  
  error_log('[collage.php] Title: ' . $title);
  error_log('[collage.php] Main image: ' . $main_image);
  error_log('[collage.php] Photos count: ' . count($photos));
  error_log('[collage.php] Photo count required: ' . $photo_count);
  
  if (empty($title)) {
    error_log('[collage.php] Validation failed: empty title');
    json_error(422, 'Укажите название коллажа');
    exit;
  }
  
  if (empty($main_image)) {
    error_log('[collage.php] Validation failed: empty main_image');
    json_error(422, 'Загрузите главное изображение');
    exit;
  }
  
  if ($photo_count < 0 || $photo_count > 20) {
    error_log('[collage.php] Validation failed: invalid photo_count: ' . $photo_count);
    json_error(422, 'Количество фотографий должно быть от 0 до 20');
    exit;
  }
  
  // If photo_count is 0, allow empty photos array (only main image)
  if ($photo_count > 0 && count($photos) !== $photo_count) {
    error_log('[collage.php] Validation failed: photo count mismatch. Required: ' . $photo_count . ', Got: ' . count($photos));
    json_error(422, "Необходимо загрузить ровно {$photo_count} фотографий. Загружено: " . count($photos));
    exit;
  }
  
  // Create new collage
  error_log('[collage.php] Inserting collage into database...');
  $stmt = $pdo->prepare('INSERT INTO collages (title, main_image, photos, photo_count) 
                         VALUES (:title, :main_image, :photos, :photo_count)');
  $result = $stmt->execute([
    ':title' => $title,
    ':main_image' => $main_image,
    ':photos' => json_encode($photos, JSON_UNESCAPED_UNICODE),
    ':photo_count' => $photo_count,
  ]);
  
  if (!$result) {
    error_log('[collage.php] Database insert failed!');
    json_error(500, 'Ошибка сохранения в базу данных');
    exit;
  }
  
  $newId = (int)$pdo->lastInsertId();
  error_log('[collage.php] Collage created successfully with ID: ' . $newId);
  
  // Verify insertion
  $verify = $pdo->prepare('SELECT * FROM collages WHERE id = :id');
  $verify->execute([':id' => $newId]);
  $created = $verify->fetch();
  
  if ($created) {
    error_log('[collage.php] Verification: collage found in database');
    error_log('[collage.php] Created collage title: ' . $created['title']);
  } else {
    error_log('[collage.php] WARNING: Collage not found after creation!');
  }
  
  json_ok(['id' => $newId, 'message' => 'Коллаж создан']);
  exit;
}

if ($method === 'PUT') {
  $data = json_decode(file_get_contents('php://input'), true);
  
  $id = (int)($data['id'] ?? 0);
  $title = trim($data['title'] ?? '');
  $main_image = trim($data['main_image'] ?? '');
  $photos = isset($data['photos']) && is_array($data['photos']) ? $data['photos'] : [];
  $photo_count = isset($data['photo_count']) ? (int)$data['photo_count'] : 4;
  
  if ($id <= 0) {
    json_error(422, 'Неверный ID');
  }
  
  // Check if collage exists
  $checkStmt = $pdo->prepare('SELECT id FROM collages WHERE id = :id');
  $checkStmt->execute([':id' => $id]);
  if (!$checkStmt->fetch()) {
    json_error(404, 'Коллаж не найден');
  }
  
  if (empty($title)) {
    json_error(422, 'Укажите название коллажа');
  }
  
  if (empty($main_image)) {
    json_error(422, 'Загрузите главное изображение');
  }
  
  if ($photo_count < 0 || $photo_count > 20) {
    json_error(422, 'Количество фотографий должно быть от 0 до 20');
  }
  
  // If photo_count is 0, allow empty photos array (only main image)
  if ($photo_count > 0 && count($photos) !== $photo_count) {
    json_error(422, "Необходимо загрузить ровно {$photo_count} фотографий. Загружено: " . count($photos));
  }
  
  // Update existing collage
  $stmt = $pdo->prepare('UPDATE collages 
                         SET title = :title, main_image = :main_image, photos = :photos, 
                             photo_count = :photo_count, updated_at = CURRENT_TIMESTAMP 
                         WHERE id = :id');
  $stmt->execute([
    ':id' => $id,
    ':title' => $title,
    ':main_image' => $main_image,
    ':photos' => json_encode($photos, JSON_UNESCAPED_UNICODE),
    ':photo_count' => $photo_count,
  ]);
  
  // Verify update
  $verifyStmt = $pdo->prepare('SELECT id, title FROM collages WHERE id = :id');
  $verifyStmt->execute([':id' => $id]);
  $updated = $verifyStmt->fetch();
  
  json_ok(['message' => 'Коллаж обновлен', 'updated_id' => $updated['id'], 'updated_title' => $updated['title']]);
  exit;
}

if ($method === 'DELETE') {
  $id = (int)($_GET['id'] ?? 0);
  
  if ($id <= 0) {
    json_error(422, 'Неверный ID');
  }
  
  $stmt = $pdo->prepare('DELETE FROM collages WHERE id = :id');
  $stmt->execute([':id' => $id]);
  
  json_ok(['message' => 'Коллаж удален']);
  exit;
}

json_error(405, 'Method Not Allowed');
