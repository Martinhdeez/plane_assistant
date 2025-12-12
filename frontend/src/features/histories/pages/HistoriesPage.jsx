import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistories, deleteHistory } from '../services/historiesService';
import { isAuthenticated } from '../../auth/services/authService';
import { getCurrentUser } from '../../profile/services/userService';
import CloudsBackground from '../../shared/components/CloudsBackground';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import TopBar from '../../shared/components/TopBar';
import './HistoriesPage.css';

function HistoriesPage() {
  const navigate = useNavigate();
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [userData, historiesData] = await Promise.all([
        getCurrentUser(),
        getHistories()
      ]);
      setUser(userData);
      setHistories(historiesData);
    } catch (err) {
      setError('Error al cargar los históricos');
      console.error('Error fetching histories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (historyId) => {
    if (!window.confirm('¿Eliminar este histórico?')) return;

    try {
      await deleteHistory(historyId);
      setHistories(histories.filter(h => h.id !== historyId));
      if (selectedHistory?.id === historyId) {
        setSelectedHistory(null);
      }
    } catch (err) {
      setError('Error al eliminar el histórico');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter histories based on search term
  const filteredHistories = histories.filter(history =>
    history.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openFullScreen = (history) => {
    setSelectedHistory(history);
  };

  const closeFullScreen = () => {
    setSelectedHistory(null);
  };

  return (
    <div className="histories-page">
      <CloudsBackground />
      
      <TopBar user={user} />

      <main className="histories-content">
        <div className="container">
          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <LoadingSpinner message="Cargando históricos..." />
          ) : histories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No hay históricos generados aún.</p>
              <p>Genera históricos desde tus conversaciones.</p>
            </div>
          ) : (
            <>
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="🔍 Buscar por título del chat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchTerm('')}
                    aria-label="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>

              {filteredHistories.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <p>No se encontraron históricos con "{searchTerm}"</p>
                  <button 
                    className="clear-search-btn-text"
                    onClick={() => setSearchTerm('')}
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              ) : (
                <div className="histories-list-only">
                  {filteredHistories.map(history => (
                    <div 
                      key={history.id}
                      className="history-card"
                      onClick={() => openFullScreen(history)}
                    >
                      <div className="history-card-header">
                        <h3>{history.title}</h3>
                        <span className="history-date">{formatDate(history.created_at)}</span>
                      </div>
                      <p className="history-summary">{history.summary}</p>
                      
                      {/* Only show delete button for mantenimiento and admin */}
                      {user?.role !== 'oficinista' && (
                        <button 
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(history.id);
                          }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Full-Screen Modal */}
      {selectedHistory && (
        <div className="history-modal-overlay" onClick={closeFullScreen}>
          <div className="history-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeFullScreen}>
              ✕
            </button>
            
            <div className="modal-header">
              <h1>{selectedHistory.title}</h1>
              <p className="modal-date">{formatDate(selectedHistory.created_at)}</p>
            </div>

            <div className="modal-body">
              <section className="modal-section">
                <h2>📝 Resumen</h2>
                <p>{selectedHistory.summary}</p>
              </section>

              {selectedHistory.aircraft_info && (
                <section className="modal-section">
                  <h2>✈️ Información de Aeronave</h2>
                  <div className="info-grid">
                    {selectedHistory.aircraft_info.model && (
                      <div><strong>Modelo:</strong> {selectedHistory.aircraft_info.model}</div>
                    )}
                    {selectedHistory.aircraft_info.registration && (
                      <div><strong>Matrícula:</strong> {selectedHistory.aircraft_info.registration}</div>
                    )}
                    {selectedHistory.aircraft_info.operator && (
                      <div><strong>Operador:</strong> {selectedHistory.aircraft_info.operator}</div>
                    )}
                  </div>
                </section>
              )}

              {selectedHistory.maintenance_actions && selectedHistory.maintenance_actions.length > 0 && (
                <section className="modal-section">
                  <h2>🔧 Acciones de Mantenimiento</h2>
                  <ul className="actions-list">
                    {selectedHistory.maintenance_actions.map((action, idx) => (
                      <li key={idx}>
                        <strong>{action.action}</strong>
                        {action.result && <p>Resultado: {action.result}</p>}
                        {action.date && <p>Fecha: {action.date}</p>}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {selectedHistory.parts_used && selectedHistory.parts_used.length > 0 && (
                <section className="modal-section">
                  <h2>🔩 Piezas Utilizadas</h2>
                  <ul className="parts-list">
                    {selectedHistory.parts_used.map((part, idx) => (
                      <li key={idx}>
                        <strong>{part.part_name}</strong>
                        {part.part_number && <span> (P/N: {part.part_number})</span>}
                        <span> - Cantidad: {part.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoriesPage;
