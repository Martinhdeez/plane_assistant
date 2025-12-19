import { useState } from 'react';
import './NewChatModal.css';

const AIRPLANE_MODELS = [
  { id: 'none', name: 'No especificar', icon: '❓' },
  { id: 'boeing-737', name: 'Boeing 737', icon: '✈️' },
  { id: 'boeing-777', name: 'Boeing 777', icon: '🛫' },
  { id: 'airbus-a320', name: 'Airbus A320', icon: '✈️' },
  { id: 'airbus-a380', name: 'Airbus A380', icon: '🛬' }
];

const COMPONENT_TYPES = [
  { id: 'none', name: 'No especificar', icon: '❓', description: 'Sin categoría específica' },
  { id: 'estructural', name: 'Estructural', icon: '🔩', description: 'Fuselaje, alas, estabilizadores' },
  { id: 'sistemas-equipos', name: 'Sistemas/Equipos', icon: '⚙️', description: 'APU, aire acondicionado, presurización' },
  { id: 'electrica', name: 'Eléctrica', icon: '⚡', description: 'Generadores, baterías, cableado' },
  { id: 'hidraulica', name: 'Hidráulica', icon: '💧', description: 'Bombas, actuadores, líneas' },
  { id: 'componentes', name: 'Componentes', icon: '🔧', description: 'Motores, tren de aterrizaje, frenos' }
];

function NewChatModal({ isOpen, onClose, onCreate }) {
  const [step, setStep] = useState(1);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleClose = () => {
    setStep(1);
    setSelectedModel(null);
    setSelectedComponent(null);
    setSelectedFile(null);
    setIsDragging(false);
    setIsCreating(false);
    onClose();
  };

  const handleNext = () => {
    if (step === 1 && selectedModel) {
      setStep(2);
    } else if (step === 2 && selectedComponent) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else if (file) {
      alert('Por favor selecciona un archivo PDF');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else if (file) {
      alert('Por favor selecciona un archivo PDF');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const modelName = selectedModel === 'none' ? null : AIRPLANE_MODELS.find(m => m.id === selectedModel)?.name;
      const componentName = selectedComponent === 'none' ? null : COMPONENT_TYPES.find(c => c.id === selectedComponent)?.name;
      
      // Generate title
      let title = 'Nueva Conversación';
      if (modelName && componentName) {
        title = `${modelName} - ${componentName}`;
      } else if (modelName) {
        title = modelName;
      } else if (componentName) {
        title = componentName;
      }
      
      await onCreate({
        title,
        airplane_model: modelName,
        component_type: componentName,
        template: selectedFile
      });
      
      handleClose();
    } catch (error) {
      console.error('Error creating chat:', error);
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nueva Conversación</h2>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>

        <div className="modal-steps">
          <div className={`step-indicator ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Modelo</span>
          </div>
          <div className="step-divider"></div>
          <div className={`step-indicator ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Componente</span>
          </div>
          <div className="step-divider"></div>
          <div className={`step-indicator ${step === 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Plantilla</span>
          </div>
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div className="selection-step">
              <h3>Selecciona el modelo de avión</h3>
              <p className="step-subtitle">(Opcional)</p>
              <div className="selection-grid">
                {AIRPLANE_MODELS.map((model) => (
                  <div
                    key={model.id}
                    className={`selection-card ${selectedModel === model.id ? 'selected' : ''} ${model.id === 'none' ? 'none-option' : ''}`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    <div className="card-icon">{model.icon}</div>
                    <div className="card-name">{model.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="selection-step">
              <h3>Selecciona el tipo de componente</h3>
              <p className="step-subtitle">(Opcional)</p>
              <div className="selection-grid components">
                {COMPONENT_TYPES.map((component) => (
                  <div
                    key={component.id}
                    className={`selection-card ${selectedComponent === component.id ? 'selected' : ''} ${component.id === 'none' ? 'none-option' : ''}`}
                    onClick={() => setSelectedComponent(component.id)}
                  >
                    <div className="card-icon">{component.icon}</div>
                    <div className="card-name">{component.name}</div>
                    <div className="card-description">{component.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="selection-step">
              <h3>Sube la plantilla de instrucciones</h3>
              <p className="step-subtitle">(Opcional - Solo archivos PDF)</p>
              
              <div 
                className={`file-upload-area ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !selectedFile && document.getElementById('file-input').click()}
              >
                {!selectedFile ? (
                  <>
                    <div className="upload-icon">📄</div>
                    <p className="upload-text">Arrastra tu PDF aquí o haz clic para seleccionar</p>
                    <p className="upload-subtext">Máximo 25MB</p>
                  </>
                ) : (
                  <div className="file-preview">
                    <div className="file-icon">📄</div>
                    <div className="file-info">
                      <div className="file-name">{selectedFile.name}</div>
                      <div className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                    <button className="remove-file" onClick={(e) => { e.stopPropagation(); removeFile(); }}>
                      ✕
                    </button>
                  </div>
                )}
              </div>
              
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          {(step === 2 || step === 3) && (
            <button className="btn-secondary" onClick={handleBack} disabled={isCreating}>
              Atrás
            </button>
          )}
          <div className="spacer"></div>
          {(step === 1 || step === 2) && (
            <button 
              className="btn-primary" 
              onClick={handleNext}
              disabled={(step === 1 && !selectedModel) || (step === 2 && !selectedComponent)}
            >
              Siguiente
            </button>
          )}
          {step === 3 && (
            <button 
              className="btn-primary" 
              onClick={handleCreate}
              disabled={isCreating}
            >
              {isCreating ? 'Creando...' : 'Crear Chat'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewChatModal;
