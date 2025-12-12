import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../auth/services/authService';
import { getCurrentUser } from '../../profile/services/userService';
import {
  getUsers,
  createUser,
  updateUserAdmin,
  deleteUser,
  assignOperarios,
  getAssignedOperarios
} from '../services/adminService';
import CloudsBackground from '../../shared/components/CloudsBackground';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import TopBar from '../../shared/components/TopBar';
import UserModal from '../components/UserModal';
import AssignModal from '../components/AssignModal';
import './AdminPanel.css';

function AdminPanel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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
      const [userData, usersData] = await Promise.all([
        getCurrentUser(),
        getUsers()
      ]);
      
      // Check if user is admin
      if (userData.role !== 'administrador') {
        navigate('/dashboard');
        return;
      }
      
      setUser(userData);
      setUsers(usersData);
    } catch (err) {
      setError('Error al cargar datos');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditing(true);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Desactivar este usuario? No podrá iniciar sesión.')) return;

    try {
      await deleteUser(userId);
      await fetchData(); // Refresh list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      if (isEditing) {
        await updateUserAdmin(selectedUser.id, userData);
      } else {
        await createUser(userData);
      }
      setShowUserModal(false);
      await fetchData(); // Refresh list
    } catch (err) {
      throw err; // Let modal handle the error
    }
  };

  const handleAssignOperarios = (oficinista) => {
    setSelectedUser(oficinista);
    setShowAssignModal(true);
  };

  const handleSaveAssignments = async (operarioIds) => {
    try {
      await assignOperarios(selectedUser.id, operarioIds);
      setShowAssignModal(false);
    } catch (err) {
      throw err; // Let modal handle the error
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'administrador': return 'role-badge-admin';
      case 'oficinista': return 'role-badge-oficinista';
      case 'mantenimiento': return 'role-badge-mantenimiento';
      default: return '';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'administrador': return 'Admin';
      case 'oficinista': return 'Oficinista';
      case 'mantenimiento': return 'Mantenimiento';
      default: return role;
    }
  };

  return (
    <div className="admin-panel-page">
      <CloudsBackground />
      <TopBar user={user} />

      <main className="admin-content">
        <div className="container">
          <div className="admin-header">
            <h1>⚙️ Panel de Administración</h1>
            <p>Gestión de usuarios y permisos</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <LoadingSpinner message="Cargando usuarios..." />
          ) : (
            <>
              <div className="admin-controls">
                <div className="search-filter-group">
                  <input
                    type="text"
                    className="admin-search"
                    placeholder="🔍 Buscar usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select
                    className="role-filter"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="">Todos los roles</option>
                    <option value="administrador">Administrador</option>
                    <option value="oficinista">Oficinista</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </div>
                <button className="btn-create-user" onClick={handleCreateUser}>
                  ➕ Crear Usuario
                </button>
              </div>

              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>División</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} className={!u.is_active ? 'user-inactive' : ''}>
                        <td className="user-name-cell">
                          <div className="user-avatar-small">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          {u.username}
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge ${getRoleBadgeClass(u.role)}`}>
                            {getRoleLabel(u.role)}
                          </span>
                        </td>
                        <td>{u.division || '-'}</td>
                        <td>
                          <span className={`status-badge ${u.is_active ? 'status-active' : 'status-inactive'}`}>
                            {u.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button
                            className="btn-action btn-edit"
                            onClick={() => handleEditUser(u)}
                            title="Editar usuario"
                          >
                            ✏️
                          </button>
                          {u.role === 'oficinista' && (
                            <button
                              className="btn-action btn-assign"
                              onClick={() => handleAssignOperarios(u)}
                              title="Asignar operarios"
                            >
                              👥
                            </button>
                          )}
                          {u.id !== user.id && (
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleDeleteUser(u.id)}
                              title="Desactivar usuario"
                            >
                              🗑️
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredUsers.length === 0 && (
                  <div className="empty-state">
                    <p>No se encontraron usuarios</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {showUserModal && (
        <UserModal
          user={selectedUser}
          isEditing={isEditing}
          onClose={() => setShowUserModal(false)}
          onSave={handleSaveUser}
        />
      )}

      {showAssignModal && (
        <AssignModal
          oficinista={selectedUser}
          allUsers={users.filter(u => u.role === 'mantenimiento')}
          onClose={() => setShowAssignModal(false)}
          onSave={handleSaveAssignments}
        />
      )}
    </div>
  );
}

export default AdminPanel;
