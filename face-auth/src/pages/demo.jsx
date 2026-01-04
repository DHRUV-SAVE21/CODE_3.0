import { useState, useRef, useEffect } from "react"
import { AIChatInput } from "@/components/ui/ai-chat-input"
import { motion, AnimatePresence } from "motion/react"

const Demo = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = async (value) => {
        setIsLoading(true);
        
        // Add User Message
        const userMsg = { 
            role: 'user', 
            content: value, 
            id: Date.now().toString() 
        };
        setMessages(prev => [...prev, userMsg]);

        // 1. Construct Mock Input
        const inputPayload = {
            event_type: "DOUBT_SUBMITTED",
            user_id: "u123",
            question_id: "q12",
            step_number: 2,
            student_answer: value
        };

        console.log("Input Payload:", JSON.stringify(inputPayload, null, 2));

        // 2. Simulate API Call / Processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 3. Construct Mock Output
        const outputPayload = {
            mode: "AI_ASSISTANCE_MODE",
            explanation: {
                text: "Let’s solve this step-by-step. First, identify the common factor..."
            }
        };

        console.log("Output Payload:", JSON.stringify(outputPayload, null, 2));
        
        // Add AI Message
        const aiMsg = {
            role: 'ai',
            content: outputPayload,
            id: (Date.now() + 1).toString()
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsLoading(false);
    };

    return (
        <div className="flex h-screen w-full flex-col bg-gray-50">
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 flex justify-center">
                <div className="w-full max-w-2xl flex flex-col gap-6 py-4">
                    <AnimatePresence mode="popLayout">
                        {messages.map((msg) => (
                            <motion.div 
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'user' ? (
                                    <div className="bg-black text-white px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[80%]">
                                        <p className="leading-relaxed">{msg.content}</p>
                                    </div>
                                ) : (
                                    <div className="bg-white p-6 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 max-w-[90%] w-full">
                                        <div className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wider">
                                            {msg.content.mode.replace(/_/g, " ")}
                                        </div>
                                        <p className="text-gray-800 leading-relaxed">
                                            {msg.content.explanation.text}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {isLoading && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-500 flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-center">
                <div className="w-full max-w-2xl">
                    <AIChatInput onSubmit={handleSubmit} />
                </div>
            </div>
        </div>
    )
}

export { Demo }