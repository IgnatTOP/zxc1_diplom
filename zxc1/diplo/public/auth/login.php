<?php
declare(strict_types=1);
require_once __DIR__ . '/../../includes/init.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_error(405, 'Метод не поддерживается');
}

$payload = read_json();
$email = trim(strtolower($payload['email'] ?? ''));
$password = (string)($payload['password'] ?? '');

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  json_error(422, 'Введите корректный email');
}
if ($password === '') {
  json_error(422, 'Введите пароль');
}

try {
  $pdo = get_db();
  $stmt = $pdo->prepare('SELECT id, email, name, password_hash, role FROM users WHERE email = :email LIMIT 1');
  $stmt->execute([':email' => $email]);
  $user = $stmt->fetch();
  if (!$user || !password_verify($password, $user['password_hash'])) {
    json_error(401, 'Неверный email или пароль');
  }

  $_SESSION['user'] = [
    'id' => (int)$user['id'], 
    'email' => $user['email'], 
    'name' => $user['name'],
    'role' => $user['role'] ?? 'user'
  ];
  json_ok(['user' => current_user()]);
} catch (Throwable $e) {
  json_error(500, 'Ошибка сервера', ['detail' => 'login_failed']);
}

