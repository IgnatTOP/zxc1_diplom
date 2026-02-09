<?php
declare(strict_types=1);
require_once __DIR__ . '/diplo/includes/init.php';

// Если уже авторизован, перенаправляем
$user = current_user();
if ($user) {
  header('Location: /profile.php');
  exit;
}

$pageTitle = 'Вход — DanceWave';
$pageDescription = 'Вход в личный кабинет DanceWave';
$canonicalUrl = '/login.php';

include __DIR__ . '/diplo/includes/header.php';
?>

  <main>
    <section class="section" style="padding: 100px 0; background: linear-gradient(135deg, rgba(125, 184, 213, 0.03) 0%, rgba(168, 213, 226, 0.03) 100%); min-height: calc(100vh - 80px);">
      <div class="container">
        <div style="text-align: center; margin-bottom: 48px;">
          <h1 class="section__title" style="font-size: clamp(28px, 5vw, 40px); margin-bottom: 12px;">Вход в личный кабинет</h1>
          <p class="section__text" style="font-size: 1.125rem; max-width: 600px; margin: 0 auto;">Войдите, чтобы продолжить</p>
        </div>
        
        <div style="max-width: 480px; margin: 0 auto;">
          <div style="background: var(--bg); border-radius: 32px; padding: 48px; box-shadow: var(--shadow); border: 1px solid rgba(125, 184, 213, 0.15);">
            <form id="loginForm" style="display: grid; gap: 24px;">
              <div>
                <label style="display: block; margin-bottom: 12px; font-weight: 600; color: var(--text); font-size: 15px;">Email</label>
                <input type="email" name="email" placeholder="email@example.com" required style="width: 100%; padding: 14px 18px; border: 2px solid rgba(125, 184, 213, 0.2); border-radius: 12px; font-size: 16px; background: var(--surface); color: var(--text); transition: all 0.3s ease; font-family: inherit;" onfocus="this.style.borderColor='var(--brand)'; this.style.boxShadow='0 0 0 4px rgba(125, 184, 213, 0.1)'" onblur="this.style.borderColor='rgba(125, 184, 213, 0.2)'; this.style.boxShadow='none'">
              </div>
              
              <div>
                <label style="display: block; margin-bottom: 12px; font-weight: 600; color: var(--text); font-size: 15px;">Пароль</label>
                <input type="password" name="password" placeholder="Ваш пароль" required style="width: 100%; padding: 14px 18px; border: 2px solid rgba(125, 184, 213, 0.2); border-radius: 12px; font-size: 16px; background: var(--surface); color: var(--text); transition: all 0.3s ease; font-family: inherit;" onfocus="this.style.borderColor='var(--brand)'; this.style.boxShadow='0 0 0 4px rgba(125, 184, 213, 0.1)'" onblur="this.style.borderColor='rgba(125, 184, 213, 0.2)'; this.style.boxShadow='none'">
              </div>
              
              <div id="loginError" style="display: none; padding: 12px 16px; background: rgba(255, 77, 109, 0.1); border: 1px solid rgba(255, 77, 109, 0.3); border-radius: 12px; color: #ff4d6d; font-size: 14px; font-weight: 500;"></div>
              
              <button type="submit" class="button button--full" style="padding: 16px; font-size: 16px; margin-top: 8px;">Войти</button>
              
              <div style="text-align: center; margin-top: 8px; padding-top: 24px; border-top: 1px solid rgba(125, 184, 213, 0.15);">
                <p style="color: var(--muted); margin: 0 0 12px; font-size: 15px;">
                  Нет аккаунта?
                </p>
                <a href="/register.php" style="color: var(--brand); text-decoration: none; font-weight: 600; font-size: 15px; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 6px;" onmouseover="this.style.color='var(--brand-2)'; this.style.gap='8px'" onmouseout="this.style.color='var(--brand)'; this.style.gap='6px'">
                  Зарегистрироваться <span style="font-size: 1.2rem; transition: transform 0.3s ease;">→</span>
                </a>
              </div>
              
              <?php if (isset($_GET['admin'])): ?>
                <div style="margin-top: 8px; padding: 16px; background: rgba(125, 184, 213, 0.1); border-radius: 12px; border: 1px solid rgba(125, 184, 213, 0.3);">
                  <p style="text-align: center; margin: 0; color: var(--muted); font-size: 0.9rem; line-height: 1.6;">
                    <strong style="color: var(--text);">Админ-доступ:</strong><br>
                    admin@dancewave.ru / admin123
                  </p>
                </div>
              <?php endif; ?>
            </form>
          </div>
        </div>
      </div>
    </section>
  </main>

<?php
$additionalScripts = '<script>
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById("loginError");
      if (errorEl) {
        errorEl.style.display = "none";
        errorEl.textContent = "";
      }
      
      const formData = new FormData(e.target);
      const payload = Object.fromEntries(formData.entries());
      
      const res = await fetch("/diplo/public/auth/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!data.ok) {
        if (errorEl) {
          errorEl.textContent = data.error || "Ошибка входа";
          errorEl.style.display = "block";
        }
      } else {
        if (data.user?.role === "admin") {
          window.location.href = "/diplo/admin/";
        } else {
          window.location.href = "/profile.php";
        }
      }
    });
  </script>';
include __DIR__ . '/diplo/includes/footer.php';
?>

