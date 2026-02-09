<?php
declare(strict_types=1);
require_once __DIR__ . '/../../includes/init.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // Create application
  $payload = read_json();
  
  $name = trim($payload['name'] ?? '');
  $phone = trim($payload['phone'] ?? '');
  $email = trim($payload['email'] ?? '');
  $age = isset($payload['age']) ? (int)$payload['age'] : null;
  $weight = isset($payload['weight']) ? (int)$payload['weight'] : null;
  $style = trim($payload['style'] ?? '');
  $level = trim($payload['level'] ?? '');
  
  if ($name === '' || $phone === '' || $style === '' || $level === '') {
    json_error(422, 'Заполните все обязательные поля');
  }
  
  try {
    $pdo = get_db();
    $stmt = $pdo->prepare('INSERT INTO applications (name, phone, email, age, weight, style, level, status) VALUES (:name, :phone, :email, :age, :weight, :style, :level, "pending")');
    $stmt->execute([
      ':name' => $name,
      ':phone' => $phone,
      ':email' => $email ?: null,
      ':age' => $age,
      ':weight' => $weight,
      ':style' => $style,
      ':level' => $level
    ]);
    
    json_ok(['message' => 'Заявка успешно отправлена']);
  } catch (Throwable $e) {
    json_error(500, 'Ошибка сервера');
  }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
  // Get applications (admin only)
  require_admin();
  
  $pdo = get_db();
  $applications = $pdo->query('SELECT * FROM applications ORDER BY created_at DESC')->fetchAll();
  
  json_ok(['applications' => $applications]);
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
  // Update application (admin only)
  require_admin();
  
  // Check for auto-assign action
  if (isset($_GET['action']) && $_GET['action'] === 'auto_assign_all') {
    try {
      $pdo = get_db();
      $pending = $pdo->query('SELECT * FROM applications WHERE status = "pending" ORDER BY created_at ASC')->fetchAll();
      $assigned = 0;
      
      foreach ($pending as $app) {
        $style = $app['style'];
        $level = $app['level'];
        $age = $app['age'];
        
        $sql = 'SELECT * FROM groups WHERE style = :style AND level = :level AND is_active = 1';
        $params = [':style' => $style, ':level' => $level];
        
        if ($age !== null) {
          $sql .= ' AND (age_min IS NULL OR age_min <= :age) AND (age_max IS NULL OR age_max >= :age)';
          $params[':age'] = $age;
        }
        
        $sql .= ' AND current_students < max_students ORDER BY current_students ASC LIMIT 1';
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $group = $stmt->fetch();
        
        if ($group) {
          $pdo->prepare('UPDATE applications SET 
            assigned_group = :group_name,
            assigned_day = :day,
            assigned_time = :time,
            status = "assigned",
            updated_at = CURRENT_TIMESTAMP
            WHERE id = :id')
            ->execute([
              ':group_name' => $group['name'],
              ':day' => $group['day_of_week'],
              ':time' => $group['time'],
              ':id' => $app['id']
            ]);
          
          $pdo->prepare('UPDATE groups SET current_students = current_students + 1 WHERE id = :id')
            ->execute([':id' => $group['id']]);
          
          $assigned++;
        }
      }
      
      json_ok(['assigned' => $assigned, 'message' => "Распределено заявок: $assigned"]);
    } catch (Throwable $e) {
      json_error(500, 'Ошибка сервера');
    }
    exit;
  }
  
  // Auto-assign single
  if (isset($_GET['auto']) && $_GET['auto'] == '1') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id === 0) {
      json_error(422, 'Не указан ID заявки');
    }
    
    try {
      $pdo = get_db();
      $stmt = $pdo->prepare('SELECT * FROM applications WHERE id = :id');
      $stmt->execute([':id' => $id]);
      $app = $stmt->fetch();
      
      if (!$app || !$app['id']) {
        json_error(404, 'Заявка не найдена');
      }
      
      $style = $app['style'];
      $level = $app['level'];
      $age = $app['age'];
      
      $sql = 'SELECT * FROM groups WHERE style = :style AND level = :level AND is_active = 1';
      $params = [':style' => $style, ':level' => $level];
      
      if ($age !== null) {
        $sql .= ' AND (age_min IS NULL OR age_min <= :age) AND (age_max IS NULL OR age_max >= :age)';
        $params[':age'] = $age;
      }
      
      $sql .= ' AND current_students < max_students ORDER BY current_students ASC LIMIT 1';
      
      $stmt = $pdo->prepare($sql);
      $stmt->execute($params);
      $group = $stmt->fetch();
      
      if (!$group) {
        json_error(404, 'Подходящая группа не найдена');
      }
      
      $pdo->prepare('UPDATE applications SET 
        assigned_group = :group_name,
        assigned_day = :day,
        assigned_time = :time,
        status = "assigned",
        updated_at = CURRENT_TIMESTAMP
        WHERE id = :id')
        ->execute([
          ':group_name' => $group['name'],
          ':day' => $group['day_of_week'],
          ':time' => $group['time'],
          ':id' => $id
        ]);
      
      $pdo->prepare('UPDATE groups SET current_students = current_students + 1 WHERE id = :id')
        ->execute([':id' => $group['id']]);
      
      json_ok(['message' => 'Заявка распределена', 'group' => $group]);
    } catch (Throwable $e) {
      json_error(500, 'Ошибка сервера');
    }
    exit;
  }
  
  // Manual update
  $payload = read_json();
  $id = (int)($payload['id'] ?? 0);
  
  if ($id === 0) {
    json_error(422, 'Не указан ID заявки');
  }
  
  try {
    $pdo = get_db();
    $updates = [];
    $params = [':id' => $id];
    
    if (isset($payload['status'])) {
      $updates[] = 'status = :status';
      $params[':status'] = $payload['status'];
    }
    if (isset($payload['assigned_group'])) {
      $updates[] = 'assigned_group = :assigned_group';
      $params[':assigned_group'] = $payload['assigned_group'];
    }
    if (isset($payload['assigned_day'])) {
      $updates[] = 'assigned_day = :assigned_day';
      $params[':assigned_day'] = $payload['assigned_day'];
    }
    if (isset($payload['assigned_time'])) {
      $updates[] = 'assigned_time = :assigned_time';
      $params[':assigned_time'] = $payload['assigned_time'];
    }
    if (isset($payload['assigned_date'])) {
      $updates[] = 'assigned_date = :assigned_date';
      $params[':assigned_date'] = $payload['assigned_date'] ?: null;
    }
    if (isset($payload['notes'])) {
      $updates[] = 'notes = :notes';
      $params[':notes'] = $payload['notes'];
    }
    
    if (empty($updates)) {
      json_error(422, 'Нет данных для обновления');
    }
    
    $updates[] = 'updated_at = CURRENT_TIMESTAMP';
    $sql = 'UPDATE applications SET ' . implode(', ', $updates) . ' WHERE id = :id';
    $pdo->prepare($sql)->execute($params);
    
    json_ok(['message' => 'Заявка обновлена']);
  } catch (Throwable $e) {
    json_error(500, 'Ошибка сервера');
  }
} else {
  json_error(405, 'Метод не поддерживается');
}

