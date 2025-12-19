import './ChatCard.css';

function ChatCard({ chat, onClick, formatDate }) {
  return (
    <div className="chat-card" onClick={() => onClick(chat.id)}>
      <div className="chat-card-header">
        <h3 className="chat-title">{chat.title}</h3>
        <span className="chat-date">{formatDate(chat.created_at)}</span>
      </div>
      <div className="chat-context">
        <span className="context-badge model">{chat.airplane_model}</span>
        <span className="context-badge component">{chat.component_type}</span>
      </div>
      <div className="chat-meta">
        <span className="chat-messages-count">
          {chat.message_count} mensajes
        </span>
        <span className="chat-icon">💬</span>
      </div>
    </div>
  );
}

export default ChatCard;
