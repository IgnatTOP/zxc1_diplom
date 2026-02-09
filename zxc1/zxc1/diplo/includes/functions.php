<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

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
  session_start();
  if (!current_user()) {
    json_error(401, 'Требуется авторизация');
  }
}

function require_admin(): void {
  session_start();
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
    throw new Exception('Ошибка загрузки файла');
  }

  $allowed = $allowedTypes === 'image' 
    ? ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    : [];

  if (!in_array($file['type'], $allowed)) {
    throw new Exception('Недопустимый тип файла');
  }

  $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
  $filename = uniqid('img_', true) . '.' . $ext;
  $path = UPLOAD_DIR . $filename;

  if (!move_uploaded_file($file['tmp_name'], $path)) {
    throw new Exception('Не удалось сохранить файл');
  }

  return $filename;
}

