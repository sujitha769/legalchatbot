
import { useState } from "react";
import VoiceAssistant from "./VoiceAssistant";

const ChatInput = ({ onSend, voiceEnabled = true, onOpenFIRDrafter }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  const handleVoiceTranscript = (transcript) => {
    // Auto-send voice transcript
    if (transcript.trim()) {
      onSend(transcript);
    }
  };

  return (
    <div className="chat-input-container">
      {voiceEnabled && (
        <VoiceAssistant 
          onTranscript={handleVoiceTranscript}
          isEnabled={voiceEnabled}
          onOpenFIRDrafter={onOpenFIRDrafter}
        />
      )}
      
      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Describe your legal question or press mic to speak..."
        />
        <button onClick={handleSend} disabled={!text.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInput;