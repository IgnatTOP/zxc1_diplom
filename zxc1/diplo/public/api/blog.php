<?php
declare(strict_types=1);
require_once __DIR__ . '/../../includes/init.php';

if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? 'post';
$pdo = get_db();

// Page settings
if ($action === 'page_settings' && $method === 'POST') {
  require_admin();
  
  $data = read_json();
  
  $fields = [
    'page_title' => trim($data['page_title'] ?? ''),
    'page_subtitle' => trim($data['page_subtitle'] ?? ''),
    'intro_text' => trim($data['intro_text'] ?? ''),
  ];
  
  foreach ($fields as $key => $value) {
    if (empty($value) && $key !== 'intro_text') {
      json_error(422, "Поле '{$key}' обязательно для заполнения");
    }
  }
  
  try {
    $pdo->beginTransaction();
    
    foreach ($fields as $key => $value) {
      $stmt = $pdo->prepare('INSERT OR REPLACE INTO content (page, section, key_name, value, type, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)');
      $stmt->execute(['blog', 'main', $key, $value, 'text']);
    }
    
    $pdo->commit();
    json_ok(['message' => 'Настройки сохранены']);
  } catch (Exception $e) {
    $pdo->rollBack();
    error_log('Blog page settings save error: ' . $e->getMessage());
    json_error(500, 'Ошибка сохранения: ' . $e->getMessage());
  }
}

// Blog posts CRUD
if ($action === 'post') {
  if ($method === 'GET') {
    $posts = $pdo->query('SELECT * FROM blog_posts ORDER BY sort_order ASC, created_at DESC')->fetchAll();
    json_ok(['posts' => $posts]);
  }
  
  if ($method === 'POST') {
    require_admin();
    
    $data = read_json();
    $title = trim($data['title'] ?? '');
    $excerpt = trim($data['excerpt'] ?? '');
    $content = trim($data['content'] ?? '');
    $author = trim($data['author'] ?? '');
    $publishedDate = !empty($data['published_date']) ? trim($data['published_date']) : null;
    $featuredImage = trim($data['featured_image'] ?? '');
    $images = isset($data['images']) && is_array($data['images']) ? $data['images'] : [];
    $isPublished = isset($data['is_published']) ? (int)$data['is_published'] : 0;
    $sortOrder = isset($data['sort_order']) ? (int)$data['sort_order'] : 0;
    
    if (empty($title) || empty($content)) {
      json_error(422, 'Заполните заголовок и текст статьи');
    }
    
    try {
      $stmt = $pdo->prepare('INSERT INTO blog_posts (title, excerpt, content, author, published_date, featured_image, images, is_published, sort_order) VALUES (:title, :excerpt, :content, :author, :published_date, :featured_image, :images, :is_published, :sort_order)');
      $stmt->execute([
        ':title' => $title,
        ':excerpt' => $excerpt ?: null,
        ':content' => $content,
        ':author' => $author ?: null,
        ':published_date' => $publishedDate ? date('Y-m-d H:i:s', strtotime($publishedDate)) : null,
        ':featured_image' => $featuredImage ?: null,
        ':images' => !empty($images) ? json_encode($images) : null,
        ':is_published' => $isPublished,
        ':sort_order' => $sortOrder,
      ]);
      json_ok(['id' => (int)$pdo->lastInsertId(), 'message' => 'Статья добавлена']);
    } catch (Exception $e) {
      error_log('Blog post create error: ' . $e->getMessage());
      json_error(500, 'Ошибка сохранения: ' . $e->getMessage());
    }
  }
  
  if ($method === 'PUT') {
    require_admin();
    
    $data = read_json();
    $id = (int)($data['id'] ?? 0);
    $title = trim($data['title'] ?? '');
    $excerpt = trim($data['excerpt'] ?? '');
    $content = trim($data['content'] ?? '');
    $author = trim($data['author'] ?? '');
    $publishedDate = !empty($data['published_date']) ? trim($data['published_date']) : null;
    $featuredImage = trim($data['featured_image'] ?? '');
    $images = isset($data['images']) && is_array($data['images']) ? $data['images'] : [];
    $isPublished = isset($data['is_published']) ? (int)$data['is_published'] : 0;
    $sortOrder = isset($data['sort_order']) ? (int)$data['sort_order'] : 0;
    
    if ($id === 0 || empty($title) || empty($content)) {
      json_error(422, 'Заполните все обязательные поля');
    }
    
    try {
      // Get current images if not updating
      if (empty($featuredImage)) {
        $stmt = $pdo->prepare('SELECT featured_image, images FROM blog_posts WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $current = $stmt->fetch();
        $featuredImage = $current['featured_image'] ?? null;
        if (empty($images) && !empty($current['images'])) {
          $currentImages = json_decode($current['images'], true);
          if (is_array($currentImages)) {
            $images = $currentImages;
          }
        }
      }
      
      $stmt = $pdo->prepare('UPDATE blog_posts SET title = :title, excerpt = :excerpt, content = :content, author = :author, published_date = :published_date, featured_image = :featured_image, images = :images, is_published = :is_published, sort_order = :sort_order, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
      $stmt->execute([
        ':id' => $id,
        ':title' => $title,
        ':excerpt' => $excerpt ?: null,
        ':content' => $content,
        ':author' => $author ?: null,
        ':published_date' => $publishedDate ? date('Y-m-d H:i:s', strtotime($publishedDate)) : null,
        ':featured_image' => $featuredImage,
        ':images' => !empty($images) ? json_encode($images) : null,
        ':is_published' => $isPublished,
        ':sort_order' => $sortOrder,
      ]);
      json_ok(['message' => 'Изменения сохранены']);
    } catch (Exception $e) {
      error_log('Blog post update error: ' . $e->getMessage());
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
      $stmt = $pdo->prepare('DELETE FROM blog_posts WHERE id = :id');
      $stmt->execute([':id' => $id]);
      json_ok(['message' => 'Статья удалена']);
    } catch (Exception $e) {
      error_log('Blog post delete error: ' . $e->getMessage());
      json_error(500, 'Ошибка удаления: ' . $e->getMessage());
    }
  }
}

json_error(405, 'Метод не разрешён');

