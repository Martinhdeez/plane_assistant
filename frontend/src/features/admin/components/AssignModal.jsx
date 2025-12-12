import { useState, useEffect } from 'react';
import { getAssignedOperarios } from '../services/adminService';
import './AssignModal.css';

function AssignModal({ oficinista, allUsers, onClose, onSave }) {
  const [selectedOperarios, setSelectedOperarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAssignedOperarios();
  }, [oficinista]);

  const loadAssignedOperarios = async () => {
    try {
      setLoading(true);
      const assigned = await getAssignedOperarios(oficinista.id);
      setSelectedOperarios(assigned.map(u => u.id));
    } catch (err) {
      console.error('Error loading assigned operarios:', err);
      setSelectedOperarios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOperario = (operarioId) => {
    setSelectedOperarios(prev => {
      if (prev.includes(operarioId)) {
        return prev.filter(id => id !== operarioId);
      } else {
        return [...prev, operarioId];
      }
    });
  };

  const handleSelectAll = () => {
    const filteredIds = filteredOperarios.map(u => u.id);
    setSelectedOperarios(filteredIds);
  };

  const handleDeselectAll = () => {
    setSelectedOperarios([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await onSave(selectedOperarios);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const filteredOperarios = allUsers.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content assign-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Asignar Operarios a {oficinista.username}</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="error-message">{error}</div>}

          <p className="modal-description">
            Selecciona los operarios cuyos históricos podrá ver este oficinista.
          </p>

          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Buscar operario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="select-actions">
            <button
              type="button"
              className="btn-select-action"
              onClick={handleSelectAll}
            >
              Seleccionar todos
            </button>
            <button
              type="button"
              className="btn-select-action"
              onClick={handleDeselectAll}
            >
              Deseleccionar todos
            </button>
            <span className="selection-count">
              {selectedOperarios.length} seleccionados
            </span>
          </div>

          {loading ? (
            <div className="loading-state">Cargando operarios...</div>
          ) : (
            <div className="operarios-list">
              {filteredOperarios.length === 0 ? (
                <div className="empty-state">
                  No se encontraron operarios
                </div>
              ) : (
                filteredOperarios.map(operario => (
                  <label key={operario.id} className="operario-item">
                    <input
                      type="checkbox"
                      checked={selectedOperarios.includes(operario.id)}
                      onChange={() => handleToggleOperario(operario.id)}
                    />
                    <div className="operario-info">
                      <div className="operario-avatar">
                        {operario.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="operario-details">
                        <span className="operario-name">{operario.username}</span>
                        <span className="operario-email">{operario.email}</span>
                        {operario.division && (
                          <span className="operario-division">📍 {operario.division}</span>
                        )}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={saving || loading}
            >
              {saving ? 'Guardando...' : 'Guardar Asignaciones'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignModal;
