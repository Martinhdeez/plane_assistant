import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getChat, sendMessage, updateChatTitle, deleteChat } from '../services/chatService';
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
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const messagesEndRef = useRef(null);
  const titleInputRef = useRef(null);
  const settingsMenuRef = useRef(null);
  const fileInputRef = useRef(null);

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
    // Close settings menu when clicking outside
    function handleClickOutside(event) {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
        setShowSettingsMenu(false);
      }
    }

    if (showSettingsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSettingsMenu]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load authenticated images
  useEffect(() => {
    const loadImages = async () => {
      const token = localStorage.getItem('access_token');
      if (!token || messages.length === 0) return;

      // Find messages that need image loading
      const messagesToUpdate = [];
      
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        // Only load if has image, has URL path, and not already a blob URL
        if (message.has_image && message.image_url && !message.image_url.startsWith('blob:')) {
          console.log('Need to load image for message:', i, message.image_url);
          messagesToUpdate.push({ index: i, message });
        }
      }

      if (messagesToUpdate.length === 0) {
        console.log('No images to load');
        return;
      }

      console.log(`Loading ${messagesToUpdate.length} images...`);

      // Load all images
      const updatedMessages = [...messages];
      
      for (const { index, message } of messagesToUpdate) {
        try {
          // Build full URL - image_url already includes /api/images/
          const imageUrl = message.image_url.startsWith('http') 
            ? message.image_url
            : `http://localhost:8000${message.image_url}`;
          
          console.log('Fetching image from:', imageUrl);
          
          const response = await fetch(imageUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            updatedMessages[index] = { ...message, image_url: blobUrl };
            console.log('Image loaded successfully:', blobUrl);
          } else {
            console.error('Failed to load image:', response.status, response.statusText, imageUrl);
          }
        } catch (error) {
          console.error('Error loading image:', error);
        }
      }

      // Update all messages at once
      setMessages(updatedMessages);
      console.log('All images loaded, messages updated');
    };

    loadImages();
  }, [messages.length]); // Run when messages array length changes

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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('La imagen es demasiado grande (máximo 10MB)');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if ((!inputMessage.trim() && !selectedImage) || sending) {
      return;
    }

    const userMessageContent = inputMessage.trim() || '(Imagen adjunta)';
    const imageToSend = selectedImage;
    
    setInputMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSending(true);

    // Add user message to UI immediately
    const userMessage = {
      role: 'user',
      content: userMessageContent,
      has_image: !!imageToSend,
      image_url: imageToSend ? URL.createObjectURL(imageToSend) : null,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Send message and get AI response
      const response = await sendMessage(chatId, userMessageContent, imageToSend);
      
      // Remove temporary preview URL
      if (userMessage.image_url && userMessage.image_url.startsWith('blob:')) {
        URL.revokeObjectURL(userMessage.image_url);
      }
      
      // Update messages with actual data from server
      setMessages(prev => {
        const withoutTemp = prev.slice(0, -1); // Remove temporary user message
        return [...withoutTemp, response.user_message, response.ai_message];
      });
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

  const handleDeleteChat = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteChat(chatId);
      // Redirect to dashboard after successful deletion
      navigate('/dashboard');
    } catch (err) {
      setError('Error al eliminar la conversación');
      console.error('Error deleting chat:', err);
      setShowSettingsMenu(false);
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
          <div className="chat-header-actions">
            <div className="settings-menu-container" ref={settingsMenuRef}>
              <button 
                className="settings-button"
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                aria-label="Configuración"
              >
                ⚙️
              </button>
              {showSettingsMenu && (
                <div className="settings-dropdown">
                  <button 
                    className="settings-option delete-option"
                    onClick={handleDeleteChat}
                  >
                    🗑️ Eliminar conversación
                  </button>
                </div>
              )}
            </div>
            <Link to="/dashboard" className="back-button">
              ← Volver
            </Link>
          </div>
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
                {message.has_image && message.image_url && (
                  <div className="message-image-container">
                    <img 
                      src={message.image_url} 
                      alt="Imagen adjunta" 
                      className="message-image"
                      onClick={() => setModalImage(message.image_url)}
                      title="Click para ampliar"
                    />
                  </div>
                )}
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
        
        {/* Image preview */}
        {imagePreview && (
          <div className="image-preview-container">
            <img src={imagePreview} alt="Preview" className="image-preview" />
            <button 
              type="button"
              className="remove-image-button"
              onClick={handleRemoveImage}
              aria-label="Eliminar imagen"
            >
              ❌
            </button>
          </div>
        )}
        
        <form className="input-form" onSubmit={handleSendMessage}>
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />
          
          {/* Image upload button */}
          <button
            type="button"
            className="attach-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            aria-label="Adjuntar imagen"
          >
            📎
          </button>
          
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
            disabled={sending || (!inputMessage.trim() && !selectedImage)}
          >
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div className="image-modal" onClick={() => setModalImage(null)}>
          <div className="image-modal-content">
            <button 
              className="image-modal-close"
              onClick={() => setModalImage(null)}
              aria-label="Cerrar"
            >
              ✕
            </button>
            <img src={modalImage} alt="Imagen ampliada" />
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
