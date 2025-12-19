import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './CurrentStepCard.css';

function CurrentStepCard({ step, onComplete, isCompleting }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!step) return null;

  return (
    <div className={`current-step-card ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="step-main-row">
        <div className="step-number-badge">{step.step_number}</div>
        
        <div className="step-title-area">
          <h3 className="step-title">{step.title}</h3>
        </div>
        
        <div className="step-actions">
          <button 
            className="toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Ocultar descripción' : 'Mostrar descripción'}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
          
          <button 
            className="complete-step-btn"
            onClick={onComplete}
            disabled={isCompleting}
            title="Marcar como completado"
          >
            {isCompleting ? '⏳' : '✓'}
          </button>
        </div>
      </div>
      
      {isExpanded && step.description && (
        <div className="step-description">
          <ReactMarkdown>{step.description.replace(/\. /g, '.\n\n').replace(/: /g, ':\n- ')}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default CurrentStepCard;
