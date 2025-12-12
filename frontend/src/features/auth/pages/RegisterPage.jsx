import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import AuthForm from '../components/AuthForm';
import { register, isAuthenticated } from '../services/authService';
import TopBar from '../../shared/components/TopBar';
import './RegisterPage.css';

function RegisterPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const fields = [
    {
      name: 'username',
      type: 'text',
      label: 'Nombre de usuario',
      placeholder: 'usuario123',
      required: true
    },
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
    },
    {
      name: 'confirmPassword',
      type: 'password',
      label: 'Confirmar contraseña',
      placeholder: '••••••••',
      required: true,
      validate: (value, formData) => {
        if (value !== formData.password) {
          return 'Las contraseñas no coinciden';
        }
        return null;
      }
    },
    {
      name: 'role',
      type: 'select',
      label: 'Tipo de usuario',
      required: true,
      options: [
        { value: 'mantenimiento', label: 'Mantenimiento - Puedo crear chats y generar históricos' },
        { value: 'oficinista', label: 'Oficinista - Solo visualizar históricos asignados' }
      ],
      defaultValue: 'mantenimiento'
    }
  ];

  const handleRegister = async (formData) => {
    // Register the user with role
    await register(formData.username, formData.email, formData.password, formData.role);
    
    // Redirect to login with success message
    navigate('/login', { 
      state: { 
        message: '¡Cuenta creada exitosamente! Por favor inicia sesión.',
        type: 'success'
      } 
    });
  };

  return (
    <div className="auth-page">
      <TopBar user={null} />
      
      <div className="auth-container">

        <AuthForm
          title="Crear Cuenta"
          subtitle="Únete a los profesionales del mantenimiento aeronáutico"
          fields={fields}
          onSubmit={handleRegister}
          submitText="Crear Cuenta"
          footerText="¿Ya tienes cuenta?"
          footerLink="/login"
          footerLinkText="Inicia sesión aquí"
        />
      </div>
    </div>
  );
}

export default RegisterPage;
