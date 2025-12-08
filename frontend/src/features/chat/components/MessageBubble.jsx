import './MessageBubble.css';

function MessageBubble({ message, formatTime, onImageClick }) {
  return (
    <div className={`message ${message.role}`}>
      <div className="message-avatar">
        {message.role === 'user' ? '👤' : '✈️'}
      </div>
      <div className="message-content">
        <p>{message.content}</p>
        {message.has_image && message.image_url && (
          <div className="message-image-container">
            <img 
              src={message.image_url} 
              alt="Imagen adjunta" 
              className="message-image"
              onClick={() => onImageClick(message.image_url)}
              title="Click para ampliar"
            />
          </div>
        )}
        <div className="message-time">
          {formatTime(message.created_at)}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
