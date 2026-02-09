<?php
// Header component
$user = current_user();
$siteUrl = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'dancewave.ru');
$currentUrl = $siteUrl . ($_SERVER['REQUEST_URI'] ?? '/');
$ogImage = $siteUrl . '/diplo/assets/images/og-image.jpg';
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title><?= isset($pageTitle) ? htmlspecialchars($pageTitle) : 'DanceWave — Танцевальная студия' ?></title>
  <meta name="description" content="<?= isset($pageDescription) ? htmlspecialchars($pageDescription) : 'DanceWave — современная танцевальная студия: занятия для детей и взрослых, профессиональные преподаватели, удобное расписание и пробное занятие.' ?>">
  <meta name="keywords" content="танцевальная студия, танцы, hip-hop, contemporary, latin, детские танцы, занятия танцами, танцевальные курсы">
  <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">
  <link rel="canonical" href="<?= $siteUrl . (isset($canonicalUrl) ? htmlspecialchars($canonicalUrl) : '/') ?>">
  
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="<?= isset($pageTitle) ? htmlspecialchars($pageTitle) : 'DanceWave — Танцевальная студия' ?>">
  <meta property="og:description" content="<?= isset($pageDescription) ? htmlspecialchars($pageDescription) : 'DanceWave — современная танцевальная студия: занятия для детей и взрослых, профессиональные преподаватели, удобное расписание и пробное занятие.' ?>">
  <meta property="og:url" content="<?= htmlspecialchars($currentUrl) ?>">
  <meta property="og:image" content="<?= $ogImage ?>">
  <meta property="og:locale" content="ru_RU">
  <meta property="og:site_name" content="DanceWave">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<?= isset($pageTitle) ? htmlspecialchars($pageTitle) : 'DanceWave — Танцевальная студия' ?>">
  <meta name="twitter:description" content="<?= isset($pageDescription) ? htmlspecialchars($pageDescription) : 'DanceWave — современная танцевальная студия: занятия для детей и взрослых, профессиональные преподаватели, удобное расписание и пробное занятие.' ?>">
  <meta name="twitter:image" content="<?= $ogImage ?>">
  
  <!-- Schema.org -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "DanceSchool",
    "name": "DanceWave",
    "description": "Современная танцевальная студия для детей и взрослых",
    "url": "<?= $siteUrl ?>",
    "logo": "<?= $siteUrl ?>/diplo/assets/images/logo.png",
    "image": "<?= $ogImage ?>",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "RU"
    },
    "priceRange": "900-6900 RUB",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": "3"
    }
  }
  </script>
  
  <meta name="theme-color" content="#7db8d5">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/diplo/assets/css/styles.css">
  <link rel="icon" href="/favicon.ico">
  <?php if (isset($additionalHead)) echo $additionalHead; ?>
</head>
<body>
  <header class="site-header" id="top">
    <div class="container header-inner">
      <a href="/" class="logo">DanceWave</a>
      <button class="menu-toggle" aria-label="Меню">
        <span></span><span></span><span></span>
      </button>
      <nav class="header-nav" id="headerNav">
        <a href="/">Главная</a>
        <a href="/directions.php">Направления</a>
        <a href="/schedule.php">Расписание</a>
        <a href="/gallery.php">Галерея</a>
        <a href="/blog.php">Блог</a>
        <a href="/prices.php">Цены</a>
      </nav>
      <div class="header-right">
        <button id="themeToggle" class="theme-toggle" aria-label="Переключить тему">
          <span class="theme-icon">🌙</span>
        </button>
        <div id="userbar" class="userbar"></div>
        <div id="authLinks">
          <a href="/login.php" class="user-icon" aria-label="Личный кабинет" title="Личный кабинет">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </header>

