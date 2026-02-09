  <footer class="site-footer" id="contacts" aria-labelledby="contacts-title">
    <div class="container footer__inner">
      <div class="footer__contacts">
        <h2 id="contacts-title" class="footer__title">Контакты</h2>
        <a href="/" class="footer__logo">DanceWave</a>
        <div class="footer__info">
          <p class="footer__address">Москва, ул. Танцевальная, 10 · м. Центр</p>
          <p class="footer__contact-links">
            <a href="tel:+79991234567">+7 (999) 123-45-67</a> · <a href="mailto:hello@dancewave.ru">hello@dancewave.ru</a>
          </p>
        </div>
      </div>
      <nav class="footer__nav" aria-label="Навигация по сайту">
        <h3 class="footer__nav-title">Навигация</h3>
        <div class="footer__nav-links">
          <a href="/about.php">О нас</a>
          <a href="/blog.php">Блог</a>
          <a href="/directions.php">Направления</a>
          <a href="/schedule.php">Расписание</a>
          <a href="/gallery.php">Галерея</a>
          <a href="/prices.php">Цены</a>
        </div>
      </nav>
    </div>
    <div class="container footer__bottom">
      <small class="footer__copyright">© <span id="year"></span> DanceWave</small>
      <a href="#top" class="to-top" aria-label="Наверх">↑</a>
    </div>
  </footer>

  <script src="/diplo/assets/js/script.js"></script>
  <script src="/diplo/assets/js/responsive-diagnostics.js"></script>
  <?php if (isset($additionalScripts)) echo $additionalScripts; ?>
  <script>
    // Theme toggle
    (function() {
      const themeToggle = document.getElementById('themeToggle');
      const themeIcon = themeToggle?.querySelector('.theme-icon');
      const currentTheme = localStorage.getItem('theme') || 'light';
      
      function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (themeIcon) {
          themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
      }
      
      setTheme(currentTheme);
      
      themeToggle?.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
      });
    })();
    
    // Check if user is logged in
    (async () => {
      try {
        const res = await fetch('/diplo/public/auth/me.php');
        const data = await res.json();
        if (data.user) {
          const userbar = document.getElementById('userbar');
          const authLinks = document.getElementById('authLinks');
          if (userbar && authLinks) {
            authLinks.style.display = 'none';
            userbar.style.display = 'flex';
            userbar.innerHTML = ''; // Clear previous content
            
            // Add Profile Link
            /*
            const profileLink = document.createElement('a');
            profileLink.href = '/profile.php';
            profileLink.className = 'user-icon';
            profileLink.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
            userbar.appendChild(profileLink);
            */
           // Userbar is managed in header, here we just hide the login link
          }
        }
      } catch (e) {
        console.error('Auth check failed:', e);
      }
    })();
    
    // Trial form submission
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
              }, 5000);
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
  </script>
</body>
</html>

