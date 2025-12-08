import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../auth/services/authService';
import './TopBar.css';

function TopBar({ user, showAuth = true }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="top-bar">
      <div className="top-bar-container">
        <Link to="/dashboard" className="top-bar-logo">
          <img src="/custom_logo.jpg" alt="Logo" className="top-bar-logo-icon" />
          <span>Aircraft Assistant</span>
        </Link>

        <div className="top-bar-links">
          <Link to="/parts-viewer" className="top-bar-link">
            🔧 Visor 3D
          </Link>
          <Link to="/histories" className="top-bar-link">
            📋 Históricos
          </Link>
        </div>

        {showAuth && user && (
          <div className="top-bar-user">
            <Link to="/profile" className="user-info-link">
              <div className="user-avatar">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="user-name">{user.username || 'Usuario'}</span>
            </Link>
            <button className="btn-logout-topbar" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default TopBar;
