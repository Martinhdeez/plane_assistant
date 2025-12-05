import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { login } from '../services/authService';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();

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
    // Redirect to dashboard or home after successful login
    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <a href="/" className="back-to-home">
          ← Volver al inicio
        </a>
        
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
