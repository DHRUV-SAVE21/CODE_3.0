import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedLayout from "./ProtectedLayout";
import {
  AuroraBackground,
  BentoGrid,
  BentoGridItem,
} from '../components/ui/aurora-bento-grid';
import {
  ArrowRight,
  TrendingUp,
  Flame,
  CheckCircle,
  Users,
  Bell,
  Trophy,
  X,
  Zap,
  Info,
  Lightbulb,
  Download,
  FileText,
  Award,
} from 'lucide-react';
import { getUserDashboard } from "../api/client";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ScrollStack, { ScrollStackItem } from '../components/ui/scroll-stack';

const ProgressCircle = ({ percentage, size = 120 }) => {
  // Add padding to handle stroke caps and drop shadows
  const strokeWidth = 14;
  const padding = 20;
  const viewBoxSize = size + padding;
  const center = viewBoxSize / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center translate-y-2" style={{ width: viewBoxSize, height: viewBoxSize }}>
      <svg 
        className="transform -rotate-90 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]" 
        width={viewBoxSize} 
        height={viewBoxSize}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-white/10"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#progress-gradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          style={{ 
            strokeDashoffset, 
            transition: 'stroke-dashoffset 2.5s cubic-bezier(0.34, 1.56, 0.64, 1)' 
          }}
          className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center inset-0">
        <span className="text-5xl font-black text-white tracking-widest drop-shadow-2xl">{percentage}%</span>
        <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em] mt-2">Overall Path</span>
      </div>
    </div>
  );
};

