<?php
declare(strict_types=1);

// Database configuration
define('DB_PATH', __DIR__ . '/../data/app.sqlite');

// Ensure data directory exists
$dataDir = dirname(DB_PATH);
if (!is_dir($dataDir)) {
  mkdir($dataDir, 0775, true);
}

function get_db(): PDO {
  static $pdo = null;
  if ($pdo instanceof PDO) {
    return $pdo;
  }

  $pdo = new PDO('sqlite:' . DB_PATH, '', '', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
  $pdo->exec('PRAGMA foreign_keys = ON');

  // Auto-migrate tables
  $pdo->exec('CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT "user",
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )');

  $pdo->exec('CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    title TEXT,
    description TEXT,
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )');

  $pdo->exec('CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page TEXT NOT NULL,
    section TEXT NOT NULL,
    key_name TEXT NOT NULL,
    value TEXT,
    type TEXT DEFAULT "text",
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(page, section, key_name)
  )');

  $pdo->exec('CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_name TEXT NOT NULL UNIQUE,
    value TEXT,
    type TEXT DEFAULT "text",
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )');

  $pdo->exec('CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    age INTEGER,
    weight INTEGER,
    style TEXT NOT NULL,
    level TEXT NOT NULL,
    status TEXT DEFAULT "pending",
    assigned_group TEXT,
    assigned_day TEXT,
    assigned_time TEXT,
    assigned_date DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )');

  $pdo->exec('CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    style TEXT NOT NULL,
    level TEXT NOT NULL,
    day_of_week TEXT NOT NULL,
    time TEXT NOT NULL,
    age_min INTEGER,
    age_max INTEGER,
    max_students INTEGER DEFAULT 15,
    current_students INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )');

  $pdo->exec('CREATE TABLE IF NOT EXISTS collages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    main_image TEXT NOT NULL,
    photos TEXT,
    photo_count INTEGER DEFAULT 4,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )');
  
  // Add photo_count column if it doesn't exist (migration)
  try {
    $pdo->exec('ALTER TABLE collages ADD COLUMN photo_count INTEGER DEFAULT 4');
  } catch (PDOException $e) {
    // Column already exists, ignore
  }

  $pdo->exec('CREATE TABLE IF NOT EXISTS schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_of_week TEXT NOT NULL,
    time TEXT NOT NULL,
    style TEXT NOT NULL,
    level TEXT NOT NULL,
    instructor TEXT NOT NULL,
    date DATE,
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )');

  $pdo->exec('CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    experience TEXT NOT NULL,
    photo TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )');

  $pdo->exec('CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    images TEXT,
    author TEXT,
    published_date DATETIME,
    is_published INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )');
  
  // Add images column if it doesn't exist
  try {
    $pdo->exec('ALTER TABLE blog_posts ADD COLUMN images TEXT');
  } catch (Exception $e) {
    // Column already exists, ignore
  }
  
  // Initialize with default schedule if empty
  $stmt = $pdo->query('SELECT COUNT(*) FROM schedule');
  if ($stmt->fetchColumn() == 0) {
    $defaultSchedule = [
      ['Понедельник', null, '19:00', 'Hip-Hop', 'Начальный', 'Денис Флоу'],
      ['Вторник', null, '20:00', 'Contemporary', 'Средний', 'Анна Лайт'],
      ['Среда', null, '18:00', 'Kids', '6-8 лет', 'Мария Соль'],
      ['Четверг', null, '19:30', 'Latin', 'Все уровни', 'Мария Соль'],
      ['Пятница', null, '19:00', 'Hip-Hop', 'Продвинутый', 'Денис Флоу'],
      ['Суббота', null, '11:00', 'Contemporary', 'Начальный', 'Анна Лайт'],
      ['Суббота', null, '15:00', 'Kids', '4-6 лет', 'Мария Соль'],
      ['Воскресенье', null, '12:00', 'Latin', 'Средний', 'Мария Соль'],
    ];
    
    $stmt = $pdo->prepare('INSERT INTO schedule (day_of_week, date, time, style, level, instructor) VALUES (?, ?, ?, ?, ?, ?)');
    foreach ($defaultSchedule as $item) {
      $stmt->execute($item);
    }
  }

  // Create default admin user if not exists (password: admin123)
  $stmt = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
  $stmt->execute([':email' => 'admin@dancewave.ru']);
  if (!$stmt->fetch()) {
    $hash = password_hash('admin123', PASSWORD_DEFAULT);
    $pdo->prepare('INSERT INTO users (email, name, password_hash, role) VALUES (:email, :name, :hash, :role)')
      ->execute([
        ':email' => 'admin@dancewave.ru',
        ':name' => 'Администратор',
        ':hash' => $hash,
        ':role' => 'admin'
      ]);
  }

  return $pdo;
}

