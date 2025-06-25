import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function StripeSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Başarı sonrası örneğin dashboard'a yönlendirebiliriz
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="max-w-xl mx-auto mt-24 p-4 text-center">
      <h1 className="text-3xl font-bold mb-4 text-green-600">
        Stripe Setup Completed Successfully!
      </h1>
      <p>You will be redirected to your dashboard shortly.</p>
    </div>
  );
}
