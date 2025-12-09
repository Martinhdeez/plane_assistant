import { useRef } from 'react';
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
            placeholder="Escribe un mensaje..."
            disabled={sending}
            rows={1}
          />
          
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
