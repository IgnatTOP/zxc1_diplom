<?php
declare(strict_types=1);
require_once __DIR__ . '/diplo/includes/init.php';

$pageTitle = 'Направления — DanceWave';
$pageDescription = 'Направления танцевальной студии DanceWave: Hip-Hop, Contemporary, Latin, Kids';
$canonicalUrl = '/directions.php';

include __DIR__ . '/diplo/includes/header.php';
?>

<main>
  <section class="section directions-page" style="padding-top: 100px; background: linear-gradient(135deg, rgba(125, 184, 213, 0.03) 0%, rgba(168, 213, 226, 0.03) 100%); min-height: 100vh;" aria-labelledby="directions-title">
    <div class="container">
      <div style="text-align: center; margin-bottom: 4rem;">
        <h1 id="directions-title" class="section__title" style="font-size: clamp(2rem, 5vw, 3.5rem); margin-bottom: 1rem;">Направления</h1>
        <p class="section__text" style="font-size: 1.25rem; max-width: 700px; margin: 0 auto;">Каждое направление — это уникальный стиль и подход. Выберите то, что резонирует с вами.</p>
      </div>
      
      <div class="directions-grid" style="display: grid; gap: 32px; max-width: 1200px; margin: 0 auto;">
        <!-- Hip-Hop -->
        <article class="direction-card-large">
          <div class="direction-card-content">
            <div class="direction-number">01</div>
            <h2 style="font-size: 2.5rem; font-weight: 700; margin: 0 0 16px; color: var(--text);">Hip-Hop</h2>
            <p style="font-size: 1.125rem; color: var(--muted); line-height: 1.7; margin-bottom: 24px;">Свобода, импровизация и ритм улиц. Идеально для тех, кто любит энергичные движения и современную музыку.</p>
            <ul class="direction-features" style="list-style: none; padding: 0; margin: 0 0 32px;">
              <li style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; gap: 12px;">
                <span style="color: var(--brand); font-size: 20px; font-weight: bold;">✓</span>
                <span style="color: var(--text);">Для всех уровней подготовки</span>
              </li>
              <li style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; gap: 12px;">
                <span style="color: var(--brand); font-size: 20px; font-weight: bold;">✓</span>
                <span style="color: var(--text);">Развитие чувства ритма</span>
              </li>
              <li style="padding: 12px 0; display: flex; align-items: center; gap: 12px;">
                <span style="color: var(--brand); font-size: 20px; font-weight: bold;">✓</span>
                <span style="color: var(--text);">Современная хореография</span>
              </li>
            </ul>
            <button onclick="openTrialModal()" class="button" style="width: 100%; text-align: center; border: none; cursor: pointer;">Выбрать направление</button>
          </div>
          <div class="direction-card-visual" style="background: linear-gradient(135deg, rgba(125, 184, 213, 0.2) 0%, rgba(168, 213, 226, 0.1) 100%); border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 120px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: radial-gradient(circle, var(--brand) 0%, transparent 70%); opacity: 0.3; border-radius: 50%;"></div>
            🎧
          </div>
        </article>
        
        <!-- Contemporary -->
        <article class="direction-card-large">
          <div class="direction-card-visual" style="background: linear-gradient(135deg, rgba(168, 213, 226, 0.2) 0%, rgba(125, 184, 213, 0.1) 100%); border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 120px; position: relative; overflow: hidden; order: 2;">
            <div style="position: absolute; top: -50px; left: -50px; width: 200px; height: 200px; background: radial-gradient(circle, var(--accent) 0%, transparent 70%); opacity: 0.3; border-radius: 50%;"></div>
            💃
          </div>
          <div class="direction-card-content" style="order: 1;">
            <div class="direction-number">02</div>
            <h2 style="font-size: 2.5rem; font-weight: 700; margin: 0 0 16px; color: var(--text);">Contemporary</h2>
            <p style="font-size: 1.125rem; color: var(--muted); line-height: 1.7; margin-bottom: 24px;">Выразительность тела и пластика. Современный танец, сочетающий элементы балета и джаза.</p>
            <ul class="direction-features" style="list-style: none; padding: 0; margin: 0 0 32px;">
              <li style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; gap: 12px;">
                <span style="color: var(--brand); font-size: 20px; font-weight: bold;">✓</span>
                <span style="color: var(--text);">Работа с телом и пространством</span>
              </li>
              <li style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; gap: 12px;">
                <span style="color: var(--brand); font-size: 20px; font-weight: bold;">✓</span>
                <span style="color: var(--text);">Эмоциональная выразительность</span>
              </li>
              <li style="padding: 12px 0; display: flex; align-items: center; gap: 12px;">
                <span style="color: var(--brand); font-size: 20px; font-weight: bold;">✓</span>
                <span style="color: var(--text);">Гибкость и сила</span>
              </li>
            </ul>
            <button onclick="openTrialModal()" class="button" style="width: 100%; text-align: center; border: none; cursor: pointer;">Выбрать направление</button>
          </div>
        </article>
        
        <!-- Latin -->
        <article class="direction-card-large">
          <div class="direction-card-content">
            <div class="direction-number">03</div>
            <h2 style="font-size: 2.5rem; font-weight: 700; margin: 0 0 16px; color: var(--text);">Latin</h2>
            <p style="font-size: 1.125rem; color: var(--muted); line-height: 1.7; margin-bottom: 24px;">Горячие движения: salsa, bachata, reggaeton. Страсть и энергия латиноамериканских танцев.</p>
            <ul class="direction-features" style="list-style: none; padding: 0; margin: 0 0 32px;">
              <li style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; gap: 12px;">
                <span style="color: var(--brand); font-size: 20px; font-weight: bold;">✓</span>
                <span style="color: var(--text);">Salsa, Bachata, Reggaeton</span>
              </li>
              <li style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; gap: 12px;">
                <span style="color: var(--brand); font-size: 20px; font-weight: bold;">✓</span>
                <span style="color: var(--text);">Парные и сольные занятия</span>
              </li>
              <li style="padding: 12px 0; display: flex; align-items: center; gap: 12px;">
                <span style="color: var(--brand); font-size: 20px; font-weight: bold;">✓</span>
                <span style="color: var(--text);">Яркие выступления</span>
              </li>
            </ul>
            <button onclick="openTrialModal()" class="button" style="width: 100%; text-align: center; border: none; cursor: pointer;">Выбрать направление</button>
          </div>
          <div class="direction-card-visual" style="background: linear-gradient(135deg, rgba(125, 184, 213, 0.2) 0%, rgba(255, 107, 107, 0.1) 100%); border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 120px; position: relative; overflow: hidden;">
            <div style="position: absolute; bottom: -50px; right: -50px; width: 200px; height: 200px; background: radial-gradient(circle, #ff6b6b 0%, transparent 70%); opacity: 0.2; border-radius: 50%;"></div>
            🔥
          </div>
        </article>
        
        <!-- Kids -->
        <article class="direction-card-large">
          <div class="direction-card-visual" style="background: linear-gradient(135deg, rgba(255, 217, 61, 0.2) 0%, rgba(168, 213, 226, 0.1) 100%); border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 120px; position: relative; overflow: hidden; order: 2;">
            <div style="position: absolute; top: -50px; left: -50px; width: 200px; height: 200px; background: radial-gradient(circle, #ffd93d 0%, transparent 70%); opacity: 0.2; border-radius: 50%;"></div>
            🎈
          </div>
          <div class="direction-card-content" style="order: 1;">
            <div class="direction-number">04</div>
            <h2 style="font-size: 2.5rem; font-weight: 700; margin: 0 0 16px; color: var(--text);">Kids</h2>
            <p style="font-size: 1.125rem; color: var(--muted); line-height: 1.7; margin-bottom: 24px;">Игровые занятия для детей от 4 лет. Развитие координации, музыкальности и любви к танцам.</p>
            <ul class="direction-features" style="list-style: none; padding: 0; margin: 0 0 32px;">
              <li style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; gap: 12px;">
                <span style="color: var(--brand); font-size: 20px; font-weight: bold;">✓</span>
                <span style="color: var(--text);">Для детей от 4 лет</span>
              </li>
              <li style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; gap: 12px;">
                <span style="color: var(--brand); font-size: 20px; font-weight: bold;">✓</span>
                <span style="color: var(--text);">Игровая форма обучения</span>
              </li>
              <li style="padding: 12px 0; display: flex; align-items: center; gap: 12px;">
                <span style="color: var(--brand); font-size: 20px; font-weight: bold;">✓</span>
                <span style="color: var(--text);">Развитие творческих способностей</span>
              </li>
            </ul>
            <button onclick="openTrialModal()" class="button" style="width: 100%; text-align: center; border: none; cursor: pointer;">Выбрать направление</button>
          </div>
        </article>
      </div>
      
      <div style="text-align: center; margin-top: 5rem; padding: 48px; background: linear-gradient(135deg, rgba(125, 184, 213, 0.1) 0%, rgba(168, 213, 226, 0.1) 100%); border-radius: 24px; border: 2px dashed rgba(125, 184, 213, 0.3); position: relative; overflow: hidden;">
        <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(125, 184, 213, 0.15) 0%, transparent 70%); border-radius: 50%;"></div>
        <div style="position: relative; z-index: 1;">
          <h3 style="font-size: 28px; font-weight: 700; margin: 0 0 16px; color: var(--text);">Не знаете, что выбрать?</h3>
          <p style="color: var(--muted); margin-bottom: 32px; font-size: 1.1rem; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.7;">Приходите на пробное занятие — попробуйте несколько направлений и выберите то, что вам по душе!</p>
          <button onclick="openTrialModal()" class="button" style="padding: 16px 32px; font-size: 16px; font-weight: 600;">Записаться на пробное занятие</button>
        </div>
      </div>
    </div>
  </section>
