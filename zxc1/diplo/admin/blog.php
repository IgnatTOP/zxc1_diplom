<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/init.php';

$user = current_user();
if (!$user || $user['role'] !== 'admin') {
  header('Location: /login.php');
  exit;
}

$pdo = get_db();

// Get blog page settings
$stmt = $pdo->prepare('SELECT key_name, value FROM content WHERE page = ?');
$stmt->execute(['blog']);
$contentRows = $stmt->fetchAll();

$content = [];
foreach ($contentRows as $row) {
  $content[$row['key_name']] = $row['value'];
}

// Get blog posts
$blogPosts = $pdo->query('SELECT * FROM blog_posts ORDER BY sort_order ASC, created_at DESC')->fetchAll();

$pageTitle = 'Редактирование блога — Админ-панель';
$currentPage = 'blog.php';
require_once __DIR__ . '/header.php';
?>

<div class="admin-content">
  <h2 class="section__title" style="margin-top: 0;">Редактирование блога</h2>
  
  <!-- Page Settings -->
  <div style="margin-bottom: 48px; padding-bottom: 32px; border-bottom: 2px solid var(--brand);">
    <h3 style="font-size: 1.5rem; font-weight: 700; margin: 0 0 24px; color: var(--text);">Настройки страницы</h3>
    <form id="blogPageForm" style="display: grid; gap: 20px; max-width: 800px;">
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Заголовок страницы</label>
        <input type="text" id="pageTitle" value="<?= htmlspecialchars($content['page_title'] ?? 'Блог') ?>" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px;">
      </div>
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Подзаголовок</label>
        <input type="text" id="pageSubtitle" value="<?= htmlspecialchars($content['page_subtitle'] ?? 'Новости и статьи о танцах, занятиях и жизни студии') ?>" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px;">
      </div>
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text);">Вводный текст</label>
        <textarea id="introText" rows="4" required style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 16px; font-family: inherit; resize: vertical;"><?= htmlspecialchars($content['intro_text'] ?? '') ?></textarea>
        <small style="color: var(--muted); font-size: 14px; margin-top: 4px; display: block;">Поддерживается HTML-разметка</small>
      </div>
      <div>
        <button type="submit" class="button" style="padding: 12px 24px;">Сохранить настройки</button>
      </div>
      <div id="pageSettingsMessage" style="display: none; padding: 12px 16px; border-radius: 8px; margin-top: 8px;"></div>
    </form>
  </div>
  
  <!-- Blog Posts -->
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h3 style="font-size: 1.5rem; font-weight: 700; margin: 0; color: var(--text);">Статьи</h3>
      <button type="button" class="button" onclick="openPostModal(null)" style="padding: 12px 24px;">Добавить статью</button>
    </div>
    
    <div id="blogPostsList" style="display: grid; gap: 20px;">
      <?php foreach ($blogPosts as $post): ?>
        <div class="blog-post-item" data-id="<?= $post['id'] ?>" style="background: var(--surface); border-radius: 16px; padding: 24px; border: 1px solid rgba(0,0,0,0.1);">
          <div style="display: grid; grid-template-columns: 150px 1fr auto; gap: 24px; align-items: start;">
            <div>
              <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text); font-size: 14px;">Главное изображение</label>
                <?php if ($post['featured_image']): ?>
                  <img src="/diplo/assets/images/<?= htmlspecialchars($post['featured_image']) ?>" alt="<?= htmlspecialchars($post['title']) ?>" style="width: 150px; height: 150px; object-fit: cover; border-radius: 12px; border: 2px solid var(--brand); margin-bottom: 8px;">
                <?php else: ?>
                  <div style="width: 150px; height: 150px; background: linear-gradient(135deg, var(--brand), var(--accent)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 3rem; border: 2px solid var(--brand); margin-bottom: 8px;">
                    📝
                  </div>
                <?php endif; ?>
                <input type="file" accept="image/*" class="post-featured-image-upload" data-id="<?= $post['id'] ?>" style="width: 100%; font-size: 11px; cursor: pointer;">
              </div>
              
              <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text); font-size: 14px;">Дополнительные изображения</label>
                <div class="post-images-container" data-id="<?= $post['id'] ?>" style="margin-bottom: 8px;">
                  <?php
                  $postImages = !empty($post['images']) ? json_decode($post['images'], true) : [];
                  if (!is_array($postImages)) $postImages = [];
                  foreach ($postImages as $img): ?>
                    <div class="post-image-item" style="position: relative; display: inline-block; margin: 4px;">
                      <img src="/diplo/assets/images/<?= htmlspecialchars($img) ?>" alt="Изображение" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid var(--brand);">
                      <button type="button" class="remove-post-image" data-id="<?= $post['id'] ?>" data-image="<?= htmlspecialchars($img) ?>" style="position: absolute; top: -8px; right: -8px; width: 24px; height: 24px; border-radius: 50%; background: #ff4d6d; border: none; color: white; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">×</button>
                    </div>
                  <?php endforeach; ?>
                </div>
                <input type="file" accept="image/*" multiple class="post-images-upload" data-id="<?= $post['id'] ?>" style="width: 100%; font-size: 11px; cursor: pointer;">
                <small style="color: var(--muted); font-size: 11px; display: block; margin-top: 4px;">Можно загрузить несколько изображений</small>
              </div>
            </div>
            <div style="flex: 1;">
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text); font-size: 14px;">Заголовок</label>
              <input type="text" class="post-title" data-id="<?= $post['id'] ?>" value="<?= htmlspecialchars($post['title']) ?>" required style="width: 100%; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 15px; margin-bottom: 12px;">
              
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text); font-size: 14px;">Краткое описание</label>
              <textarea class="post-excerpt" data-id="<?= $post['id'] ?>" rows="2" style="width: 100%; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 14px; font-family: inherit; resize: vertical; margin-bottom: 12px;"><?= htmlspecialchars($post['excerpt'] ?? '') ?></textarea>
              
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text); font-size: 14px;">Полный текст статьи</label>
              <textarea class="post-content" data-id="<?= $post['id'] ?>" rows="5" required style="width: 100%; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 14px; font-family: inherit; resize: vertical; margin-bottom: 12px;"><?= htmlspecialchars($post['content']) ?></textarea>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text); font-size: 14px;">Автор</label>
                  <input type="text" class="post-author" data-id="<?= $post['id'] ?>" value="<?= htmlspecialchars($post['author'] ?? '') ?>" style="width: 100%; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 14px;">
                </div>
                <div>
                  <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text); font-size: 14px;">Дата публикации</label>
                  <input type="datetime-local" class="post-date" data-id="<?= $post['id'] ?>" value="<?= $post['published_date'] ? date('Y-m-d\TH:i', strtotime($post['published_date'])) : '' ?>" style="width: 100%; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 14px;">
                </div>
              </div>
              
              <div style="display: flex; align-items: center; gap: 16px; margin-top: 12px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input type="checkbox" class="post-published" data-id="<?= $post['id'] ?>" <?= $post['is_published'] ? 'checked' : '' ?> style="width: 18px; height: 18px; cursor: pointer;">
                  <span style="color: var(--text); font-size: 14px;">Опубликовано</span>
                </label>
                <input type="number" class="post-order" data-id="<?= $post['id'] ?>" value="<?= $post['sort_order'] ?>" placeholder="Порядок" style="width: 100px; padding: 8px 12px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 14px;">
              </div>
              
              <small style="color: var(--muted); font-size: 13px; margin-top: 8px; display: block;">Поддерживается HTML-разметка в тексте статьи</small>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <button type="button" class="button" onclick="saveBlogPost(<?= $post['id'] ?>)" style="padding: 10px 16px; font-size: 14px; white-space: nowrap;">Сохранить</button>
              <button type="button" class="button button--ghost" onclick="deleteBlogPost(<?= $post['id'] ?>)" style="padding: 10px 16px; font-size: 14px; white-space: nowrap; color: #ff4d6d; border-color: #ff4d6d;">Удалить</button>
            </div>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</div>

