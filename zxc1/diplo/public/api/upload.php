<?php
declare(strict_types=1);
require_once __DIR__ . '/../../includes/init.php';

require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_error(405, 'Метод не поддерживается');
}

// Check if we're updating the specific collage file
if (isset($_POST['is_collage']) && $_POST['is_collage'] === '1') {
    if (!isset($_FILES['collage_file'])) {
        json_error(422, 'Файл коллажа не загружен');
    }

    try {
        // We want to overwrite photo_group.jpeg specifically
        // upload_file generates a unique name, so we'll handle this manually for the collage
        // to keep the same filename used in the template
        
        $file = $_FILES['collage_file'];
        $targetDir = UPLOAD_DIR;
        $targetFile = $targetDir . 'photo_group.jpeg'; // Fixed filename for the collage

        // Validation - only check extension, trust it over MIME type
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        
        error_log('[upload.php] File: ' . $file['name'] . ', Extension: ' . $ext);
        
        if (!in_array($ext, $allowedExtensions)) {
            error_log('[upload.php] Invalid extension: ' . $ext . ' for file: ' . $file['name']);
            throw new Exception('Недопустимый формат файла. Разрешены: JPG, PNG, WEBP');
        }
        
        // Log MIME type for debugging, but don't block based on it
        if (function_exists('finfo_open')) {
            try {
                $finfo = new finfo(FILEINFO_MIME_TYPE);
                $mime = $finfo->file($file['tmp_name']);
                error_log('[upload.php] Detected MIME: ' . $mime . ' (extension: ' . $ext . ')');
            } catch (Exception $e) {
                error_log('[upload.php] finfo error: ' . $e->getMessage());
            }
        }
        
        // Extension is already validated - that's sufficient

        if ($file['size'] > 5 * 1024 * 1024) {
            throw new Exception('Файл слишком большой (макс 5MB)');
        }

        // Move and overwrite
        if (!move_uploaded_file($file['tmp_name'], $targetFile)) {
            throw new Exception('Ошибка сохранения файла');
        }

        json_ok(['filename' => 'photo_group.jpeg', 'message' => 'Коллаж обновлен']);
    } catch (Exception $e) {
        json_error(500, $e->getMessage());
    }
    exit;
}

// Standard gallery upload logic
if (!isset($_FILES['file'])) {
  json_error(422, 'Файл не загружен');
}

try {
  $filename = upload_file($_FILES['file']);
  json_ok(['filename' => $filename, 'url' => UPLOAD_URL . $filename]);
} catch (Exception $e) {
  json_error(500, $e->getMessage());
}
