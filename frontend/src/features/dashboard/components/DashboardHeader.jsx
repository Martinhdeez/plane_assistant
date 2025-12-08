import { Link } from 'react-router-dom';
import './DashboardHeader.css';

function DashboardHeader({ user, onLogout }) {
  return (
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
          <button className="btn-logout" onClick={onLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
