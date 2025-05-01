document.addEventListener('DOMContentLoaded', () => {
  // URL parametresinde kategori varsa, kategoriye göre ürünleri çek
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  fetchProducts(category);
});

function fetchProducts(category) {
  // Kategori parametresi varsa, onu API'ye gönder
  const url = category ? `http://localhost:5500/api/product?category=${category}` : 'http://localhost:5500/api/product';
  
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const productList = document.getElementById('productList');
      if (!data.products || data.products.length === 0) {
        productList.innerHTML = '<p>No products found.</p>';
        return;
      }

      data.products.forEach(product => {
        const item = document.createElement('div');
        item.classList.add('product-item');

        // Her ürün için benzersiz bir rating ID’si ver
        const ratingId = `rating-${product.id}`;

        item.innerHTML = `
          <h3><a href="product-detail.html?id=${product.id}">${product.title}</a></h3> 
          <p id="${ratingId}">Loading rating...</p>
          <p>${product.description.substring(0, 100)}...</p>
          <p>${product.category}</p>
          <p><strong>$${product.price}</strong></p>
        `;
        productList.appendChild(item);

        // Her ürün için ayrı rating fetch çağrısı
        fetchAverageRating(product.id, ratingId);
      });
    })
    .catch(err => {
      console.error('Failed to fetch products:', err);
    });
}

function fetchAverageRating(productId, elementId) {
  fetch(`http://localhost:5500/api/product/product/${productId}/rating`)
    .then(res => res.json())
    .then(data => {
      const avg = data.average.toFixed(1);
      const count = data.count;
      const ratingElement = document.getElementById(elementId);
      if (ratingElement) {
        ratingElement.innerHTML =
          `<span style="color:rgb(3, 3, 3);">${avg} ⭐</span> (${count} vote${count !== 1 ? 's' : ''})`;
      }
    })
    .catch(err => {
      console.error('Rating fetch error:', err);
      const ratingElement = document.getElementById(elementId);
      if (ratingElement) {
        ratingElement.textContent = 'Rating unavailable.';
      }
    });
}
