import { useState } from 'react';
import './AuthForm.css';

function AuthForm({ 
  title, 
  subtitle, 
  fields, 
  onSubmit, 
  submitText, 
  footerText, 
  footerLink, 
  footerLinkText 
}) {
  const [formData, setFormData] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
  );
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (formError) {
      setFormError('');
    }
  };

  const validate = () => {
    const newErrors = {};
    
    fields.forEach(field => {
      const value = formData[field.name];
      
      // Required validation
      if (field.required && !value.trim()) {
        newErrors[field.name] = `${field.label} es requerido`;
        return;
      }
      
      // Email validation
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.name] = 'Email inválido';
        }
      }
      
      // Password length validation
      if (field.name === 'password' && value && value.length < 6) {
        newErrors[field.name] = 'La contraseña debe tener al menos 6 caracteres';
      }
      
      // Custom validation
      if (field.validate) {
        const error = field.validate(value, formData);
        if (error) {
          newErrors[field.name] = error;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!validate()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (err) {
      // Extract error message properly
      const errorMessage = err.message || err.toString() || 'Ocurrió un error. Por favor intenta de nuevo.';
      setFormError(errorMessage);
      console.error('Form submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
      
      {formError && (
        <div className="form-error">{formError}</div>
      )}
      
      {fields.map(field => (
        <div key={field.name} className="form-group">
          <label htmlFor={field.name}>{field.label}</label>
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            placeholder={field.placeholder}
            className={errors[field.name] ? 'error' : ''}
            disabled={isLoading}
          />
          {errors[field.name] && (
            <span className="error-message">{errors[field.name]}</span>
          )}
        </div>
      ))}
      
      <button 
        type="submit" 
        className="submit-button"
        disabled={isLoading}
      >
        {isLoading ? 'Procesando...' : submitText}
      </button>
      
      {footerText && (
        <div className="form-footer">
          <p>
            {footerText}{' '}
            <a href={footerLink}>{footerLinkText}</a>
          </p>
        </div>
      )}
    </form>
  );
}

export default AuthForm;
