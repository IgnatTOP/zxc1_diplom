  </div>

<script>
  // Admin logout button handler
  document.getElementById('adminLogoutBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!confirm('Вы действительно хотите выйти?')) return;
    
    try {
      const res = await fetch('/diplo/public/auth/logout.php', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.ok) {
        window.location.href = '/login.php';
      } else {
        alert('Ошибка выхода: ' + (data.error || 'Неизвестная ошибка'));
      }
    } catch (e) {
      console.error(e);
      alert('Ошибка сети');
    }
  });
</script>

</body>
</html>

