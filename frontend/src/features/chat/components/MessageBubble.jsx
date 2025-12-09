import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MessageBubble.css';

function MessageBubble({ message, formatTime, onImageClick }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`message-row ${message.role}`}>
      <div className="message-container">
        {!isUser && (
          <div className="message-header">
            <div className="message-avatar">
              ✈️
            </div>
            <span className="message-role">
              Aircraft Assistant
            </span>
            <span className="message-time">
              {formatTime(message.created_at)}
            </span>
          </div>
        )}
        
        <div className="message-content">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom renderers for better styling
              code({node, inline, className, children, ...props}) {
                return inline ? (
                  <code className="inline-code" {...props}>
                    {children}
                  </code>
                ) : (
                  <pre className="code-block">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
              a({node, children, ...props}) {
                return (
                  <a {...props} target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
          
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
          
          {isUser && (
            <div className="message-time-bottom">
              {formatTime(message.created_at)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
