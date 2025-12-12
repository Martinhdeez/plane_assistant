import { useState, useEffect } from 'react';
import './UserModal.css';

function UserModal({ user, isEditing, onClose, onSave }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'mantenimiento',
    division: '',
    is_active: true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isEditing) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role,
        division: user.division || '',
        is_active: user.is_active
      });
    }
  }, [user, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditing) {
        // For editing, only send changed fields
        const updateData = {
          email: formData.email !== user.email ? formData.email : undefined,
          role: formData.role !== user.role ? formData.role : undefined,
          division: formData.division !== user.division ? formData.division : undefined,
          is_active: formData.is_active !== user.is_active ? formData.is_active : undefined
        };
        // Remove undefined fields
        Object.keys(updateData).forEach(key => 
          updateData[key] === undefined && delete updateData[key]
        );
        await onSave(updateData);
      } else {
        // For creating, send all required fields
        if (!formData.password) {
          setError('La contraseña es requerida');
          setLoading(false);
          return;
        }
        await onSave({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          division: formData.division || null
        });
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Editar Usuario' : 'Crear Usuario'}</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Usuario *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={isEditing}
              required
              placeholder="nombre_usuario"
            />
            {isEditing && (
              <small className="form-hint">El nombre de usuario no se puede cambiar</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="usuario@ejemplo.com"
            />
          </div>

          {!isEditing && (
            <div className="form-group">
              <label htmlFor="password">Contraseña *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="role">Rol *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="mantenimiento">Mantenimiento</option>
              <option value="oficinista">Oficinista</option>
              <option value="administrador">Administrador</option>
            </select>
            <small className="form-hint">
              {formData.role === 'mantenimiento' && 'Puede crear chats y generar históricos'}
              {formData.role === 'oficinista' && 'Solo puede ver históricos asignados'}
              {formData.role === 'administrador' && 'Acceso completo al sistema'}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="division">División</label>
            <input
              type="text"
              id="division"
              name="division"
              value={formData.division}
              onChange={handleChange}
              placeholder="Ej: Mantenimiento A, Operaciones B"
            />
            <small className="form-hint">Opcional - para organización interna</small>
          </div>

          {isEditing && (
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
                <span>Usuario activo</span>
              </label>
              <small className="form-hint">
                Los usuarios inactivos no pueden iniciar sesión
              </small>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserModal;
