let product; // Global product değişkeni

// Ürün bilgilerini alacak fonksiyon
function fetchProduct(productId) {
  fetch(`http://localhost:5500/api/product/product/${productId}`)
    .then(res => res.json())
    .then(data => {
      product = data; // 'product' burada atanıyor
      document.getElementById('productTitle').textContent = product.title;
      document.getElementById('productDescription').textContent = product.description;
      document.getElementById('productCategory').textContent = product.category;
      document.getElementById('productPrice').textContent = product.price;



      // Eğer ürünün PDF dosyası varsa
      if (product.fileUrl) {
        const ext = product.fileUrl.split('.').pop();
        if (ext === 'pdf') {
          renderFirstPage("/backend" + product.fileUrl);
        } else {
          document.getElementById('filePreview').innerHTML = `<p>A folder in .zip format</p>`;
        }
      } else {
        document.getElementById('filePreview').innerHTML = `<p>No file available for this product.</p>`;
      }
    })
    .catch(err => {
      console.error('Error fetching product:', err);
      alert('There was an error loading the product.');
    });
}

// Sepete ürün ekleme işlemi
document.getElementById('addToCartBtn').addEventListener('click', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You must be logged in to add products to the cart.');
    return;
  }

  const productData = {
    productId: product.id,
    title: product.title,
    price: product.price,
    quantity: 1, // İlk eklemede 1 adet
    sellerId: product.sellerId // Ürünün satıcısının ID'si
  };

  fetch('http://localhost:5500/api/cart/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  })
  .then(res => {
    if (!res.ok) {
      throw new Error('Failed to add to cart.');
    }
    return res.json();
  })
  .then(data => {
    alert('Product added to your cart!');
    // Sepet sayacı güncelle (isteğe bağlı)
    updateCartItemCount(); 
  })
  .catch(err => {
    console.error('Cart error:', err);
    alert('There was an error adding the product to the cart.');
  });
});

// Sayfa yüklendiğinde ürün bilgilerini al
window.addEventListener('load', () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  // Kullanıcı türünü localStorage'dan al
  const userStr = localStorage.getItem('user'); // 'seller' veya 'buyer' gibi bir değer olduğunu varsayalım
  
  let user = null;
  if (userStr) {
    user = JSON.parse(userStr);  // Eğer userStr mevcutsa, JSON.parse ile kullanıcı nesnesine dönüştür
  }

  const token = localStorage.getItem('token'); // Kullanıcının token'ı

  // "Add to Cart" butonunu seç
  const addToCartBtn = document.getElementById('addToCartBtn');
  
  // Eğer kullanıcı satıcıysa ya da token yoksa, butonu gizle
  if (user && user.userType === 'seller' || token === null) {
    if (addToCartBtn) {
      addToCartBtn.style.display = 'none'; // Butonu gizle
    }
  }

  if (!productId) {
    alert("Product ID not found.");
    window.location.href = "dashboard.html";
    return;
  }

  // Ürün bilgilerini ve kullanıcı yorumlarını al
  fetchAverageRating(productId);
  renderRatingStars(productId);
  fetchUserRating(productId); // Kullanıcının önceki puanı

  // Ürün bilgilerini al
  fetchProduct(productId);
});

// PDF'nin ilk sayfasını render etme fonksiyonu
function renderFirstPage(pdfUrl) {
  const canvas = document.getElementById('pdfCanvas');
  const context = canvas.getContext('2d');

  // PDF.js ile PDF'yi yükle
  pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
    pdf.getPage(1).then(page => {
      // Sayfanın boyutlarını alın
      const viewport = page.getViewport({ scale: 1 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // PDF sayfasını canvas üzerinde render et
      page.render({
        canvasContext: context,
        viewport: viewport
      });
    });
  }).catch(error => {
    console.error('Error rendering PDF:', error);
    alert('Failed to render PDF.');
  });
}


function fetchAverageRating(productId) {
  fetch(`http://localhost:5500/api/product/product/${productId}/rating`)
    .then(res => res.json())
    .then(data => {
      const avg = data.average.toFixed(1);
      const count = data.count;
      document.getElementById('averageRating').innerHTML = 
      `<strong></strong> <span style="color:rgb(3, 3, 3);">${avg} ⭐ </span> (${count}  vote${count !== 1 ? 's' : ''})`;
    
    })
    .catch(err => {
      console.error('Rating fetch error:', err);
      document.getElementById('averageRating').textContent = 'Rating unavailable.';
    });
}


function renderRatingStars(productId) {
  const container = document.getElementById('ratingStars');
  container.innerHTML = ''; // Önceki yıldızlar varsa temizle

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.classList.add('rating-star');
    star.textContent = '★';
    star.dataset.score = i;

    // Hover efekti
    star.addEventListener('mouseover', () => highlightStars(i));
    star.addEventListener('mouseout', () => highlightStars(0));

    // Click ile puan gönder
    star.addEventListener('click', () => {
      submitRating(productId, i);
      setSelectedStars(i);
    });

    container.appendChild(star);
  }
}

// Hover ve seçili yıldızları ayarlayan fonksiyon
function highlightStars(score) {
  const stars = document.querySelectorAll('.rating-star');
  stars.forEach(star => {
    const starScore = parseInt(star.dataset.score);
    star.classList.toggle('hovered', starScore <= score);
  });
}

// Seçilen puanı kalıcı olarak işaretle
function setSelectedStars(score) {
  const stars = document.querySelectorAll('.rating-star');
  stars.forEach(star => {
    const starScore = parseInt(star.dataset.score);
    star.classList.toggle('selected', starScore <= score);
  });
}


function submitRating(productId, score) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You must be logged in to rate this product.');
    return;
  }

  fetch('http://localhost:5500/api/product/rate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, score }),
  })
  .then(res => {
    if (!res.ok) throw new Error('Failed to submit rating');
    return res.json();
  })
  .then(data => {
    alert('Thank you for your rating!');
    fetchAverageRating(productId);
  })
  .catch(err => {
    console.error('Rating error:', err);
    alert('There was an error submitting your rating.');
  });
}

// kullanıcının verdiği puana göre yıldızları renklendirme
async function fetchUserRating(productId) {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch(`http://localhost:5500/api/product/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId })
    });

    if (!res.ok) return;

    const data = await res.json();
    const userRating = data.rating;

    if (userRating) {
      setSelectedStars(userRating); // Yıldızları renklendir
    }
  } catch (err) {
    console.error("Error fetching user rating:", err);
  }
}