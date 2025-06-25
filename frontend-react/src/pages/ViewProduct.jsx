import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProductById } from "../services/productService";
import { FaFilePdf, FaFileArchive } from "react-icons/fa";

export default function ViewProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await fetchProductById(id, token);
        setProduct(data);
      } catch (err) {
        setError("Failed to load product.");
        console.error(err);
      }
    };

    loadProduct();
  }, [id, token]);

  if (error)
    return (
      <p className="mt-24 text-center text-red-600 font-semibold">{error}</p>
    );
  if (!product)
    return <p className="mt-24 text-center text-gray-600">Loading product...</p>;

  return (
    <main className="max-w-4xl mx-auto mt-24 p-6 sm:p-10 bg-white rounded-lg shadow-lg border border-gray-300">
      {/* Başlık */}
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">
        {product.title}
      </h1>

      {/* Açıklama */}
      <p className="text-gray-700 mb-10 text-base sm:text-lg leading-relaxed">
        {product.description}
      </p>

      {/* Dosya Önizleme veya İndirme */}
      {product.fileUrl?.endsWith(".pdf") ? (
        <section className="border rounded-lg overflow-hidden shadow-inner">
          <header className="flex items-center gap-3 bg-blue-100 text-blue-800 px-6 py-3 font-semibold text-lg sm:text-xl">
            <FaFilePdf className="text-3xl" />
            <span>Preview PDF</span>
          </header>
          <iframe
            src={`http://localhost:5500${product.fileUrl}`}
            title="Product PDF"
            className="w-full h-64 sm:h-[75vh] border-t"
            loading="lazy"
          />
        </section>
      ) : product.fileUrl?.endsWith(".zip") ? (
        <section className="bg-yellow-50 border border-yellow-400 rounded-lg p-6 flex flex-col sm:flex-row items-center gap-6 shadow-md">
          <FaFileArchive className="text-yellow-700 text-4xl" />
          <div>
            <p className="text-yellow-900 font-bold text-lg mb-2">ZIP Archive</p>
            <a
              href={`http://localhost:5500${product.fileUrl}`}
              download
              className="text-blue-600 underline hover:text-blue-800 transition"
            >
              Click here to download your file
            </a>
          </div>
        </section>
      ) : (
        <p className="text-red-600 font-semibold mt-6">
          Unsupported file format.
        </p>
      )}
    </main>
  );
}
