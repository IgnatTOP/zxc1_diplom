<?php
declare(strict_types=1);
require_once __DIR__ . '/../../includes/init.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'POST') {
  require_admin();
  
  $data = read_json();
  
  $pdo = get_db();
  
  $fields = [
    'title' => trim($data['title'] ?? ''),
    'subtitle' => trim($data['subtitle'] ?? ''),
    'main_text' => trim($data['main_text'] ?? ''),
    'mission_title' => trim($data['mission_title'] ?? ''),
    'mission_text' => trim($data['mission_text'] ?? ''),
    'values_title' => trim($data['values_title'] ?? ''),
    'values_text' => trim($data['values_text'] ?? ''),
    'stat1_number' => trim($data['stat1_number'] ?? ''),
    'stat1_label' => trim($data['stat1_label'] ?? ''),
    'stat2_number' => trim($data['stat2_number'] ?? ''),
    'stat2_label' => trim($data['stat2_label'] ?? ''),
    'stat3_number' => trim($data['stat3_number'] ?? ''),
    'stat3_label' => trim($data['stat3_label'] ?? ''),
    'stat4_number' => trim($data['stat4_number'] ?? ''),
    'stat4_label' => trim($data['stat4_label'] ?? ''),
    'history_title' => trim($data['history_title'] ?? ''),
    'history_text' => trim($data['history_text'] ?? ''),
    'advantages_title' => trim($data['advantages_title'] ?? ''),
    'advantage1_title' => trim($data['advantage1_title'] ?? ''),
    'advantage1_text' => trim($data['advantage1_text'] ?? ''),
    'advantage2_title' => trim($data['advantage2_title'] ?? ''),
    'advantage2_text' => trim($data['advantage2_text'] ?? ''),
    'advantage3_title' => trim($data['advantage3_title'] ?? ''),
    'advantage3_text' => trim($data['advantage3_text'] ?? ''),
    'advantage4_title' => trim($data['advantage4_title'] ?? ''),
    'advantage4_text' => trim($data['advantage4_text'] ?? ''),
    'team_title' => trim($data['team_title'] ?? ''),
    'team_text' => trim($data['team_text'] ?? ''),
  ];
  
  // Validate required fields
  foreach ($fields as $key => $value) {
    if (empty($value)) {
      json_error(422, "Поле '{$key}' обязательно для заполнения");
    }
  }
  
  try {
    $pdo->beginTransaction();
    
    foreach ($fields as $key => $value) {
      $stmt = $pdo->prepare('INSERT OR REPLACE INTO content (page, section, key_name, value, type, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)');
      $stmt->execute(['about', 'main', $key, $value, 'text']);
    }
    
    $pdo->commit();
    json_ok(['message' => 'Контент успешно сохранён']);
  } catch (Exception $e) {
    $pdo->rollBack();
    error_log('About page save error: ' . $e->getMessage());
    json_error(500, 'Ошибка сохранения: ' . $e->getMessage());
  }
} else {
  json_error(405, 'Метод не разрешён');
}

