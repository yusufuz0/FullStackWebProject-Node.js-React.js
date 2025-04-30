document.addEventListener('DOMContentLoaded', () => {
  displayCartItems();
  updateTotalAmount();

  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', handleCheckout);
  }
});

const token = localStorage.getItem('token');

// Sepetteki ürünleri listeleme
function displayCartItems() {
  const cartItemsList = document.getElementById('cartItemsList');
  if (!token) {
    cartItemsList.innerHTML = '<p>Please login to view your cart.</p>';
    return;
  }

  fetch('http://localhost:5500/api/cart', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(res => res.json())
  .then(data => {
    const items = data.items || [];
    
    if (items.length === 0) {
      cartItemsList.innerHTML = '<p>Your cart is empty.</p>';
      document.getElementById('totalAmount').textContent = '0.00';
      return;
    }

    cartItemsList.innerHTML = '';
    items.forEach(item => {
      const cartItem = document.createElement('div');
      cartItem.classList.add('cart-item');
      cartItem.innerHTML = `
        <p>${item.title}</p>
        <p>Price: $${item.price}</p>
       <!--  <p>Quantity: 
        <input type="number" value="${item.quantity}" min="1" onchange="updateItemQuantity('${item.productId}', this.value)" /></p> -->
        <button onclick="removeFromCart('${item.productId}')">Remove</button>
      `;
      cartItemsList.appendChild(cartItem);
    });

    updateTotalAmount(items);
  })
  .catch(err => {
    console.error('Error loading cart:', err);
    cartItemsList.innerHTML = '<p>Failed to load cart items. Please try again later.</p>';
  });
}

// Toplam fiyatı hesapla
function updateTotalAmount(items = []) {
  if (!items.length) return;

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.getElementById('totalAmount').textContent = total.toFixed(2);
}

// Sepetten ürün sil
function removeFromCart(productId) {
  if (!token) return;
console.log(productId)
  fetch('http://localhost:5500/api/cart/delete', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'  // body'nin JSON olduğunu belirtin
    },
    body: JSON.stringify({ productId })  // productId'yi body'ye ekleyin
  })
  .then(res => res.json())
  .then(data => {
    console.log('Item removed:', data);
    displayCartItems();  // Sepet öğelerini yeniden listele
  })
  .catch(err => console.error('Failed to remove item:', err));
}

// Ürün miktarını güncelleme fonksiyonu
function updateItemQuantity(productId, newQuantity) {
  if (!token) return;

  // API'ye PUT isteği göndermeden önce doğru URL ve veri formatını kullanın
  fetch(`http://localhost:5500/api/cart/update/quantity`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      productId: productId,  // productId'yi body'ye ekliyoruz
      quantity: parseInt(newQuantity)  // Miktarı güncelliyoruz
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.message === 'Item quantity updated') {
      displayCartItems();  // Veriler güncellendikten sonra sepeti tekrar görüntüle
      updateCartItemCount();  // Sepet sayacını güncelle
    }
  })
  .catch(err => console.error('Failed to update quantity:', err));
}


// STRIPE ile ödeme başlatma fonksiyonu
function handleCheckout() {
  fetch('http://localhost:5500/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {
      const stripe = Stripe('pk_test_51QyYGzD8YljAw1frUBVTX5tqu8ZgwOF6QS5TQkRzCBbCkNvCJ0pxE8ynEgYRHrfySNEgcI6SbPVjfnkiXNszPdx8005IONkxhJ');
      return stripe.redirectToCheckout({ sessionId: data.id });
    })
    .catch(err => {
      console.error('Stripe checkout error:', err);
      alert('Failed to initiate checkout.');
    });
}
