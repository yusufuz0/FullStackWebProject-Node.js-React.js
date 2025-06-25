import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { fetchAllProducts, fetchProductRating } from "../services/productService";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedCategory = searchParams.get("category");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const fetchedProducts = await fetchAllProducts();

        const filteredProducts = selectedCategory
          ? fetchedProducts.filter(
              (product) =>
                product.category.toLowerCase() === selectedCategory.toLowerCase()
            )
          : fetchedProducts;

        const enrichedProducts = await Promise.all(
          filteredProducts.map(async (product) => {
            const rating = await fetchProductRating(product.id);
            return {
              ...product,
              averageRating: rating.average,
              ratingCount: rating.count,
            };
          })
        );

        setProducts(enrichedProducts);
      } catch (err) {
        console.error(err);
        setError("An error occurred while loading products.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [selectedCategory]);

  if (loading)
    return (
      <div className="text-center mt-12 text-lg text-gray-600">Loading...</div>
    );
  if (error)
    return (
      <div className="text-center mt-12 text-red-600 font-semibold">{error}</div>
    );

  return (
    <div className="max-w-6xl mx-auto px-3 py-8 mt-20">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-purple-700">
        {selectedCategory
          ? `${selectedCategory.replace("-", " ")}`
          : "All Products"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center text-gray-500 mt-6">No products found.</p>
      )}
    </div>
  );
}
