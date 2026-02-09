<?php
declare(strict_types=1);
require_once __DIR__ . '/diplo/includes/init.php';

$postId = (int)($_GET['id'] ?? 0);

if ($postId === 0) {
  header('Location: /blog.php');
  exit;
}

$pdo = get_db();
$stmt = $pdo->prepare('SELECT * FROM blog_posts WHERE id = ? AND is_published = 1');
$stmt->execute([$postId]);
$post = $stmt->fetch();

if (!$post) {
  header('Location: /blog.php');
  exit;
}

$images = [];
if (!empty($post['images'])) {
  $images = json_decode($post['images'], true);
  if (!is_array($images)) {
    $images = [];
  }
}

$pageTitle = htmlspecialchars($post['title']) . ' — Блог — DanceWave';
$pageDescription = !empty($post['excerpt']) ? htmlspecialchars($post['excerpt']) : htmlspecialchars($post['title']);
require_once __DIR__ . '/diplo/includes/header.php';
?>

<main>
  <article class="section" style="padding: 80px 0 40px;">
    <div class="container">
      <div style="max-width: 900px; margin: 0 auto;">
        <a href="/blog.php" style="display: inline-flex; align-items: center; gap: 8px; color: var(--brand); text-decoration: none; font-weight: 500; margin-bottom: 32px; transition: color 0.3s ease;" onmouseover="this.style.color='var(--brand-2)'" onmouseout="this.style.color='var(--brand)'">
          ← Назад к блогу
        </a>
        
        <?php if ($post['published_date']): ?>
          <div style="color: var(--brand); font-size: 0.875rem; font-weight: 600; margin-bottom: 16px;">
            <?= date('d.m.Y', strtotime($post['published_date'])) ?>
          </div>
        <?php endif; ?>
        
        <h1 style="font-size: clamp(2rem, 5vw, 3rem); font-weight: 700; margin: 0 0 24px; color: var(--text); line-height: 1.2;">
          <?= htmlspecialchars($post['title']) ?>
        </h1>
        
        <?php if ($post['author']): ?>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid rgba(0,0,0,0.1);">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--brand), var(--accent)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.2rem;">
              <?= mb_substr($post['author'], 0, 1) ?>
            </div>
            <div>
              <div style="font-weight: 600; color: var(--text);"><?= htmlspecialchars($post['author']) ?></div>
              <div style="font-size: 0.875rem; color: var(--muted);">Автор статьи</div>
            </div>
          </div>
        <?php endif; ?>
        
        <?php if ($post['featured_image']): ?>
          <div style="width: 100%; margin-bottom: 48px; border-radius: 24px; overflow: hidden; box-shadow: var(--shadow);">
            <img src="/diplo/assets/images/<?= htmlspecialchars($post['featured_image']) ?>" alt="<?= htmlspecialchars($post['title']) ?>" style="width: 100%; height: auto; display: block;">
          </div>
        <?php endif; ?>
        
        <?php if (!empty($post['excerpt'])): ?>
          <div style="background: var(--surface); border-left: 4px solid var(--brand); padding: 24px; border-radius: 12px; margin-bottom: 32px; font-size: 1.25rem; font-weight: 500; color: var(--text); line-height: 1.6; font-style: italic;">
            <?= htmlspecialchars($post['excerpt']) ?>
          </div>
        <?php endif; ?>
        
        <div style="color: var(--text); line-height: 1.8; font-size: 1.1rem; margin-bottom: 48px;">
          <?= nl2br(htmlspecialchars($post['content'])) ?>
        </div>
        
        <?php if (count($images) > 0): ?>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 48px;">
            <?php foreach ($images as $image): ?>
              <div style="border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-sm); transition: transform 0.3s ease;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                <img src="/diplo/assets/images/<?= htmlspecialchars($image) ?>" alt="Изображение к статье" style="width: 100%; height: auto; display: block;">
              </div>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>
        
        <div style="padding-top: 32px; border-top: 1px solid rgba(0,0,0,0.1); margin-top: 48px;">
          <a href="/blog.php" class="button" style="display: inline-flex; align-items: center; gap: 8px;">
            ← Вернуться к блогу
          </a>
        </div>
      </div>
    </div>
  </article>
</main>

<?php include __DIR__ . '/diplo/includes/footer.php'; ?>


