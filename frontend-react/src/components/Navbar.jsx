import React, { useState, useEffect } from "react";
import CartCount from "./CartCount";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);

    const cartCount = localStorage.getItem("cartItemCount") || 0;
    setCartItemCount(cartCount);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  }

  return (
    <nav className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex flex-wrap items-center justify-between p-4 px-8">
        <a href="/" className="text-4xl font-extrabold text-white tracking-wide hover:text-yellow-300 transition">
          NotesMarket
        </a>

        {/* Masaüstü menü */}
        <ul className="hidden md:flex space-x-6 text-white font-medium">
          <li>
            <a href="/" className="hover:text-yellow-300 transition">Home</a>
          </li>
          <li>
            <a href="/products" className="hover:text-yellow-300 transition">Products</a>
          </li>

          {user?.userType === "admin" && (
            <li>
              <a href="/admin-dashboard" className="hover:text-yellow-300 transition">Admin Dashboard</a>
            </li>
          )}

          {user?.userType === "seller" && (
            <>
              <li>
                <a href="/dashboard" className="hover:text-yellow-300 transition">Dashboard</a>
              </li>
              <li>
                <a href="/sales" className="hover:text-yellow-300 transition">My Sales</a>
              </li>
            </>
          )}

          {user?.userType === "customer" && (
            <>
              <li>
                <a href="/purchases" className="hover:text-yellow-300 transition">My Purchases</a>
              </li>
              <li>
                <CartCount />
              </li>
            </>
          )}

          {user ? (
            <li>
              <button
                onClick={handleLogout}
                className="text-yellow-300 hover:underline font-semibold transition"
              >
                Logout
              </button>
            </li>
          ) : (
            <>
              <li>
                <a href="/login" className="hover:text-yellow-300 transition">Login</a>
              </li>
              <li>
                <a href="/register" className="hover:text-yellow-300 transition">Register</a>
              </li>
            </>
          )}
        </ul>

        {/* Mobil hamburger */}
        <div className="md:hidden text-white cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? (
            // Kapatma ikonu (X)
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger ikonu
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </div>

        {/* Mobil menü */}
        {menuOpen && (
          <ul className="w-full mt-4 flex flex-col space-y-3 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 p-4 rounded-md md:hidden text-white font-medium">
            <li>
              <a href="/" className="block hover:text-yellow-300 transition" onClick={() => setMenuOpen(false)}>Home</a>
            </li>
            <li>
              <a href="/products" className="block hover:text-yellow-300 transition" onClick={() => setMenuOpen(false)}>Products</a>
            </li>

            {user?.userType === "admin" && (
              <li>
                <a href="/admin-dashboard" className="block hover:text-yellow-300 transition" onClick={() => setMenuOpen(false)}>Admin Dashboard</a>
              </li>
            )}

            {user?.userType === "seller" && (
              <>
                <li>
                  <a href="/dashboard" className="block hover:text-yellow-300 transition" onClick={() => setMenuOpen(false)}>Dashboard</a>
                </li>
                <li>
                  <a href="/sales" className="block hover:text-yellow-300 transition" onClick={() => setMenuOpen(false)}>My Sales</a>
                </li>
              </>
            )}

            {user?.userType === "customer" && (
              <>
                <li>
                  <a href="/purchases" className="block hover:text-yellow-300 transition" onClick={() => setMenuOpen(false)}>My Purchases</a>
                </li>
                <li>
                  <CartCount />
                </li>
              </>
            )}

            {user ? (
              <li>
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="text-yellow-300 hover:underline font-semibold transition"
                >
                  Logout
                </button>
              </li>
            ) : (
              <>
                <li>
                  <a href="/login" className="block hover:text-yellow-300 transition" onClick={() => setMenuOpen(false)}>Login</a>
                </li>
                <li>
                  <a href="/register" className="block hover:text-yellow-300 transition" onClick={() => setMenuOpen(false)}>Register</a>
                </li>
              </>
            )}
          </ul>
        )}
      </div>
    </nav>
  );
}