const TopicPerformance = ({ topics }) => {
  if (!topics) return null;
  return (
    <div className="flex flex-col gap-6 py-4 px-2">
      {topics.map((topic, i) => (
        <div key={i} className="group">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/60 text-xs font-bold uppercase tracking-widest">{topic.name}</span>
            <span className="text-white font-black text-sm">{topic.score}%</span>
          </div>
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${topic.score}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.2 }}
              className={`h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)] ${
                topic.score >= 70 ? 'bg-emerald-500' : 
                topic.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const HintAnalysis = ({ data }) => {
  if (!data) return null;
  return (
    <div className="flex flex-col gap-6 py-4 px-2">
      <div className="flex flex-col gap-4">
        {/* Progress Bar for Avg Hint level */}
        <div className="group">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/60 text-xs font-bold uppercase tracking-widest text-left">Avg Hint Level</span>
            <span className="text-white font-black text-sm">{data.avgHintLevel} / {data.maxHintLevel}</span>
          </div>
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(data.avgHintLevel / data.maxHintLevel) * 100}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
            />
          </div>
        </div>

        {/* Mini Stat Cards */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center gap-1 group hover:border-white/20 transition-all">
            <span className="text-rose-400 font-black text-2xl">{data.hintsExhausted}</span>
            <span className="text-white/30 text-[9px] font-bold uppercase tracking-wider text-center leading-tight">Hints Exhausted</span>
          </div>
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center gap-1 group hover:border-white/20 transition-all">
            <span className="text-amber-400 font-black text-2xl">{data.dependency}</span>
            <span className="text-white/30 text-[9px] font-bold uppercase tracking-wider text-center leading-tight">Hint Dependency</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StuckInsights = ({ data }) => {
  if (!data) return null;
  
  // Simple SVG Line Chart logic
  const points = data.trend.map((val, i) => `${(i / (data.trend.length - 1)) * 100},${100 - val}`).join(" ");
  
  return (
    <div className="flex flex-col gap-3 py-2 px-1">
      {/* Compressed Line Chart Segment */}
      <div className="relative h-16 w-full bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden p-1">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <motion.polyline
            fill="none"
            stroke="#f43f5e"
            strokeWidth="4"
            points={points}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="absolute bottom-1 left-2">
           <span className="text-[7px] text-white/20 font-black uppercase tracking-widest">Stuck Trend</span>
        </div>
      </div>

      {/* Stats and Alerts */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center bg-white/[0.02] rounded-xl p-2 border border-white/5">
          <div className="flex flex-col">
            <p className="text-white/30 text-[8px] font-black uppercase tracking-widest leading-none mb-1">Avg Score</p>
            <p className="text-2xl font-black text-white leading-none">{data.avgStuckScore}</p>
          </div>
          <div className="h-8 w-[1px] bg-white/10 mx-2" />
          <div className="flex flex-col text-right">
            <p className="text-white/30 text-[8px] font-black uppercase tracking-widest leading-none mb-1">High Events</p>
            <p className="text-2xl font-black text-rose-500 leading-none">{data.highStuckEvents}</p>
          </div>
        </div>

        {/* Compressed Alert Segment */}
        <div className="flex flex-col gap-1.5">
          {data.alerts.map((alert, i) => (
            <motion.div 
              key={i}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-rose-500/5 border border-rose-500/20 rounded-lg px-2 py-1.5 flex items-center gap-2"
            >
              <span className="text-sm">⚠️</span>
              <span className="text-[9px] font-black text-rose-400 uppercase tracking-tight truncate">{alert}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CertificateTemplate = React.forwardRef(({ userName, email, achievementTitle, date, isPreview = false }, ref) => (
  <div 
    ref={ref}
    className={`${isPreview ? 'relative w-full aspect-[4/3]' : 'fixed -left-[2000px] top-0 w-[800px] h-[600px]'} bg-[#0a0a0c] text-white p-6 md:p-12 flex flex-col items-center justify-between border-[8px] md:border-[16px] border-[#1a1a1e] overflow-hidden shadow-2xl rounded-3xl`}
    style={{ fontFamily: "'Inter', sans-serif" }}
  >
    {/* Decorative Elements */}
    <div className="absolute top-0 left-0 w-32 md:w-64 h-32 md:h-64 bg-indigo-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
    <div className="absolute bottom-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-purple-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
    
    <div className="relative z-10 w-full flex flex-col items-center border border-white/10 h-full p-4 md:p-8 rounded-2xl md:rounded-3xl bg-white/[0.02] backdrop-blur-3xl">
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8">
        <Award className="w-8 h-8 md:w-12 md:h-12 text-amber-500" />
        <span className="text-xs md:text-xl font-black tracking-[0.4em] uppercase text-white/40">Achievement</span>
      </div>

      <h1 className="text-2xl md:text-5xl font-black text-white text-center mb-6 md:mb-12 uppercase tracking-tight">
        Certificate of Excellence
      </h1>

      <p className="text-white/40 text-[10px] md:text-lg uppercase tracking-[0.2em] font-medium mb-2 md:mb-4">This is awarded to</p>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4 md:mb-6" />
      <div className="flex flex-col items-center gap-1 mb-4 md:mb-6">
        <h2 className="text-3xl md:text-6xl font-black text-white capitalize px-4 text-center">
          {userName}
        </h2>
        {email && (
          <p className="text-[10px] md:text-sm font-medium text-white/40 lowercase tracking-wider">
            {email}
          </p>
        )}
      </div>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6 md:mb-12" />

      <p className="text-sm md:text-xl text-white/60 text-center max-w-lg mb-6 md:mb-12 leading-relaxed font-medium capitalize">
        For outstanding proficiency and mastery in <br/>
        <span className="text-amber-500 font-black text-lg md:text-2xl uppercase tracking-widest">{achievementTitle}</span>
      </p>

      <div className="mt-auto w-full flex justify-between items-end border-t border-white/5 pt-4 md:pt-8">
        <div className="flex flex-col gap-0.5 md:gap-1 text-left">
          <p className="text-[6px] md:text-[10px] font-black uppercase text-white/20 tracking-[0.2em]">Verification ID</p>
          <p className="text-[8px] md:text-xs font-mono text-white/40">CODEFORE-7KF9A2Z1S</p>
        </div>
        
        <div className="flex flex-col items-center gap-1 md:gap-2">
           <div className="w-16 md:w-32 h-px bg-white/20 mb-1 md:mb-2" />
           <p className="text-[6px] md:text-xs font-bold uppercase tracking-widest text-white/50">Instructional Lead</p>
        </div>

        <div className="flex flex-col items-end gap-0.5 md:gap-1 text-right">
          <p className="text-[6px] md:text-[10px] font-black uppercase text-white/20 tracking-[0.2em]">Issued Date</p>
          <p className="text-[8px] md:text-xs font-bold text-white/40">{date}</p>
        </div>
      </div>
    </div>
  </div>
));

const CertificatePreviewModal = ({ isOpen, onClose, userName, email, achievementTitle, onDownload, isGenerating }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-2xl bg-black/80"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-4xl flex flex-col gap-6"
          onClick={(e) => e.stopPropagation()}
        >
          <CertificateTemplate 
            userName={userName}
            email={email}
            achievementTitle={achievementTitle}
            date={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            isPreview={true}
          />

          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
            >
              Close
            </button>
            <button
              onClick={onDownload}
              disabled={isGenerating}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? 'Generating PDF...' : 'Download PDF Certificate'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const SkillBadge = ({ data, account, onGenerate, isGenerating, displayName }) => {
  if (!data) return null;

  return (
    <div className="flex flex-col items-center justify-center h-full py-1 gap-2">
      <motion.div
        animate={{ 
          y: [0, -8, 0],
          rotate: [0, 4, -4, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="relative group shrink-0"
      >
        <div className="absolute inset-0 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity bg-amber-500 rounded-full" />
        
        <div className="relative bg-white/[0.03] backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-500">
           <Trophy className="w-14 h-14 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]" />
        </div>
      </motion.div>

      <div className="text-center px-2 flex flex-col items-center gap-2 w-full text-balance">
        <div>
          <p className="text-white/30 text-[8px] font-black uppercase tracking-[0.3em] mb-1">
            {displayName}'s Mastery
          </p>
          {account?.email && (
            <p className="text-[7px] text-white/20 font-medium mb-2 truncate max-w-[120px]">
              {account.email}
            </p>
          )}
          <div className="inline-block px-3 py-1 rounded-lg bg-amber-500/5 border border-amber-500/20 max-w-[140px]">
            <p className="text-[9px] font-bold text-amber-500/60 italic leading-tight">"{data.judge_note}"</p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onGenerate();
          }}
          disabled={isGenerating}
          className="mt-3 flex items-center gap-3 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-[12px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/40 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <Award className="w-4 h-4" />
          {isGenerating ? 'Generating...' : 'Generate Certificate'}
        </button>
      </div>
    </div>
  );
};

const SmartRevision = ({ flashcards }) => {
  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white/60">
        <p>No flashcards available yet. Keep solving problems to generate personalized revision cards!</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ScrollStack
        itemDistance={50}
        itemScale={0.05}
        itemStackDistance={20}
        stackPosition="30%"
        scaleEndPosition="15%"
        baseScale={0.9}
        blurAmount={2}
        useWindowScroll={false}
      >
        {flashcards.map((card, index) => (
          <ScrollStackItem
            key={index}
            itemClassName="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/20"
          >
            <div className="flex flex-col justify-between h-full">
              <div>
                <h4 className="text-xl font-bold text-white mb-4">{card.topic}</h4>
                <p className="text-white/80 text-lg leading-relaxed">{card.concept}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <span className="text-sm text-white/50">Card {index + 1} of {flashcards.length}</span>
              </div>
            </div>
          </ScrollStackItem>
        ))}
      </ScrollStack>
    </div>
  );
};


const generateDynamicInsight = (blockId, data) => {
  if (!data) return null;

  switch (blockId) {
    case 'overall-learning-progress': {
      const isAhead = data.dailyGoalProgress > 70;
      const velocityDesc = data.overallProgress > 75 ? "Exceptional" : data.overallProgress > 50 ? "Healthy" : "Developing";
      return {
        summary: `Your learning velocity is ${velocityDesc} (${data.overallProgress}% overall).`,
        analytics: `Solution rate: ${data.problemsSolved}/${data.totalProblems} objectives met. You've sustained a 🔥 ${data.streak}-day streak, with today's daily goal at ${data.dailyGoalProgress}% completion.`,
        advice: isAhead 
          ? "You're outperforming your daily quota. Use this momentum to revisit 2 'Hard' problems from last week for better retention." 
          : "You're close to your daily milestone! Solve just 2 more problems to maintain your current 🔥 streak trajectory."
      };
    }
    case 'topic-wise-performance': {
      const sorted = [...(data.topicPerformance || [])].sort((a, b) => b.score - a.score);
      const focusAreas = sorted.filter(t => t.score < 50);
      const strongest = sorted[0];
      
      let analyticsText = sorted.map(t => `${t.name}: ${t.score}%`).join(' | ');
      
      return {
        summary: `Mastery in ${strongest.name}, identified ${focusAreas.length} focus areas.`,
        analytics: `Full Profile Breakdown: ${analyticsText}. Your proficiency in ${strongest.name} is top-tier, but DP concepts need immediate reinforcement.`,
        advice: focusAreas.length > 0 
          ? `Priority shift recommended: Dedicate your next session exclusively to ${focusAreas[0].name} to balance your skill-set.`
          : "Your topic balance is excellent. Consider exploring 'System Design' or 'Advanced Graph' topics next."
      };
    }
    case 'hint-&-struggle-analysis': {
      const exhaustRate = ((data.hintAnalysis.hintsExhausted / data.problemsSolved) * 100).toFixed(0);
      const hintType = data.hintAnalysis.avgHintLevel > 3 ? "Implementation" : data.hintAnalysis.avgHintLevel > 1.5 ? "Directional" : "Conceptual";
      
      return {
        summary: `${data.hintAnalysis.dependency} dependency on ${hintType} assistance.`,
        analytics: `You typically require hints at Level ${data.hintAnalysis.avgHintLevel}. Notably, ${exhaustRate}% of your solves required fully exhausting all available help resources.`,
        advice: data.hintAnalysis.avgHintLevel > 3
          ? "You're relying heavily on code-snippets. Try solving the next 3 problems by only using 'Logic-only' hints to build mental stamina."
          : "Your hint usage is strategic. You're effectively using conceptual pointers to unblock yourself without skipping the logic."
      };
    }
    case 'stuck-&-hesitation-insights': {
      const trend = data.stuckInsights.trend;
      const recent = trend[trend.length - 1];
      const avg = trend.reduce((a, b) => a + b, 0) / trend.length;
      const isImproving = recent < avg;
      
      return {
        summary: `Hesitation intensity is ${isImproving ? 'decreasing' : 'peaking'}.`,
        analytics: `Current Stuck Score: ${recent} (Avg: ${avg.toFixed(0)}). You encountered ${data.stuckInsights.highStuckEvents} critical stall events where hesitation exceeded 15 minutes.`,
        advice: isImproving 
          ? "You're getting faster at translating logic to code! Keep practicing 'Dry Runs' to reduce implementation stalls further."
          : "Analysis reveals frequent stalls during the 'Implementation' phase. Try writing detailed pseudo-code before your next solution attempt."
      };
    }
    case 'skill-achievement-badge': {
      return {
        summary: `System Award: ${data.achievement.title}`,
        analytics: `Internal Evaluation: "${data.achievement.judge_note}". This award is based on your consistent solve-to-hint ratio and recent ${data.streak}-day engagement streak.`,
        advice: `To upgrade this to the 'Elite Architect' status, maintain your ${data.streak}-day streak for 4 more days and solve 5 'Medium' problems with zero help.`
      };
    }
    default:
      return null;
  }
};

const DetailModal = ({ isOpen, onClose, blockId, dashboardData, onGenerate, isGenerating }) => {
  if (!isOpen || !dashboardData) return null;

  const data = generateDynamicInsight(blockId, dashboardData);
  if (!data) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[3rem] border border-white/20 bg-white/[0.03] p-10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-2">
              <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em]">Deep Dive Analysis</span>
              <h2 className="text-4xl font-black text-white tracking-widest uppercase">{blockId.replace(/-/g, ' ')}</h2>
            </header>

            <div className="space-y-8">
              <section className="bg-white/5 rounded-3xl p-6 border border-white/10 group hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-500/20 rounded-xl">
                    <Info className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-black text-white/80 uppercase tracking-widest">Summary</h3>
                </div>
                <p className="text-white/60 leading-relaxed font-medium">{data.summary}</p>
              </section>

              <section className="bg-white/5 rounded-3xl p-6 border border-white/10 group hover:border-emerald-500/30 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-500/20 rounded-xl">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-black text-white/80 uppercase tracking-widest">Analytics</h3>
                </div>
                <p className="text-white/60 leading-relaxed font-medium">{data.analytics}</p>
              </section>

              <section className="bg-white/5 rounded-3xl p-6 border border-white/10 group hover:border-amber-500/30 transition-all relative overflow-hidden">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-500/20 rounded-xl">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-black text-white/80 uppercase tracking-widest">AI Suggestion</h3>
                </div>
                <p className="text-white/60 leading-relaxed font-medium italic mb-6">"{data.advice}"</p>
                
                {blockId === 'skill-achievement-badge' && (
                  <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-amber-500/30 flex items-center justify-center gap-3 group"
                  >
                     <Award className="w-5 h-5" />
                     {isGenerating ? 'Processing...' : 'Generate Certificate Now'}
                  </button>
                )}
              </section>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

function Protected() {
  const [account, setAccount] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const certificateRef = React.useRef(null);

  const displayName = React.useMemo(() => {
    if (account?.name && !account.name.startsWith('custom_')) return account.name;
    if (account?.username) return account.username;
    if (!account) return "Learner"; // Fallback for initial load
    // Generate a stable random ID for this session if no name exists
    return `USER-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }, [account]);

  const [dashboardData, setDashboardData] = useState({
    overallProgress: 62,
    problemsSolved: 48,
    totalProblems: 78,
    streak: 6,
    dailyGoalProgress: 75,
    topicPerformance: [
      { name: "Binary Search", score: 80 },
      { name: "Arrays", score: 60 },
      { name: "Dynamic Prog", score: 40 }
    ],
    hintAnalysis: {
      avgHintLevel: 2.6,
      maxHintLevel: 4,
      hintsExhausted: 4,
      dependency: "High"
    },
    stuckInsights: {
       avgStuckScore: 63,
       highStuckEvents: 5,
       alerts: ["Frequent hesitation detected"],
       trend: [45, 52, 48, 70, 63, 58, 63]
    },
    achievement: {
      title: "Data Structure Ace",
      icon: "Trophy",
      judge_note: "Exceptional logic in Binary Search"
    },
    detailedExplanations: {}
  });

  const handleDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    try {
      await new Promise(r => setTimeout(r, 500));
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0a0a0c'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [800, 600]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 800, 600);
      pdf.save(`CODEFORE_Certificate_${displayName.replace(/\s+/g, '_')}.pdf`);
      setIsPreviewOpen(false);
    } catch (error) {
      console.error("Certificate generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("faceAuth")) {
      navigate("/login");
      return;
    }

    const { account: storedAccount } = JSON.parse(localStorage.getItem("faceAuth"));
    setAccount(storedAccount);
    
    if (storedAccount?.id) {
       getUserDashboard(storedAccount.id)
         .then(data => setDashboardData(data))
         .catch(err => {
            console.warn("Backend data unavailable, generating random fallback values...", err);
            // Generating random values as requested
            const randomProgress = Math.floor(Math.random() * 30) + 50; 
            const randomSolved = Math.floor(Math.random() * 20) + 40; 
            const randomStreak = Math.floor(Math.random() * 10) + 2;
            const badges = [
              { title: "Data Structure Ace", note: "Exceptional logic in problem solving" },
              { title: "Consistency Master", note: "Powerful daily learning momentum" },
              { title: "Analytical Thinker", note: "Optimized hint usage patterns" }
            ];
            const randomBadge = badges[Math.floor(Math.random() * badges.length)];

            setDashboardData({
              overallProgress: randomProgress,
              problemsSolved: randomSolved,
              totalProblems: 80,
              streak: randomStreak,
              dailyGoalProgress: Math.floor(Math.random() * 40) + 50,
              topicPerformance: [
                { name: "Binary Search", score: Math.floor(Math.random() * 30) + 60 },
                { name: "Arrays", score: Math.floor(Math.random() * 40) + 40 },
                { name: "Dynamic Prog", score: Math.floor(Math.random() * 50) + 20 }
              ],
              hintAnalysis: {
                avgHintLevel: (Math.random() * 2 + 1.5).toFixed(1),
                maxHintLevel: 4,
                hintsExhausted: Math.floor(Math.random() * 5) + 2,
                dependency: Math.random() > 0.5 ? "High" : "Medium"
              },
              stuckInsights: {
                avgStuckScore: Math.floor(Math.random() * 40) + 40,
                highStuckEvents: Math.floor(Math.random() * 6) + 1,
                alerts: [Math.random() > 0.5 ? "Frequent hesitation detected" : "Slow problem start"],
                trend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 30)
              },
              achievement: {
                title: randomBadge.title,
                icon: "Trophy",
                judge_note: randomBadge.note
              },
              detailedExplanations: {
                "overall-learning-progress": {
                  summary: "Your learning velocity is optimized.",
                  analytics: "Consistent performance across all metrics.",
                  advice: "Target tougher problems next session."
                },
                "topic-wise-performance": {
                  summary: "Technical proficiency is high.",
                  analytics: "Topic mastery is growing steadily.",
                  advice: "Deep dive into DP sub-problems."
                },
                "hint-&-struggle-analysis": {
                  summary: "Struggle handling is effective.",
                  analytics: "Balanced use of hints.",
                  advice: "Try zero-hint sessions."
                },
                "stuck-&-hesitation-insights": {
                  summary: "Flow state detected.",
                  analytics: "Minor hesitation in implementation.",
                  advice: "Practice syntax speed-runs."
                },
                "skill-achievement-badge": {
                  summary: "Top-tier achievement unlocked.",
                  analytics: "Metrics exceed system benchmarks.",
                  advice: "Unlocked next curriculum level."
                }
              }
            });
         });
    }
  }, [navigate]);

  if (!account) {
    return null;
  }

  const features = [
    {
      id: 'overall-learning-progress',
      customContent: (
        <div className="flex flex-col md:flex-row items-center justify-around gap-6 h-full px-4 py-2">
          {/* Section 1: Optimized Progress Ring */}
          <div className="flex flex-col items-center gap-3 group flex-shrink-0">
            <div className="relative transform transition-all duration-700 group-hover:scale-105">
               <ProgressCircle percentage={dashboardData.overallProgress} size={170} />
            </div>
            <span className="text-white/50 text-[9px] font-black uppercase tracking-[0.3em] text-center">Velocity</span>
          </div>

          {/* Section 2: Balanced KPI Cards */}
          <div className="flex flex-col gap-3 w-full max-w-[300px]">
            <div className="group bg-white/[0.02] backdrop-blur-3xl rounded-3xl p-4 border border-white/5 hover:border-white/20 transition-all duration-500 shadow-xl relative overflow-hidden">
              <div className="absolute -top-2 -right-2 p-3 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:bg-indigo-500/20 transition-colors">
                  <CheckCircle className="w-7 h-7 text-indigo-400/80" />
                </div>
                <div>
                  <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest mb-0.5">Problems Solved</p>
                  <p className="text-2xl font-black text-white tracking-tighter">
                    {dashboardData.problemsSolved} <span className="text-white/10 font-normal text-lg">/</span> {dashboardData.totalProblems}
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-white/[0.02] backdrop-blur-3xl rounded-3xl p-4 border border-white/5 hover:border-white/20 transition-all duration-500 shadow-xl relative overflow-hidden">
              <div className="absolute -top-2 -right-2 p-3 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <Flame className="w-16 h-16 text-white" />
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-orange-500/10 rounded-2xl group-hover:bg-orange-500/20 transition-colors">
                  <Flame className="w-7 h-7 text-orange-400/80" />
                </div>
                <div>
                  <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest mb-0.5">Current Streak</p>
                  <p className="text-2xl font-black text-white tracking-tighter">
                    🔥 {dashboardData.streak} <span className="text-white/10 font-normal text-lg ml-0.5 uppercase">Days</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      title: 'Overall Learning Progress',
      className: 'md:col-span-4',
      gradientFrom: 'from-indigo-600/60',
      gradientTo: 'to-purple-600/30',
    },
    {
      id: 'topic-wise-performance',
      customContent: <TopicPerformance topics={dashboardData.topicPerformance} />,
      title: 'Topic-Wise Performance',
      className: 'md:col-span-2',
      gradientFrom: 'from-emerald-500/60',
      gradientTo: 'to-teal-400/30',
    },
    {
      id: 'hint-&-struggle-analysis',
      customContent: <HintAnalysis data={dashboardData.hintAnalysis} />,
      title: 'Hint & Struggle Analysis',
      className: 'md:col-span-2',
      gradientFrom: 'from-violet-600/60',
      gradientTo: 'to-fuchsia-500/30',
    },
    {
      id: 'stuck-&-hesitation-insights',
      customContent: <StuckInsights data={dashboardData.stuckInsights} />,
      title: 'Stuck & Hesitation Insights',
      className: 'md:col-span-2',
      gradientFrom: 'from-rose-600/60',
      gradientTo: 'to-orange-500/30',
    },
    {
      id: 'skill-achievement-badge',
      customContent: (
        <SkillBadge 
          data={dashboardData.achievement} 
          account={account} 
          onGenerate={() => setIsPreviewOpen(true)}
          isGenerating={isGenerating}
          displayName={displayName}
        />
      ),
      title: 'Skill Achievement Badge',
      className: 'md:col-span-2',
      gradientFrom: 'from-amber-600/60',
      gradientTo: 'to-yellow-500/30',
    },
  ];



  return (
    <ProtectedLayout account={account}>
      {/* Hidden Template for PDF Capture */}
      <CertificateTemplate 
        ref={certificateRef}
        userName={displayName}
        email={account?.email}
        achievementTitle={dashboardData.achievement.title}
        date={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      />

      {/* Visual Preview Modal */}
      <CertificatePreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        userName={displayName}
        email={account?.email}
        achievementTitle={dashboardData.achievement.title}
        onDownload={handleDownload}
        isGenerating={isGenerating}
      />
      
      <div className="relative w-full h-full min-h-[80vh] flex flex-col items-center">
        <AuroraBackground />
        
        <div className="relative z-10 w-full mx-auto px-6 py-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent pb-2">
              {displayName}'s Dashboard
            </h1>
            <div className="mt-4 flex flex-col items-center gap-1">
              <p className="text-lg text-gray-400 font-medium capitalize">
                Welcome back, {displayName}!
              </p>
              {account?.email && (
                <p className="text-sm text-indigo-400/60 font-mono tracking-tight">
                  {account.email}
                </p>
              )}
            </div>
          </div>

          <BentoGrid>
            {features.map((feature, i) => (
              <BentoGridItem
                key={i}
                className={`${feature.className} cursor-pointer hover:ring-2 hover:ring-white/20 transition-all`}
                gradientFrom={feature.gradientFrom}
                gradientTo={feature.gradientTo}
                onClick={() => setSelectedBlock(feature.id)}
              >
                {feature.customContent ? (
                  <div className="flex flex-col h-full">
                    <h3 className="text-2xl font-black text-white mb-6 tracking-tight uppercase tracking-widest opacity-80">
                      {feature.title}
                    </h3>
                    <div className="flex-grow">
                      {feature.customContent}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">{feature.icon}</div>
                    <div className="flex flex-col flex-grow text-left">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-100 text-sm flex-grow opacity-90 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </>
                )}
              </BentoGridItem>
            ))}
          </BentoGrid>
        </div>
      </div>

      {/* Detailed Analysis Modal */}
      <DetailModal 
        isOpen={!!selectedBlock}
        onClose={() => setSelectedBlock(null)}
        blockId={selectedBlock || ''}
        dashboardData={dashboardData}
        onGenerate={() => setIsPreviewOpen(true)}
        isGenerating={isGenerating}
      />
    </ProtectedLayout>
  );
}

export default Protected;
