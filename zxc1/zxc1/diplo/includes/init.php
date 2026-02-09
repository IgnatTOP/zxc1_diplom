<?php
declare(strict_types=1);

// Common bootstrap for all endpoints
session_start();
require_once __DIR__ . '/functions.php';
set_security_headers();

