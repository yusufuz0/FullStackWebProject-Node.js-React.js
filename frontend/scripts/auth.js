// auth.js

// Kullanıcı login olmuş mu kontrol eden fonksiyon
function checkAuth() {
    const token = localStorage.getItem('token');
  
    if (!token) {
      // Token yoksa login sayfasına yönlendir
      window.location.href = '../pages/login.html';
    }
  }
  
  // Kullanıcı bilgilerini getiren fonksiyon
  function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  
  // Kullanıcıyı çıkış yaptıran fonksiyon
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../pages/login.html';
  }
  