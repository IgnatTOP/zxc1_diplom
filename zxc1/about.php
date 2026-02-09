<?php
declare(strict_types=1);
require_once __DIR__ . '/diplo/includes/init.php';

$pdo = get_db();

// Get about page content
$stmt = $pdo->prepare('SELECT key_name, value FROM content WHERE page = ?');
$stmt->execute(['about']);
$contentRows = $stmt->fetchAll();

$content = [];
foreach ($contentRows as $row) {
  $content[$row['key_name']] = $row['value'];
}

// Default content if not set
$title = $content['title'] ?? 'О нас';
$subtitle = $content['subtitle'] ?? 'Узнайте больше о нашей студии';
$mainText = $content['main_text'] ?? '<p>Добро пожаловать в DanceWave — студию танцев, где каждый может найти свой стиль и раскрыть свой потенциал.</p>';
$missionTitle = $content['mission_title'] ?? 'Наша миссия';
$missionText = $content['mission_text'] ?? '<p>Мы создаём пространство, где танец становится языком самовыражения и источником вдохновения.</p>';
$valuesTitle = $content['values_title'] ?? 'Наши ценности';
$valuesText = $content['values_text'] ?? '<p>Творчество, развитие, дружелюбие и профессиональный подход — это основа нашей работы.</p>';

// Statistics
$stat1_number = $content['stat1_number'] ?? '5+';
$stat1_label = $content['stat1_label'] ?? 'Лет опыта';
$stat2_number = $content['stat2_number'] ?? '500+';
$stat2_label = $content['stat2_label'] ?? 'Учеников';
$stat3_number = $content['stat3_number'] ?? '4';
$stat3_label = $content['stat3_label'] ?? 'Направления';
$stat4_number = $content['stat4_number'] ?? '10+';
$stat4_label = $content['stat4_label'] ?? 'Преподавателей';

// History section
$historyTitle = $content['history_title'] ?? 'Наша история';
$historyText = $content['history_text'] ?? '<p>DanceWave была основана с мечтой создать место, где танец объединяет людей всех возрастов и уровней подготовки. Начиная с небольших групп, мы выросли в одну из ведущих танцевальных студий города.</p>';

// Advantages section
$advantagesTitle = $content['advantages_title'] ?? 'Почему выбирают нас';
$advantage1_title = $content['advantage1_title'] ?? 'Профессиональные преподаватели';
$advantage1_text = $content['advantage1_text'] ?? 'Наши тренеры — это опытные профессионалы с многолетним стажем и победами в конкурсах.';
$advantage2_title = $content['advantage2_title'] ?? 'Современное оборудование';
$advantage2_text = $content['advantage2_text'] ?? 'Просторные залы с качественным покрытием, зеркалами и профессиональной звуковой системой.';
$advantage3_title = $content['advantage3_title'] ?? 'Индивидуальный подход';
$advantage3_text = $content['advantage3_text'] ?? 'Группы формируются по уровню подготовки, каждому ученику уделяется персональное внимание.';
$advantage4_title = $content['advantage4_title'] ?? 'Гибкий график';
$advantage4_text = $content['advantage4_text'] ?? 'Занятия проходят в удобное время, есть группы для утренних и вечерних занятий.';

// Team section
$teamTitle = $content['team_title'] ?? 'Наша команда';
$teamText = $content['team_text'] ?? '<p>Мы гордимся нашей командой профессионалов, которые вдохновляют и обучают наших учеников.</p>';

// Get team members from database
$teamMembers = $pdo->query('SELECT * FROM team_members WHERE is_active = 1 ORDER BY sort_order ASC, id ASC')->fetchAll();

$pageTitle = 'О нас — DanceWave';
$pageDescription = 'Узнайте больше о танцевальной студии DanceWave: наша история, миссия, команда профессиональных преподавателей и ценности. 5+ лет опыта, 500+ учеников.';
$canonicalUrl = '/about.php';
require_once __DIR__ . '/diplo/includes/header.php';
?>

