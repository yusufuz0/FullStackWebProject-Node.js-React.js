import React from "react";

export default function Button({ type = "button", onClick, disabled = false, children, className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-gradient-to-r from-purple-600 via-pink-500 to-red-500
        w-full
        text-white
        font-semibold
        px-6 py-3
        rounded-lg
        shadow-md
        hover:from-pink-500 hover:via-red-500 hover:to-purple-600
        focus:outline-none focus:ring-4 focus:ring-pink-300
        transition
        duration-300
        ease-in-out
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
