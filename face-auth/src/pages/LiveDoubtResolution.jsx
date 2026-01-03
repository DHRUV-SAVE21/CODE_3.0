import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PromptInputBox } from "../components/ui/ai-prompt-box";
import ProtectedLayout from "./ProtectedLayout";
import { submitLiveDoubtEvent } from "../api/client";

const LiveDoubtResolution = () => {
  const [messages, setMessages] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // Simulation/Session state matching the requested format
  const [sessionData, setSessionData] = useState({
    user_id: "u123",
    question_id: "q12",
    step_number: 2
  });

  useEffect(() => {
    if (!localStorage.getItem("faceAuth")) {
      navigate("/login");
      return;
    }
    const { account: storedAccount } = JSON.parse(localStorage.getItem("faceAuth"));
    setAccount(storedAccount);
  }, [navigate]);

  // Auto-scroll to bottom directly when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (message) => {
    setLoading(true);
    // Add user message immediately
    setMessages((prev) => [...prev, { role: 'user', content: message }]);

    try {
      const requestBody = {
        ...sessionData,
        event_type: "DOUBT_SUBMITTED",
        student_answer: message
      };

      const result = await submitLiveDoubtEvent(requestBody);
      
      if (result.mode === "AI_ASSISTANCE_MODE") {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.explanation.text },
        ]);
        
        // Increment step number for the next question in this session
        setSessionData(prev => ({
          ...prev,
          step_number: prev.step_number + 1
        }));
      }
    } catch (err) {
      console.error("Failed to get response:", err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I'm having trouble connecting to the tutor service. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!account) return null;

  return (
    <ProtectedLayout account={account}>
      <div className="flex w-full h-[calc(100vh-80px)] flex-col items-center justify-center p-4">
        <div className="w-full max-w-5xl flex flex-col gap-6 h-full">
          {/* Page Heading */}
          <div className="text-center space-y-2 mt-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-black tracking-tight">
              Live Doubt Resolution
            </h1>
            <p className="text-lg text-black/60 max-w-xl mx-auto">
              Get clear, step-wise explanations instantly whenever you're stuck.
            </p>
          </div>

          {/* Chat History Area */}
          <div 
              ref={scrollRef}
              className="flex-grow flex flex-col gap-4 overflow-y-auto w-full p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl custom-scrollbar"
          >
              {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-black/50 text-center space-y-4">
                      <div className="text-4xl">🎓</div>
                      <p className="italic text-lg">Ask me anything! I'm here to resolve your doubts instantly.</p>
                  </div>
              )}
              {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl max-w-[85%] leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-lg ${
                        msg.role === 'user'
                        ? 'bg-white/10 ml-auto text-black rounded-br-none border border-white/20'
                        : 'bg-indigo-600/20 mr-auto text-black rounded-bl-none border border-indigo-500/30'
                    }`}
                  >
                    <div className="text-[10px] opacity-40 mb-1 uppercase tracking-[0.2em] font-bold text-black">
                        {msg.role === 'user' ? 'Student' : 'Tutor'}
                    </div>
                    <p className="text-lg">{msg.content}</p>
                  </div>
              ))}
              {loading && (
                <div className="bg-indigo-600/20 mr-auto text-black rounded-2xl rounded-bl-none border border-indigo-500/30 p-5 animate-pulse">
                  <div className="text-[10px] opacity-40 mb-1 uppercase tracking-[0.2em] font-bold text-black">Tutor</div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-black/40 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-black/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-black/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
          </div>

          {/* Prompt Input */}
          <div className="pb-12">
              <PromptInputBox 
                  onSend={handleSendMessage} 
                  isLoading={loading}
                  placeholder="Type your doubt here..."
                  className="!bg-white/10 !backdrop-blur-xl !border-white/20 !shadow-2xl !rounded-3xl !p-3 [&_textarea]:!text-2xl"
              />
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
};

export default LiveDoubtResolution;