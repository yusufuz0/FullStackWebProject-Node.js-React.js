// auth.js

// Kullanıcı login olmuş mu kontrol eden fonksiyon
function checkAuth() {
    const token = localStorage.getItem('token');
  
    if (!token) {
      // Token yoksa login sayfasına yönlendir
      window.location.href = '../pages/login.html';
    }
  }


  function checkSeller() {
    const userStr = localStorage.getItem('user');
    const user = JSON.parse(userStr);
    if (user.userType !== "seller") {
      // Satıcı değilse index sayfasına yönlendir
      window.location.href = '../pages/index.html';
    }
  }


  function checkCustomer() {
    const userStr = localStorage.getItem('user');
    const user = JSON.parse(userStr);
  
    if (user.userType !== "customer") {
      // müşteri değilse index sayfasına yönlendir
      window.location.href = '../pages/index.html';
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
  