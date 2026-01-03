import React from 'react';
import './FeaturesSection.css';
import CardSwap, { Card } from './CardSwap'; // We'll create CardSwap next

const FeaturesSection = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const features = [
    {
      id: 0,
      title: "Live Doubt Resolution",
      icon: "🎓",
      description: "Get clear, step-wise explanations instantly whenever you're stuck.",
      leftTitle: "Ask. Understand. Move Forward.",
      leftDescription: "Students ask doubts and get clear, step-wise explanations instantly.",
      list: [
        "Focuses on concept clarity, not just final answers.",
        "Works smoothly during practice without breaking flow.",
        "Feels like a 24×7 personal tutor."
      ]
    },
    {
      id: 1,
      title: "Guided Problem Solving",
      icon: "💡",
      description: "Problems unlock through progressive hints, not solutions.",
      leftTitle: "Think before you see the answer.",
      leftDescription: "Problems unlock through progressive hints, not solutions.",
      list: [
        "Hint levels adapt to time, attempts, and hesitation.",
        "Prevents copy-based learning.",
        "Builds strong problem-solving skills."
      ]
    },
    {
      id: 2,
      title: "Intelligent Video Learning",
      icon: "🎥",
      description: "Videos appear only when a student is genuinely stuck.",
      leftTitle: "Video help — only when truly needed.",
      leftDescription: "Videos appear only when a student is genuinely stuck.",
      list: [
        "Integrated directly into the learning flow.",
        "Avoids passive binge-watching.",
        "Supports thinking, not shortcuts."
      ]
    },
    {
      id: 3,
      title: "Smart Revision & Flashcards",
      icon: "🧠",
      description: "Flashcards auto-generated for weak concepts.",
      leftTitle: "Revise what matters most.",
      leftDescription: "Flashcards auto-generated for weak concepts.",
      list: [
        "Focused, high-impact revision.",
        "Clean and simple UI.",
        "Improves long-term retention."
      ]
    }
  ];

  const activeFeature = features[activeIndex];
  const [isVisible, setIsVisible] = React.useState(true);

  return (
    <section id="features" className="features-section">
      <div className="features-container">
        <div className="features-header">
          <h2 className="features-title">Amazing Features</h2>
          <p className="features-subtitle">
            Discover what makes our platform stand out from the rest
          </p>
        </div>
        
        <div className="features-content">
          <div className="features-description">
            <div className={`feature-text-wrapper ${isVisible ? 'visible' : 'hidden'}`}>
              <h3>{activeFeature.leftTitle}</h3>
              <p>
                {activeFeature.leftDescription}
              </p>
              <ul className="features-list">
                {activeFeature.list.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="features-cards-wrapper">
            <div className="card-swap-container">
              <CardSwap
                width={900}
                height={650}
                cardDistance={120}
                verticalDistance={130}
                delay={4000}
                pauseOnHover={false}
                onSwapStart={() => setIsVisible(false)}
                onSwap={(newIndex) => {
                   setActiveIndex(newIndex % features.length);
                   setIsVisible(true);
                }}
              >
                {features.map((feature, index) => (
                  <Card key={feature.id} className="feature-card">
                    <div className="card-content">
                      <div className="card-icon">{feature.icon}</div>
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                    </div>
                  </Card>
                ))}
              </CardSwap>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;