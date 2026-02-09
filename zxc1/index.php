<?php
declare(strict_types=1);
require_once __DIR__ . '/diplo/includes/init.php';

$pageTitle = 'DanceWave — Танцевальная студия';
$pageDescription = 'DanceWave — современная танцевальная студия: занятия для детей и взрослых, профессиональные преподаватели, удобное расписание и пробное занятие.';
$canonicalUrl = '/';

include __DIR__ . '/diplo/includes/header.php';
?>

  <main>
    <!-- Hero Section -->
    <section class="hero" aria-labelledby="hero-title">
      <div class="container hero__inner">
        <div class="hero__content">
          <h1 id="hero-title">Двигайся в ритме с DanceWave</h1>
          <p class="lead">Современная танцевальная студия для детей и взрослых. Выбирай стиль, уровень и время — остальное мы возьмём на себя.</p>
          <div class="hero__cta">
            <a href="#trial" class="button">Записаться на пробное</a>
            <a href="/directions.php" class="button button--ghost">Направления</a>
          </div>
          <ul class="hero__badges">
            <li>Первые занятия — бесплатно</li>
            <li>Топ-преподаватели</li>
            <li>Рядом с метро</li>
          </ul>
        </div>
        <div class="hero__media">
          <div class="hero__photo"></div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="about section" id="about" aria-labelledby="about-title">
      <div class="container">
        <?php
        $pdo = get_db();
        $stmt = $pdo->query('SELECT * FROM collages ORDER BY id DESC LIMIT 1');
        $collage = $stmt->fetch();
        $collagePhotos = $collage && $collage['photos'] ? json_decode($collage['photos'], true) : [];
        $collageTitle = $collage && $collage['title'] ? $collage['title'] : null;
        $mainImage = ($collage && $collage['main_image']) ? $collage['main_image'] : 'photo_group.jpeg';
        $photoCount = ($collage && isset($collage['photo_count'])) ? (int)$collage['photo_count'] : 4;
        ?>
        <div class="about__inner">
          <div class="about__content">
            <h2 id="about-title" class="section__title" style="text-align: left;"><?= $collageTitle ? htmlspecialchars($collageTitle) : 'О студии' ?></h2>
            <p class="lead" style="color: var(--text); font-weight: 600;">Мы создаём пространство, где каждый чувствует музыку и уверенно движется к своей цели.</p>
            <p class="section__text" style="text-align: left; margin: 0;">Наши программы разработаны для начинающих и опытных танцоров, а группы формируются по уровню подготовки.</p>
            <div style="margin-top: 2rem;">
               <a href="/gallery.php" class="button button--ghost">Посмотреть галерею</a>
            </div>
          </div>
          <div class="about__media">
            <?php if (count($collagePhotos) > 0 && $photoCount > 0): ?>
              <div class="gallery-collage" style="min-height: 350px;" data-photo-count="<?= $photoCount ?>">
                <div>
                  <img src="/diplo/assets/images/<?= htmlspecialchars($mainImage) ?>" alt="<?= htmlspecialchars($collageTitle ?: 'DanceWave') ?>" style="box-shadow: var(--shadow);">
                </div>
                <?php 
                $photosToShow = array_slice($collagePhotos, 0, $photoCount);
                foreach ($photosToShow as $photo): 
                ?>
                  <div>
                    <img src="/diplo/assets/images/<?= htmlspecialchars($photo) ?>" alt="Фото галереи" style="box-shadow: var(--shadow-sm);">
                  </div>
                <?php endforeach; ?>
                <?php if (count($photosToShow) < $photoCount): ?>
                  <?php for ($i = count($photosToShow); $i < $photoCount; $i++): ?>
                    <div style="background: var(--bg);"></div>
                  <?php endfor; ?>
                <?php endif; ?>
              </div>
            <?php else: ?>
              <img src="/diplo/assets/images/<?= htmlspecialchars($mainImage) ?>" alt="Танцевальная группа DanceWave" class="about__image" loading="lazy">
            <?php endif; ?>
          </div>
        </div>
      </div>
    </section>

    <!-- Directions Section -->
    <section class="styles section" id="styles" style="background: linear-gradient(135deg, rgba(125, 184, 213, 0.03) 0%, rgba(168, 213, 226, 0.03) 100%); padding: 100px 0;">
      <div class="container">
        <div style="text-align: center; margin-bottom: 4rem;">
          <h2 class="section__title" style="margin-bottom: 1rem;">Направления</h2>
          <p class="section__text" style="font-size: 1.25rem; max-width: 700px; margin: 0 auto;">Выберите стиль, который подходит именно вам</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px; max-width: 1200px; margin: 0 auto;">
          <!-- Hip-Hop -->
          <a href="/directions.php" style="text-decoration: none; color: inherit;">
            <article class="direction-card-enhanced" style="background: var(--bg); border-radius: 32px; padding: 40px; box-shadow: var(--shadow-sm); border: 2px solid rgba(125, 184, 213, 0.1); transition: all 0.4s ease; position: relative; overflow: hidden; cursor: pointer; height: 100%; display: flex; flex-direction: column;" onmouseover="this.style.transform='translateY(-12px)'; this.style.boxShadow='var(--shadow)'; this.style.borderColor='var(--brand)'; const arrow = this.querySelector('.direction-arrow'); if(arrow) arrow.style.transform='translateX(6px)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm)'; this.style.borderColor='rgba(125, 184, 213, 0.1)'; const arrow = this.querySelector('.direction-arrow'); if(arrow) arrow.style.transform='translateX(0)'">
              <div style="position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(125, 184, 213, 0.15) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin-bottom: 24px; box-shadow: 0 8px 20px rgba(125, 184, 213, 0.3); position: relative; z-index: 1;">
                🎧
              </div>
              <h3 style="font-size: 2rem; font-weight: 700; margin: 0 0 16px; color: var(--text); position: relative; z-index: 1;">Hip-Hop</h3>
              <p style="color: var(--muted); line-height: 1.7; font-size: 1.1rem; margin: 0 0 24px; position: relative; z-index: 1; flex: 1;">Свобода, импровизация и ритм улиц.</p>
              <div style="display: inline-flex; align-items: center; gap: 8px; color: var(--brand); font-weight: 600; font-size: 0.95rem; position: relative; z-index: 1;">
                <span>Узнать больше</span>
                <span class="direction-arrow" style="font-size: 1.2rem; transition: transform 0.3s ease; display: inline-block;">→</span>
              </div>
            </article>
          </a>
          
          <!-- Contemporary -->
          <a href="/directions.php" style="text-decoration: none; color: inherit;">
            <article class="direction-card-enhanced" style="background: var(--bg); border-radius: 32px; padding: 40px; box-shadow: var(--shadow-sm); border: 2px solid rgba(125, 184, 213, 0.1); transition: all 0.4s ease; position: relative; overflow: hidden; cursor: pointer; height: 100%; display: flex; flex-direction: column;" onmouseover="this.style.transform='translateY(-12px)'; this.style.boxShadow='var(--shadow)'; this.style.borderColor='var(--brand)'; const arrow = this.querySelector('.direction-arrow'); if(arrow) arrow.style.transform='translateX(6px)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm)'; this.style.borderColor='rgba(125, 184, 213, 0.1)'; const arrow = this.querySelector('.direction-arrow'); if(arrow) arrow.style.transform='translateX(0)'">
              <div style="position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(168, 213, 226, 0.15) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--accent) 0%, var(--brand) 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin-bottom: 24px; box-shadow: 0 8px 20px rgba(168, 213, 226, 0.3); position: relative; z-index: 1;">
                💃
              </div>
              <h3 style="font-size: 2rem; font-weight: 700; margin: 0 0 16px; color: var(--text); position: relative; z-index: 1;">Contemporary</h3>
              <p style="color: var(--muted); line-height: 1.7; font-size: 1.1rem; margin: 0 0 24px; position: relative; z-index: 1; flex: 1;">Выразительность тела и пластика.</p>
              <div style="display: inline-flex; align-items: center; gap: 8px; color: var(--brand); font-weight: 600; font-size: 0.95rem; position: relative; z-index: 1;">
                <span>Узнать больше</span>
                <span class="direction-arrow" style="font-size: 1.2rem; transition: transform 0.3s ease; display: inline-block;">→</span>
              </div>
            </article>
          </a>
          
          <!-- Latin -->
          <a href="/directions.php" style="text-decoration: none; color: inherit;">
            <article class="direction-card-enhanced" style="background: var(--bg); border-radius: 32px; padding: 40px; box-shadow: var(--shadow-sm); border: 2px solid rgba(125, 184, 213, 0.1); transition: all 0.4s ease; position: relative; overflow: hidden; cursor: pointer; height: 100%; display: flex; flex-direction: column;" onmouseover="this.style.transform='translateY(-12px)'; this.style.boxShadow='var(--shadow)'; this.style.borderColor='var(--brand)'; const arrow = this.querySelector('.direction-arrow'); if(arrow) arrow.style.transform='translateX(6px)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm)'; this.style.borderColor='rgba(125, 184, 213, 0.1)'; const arrow = this.querySelector('.direction-arrow'); if(arrow) arrow.style.transform='translateX(0)'">
              <div style="position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(125, 184, 213, 0.15) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--brand-2) 0%, var(--brand) 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin-bottom: 24px; box-shadow: 0 8px 20px rgba(125, 184, 213, 0.3); position: relative; z-index: 1;">
                🔥
              </div>
              <h3 style="font-size: 2rem; font-weight: 700; margin: 0 0 16px; color: var(--text); position: relative; z-index: 1;">Latin</h3>
              <p style="color: var(--muted); line-height: 1.7; font-size: 1.1rem; margin: 0 0 24px; position: relative; z-index: 1; flex: 1;">Горячие движения: salsa, bachata, reggaeton.</p>
              <div style="display: inline-flex; align-items: center; gap: 8px; color: var(--brand); font-weight: 600; font-size: 0.95rem; position: relative; z-index: 1;">
                <span>Узнать больше</span>
                <span class="direction-arrow" style="font-size: 1.2rem; transition: transform 0.3s ease; display: inline-block;">→</span>
              </div>
            </article>
          </a>
          
          <!-- Kids -->
          <a href="/directions.php" style="text-decoration: none; color: inherit;">
            <article class="direction-card-enhanced" style="background: var(--bg); border-radius: 32px; padding: 40px; box-shadow: var(--shadow-sm); border: 2px solid rgba(125, 184, 213, 0.1); transition: all 0.4s ease; position: relative; overflow: hidden; cursor: pointer; height: 100%; display: flex; flex-direction: column;" onmouseover="this.style.transform='translateY(-12px)'; this.style.boxShadow='var(--shadow)'; this.style.borderColor='var(--brand)'; const arrow = this.querySelector('.direction-arrow'); if(arrow) arrow.style.transform='translateX(6px)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm)'; this.style.borderColor='rgba(125, 184, 213, 0.1)'; const arrow = this.querySelector('.direction-arrow'); if(arrow) arrow.style.transform='translateX(0)'">
              <div style="position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(168, 213, 226, 0.15) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--accent) 0%, rgba(168, 213, 226, 0.8) 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin-bottom: 24px; box-shadow: 0 8px 20px rgba(168, 213, 226, 0.3); position: relative; z-index: 1;">
                🎈
              </div>
              <h3 style="font-size: 2rem; font-weight: 700; margin: 0 0 16px; color: var(--text); position: relative; z-index: 1;">Kids</h3>
              <p style="color: var(--muted); line-height: 1.7; font-size: 1.1rem; margin: 0 0 24px; position: relative; z-index: 1; flex: 1;">Игровые занятия для детей от 4 лет.</p>
              <div style="display: inline-flex; align-items: center; gap: 8px; color: var(--brand); font-weight: 600; font-size: 0.95rem; position: relative; z-index: 1;">
                <span>Узнать больше</span>
                <span class="direction-arrow" style="font-size: 1.2rem; transition: transform 0.3s ease; display: inline-block;">→</span>
              </div>
            </article>
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 4rem;">
          <a href="/directions.php" class="button button--ghost" style="padding: 16px 32px; font-size: 1.1rem;">Посмотреть все направления</a>
        </div>
      </div>
    </section>

    <!-- Instructors Section -->
    <section class="instructors section" id="instructors">
      <div class="container">
        <h2 class="section__title">Преподаватели</h2>
        <p class="section__text">Профессионалы, которые вдохновляют</p>
        <div class="cards">
          <article class="card instructor">
            <div class="avatar"></div>
            <h3>Анна Лайт</h3>
            <p>Contemporary / 8 лет опыта</p>
          </article>
          <article class="card instructor">
            <div class="avatar"></div>
            <h3>Денис Флоу</h3>
            <p>Hip-Hop / 10 лет опыта</p>
          </article>
          <article class="card instructor">
            <div class="avatar"></div>
            <h3>Мария Соль</h3>
            <p>Latin / 6 лет опыта</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials section" id="reviews">
      <div class="container">
        <h2 class="section__title">Что говорят ученики</h2>
        <div class="slider" id="slider">
          <div class="slide is-active">
            <div class="review-card">
              <div class="review-stars">★★★★★</div>
              <blockquote>Лучшее место, чтобы полюбить танцы! Атмосфера и преподаватели — супер. Хожу уже 3 месяца и каждый раз с удовольствием.</blockquote>
              <div class="review-author">
                <div class="review-avatar" style="background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%);">О</div>
                <div class="review-info">
                  <cite>Ольга</cite>
                  <span>Направление: Hip-Hop</span>
                </div>
              </div>
            </div>
          </div>
          <div class="slide">
            <div class="review-card">
              <div class="review-stars">★★★★★</div>
              <blockquote>Занимаюсь уже год, вырос с нуля до уверенного уровня. Тренеры очень внимательные, объясняют всё доступно.</blockquote>
              <div class="review-author">
                <div class="review-avatar" style="background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);">К</div>
                <div class="review-info">
                  <cite>Кирилл</cite>
                  <span>Направление: Contemporary</span>
                </div>
              </div>
            </div>
          </div>
          <div class="slide">
            <div class="review-card">
              <div class="review-stars">★★★★★</div>
              <blockquote>Дочке 6 лет — с радостью бежит на каждое занятие. Группы небольшие, каждому уделяют время. Спасибо DanceWave!</blockquote>
              <div class="review-author">
                <div class="review-avatar" style="background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);">Н</div>
                <div class="review-info">
                  <cite>Наталья</cite>
                  <span>Мама ученицы (Kids)</span>
                </div>
              </div>
            </div>
          </div>
          <div class="slider__controls">
            <button class="slider__btn" data-dir="prev" aria-label="Предыдущий отзыв">←</button>
            <button class="slider__btn" data-dir="next" aria-label="Следующий отзыв">→</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Prices Section -->
    <section class="prices section" id="prices">
      <div class="container">
        <h2 class="section__title">Цены</h2>
        <p class="section__text">Прозрачные тарифы без скрытых платежей</p>
        <div class="cards cards--prices">
          <article class="card price">
            <h3>Разовое</h3>
            <div class="price__value">900 ₽</div>
            <p>Для тех, кто в городе проездом.</p>
          </article>
          <article class="card price">
            <h3>Абонемент 8</h3>
            <div class="price__value">5200 ₽</div>
            <p>Популярный выбор на месяц.</p>
          </article>
          <article class="card price">
            <h3>Безлимит</h3>
            <div class="price__value">6900 ₽</div>
            <p>Танцуй сколько хочешь.</p>
          </article>
        </div>
        <div style="text-align: center; margin-top: 3rem;">
          <a href="/prices.php" class="button button--ghost">Подробнее о ценах</a>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq section" id="faq" style="background: var(--surface);">
      <div class="container">
        <div style="text-align: center; margin-bottom: 3rem;">
          <div style="font-size: 48px; margin-bottom: 16px;">❓</div>
          <h2 class="section__title" style="margin-bottom: 12px;">Частые вопросы</h2>
          <p class="section__text" style="margin-bottom: 0;">Всё, что вам нужно знать о наших занятиях</p>
        </div>
        <div style="max-width: 900px; margin: 0 auto;">
          <div class="faq-accordion" style="display: grid; gap: 16px;">
            <div class="faq-item" style="background: var(--bg); border-radius: 16px; border: 2px solid rgba(125, 184, 213, 0.1); overflow: hidden; transition: all 0.3s ease;">
              <button class="faq-question" style="width: 100%; padding: 24px; text-align: left; background: none; border: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; transition: all 0.3s ease;">
                <div style="display: flex; align-items: center; gap: 16px; flex: 1;">
                  <div style="width: 40px; height: 40px; background: linear-gradient(135deg, rgba(125, 184, 213, 0.1), rgba(168, 213, 226, 0.1)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">❄️</div>
                  <h4 style="font-size: 18px; font-weight: 600; margin: 0; color: var(--text);">Можно ли заморозить абонемент?</h4>
                </div>
                <span class="faq-icon" style="font-size: 24px; color: var(--brand); transition: transform 0.3s ease; flex-shrink: 0;">+</span>
              </button>
              <div class="faq-answer" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease;">
                <div style="padding: 0 24px 24px 80px; color: var(--muted); line-height: 1.7; font-size: 16px;">
                  Да, при наличии медицинской справки или справки с работы абонемент можно заморозить на срок до 30 дней. Просто обратитесь к администратору с соответствующими документами.
                </div>
              </div>
            </div>
            
            <div class="faq-item" style="background: var(--bg); border-radius: 16px; border: 2px solid rgba(125, 184, 213, 0.1); overflow: hidden; transition: all 0.3s ease;">
              <button class="faq-question" style="width: 100%; padding: 24px; text-align: left; background: none; border: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; transition: all 0.3s ease;">
                <div style="display: flex; align-items: center; gap: 16px; flex: 1;">
                  <div style="width: 40px; height: 40px; background: linear-gradient(135deg, rgba(125, 184, 213, 0.1), rgba(168, 213, 226, 0.1)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">🔄</div>
                  <h4 style="font-size: 18px; font-weight: 600; margin: 0; color: var(--text);">Можно ли перепродать абонемент?</h4>
                </div>
                <span class="faq-icon" style="font-size: 24px; color: var(--brand); transition: transform 0.3s ease; flex-shrink: 0;">+</span>
              </button>
              <div class="faq-answer" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease;">
                <div style="padding: 0 24px 24px 80px; color: var(--muted); line-height: 1.7; font-size: 16px;">
                  Абонемент не подлежит передаче третьим лицам и перепродаже. Это сделано для вашей безопасности и соблюдения условий использования. Каждый абонемент привязан к конкретному человеку.
                </div>
              </div>
            </div>
            
            <div class="faq-item" style="background: var(--bg); border-radius: 16px; border: 2px solid rgba(125, 184, 213, 0.1); overflow: hidden; transition: all 0.3s ease;">
              <button class="faq-question" style="width: 100%; padding: 24px; text-align: left; background: none; border: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; transition: all 0.3s ease;">
                <div style="display: flex; align-items: center; gap: 16px; flex: 1;">
                  <div style="width: 40px; height: 40px; background: linear-gradient(135deg, rgba(125, 184, 213, 0.1), rgba(168, 213, 226, 0.1)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">⏰</div>
                  <h4 style="font-size: 18px; font-weight: 600; margin: 0; color: var(--text);">Что если я не успею посетить все занятия?</h4>
                </div>
                <span class="faq-icon" style="font-size: 24px; color: var(--brand); transition: transform 0.3s ease; flex-shrink: 0;">+</span>
              </button>
              <div class="faq-answer" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease;">
                <div style="padding: 0 24px 24px 80px; color: var(--muted); line-height: 1.7; font-size: 16px;">
                  Занятия не переносятся на следующий период, поэтому рекомендуем выбирать тариф, соответствующий вашей регулярности. Если вы планируете посещать реже, лучше выбрать разовое занятие или меньший абонемент.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trial Form Section -->
    <section class="trial section" id="trial">
      <div class="container">
        <h2 class="section__title">Пробное занятие</h2>
        <p class="section__text">Оставьте заявку, и мы перезвоним в течение 15 минут</p>
        <form class="form" id="trialForm">
          <div class="form__row">
            <label>Имя
              <input type="text" name="name" placeholder="Как к вам обращаться" required>
            </label>
            <label>Телефон
              <input type="tel" name="phone" placeholder="+7 (999) 000-00-00" required>
            </label>
          </div>
          <div class="form__row">
            <label>Email
              <input type="email" name="email" placeholder="email@example.com">
            </label>
            <label>Возраст
              <input type="number" name="age" placeholder="Лет" min="4" max="100">
            </label>
          </div>
          <div class="form__row">
            <label>Удобное время
              <select name="time">
                <option value="">Выберите время</option>
                <option>Утро (10:00 - 13:00)</option>
                <option>День (13:00 - 17:00)</option>
                <option>Вечер (17:00 - 22:00)</option>
              </select>
            </label>
            <label>Дата
              <input type="date" name="date" placeholder="Выберите дату">
            </label>
          </div>
          <div class="form__row">
            <label>Направление
              <select name="style" required>
                <option value="">Выберите направление</option>
                <option>Hip-Hop</option>
                <option>Contemporary</option>
                <option>Latin</option>
                <option>Kids</option>
              </select>
            </label>
            <label>Уровень
              <select name="level" required>
                <option value="">Ваш уровень</option>
                <option>Начальный</option>
                <option>Средний</option>
                <option>Продвинутый</option>
              </select>
            </label>
          </div>
          <div id="trialFormError" class="auth__error" style="display: none; margin-top: 1rem;"></div>
          <div id="trialFormSuccess" style="display: none; margin-top: 1rem; padding: 12px; background: rgba(255,255,255,0.2); border-radius: 10px; text-align: center;">
            Заявка отправлена!
          </div>
          <button type="submit" class="button">Записаться</button>
          <p class="form__note">Нажимая кнопку, вы даете согласие на обработку персональных данных</p>
        </form>
      </div>
    </section>
  </main>

