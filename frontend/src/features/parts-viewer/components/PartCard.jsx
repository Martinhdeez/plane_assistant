import './PartCard.css';

function PartCard({ part }) {
  if (!part) {
    return (
      <div className="part-card-container empty">
        <div className="empty-state">
          <p>Selecciona una pieza para ver sus detalles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="part-card-container">
      <h3 className="part-card-title">{part.name}</h3>
      
      <div className="part-details">
        <div className="detail-row">
          <span className="detail-label">Categoría:</span>
          <span className="detail-value">{part.category}</span>
        </div>
        
        {part.description && (
          <div className="detail-row">
            <span className="detail-label">Descripción:</span>
            <p className="detail-description">{part.description}</p>
          </div>
        )}
        
        <div className="detail-row">
          <span className="detail-label">Formato:</span>
          <span className="detail-value">{part.file_format?.toUpperCase() || 'GLTF'}</span>
        </div>
      </div>
    </div>
  );
}

export default PartCard;
