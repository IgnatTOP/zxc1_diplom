document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  const slider = document.getElementById('slider');

  if (year) year.textContent = new Date().getFullYear();

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.slide'));
    const btnPrev = slider.querySelector('[data-dir="prev"]');
    const btnNext = slider.querySelector('[data-dir="next"]');
    let index = slides.findIndex(s => s.classList.contains('is-active')) || 0;
    const show = (i) => {
      slides.forEach((s, j) => s.classList.toggle('is-active', j === i));
    };
    const next = () => { index = (index + 1) % slides.length; show(index); };
    const prev = () => { index = (index - 1 + slides.length) % slides.length; show(index); };
    btnNext?.addEventListener('click', next);
    btnPrev?.addEventListener('click', prev);
    let timer = setInterval(next, 6000);
    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', () => timer = setInterval(next, 6000));
  }

  // Mobile Menu
  const menuToggle = document.querySelector('.menu-toggle');
  const headerNav = document.getElementById('headerNav');
  
  function closeMenu() {
    if (headerNav) headerNav.classList.remove('is-open');
    if (menuToggle) menuToggle.classList.remove('is-active');
    document.body.classList.remove('is-locked');
  }
  
  function openMenu() {
    if (headerNav) headerNav.classList.add('is-open');
    if (menuToggle) menuToggle.classList.add('is-active');
    document.body.classList.add('is-locked');
  }
  
  menuToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (headerNav?.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu when clicking a link
  headerNav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (headerNav?.classList.contains('is-open')) {
      if (!headerNav.contains(e.target) && !menuToggle?.contains(e.target)) {
        closeMenu();
      }
    }
  });
  
  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && headerNav?.classList.contains('is-open')) {
      closeMenu();
    }
  });
  
  // Close menu on window resize (if desktop size)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && headerNav?.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Auth UI
  const authEl = document.getElementById('auth');
  const userbar = document.getElementById('userbar');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginError = document.getElementById('loginError');
  const registerError = document.getElementById('registerError');

  async function api(path, options = {}) {
    // Use full path since we are in assets/js
    const fullPath = path.startsWith('/diplo') ? path : `/diplo/public${path}`; 
    const res = await fetch(fullPath, {
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  }

  // Check current session
  (async () => {
    try {
    const { data } = await api('/auth/me.php');
    if (data.user) {
      // Update header UI
      const userbar = document.getElementById('userbar');
      const authLinks = document.getElementById('authLinks');
      
      if (userbar && authLinks) {
        authLinks.style.display = 'none';
        userbar.style.display = 'flex';
        
        // We keep the user icon but change href to profile
        // Actually, the header logic in footer.php might be conflicting or redundant.
        // Let's simplify: if logged in, we just ensure the link goes to profile.
        // But wait, the HTML structure has authLinks with a link to /login.php by default.
        // We should swap that link to /profile.php if logged in.
        
        const loginLink = authLinks.querySelector('a');
        if (loginLink) {
            loginLink.href = '/profile.php';
            loginLink.setAttribute('title', 'Личный кабинет');
            authLinks.style.display = 'flex'; // Show the icon
        }
      }

      // Если пользователь уже авторизован и находится на странице входа/регистрации, перенаправляем на главную
      if (window.location.pathname === '/login.html' || window.location.pathname === '/register.html') {
        window.location.href = '/';
      }
    }
  } catch {}
})();

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (loginError) {
      loginError.hidden = true;
      loginError.textContent = '';
    }
    const form = new FormData(loginForm);
    const payload = Object.fromEntries(form.entries());
    const { data } = await api('/auth/login.php', { method: 'POST', body: payload });
    if (!data.ok) {
      if (loginError) {
        loginError.textContent = data.error || 'Ошибка входа';
        loginError.hidden = false;
      }
    } else {
      // После успешного входа перенаправляем на главную страницу
      window.location.href = '/';
    }
  });

  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (registerError) {
      registerError.hidden = true;
      registerError.textContent = '';
    }
    const form = new FormData(registerForm);
    const payload = Object.fromEntries(form.entries());
    const { data } = await api('/auth/register.php', { method: 'POST', body: payload });
    if (!data.ok) {
      if (registerError) {
        registerError.textContent = data.error || 'Ошибка регистрации';
        registerError.hidden = false;
      }
    } else {
      // После успешной регистрации перенаправляем на главную страницу
      window.location.href = '/';
    }
  });
});