<script>
// FAQ Accordion functionality
document.addEventListener('DOMContentLoaded', function() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  if (faqItems.length > 0) {
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      const icon = item.querySelector('.faq-icon');
      
      if (question && answer && icon) {
        question.addEventListener('click', function() {
          const isOpen = item.classList.contains('active');
          
          // Close all items
          faqItems.forEach(otherItem => {
            if (otherItem !== item) {
              otherItem.classList.remove('active');
              const otherAnswer = otherItem.querySelector('.faq-answer');
              const otherIcon = otherItem.querySelector('.faq-icon');
              if (otherAnswer && otherIcon) {
                otherAnswer.style.maxHeight = '0';
                otherIcon.textContent = '+';
                otherIcon.style.transform = 'rotate(0deg)';
                otherItem.style.borderColor = 'rgba(125, 184, 213, 0.1)';
                otherItem.style.background = 'var(--bg)';
              }
            }
          });
          
          // Toggle current item
          if (isOpen) {
            item.classList.remove('active');
            answer.style.maxHeight = '0';
            icon.textContent = '+';
            icon.style.transform = 'rotate(0deg)';
            item.style.borderColor = 'rgba(125, 184, 213, 0.1)';
            item.style.background = 'var(--bg)';
          } else {
            item.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + 'px';
            icon.textContent = '−';
            icon.style.transform = 'rotate(180deg)';
            item.style.borderColor = 'var(--brand)';
            item.style.background = 'rgba(125, 184, 213, 0.05)';
          }
        });
      }
    });
  }
});
</script>

</main>

<?php include __DIR__ . '/diplo/includes/footer.php'; ?>