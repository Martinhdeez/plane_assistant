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
        <Link to="/" className="top-bar-logo">
          <img src="/custom_logo.jpg" alt="Logo" className="top-bar-logo-icon" />
          <span>Aircraft Assistant</span>
        </Link>

        {showAuth && (
          <div className="top-bar-user">
            {user ? (
              <>
                {/* Admin Panel - Only for administrators */}
                {user.role === 'administrador' && (
                  <Link to="/admin" className="top-bar-nav-link">
                    ⚙️ Admin
                  </Link>
                )}

                {/* Chats - Only for mantenimiento and admin */}
                {(user.role === 'mantenimiento' || user.role === 'administrador') && (
                  <Link to="/dashboard" className="top-bar-nav-link">
                    💬 Chats
                  </Link>
                )}

                {/* 3D Viewer - All roles can access */}
                <Link to="/parts-viewer" className="top-bar-nav-link">
                  🔧 Visor 3D
                </Link>

                {/* Histories - All roles can access */}
                <Link to="/histories" className="top-bar-nav-link">
                  📋 Históricos
                </Link>

                {/* Profile Avatar */}
                <Link to="/profile" className="user-info-link">
                  <div className="user-avatar">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                </Link>

                <button className="btn-logout-topbar" onClick={handleLogout}>
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="top-bar-nav-link">
                  🔐 Iniciar Sesión
                </Link>
                <Link to="/register" className="top-bar-nav-link top-bar-register">
                  ✨ Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default TopBar;
