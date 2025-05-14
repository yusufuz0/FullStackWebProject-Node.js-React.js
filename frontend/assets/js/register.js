const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const userType = document.getElementById('userType').value;
  const messageEl = document.getElementById('Message'); // Doğru referans

  try {
    const res = await fetch('http://localhost:5500/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, userType })
    });

    const data = await res.json();

    if (res.ok) {
      // Başarı mesajını göster
      messageEl.textContent = data.message || 'Registered successfully! Now you can login.';
      messageEl.style.color = 'green';
      messageEl.style.display = 'block';

      // 2 saniye sonra login sayfasına yönlendir
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      // Hata mesajını göster
      messageEl.textContent = data.message || 'Registration failed';
      messageEl.style.color = 'red';
      messageEl.style.display = 'block';

      // 2 saniye sonra mesajı temizle
      setTimeout(() => {
        messageEl.textContent = '';
        messageEl.style.display = 'none';
      }, 2000);
    }
  } catch (error) {
    console.error(error);
    messageEl.textContent = 'An error occurred';
    messageEl.style.color = 'red';
    messageEl.style.display = 'block';
  }
});
