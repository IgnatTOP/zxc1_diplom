<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/init.php';

$user = current_user();
if (!$user || $user['role'] !== 'admin') {
  header('Location: /login.php');
  exit;
}

$pdo = get_db();
$items = $pdo->query('SELECT * FROM gallery ORDER BY sort_order ASC, created_at DESC')->fetchAll();
$collages = $pdo->query('SELECT * FROM collages ORDER BY id DESC')->fetchAll();

$pageTitle = 'Управление галереей — Админ-панель';
require_once __DIR__ . '/header.php';
?>

<div class="admin-content">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
    <h2 class="section__title" style="margin: 0;">Управление галереей</h2>
    <div style="display: flex; gap: 12px;">
      <button class="button button--ghost" onclick="openCollageModal(null)">Добавить коллаж</button>
      <button class="button" onclick="openAddModal()">Добавить фото</button>
    </div>
  </div>

  <!-- Collages Section -->
  <div style="margin-bottom: 48px;">
    <h3 style="font-size: 20px; margin: 0 0 24px; font-weight: 600;">Коллажи</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;">
      <?php foreach ($collages as $collage): 
        $collagePhotos = $collage['photos'] ? json_decode($collage['photos'], true) : [];
        $mainImage = $collage['main_image'] ?? 'photo_group.jpeg';
      ?>
        <div style="background: var(--surface); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm);">
          <div style="position: relative; aspect-ratio: 16/9; overflow: hidden;">
            <img src="/diplo/assets/images/<?= htmlspecialchars($mainImage) ?>" alt="<?= htmlspecialchars($collage['title']) ?>" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="padding: 20px;">
            <h4 style="margin: 0 0 8px; font-size: 18px; font-weight: 600;"><?= htmlspecialchars($collage['title']) ?></h4>
            <p style="margin: 0 0 8px; color: var(--muted); font-size: 12px;">
              ID: <?= $collage['id'] ?>
            </p>
            <p style="margin: 0 0 16px; color: var(--muted); font-size: 14px;">
              <?= count($collagePhotos) ?> фото, создан <?= date('d.m.Y', strtotime($collage['created_at'])) ?>
            </p>
            <div style="display: flex; gap: 8px;">
              <button class="button" style="padding: 8px 16px; font-size: 14px; flex: 1;" onclick="editCollage(<?= $collage['id'] ?>)">Редактировать</button>
              <button class="button" style="padding: 8px 16px; font-size: 14px; background: #ff4d6d; border-color: #ff4d6d; flex: 1;" onclick="deleteCollage(<?= $collage['id'] ?>)">Удалить</button>
            </div>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
    <?php if (count($collages) === 0): ?>
      <div style="text-align: center; padding: 48px; background: var(--surface); border-radius: var(--radius); color: var(--muted);">
        <p>Коллажей пока нет. Создайте первый коллаж!</p>
      </div>
    <?php endif; ?>
  </div>

  <!-- Gallery Photos Section -->
  <div>
    <h3 style="font-size: 20px; margin: 0 0 24px; font-weight: 600;">Фотографии галереи</h3>

    <div class="gallery__grid" id="galleryGrid">
      <?php foreach ($items as $item): ?>
        <div class="gallery__item" style="position: relative;">
          <img src="<?= htmlspecialchars('/diplo/assets/images/' . $item['filename']) ?>" alt="<?= htmlspecialchars($item['alt_text'] ?? '') ?>" onerror="this.src='/diplo/assets/images/photo_group.jpeg'">
          <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,.8), transparent); padding: 1rem; color: white;">
            <h3 style="margin: 0 0 4px; font-size: 16px;"><?= htmlspecialchars($item['title'] ?? 'Без названия') ?></h3>
            <p style="margin: 0; font-size: 12px; opacity: 0.9;"><?= htmlspecialchars($item['description'] ?? '') ?></p>
            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
              <button class="button" style="padding: 6px 12px; font-size: 12px;" onclick="editItem(<?= $item['id'] ?>)">Редактировать</button>
              <button class="button" style="padding: 6px 12px; font-size: 12px; background: #ff4d6d; border-color: #ff4d6d;" onclick="deleteItem(<?= $item['id'] ?>)">Удалить</button>
            </div>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</div>

