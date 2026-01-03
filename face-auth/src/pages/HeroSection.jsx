import { MeshGradient } from "@paper-design/shaders-react";
import { useEffect, useState } from "react";

export function HeroSection({
  title = "ThinkStep",
  highlightText = "AI",
  description = "An Agentic, Step-Level Learning Intelligence Platform",
  colors = ["#72b9bb", "#b5d9d9", "#ffd1bd", "#ffebe0", "#8cc5b8", "#dbf4a4"],
  distortion = 0.8,
  swirl = 0.6,
  speed = 0.42,
  offsetX = 0.08,
  className = "",
  titleClassName = "",
  descriptionClassName = "",
  maxWidth = "max-w-6xl",
  veilOpacity = "bg-white/20 dark:bg-black/25",
  fontFamily = "Satoshi, sans-serif",
  fontWeight = 500,
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

  return (
    <section
      id="home"
      className={`relative w-full min-h-screen overflow-hidden bg-background flex items-center justify-center ${className}`}
    >
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
            <div
              className={`absolute inset-0 pointer-events-none ${veilOpacity}`}
            />
          </>
        )}
      </div>

      <div className={`relative z-10 ${maxWidth} mx-auto px-6 w-full`}>
        {children ? (
          children
        ) : (
          <div className="text-center">
            <h1
              className={`font-bold text-foreground text-balance text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[110px] leading-tight sm:leading-tight md:leading-tight lg:leading-tight xl:leading-[1.1] mb-6 ${titleClassName}`}
              style={{ fontFamily, fontWeight }}
            >
              {title} <span className="text-primary">{highlightText}</span>
            </h1>
            <p
              className={`text-2xl sm:text-3xl text-white text-pretty max-w-2xl mx-auto leading-relaxed mb-10 px-4 ${descriptionClassName}`}
            >
              {description}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}