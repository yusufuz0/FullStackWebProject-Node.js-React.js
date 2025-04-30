// Bu dosya, sepetin başarıyla tamamlandığı sayfada çalışacak olan JavaScript kodlarını içerir.
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    // 1. Satın alma işlemini kaydet
    fetch('http://localhost:5500/api/stripe/mark-purchased', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to record purchase');
      return res.json();
    })
    .then(() => {
      // 2. Sepeti temizle
      return fetch('http://localhost:5500/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    })
    .then(res => res.json())
    .then(data => {
      console.log('Cart cleared:', data);
      updateCartItemCount?.(); // varsa sepet sayacını güncelle
    })
    .catch(err => {
      console.error('Error during post-purchase process:', err);
    });
  });
  