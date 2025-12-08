import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, isAuthenticated } from '../../auth/services/authService';
import { getChats, createChat } from '../../chat/services/chatService';
import { getCurrentUser } from '../../profile/services/userService';
import CloudsBackground from '../../shared/components/CloudsBackground';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import TopBar from '../../shared/components/TopBar';
import ChatCard from '../components/ChatCard';
import ActionCard from '../components/ActionCard';
import './DashboardPage.css';

function DashboardPage() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
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
      <CloudsBackground />
      
      <TopBar user={user} onLogout={handleLogout} />

      <main className="dashboard-content">
        <div className="container">
          <div className="dashboard-title">
            <h2>Tus Conversaciones</h2>
            <p>Gestiona tus consultas de mantenimiento aeronáutico</p>
          </div>

          <div className="chats-section">
            <ActionCard
              icon="➕"
              title="Nueva Conversación"
              description="Inicia una nueva consulta con tu asistente de mantenimiento"
              onClick={handleCreateChat}
            />

            {error && (
              <div className="error-message-dashboard">{error}</div>
            )}

            {loading ? (
              <LoadingSpinner message="Cargando conversaciones..." />
            ) : chats.length > 0 ? (
              <div className="chats-list">
                {chats.map(chat => (
                  <ChatCard
                    key={chat.id}
                    chat={chat}
                    onClick={handleChatClick}
                    formatDate={formatDate}
                  />
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