<!-- Collage / Settings Modal -->
<div class="modal" id="collageModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); z-index: 1000; align-items: center; justify-content: center; transition: opacity 0.3s ease;">
  <div class="auth-card" style="max-width: 900px; width: 90%; max-height: 90vh; display: flex; flex-direction: column; position: relative; z-index: 1001; background: var(--bg); padding: 0; border-radius: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
    
    <div style="padding: 40px; background: linear-gradient(to right, rgba(125, 184, 213, 0.05), rgba(168, 213, 226, 0.05)); border-bottom: 1px solid rgba(0,0,0,0.05); flex-shrink: 0;">
      <h2 class="section__title" style="margin: 0; text-align: left;" id="collageModalTitle">Создать коллаж</h2>
      <p style="margin: 8px 0 0; color: var(--muted);">Добавьте название, главное изображение и дополнительные фотографии</p>
    </div>

    <div style="padding: 40px; overflow-y: auto; flex-grow: 1;">
      <form id="collageForm" enctype="multipart/form-data">
        <input type="hidden" id="collageId" value="">
        
        <!-- Collage Title -->
        <div style="margin-bottom: 32px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Название коллажа</label>
          <input type="text" id="collageTitle" placeholder="Например: Наша команда" style="width: 100%; padding: 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px; font-size: 16px;">
        </div>
        
        <!-- Photo Count -->
        <div style="margin-bottom: 32px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Количество фотографий для коллажа</label>
          <input type="number" id="collagePhotoCount" min="1" max="20" value="4" style="width: 100%; padding: 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px; font-size: 16px;">
          <p style="margin: 8px 0 0; color: var(--muted); font-size: 14px;">Укажите точное количество фотографий, которое будет использовано в коллаже (обычно 4)</p>
        </div>
        
        <!-- Main Image -->
        <div style="margin-bottom: 32px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="width: 24px; height: 24px; background: var(--surface); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--brand); font-weight: 700; font-size: 12px;">1</div>
            <label style="font-weight: 600; color: var(--text);">Главное изображение</label>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start;">
            
            <div>
              <div style="margin-bottom: 12px; font-weight: 600; color: var(--muted); font-size: 12px; text-transform: uppercase;">Текущее</div>
              <img id="currentCollage" src="/diplo/assets/images/photo_group.jpeg" alt="Текущий коллаж" style="width: 100%; border-radius: 16px; box-shadow: var(--shadow-sm);">
            </div>

            <div>
              <div style="margin-bottom: 12px; font-weight: 600; color: var(--muted); font-size: 12px; text-transform: uppercase;">Загрузить новое</div>
              <label style="display: block;">
                <div class="file-input-wrapper" style="position: relative; overflow: hidden; display: block; width: 100%;">
                  <input type="file" name="main_image" accept="image/*" id="mainImageInput" style="font-size: 100px; position: absolute; left: 0; top: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
                  <div style="background: var(--surface); border: 2px dashed rgba(0,0,0,0.15); padding: 32px; border-radius: 16px; text-align: center; cursor: pointer; transition: all 0.2s ease; min-height: 180px; display: flex; flex-direction: column; justify-content: center; align-items: center;" onmouseover="this.style.borderColor='var(--brand)'; this.style.background='rgba(125, 184, 213, 0.05)'" onmouseout="this.style.borderColor='rgba(0,0,0,0.15)'; this.style.background='var(--surface)'">
                     <span style="font-size: 32px; display: block; margin-bottom: 12px;">🖼️</span>
                     <span style="color: var(--brand); font-weight: 600;">Выберите файл</span>
                  </div>
                </div>
              </label>
            </div>

          </div>
        </div>
        
        <!-- Collage Photos -->
        <div style="margin-bottom: 32px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="width: 24px; height: 24px; background: var(--surface); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--brand); font-weight: 700; font-size: 12px;">2</div>
            <label style="font-weight: 600; color: var(--text);">Фотографии для коллажа</label>
          </div>
          <div id="photoCountInfo" style="margin-bottom: 12px; padding: 12px; background: rgba(125, 184, 213, 0.1); border-radius: 8px; color: var(--brand); font-weight: 600; font-size: 14px;">
            Необходимо загрузить: <span id="requiredPhotoCount">4</span> фотографии
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block;">
              <div class="file-input-wrapper" style="position: relative; overflow: hidden; display: block; width: 100%;">
                <input type="file" name="collage_photos[]" accept="image/*" multiple id="collagePhotosInput" style="font-size: 100px; position: absolute; left: 0; top: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
                <div style="background: var(--surface); border: 2px dashed rgba(0,0,0,0.15); padding: 24px; border-radius: 16px; text-align: center; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.borderColor='var(--brand)'; this.style.background='rgba(125, 184, 213, 0.05)'" onmouseout="this.style.borderColor='rgba(0,0,0,0.15)'; this.style.background='var(--surface)'">
                   <span style="font-size: 24px; display: block; margin-bottom: 8px;">📷</span>
                   <span style="color: var(--brand); font-weight: 600;">Выберите файлы</span>
                   <span id="photoCountStatus" style="display: block; margin-top: 4px; font-size: 12px; color: var(--muted);">Загружено: 0 из <span id="currentRequiredCount">4</span></span>
                </div>
              </div>
            </label>
          </div>
          <div id="collagePhotosPreview" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 16px; margin-top: 16px;"></div>
        </div>
        
        <!-- Layout Selection -->
        <div style="margin-bottom: 32px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="width: 24px; height: 24px; background: var(--surface); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--brand); font-weight: 700; font-size: 12px;">3</div>
            <label style="font-weight: 600; color: var(--text);">Раскладка галереи</label>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px;">
            <label class="layout-option">
              <input type="radio" name="gallery_layout" value="grid" checked onchange="saveLayout('grid')">
              <div class="layout-card">
                <div class="layout-preview" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                  <div style="background: currentColor; aspect-ratio: 1;"></div>
                  <div style="background: currentColor; aspect-ratio: 1;"></div>
                  <div style="background: currentColor; aspect-ratio: 1;"></div>
                  <div style="background: currentColor; aspect-ratio: 1;"></div>
                </div>
                <span style="font-weight: 600; display: block; margin-bottom: 4px;">Сетка</span>
                <span style="font-size: 12px; color: var(--muted); display: block;">Классическое отображение</span>
              </div>
            </label>
            <label class="layout-option">
              <input type="radio" name="gallery_layout" value="masonry" onchange="saveLayout('masonry')">
              <div class="layout-card">
                <div class="layout-preview" style="display: flex; gap: 4px;">
                  <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                     <div style="background: currentColor; height: 60%;"></div>
                     <div style="background: currentColor; height: 40%;"></div>
                  </div>
                  <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                     <div style="background: currentColor; height: 40%;"></div>
                     <div style="background: currentColor; height: 60%;"></div>
                  </div>
                </div>
                <span style="font-weight: 600; display: block; margin-bottom: 4px;">Пинтрест</span>
                <span style="font-size: 12px; color: var(--muted); display: block;">Разная высота фото</span>
              </div>
            </label>
            <label class="layout-option">
              <input type="radio" name="gallery_layout" value="mosaic" onchange="saveLayout('mosaic')">
              <div class="layout-card">
                <div class="layout-preview" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; grid-auto-rows: 1fr;">
                  <div style="background: currentColor; grid-column: span 2; grid-row: span 2;"></div>
                  <div style="background: currentColor;"></div>
                  <div style="background: currentColor;"></div>
                </div>
                <span style="font-weight: 600; display: block; margin-bottom: 4px;">Мозаика</span>
                <span style="font-size: 12px; color: var(--muted); display: block;">Акцентные элементы</span>
              </div>
            </label>
            <label class="layout-option">
              <input type="radio" name="gallery_layout" value="zigzag" onchange="saveLayout('zigzag')">
              <div class="layout-card">
                <div class="layout-preview" style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 4px;">
                    <div style="flex: 2; background: currentColor; height: 20px;"></div>
                    <div style="flex: 1; background: currentColor; height: 20px;"></div>
                  </div>
                  <div style="display: flex; gap: 4px;">
                    <div style="flex: 1; background: currentColor; height: 20px;"></div>
                    <div style="flex: 2; background: currentColor; height: 20px;"></div>
                  </div>
                  <div style="display: flex; gap: 4px;">
                    <div style="flex: 2; background: currentColor; height: 20px;"></div>
                    <div style="flex: 1; background: currentColor; height: 20px;"></div>
                  </div>
                </div>
                <span style="font-weight: 600; display: block; margin-bottom: 4px;">Зигзаг</span>
                <span style="font-size: 12px; color: var(--muted); display: block;">Чередующиеся размеры</span>
              </div>
            </label>
            <label class="layout-option">
              <input type="radio" name="gallery_layout" value="large" onchange="saveLayout('large')">
              <div class="layout-card">
                <div class="layout-preview" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                  <div style="background: currentColor; aspect-ratio: 1; grid-column: span 2;"></div>
                  <div style="background: currentColor; aspect-ratio: 1;"></div>
                  <div style="background: currentColor; aspect-ratio: 1;"></div>
                </div>
                <span style="font-weight: 600; display: block; margin-bottom: 4px;">Крупные</span>
                <span style="font-size: 12px; color: var(--muted); display: block;">Большие квадраты</span>
              </div>
            </label>
            <label class="layout-option">
              <input type="radio" name="gallery_layout" value="compact" onchange="saveLayout('compact')">
              <div class="layout-card">
                <div class="layout-preview" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px;">
                  <div style="background: currentColor; aspect-ratio: 1;"></div>
                  <div style="background: currentColor; aspect-ratio: 1;"></div>
                  <div style="background: currentColor; aspect-ratio: 1;"></div>
                  <div style="background: currentColor; aspect-ratio: 1;"></div>
                  <div style="background: currentColor; aspect-ratio: 1;"></div>
                  <div style="background: currentColor; aspect-ratio: 1;"></div>
                </div>
                <span style="font-weight: 600; display: block; margin-bottom: 4px;">Компактная</span>
                <span style="font-size: 12px; color: var(--muted); display: block;">Много фото в ряд</span>
              </div>
            </label>
            <label class="layout-option">
              <input type="radio" name="gallery_layout" value="asymmetric" onchange="saveLayout('asymmetric')">
              <div class="layout-card">
                <div class="layout-preview" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; grid-auto-rows: 1fr;">
                  <div style="background: currentColor; grid-row: span 2;"></div>
                  <div style="background: currentColor;"></div>
                  <div style="background: currentColor; grid-column: span 1;"></div>
                </div>
                <span style="font-weight: 600; display: block; margin-bottom: 4px;">Асимметричная</span>
                <span style="font-size: 12px; color: var(--muted); display: block;">Динамичная композиция</span>
              </div>
            </label>
            <label class="layout-option">
              <input type="radio" name="gallery_layout" value="staggered" onchange="saveLayout('staggered')">
              <div class="layout-card">
                <div class="layout-preview" style="display: flex; flex-direction: column; gap: 3px;">
                  <div style="background: currentColor; height: 25%; width: 75%;"></div>
                  <div style="background: currentColor; height: 25%; width: 100%; margin-left: 12.5%;"></div>
                  <div style="background: currentColor; height: 25%; width: 75%;"></div>
                  <div style="background: currentColor; height: 25%; width: 100%; margin-left: 12.5%;"></div>
                </div>
                <span style="font-weight: 600; display: block; margin-bottom: 4px;">Каскад</span>
                <span style="font-size: 12px; color: var(--muted); display: block;">Ступенчатое расположение</span>
              </div>
            </label>
          </div>
        </div>
        
        <div style="display: flex; gap: 1.5rem; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(0,0,0,0.05);">
          <button type="submit" class="button button--full" style="padding: 16px;">Сохранить коллаж</button>
          <button type="button" class="button button--ghost button--full" style="padding: 16px;" onclick="closeCollageModal()">Отмена</button>
        </div>
      </form>
    </div>

    <div style="padding: 24px 40px; background: var(--surface); text-align: right; border-top: 1px solid rgba(0,0,0,0.05); flex-shrink: 0;">
      <button class="button button--ghost" onclick="closeCollageModal()">Закрыть</button>
    </div>
  </div>
