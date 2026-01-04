"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";
import NumberFlow from "@number-flow/react";
import { BarChart, Brain, CheckCheck, Clock, Star, TrendingUp, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    description:
      "Great for students looking to improve their basics",
    price: 0,
    yearlyPrice: 2499,
    buttonText: "Get started",
    buttonVariant: "outline",
    features: [
      { text: "Hint levels 1–2", icon: <Zap size={20} /> },
      { text: "Limited doubts/day", icon: <Clock size={20} /> },
      { text: "Progress tracking", icon: <TrendingUp size={20} /> },
    ],
    yearlyFeatures: [
      { text: "Hint levels 1–2", icon: <Zap size={20} /> },
      { text: "Limited doubts/day", icon: <Clock size={20} /> },
      { text: "Progress tracking", icon: <TrendingUp size={20} /> },
    ],
  },
  {
    name: "Premium",
    description:
      "Best value for serious learners aiming for top grades",
    price: 499,
    yearlyPrice: 4499,
    buttonText: "Get started",
    buttonVariant: "default",
    popular: true,
    features: [
      { text: "Deep hints (levels 3–4)", icon: <Zap size={20} /> },
      { text: "AI reasoning explanations", icon: <Brain size={20} /> },
      { text: "Mistake analytics", icon: <BarChart size={20} /> },
      { text: "Mentor priority", icon: <Star size={20} /> },
    ],
    yearlyFeatures: [
      { text: "Deep hints (levels 3–4)", icon: <Zap size={20} /> },
      { text: "AI reasoning explanations", icon: <Brain size={20} /> },
      { text: "Mistake analytics", icon: <BarChart size={20} /> },
      { text: "Mentor priority", icon: <Star size={20} /> },
    ],
  },
];

const PricingSwitch = ({ 
  isYearly, 
  onSwitch 
}) => {
  return (
    <div className="flex justify-center">
      <button
        onClick={onSwitch}
        className="relative z-50 mx-auto flex w-fit rounded-full bg-neutral-50 border border-gray-200 p-1 cursor-pointer"
      >
        <div
          className={`relative z-10 w-fit sm:h-12 h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors duration-200 flex items-center justify-center ${
            !isYearly
              ? "text-white"
              : "text-muted-foreground hover:text-black"
          }`}
        >
          {!isYearly && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 sm:h-12 h-10 w-full rounded-full border-4 shadow-sm shadow-blue-600 border-blue-600 bg-gradient-to-t from-blue-500 via-blue-400 to-blue-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monthly</span>
        </div>

        <div
          className={`relative z-10 w-fit sm:h-12 h-10 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors duration-200 flex items-center justify-center ${
            isYearly
              ? "text-white"
              : "text-muted-foreground hover:text-black"
          }`}
        >
          {isYearly && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 sm:h-12 h-10 w-full rounded-full border-4 shadow-sm shadow-blue-600 border-blue-600 bg-gradient-to-t from-blue-500 via-blue-400 to-blue-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            Yearly
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-black">
              Save 20%
            </span>
          </span>
        </div>
      </button>
    </div>
  );
};

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const pricingRef = useRef(null);

  const revealVariants = {
    visible: (i) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const togglePricingPeriod = () => setIsYearly(!isYearly);

  const navigate = useNavigate();

  const handlePayment = (planName) => {
    // If it's the free/starter plan, navigate to signup
    if (planName === "Starter") {
      navigate('/signup');
    } else {
      // For premium plans, show payment success modal
      setShowPaymentSuccess(true);
      setTimeout(() => setShowPaymentSuccess(false), 3000);
    }
  };

  return (
    <div
      id="pricing"
      className="px-4 pt-40 h-screen mx-auto relative flex flex-col justify-center"
      ref={pricingRef}
    >
      <div className="text-center mb-6 max-w-3xl mx-auto">
        <TimelineContent
          as="h2"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="md:text-7xl sm:text-5xl text-4xl font-medium text-gray-900 mb-6"
        >
          Plans that works best for your{" "}
          <TimelineContent
            as="span"
            animationNum={1}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="border border-dashed border-blue-500 px-3 py-2 rounded-xl bg-blue-100 capitalize inline-block"
          >
            education
          </TimelineContent>
        </TimelineContent>

        <TimelineContent
          as="p"
          animationNum={2}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="sm:text-xl text-lg text-gray-600 sm:w-[70%] w-[80%] mx-auto"
        >
          Trusted by millions, We help teams all around the world, Explore which
          option is right for you.
        </TimelineContent>
      </div>

      <TimelineContent
        as="div"
        animationNum={3}
        timelineRef={pricingRef}
        customVariants={revealVariants}
      >
        <PricingSwitch isYearly={isYearly} onSwitch={togglePricingPeriod} />
      </TimelineContent>

      <AnimatePresence>
        {showPaymentSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPaymentSuccess(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full mx-4 text-center relative"
            >
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCheck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h3>
              <p className="text-gray-600 mb-6">
                Thank you for your purchase. Your plan has been upgraded.
              </p>
              <button
                onClick={() => setShowPaymentSuccess(false)}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 max-w-7xl gap-8 py-8 mx-auto">
        {plans.map((plan, index) => (
          <TimelineContent
            key={plan.name}
            as="div"
            animationNum={4 + index}
            timelineRef={pricingRef}
            customVariants={revealVariants}
          >
            <Card
              className={`relative border-neutral-200 min-h-full flex flex-col ${
                plan.popular ? "ring-2 ring-blue-500 bg-blue-50" : "bg-white "
              }`}
            >
              <CardHeader className="text-left">
                <div className="flex justify-between">
                  <h3 className="text-6xl font-semibold text-gray-900 mb-6">
                    {plan.name === "Starter" && !isYearly ? "Free" : plan.name}
                  </h3>
                  {plan.popular && (
                    <div className="">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Popular
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xl text-gray-600 mb-8">{plan.description}</p>
                <div className="flex items-baseline">
                  <span className="text-7xl font-semibold text-gray-900">
                    ₹
                    <NumberFlow
                      value={isYearly ? plan.yearlyPrice : plan.price}
                      className="text-7xl font-semibold"
                    />
                  </span>
                  <span className="text-gray-600 ml-2 text-2xl">
                    /{isYearly ? "year" : "month"}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="pt-0 flex-1 flex flex-col">
                <button
                  onClick={() => handlePayment(plan.name)}
                  className={`w-full mb-10 p-8 text-3xl rounded-xl ${
                    plan.popular
                      ? "bg-gradient-to-t from-blue-500 to-blue-600  shadow-lg shadow-blue-500 border border-blue-400 text-white"
                      : plan.buttonVariant === "outline"
                      ? "bg-gradient-to-t from-neutral-900 to-neutral-600  shadow-lg shadow-neutral-900 border border-neutral-700 text-white"
                      : ""
                  }`}
                >
                  {plan.buttonText}
                </button>
                <ul className="space-y-5 font-semibold py-8">
                  {(isYearly ? plan.yearlyFeatures : plan.features).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <span className="text-neutral-800 grid place-content-center mt-0.5 mr-3">
                        {feature.icon}
                      </span>
                      <span className="text-lg text-gray-600">
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>
    </div>
  );
}