const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const loginMessageEl = document.getElementById('Message');

  try {
    const res = await fetch('http://localhost:5500/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Başarı mesajını göster
      loginMessageEl.textContent = data.message || 'Login Successfully !';
      loginMessageEl.style.color = 'green';
      loginMessageEl.style.display = 'block';

      // 2 saniye sonra yönlendir
      setTimeout(() => {
        window.location.href = '../pages/index.html';
      }, 3000);
    } else {
      // Hata mesajını göster
      loginMessageEl.textContent = data.message || 'Login failed : Invalid credentials';
      loginMessageEl.style.color = 'red';
      loginMessageEl.style.display = 'block';

    // 2 saniye sonra mesajı temizle
    setTimeout(() => {
      loginMessageEl.textContent = '';
      loginMessageEl.style.display = 'none';
    }, 3000);
    }
  } catch (error) {
    console.error(error);
    loginMessageEl.textContent = 'An error occurred';
    loginMessageEl.style.color = 'red';
    loginMessageEl.style.display = 'block';
  }
});
