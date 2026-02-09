<?php
declare(strict_types=1);
require_once __DIR__ . '/../../includes/init.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = get_db();

if ($method === 'GET') {
  // Get all active gallery items
  $stmt = $pdo->query('SELECT id, filename, title, description, alt_text, sort_order 
                        FROM gallery 
                        WHERE is_active = 1 
                        ORDER BY sort_order ASC, created_at DESC');
  $items = $stmt->fetchAll();
  
  // Add full URL to images
  foreach ($items as &$item) {
    $item['url'] = UPLOAD_URL . $item['filename'];
  }
  
  json_ok(['items' => $items]);
}

if ($method === 'POST') {
  require_admin();
  
  $data = read_json();
  $title = trim($data['title'] ?? '');
  $description = trim($data['description'] ?? '');
  $alt_text = trim($data['alt_text'] ?? '');
  $filename = trim($data['filename'] ?? '');
  $sort_order = (int)($data['sort_order'] ?? 0);
  
  if (empty($filename)) {
    json_error(422, 'Укажите имя файла');
  }
  
  $stmt = $pdo->prepare('INSERT INTO gallery (filename, title, description, alt_text, sort_order) 
                          VALUES (:filename, :title, :description, :alt_text, :sort_order)');
  $stmt->execute([
    ':filename' => $filename,
    ':title' => $title ?: null,
    ':description' => $description ?: null,
    ':alt_text' => $alt_text ?: null,
    ':sort_order' => $sort_order,
  ]);
  
  json_ok(['id' => (int)$pdo->lastInsertId()]);
}

if ($method === 'PUT') {
  require_admin();
  
  $data = read_json();
  $id = (int)($data['id'] ?? 0);
  
  if ($id <= 0) {
    json_error(422, 'Неверный ID');
  }
  
  $title = trim($data['title'] ?? '');
  $description = trim($data['description'] ?? '');
  $alt_text = trim($data['alt_text'] ?? '');
  $sort_order = (int)($data['sort_order'] ?? 0);
  $is_active = isset($data['is_active']) ? (int)$data['is_active'] : 1;
  
  $stmt = $pdo->prepare('UPDATE gallery 
                          SET title = :title, description = :description, alt_text = :alt_text, 
                              sort_order = :sort_order, is_active = :is_active, 
                              updated_at = CURRENT_TIMESTAMP
                          WHERE id = :id');
  $stmt->execute([
    ':id' => $id,
    ':title' => $title ?: null,
    ':description' => $description ?: null,
    ':alt_text' => $alt_text ?: null,
    ':sort_order' => $sort_order,
    ':is_active' => $is_active,
  ]);
  
  json_ok();
}

if ($method === 'DELETE') {
  require_admin();
  
  $id = (int)($_GET['id'] ?? 0);
  
  if ($id <= 0) {
    json_error(422, 'Неверный ID');
  }
  
  $stmt = $pdo->prepare('DELETE FROM gallery WHERE id = :id');
  $stmt->execute([':id' => $id]);
  
  json_ok();
}

json_error(405, 'Метод не поддерживается');

