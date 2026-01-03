"use client" 

import * as React from "react"
import { useState, useEffect, useRef } from "react";
import { Mic, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
 
const PLACEHOLDERS = [
    "I'm stuck on this calculus problem...",
    "Can you explain the photoelectric effect?",
    "What is the difference between Mitosis and Meiosis?",
    "How do I balance this chemical equation?",
    "Explain the concept of supply and demand.",
    "I need help with this grammar rule."
];
 
const LiveDoubtInput = ({ onSend, loading = false }) => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const wrapperRef = useRef(null);
 
  // Cycle placeholder text when input is inactive
  useEffect(() => {
    if (isActive || inputValue) return;
 
    const interval = setInterval(() => {
      setShowPlaceholder(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        setShowPlaceholder(true);
      }, 400);
    }, 3000);
 
    return () => clearInterval(interval);
  }, [isActive, inputValue]);
 
  // Close input when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        if (!inputValue) setIsActive(false);
      }
    };
 
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputValue]);
 
  const handleActivate = () => setIsActive(true);

  const handleSend = () => {
    if (!inputValue.trim() || loading) return;
    onSend?.(inputValue);
    setInputValue("");
  };
 
  const containerVariants = {
    collapsed: {
      height: 100,
      boxShadow: "0 2px 12px 0 rgba(0,0,0,0.08)",
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
    expanded: {
      height: 100,
      boxShadow: "0 12px 48px 0 rgba(0,0,0,0.16)",
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
  };
 
  const placeholderContainerVariants = {
    initial: {},
    animate: { transition: { staggerChildren: 0.025 } },
    exit: { transition: { staggerChildren: 0.015, staggerDirection: -1 } },
  };
 
  const letterVariants = {
    initial: {
      opacity: 0,
      filter: "blur(12px)",
      y: 10,
    },
    animate: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        opacity: { duration: 0.25 },
        filter: { duration: 0.4 },
        y: { type: "spring", stiffness: 80, damping: 20 },
      },
    },
    exit: {
      opacity: 0,
      filter: "blur(12px)",
      y: -10,
      transition: {
        opacity: { duration: 0.2 },
        filter: { duration: 0.3 },
        y: { type: "spring", stiffness: 80, damping: 20 },
      },
    },
  };
 
  return (
    <div className="w-full flex justify-center items-center text-black">
      <motion.div
        ref={wrapperRef}
        className="w-full max-w-4xl"
        variants={containerVariants}
        animate={isActive || inputValue ? "expanded" : "collapsed"}
        initial="collapsed"
        style={{ overflow: "hidden", borderRadius: 50, background: "#fff" }}
        onClick={handleActivate}
      >
        <div className="flex flex-col items-stretch w-full h-full justify-center">
          {/* Input Row */}
          <div className="flex items-center gap-4 p-6 rounded-full bg-white w-full">
            {/* Text Input & Placeholder */}
            <div className="relative flex-1 px-6">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                className="flex-1 border-0 outline-0 rounded-md py-4 text-2xl bg-transparent w-full font-medium"
                style={{ position: "relative", zIndex: 1 }}
                onFocus={handleActivate}
                disabled={loading}
              />
              <div className="absolute left-6 top-0 w-full h-full pointer-events-none flex items-center py-4">
                <AnimatePresence mode="wait">
                  {showPlaceholder && !isActive && !inputValue && (
                    <motion.span
                      key={placeholderIndex}
                      className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 select-none pointer-events-none text-2xl font-medium"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        zIndex: 0,
                      }}
                      variants={placeholderContainerVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      {PLACEHOLDERS[placeholderIndex]
                        .split("")
                        .map((char, i) => (
                          <motion.span
                            key={i}
                            variants={letterVariants}
                            style={{ display: "inline-block" }}
                          >
                            {char === " " ? "\u00A0" : char}
                          </motion.span>
                        ))}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <button
              className="p-4 rounded-full hover:bg-gray-100 transition text-gray-600"
              title="Voice input"
              type="button"
              tabIndex={-1}
            >
              <Mic size={24} />
            </button>
 
            <button
              className={`flex items-center gap-1 bg-black hover:bg-zinc-800 text-white p-5 rounded-full font-bold justify-center transition-all hover:scale-105 active:scale-95 shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Send"
              type="button"
              tabIndex={-1}
              onClick={handleSend}
              disabled={loading}
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send size={24} />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
 
export { LiveDoubtInput };
