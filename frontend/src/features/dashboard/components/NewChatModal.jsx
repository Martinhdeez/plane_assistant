import { useState } from 'react';
import './NewChatModal.css';

const AIRPLANE_MODELS = [
  { id: 'boeing-737', name: 'Boeing 737', icon: '✈️' },
  { id: 'boeing-777', name: 'Boeing 777', icon: '🛫' },
  { id: 'airbus-a320', name: 'Airbus A320', icon: '✈️' },
  { id: 'airbus-a380', name: 'Airbus A380', icon: '🛬' }
];

const COMPONENT_TYPES = [
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
  const [isCreating, setIsCreating] = useState(false);

  const handleClose = () => {
    setStep(1);
    setSelectedModel(null);
    setSelectedComponent(null);
    setIsCreating(false);
    onClose();
  };

  const handleNext = () => {
    if (step === 1 && selectedModel) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleCreate = async () => {
    if (!selectedModel || !selectedComponent) return;

    setIsCreating(true);
    try {
      const modelName = AIRPLANE_MODELS.find(m => m.id === selectedModel)?.name;
      const componentName = COMPONENT_TYPES.find(c => c.id === selectedComponent)?.name;
      
      await onCreate({
        title: `${modelName} - ${componentName}`,
        airplane_model: modelName,
        component_type: componentName
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
          <div className={`step-indicator ${step === 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Componente</span>
          </div>
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div className="selection-step">
              <h3>Selecciona el modelo de avión</h3>
              <div className="selection-grid">
                {AIRPLANE_MODELS.map((model) => (
                  <div
                    key={model.id}
                    className={`selection-card ${selectedModel === model.id ? 'selected' : ''}`}
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
              <div className="selection-grid components">
                {COMPONENT_TYPES.map((component) => (
                  <div
                    key={component.id}
                    className={`selection-card ${selectedComponent === component.id ? 'selected' : ''}`}
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
        </div>

        <div className="modal-footer">
          {step === 2 && (
            <button className="btn-secondary" onClick={handleBack} disabled={isCreating}>
              Atrás
            </button>
          )}
          <div className="spacer"></div>
          {step === 1 && (
            <button 
              className="btn-primary" 
              onClick={handleNext}
              disabled={!selectedModel}
            >
              Siguiente
            </button>
          )}
          {step === 2 && (
            <button 
              className="btn-primary" 
              onClick={handleCreate}
              disabled={!selectedComponent || isCreating}
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
