<?php
declare(strict_types=1);
require_once __DIR__ . '/../../includes/init.php';

$settingsFile = __DIR__ . '/../../config/gallery_settings.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($settingsFile)) {
        echo file_get_contents($settingsFile);
    } else {
        echo json_encode(['layout' => 'grid']);
    }
    exit;
}

// POST requires admin
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    error_log('[settings.php] POST request received');
    $input = file_get_contents('php://input');
    error_log('[settings.php] Raw input: ' . $input);
    
    $data = json_decode($input, true);
    error_log('[settings.php] Decoded data: ' . print_r($data, true));
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log('[settings.php] JSON decode error: ' . json_last_error_msg());
        json_error(400, 'Неверный формат JSON: ' . json_last_error_msg());
        exit;
    }
    
    if (isset($data['layout'])) {
        $validLayouts = ['grid', 'masonry', 'mosaic', 'zigzag', 'large', 'compact', 'asymmetric', 'staggered'];
        $layout = in_array($data['layout'], $validLayouts) ? $data['layout'] : 'grid';
        
        error_log('[settings.php] Validated layout: ' . $layout);
        error_log('[settings.php] Settings file path: ' . $settingsFile);
        error_log('[settings.php] File exists: ' . (file_exists($settingsFile) ? 'YES' : 'NO'));
        error_log('[settings.php] File writable: ' . (is_writable(dirname($settingsFile)) ? 'YES' : 'NO'));
        
        $jsonData = json_encode(['layout' => $layout], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        error_log('[settings.php] JSON to write: ' . $jsonData);
        
        $result = file_put_contents($settingsFile, $jsonData);
        error_log('[settings.php] File write result: ' . ($result !== false ? 'SUCCESS (' . $result . ' bytes)' : 'FAILED'));
        
        if ($result === false) {
            error_log('[settings.php] Failed to write file. Error: ' . error_get_last()['message']);
            json_error(500, 'Не удалось сохранить настройки');
            exit;
        }
        
        // Verify write
        $verify = file_get_contents($settingsFile);
        error_log('[settings.php] Verification read: ' . $verify);
        $verifyData = json_decode($verify, true);
        error_log('[settings.php] Verified layout: ' . ($verifyData['layout'] ?? 'NOT FOUND'));
        
        json_ok(['message' => 'Настройки сохранены', 'layout' => $layout]);
    } else {
        error_log('[settings.php] Layout not found in data');
        json_error(400, 'Неверные данные: layout не указан');
    }
    exit;
}

json_error(405, 'Method Not Allowed');

