import React, { useEffect } from "react";

export default function Notification({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "error" ? "bg-red-600" : type === "info" ? "bg-blue-600" : "bg-green-600";

  return (
    <div
      className={`fixed top-20 right-4 left-4 sm:right-24 sm:left-auto z-50 px-4 py-2 text-white rounded shadow-lg ${bgColor}`}
      style={{ maxWidth: "320px", margin: "0 auto" }}
    >
      {message}
    </div>
  );
}