<script>
// Page settings form
document.getElementById('blogPageForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const messageEl = document.getElementById('pageSettingsMessage');
  messageEl.style.display = 'none';
  
  const data = {
    page_title: document.getElementById('pageTitle').value.trim(),
    page_subtitle: document.getElementById('pageSubtitle').value.trim(),
    intro_text: document.getElementById('introText').value.trim(),
  };
  
  try {
    const res = await fetch('/diplo/public/api/blog.php?action=page_settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await res.json();
    
    if (result.ok) {
      messageEl.style.display = 'block';
      messageEl.style.background = 'rgba(16, 185, 129, 0.1)';
      messageEl.style.border = '1px solid rgba(16, 185, 129, 0.3)';
      messageEl.style.color = '#10b981';
      messageEl.textContent = 'Настройки сохранены!';
      
      setTimeout(() => {
        messageEl.style.display = 'none';
      }, 3000);
    } else {
      messageEl.style.display = 'block';
      messageEl.style.background = 'rgba(255, 77, 109, 0.1)';
      messageEl.style.border = '1px solid rgba(255, 77, 109, 0.3)';
      messageEl.style.color = '#ff4d6d';
      messageEl.textContent = result.error || 'Ошибка сохранения';
    }
  } catch (err) {
    messageEl.style.display = 'block';
    messageEl.style.background = 'rgba(255, 77, 109, 0.1)';
    messageEl.style.border = '1px solid rgba(255, 77, 109, 0.3)';
    messageEl.style.color = '#ff4d6d';
    messageEl.textContent = 'Ошибка соединения. Попробуйте позже.';
  }
});

