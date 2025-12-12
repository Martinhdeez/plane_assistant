import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthForm from '../components/AuthForm';
import { login, isAuthenticated } from '../services/authService';
import { getCurrentUser } from '../../profile/services/userService';
import TopBar from '../../shared/components/TopBar';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated()) {
      navigate('/dashboard');
      return;
    }

    // Check if there's a success message from registration
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location, navigate]);

  const fields = [
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'tu@email.com',
      required: true
    },
    {
      name: 'password',
      type: 'password',
      label: 'Contraseña',
      placeholder: '••••••••',
      required: true
    }
  ];

  const handleLogin = async (formData) => {
    await login(formData.email, formData.password);
    
    // Get user info to determine redirect based on role
    try {
      const user = await getCurrentUser();
      
      // Redirect based on role
      if (user.role === 'oficinista') {
        navigate('/histories');
      } else if (user.role === 'administrador') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // Fallback to dashboard if can't get user info
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-page">
      <TopBar user={null} />
      
      <div className="auth-container">
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <AuthForm
          title="Iniciar Sesión"
          subtitle="Accede a tu asistente de mantenimiento aeronáutico"
          fields={fields}
          onSubmit={handleLogin}
          submitText="Iniciar Sesión"
          footerText="¿No tienes cuenta?"
          footerLink="/register"
          footerLinkText="Regístrate aquí"
        />
      </div>
    </div>
  );
}

export default LoginPage;
