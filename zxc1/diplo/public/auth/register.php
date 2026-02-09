<?php
declare(strict_types=1);
require_once __DIR__ . '/../../includes/init.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_error(405, 'Метод не поддерживается');
}

$payload = read_json();
$email = trim(strtolower($payload['email'] ?? ''));
$name = trim($payload['name'] ?? '');
$password = (string)($payload['password'] ?? '');

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  json_error(422, 'Введите корректный email');
}
if (mb_strlen($password) < 6) {
  json_error(422, 'Пароль должен быть не короче 6 символов');
}

try {
  $pdo = get_db();
  $stmt = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
  $stmt->execute([':email' => $email]);
  if ($stmt->fetch()) {
    json_error(409, 'Пользователь с таким email уже зарегистрирован');
  }

  $hash = password_hash($password, PASSWORD_DEFAULT);
  $stmt = $pdo->prepare('INSERT INTO users (email, name, password_hash) VALUES (:email, :name, :hash)');
  $stmt->execute([
    ':email' => $email,
    ':name' => $name,
    ':hash' => $hash,
  ]);

  $userId = (int)$pdo->lastInsertId();
  $_SESSION['user'] = ['id' => $userId, 'email' => $email, 'name' => $name, 'role' => 'user'];
  json_ok(['user' => current_user()]);
} catch (Throwable $e) {
  json_error(500, 'Ошибка сервера', ['detail' => 'register_failed']);
}

