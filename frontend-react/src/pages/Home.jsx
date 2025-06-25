import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { fetchTopRatedProducts } from "../services/productService";

export default function Home() {
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetchTopRatedProducts().then(setTopProducts);
  }, []);

  return (
    <main className="container mt-[72px]">
      {/* Hero */}
      <section className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white py-16 px-4 text-center rounded-b-3xl shadow-md mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-snug drop-shadow-md">
          Share, Discover, Buy – Turn Your Notes Into Cash!
        </h1>
        <p className="mb-8 max-w-2xl mx-auto text-base md:text-lg tracking-wide drop-shadow-sm">
          Share your notes, start earning. Safely purchase the content you need.
        </p>
        <div className="space-x-3 flex justify-center flex-wrap gap-3">
          <a
            href="/register"
            className="bg-white text-purple-700 font-semibold px-6 py-2 rounded-full shadow hover:bg-gray-100 transition"
          >
            Sell Your Notes
          </a>
          <a
            href="/products"
            className="border-2 border-white text-white font-semibold px-6 py-2 rounded-full hover:bg-white hover:text-purple-700 transition"
          >
            Discover Products
          </a>
        </div>
      </section>

      {/* Top Rated Products */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-600 text-center">
          Top Rated Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topProducts.length === 0 && (
            <p className="text-center text-gray-600">No top-rated products available.</p>
          )}
          {topProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <a
            href="/products"
            className="bg-purple-700 text-white px-5 py-2.5 rounded-lg shadow hover:bg-purple-800 transition font-semibold"
          >
            View All Products
          </a>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-600 text-center">
          Explore by Category
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {["mathematics", "physics", "chemistry", "computer-science"].map((cat) => (
            <a
              key={cat}
              href={`/products?category=${cat}`}
              className="border-2 border-purple-600 text-purple-600 px-4 py-2 rounded-full font-semibold hover:bg-purple-600 hover:text-white transition shadow"
            >
              {cat.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </a>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-12 px-3">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-600 text-center">
          How It Works
        </h2>
        <div className="flex flex-col md:flex-row justify-center gap-5 max-w-4xl mx-auto">
          {["Create an account", "Upload a product or add to cart", "Sell / Buy"].map((step, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-tr from-purple-100 via-pink-100 to-red-100 p-5 rounded-lg shadow text-center text-gray-700 font-semibold text-base"
            >
              <div className="text-3xl font-extrabold mb-3 text-purple-600">{i + 1}</div>
              {step}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white py-10 rounded-t-3xl shadow px-4">
        <h2 className="text-3xl font-extrabold mb-4 drop-shadow-sm">
          Join NotesMarket Today!
        </h2>
        <p className="mb-6 max-w-xl mx-auto text-base drop-shadow-xs">
          Earn money by selling your digital products or discover the notes you need.
        </p>
        <a
          href="/register"
          className="inline-block bg-white text-purple-700 font-semibold px-8 py-2.5 rounded-full shadow hover:bg-gray-100 transition"
        >
          Join Now
        </a>
      </section>
    </main>
  );
}