</div>

<!-- Layout Settings Modal -->
<div class="modal" id="layoutModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); z-index: 1000; align-items: center; justify-content: center;">
  <div class="auth-card" style="max-width: 700px; width: 90%; max-height: 90vh; display: flex; flex-direction: column; position: relative; z-index: 1001; background: var(--bg); padding: 0; border-radius: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden;">
    <div style="padding: 40px; background: linear-gradient(to right, rgba(125, 184, 213, 0.05), rgba(168, 213, 226, 0.05)); border-bottom: 1px solid rgba(0,0,0,0.05); flex-shrink: 0;">
      <h2 class="section__title" style="margin: 0; text-align: left;">Настройки раскладки галереи</h2>
      <p style="margin: 8px 0 0; color: var(--muted);">Выберите способ отображения фотографий</p>
    </div>
    <div style="padding: 40px; overflow-y: auto; flex-grow: 1;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px;">
        <label class="layout-option">
          <input type="radio" name="gallery_layout_layout" value="grid" checked onchange="saveLayout('grid')">
          <div class="layout-card">
            <div class="layout-preview" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <div style="background: currentColor; aspect-ratio: 1;"></div>
              <div style="background: currentColor; aspect-ratio: 1;"></div>
              <div style="background: currentColor; aspect-ratio: 1;"></div>
              <div style="background: currentColor; aspect-ratio: 1;"></div>
            </div>
            <span style="font-weight: 600; display: block; margin-bottom: 4px;">Сетка</span>
            <span style="font-size: 12px; color: var(--muted); display: block;">Классическое отображение</span>
          </div>
        </label>
        <label class="layout-option">
          <input type="radio" name="gallery_layout_layout" value="masonry" onchange="saveLayout('masonry')">
          <div class="layout-card">
            <div class="layout-preview" style="display: flex; gap: 4px;">
              <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                 <div style="background: currentColor; height: 60%;"></div>
                 <div style="background: currentColor; height: 40%;"></div>
              </div>
              <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                 <div style="background: currentColor; height: 40%;"></div>
                 <div style="background: currentColor; height: 60%;"></div>
              </div>
            </div>
            <span style="font-weight: 600; display: block; margin-bottom: 4px;">Пинтрест</span>
            <span style="font-size: 12px; color: var(--muted); display: block;">Разная высота фото</span>
          </div>
        </label>
        <label class="layout-option">
          <input type="radio" name="gallery_layout_layout" value="mosaic" onchange="saveLayout('mosaic')">
          <div class="layout-card">
            <div class="layout-preview" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; grid-auto-rows: 1fr;">
              <div style="background: currentColor; grid-column: span 2; grid-row: span 2;"></div>
              <div style="background: currentColor;"></div>
              <div style="background: currentColor;"></div>
            </div>
            <span style="font-weight: 600; display: block; margin-bottom: 4px;">Мозаика</span>
            <span style="font-size: 12px; color: var(--muted); display: block;">Акцентные элементы</span>
          </div>
        </label>
      </div>
    </div>
    <div style="padding: 24px 40px; background: var(--surface); text-align: right; border-top: 1px solid rgba(0,0,0,0.05); flex-shrink: 0;">
      <button class="button button--ghost" onclick="closeLayoutModal()">Закрыть</button>
    </div>
  </div>
