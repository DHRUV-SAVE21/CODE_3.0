import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MeshGradient } from "@paper-design/shaders-react";
import ProtectedLayout from './ProtectedLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { searchVideo } from '../api/client';

const IntelligentVideoLearning = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("faceAuth")) {
      navigate("/login");
      return;
    }
    const { account: storedAccount } = JSON.parse(localStorage.getItem("faceAuth"));
    setAccount(storedAccount);
  }, [navigate]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      const result = await searchVideo(searchQuery);
      setVideoUrl(result.video_url || '');
      setVideoTitle(result.title || searchQuery);
    } catch (error) {
      console.error('Failed to search video:', error);
      // Fallback to a sample YouTube embed
      setVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
      setVideoTitle(searchQuery);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!account) {
    return null;
  }

  return (
    <ProtectedLayout account={account}>
      <div className="relative w-full" style={{ height: 'calc(100vh - 96px)' }}>
        {/* Background - Same as Hero Section */}
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
          <div className="absolute inset-0 pointer-events-none bg-white/20" />
        </div>
        
        <div className="relative z-10 flex flex-col h-full p-6">
          {/* Header with Search */}
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent pb-2">
              Intelligent Video Learning
            </h1>
            <p className="text-lg text-gray-700 mt-2 max-w-xl mx-auto font-medium">
              Search for any topic and learn with curated videos
            </p>
            
            {/* Search Bar */}
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search for a topic (e.g., Binary Search, Recursion)..."
                  className="w-full px-6 py-4 pr-14 rounded-2xl bg-white/95 backdrop-blur-xl border-2 border-white/50 text-gray-900 text-lg font-medium placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/30 shadow-2xl transition-all"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="absolute right-2 p-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-xl text-white transition-all hover:scale-105 disabled:opacity-50"
                >
                  {loading ? (
                    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex gap-6 min-h-0" style={{ paddingLeft: '300px' }}>
            {/* Video Section - Left Side (occupies all available space) */}
            <div className="flex-1 flex flex-col">
              <AnimatePresence mode="wait">
                {!hasSearched ? (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex items-center justify-center rounded-3xl bg-white/60 backdrop-blur-xl border-2 border-gray-200 shadow-xl"
                  >
                    <div className="text-center p-8">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
                        <svg className="w-12 h-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Learning</h3>
                      <p className="text-gray-600 max-w-md">
                        Search for any programming topic above to find relevant video tutorials
                      </p>
                    </div>
                  </motion.div>
                ) : loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex items-center justify-center rounded-3xl bg-white/60 backdrop-blur-xl border-2 border-gray-200 shadow-xl"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-gray-700 font-medium">Finding the best video for you...</p>
                    </div>
                  </motion.div>
                ) : videoUrl ? (
                  <motion.div
                    key="video"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex-1 flex flex-col rounded-3xl bg-white/80 backdrop-blur-xl border-2 border-gray-200 shadow-xl overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 bg-white/50">
                      <h3 className="text-xl font-bold text-gray-900 truncate">{videoTitle}</h3>
                    </div>
                    <div className="flex-1 relative">
                      <iframe
                        src={videoUrl}
                        title={videoTitle}
                        className="absolute inset-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex items-center justify-center rounded-3xl bg-white/60 backdrop-blur-xl border-2 border-gray-200 shadow-xl"
                  >
                    <div className="text-center p-8">
                      <p className="text-gray-700 text-xl">No video found. Try a different search term.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar Options - Right Side */}
            <div className="w-80 flex flex-col gap-4 justify-center">
              {/* Live Doubt Resolution */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/live-doubt-resolution')}
                className="p-6 rounded-2xl bg-white/95 backdrop-blur-xl border-2 border-white/50 shadow-2xl text-left group hover:bg-white transition-all"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Live Doubt Resolution</h4>
                    <p className="text-sm text-gray-500">Got stuck? Ask your doubts</p>
                  </div>
                </div>
                <div className="text-sm text-purple-600 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Open Chat
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.button>

              {/* Flash Learn */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/smart-revision')}
                className="p-6 rounded-2xl bg-white/95 backdrop-blur-xl border-2 border-white/50 shadow-2xl text-left group hover:bg-white transition-all"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Flash Learn</h4>
                    <p className="text-sm text-gray-500">Quick revision flashcards</p>
                  </div>
                </div>
                <div className="text-sm text-purple-600 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Start Revision
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.button>

              {/* Guided Problem Solving */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/guided-problem-solving')}
                className="p-6 rounded-2xl bg-white/95 backdrop-blur-xl border-2 border-white/50 shadow-2xl text-left group hover:bg-white transition-all"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Guided Problem Solving</h4>
                    <p className="text-sm text-gray-500">Step-by-step guidance</p>
                  </div>
                </div>
                <div className="text-sm text-purple-600 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Solve Problems
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.button>

              {/* Video Info Card */}
              {hasSearched && videoUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-auto p-4 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30"
                >
                  <p className="text-sm text-white/80 mb-2">Currently watching:</p>
                  <p className="text-white font-bold truncate">{videoTitle}</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
};

export default IntelligentVideoLearning;
