const MessageBubble = ({ role, text }) => {
  const formatLegalText = (text) => {
    // Split by lines and format
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // Check if it's a heading (contains emoji or all caps section)
      if (line.includes('📋') || /^[A-Z\s]+\([A-Z]+\)/.test(line)) {
        return <h3 key={index} style={{ fontWeight: 'bold', marginTop: '15px', marginBottom: '10px', color: '#1e40af' }}>{line}</h3>;
      }
      
      // Check if it's a field label (Section:, Title:, Punishment:)
      if (line.match(/^(Section|Title|Punishment):/)) {
        const [label, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        return (
          <p key={index} style={{ margin: '5px 0' }}>
            <strong>{label}:</strong> {value}
          </p>
        );
      }
      
      // Regular line
      if (line.trim()) {
        return <p key={index} style={{ margin: '5px 0' }}>{line}</p>;
      }
      
      // Empty line for spacing
      return <br key={index} />;
    });
  };

  return (
    <div className={`message-bubble ${role}`}>
      {role === 'bot' && text.includes('Section:') ? (
        <div style={{ whiteSpace: 'pre-wrap' }}>{formatLegalText(text)}</div>
      ) : (
        <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>
      )}
    </div>
  );
};

export default MessageBubble;