</div>

<style>
.layout-option input { display: none; }
.layout-card {
  background: var(--surface);
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}
.layout-preview {
  width: 100%;
  height: 100px;
  background: var(--bg);
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 8px;
  color: var(--muted);
  opacity: 0.5;
  transition: all 0.2s ease;
}
.layout-option input:checked + .layout-card {
  border-color: var(--brand);
  background: rgba(125, 184, 213, 0.05);
}
.layout-option input:checked + .layout-card .layout-preview {
  color: var(--brand);
  opacity: 1;
}
.layout-option:hover .layout-card {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}
</style>

<!-- Add/Edit Modal -->
<div class="modal" id="itemModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); z-index: 1000; align-items: center; justify-content: center; transition: opacity 0.3s ease;">
  <div class="auth-card" style="max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 1001; background: var(--bg); padding: 0; border-radius: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid rgba(125, 184, 213, 0.2); overflow: hidden;">
    <div style="padding: 40px; background: linear-gradient(135deg, rgba(125, 184, 213, 0.05) 0%, rgba(168, 213, 226, 0.05) 100%); border-bottom: 1px solid rgba(125, 184, 213, 0.15); flex-shrink: 0;">
      <h2 id="modalTitle" class="section__title" style="margin: 0; text-align: left; font-size: 28px;">Добавить фото</h2>
      <p style="margin: 8px 0 0; color: var(--muted); font-size: 15px;">Загрузите фотографию и заполните информацию</p>
    </div>
    
    <div style="padding: 40px;">
      <form id="itemForm" class="form form--auth" enctype="multipart/form-data" style="display: grid; gap: 24px;">
        <input type="hidden" id="itemId" name="id">
        
        <div>
          <label style="display: block; margin-bottom: 12px; font-weight: 600; color: var(--text); font-size: 15px;">Файл *</label>
          <div style="position: relative; overflow: hidden;">
            <input type="file" id="itemFile" name="file" accept="image/*" required style="font-size: 100px; position: absolute; left: 0; top: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 2;">
            <div class="file-input-wrapper" style="background: var(--surface); border: 2px dashed rgba(125, 184, 213, 0.3); padding: 32px; border-radius: 16px; text-align: center; cursor: pointer; transition: all 0.3s ease; position: relative; min-height: 120px; display: flex; flex-direction: column; justify-content: center; align-items: center;" onmouseover="this.style.borderColor='var(--brand)'; this.style.background='rgba(125, 184, 213, 0.05)'" onmouseout="this.style.borderColor='rgba(125, 184, 213, 0.3)'; this.style.background='var(--surface)'">
              <span style="font-size: 32px; display: block; margin-bottom: 12px;">📷</span>
              <span style="color: var(--brand); font-weight: 600; font-size: 15px;">Выберите файл</span>
              <span id="fileNameDisplay" style="display: block; margin-top: 8px; font-size: 13px; color: var(--muted);"></span>
            </div>
          </div>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 12px; font-weight: 600; color: var(--text); font-size: 15px;">Название</label>
          <input type="text" id="itemTitle" name="title" placeholder="Название фотографии" style="width: 100%; padding: 14px 18px; border: 2px solid rgba(125, 184, 213, 0.2); border-radius: 12px; font-size: 16px; background: var(--surface); color: var(--text); transition: all 0.3s ease; font-family: inherit;" onfocus="this.style.borderColor='var(--brand)'; this.style.boxShadow='0 0 0 4px rgba(125, 184, 213, 0.1)'" onblur="this.style.borderColor='rgba(125, 184, 213, 0.2)'; this.style.boxShadow='none'">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 12px; font-weight: 600; color: var(--text); font-size: 15px;">Описание</label>
          <textarea id="itemDescription" name="description" placeholder="Описание фотографии (необязательно)" style="width: 100%; min-height: 120px; padding: 14px 18px; border: 2px solid rgba(125, 184, 213, 0.2); border-radius: 12px; font-size: 16px; background: var(--surface); color: var(--text); transition: all 0.3s ease; font-family: inherit; resize: vertical;" onfocus="this.style.borderColor='var(--brand)'; this.style.boxShadow='0 0 0 4px rgba(125, 184, 213, 0.1)'" onblur="this.style.borderColor='rgba(125, 184, 213, 0.2)'; this.style.boxShadow='none'"></textarea>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 12px; font-weight: 600; color: var(--text); font-size: 15px;">Alt текст</label>
          <input type="text" id="itemAlt" name="alt_text" placeholder="Альтернативный текст для изображения" style="width: 100%; padding: 14px 18px; border: 2px solid rgba(125, 184, 213, 0.2); border-radius: 12px; font-size: 16px; background: var(--surface); color: var(--text); transition: all 0.3s ease; font-family: inherit;" onfocus="this.style.borderColor='var(--brand)'; this.style.boxShadow='0 0 0 4px rgba(125, 184, 213, 0.1)'" onblur="this.style.borderColor='rgba(125, 184, 213, 0.2)'; this.style.boxShadow='none'">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 12px; font-weight: 600; color: var(--text); font-size: 15px;">Порядок сортировки</label>
          <input type="number" id="itemSort" name="sort_order" value="0" style="width: 100%; padding: 14px 18px; border: 2px solid rgba(125, 184, 213, 0.2); border-radius: 12px; font-size: 16px; background: var(--surface); color: var(--text); transition: all 0.3s ease; font-family: inherit;" onfocus="this.style.borderColor='var(--brand)'; this.style.boxShadow='0 0 0 4px rgba(125, 184, 213, 0.1)'" onblur="this.style.borderColor='rgba(125, 184, 213, 0.2)'; this.style.boxShadow='none'">
        </div>
        
        <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 16px; background: rgba(125, 184, 213, 0.05); border-radius: 12px; border: 1px solid rgba(125, 184, 213, 0.2); transition: all 0.3s ease;" onmouseover="this.style.background='rgba(125, 184, 213, 0.1)'" onmouseout="this.style.background='rgba(125, 184, 213, 0.05)'">
          <input type="checkbox" id="itemActive" name="is_active" checked style="width: 20px; height: 20px; cursor: pointer;">
          <span style="font-weight: 600; color: var(--text); font-size: 15px;">Активно (отображать на сайте)</span>
        </label>
        
        <div style="display: flex; gap: 12px; margin-top: 8px;">
          <button type="submit" class="button button--full" style="padding: 16px; font-size: 16px; flex: 1;">Сохранить</button>
          <button type="button" class="button button--ghost button--full" onclick="closeModal()" style="padding: 16px; font-size: 16px; flex: 1;">Отмена</button>
        </div>
      </form>
    </div>
  </div>
