async function loadProducts() {
    const token = localStorage.getItem('token');
  
    try {
      const response = await fetch('http://localhost:5500/api/product/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      if (data.products && data.products.length > 0) {
        const productList = document.getElementById('productList');
        productList.innerHTML = '';
  
        data.products.forEach(product => {
          const productItem = document.createElement('div');
          productItem.classList.add('product-item');
          productItem.innerHTML = `
            <h3><a href="product-detail.html?id=${product.id}" class="product-title-link">${product.title}</a></h3>
            <p>Category: ${product.category}</p>
            <p>Price: $${product.price}</p>
            <a href="edit-product.html?id=${product.id}">Edit</a> | 
            <button onclick="deleteProduct('${product.id}')">Delete</button>
          `;
          productList.appendChild(productItem);
        });
      } else {
        document.getElementById('productList').innerHTML = '<p>No products available</p>';
      }
    } catch(err) {
      console.error('Error loading products:', err);
        // Hata mesajını göster
        messageEl.textContent = 'Failed to load products, please try again.';
        messageEl.style.color = 'red';
        messageEl.style.display = 'block';
  
        // 2 saniye sonra mesajı temizle
        setTimeout(() => {
          messageEl.textContent = '';
          messageEl.style.display = 'none';
        }, 2000);
    }
  }
  
  // Sayfa yüklendiğinde ürünleri yükle
  window.onload = loadProducts;
  const messageEl = document.getElementById('Message');


  

  // Ürün silme fonksiyonu
  async function deleteProduct(productId) {
    const token = localStorage.getItem('token');

  
    try {
      const res = await fetch(`http://localhost:5500/api/product/delete/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
      if (data.message === 'Product deleted successfully') {

        messageEl.textContent = data.message || 'Product deleted';
        messageEl.style.color = 'green';
        messageEl.style.display = 'block';
    
        // 2 saniye sonra mesajı temizle
        setTimeout(() => {
          messageEl.textContent = '';
          messageEl.style.display = 'none';
        }, 3000);

        loadProducts(); // Tekrar yükle
      }
    } catch(err) {
      console.error('Error deleting product:', err);
        messageEl.textContent = 'Failed to delete product';
        messageEl.style.color = 'red';
        messageEl.style.display = 'block';
  
        // 2 saniye sonra mesajı temizle
        setTimeout(() => {
          messageEl.textContent = '';
          messageEl.style.display = 'none';
        }, 2000);
    }
  }
  