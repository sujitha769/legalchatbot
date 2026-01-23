import { useState, useEffect, useRef } from 'react';

// SVG Icons as components
const MicIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
);

const MicOffIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" x2="22" y1="2" y2="22"/>
    <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/>
    <path d="M5 10v2a7 7 0 0 0 12 5"/>
    <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12"/>
    <line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
);

const Volume2Icon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
  </svg>
);

const VolumeXIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <line x1="22" x2="16" y1="9" y2="15"/>
    <line x1="16" x2="22" y1="9" y2="15"/>
  </svg>
);

const VoiceAssistant = ({ onTranscript, isEnabled = true, onOpenFIRDrafter }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [error, setError] = useState('');
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!isEnabled) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      
      setTranscript(transcriptText);
      
      if (event.results[current].isFinal) {
        onTranscript(transcriptText);
        setTranscript('');
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isEnabled, onTranscript]);

  // Toggle listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Stop any ongoing speech
      synthRef.current.cancel();
      setIsSpeaking(false);
      
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting recognition:', err);
        setError('Failed to start listening');
      }
    }
  };

  // Speak text function
  const speak = (text) => {
    if (!voiceEnabled || !text) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to use a female voice
    const voices = synthRef.current.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Samantha') ||
      voice.name.includes('Google UK English Female')
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  // Toggle voice output
  const toggleVoice = () => {
    if (voiceEnabled) {
      stopSpeaking();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  // Expose speak function to parent
  useEffect(() => {
    window.legalChatbotSpeak = speak;
    return () => {
      delete window.legalChatbotSpeak;
    };
  }, [voiceEnabled]);

  if (!isEnabled) return null;

  return (
    <div className="voice-assistant-section" style={{
      position: 'relative',
      padding: '16px 20px',
      background: "black",
      borderTop: '1px solid #e8ecef'
    }}>
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Voice Controls - Left Side */}
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <button
            onClick={toggleListening}
            style={{
              background: isListening 
                ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                : 'rgba(255, 255, 255, 0.25)',
              border: isListening ? '2px solid #ff6b81' : '2px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: 'white',
              boxShadow: isListening 
                ? '0 4px 15px rgba(245, 87, 108, 0.5)'
                : '0 2px 8px rgba(0, 0, 0, 0.1)',
              animation: isListening ? 'pulse 1.5s infinite' : 'none'
            }}
            title={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? <MicIcon className="icon" /> : <MicOffIcon className="icon" />}
          </button>

          <button
            onClick={toggleVoice}
            style={{
              background: voiceEnabled 
                ? 'rgba(46, 213, 115, 0.35)' 
                : 'rgba(255, 71, 87, 0.35)',
              border: voiceEnabled 
                ? '2px solid rgba(46, 213, 115, 0.6)' 
                : '2px solid rgba(255, 71, 87, 0.6)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: 'white',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
            title={voiceEnabled ? 'Disable voice responses' : 'Enable voice responses'}
          >
            {voiceEnabled ? <Volume2Icon className="icon" /> : <VolumeXIcon className="icon" />}
          </button>

          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              style={{
                background: 'rgba(255, 107, 129, 0.45)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                color: 'white',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                animation: 'pulse 1s infinite'
              }}
              title="Stop speaking"
            >
              <VolumeXIcon className="icon" />
            </button>
          )}
        </div>

        {/* Draft FIR Button - Right Side */}
        {onOpenFIRDrafter && (
          <button 
            className="fir-drafter-btn" 
            onClick={onOpenFIRDrafter}
            title="Open FIR Drafter"
          >
            📄 Draft FIR
          </button>
        )}
      </div>

      {transcript && (
        <div style={{
          marginTop: '12px',
          padding: '10px 16px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          color: 'white',
          fontSize: '14px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <span style={{ fontWeight: 600, marginRight: '8px' }}>🎤 Listening:</span>
          <span style={{ fontStyle: 'italic' }}>{transcript}</span>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '10px',
          padding: '8px 14px',
          background: 'rgba(255, 71, 87, 0.35)',
          borderRadius: '10px',
          color: 'white',
          fontSize: '13px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          ⚠️ {error}
        </div>
      )}

      {isListening && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none'
        }}>
          <div className="pulse-ring"></div>
          <div className="pulse-ring" style={{ animationDelay: '0.5s' }}></div>
          <div className="pulse-ring" style={{ animationDelay: '1s' }}></div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 15px rgba(245, 87, 108, 0.5);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(245, 87, 108, 0.7);
          }
        }

        .pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          border: 3px solid rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          animation: pulsate 2s ease-out infinite;
        }

        @keyframes pulsate {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.8);
            opacity: 0;
          }
        }

        .voice-assistant-section button:hover {
          transform: scale(1.08);
        }

        .voice-assistant-section button:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
};

export default VoiceAssistant;