</div>

<script>
  // Update file name display when file is selected
  document.getElementById('itemFile')?.addEventListener('change', function(e) {
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    if (e.target.files && e.target.files[0] && fileNameDisplay) {
      fileNameDisplay.textContent = e.target.files[0].name;
      fileNameDisplay.style.color = 'var(--brand)';
    }
  });
  
  // Close modal when clicking outside
  document.getElementById('itemModal')?.addEventListener('click', function(e) {
    if (e.target.id === 'itemModal') {
      closeModal();
    }
  });
</script>

<script>
  let editingId = null;
  
  function openAddModal() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Добавить фото';
    document.getElementById('itemForm').reset();
    document.getElementById('itemId').value = '';
    document.getElementById('itemModal').style.display = 'flex';
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    if (fileNameDisplay) fileNameDisplay.textContent = '';
  }
  
  function editItem(id) {
    editingId = id;
    fetch(`/diplo/public/api/gallery.php`)
      .then(r => r.json())
      .then(data => {
        const item = data.items.find(i => i.id == id);
        if (item) {
          document.getElementById('modalTitle').textContent = 'Редактировать фото';
          document.getElementById('itemId').value = item.id;
          document.getElementById('itemTitle').value = item.title || '';
          document.getElementById('itemDescription').value = item.description || '';
          document.getElementById('itemAlt').value = item.alt_text || '';
          document.getElementById('itemSort').value = item.sort_order || 0;
          document.getElementById('itemActive').checked = item.is_active == 1;
          document.getElementById('itemModal').style.display = 'flex';
        }
      });
  }
  
  function closeModal() {
    document.getElementById('itemModal').style.display = 'none';
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    if (fileNameDisplay) fileNameDisplay.textContent = '';
  }
  
  function closeCollageModal() {
    document.getElementById('collageModal').style.display = 'none';
  }
  
  let editingCollageId = null;
  
  function openCollageModal(id = null) {
    editingCollageId = id ? parseInt(id) : null;
    
    // Clear form fields manually instead of reset() to preserve hidden fields
    document.getElementById('collageTitle').value = '';
    document.getElementById('mainImageInput').value = '';
    document.getElementById('collagePhotosInput').value = '';
    
    // Set ID
    if (id) {
      document.getElementById('collageId').value = id;
    } else {
      document.getElementById('collageId').value = '';
      document.getElementById('collagePhotoCount').value = 4; // Default for new collage
    }
    
    document.getElementById('collageModalTitle').textContent = id ? 'Редактировать коллаж' : 'Создать коллаж';
    document.getElementById('currentCollage').src = '/diplo/assets/images/photo_group.jpeg?' + new Date().getTime();
    document.getElementById('collagePhotosPreview').innerHTML = '';
    collagePhotos = [];
    mainImageFile = null;
    document.getElementById('collageModal').style.display = 'flex';
    
    // Update photo count info
    updatePhotoCountInfo();
    
    // Load current layout setting
    fetch('/diplo/public/api/settings.php')
      .then(r => r.json())
      .then(data => {
        if (data.layout) {
          const radio = document.querySelector(`input[name="gallery_layout"][value="${data.layout}"]`);
          if (radio) radio.checked = true;
        }
      });
    
    if (id) {
      // Load existing collage
      console.log('Loading collage ID:', id);
      fetch(`/diplo/public/api/collage.php?id=${id}`)
        .then(r => r.json())
        .then(data => {
          console.log('Loaded collage data:', data);
          if (data.collage) {
            const collage = data.collage;
            console.log('Collage ID from DB:', collage.id, 'Expected:', id);
            
            document.getElementById('collageTitle').value = collage.title || '';
            document.getElementById('collageId').value = collage.id; // Ensure ID is set correctly
            document.getElementById('collagePhotoCount').value = collage.photo_count || 4;
            
            // Update photo count info
            updatePhotoCountInfo();
            
            if (collage.main_image) {
              document.getElementById('currentCollage').src = '/diplo/assets/images/' + collage.main_image + '?' + new Date().getTime();
            }
            if (collage.photos && collage.photos.length > 0) {
              collagePhotos = collage.photos.map(photo => ({ filename: photo }));
              renderPhotosPreview();
            }
            
            // Update editingCollageId to match loaded collage
            editingCollageId = parseInt(collage.id);
          } else {
            console.error('Collage not found for ID:', id);
            alert('Коллаж не найден!');
          }
        })
        .catch(err => {
          console.error('Error loading collage:', err);
          alert('Ошибка загрузки коллажа: ' + err.message);
        });
    }
  }
  
  function editCollage(id) {
    openCollageModal(id);
  }
  
  async function saveLayout(layout) {
    console.log('[saveLayout] Called with layout:', layout);
    console.log('[saveLayout] Timestamp:', new Date().toISOString());
    
    try {
      console.log('[saveLayout] Sending POST request to /diplo/public/api/settings.php');
      const res = await fetch('/diplo/public/api/settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout })
      });
      
      console.log('[saveLayout] Response status:', res.status, res.statusText);
      console.log('[saveLayout] Response headers:', Object.fromEntries(res.headers.entries()));
      
      if (res.ok) {
        const data = await res.json();
        console.log('[saveLayout] Success response data:', data);
        console.log('[saveLayout] Saved layout:', data.layout);
        
        // Show success message with option to view
        const msg = document.createElement('div');
        msg.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 16px 24px; background: #10b981; color: white; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 350px;';
        msg.innerHTML = `
          <div style="margin-bottom: 12px; font-weight: 600;">Раскладка "${layout}" сохранена</div>
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <button onclick="this.closest('div').remove()" style="flex: 1; padding: 6px 12px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; color: white; cursor: pointer; font-size: 14px;">ОК</button>
            <button onclick="window.open('/gallery.php?' + new Date().getTime(), '_blank'); this.closest('div').remove();" style="flex: 1; padding: 6px 12px; background: white; border: 0; border-radius: 6px; color: #10b981; cursor: pointer; font-size: 14px; font-weight: 600;">Открыть галерею</button>
          </div>
        `;
        document.body.appendChild(msg);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
          if (msg.parentNode) {
            msg.remove();
          }
        }, 5000);
        
        console.log('[saveLayout] Success message displayed');
        console.log('[saveLayout] Saved layout:', layout, 'Time:', new Date().toISOString());
        
        // Verify save by reading back
        setTimeout(() => {
          fetch('/diplo/public/api/settings.php?' + new Date().getTime())
            .then(r => r.json())
            .then(verifyData => {
              console.log('[saveLayout] Verification - Current layout in file:', verifyData.layout);
              if (verifyData.layout !== layout) {
                console.error('[saveLayout] WARNING: Layout mismatch! Expected:', layout, 'Got:', verifyData.layout);
              }
            });
        }, 500);
      } else {
        const errorText = await res.text();
        console.error('[saveLayout] Error response:', errorText);
        const error = JSON.parse(errorText);
        alert('Ошибка сохранения раскладки: ' + (error.error || errorText));
      }
    } catch (e) {
      console.error('[saveLayout] Exception:', e);
      console.error('[saveLayout] Stack:', e.stack);
      alert('Ошибка: ' + e.message);
    }
  }
  
  function deleteCollage(id) {
    if (!confirm('Вы действительно хотите удалить этот коллаж?')) return;
    
    fetch(`/diplo/public/api/collage.php?id=${id}`, { method: 'DELETE' })
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          location.reload();
        } else {
          alert('Ошибка: ' + (data.error || 'Не удалось удалить коллаж'));
        }
      })
      .catch(err => {
        console.error(err);
        alert('Ошибка сети');
      });
  }
  
  function openLayoutModal() {
    document.getElementById('layoutModal').style.display = 'flex';
    fetch('/diplo/public/api/settings.php')
      .then(r => r.json())
      .then(data => {
        if (data.layout) {
          const radio = document.querySelector(`input[name="gallery_layout_layout"][value="${data.layout}"]`);
          if (radio) radio.checked = true;
        }
      });
  }
  
  function closeLayoutModal() {
    document.getElementById('layoutModal').style.display = 'none';
  }
  
  let collagePhotos = [];
  let mainImageFile = null;
  
  function updatePhotoCountInfo() {
    const photoCount = parseInt(document.getElementById('collagePhotoCount').value) || 4;
    const currentCount = collagePhotos.length;
    const requiredCount = photoCount;
    
    document.getElementById('requiredPhotoCount').textContent = requiredCount;
    document.getElementById('currentRequiredCount').textContent = requiredCount;
    
    const statusEl = document.getElementById('photoCountStatus');
    const infoEl = document.getElementById('photoCountInfo');
    
    if (currentCount === requiredCount) {
      statusEl.innerHTML = `<span style="color: var(--ok);">Загружено: ${currentCount} из ${requiredCount} ✓</span>`;
      infoEl.style.background = 'rgba(16, 185, 129, 0.1)';
      infoEl.style.color = 'var(--ok)';
    } else if (currentCount > requiredCount) {
      statusEl.innerHTML = `<span style="color: var(--warn);">Загружено: ${currentCount} из ${requiredCount} (удалите ${currentCount - requiredCount})</span>`;
      infoEl.style.background = 'rgba(245, 158, 11, 0.1)';
      infoEl.style.color = 'var(--warn)';
    } else {
      statusEl.innerHTML = `<span style="color: var(--text);">Загружено: ${currentCount} из ${requiredCount} (осталось ${requiredCount - currentCount})</span>`;
      infoEl.style.background = 'rgba(125, 184, 213, 0.1)';
      infoEl.style.color = 'var(--brand)';
    }
  }
  
  function renderPhotosPreview() {
    const preview = document.getElementById('collagePhotosPreview');
    preview.innerHTML = '';
    
    collagePhotos.forEach((photo, index) => {
      const div = document.createElement('div');
      div.style.position = 'relative';
      const photoSrc = photo.preview || (photo.filename ? `/diplo/assets/images/${photo.filename}` : '');
      if (!photoSrc) return;
      
      div.innerHTML = `
        <img src="${photoSrc}" style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 12px;">
        <button type="button" onclick="removePhoto(${index})" style="position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; border-radius: 50%; background: rgba(255,77,109,0.9); border: 0; color: white; cursor: pointer; font-weight: 700;">×</button>
      `;
      preview.appendChild(div);
    });
    
    updatePhotoCountInfo();
  }
  
  function removePhoto(index) {
    collagePhotos.splice(index, 1);
    renderPhotosPreview();
  }
  
  document.getElementById('mainImageInput').addEventListener('change', function(e) {
    if (e.target.files && e.target.files[0]) {
      mainImageFile = e.target.files[0];
      const reader = new FileReader();
      reader.onload = function(event) {
        document.getElementById('currentCollage').src = event.target.result;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });
  
  document.getElementById('collagePhotosInput').addEventListener('change', function(e) {
    if (e.target.files && e.target.files.length > 0) {
      const photoCount = parseInt(document.getElementById('collagePhotoCount').value) || 4;
      const currentCount = collagePhotos.length;
      const remainingSlots = photoCount - currentCount;
      
      if (remainingSlots <= 0) {
        alert(`Максимальное количество фотографий: ${photoCount}. Удалите лишние фотографии перед добавлением новых.`);
        e.target.value = '';
        return;
      }
      
      const filesToAdd = Array.from(e.target.files).slice(0, remainingSlots);
      
      if (e.target.files.length > remainingSlots) {
        alert(`Будет добавлено только ${remainingSlots} фотографий из ${e.target.files.length} (максимум ${photoCount})`);
      }
      
      filesToAdd.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(event) {
          collagePhotos.push({ file: file, preview: event.target.result });
          renderPhotosPreview();
        };
        reader.readAsDataURL(file);
      });
      
      e.target.value = '';
    }
  });
  
  // Update photo count info when count changes
  document.getElementById('collagePhotoCount').addEventListener('change', function(e) {
    const newCount = parseInt(e.target.value) || 4;
    const currentCount = collagePhotos.length;
    
    if (currentCount > newCount) {
      if (!confirm(`Текущее количество фотографий (${currentCount}) больше указанного (${newCount}). Удалить лишние?`)) {
        e.target.value = currentCount;
        return;
      }
      collagePhotos = collagePhotos.slice(0, newCount);
      renderPhotosPreview();
    } else {
      updatePhotoCountInfo();
    }
  });
  
  // Update photo count info when modal opens
  document.addEventListener('DOMContentLoaded', function() {
    const photoCountInput = document.getElementById('collagePhotoCount');
    if (photoCountInput) {
      updatePhotoCountInfo();
    }
  });
  
  document.getElementById('collageForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('collageTitle').value.trim();
    if (!title) {
      alert('Введите название коллажа');
      return;
    }
    
    try {
      // Get ID from hidden field or variable
      const collageIdValue = document.getElementById('collageId').value;
      const currentId = editingCollageId || (collageIdValue ? parseInt(collageIdValue) : null);
      
      let mainImageFilename = null;
      
      // Upload main image if changed
      if (mainImageFile) {
        console.log('[collageForm] Uploading main image:', mainImageFile.name, 'Type:', mainImageFile.type, 'Size:', mainImageFile.size);
        const mainFormData = new FormData();
        mainFormData.append('file', mainImageFile);
        
        try {
          const mainRes = await fetch('/diplo/public/api/upload.php', {
            method: 'POST',
            body: mainFormData
          });
          
          console.log('[collageForm] Main image upload response status:', mainRes.status);
          const mainData = await mainRes.json();
          console.log('[collageForm] Main image upload response:', mainData);
          
          if (!mainData.ok) {
            console.error('[collageForm] Main image upload failed:', mainData.error);
            throw new Error(mainData.error || 'Ошибка загрузки главного изображения');
          }
          mainImageFilename = mainData.filename;
          console.log('[collageForm] Main image uploaded successfully:', mainImageFilename);
        } catch (err) {
          console.error('[collageForm] Exception during main image upload:', err);
          throw err;
        }
      } else if (currentId) {
        // Get existing main image for editing
        const existingRes = await fetch(`/diplo/public/api/collage.php?id=${currentId}`);
        const existingData = await existingRes.json();
        if (existingData.collage && existingData.collage.main_image) {
          mainImageFilename = existingData.collage.main_image;
        } else {
          throw new Error('Загрузите главное изображение');
        }
      } else {
        throw new Error('Загрузите главное изображение');
      }
      
      // Upload collage photos
      const uploadedPhotos = [];
      for (let i = 0; i < collagePhotos.length; i++) {
        const photo = collagePhotos[i];
        if (photo.file) {
          // New file, upload it
          console.log('[collageForm] Uploading photo', i + 1, ':', photo.file.name, 'Type:', photo.file.type, 'Size:', photo.file.size);
          const photoFormData = new FormData();
          photoFormData.append('file', photo.file);
          
          try {
            const photoRes = await fetch('/diplo/public/api/upload.php', {
              method: 'POST',
              body: photoFormData
            });
            
            console.log('[collageForm] Photo', i + 1, 'upload response status:', photoRes.status);
            const photoData = await photoRes.json();
            console.log('[collageForm] Photo', i + 1, 'upload response:', photoData);
            
            if (photoData.ok) {
              uploadedPhotos.push(photoData.filename);
              console.log('[collageForm] Photo', i + 1, 'uploaded successfully:', photoData.filename);
            } else {
              console.error('[collageForm] Photo', i + 1, 'upload failed:', photoData.error);
              throw new Error('Ошибка загрузки фото #' + (i + 1) + ': ' + (photoData.error || 'Неизвестная ошибка'));
            }
          } catch (err) {
            console.error('[collageForm] Exception during photo', i + 1, 'upload:', err);
            throw err;
          }
        } else if (photo.filename) {
          // Existing photo, keep filename
          uploadedPhotos.push(photo.filename);
        }
      }
      
      // If editing and no photos in array, keep existing photos
      if (currentId && uploadedPhotos.length === 0) {
        const existingRes = await fetch(`/diplo/public/api/collage.php?id=${currentId}`);
        const existingData = await existingRes.json();
        if (existingData.collage && existingData.collage.photos && existingData.collage.photos.length > 0) {
          uploadedPhotos.push(...existingData.collage.photos);
        }
      }
      
      // Get photo count
      const photoCount = parseInt(document.getElementById('collagePhotoCount').value) || 4;
      
      // Validate photo count (allow 0 for main image only)
      if (photoCount > 0 && uploadedPhotos.length !== photoCount) {
        alert(`Необходимо загрузить ровно ${photoCount} фотографий. Загружено: ${uploadedPhotos.length}`);
        return;
      }
      
      console.log('[collageForm] Photo validation passed. Photo count:', photoCount, 'Uploaded:', uploadedPhotos.length);
      
      // Save collage data
      const method = currentId ? 'PUT' : 'POST';
      const collageData = currentId 
        ? {
            id: parseInt(currentId),
            title: title,
            main_image: mainImageFilename,
            photos: uploadedPhotos,
            photo_count: photoCount
          }
        : {
            title: title,
            main_image: mainImageFilename,
            photos: uploadedPhotos,
            photo_count: photoCount
          };
      
      console.log('Saving collage:', method, 'ID:', currentId, 'Data:', collageData);
      
      const saveRes = await fetch('/diplo/public/api/collage.php', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collageData)
      });
      
      const saveData = await saveRes.json();
      console.log('[collageForm] Save response:', saveData);
      console.log('[collageForm] Response status:', saveRes.status);
      
      if (saveData.ok) {
        console.log('[collageForm] Collage saved successfully!');
        console.log('[collageForm] Collage ID:', saveData.id || currentId);
        
        const successMsg = currentId 
          ? `Коллаж #${currentId} "${title}" успешно обновлен!` 
          : `Коллаж "${title}" успешно создан! (ID: ${saveData.id || 'N/A'})`;
        
        alert(successMsg);
        
        // Close modal first
        document.getElementById('collageModal').style.display = 'none';
        
        // Reload page to show new collage
        console.log('[collageForm] Reloading page...');
        location.reload();
      } else {
        console.error('[collageForm] Save failed:', saveData);
        alert('Ошибка: ' + (saveData.error || 'Не удалось сохранить коллаж'));
      }
    } catch (err) {
      console.error('[collageForm] Exception:', err);
      console.error('[collageForm] Stack:', err.stack);
      alert('Ошибка: ' + err.message);
    }
  });
  

  function deleteItem(id) {
    if (!confirm('Удалить это фото?')) return;
    
    fetch(`/diplo/public/api/gallery.php?id=${id}`, { method: 'DELETE' })
      .then(() => location.reload());
  }
  
  document.getElementById('itemForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (editingId) {
      const data = {
        id: editingId,
        title: formData.get('title'),
        description: formData.get('description'),
        alt_text: formData.get('alt_text'),
        sort_order: parseInt(formData.get('sort_order')),
        is_active: formData.get('is_active') ? 1 : 0
      };
      
      const res = await fetch('/diplo/public/api/gallery.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        location.reload();
      }
    } else {
      if (!formData.get('file').name) {
        alert('Выберите файл');
        return;
      }
      
      const uploadRes = await fetch('/diplo/public/api/upload.php', {
        method: 'POST',
        body: formData
      });
      
      const uploadData = await uploadRes.json();
      
      if (uploadData.ok) {
        const data = {
          filename: uploadData.filename,
          title: formData.get('title'),
          description: formData.get('description'),
          alt_text: formData.get('alt_text'),
          sort_order: parseInt(formData.get('sort_order'))
        };
        
        const res = await fetch('/diplo/public/api/gallery.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (res.ok) {
          location.reload();
        }
      }
    }
  });
</script>

<?php require_once __DIR__ . '/footer.php'; ?>
