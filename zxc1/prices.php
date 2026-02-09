<?php
declare(strict_types=1);
require_once __DIR__ . '/diplo/includes/init.php';

$pageTitle = 'Цены — DanceWave';
$pageDescription = 'Цены на занятия в танцевальной студии DanceWave: разовое посещение 900₽, абонемент на 8 занятий 5200₽, безлимит 6900₽. Прозрачные тарифы без скрытых платежей.';
$canonicalUrl = '/prices.php';

include __DIR__ . '/diplo/includes/header.php';
?>

<main>
  <section class="section prices-page" style="padding-top: 100px; background: linear-gradient(135deg, rgba(125, 184, 213, 0.1) 0%, rgba(168, 213, 226, 0.1) 100%); min-height: 100vh;" aria-labelledby="prices-title">
    <div class="container">
      <div style="text-align: center; margin-bottom: 4rem;">
        <h1 id="prices-title" class="section__title" style="font-size: clamp(2rem, 5vw, 3.5rem); margin-bottom: 1rem;">Тарифы и цены</h1>
        <p class="section__text" style="font-size: 1.25rem; max-width: 600px; margin: 0 auto;">Выберите оптимальный вариант для ваших занятий. Прозрачные цены без скрытых платежей.</p>
      </div>
      
      <div class="prices-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; margin: 3rem 0; max-width: 1200px; margin-left: auto; margin-right: auto;">
        <!-- Разовое -->
        <div class="price-card" style="background: var(--bg); border-radius: 24px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 2px solid rgba(0,0,0,0.05); transition: all 0.3s ease; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; right: 0; width: 120px; height: 120px; background: linear-gradient(135deg, rgba(125, 184, 213, 0.15), rgba(168, 213, 226, 0.15)); border-radius: 0 0 0 100%;"></div>
          <div style="font-size: 48px; margin-bottom: 16px;">🎯</div>
          <h3 style="font-size: 24px; font-weight: 700; margin: 0 0 12px; color: var(--text);">Разовое занятие</h3>
          <div style="display: flex; align-items: baseline; gap: 8px; margin: 24px 0;">
            <span class="price__value" style="font-size: 48px; font-weight: 800; color: var(--brand); line-height: 1;">900</span>
            <span style="font-size: 24px; color: var(--muted);">₽</span>
          </div>
          <p style="color: var(--muted); margin-bottom: 24px; line-height: 1.6;">Для тех, кто в городе проездом или хочет попробовать.</p>
          <ul class="price-features" style="list-style: none; padding: 0; margin: 0 0 32px;">
            <li style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; gap: 12px;">
              <span style="color: var(--brand); font-size: 20px;">✓</span>
              <span style="color: var(--text);">Одно занятие</span>
            </li>
            <li style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; gap: 12px;">
              <span style="color: var(--brand); font-size: 20px;">✓</span>
              <span style="color: var(--text);">Любое направление</span>
            </li>
            <li style="padding: 12px 0; display: flex; align-items: center; gap: 12px;">
              <span style="color: var(--brand); font-size: 20px;">✓</span>
              <span style="color: var(--text);">Действует 30 дней</span>
            </li>
          </ul>
          <a href="/#trial" class="button button--price" style="width: 100%; padding: 16px; font-size: 16px; font-weight: 600; border-radius: 12px; text-align: center; display: block; text-decoration: none; transition: all 0.3s ease;">Выбрать тариф</a>
        </div>
        
        <!-- Абонемент 8 занятий - POPULAR -->
        <div class="price-card price-card--popular" style="background: linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%); border-radius: 24px; padding: 40px; box-shadow: 0 12px 40px rgba(125, 184, 213, 0.4); border: 2px solid transparent; transition: all 0.3s ease; position: relative; overflow: hidden; transform: scale(1.05);">
          <div style="position: absolute; top: 24px; right: 24px; background: rgba(59, 59, 59, 0.2); backdrop-filter: blur(10px); color: #fcfafb; padding: 6px 16px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">ПОПУЛЯРНО</div>
          <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 200px; background: radial-gradient(circle at center, rgba(252, 250, 251, 0.2) 0%, transparent 70%); pointer-events: none;"></div>
          <div style="font-size: 48px; margin-bottom: 16px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">⭐</div>
          <h3 style="font-size: 24px; font-weight: 700; margin: 0 0 12px; color: #3b3b3b;">Абонемент 8 занятий</h3>
          <div style="display: flex; align-items: baseline; gap: 8px; margin: 24px 0;">
            <span class="price__value" style="font-size: 56px; font-weight: 800; color: #3b3b3b; line-height: 1;">5200</span>
            <span style="font-size: 28px; color: rgba(59, 59, 59, 0.9);">₽</span>
          </div>
          <p style="background: rgba(59, 59, 59, 0.15); backdrop-filter: blur(10px); padding: 8px 16px; border-radius: 8px; display: inline-block; margin-bottom: 24px; color: #3b3b3b; font-weight: 600;">650 ₽ за занятие</p>
          <p style="color: rgba(59, 59, 59, 0.95); margin-bottom: 24px; line-height: 1.6;">Идеально для регулярных занятий с выгодой.</p>
          <ul class="price-features" style="list-style: none; padding: 0; margin: 0 0 32px;">
            <li style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; gap: 12px;">
              <span style="color: #3b3b3b; font-size: 20px; font-weight: bold;">✓</span>
              <span style="color: #3b3b3b;">8 занятий</span>
            </li>
            <li style="padding: 12px 0; border-bottom: 1px solid rgba(59, 59, 59, 0.2); display: flex; align-items: center; gap: 12px;">
              <span style="color: #3b3b3b; font-size: 20px; font-weight: bold;">✓</span>
              <span style="color: #3b3b3b;">Любое направление</span>
            </li>
            <li style="padding: 12px 0; border-bottom: 1px solid rgba(59, 59, 59, 0.2); display: flex; align-items: center; gap: 12px;">
              <span style="color: #3b3b3b; font-size: 20px; font-weight: bold;">✓</span>
              <span style="color: #3b3b3b;">Действует 2 месяца</span>
            </li>
            <li style="padding: 12px 0; display: flex; align-items: center; gap: 12px;">
              <span style="color: #ffd700; font-size: 20px; font-weight: bold;">💰</span>
              <span style="color: #3b3b3b; font-weight: 600;">Экономия 200 ₽</span>
            </li>
          </ul>
          <a href="/#trial" class="button button--price-popular" style="width: 100%; padding: 16px; font-size: 16px; font-weight: 600; border-radius: 12px; text-align: center; display: block; text-decoration: none; background: #fcfafb; color: #3b3b3b; transition: all 0.3s ease;">Выбрать тариф</a>
        </div>
        
        <!-- Безлимит -->
        <div class="price-card" style="background: var(--bg); border-radius: 24px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 2px solid rgba(168, 213, 226, 0.2); transition: all 0.3s ease; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; width: 120px; height: 120px; background: linear-gradient(135deg, rgba(168, 213, 226, 0.2), rgba(125, 184, 213, 0.2)); border-radius: 0 0 100% 0;"></div>
          <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
          <h3 style="font-size: 24px; font-weight: 700; margin: 0 0 12px; color: var(--text);">Безлимит</h3>
          <div style="display: flex; align-items: baseline; gap: 8px; margin: 24px 0;">
            <span class="price__value" style="font-size: 48px; font-weight: 800; color: var(--accent); line-height: 1;">6900</span>
            <span style="font-size: 24px; color: var(--muted);">₽</span>
          </div>
          <p style="color: var(--muted); margin-bottom: 24px; line-height: 1.6;">Танцуй сколько хочешь в течение месяца.</p>
          <ul class="price-features" style="list-style: none; padding: 0; margin: 0 0 32px;">
            <li style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; gap: 12px;">
              <span style="color: var(--accent); font-size: 20px;">∞</span>
              <span style="color: var(--text); font-weight: 600;">Неограниченное количество</span>
            </li>
            <li style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; gap: 12px;">
              <span style="color: var(--accent); font-size: 20px;">✓</span>
              <span style="color: var(--text);">Все направления</span>
            </li>
            <li style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; gap: 12px;">
              <span style="color: var(--accent); font-size: 20px;">✓</span>
              <span style="color: var(--text);">Действует 30 дней</span>
            </li>
            <li style="padding: 12px 0; display: flex; align-items: center; gap: 12px;">
              <span style="color: var(--accent); font-size: 20px;">💎</span>
              <span style="color: var(--text); font-weight: 600;">Максимальная выгода</span>
            </li>
          </ul>
          <a href="/#trial" class="button button--price" style="width: 100%; padding: 16px; font-size: 16px; font-weight: 600; border-radius: 12px; text-align: center; display: block; text-decoration: none; transition: all 0.3s ease;">Выбрать тариф</a>
        </div>
      </div>
      
      <!-- Trial Section -->
      <div style="text-align: center; margin-top: 5rem; padding: 48px; background: linear-gradient(135deg, rgba(125, 184, 213, 0.1) 0%, rgba(168, 213, 226, 0.1) 100%); border-radius: 24px; border: 2px dashed rgba(125, 184, 213, 0.3); position: relative; overflow: hidden;">
          <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(125, 184, 213, 0.15) 0%, transparent 70%); border-radius: 50%;"></div>
        <div style="font-size: 64px; margin-bottom: 24px;">🎁</div>
        <h3 style="font-size: 32px; font-weight: 700; margin: 0 0 16px; color: var(--text);">Пробное занятие — бесплатно!</h3>
        <p style="color: var(--muted); margin-bottom: 32px; font-size: 1.1rem; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.7;">Приходите на первое занятие бесплатно, чтобы понять, подходит ли вам направление. Никаких обязательств!</p>
        <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
          <a href="/#trial" class="button" style="padding: 16px 32px; font-size: 16px; font-weight: 600;">Записаться на пробное</a>
          <a href="/" class="button button--ghost" style="padding: 16px 32px; font-size: 16px;">На главную</a>
        </div>
      </div>
    </div>
  </section>
</main>

<?php include __DIR__ . '/diplo/includes/footer.php'; ?>

