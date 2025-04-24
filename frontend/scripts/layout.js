// Login olma durumuna göre menü çubuğunu günceller

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
  
    const authLinks = document.getElementById('authLinks');
    const logoutLink = document.getElementById('logoutLink');
    const addProductLink = document.getElementById('addProductLink');
    const dashboardLink = document.getElementById('dashboardLink');
  
    if (token && user) {
      authLinks.style.display = 'none';
      logoutLink.style.display = 'inline';

  
      if (user.userType === 'seller') {
        addProductLink.style.display = 'inline';
        dashboardLink.style.display = 'inline';
      }
    } else {
      authLinks.style.display = 'inline';
      logoutLink.style.display = 'none';
      addProductLink.style.display = 'none';
      dashboardLink.style.display = 'none';
    }
  });
  