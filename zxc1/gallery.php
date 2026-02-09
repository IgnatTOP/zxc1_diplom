<?php
declare(strict_types=1);
require_once __DIR__ . '/diplo/includes/init.php';

$pdo = get_db();
// Check if we have any items at all (for debugging)
$allItems = $pdo->query('SELECT COUNT(*) as cnt FROM gallery')->fetch();
$activeItems = $pdo->query('SELECT COUNT(*) as cnt FROM gallery WHERE is_active = 1')->fetch();

$items = $pdo->query('SELECT * FROM gallery WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC')->fetchAll();

// Get all collages - ordered by ID to maintain consistent order
error_log('[gallery.php] Fetching collages from database...');
$collages = $pdo->query('SELECT * FROM collages ORDER BY id DESC')->fetchAll();
error_log('[gallery.php] Found ' . count($collages) . ' collages in database');

if (count($collages) > 0) {
  foreach ($collages as $idx => $col) {
    error_log('[gallery.php] Collage #' . ($idx + 1) . ': ID=' . $col['id'] . ', Title=' . ($col['title'] ?? 'NULL'));
  }
}

// Get layout setting
$settingsFile = __DIR__ . '/diplo/config/gallery_settings.json';
$layout = 'grid';

error_log('[gallery.php] Loading layout settings');
error_log('[gallery.php] Settings file path: ' . $settingsFile);
error_log('[gallery.php] File exists: ' . (file_exists($settingsFile) ? 'YES' : 'NO'));
error_log('[gallery.php] Collages count: ' . count($collages));
error_log('[gallery.php] Items count: ' . count($items));

if (file_exists($settingsFile)) {
    $fileContent = file_get_contents($settingsFile);
    error_log('[gallery.php] File content: ' . $fileContent);
    $settings = json_decode($fileContent, true);
    error_log('[gallery.php] Decoded settings: ' . print_r($settings, true));
    error_log('[gallery.php] JSON error: ' . (json_last_error() === JSON_ERROR_NONE ? 'NONE' : json_last_error_msg()));
    $layout = $settings['layout'] ?? 'grid';
    error_log('[gallery.php] Using layout: ' . $layout);
} else {
    error_log('[gallery.php] Settings file not found, using default: grid');
}

error_log('[gallery.php] Final layout value: ' . $layout);

// Validate layout value
$validLayouts = ['grid', 'masonry', 'mosaic', 'zigzag', 'large', 'compact', 'asymmetric', 'staggered'];
if (!in_array($layout, $validLayouts)) {
  error_log('[gallery.php] WARNING: Invalid layout "' . $layout . '", using default "grid"');
  $layout = 'grid';
}

$pageTitle = 'Галерея — DanceWave';
$pageDescription = 'Галерея фотографий танцевальной студии DanceWave: наши занятия, выступления и атмосфера студии.';
$canonicalUrl = '/gallery.php';