</main>

<!-- Trial Modal -->
<div class="modal" id="trialModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(59, 59, 59, 0.6); backdrop-filter: blur(8px); z-index: 1000; align-items: center; justify-content: center;">
  <div class="auth-card" style="max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 1001; background: var(--bg); padding: 0; border-radius: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid rgba(0,0,0,0.05);">
    <div style="padding: 40px 40px 24px; background: linear-gradient(135deg, rgba(125, 184, 213, 0.05) 0%, rgba(168, 213, 226, 0.05) 100%); border-bottom: 1px solid rgba(0,0,0,0.05); border-radius: 32px 32px 0 0;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 class="section__title" style="margin: 0; text-align: left; font-size: 28px; color: var(--text);">Пробное занятие</h2>
          <p style="color: var(--muted); margin: 8px 0 0; font-size: 1rem;">Оставьте заявку, и мы перезвоним в течение 15 минут</p>
        </div>
        <button onclick="closeTrialModal()" style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1); background: var(--surface); color: var(--text); cursor: pointer; font-size: 24px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; flex-shrink: 0;">×</button>
      </div>
    </div>
    
    <div style="padding: 32px 40px 40px;">
      <form class="form" id="trialForm" style="background: transparent; border: none; padding: 0; box-shadow: none; gap: 20px;">
        <div class="form__row">
          <label style="color: var(--text); font-weight: 500; display: block; margin-bottom: 8px;">Имя
            <input type="text" name="name" placeholder="Как к вам обращаться" required style="width: 100%; padding: 14px 16px; background: var(--surface); border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; color: var(--text); font-size: 16px; margin-top: 8px; transition: all 0.2s ease;" onfocus="this.style.borderColor='var(--brand)'; this.style.boxShadow='0 0 0 3px rgba(125, 184, 213, 0.1)'" onblur="this.style.borderColor='rgba(0,0,0,0.1)'; this.style.boxShadow='none'">
          </label>
          <label style="color: var(--text); font-weight: 500; display: block; margin-bottom: 8px;">Телефон
            <input type="tel" name="phone" placeholder="+7 (999) 000-00-00" required style="width: 100%; padding: 14px 16px; background: var(--surface); border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; color: var(--text); font-size: 16px; margin-top: 8px; transition: all 0.2s ease;" onfocus="this.style.borderColor='var(--brand)'; this.style.boxShadow='0 0 0 3px rgba(125, 184, 213, 0.1)'" onblur="this.style.borderColor='rgba(0,0,0,0.1)'; this.style.boxShadow='none'">
          </label>
        </div>
        <div class="form__row">
          <label style="color: var(--text); font-weight: 500; display: block; margin-bottom: 8px;">Email
            <input type="email" name="email" placeholder="email@example.com" style="width: 100%; padding: 14px 16px; background: var(--surface); border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; color: var(--text); font-size: 16px; margin-top: 8px; transition: all 0.2s ease;" onfocus="this.style.borderColor='var(--brand)'; this.style.boxShadow='0 0 0 3px rgba(125, 184, 213, 0.1)'" onblur="this.style.borderColor='rgba(0,0,0,0.1)'; this.style.boxShadow='none'">
          </label>
          <label style="color: var(--text); font-weight: 500; display: block; margin-bottom: 8px;">Возраст
            <input type="number" name="age" placeholder="Лет" min="4" max="100" style="width: 100%; padding: 14px 16px; background: var(--surface); border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; color: var(--text); font-size: 16px; margin-top: 8px; transition: all 0.2s ease;" onfocus="this.style.borderColor='var(--brand)'; this.style.boxShadow='0 0 0 3px rgba(125, 184, 213, 0.1)'" onblur="this.style.borderColor='rgba(0,0,0,0.1)'; this.style.boxShadow='none'">
          </label>
        </div>
        <div class="form__row">
          <label style="color: var(--text); font-weight: 500; display: block; margin-bottom: 8px;">Удобное время
            <select name="time" style="width: 100%; padding: 14px 16px; background: var(--surface); border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; color: var(--text); font-size: 16px; margin-top: 8px; cursor: pointer; transition: all 0.2s ease;" onfocus="this.style.borderColor='var(--brand)'; this.style.boxShadow='0 0 0 3px rgba(125, 184, 213, 0.1)'" onblur="this.style.borderColor='rgba(0,0,0,0.1)'; this.style.boxShadow='none'">
              <option value="">Выберите время</option>
              <option>Утро (10:00 - 13:00)</option>
              <option>День (13:00 - 17:00)</option>
              <option>Вечер (17:00 - 22:00)</option>
            </select>
          </label>
          <label style="color: var(--text); font-weight: 500; display: block; margin-bottom: 8px;">Дата
            <input type="date" name="date" placeholder="Выберите дату" style="width: 100%; padding: 14px 16px; background: var(--surface); border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; color: var(--text); font-size: 16px; margin-top: 8px; transition: all 0.2s ease;" onfocus="this.style.borderColor='var(--brand)'; this.style.boxShadow='0 0 0 3px rgba(125, 184, 213, 0.1)'" onblur="this.style.borderColor='rgba(0,0,0,0.1)'; this.style.boxShadow='none'">
          </label>
        </div>
        <div class="form__row">
          <label style="color: var(--text); font-weight: 500; display: block; margin-bottom: 8px;">Направление
            <select name="style" required style="width: 100%; padding: 14px 16px; background: var(--surface); border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; color: var(--text); font-size: 16px; margin-top: 8px; cursor: pointer; transition: all 0.2s ease;" onfocus="this.style.borderColor='var(--brand)'; this.style.boxShadow='0 0 0 3px rgba(125, 184, 213, 0.1)'" onblur="this.style.borderColor='rgba(0,0,0,0.1)'; this.style.boxShadow='none'">
              <option value="">Выберите направление</option>
              <option>Hip-Hop</option>
              <option>Contemporary</option>
              <option>Latin</option>
              <option>Kids</option>
            </select>
          </label>
          <label style="color: var(--text); font-weight: 500; display: block; margin-bottom: 8px;">Уровень
            <select name="level" required style="width: 100%; padding: 14px 16px; background: var(--surface); border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; color: var(--text); font-size: 16px; margin-top: 8px; cursor: pointer; transition: all 0.2s ease;" onfocus="this.style.borderColor='var(--brand)'; this.style.boxShadow='0 0 0 3px rgba(125, 184, 213, 0.1)'" onblur="this.style.borderColor='rgba(0,0,0,0.1)'; this.style.boxShadow='none'">
              <option value="">Ваш уровень</option>
              <option>Начальный</option>
              <option>Средний</option>
              <option>Продвинутый</option>
            </select>
          </label>
        </div>
        <div id="trialFormError" style="display: none; padding: 14px 18px; background: rgba(255,77,109,.1); border: 1px solid rgba(255,77,109,.3); border-radius: 12px; color: #ff4d6d; margin: 8px 0; font-size: 15px;"></div>
        <div id="trialFormSuccess" style="display: none; padding: 14px 18px; background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.3); border-radius: 12px; color: #10b981; margin: 8px 0; text-align: center; font-size: 15px; font-weight: 500;">
          Заявка отправлена! Мы свяжемся с вами в ближайшее время.
        </div>
        <button type="submit" class="button" style="width: 100%; margin-top: 8px; padding: 16px; font-size: 16px; font-weight: 600;">Записаться</button>
        <p style="color: var(--muted); text-align: center; margin-top: 16px; font-size: 0.875rem; line-height: 1.5;">Нажимая кнопку, вы даете согласие на обработку персональных данных</p>
      </form>
    </div>
  </div>
