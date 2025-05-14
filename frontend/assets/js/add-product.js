document.getElementById('addProductForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const formData = new FormData(this);  // Direkt formdan verileri al
  const messageEl = document.getElementById('Message');

  const token = localStorage.getItem('token');
  if (!token) {
        // Hata mesajını göster
        messageEl.textContent = 'You are not logged in!';
        messageEl.style.color = 'red';
        messageEl.style.display = 'block';
  
        // 2 saniye sonra mesajı temizle
        setTimeout(() => {
          messageEl.textContent = '';
          messageEl.style.display = 'none';
        }, 2000);
    return;
  }

console.log("STATE POİNT 1")

  try {
    const res = await fetch('http://localhost:5500/api/product/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // DİKKAT: 'Content-Type' ELLE YAZMIYORUZ!
      },
      body: formData,
    });

    console.log("STATE POİNT 2")
    const data = await res.json();
    console.log("STATE POİNT 3")

    if (res.ok) {      
    messageEl.textContent = data.message || 'Product added successfully!';
    messageEl.style.color = 'green';
    messageEl.style.display = 'block';


    setTimeout(() => {
      window.location.href = '../pages/dashboard.html';
    }, 2000);

    } else {
            // Hata mesajını göster
            messageEl.textContent = data.message || 'Failed to add product';
            messageEl.style.color = 'red';
            messageEl.style.display = 'block';
      
            // 2 saniye sonra mesajı temizle
            setTimeout(() => {
              messageEl.textContent = '';
              messageEl.style.display = 'none';
            }, 2000);
    }
  } 
  catch (err) {
    console.error(err);
    messageEl.textContent = 'An error occurred, please try again.';
    messageEl.style.color = 'red';
    messageEl.style.display = 'block';
  }
});
