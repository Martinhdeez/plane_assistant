import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { logout, isAuthenticated } from '../../auth/services/authService';
import { getChats, createChat } from '../../chat/services/chatService';
import { getCurrentUser } from '../../profile/services/userService';
import './DashboardPage.css';

function DashboardPage() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Fetch user and chats
    fetchUserAndChats();
  }, [navigate]);

  const fetchUserAndChats = async () => {
    try {
      setLoading(true);
      setError('');
      const [userData, chatsData] = await Promise.all([
        getCurrentUser(),
        getChats()
      ]);
      setUser(userData);
      setChats(chatsData);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error fetching data:', err);
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
      <div className="clouds-background">
        <div className="cloud cloud-1">☁️</div>
        <div className="cloud cloud-2">☁️</div>
        <div className="cloud cloud-3">☁️</div>
        <div className="cloud cloud-4">☁️</div>
        <div className="cloud cloud-5">☁️</div>
        <div className="cloud cloud-6">☁️</div>
        <div className="cloud cloud-7">☁️</div>
        <div className="cloud cloud-8">☁️</div>
        <div className="cloud cloud-9">☁️</div>
        <div className="cloud cloud-10">☁️</div>
        <div className="cloud cloud-11">☁️</div>
        <div className="cloud cloud-12">☁️</div>
      </div>
      <header className="dashboard-header">
        <div className="container">
          <div className="dashboard-logo">
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1>
                <img src="/custom_logo.jpg" alt="Logo" className="logo-icon" />
                Aircraft Assistant
              </h1>
            </Link>
          </div>
          <div className="dashboard-user">
            <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="user-info">
                <div className="user-avatar-placeholder">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-details">
                  <div className="user-name">{user?.username || 'Usuario'}</div>
                  <div className="user-role">Operario</div>
                </div>
              </div>
            </Link>
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

            <Link to="/parts-viewer" style={{ textDecoration: 'none' }}>
              <div className="create-chat-card">
                <div className="create-chat-icon">🔧</div>
                <h3>Visor 3D de Piezas</h3>
                <p>Explora y visualiza piezas aeronáuticas en 3D</p>
              </div>
            </Link>

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
                    <div className="chat-card-header">
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