</div>

<script>
function openTrialModal() {
  document.getElementById('trialModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeTrialModal() {
  document.getElementById('trialModal').style.display = 'none';
  document.body.style.overflow = '';
}

// Close modal on click outside
document.getElementById('trialModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'trialModal') {
    closeTrialModal();
  }
});

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.getElementById('trialModal').style.display === 'flex') {
    closeTrialModal();
  }
});

// Trial form submission
document.addEventListener('DOMContentLoaded', function() {
  const trialForm = document.getElementById('trialForm');
  if (trialForm) {
    trialForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById('trialFormError');
      const successEl = document.getElementById('trialFormSuccess');
      
      if (errorEl) errorEl.style.display = 'none';
      if (successEl) successEl.style.display = 'none';
      
      const formData = new FormData(trialForm);
      const payload = Object.fromEntries(formData.entries());
      
      try {
        const res = await fetch('/diplo/public/api/applications.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        
        if (!data.ok) {
          if (errorEl) {
            errorEl.textContent = data.error || 'Ошибка отправки заявки';
            errorEl.style.display = 'block';
          }
        } else {
          if (successEl) {
            successEl.style.display = 'block';
            trialForm.reset();
            setTimeout(() => {
              successEl.style.display = 'none';
              closeTrialModal();
            }, 3000);
          }
        }
      } catch (err) {
        if (errorEl) {
          errorEl.textContent = 'Ошибка соединения. Попробуйте позже.';
          errorEl.style.display = 'block';
        }
      }
    });
  }
});
</script>

<?php include __DIR__ . '/diplo/includes/footer.php'; ?>

