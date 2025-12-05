import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser, updateUser, updatePassword } from '../services/userService';
import { isAuthenticated } from '../../auth/services/authService';
import './ProfilePage.css';

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // User info form
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [updatingInfo, setUpdatingInfo] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState('');
  const [infoError, setInfoError] = useState('');
  
  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    fetchUser();
  }, [navigate]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
      setUsername(userData.username);
      setEmail(userData.email);
    } catch (err) {
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setInfoSuccess('');
    setInfoError('');
    setUpdatingInfo(true);

    try {
      const updatedUser = await updateUser({ username, email });
      setUser(updatedUser);
      setInfoSuccess('Información actualizada correctamente');
    } catch (err) {
      setInfoError(err.message || 'Error al actualizar información');
    } finally {
      setUpdatingInfo(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setUpdatingPassword(true);

    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordSuccess('Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Error al actualizar contraseña');
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <Link to="/dashboard" className="back-to-dashboard">
          ← Volver al Dashboard
        </Link>

        <div className="profile-header">
          <h1>Mi Perfil</h1>
          <p>Gestiona tu información personal</p>
        </div>

        <div className="profile-sections">
          {/* User Information Section */}
          <div className="profile-section">
            <h2>Información Personal</h2>
            
            {infoSuccess && (
              <div className="success-message-profile">{infoSuccess}</div>
            )}
            {infoError && (
              <div className="error-message-profile">{infoError}</div>
            )}

            <form onSubmit={handleUpdateInfo}>
              <div className="form-group">
                <label htmlFor="username">Nombre de Usuario</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={updatingInfo}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={updatingInfo}
                  required
                />
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={updatingInfo}
                >
                  {updatingInfo ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>

          {/* Password Section */}
          <div className="profile-section">
            <h2>Cambiar Contraseña</h2>
            
            {passwordSuccess && (
              <div className="success-message-profile">{passwordSuccess}</div>
            )}
            {passwordError && (
              <div className="error-message-profile">{passwordError}</div>
            )}

            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label htmlFor="currentPassword">Contraseña Actual</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={updatingPassword}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Nueva Contraseña</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={updatingPassword}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={updatingPassword}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={updatingPassword}
                >
                  {updatingPassword ? 'Actualizando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
