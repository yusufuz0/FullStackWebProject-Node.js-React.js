import React from "react";

export default function ProductCard({ product }) {
  return (
<div className="border border-purple-300 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-shadow bg-white w-3/4 mx-auto text-center">
  <h3 className="text-xl font-bold text-purple-700 hover:underline mb-2">
    <a href={`/product-detail/${product.id}`}>{product.title}</a>
  </h3>
  <p className="text-sm text-yellow-600 font-semibold mb-1">
    {product.averageRating > 0
      ? product.averageRating.toFixed(1)
      : "No rating"}{" "}
    <span className="text-yellow-400">⭐</span> ({product.ratingCount} votes)
  </p>
  <p className="text-gray-700 mb-3">
    {product.description.length > 100
      ? product.description.substring(0, 100) + "..."
      : product.description}
  </p>
  <p className="italic text-purple-400 mb-3">{product.category}</p>
  <p className="text-lg font-extrabold text-purple-800">£{product.price}</p>
</div>

  );
}
