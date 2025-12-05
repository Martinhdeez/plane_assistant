import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, isAuthenticated } from '../../auth/services/authService';
import { getChats, createChat } from '../../chat/services/chatService';
import './DashboardPage.css';

function DashboardPage() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Fetch chats from API
    fetchChats();
  }, [navigate]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      setError('');
      const fetchedChats = await getChats();
      setChats(fetchedChats);
    } catch (err) {
      setError('Error al cargar las conversaciones');
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateChat = async () => {
    try {
      const newChat = await createChat('Nueva Conversación');
      // Navigate to the new chat
      navigate(`/chat/${newChat.id}`);
    } catch (err) {
      setError('Error al crear la conversación');
      console.error('Error creating chat:', err);
    }
  };

  const handleChatClick = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="container">
          <div className="dashboard-logo">
            <h1>✈️ Plane Assistant</h1>
          </div>
          <div className="dashboard-user">
            <div className="user-info">
              <div className="user-name">Usuario</div>
              <div className="user-email">usuario@email.com</div>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="container">
          <div className="dashboard-title">
            <h2>Tus Conversaciones</h2>
            <p>Gestiona tus consultas de mantenimiento aeronáutico</p>
          </div>

          <div className="chats-section">
            <div className="create-chat-card" onClick={handleCreateChat}>
              <div className="create-chat-icon">➕</div>
              <h3>Nueva Conversación</h3>
              <p>Inicia una nueva consulta con tu asistente de mantenimiento</p>
            </div>

            {error && (
              <div className="error-message-dashboard">
                {error}
              </div>
            )}

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Cargando conversaciones...</p>
              </div>
            ) : chats.length > 0 ? (
              <div className="chats-list">
                {chats.map(chat => (
                  <div 
                    key={chat.id} 
                    className="chat-card"
                    onClick={() => handleChatClick(chat.id)}
                  >
                    <div className="chat-header">
                      <h3 className="chat-title">{chat.title}</h3>
                      <span className="chat-date">{formatDate(chat.created_at)}</span>
                    </div>
                    <div className="chat-meta">
                      <span className="chat-messages-count">
                        {chat.message_count} mensajes
                      </span>
                      <span className="chat-icon">💬</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">💬</div>
                <p>No tienes conversaciones aún. ¡Crea una nueva para empezar!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
