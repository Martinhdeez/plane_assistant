import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './CurrentStepCard.css';

function CurrentStepCard({ step, onComplete, onPrevious, hasPreviousStep, isCompleting, isGoingBack, isExpanded, onToggleExpand }) {

  if (!step) return null;

  return (
    <div className={`current-step-card ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="step-header-row">
        <div className="step-number-badge">{step.step_number}</div>
        
        <div className="step-title-area">
          <h3 className="step-title">{step.title}</h3>
        </div>
        
        <button 
          className="toggle-description-btn"
          onClick={onToggleExpand}
          title={isExpanded ? 'Ocultar descripción' : 'Mostrar descripción'}
        >
          <svg width="28" height="28" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d={isExpanded ? "M5 12.5L10 7.5L15 12.5" : "M5 7.5L10 12.5L15 7.5"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      {isExpanded && step.description && (
        <div className="step-description">
          <ReactMarkdown>
            {step.description
              .replace(/\.\s+/g, '.\n\n')  // Add double line break after periods
              .replace(/:\s*\n/g, ':\n\n')  // Ensure space after colons before line breaks
            }
          </ReactMarkdown>
        </div>
      )}
      
      <div className="step-actions-row">
        <button 
          className="step-action-btn previous-btn"
          onClick={onPrevious}
          disabled={!hasPreviousStep || isGoingBack || isCompleting}
          title={hasPreviousStep ? "Volver al paso anterior" : "No hay paso anterior"}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <button 
          className="step-action-btn complete-btn"
          onClick={onComplete}
          disabled={isCompleting || isGoingBack}
          title={isCompleting ? "Completando..." : "Avanzar al siguiente paso"}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default CurrentStepCard;
