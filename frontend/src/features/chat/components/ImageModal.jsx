import './ImageModal.css';

function ImageModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return (
    <div className="image-modal" onClick={onClose}>
      <div className="image-modal-content">
        <button 
          className="image-modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>
        <img src={imageUrl} alt="Imagen ampliada" />
      </div>
    </div>
  );
}

export default ImageModal;
