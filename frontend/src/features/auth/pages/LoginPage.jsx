import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthForm from '../components/AuthForm';
import { login } from '../services/authService';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check if there's a success message from registration
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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
    // Redirect to dashboard after successful login
    navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <a href="/" className="back-to-home">
          ← Volver al inicio
        </a>
        
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
        
        <div className="auth-logo">
          <h1>Plane Assistant</h1>
          <p>Inicia sesión en tu cuenta</p>
        </div>

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
