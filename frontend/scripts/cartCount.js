function updateCartItemCount() {
  const token = localStorage.getItem('token');
  if (!token) return;

  fetch('http://localhost:5500/api/cart', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(res => res.json())
  .then(data => {
    const totalCount = data.items.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartItemCount').textContent = totalCount;
  });
}

// Sayfa yüklendiğinde çağır
document.addEventListener('DOMContentLoaded', () => {
  updateCartItemCount();
});
