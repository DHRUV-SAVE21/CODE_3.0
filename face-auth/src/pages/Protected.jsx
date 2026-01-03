import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProtectedLayout from "./ProtectedLayout";

function Protected() {
  const [account, setAccount] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("faceAuth")) {
      navigate("/login");
      return;
    }

    const { account } = JSON.parse(localStorage.getItem("faceAuth"));
    setAccount(account);

    // Hide success message after 1 second
    const timer = setTimeout(() => {
      setShowSuccessMessage(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  if (!account) {
    return null;
  }

  return (
    <ProtectedLayout account={account}>
      {showSuccessMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-7xl text-center drop-shadow-2xl animate-out fade-out duration-500">
            You have successfully logged in!
          </h2>
        </div>
      )}
      
      {/* Empty dashboard content */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
          Welcome to your Dashboard
        </h1>
        <p className="text-xl text-gray-600">
          Select a feature from the menu to get started.
        </p>
      </div>
    </ProtectedLayout>
  );
}

export default Protected;
