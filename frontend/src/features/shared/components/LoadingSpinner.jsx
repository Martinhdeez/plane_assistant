import './LoadingSpinner.css';

function LoadingSpinner({ message = 'Cargando...' }) {
  return (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  );
}

export default LoadingSpinner;
