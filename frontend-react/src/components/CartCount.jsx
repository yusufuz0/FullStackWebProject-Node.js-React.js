import React from "react";
import { useCart } from "../contexts/CartContext";
import { Link } from "react-router-dom";

export default function CartCount() {
  const { cartCount } = useCart();

  return (
    <Link
      to="/cart"
      className="relative inline-flex items-center px-3 py-1 rounded-full bg-yellow-400 text-yellow-900 font-semibold hover:bg-yellow-500 transition"
      aria-label={`Cart with ${cartCount} items`}
    >
      <span className="mr-2 text-lg">🛒</span>
      Cart
      <span className="ml-2 inline-block bg-yellow-900 text-yellow-100 text-xs font-bold px-2 py-0.5 rounded-full">
        {cartCount}
      </span>
    </Link>
  );
}
