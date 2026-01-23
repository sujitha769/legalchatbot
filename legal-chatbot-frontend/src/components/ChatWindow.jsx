import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { getLegalAnswer } from "../services/api";

const ChatWindow = () => {
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Welcome to Legal Crime Assistant! You can type or use the microphone to ask your legal questions. Click the 📄 button below to draft an FIR."
    }
  ]);

  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = async (userText) => {
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setTyping(true);

    try {
      const reply = await getLegalAnswer(userText);
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
      
      if (window.legalChatbotSpeak) {
        setTimeout(() => {
          window.legalChatbotSpeak(reply);
        }, 300);
      }
    } catch (error) {
      const errorMsg = "Error fetching legal response. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: errorMsg
        }
      ]);
      
      if (window.legalChatbotSpeak) {
        setTimeout(() => {
          window.legalChatbotSpeak(errorMsg);
        }, 300);
      }
    } finally {
      setTyping(false);
    }
  };

  const handleOpenFIRDrafter = () => {
    navigate('/fir-drafter');
  };

  return (
    <div className="chat-window">
      <div className="messages-container">
        {messages.map((msg, index) => (
          <MessageBubble key={index} role={msg.role} text={msg.text} />
        ))}

        {typing && <div className="typing">Analyzing law sections...</div>}

        <div ref={bottomRef} />
      </div>
      
      <ChatInput 
        onSend={handleSend} 
        voiceEnabled={true} 
        onOpenFIRDrafter={handleOpenFIRDrafter}
      />
    </div>
  );
};

export default ChatWindow;