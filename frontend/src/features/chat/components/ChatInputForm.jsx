import { useRef, useEffect } from 'react';
import useVoiceRecognition from '../hooks/useVoiceRecognition';
import './ChatInputForm.css';

function ChatInputForm({ 
  inputMessage, 
  setInputMessage, 
  sending, 
  selectedImage,
  imagePreview,
  onImageSelect,
  onRemoveImage,
  onSend 
}) {
  const fileInputRef = useRef(null);
  const {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceRecognition();

  // Debug: Log voice support status
  useEffect(() => {
    console.log('Voice Recognition Support:', isSupported);
    console.log('SpeechRecognition available:', !!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, [isSupported]);

  // Auto-populate input and send when transcript is ready
  useEffect(() => {
    if (transcript && !isListening) {
      console.log('Transcript received:', transcript);
      setInputMessage(transcript);
      resetTranscript();
      
      // Auto-send after a short delay
      setTimeout(() => {
        const syntheticEvent = { preventDefault: () => {} };
        onSend(syntheticEvent);
      }, 500);
    }
  }, [transcript, isListening, setInputMessage, onSend, resetTranscript]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(e);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(e);
    }
  };

  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="input-container">
      {/* Image preview */}
      {imagePreview && (
        <div className="image-preview-container">
          <img src={imagePreview} alt="Preview" className="image-preview" />
          <button 
            type="button"
            className="remove-image-button"
            onClick={onRemoveImage}
            aria-label="Eliminar imagen"
          >
            ❌
          </button>
        </div>
      )}
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="input-form">
        {/* Image upload button */}
        <button
          type="button"
          className="attach-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
          aria-label="Adjuntar imagen"
        >
          +
        </button>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={onImageSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />

        <div className="input-wrapper">
          <textarea
            className="message-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Escuchando..." : "Escribe un mensaje..."}
            disabled={sending || isListening}
            rows={1}
          />
          
          {/* Voice button - only show if supported */}
          {isSupported && (
            <button
              type="button"
              className={`voice-button ${isListening ? 'listening' : ''}`}
              onClick={handleVoiceClick}
              disabled={sending}
              aria-label={isListening ? "Detener grabación" : "Grabar mensaje de voz"}
              title={isSupported ? (isListening ? "Detener grabación" : "Grabar mensaje de voz") : "Tu navegador no soporta reconocimiento de voz"}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
          )}
          
          <button
            type="submit"
            className="send-button"
            disabled={sending || (!inputMessage.trim() && !selectedImage)}
            aria-label="Enviar mensaje"
          >
            ➤
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatInputForm;
