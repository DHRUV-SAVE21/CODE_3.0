import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { AIChatInput } from '../components/ui/ai-chat-input';
import ProtectedLayout from './ProtectedLayout';

const GuidedProblemSolving = () => {
  const [account, setAccount] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("faceAuth")) {
      navigate("/login");
      return;
    }

    const { account } = JSON.parse(localStorage.getItem("faceAuth"));
    setAccount(account);
  }, [navigate]);

  if (!account) return null;

  return (
    <ProtectedLayout account={account}>
      <div className="w-full flex flex-col items-center justify-center gap-12 p-8 -mt-20">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
            Guided Problem Solving
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Whatever you're stuck on, our AI tutor will guide you through hints and step-wise explanations.
          </p>
        </div>
        
        <div className="w-full max-w-4xl">
          <AIChatInput />
        </div>
      </div>
    </ProtectedLayout>
  );
};

export default GuidedProblemSolving;
