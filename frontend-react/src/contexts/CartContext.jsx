import { createContext, useContext, useEffect, useState } from "react";
import { fetchCartItems } from "../services/cartService";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const token = localStorage.getItem("token");

  const loadCartCount = async () => {
    if (!token) return setCartCount(0);
    try {
      const data = await fetchCartItems();
      const total = data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    loadCartCount();
  }, [token]);

  return (
    <CartContext.Provider value={{ cartCount, loadCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