// Blog post functions
function openPostModal(id) {
  if (id === null) {
    // Create new post
    const list = document.getElementById('blogPostsList');
    const newId = 'new_' + Date.now();
    
    const postHtml = `
      <div class="blog-post-item" data-id="${newId}" style="background: var(--surface); border-radius: 16px; padding: 24px; border: 1px solid rgba(0,0,0,0.1);">
        <div style="display: grid; grid-template-columns: 150px 1fr auto; gap: 24px; align-items: start;">
          <div>
            <div style="width: 150px; height: 150px; background: linear-gradient(135deg, var(--brand), var(--accent)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 3rem; border: 2px solid var(--brand);">
              📝
            </div>
            <input type="file" accept="image/*" class="post-image-upload" data-id="${newId}" style="width: 100%; margin-top: 8px; font-size: 11px; cursor: pointer;">
          </div>
          <div style="flex: 1;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text); font-size: 14px;">Заголовок</label>
            <input type="text" class="post-title" data-id="${newId}" placeholder="Заголовок статьи" required style="width: 100%; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 15px; margin-bottom: 12px;">
            
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text); font-size: 14px;">Краткое описание</label>
            <textarea class="post-excerpt" data-id="${newId}" rows="2" placeholder="Краткое описание для карточки" style="width: 100%; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 14px; font-family: inherit; resize: vertical; margin-bottom: 12px;"></textarea>
            
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text); font-size: 14px;">Полный текст статьи</label>
            <textarea class="post-content" data-id="${newId}" rows="5" placeholder="Полный текст статьи..." required style="width: 100%; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 14px; font-family: inherit; resize: vertical; margin-bottom: 12px;"></textarea>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text); font-size: 14px;">Автор</label>
                <input type="text" class="post-author" data-id="${newId}" placeholder="Имя автора" style="width: 100%; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 14px;">
              </div>
              <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text); font-size: 14px;">Дата публикации</label>
                <input type="datetime-local" class="post-date" data-id="${newId}" style="width: 100%; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 14px;">
              </div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 16px; margin-top: 12px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" class="post-published" data-id="${newId}" style="width: 18px; height: 18px; cursor: pointer;">
                <span style="color: var(--text); font-size: 14px;">Опубликовано</span>
              </label>
              <input type="number" class="post-order" data-id="${newId}" value="0" placeholder="Порядок" style="width: 100px; padding: 8px 12px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 14px;">
            </div>
            
            <small style="color: var(--muted); font-size: 13px; margin-top: 8px; display: block;">Поддерживается HTML-разметка в тексте статьи</small>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button type="button" class="button" onclick="saveBlogPost('${newId}')" style="padding: 10px 16px; font-size: 14px; white-space: nowrap;">Сохранить</button>
            <button type="button" class="button button--ghost" onclick="deleteBlogPost('${newId}')" style="padding: 10px 16px; font-size: 14px; white-space: nowrap; color: #ff4d6d; border-color: #ff4d6d;">Отмена</button>
          </div>
        </div>
      </div>
    `;
    
    list.insertAdjacentHTML('beforeend', postHtml);
    list.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

async function saveBlogPost(id) {
  const item = document.querySelector(`.blog-post-item[data-id="${id}"]`);
  if (!item) return;
  
  const titleInput = item.querySelector('.post-title');
  const excerptInput = item.querySelector('.post-excerpt');
  const contentInput = item.querySelector('.post-content');
  const authorInput = item.querySelector('.post-author');
  const dateInput = item.querySelector('.post-date');
  const publishedInput = item.querySelector('.post-published');
  const orderInput = item.querySelector('.post-order');
  const featuredImageInput = item.querySelector('.post-featured-image-upload');
  const imagesContainer = item.querySelector('.post-images-container');
  
  const title = titleInput.value.trim();
  const excerpt = excerptInput.value.trim();
  const content = contentInput.value.trim();
  const author = authorInput.value.trim();
  const publishedDate = dateInput.value;
  const isPublished = publishedInput.checked ? 1 : 0;
  const sortOrder = parseInt(orderInput.value) || 0;
  
  if (!title || !content) {
    alert('Заполните заголовок и текст статьи');
    return;
  }
  
  // Get existing images from container
  let existingImages = [];
  if (imagesContainer) {
    const imageItems = imagesContainer.querySelectorAll('.post-image-item img');
    imageItems.forEach(img => {
      const src = img.src;
      const match = src.match(/\/diplo\/assets\/images\/(.+)$/);
      if (match) {
        existingImages.push(match[1]);
      }
    });
  }
  
  // Upload featured image if changed
  let featuredImage = null;
  if (featuredImageInput && featuredImageInput.files && featuredImageInput.files[0]) {
    const formData = new FormData();
    formData.append('file', featuredImageInput.files[0]);
    
    try {
      const uploadRes = await fetch('/diplo/public/api/upload.php', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (uploadData.ok) {
        featuredImage = uploadData.filename;
      } else {
        alert('Ошибка загрузки главного изображения: ' + (uploadData.error || 'Неизвестная ошибка'));
        return;
      }
    } catch (e) {
      alert('Ошибка загрузки главного изображения');
      return;
    }
  } else if (!id.toString().startsWith('new_')) {
    // Keep existing featured image if not uploading new one
    const existingImg = item.querySelector('.post-featured-image-upload')?.previousElementSibling?.querySelector('img');
    if (existingImg) {
      const src = existingImg.src;
      const match = src.match(/\/diplo\/assets\/images\/(.+)$/);
      if (match) {
        featuredImage = match[1];
      }
    }
  }
  
  // Upload additional images if selected
  const imagesInput = item.querySelector('.post-images-upload');
  if (imagesInput && imagesInput.files && imagesInput.files.length > 0) {
    for (let i = 0; i < imagesInput.files.length; i++) {
      const formData = new FormData();
      formData.append('file', imagesInput.files[i]);
      
      try {
        const uploadRes = await fetch('/diplo/public/api/upload.php', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadData.ok) {
          existingImages.push(uploadData.filename);
        } else {
          console.error('Ошибка загрузки изображения: ' + (uploadData.error || 'Неизвестная ошибка'));
        }
      } catch (e) {
        console.error('Ошибка загрузки изображения');
      }
    }
  }
  
  try {
    const res = await fetch('/diplo/public/api/blog.php?action=post', {
      method: id.toString().startsWith('new_') ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: id.toString().startsWith('new_') ? null : parseInt(id),
        title,
        excerpt,
        content,
        author,
        published_date: publishedDate || null,
        featured_image: featuredImage,
        images: existingImages,
        is_published: isPublished,
        sort_order: sortOrder
      })
    });
    
    const data = await res.json();
    
    if (data.ok) {
      if (id.toString().startsWith('new_')) {
        location.reload();
      } else {
        alert('Изменения сохранены!');
      }
    } else {
      alert('Ошибка: ' + (data.error || 'Неизвестная ошибка'));
    }
  } catch (err) {
    alert('Ошибка соединения');
  }
}

async function deleteBlogPost(id) {
  if (id.toString().startsWith('new_')) {
    document.querySelector(`.blog-post-item[data-id="${id}"]`).remove();
    return;
  }
  
  if (!confirm('Удалить эту статью?')) return;
  
  try {
    const res = await fetch('/diplo/public/api/blog.php?action=post', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: parseInt(id) })
    });
    
    const data = await res.json();
    
    if (data.ok) {
      location.reload();
    } else {
      alert('Ошибка: ' + (data.error || 'Неизвестная ошибка'));
    }
  } catch (err) {
    alert('Ошибка соединения');
  }
}

