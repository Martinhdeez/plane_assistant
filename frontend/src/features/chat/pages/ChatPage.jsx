import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getChat, sendMessage, updateChatTitle } from '../services/chatService';
import { isAuthenticated } from '../../auth/services/authService';
import './ChatPage.css';

function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const messagesEndRef = useRef(null);
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    fetchChat();
  }, [chatId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input when editing starts
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChat = async () => {
    try {
      setLoading(true);
      setError('');
      const chatData = await getChat(chatId);
      setChat(chatData);
      setMessages(chatData.messages || []);
    } catch (err) {
      setError('Error al cargar la conversación');
      console.error('Error fetching chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || sending) {
      return;
    }

    const userMessageContent = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    // Add user message to UI immediately
    const userMessage = {
      role: 'user',
      content: userMessageContent,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Send message and get AI response
      const aiMessage = await sendMessage(chatId, userMessageContent);
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError('Error al enviar el mensaje');
      console.error('Error sending message:', err);
      // Remove user message if failed
      setMessages(prev => prev.slice(0, -1));
      setInputMessage(userMessageContent); // Restore input
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const handleEditTitle = () => {
    setEditedTitle(chat?.title || '');
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (!editedTitle.trim() || editedTitle === chat?.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await updateChatTitle(chatId, editedTitle.trim());
      setChat(prev => ({ ...prev, title: editedTitle.trim() }));
      setIsEditingTitle(false);
    } catch (err) {
      setError('Error al actualizar el título');
      console.error('Error updating title:', err);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingTitle(false);
    setEditedTitle('');
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  if (loading) {
    return (
      <div className="chat-page">
        <div className="loading-chat">
          <div className="loading-spinner"></div>
          <p>Cargando conversación...</p>
        </div>
      </div>
    );
  }

  if (error && !chat) {
    return (
      <div className="chat-page">
        <div className="error-chat">
          <p>{error}</p>
          <Link to="/dashboard" className="back-button">
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div className="container">
          <div className="chat-info">
            {isEditingTitle ? (
              <div className="title-edit-container">
                <input
                  ref={titleInputRef}
                  type="text"
                  className="title-input"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  onBlur={handleSaveTitle}
                  maxLength={200}
                />
              </div>
            ) : (
              <h1 onClick={handleEditTitle} className="chat-title-editable">
                {chat?.title || 'Conversación'}
                <span className="edit-icon">✏️</span>
              </h1>
            )}
          </div>
          <Link to="/dashboard" className="back-button">
            ← Volver
          </Link>
        </div>
      </header>

      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-avatar">
                {message.role === 'user' ? '👤' : '✈️'}
              </div>
              <div className="message-content">
                <p>{message.content}</p>
                <div className="message-time">
                  {formatTime(message.created_at)}
                </div>
              </div>
            </div>
          ))}
          
          {sending && (
            <div className="message assistant">
              <div className="message-avatar">✈️</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="input-container">
        {error && (
          <div className="error-message-dashboard" style={{ marginBottom: 'var(--spacing-sm)' }}>
            {error}
          </div>
        )}
        <form className="input-form" onSubmit={handleSendMessage}>
          <textarea
            className="message-input"
            placeholder="Escribe tu consulta sobre mantenimiento aeronáutico..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            disabled={sending}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={sending || !inputMessage.trim()}
          >
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatPage;
