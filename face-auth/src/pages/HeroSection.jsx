import React from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Floating animated SVG paths
function FloatingPaths({ position }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      <svg
        className="w-full h-full text-slate-800"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.02}
            initial={{ pathLength: 0.3, opacity: 0.4 }}
            animate={{
              pathLength: 1,
              opacity: [0.2, 0.5, 0.2],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function HeroSection({
  title = "ThinkStep",
  description = "An Agentic, Step-Level Learning Intelligence Platform",
  colors = ["#72b9bb", "#b5d9d9", "#ffd1bd", "#ffebe0", "#8cc5b8", "#dbf4a4"],
  distortion = 0.8,
  swirl = 0.6,
  speed = 0.42,
  offsetX = 0.08,
  className = "",
  veilOpacity = "bg-white/20",
  children,
}) {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () =>
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const words = title.split(" ");

  return (
    <section
      id="home"
      className={`relative w-full min-h-screen overflow-hidden bg-background flex items-center justify-center ${className}`}
    >
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 w-screen h-screen">
        {mounted && (
          <>
            <MeshGradient
              width={dimensions.width}
              height={dimensions.height}
              colors={colors}
              distortion={distortion}
              swirl={swirl}
              grainMixer={0}
              grainOverlay={0}
              speed={speed}
              offsetX={offsetX}
            />
            <div className={`absolute inset-0 pointer-events-none ${veilOpacity}`} />
          </>
        )}
      </div>

      {/* Animated SVG Paths */}
      <div className="absolute inset-0 z-10">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Content */}
      <div className="relative z-30 container mx-auto px-4 md:px-6 text-center">
        {children ? (
          children
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="max-w-5xl mx-auto"
          >
            {/* Animated Title */}
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-8 tracking-tighter">
              {words.map((word, wordIndex) => (
                <span
                  key={wordIndex}
                  className="inline-block mr-4 last:mr-0"
                >
                  {word.split("").map((letter, letterIndex) => (
                    <motion.span
                      key={`${wordIndex}-${letterIndex}`}
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        delay: wordIndex * 0.1 + letterIndex * 0.03,
                        type: "spring",
                        stiffness: 150,
                        damping: 25,
                      }}
                      className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </span>
              ))}
            </h1>

            {/* Animated Description */}
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-xl sm:text-2xl md:text-3xl text-gray-700 max-w-2xl mx-auto leading-relaxed"
            >
              {description}
            </motion.p>
          </motion.div>
        )}
      </div>
    </section>
  );
}