include __DIR__ . '/diplo/includes/header.php';
?>

  <main>
    <section class="section" style="padding-top: 100px;" aria-labelledby="gallery-title">
      <div class="container">
        <h1 id="gallery-title" class="section__title">Галерея</h1>
        <p class="section__text">Моменты наших занятий, выступлений и жизни студии</p>
        
        <?php if (count($items) === 0 && count($collages) === 0): ?>
        <!-- Show info only if BOTH are empty -->
        <div style="padding: 20px; background: var(--surface); border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; margin-bottom: 32px; text-align: center;">
          <p style="margin: 0 0 12px; color: var(--muted); font-size: 16px;">Галерея пуста</p>
          <p style="margin: 0 0 20px; color: var(--text); font-size: 14px;">
            Текущая раскладка: <strong><?= htmlspecialchars($layout) ?></strong><br>
            Добавьте фотографии или коллажи через админ-панель
          </p>
          <a href="/diplo/admin/gallery.php" class="button" style="display: inline-block;">Перейти в админ-панель</a>
        </div>
        <?php elseif (count($items) === 0 && $allItems['cnt'] > 0 && $activeItems['cnt'] === 0): ?>
        <!-- Show warning if items exist but are inactive -->
        <div style="padding: 16px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; margin-bottom: 24px; font-size: 14px;">
          <strong>⚠️ Внимание:</strong> Все фотографии в базе неактивны. 
          <a href="/diplo/admin/gallery.php" style="color: #856404; text-decoration: underline;">Активируйте их в админ-панели</a>
        </div>
        <?php endif; ?>
        
        <?php
        // Map layout to default photo count for collages
        $layoutPhotoCountMap = [
            'grid' => 4,
            'masonry' => 4,
            'mosaic' => 3,
            'zigzag' => 3,
            'large' => 3,
            'compact' => 6,
            'asymmetric' => 4,
            'staggered' => 4
        ];
        $defaultPhotoCount = $layoutPhotoCountMap[$layout] ?? 4;
        
        foreach ($collages as $collage):
          error_log('[gallery.php] Processing collage ID: ' . $collage['id']);
          $collagePhotos = $collage['photos'] ? json_decode($collage['photos'], true) : [];
          error_log('[gallery.php] Collage photos count: ' . count($collagePhotos));
          error_log('[gallery.php] Collage photos: ' . print_r($collagePhotos, true));
          $collageTitle = $collage['title'] ?? null;
          $mainImage = $collage['main_image'] ?? 'photo_group.jpeg';
          error_log('[gallery.php] Collage main_image: ' . $mainImage);
          // Use collage photo_count if set, otherwise use layout default
          $photoCount = isset($collage['photo_count']) && $collage['photo_count'] > 0 
            ? (int)$collage['photo_count'] 
            : $defaultPhotoCount;
          error_log('[gallery.php] Collage photo_count: ' . $photoCount);
        ?>
          <div style="margin: 48px 0; padding: 40px; background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow-sm);" data-collage-id="<?= $collage['id'] ?>">
            <?php if (count($collagePhotos) > 0 && $photoCount > 0): ?>
              <!-- Collage with multiple photos -->
              <div class="gallery-collage" data-photo-count="<?= $photoCount ?>">
                <div>
                  <img src="/diplo/assets/images/<?= htmlspecialchars($mainImage) ?>" alt="<?= htmlspecialchars($collageTitle ?: 'Коллаж') ?>" onerror="console.error('Failed to load main image: <?= htmlspecialchars($mainImage) ?>')">
                </div>
                <?php 
                $photosToShow = array_slice($collagePhotos, 0, $photoCount);
                error_log('[gallery.php] Showing ' . count($photosToShow) . ' photos for collage ' . $collage['id']);
                foreach ($photosToShow as $index => $photo): 
                ?>
                  <div>
                    <img src="/diplo/assets/images/<?= htmlspecialchars($photo) ?>" alt="Фото коллажа" onerror="console.error('Failed to load photo: <?= htmlspecialchars($photo) ?>')">
                  </div>
                <?php endforeach; ?>
                <?php if (count($photosToShow) < $photoCount): ?>
                  <?php for ($i = count($photosToShow); $i < $photoCount; $i++): ?>
                    <div style="background: var(--bg);"></div>
                  <?php endfor; ?>
                <?php endif; ?>
              </div>
            <?php else: ?>
              <!-- Collage with only main image -->
              <?php 
              error_log('[gallery.php] Collage ' . $collage['id'] . ' has no additional photos, showing main image only');
              ?>
              <div style="max-width: 800px; margin: 0 auto;">
                <img src="/diplo/assets/images/<?= htmlspecialchars($mainImage) ?>" alt="<?= htmlspecialchars($collageTitle ?: 'Коллаж') ?>" style="width: 100%; border-radius: 20px; box-shadow: var(--shadow); display: block;" onerror="console.error('Failed to load collage main image: <?= htmlspecialchars($mainImage) ?>'); this.style.display='none';">
              </div>
            <?php endif; ?>
            <?php if ($collageTitle): ?>
              <h2 style="font-size: 24px; margin: 32px 0 0; text-align: center; font-weight: 600; color: var(--text);"><?= htmlspecialchars($collageTitle) ?></h2>
            <?php endif; ?>
          </div>
        <?php endforeach; ?>
        
        <?php if (count($items) > 0): ?>
          <!-- DEBUG: Current layout from settings = <?= htmlspecialchars($layout) ?> -->
          <div class="gallery__grid gallery-layout--<?= htmlspecialchars($layout) ?>" 
               data-layout="<?= htmlspecialchars($layout) ?>" 
               id="galleryGridMain"
               style="width: 100%;">
            <?php foreach ($items as $index => $item): ?>
              <div class="gallery__item" data-item-id="<?= $item['id'] ?? $index ?>">
                <img src="<?= htmlspecialchars('/diplo/assets/images/' . $item['filename']) ?>" 
                     alt="<?= htmlspecialchars($item['alt_text'] ?? $item['title'] ?? 'Фото') ?>">
                <?php if ($item['title']): ?>
                  <div style="padding: 1rem; background: var(--surface);">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem;"><?= htmlspecialchars($item['title']) ?></h3>
                    <?php if ($item['description']): ?>
                      <p style="margin: 0; color: var(--muted); font-size: 0.9rem;"><?= htmlspecialchars($item['description']) ?></p>
                    <?php endif; ?>
                  </div>
                <?php endif; ?>
              </div>
            <?php endforeach; ?>
          </div>
        <?php else: ?>
          <p style="text-align: center; padding: 3rem; color: var(--muted);">В галерее пока нет фотографий</p>
        <?php endif; ?>
        <div style="text-align: center; margin-top: 3rem;">
          <a href="/" class="button button--ghost">На главную</a>
        </div>
      </div>
    </section>
  </main>

