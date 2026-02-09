<?php
declare(strict_types=1);

// Load configuration first
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

// Session configuration (must be before session_start())
$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == 443;
session_set_cookie_params([
  'lifetime' => 60 * 60 * 24 * 7,
  'path' => '/',
  'domain' => '',
  'secure' => $secure,
  'httponly' => true,
  'samesite' => 'Lax',
]);

// Common bootstrap for all endpoints
session_start();
require_once __DIR__ . '/functions.php';
set_security_headers();

