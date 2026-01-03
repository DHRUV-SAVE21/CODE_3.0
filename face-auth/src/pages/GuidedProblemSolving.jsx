import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { AIChatInput } from '../components/ui/ai-chat-input';
import ProtectedLayout from './ProtectedLayout';
import { submitGuidedSolvingEvent } from '../api/client';

const GuidedProblemSolving = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [lastInput, setLastInput] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Simulation state
  const [sessionData, setSessionData] = useState({
    user_id: "u123",
    question_id: "q12",
    step_number: 2,
    wrong_attempts: 1,
    time_spent: 90
  });

  useEffect(() => {
    if (!localStorage.getItem("faceAuth")) {
      navigate("/login");
      return;
    }

    const { account } = JSON.parse(localStorage.getItem("faceAuth"));
    setAccount(account);
  }, [navigate]);

  const handleSend = async (text) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setLastInput(text);
    
    try {
      const requestBody = {
        ...sessionData,
        event_type: "TRYING",
        input_text: text 
      };

      const result = await submitGuidedSolvingEvent(requestBody);
      setResponse(result);
    } catch (err) {
      console.error(err);
      setError("Failed to get response from the tutor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

        {/* Conversation Display Area */}
        <div className="w-full max-w-4xl min-h-[120px] flex flex-col gap-6 items-center justify-center">
          {lastInput && (
            <div className="w-full flex justify-end animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="max-w-[80%] p-6 bg-white border border-gray-100 rounded-[2rem] rounded-tr-sm shadow-md">
                 <p className="text-xl font-medium text-gray-800 italic">
                   "{lastInput}"
                 </p>
               </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 text-indigo-600 font-bold animate-pulse text-xl py-4">
              <span>Tutor is thinking...</span>
            </div>
          )}
          
          {error && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-medium">
              {error}
            </div>
          )}

          {response && (
            <div className="w-full animate-in fade-in slide-in-from-left-4 duration-500">
              {response.mode === "HINT_MODE" ? (
                <div className="p-8 bg-indigo-50 border-2 border-indigo-200 rounded-[2.5rem] rounded-tl-sm shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">💡</span>
                    <h3 className="text-2xl font-bold text-indigo-900">Hint (Level {response.hint_level})</h3>
                  </div>
                  <p className="text-2xl text-gray-800 leading-relaxed">
                    {response.hint?.text}
                  </p>
                </div>
              ) : (
                <div className="p-8 bg-rose-50 border-2 border-rose-200 rounded-[2.5rem] rounded-tl-sm shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">⚠️</span>
                    <h3 className="text-2xl font-bold text-rose-900">Observation</h3>
                  </div>
                  <p className="text-2xl text-gray-800 leading-relaxed">
                    {response.message}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="w-full max-w-4xl">
          <AIChatInput onSend={handleSend} loading={loading} />
        </div>
      </div>
    </ProtectedLayout>
  );
};

export default GuidedProblemSolving;
