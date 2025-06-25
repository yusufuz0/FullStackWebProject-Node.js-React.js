import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchProductById,
  fetchProductRating,
  submitRating,
  fetchUserRating,
} from "../services/productService";
import { addToCart } from "../services/cartService";
import { getUserFromLocalStorage } from "../utils/auth";
import { useCart } from "../contexts/CartContext";

import { getDocument, GlobalWorkerOptions } from "pdfjs-dist"
// PDF.js worker dosyasının yolunu belirt (CDN üzerinden)
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js`;

export default function ProductDetail() {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("green");
  const [ratingInfo, setRatingInfo] = useState({ average: 0, count: 0 });
  const [userRating, setUserRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  const canvasRef = useRef(null);

  const user = getUserFromLocalStorage();
  console.log("User from localStorage:", user);


  useEffect(() => {
    if (!productId) {
      setMessage("Product ID not found.");
      setMessageColor("red");
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    async function loadProductDetail() {
      try {
        const prod = await fetchProductById(productId);
        setProduct(prod);

        const rating = await fetchProductRating(productId);
        setRatingInfo(rating);

        const userRating = await fetchUserRating(productId);
        if (userRating) setUserRating(userRating);
      } catch (err) {
        setMessage("There was an error loading the product.");
        setMessageColor("red");
      }
    }

    loadProductDetail();
  }, [productId, navigate]);

  // PDF ilk sayfayı canvas'a render etme
  useEffect(() => {
    async function renderPDF() {
      if (product?.fileUrl && product.fileUrl.endsWith(".pdf")) {
        try {
          const loadingTask = getDocument(`http://localhost:5500${product.fileUrl}`);
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);

          const viewport = page.getViewport({ scale: 1.0 });
          const canvas = canvasRef.current;
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };

          await page.render(renderContext).promise;
        } catch (error) {
          setMessage("Failed to render PDF.");
          setMessageColor("red");
          setTimeout(() => setMessage(""), 2000);
          console.error(error);
        }
      }
    }

    renderPDF();
  }, [product]);

  const { loadCartCount } = useCart();

  async function handleAddToCart() {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You must be logged in to add products to the cart.");
      setMessageColor("red");
      return;
    }

    try {
      const result = await addToCart({
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: 1,
        sellerId: product.sellerId,
      });
      loadCartCount(); // cart'ı güncelle
      setMessage(result.message || "Product added to cart.");
      setMessageColor("green");
    } catch (err) {
      setMessage("There was an error adding the product to the cart.");
      setMessageColor("red");
    }
  }

  async function handleRating(score) {
    try {
      await submitRating(productId, score);
      setUserRating(score);
      const newRating = await fetchProductRating(productId);
      setRatingInfo(newRating);
      setMessage("Thanks for your rating!");
      setMessageColor("green");
    } catch (err) {
      setMessage("Error submitting your rating.");
      setMessageColor("red");
    }
  }

  const isCustomer = user && user.userType === "customer";
  

return (
  <div className="max-w-3xl mx-auto px-2 py-6 mt-20">
    {message && (
      <div className={`mb-3 text-center text-${messageColor}-600 font-medium text-sm`}>
        {message}
      </div>
    )}

    {product ? (
      <>
        <h1 className="text-xl font-bold mb-2">{product.title}</h1>

        <div className="mb-3 text-sm text-gray-700">
          <span className="font-medium">
            {ratingInfo.average.toFixed(1)} ⭐ ({ratingInfo.count} vote
            {ratingInfo.count !== 1 ? "s" : ""})
          </span>
        </div>

        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{product.category}</p>
        <p className="text-sm mb-2">{product.description}</p>
        <p className="text-base font-semibold text-blue-700 mb-3">£{product.price}</p>

        {isCustomer && (
          <div className="mt-3">
            <p className="font-medium text-sm mb-1">Rate this product:</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-xl cursor-pointer ${
                    (hoveredStar || userRating) >= star
                      ? "text-yellow-500"
                      : "text-gray-300"
                  }`}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => handleRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 mb-4 border rounded p-3 bg-gray-50">
          {product.fileUrl ? (
            product.fileUrl.endsWith(".pdf") ? (
              <canvas
                ref={canvasRef}
                className="w-full border border-gray-300 rounded"
              />
            ) : (
              <p className="text-sm text-gray-600">A folder in .zip format</p>
            )
          ) : (
            <p className="text-sm text-gray-500">No file available for this product.</p>
          )}
        </div>

        {isCustomer && (
          <button
            className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        )}
      </>
    ) : (
      <p className="text-center text-sm">Loading...</p>
    )}
  </div>
);

}
