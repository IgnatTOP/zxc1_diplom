<?php
declare(strict_types=1);

// JSON response helpers
function json_error(int $status, string $message, array $extra = []): void {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['ok' => false, 'error' => $message] + $extra, JSON_UNESCAPED_UNICODE);
  exit;
}

function json_ok(array $data = []): void {
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['ok' => true] + $data, JSON_UNESCAPED_UNICODE);
  exit;
}

function read_json(): array {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw ?: '[]', true);
  return is_array($data) ? $data : [];
}

// Auth helpers
function current_user(): ?array {
  if (!isset($_SESSION['user'])) return null;
  return [
    'id' => $_SESSION['user']['id'] ?? null,
    'email' => $_SESSION['user']['email'] ?? null,
    'name' => $_SESSION['user']['name'] ?? null,
    'role' => $_SESSION['user']['role'] ?? 'user',
  ];
}

function require_auth(): void {
  if (session_status() === PHP_SESSION_NONE) {
    session_start();
  }
  if (!current_user()) {
    json_error(401, 'Требуется авторизация');
  }
}

function require_admin(): void {
  if (session_status() === PHP_SESSION_NONE) {
    session_start();
  }
  $user = current_user();
  if (!$user || $user['role'] !== 'admin') {
    json_error(403, 'Доступ запрещен');
  }
}

// Security headers
function set_security_headers(): void {
  header('X-Content-Type-Options: nosniff');
  header('X-Frame-Options: DENY');
  header('Referrer-Policy: no-referrer');
}

// File upload helper
function upload_file(array $file, string $allowedTypes = 'image'): string {
  if ($file['error'] !== UPLOAD_ERR_OK) {
    $errorMessages = [
      UPLOAD_ERR_INI_SIZE => 'Файл превышает максимальный размер',
      UPLOAD_ERR_FORM_SIZE => 'Файл превышает максимальный размер формы',
      UPLOAD_ERR_PARTIAL => 'Файл загружен частично',
      UPLOAD_ERR_NO_FILE => 'Файл не был загружен',
      UPLOAD_ERR_NO_TMP_DIR => 'Отсутствует временная папка',
      UPLOAD_ERR_CANT_WRITE => 'Не удалось записать файл на диск',
      UPLOAD_ERR_EXTENSION => 'Загрузка остановлена расширением',
    ];
    $errorMsg = $errorMessages[$file['error']] ?? 'Ошибка загрузки файла (код: ' . $file['error'] . ')';
    throw new Exception($errorMsg);
  }

  // Validate by file extension only - most reliable method
  $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
  $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  
  error_log('[upload_file] ===== FILE UPLOAD START =====');
  error_log('[upload_file] File name: ' . ($file['name'] ?? 'NULL'));
  error_log('[upload_file] File size: ' . ($file['size'] ?? 'NULL') . ' bytes');
  error_log('[upload_file] File type (browser): ' . ($file['type'] ?? 'NULL'));
  error_log('[upload_file] Extracted extension: "' . $ext . '"');
  error_log('[upload_file] Allowed extensions: ' . implode(', ', $allowedExtensions));
  
  // Check if extension exists
  if (empty($ext)) {
    error_log('[upload_file] REJECTED - No extension found in filename: ' . $file['name']);
    throw new Exception('Файл не имеет расширения. Убедитесь, что файл имеет расширение .jpg, .png, .gif или .webp');
  }
  
  // Normalize extension (remove dots, spaces)
  $ext = trim($ext, '. ');
  
  if (!in_array($ext, $allowedExtensions)) {
    error_log('[upload_file] REJECTED - Extension "' . $ext . '" not in allowed list');
    error_log('[upload_file] Full filename: ' . $file['name']);
    throw new Exception('Недопустимый формат файла "' . $ext . '". Разрешены: JPG, PNG, GIF, WEBP');
  }
  
  error_log('[upload_file] Extension OK: "' . $ext . '" - proceeding with upload');

  // Check file size (max 10MB)
  if ($file['size'] > 10 * 1024 * 1024) {
    throw new Exception('Файл слишком большой (максимум 10MB)');
  }

  $filename = uniqid('img_', true) . '.' . $ext;
  $path = UPLOAD_DIR . $filename;

  if (!move_uploaded_file($file['tmp_name'], $path)) {
    error_log('[upload_file] Failed to move file: ' . $file['tmp_name'] . ' to: ' . $path);
    throw new Exception('Не удалось сохранить файл');
  }

  error_log('[upload_file] File uploaded successfully: ' . $filename);
  return $filename;
}

