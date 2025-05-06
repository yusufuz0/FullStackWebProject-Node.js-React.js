// Login olma durumuna göre menü çubuğunu günceller

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
  
    const authLinks = document.getElementById('authLinks');
    const logoutLink = document.getElementById('logoutLink');
    const dashboardLink = document.getElementById('dashboardLink');
    const cartLink = document.getElementById('cartLink');
    const productsLink = document.getElementById('productsLink');
    const purchasesLink = document.getElementById('purchasesLink');
    const salesLink = document.getElementById('salesLink');

    
  

    productsLink.style.display = 'inline';
    
    if (token && user) {
      authLinks.style.display = 'none';
      logoutLink.style.display = 'inline';
      

  
      if (user.userType === 'seller') {
        productsLink.style.display = 'inline';
        dashboardLink.style.display = 'inline';
        salesLink.style.display = 'inline';
        
      }
      if (user.userType === 'customer') {
        productsLink.style.display = 'inline';
        cartLink.style.display = 'inline';
        purchasesLink.style.display = 'inline';
        
      }
    } else {
      authLinks.style.display = 'inline';
      logoutLink.style.display = 'none';


    }
  });
  