// Featured image upload preview
document.addEventListener('change', (e) => {
  if (e.target.classList.contains('post-featured-image-upload')) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const container = e.target.previousElementSibling;
        if (container.tagName === 'IMG' || container.classList.contains('div')) {
          container.outerHTML = `<img src="${ev.target.result}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 12px; border: 2px solid var(--brand); margin-bottom: 8px;">`;
        }
      };
      reader.readAsDataURL(file);
    }
  }
  
  // Multiple images upload preview
  if (e.target.classList.contains('post-images-upload')) {
    const files = Array.from(e.target.files);
    const container = e.target.previousElementSibling;
    if (!container || !container.classList.contains('post-images-container')) return;
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const imageId = e.target.dataset.id;
        const imageItem = document.createElement('div');
        imageItem.className = 'post-image-item';
        imageItem.style.cssText = 'position: relative; display: inline-block; margin: 4px;';
        imageItem.innerHTML = `
          <img src="${ev.target.result}" alt="Изображение" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid var(--brand);">
          <button type="button" class="remove-post-image" data-id="${imageId}" style="position: absolute; top: -8px; right: -8px; width: 24px; height: 24px; border-radius: 50%; background: #ff4d6d; border: none; color: white; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);" onclick="this.parentElement.remove()">×</button>
        `;
        container.appendChild(imageItem);
      };
      reader.readAsDataURL(file);
    });
  }
});

// Remove image
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('remove-post-image')) {
    const postId = e.target.dataset.id;
    const image = e.target.dataset.image;
    const item = e.target.closest('.post-image-item');
    
    if (!postId.toString().startsWith('new_') && image) {
      // Remove from existing post - need to update server
      try {
        const res = await fetch('/diplo/public/api/blog.php?action=remove_image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post_id: parseInt(postId), image: image })
        });
        const data = await res.json();
        if (!data.ok) {
          alert('Ошибка удаления изображения');
          return;
        }
      } catch (err) {
        alert('Ошибка соединения');
        return;
      }
    }
    
    item.remove();
  }
});
</script>

<?php require_once __DIR__ . '/footer.php'; ?>

