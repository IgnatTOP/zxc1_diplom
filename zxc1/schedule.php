<?php
declare(strict_types=1);
require_once __DIR__ . '/diplo/includes/init.php';

$pageTitle = 'Расписание — DanceWave';
$pageDescription = 'Расписание занятий танцевальной студии DanceWave: Hip-Hop, Contemporary, Latin, Kids. Удобное время для детей и взрослых. Выберите группу по уровню подготовки.';
$canonicalUrl = '/schedule.php';

include __DIR__ . '/diplo/includes/header.php';
?>

<main>
  <section class="section" style="padding-top: 100px;" aria-labelledby="schedule-title">
    <div class="container">
      <h1 id="schedule-title" class="section__title">Расписание занятий</h1>
      <p class="section__text">Выберите удобное время для занятий</p>
      
      <?php
      // Load schedule from database
      $pdo = get_db();
      $scheduleItems = $pdo->query('SELECT * FROM schedule WHERE is_active = 1 ORDER BY sort_order ASC, day_of_week, time')->fetchAll();
      ?>
      
      <?php if (count($scheduleItems) > 0): ?>
        <div style="margin-top: 3rem; overflow-x: auto;">
          <table class="schedule-table" style="width: 100%; border-collapse: collapse; background: var(--surface); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-sm);">
            <thead>
              <tr style="background: linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%); color: white;">
                <th style="padding: 20px; text-align: left; font-weight: 600; font-size: 16px;">День недели</th>
                <th style="padding: 20px; text-align: left; font-weight: 600; font-size: 16px;">Дата</th>
                <th style="padding: 20px; text-align: left; font-weight: 600; font-size: 16px;">Время</th>
                <th style="padding: 20px; text-align: left; font-weight: 600; font-size: 16px;">Направление</th>
                <th style="padding: 20px; text-align: left; font-weight: 600; font-size: 16px;">Уровень</th>
                <th style="padding: 20px; text-align: left; font-weight: 600; font-size: 16px;">Преподаватель</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($scheduleItems as $item): ?>
                <tr style="border-bottom: 1px solid rgba(0,0,0,0.05); transition: background 0.2s ease;">
                  <td data-label="День недели" style="padding: 18px 20px; font-weight: 600; color: var(--text);"><?= htmlspecialchars($item['day_of_week']) ?></td>
                  <td data-label="Дата" style="padding: 18px 20px; color: var(--text);">
                    <?php if ($item['date']): 
                      $dateObj = DateTime::createFromFormat('Y-m-d', $item['date']);
                      if ($dateObj) {
                        echo htmlspecialchars($dateObj->format('d.m.Y'));
                      } else {
                        echo '<span style="color: var(--muted);">—</span>';
                      }
                    else: ?>
                      <span style="color: var(--muted);">—</span>
                    <?php endif; ?>
                  </td>
                  <td data-label="Время" style="padding: 18px 20px; color: var(--text);">
                    <?php 
                    // Format time to HH:MM if needed
                    $time = $item['time'];
                    if (strlen($time) == 5 && strpos($time, ':') !== false) {
                      echo htmlspecialchars($time);
                    } else {
                      // Try to format if it's in different format
                      $timeObj = DateTime::createFromFormat('H:i:s', $time);
                      if ($timeObj) {
                        echo htmlspecialchars($timeObj->format('H:i'));
                      } else {
                        echo htmlspecialchars($time);
                      }
                    }
                    ?>
                  </td>
                  <td data-label="Направление" style="padding: 18px 20px; color: var(--text);"><?= htmlspecialchars($item['style']) ?></td>
                  <td data-label="Уровень" style="padding: 18px 20px; color: var(--muted);"><?= htmlspecialchars($item['level']) ?></td>
                  <td data-label="Преподаватель" style="padding: 18px 20px; color: var(--text);"><?= htmlspecialchars($item['instructor']) ?></td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      <?php else: ?>
        <div style="margin-top: 3rem; padding: 48px; text-align: center; background: var(--surface); border-radius: 16px; color: var(--muted);">
          <p>Расписание пока не заполнено. Пожалуйста, зайдите позже.</p>
        </div>
      <?php endif; ?>
      
      <div style="text-align: center; margin-top: 3rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <a href="/#trial" class="button">Записаться на занятие</a>
        <a href="/" class="button button--ghost">На главную</a>
      </div>
    </div>
  </section>
</main>

<?php include __DIR__ . '/diplo/includes/footer.php'; ?>

