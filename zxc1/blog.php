<?php
declare(strict_types=1);
require_once __DIR__ . '/diplo/includes/init.php';

$pdo = get_db();

// Get blog page content
$stmt = $pdo->prepare('SELECT key_name, value FROM content WHERE page = ?');
$stmt->execute(['blog']);
$contentRows = $stmt->fetchAll();

$content = [];
foreach ($contentRows as $row) {
  $content[$row['key_name']] = $row['value'];
}

// Default content
$pageTitleText = $content['page_title'] ?? 'Блог';
$pageSubtitle = $content['page_subtitle'] ?? 'Новости и статьи о танцах, занятиях и жизни студии';
$introText = $content['intro_text'] ?? '<p>Добро пожаловать в наш блог! Здесь мы делимся новостями, полезными статьями и интересными историями о танцах и нашей студии.</p>';

// Get blog posts
$blogPosts = $pdo->query('SELECT * FROM blog_posts WHERE is_published = 1 ORDER BY sort_order ASC, published_date DESC, created_at DESC')->fetchAll();

$pageTitle = 'Блог — DanceWave';
$pageDescription = 'Блог танцевальной студии DanceWave: новости, статьи о танцах, советы от преподавателей, истории учеников и анонсы мероприятий.';
$canonicalUrl = '/blog.php';
require_once __DIR__ . '/diplo/includes/header.php';
?>

<main>
  <section class="section" style="padding: 80px 0 40px;">
    <div class="container">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h1 class="section__title" style="text-align: left; margin-bottom: 16px;"><?= htmlspecialchars($pageTitleText) ?></h1>
        <p style="font-size: 1.25rem; color: var(--muted); margin-bottom: 32px; text-align: left;"><?= htmlspecialchars($pageSubtitle) ?></p>
        
        <div style="background: var(--surface); border-radius: 24px; padding: 48px; margin-bottom: 48px; box-shadow: var(--shadow-sm);">
          <div style="color: var(--text); line-height: 1.8; font-size: 1.1rem;">
            <?= $introText ?>
          </div>
        </div>
        
        <?php if (count($blogPosts) > 0): ?>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 32px;">
            <?php foreach ($blogPosts as $post): ?>
              <a href="/blog-post.php?id=<?= $post['id'] ?>" style="text-decoration: none; color: inherit;">
                <article style="background: var(--bg); border-radius: 24px; overflow: hidden; border: 1px solid rgba(125, 184, 213, 0.2); box-shadow: var(--shadow-sm); transition: all 0.3s ease; display: flex; flex-direction: column; cursor: pointer;" onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='var(--shadow)'; this.style.borderColor='var(--brand)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm)'; this.style.borderColor='rgba(125, 184, 213, 0.2)'">
                  <?php if ($post['featured_image']): ?>
                    <div style="width: 100%; height: 220px; overflow: hidden; background: var(--surface);">
                      <img src="/diplo/assets/images/<?= htmlspecialchars($post['featured_image']) ?>" alt="<?= htmlspecialchars($post['title']) ?>" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    </div>
                  <?php else: ?>
                    <div style="width: 100%; height: 220px; background: linear-gradient(135deg, rgba(125, 184, 213, 0.2), rgba(168, 213, 226, 0.2)); display: flex; align-items: center; justify-content: center; font-size: 4rem;">
                      📝
                    </div>
                  <?php endif; ?>
                  
                  <div style="padding: 32px; flex: 1; display: flex; flex-direction: column;">
                    <?php if ($post['published_date']): ?>
                      <div style="color: var(--brand); font-size: 0.875rem; font-weight: 600; margin-bottom: 12px;">
                        <?= date('d.m.Y', strtotime($post['published_date'])) ?>
                      </div>
                    <?php endif; ?>
                    
                    <h2 style="font-size: 1.5rem; font-weight: 700; margin: 0 0 12px; color: var(--text); line-height: 1.3;">
                      <?= htmlspecialchars($post['title']) ?>
                    </h2>
                    
                    <?php if ($post['excerpt']): ?>
                      <p style="color: var(--muted); line-height: 1.6; margin: 0 0 16px; flex: 1;">
                        <?= htmlspecialchars($post['excerpt']) ?>
                      </p>
                    <?php endif; ?>
                    
                    <?php if ($post['author']): ?>
                      <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.05); color: var(--muted); font-size: 0.875rem;">
                        Автор: <?= htmlspecialchars($post['author']) ?>
                      </div>
                    <?php endif; ?>
                  </div>
                </article>
              </a>
            <?php endforeach; ?>
          </div>
        <?php else: ?>
          <div style="text-align: center; padding: 80px 32px; background: var(--surface); border-radius: 24px; border: 2px dashed rgba(125, 184, 213, 0.3);">
            <div style="font-size: 4rem; margin-bottom: 24px;">📝</div>
            <h3 style="font-size: 1.5rem; font-weight: 700; margin: 0 0 16px; color: var(--text);">Пока нет статей</h3>
            <p style="color: var(--muted); font-size: 1rem; margin: 0;">Статьи появятся здесь скоро</p>
          </div>
        <?php endif; ?>
      </div>
    </div>
  </section>
</main>

<?php include __DIR__ . '/diplo/includes/footer.php'; ?>

