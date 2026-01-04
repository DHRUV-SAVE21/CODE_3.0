import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MeshGradient } from "@paper-design/shaders-react";
import ProtectedLayout from './ProtectedLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { getFlashcards } from '../api/client';

// Smart Revision Page Component with Simple Card Carousel
const SmartRevision = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("faceAuth")) {
      navigate("/login");
      return;
    }
    const { account: storedAccount } = JSON.parse(localStorage.getItem("faceAuth"));
    setAccount(storedAccount);
    
    // Fetch flashcards from backend
    if (storedAccount?.id) {
      getFlashcards(storedAccount.id)
        .then(data => {
          setFlashcards(data.flashcards || []);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch flashcards:", err);
          setError("Failed to load flashcards");
          setLoading(false);
          // Fallback data
          setFlashcards([
            {
              topic: "Binary Search",
              concept: "Binary search works by repeatedly dividing the search interval in half.",
              difficulty: "Medium"
            },
            {
              topic: "Dynamic Programming",
              concept: "Break down complex problems into simpler subproblems.",
              difficulty: "Hard"
            }
          ]);
        });
    }
  }, [navigate]);

  // Handle scroll to change cards
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY > 0 && currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Debounce scroll
  const [canScroll, setCanScroll] = useState(true);
  const handleScrollDebounced = (e) => {
    if (!canScroll) return;
    handleWheel(e);
    setCanScroll(false);
    setTimeout(() => setCanScroll(true), 400);
  };

  if (!account) {
    return null;
  }

  const card = flashcards[currentIndex];

  return (
    <ProtectedLayout account={account}>
      <div 
        className="relative w-full" 
        style={{ height: 'calc(100vh - 96px)' }}
        onWheel={handleScrollDebounced}
      >
        {/* Background */}
        <div className="fixed inset-0 w-screen h-screen -z-10">
          <MeshGradient
            width={typeof window !== 'undefined' ? window.innerWidth : 1920}
            height={typeof window !== 'undefined' ? window.innerHeight : 1080}
            colors={["#72b9bb", "#b5d9d9", "#ffd1bd", "#ffebe0", "#8cc5b8", "#dbf4a4"]}
            distortion={0.8}
            swirl={0.6}
            grainMixer={0}
            grainOverlay={0}
            speed={0.42}
            offsetX={0.08}
          />
          <div className="absolute inset-0 pointer-events-none bg-white/10" />
        </div>
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="text-center pt-6 pb-4 px-6 flex-shrink-0">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent pb-2">
              Flash Learn
            </h1>
            <p className="text-lg text-gray-600 mt-2 max-w-xl mx-auto font-medium">
              Scroll through your personalized flashcards
            </p>
          </div>

          {/* Card Container */}
          <div className="flex-1 flex items-center justify-center px-8 relative">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600 font-medium">Loading flashcards...</p>
              </div>
            ) : flashcards.length === 0 ? (
              <div className="text-center">
                <p className="text-gray-600 text-xl">No flashcards available yet.</p>
                <p className="text-gray-400 mt-2">Keep solving problems to generate personalized cards!</p>
              </div>
            ) : (
              <div className="relative w-full max-w-3xl">
                {/* Background cards for stack effect */}
                {flashcards.slice(currentIndex + 1, currentIndex + 3).map((_, idx) => (
                  <div
                    key={idx}
                    className="absolute inset-0 w-full h-80 rounded-[32px] bg-white/60 border-2 border-gray-200"
                    style={{
                      transform: `translateY(${(idx + 1) * 15}px) scale(${1 - (idx + 1) * 0.05})`,
                      zIndex: -idx - 1,
                      opacity: 1 - (idx + 1) * 0.3,
                    }}
                  />
                ))}
                
                {/* Main Card with Animation */}
                <AnimatePresence mode="wait">
                  {card && (
                    <motion.div
                      key={currentIndex}
                      initial={{ y: 100, opacity: 0, scale: 0.9 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: -100, opacity: 0, scale: 0.9 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 30,
                        duration: 0.4 
                      }}
                      className="relative w-full h-80 p-10 rounded-[32px] bg-white/95 backdrop-blur-2xl border-2 border-gray-200 shadow-2xl"
                    >
                      <div className="flex flex-col justify-between h-full">
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-3xl font-black text-gray-900">{card.topic}</h3>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                              card.difficulty === 'Easy' ? 'bg-green-500/20 text-green-700 border border-green-500' :
                              card.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-700 border border-yellow-500' :
                              'bg-red-500/20 text-red-700 border border-red-500'
                            }`}>
                              {card.difficulty}
                            </span>
                          </div>
                          <p className="text-gray-700 text-xl leading-relaxed">{card.concept}</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                          <span className="text-sm text-gray-500 font-medium">
                            Card {currentIndex + 1} of {flashcards.length}
                          </span>
                          <button className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white text-sm font-bold transition-all hover:scale-105 shadow-lg">
                            Mark as Learned
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          
          {/* Navigation Controls */}
          {flashcards.length > 0 && (
            <div className="flex justify-center items-center gap-6 pb-8">
              <button
                onClick={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)}
                disabled={currentIndex === 0}
                className={`p-4 rounded-full transition-all ${
                  currentIndex === 0 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-white/80 text-gray-700 hover:bg-white hover:scale-110 shadow-lg'
                }`}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              
              {/* Dot indicators */}
              <div className="flex gap-2">
                {flashcards.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      idx === currentIndex 
                        ? 'bg-purple-500 scale-125' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={() => currentIndex < flashcards.length - 1 && setCurrentIndex(prev => prev + 1)}
                disabled={currentIndex === flashcards.length - 1}
                className={`p-4 rounded-full transition-all ${
                  currentIndex === flashcards.length - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-white/80 text-gray-700 hover:bg-white hover:scale-110 shadow-lg'
                }`}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Scroll hint */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center">
            <p className="text-sm text-gray-400 animate-pulse">Scroll or use arrows to navigate</p>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
};

export default SmartRevision;