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
            <div className="histories-grid">
              <div className="histories-list">
                {histories.map(history => (
                  <div 
                    key={history.id}
                    className={`history-card ${selectedHistory?.id === history.id ? 'selected' : ''}`}
                    onClick={() => setSelectedHistory(history)}
                  >
                    <div className="history-card-header">
                      <h3>{history.title}</h3>
                      <span className="history-date">{formatDate(history.created_at)}</span>
                    </div>
                    <p className="history-summary">{history.summary}</p>
                    <button 
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(history.id);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              {selectedHistory && (
                <div className="history-detail">
                  <h2>{selectedHistory.title}</h2>
                  <p className="detail-date">{formatDate(selectedHistory.created_at)}</p>
                  
                  <section className="detail-section">
                    <h3>📝 Resumen</h3>
                    <p>{selectedHistory.summary}</p>
                  </section>

                  {selectedHistory.aircraft_info && (
                    <section className="detail-section">
                      <h3>✈️ Información de Aeronave</h3>
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
                    <section className="detail-section">
                      <h3>🔧 Acciones de Mantenimiento</h3>
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
                    <section className="detail-section">
                      <h3>🔩 Piezas Utilizadas</h3>
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
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default HistoriesPage;