<?php 
include __DIR__ . '/diplo/includes/footer.php'; 
?>
<script>
// Layout debug
document.addEventListener('DOMContentLoaded', function() {
  const galleryGrid = document.getElementById('galleryGridMain');
  if (galleryGrid) {
    const layout = galleryGrid.getAttribute('data-layout');
    const classes = galleryGrid.className;
    const computedStyle = window.getComputedStyle(galleryGrid);
    
    console.log('=== GALLERY LAYOUT DEBUG ===');
    console.log('Expected layout from data-layout:', layout);
    console.log('Applied classes:', classes);
    console.log('Has gallery-layout--' + layout + ':', galleryGrid.classList.contains('gallery-layout--' + layout));
    console.log('Display:', computedStyle.display);
    console.log('Grid template columns:', computedStyle.gridTemplateColumns);
    console.log('Column count:', computedStyle.columnCount);
    console.log('Gallery items count:', document.querySelectorAll('.gallery__item').length);
    
    // Check all layout classes
    const allLayoutClasses = ['grid', 'masonry', 'mosaic', 'zigzag', 'large', 'compact', 'asymmetric', 'staggered'];
    allLayoutClasses.forEach(l => {
      if (galleryGrid.classList.contains('gallery-layout--' + l)) {
        console.log('✓ Found class: gallery-layout--' + l);
      }
    });
    console.log('============================');
    
    // Visual indicator
    const debugDiv = document.createElement('div');
    debugDiv.style.cssText = 'position: fixed; bottom: 20px; right: 20px; padding: 12px; background: rgba(0,0,0,0.8); color: white; border-radius: 8px; font-family: monospace; font-size: 12px; z-index: 9999;';
    debugDiv.innerHTML = `
      <div>Layout: <strong>${layout}</strong></div>
      <div>Items: ${document.querySelectorAll('.gallery__item').length}</div>
      <div>Display: ${computedStyle.display}</div>
      <div>Columns: ${computedStyle.gridTemplateColumns || computedStyle.columnCount || 'N/A'}</div>
    `;
    document.body.appendChild(debugDiv);
    
    setTimeout(() => debugDiv.remove(), 5000);
  } else {
    console.warn('Gallery grid not found!');
  }
});
</script>

