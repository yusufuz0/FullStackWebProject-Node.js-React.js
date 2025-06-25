// src/pages/Success.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Success() {
  return (
    <div className="max-w-xl mx-auto mt-28 text-center p-6 border rounded shadow-md bg-green-50">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Payment Successful 🎉</h1>
      <p className="text-gray-700 mb-6">
        Thank you for your purchase! Your payment has been processed successfully.
      </p>
      <Link
        to="/"
        className="inline-block px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
