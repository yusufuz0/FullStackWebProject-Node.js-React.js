import React from "react";

export default function StripeRefresh() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="max-w-xl mx-auto mt-24 p-4 text-center">
      <h1 className="text-3xl font-bold mb-4 text-yellow-600">
        Stripe Setup Not Completed
      </h1>
      <p>
        You can refresh this page to try setting up your Stripe account again.
      </p>
      <button
        onClick={handleRefresh}
        className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded"
      >
        Refresh Page
      </button>
    </div>
  );
}