<main>
  <section class="section" style="padding: 80px 0 40px;">
    <div class="container">
      <div style="max-width: 900px; margin: 0 auto;">
        <h1 class="section__title" style="text-align: left; margin-bottom: 16px;"><?= htmlspecialchars($title) ?></h1>
        <p style="font-size: 1.25rem; color: var(--muted); margin-bottom: 48px; text-align: left;"><?= htmlspecialchars($subtitle) ?></p>
        
        <div style="background: var(--surface); border-radius: 24px; padding: 48px; margin-bottom: 48px; box-shadow: var(--shadow-sm);">
          <div style="color: var(--text); line-height: 1.8; font-size: 1.1rem;">
            <?= $mainText ?>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; margin-bottom: 48px;">
          <div style="background: linear-gradient(135deg, rgba(125, 184, 213, 0.05) 0%, rgba(168, 213, 226, 0.05) 100%); border-radius: 24px; padding: 32px; border: 1px solid rgba(125, 184, 213, 0.2);">
            <h2 style="font-size: 1.5rem; font-weight: 700; margin: 0 0 16px; color: var(--text);"><?= htmlspecialchars($missionTitle) ?></h2>
            <div style="color: var(--text); line-height: 1.7;">
              <?= $missionText ?>
            </div>
          </div>
          
          <div style="background: linear-gradient(135deg, rgba(168, 213, 226, 0.05) 0%, rgba(125, 184, 213, 0.05) 100%); border-radius: 24px; padding: 32px; border: 1px solid rgba(125, 184, 213, 0.2);">
            <h2 style="font-size: 1.5rem; font-weight: 700; margin: 0 0 16px; color: var(--text);"><?= htmlspecialchars($valuesTitle) ?></h2>
            <div style="color: var(--text); line-height: 1.7;">
              <?= $valuesText ?>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Statistics Section -->
  <section class="section" style="background: var(--surface); padding: 60px 0;">
    <div class="container">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; max-width: 1000px; margin: 0 auto;">
        <div style="text-align: center;">
          <div style="font-size: 3.5rem; font-weight: 800; color: var(--brand); margin-bottom: 8px; line-height: 1;"><?= htmlspecialchars($stat1_number) ?></div>
          <div style="color: var(--text); font-size: 1rem; font-weight: 500;"><?= htmlspecialchars($stat1_label) ?></div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 3.5rem; font-weight: 800; color: var(--brand); margin-bottom: 8px; line-height: 1;"><?= htmlspecialchars($stat2_number) ?></div>
          <div style="color: var(--text); font-size: 1rem; font-weight: 500;"><?= htmlspecialchars($stat2_label) ?></div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 3.5rem; font-weight: 800; color: var(--brand); margin-bottom: 8px; line-height: 1;"><?= htmlspecialchars($stat3_number) ?></div>
          <div style="color: var(--text); font-size: 1rem; font-weight: 500;"><?= htmlspecialchars($stat3_label) ?></div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 3.5rem; font-weight: 800; color: var(--brand); margin-bottom: 8px; line-height: 1;"><?= htmlspecialchars($stat4_number) ?></div>
          <div style="color: var(--text); font-size: 1rem; font-weight: 500;"><?= htmlspecialchars($stat4_label) ?></div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- History Section -->
  <section class="section" style="padding: 60px 0;">
    <div class="container">
      <div style="max-width: 900px; margin: 0 auto;">
        <h2 class="section__title" style="text-align: left; margin-bottom: 24px;"><?= htmlspecialchars($historyTitle) ?></h2>
        <div style="background: var(--surface); border-radius: 24px; padding: 48px; box-shadow: var(--shadow-sm);">
          <div style="color: var(--text); line-height: 1.8; font-size: 1.1rem;">
            <?= $historyText ?>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Advantages Section -->
  <section class="section" style="background: linear-gradient(135deg, rgba(125, 184, 213, 0.03) 0%, rgba(168, 213, 226, 0.08) 50%, rgba(125, 184, 213, 0.03) 100%); padding: 80px 0; position: relative; overflow: hidden;">
    <!-- Decorative background elements -->
    <div style="position: absolute; top: -100px; right: -100px; width: 500px; height: 500px; background: radial-gradient(circle, rgba(125, 184, 213, 0.1) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>
    <div style="position: absolute; bottom: -150px; left: -150px; width: 600px; height: 600px; background: radial-gradient(circle, rgba(168, 213, 226, 0.08) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>
    
    <div class="container" style="position: relative; z-index: 1;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 60px;">
          <h2 class="section__title" style="margin-bottom: 16px;"><?= htmlspecialchars($advantagesTitle) ?></h2>
          <p style="color: var(--muted); font-size: 1.125rem; max-width: 600px; margin: 0 auto;">Мы создаём уникальный опыт для каждого ученика</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px;">
          <!-- Advantage 1 -->
          <div class="advantage-card" style="background: var(--bg); border-radius: 32px; padding: 40px; border: 2px solid rgba(125, 184, 213, 0.15); box-shadow: var(--shadow-sm); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>
            <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 193, 7, 0.3)); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; font-size: 2.5rem; box-shadow: 0 8px 20px rgba(255, 215, 0, 0.2); position: relative; z-index: 1;">⭐</div>
            <h3 style="font-size: 1.5rem; font-weight: 700; margin: 0 0 16px; color: var(--text); position: relative; z-index: 1;"><?= htmlspecialchars($advantage1_title) ?></h3>
            <p style="color: var(--muted); line-height: 1.8; margin: 0; font-size: 1rem; position: relative; z-index: 1;"><?= htmlspecialchars($advantage1_text) ?></p>
            <style>
              .advantage-card:first-child:hover {
                transform: translateY(-8px) scale(1.02);
                box-shadow: 0 20px 60px rgba(255, 215, 0, 0.25);
                border-color: rgba(255, 215, 0, 0.4);
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.05), var(--bg));
              }
            </style>
          </div>
          
          <!-- Advantage 2 -->
          <div class="advantage-card" style="background: var(--bg); border-radius: 32px; padding: 40px; border: 2px solid rgba(125, 184, 213, 0.15); box-shadow: var(--shadow-sm); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50px; left: -50px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(125, 184, 213, 0.2) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>
            <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, rgba(125, 184, 213, 0.25), rgba(168, 213, 226, 0.35)); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; font-size: 2.5rem; box-shadow: 0 8px 20px rgba(125, 184, 213, 0.25); position: relative; z-index: 1;">🎵</div>
            <h3 style="font-size: 1.5rem; font-weight: 700; margin: 0 0 16px; color: var(--text); position: relative; z-index: 1;"><?= htmlspecialchars($advantage2_title) ?></h3>
            <p style="color: var(--muted); line-height: 1.8; margin: 0; font-size: 1rem; position: relative; z-index: 1;"><?= htmlspecialchars($advantage2_text) ?></p>
            <style>
              .advantage-card:nth-child(2):hover {
                transform: translateY(-8px) scale(1.02);
                box-shadow: 0 20px 60px rgba(125, 184, 213, 0.3);
                border-color: rgba(125, 184, 213, 0.4);
                background: linear-gradient(135deg, rgba(125, 184, 213, 0.08), var(--bg));
              }
            </style>
          </div>
          
          <!-- Advantage 3 -->
          <div class="advantage-card" style="background: var(--bg); border-radius: 32px; padding: 40px; border: 2px solid rgba(125, 184, 213, 0.15); box-shadow: var(--shadow-sm); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;">
            <div style="position: absolute; bottom: -50px; right: -50px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(168, 213, 226, 0.2) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>
            <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, rgba(168, 213, 226, 0.3), rgba(125, 184, 213, 0.25)); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; font-size: 2.5rem; box-shadow: 0 8px 20px rgba(168, 213, 226, 0.25); position: relative; z-index: 1;">👥</div>
            <h3 style="font-size: 1.5rem; font-weight: 700; margin: 0 0 16px; color: var(--text); position: relative; z-index: 1;"><?= htmlspecialchars($advantage3_title) ?></h3>
            <p style="color: var(--muted); line-height: 1.8; margin: 0; font-size: 1rem; position: relative; z-index: 1;"><?= htmlspecialchars($advantage3_text) ?></p>
            <style>
              .advantage-card:nth-child(3):hover {
                transform: translateY(-8px) scale(1.02);
                box-shadow: 0 20px 60px rgba(168, 213, 226, 0.3);
                border-color: rgba(168, 213, 226, 0.4);
                background: linear-gradient(135deg, rgba(168, 213, 226, 0.08), var(--bg));
              }
            </style>
          </div>
          
          <!-- Advantage 4 -->
          <div class="advantage-card" style="background: var(--bg); border-radius: 32px; padding: 40px; border: 2px solid rgba(125, 184, 213, 0.15); box-shadow: var(--shadow-sm); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;">
            <div style="position: absolute; bottom: -50px; left: -50px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(125, 184, 213, 0.15) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>
            <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, rgba(125, 184, 213, 0.2), rgba(106, 168, 199, 0.3)); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; font-size: 2.5rem; box-shadow: 0 8px 20px rgba(125, 184, 213, 0.2); position: relative; z-index: 1;">⏰</div>
            <h3 style="font-size: 1.5rem; font-weight: 700; margin: 0 0 16px; color: var(--text); position: relative; z-index: 1;"><?= htmlspecialchars($advantage4_title) ?></h3>
            <p style="color: var(--muted); line-height: 1.8; margin: 0; font-size: 1rem; position: relative; z-index: 1;"><?= htmlspecialchars($advantage4_text) ?></p>
            <style>
              .advantage-card:nth-child(4):hover {
                transform: translateY(-8px) scale(1.02);
                box-shadow: 0 20px 60px rgba(125, 184, 213, 0.3);
                border-color: rgba(125, 184, 213, 0.4);
                background: linear-gradient(135deg, rgba(125, 184, 213, 0.08), var(--bg));
              }
            </style>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Team Section -->
  <section class="section" style="padding: 60px 0;">
    <div class="container">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h2 class="section__title" style="text-align: left; margin-bottom: 24px;"><?= htmlspecialchars($teamTitle) ?></h2>
        <p style="color: var(--muted); font-size: 1.1rem; margin-bottom: 48px; text-align: left;"><?= $teamText ?></p>
        
        <?php if (count($teamMembers) > 0): ?>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 32px;">
            <?php foreach ($teamMembers as $member): ?>
              <div style="background: var(--bg); border-radius: 24px; padding: 32px; text-align: center; border: 1px solid rgba(125, 184, 213, 0.2); box-shadow: var(--shadow-sm); transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='var(--shadow)'; this.style.borderColor='var(--brand)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm)'; this.style.borderColor='rgba(125, 184, 213, 0.2)'">
                <div style="width: 180px; height: 180px; border-radius: 50%; margin: 0 auto 24px; overflow: hidden; border: 4px solid rgba(125, 184, 213, 0.2); box-shadow: 0 8px 24px rgba(125, 184, 213, 0.2); position: relative;">
                  <?php if ($member['photo']): ?>
                    <img src="/diplo/assets/images/<?= htmlspecialchars($member['photo']) ?>" alt="<?= htmlspecialchars($member['name']) ?>" style="width: 100%; height: 100%; object-fit: cover;">
                  <?php else: ?>
                    <div style="width: 100%; height: 100%; background: linear-gradient(135deg, var(--brand), var(--accent)); display: flex; align-items: center; justify-content: center; font-size: 4rem; color: white;">
                      <?= mb_substr($member['name'], 0, 1) ?>
                    </div>
                  <?php endif; ?>
                </div>
                <h3 style="font-size: 1.5rem; font-weight: 700; margin: 0 0 8px; color: var(--text);"><?= htmlspecialchars($member['name']) ?></h3>
                <p style="color: var(--muted); font-size: 0.95rem; margin: 0;"><?= htmlspecialchars($member['experience']) ?></p>
              </div>
            <?php endforeach; ?>
          </div>
        <?php else: ?>
          <div style="text-align: center; padding: 48px; background: linear-gradient(135deg, rgba(125, 184, 213, 0.05) 0%, rgba(168, 213, 226, 0.05) 100%); border-radius: 24px; border: 2px dashed rgba(125, 184, 213, 0.3);">
            <p style="color: var(--text); font-size: 1.1rem; margin: 0;">Ознакомьтесь с нашими преподавателями на странице <a href="/directions.php" style="color: var(--brand); text-decoration: none; font-weight: 600;">направлений</a></p>
          </div>
        <?php endif; ?>
      </div>
    </div>
  </section>
</main>

<?php include __DIR__ . '/diplo/includes/footer.php'; ?>

