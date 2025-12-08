import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ChatHeader.css';

function ChatHeader({ 
  chat, 
  isEditingTitle, 
  editedTitle, 
  setEditedTitle, 
  onEditTitle, 
  onSaveTitle, 
  onCancelEdit,
  showSettingsMenu,
  setShowSettingsMenu,
  onDeleteChat,
  onGenerateHistory,
  generatingHistory
}) {
  const titleInputRef = useRef(null);
  const settingsMenuRef = useRef(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
        setShowSettingsMenu(false);
      }
    }

    if (showSettingsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSettingsMenu, setShowSettingsMenu]);

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSaveTitle();
    } else if (e.key === 'Escape') {
      onCancelEdit();
    }
  };

  return (
    <header className="chat-header">
      <div className="container">
        <div className="chat-info">
          {isEditingTitle ? (
            <div className="title-edit-container">
              <input
                ref={titleInputRef}
                type="text"
                className="title-input"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                onBlur={onSaveTitle}
                maxLength={200}
              />
            </div>
          ) : (
            <h1 onClick={onEditTitle} className="chat-title-editable">
              {chat?.title || 'Conversación'}
              <span className="edit-icon">✏️</span>
            </h1>
          )}
        </div>
        <div className="chat-header-actions">
          <button 
            className="generate-history-button"
            onClick={onGenerateHistory}
            disabled={generatingHistory}
            aria-label="Generar Histórico"
            title="Generar histórico de mantenimiento"
          >
            📋 {generatingHistory ? 'Generando...' : 'Histórico'}
          </button>
          <div className="settings-menu-container" ref={settingsMenuRef}>
            <button 
              className="settings-button"
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              aria-label="Configuración"
            >
              ⚙️
            </button>
            {showSettingsMenu && (
              <div className="settings-dropdown">
                <button 
                  className="settings-option delete-option"
                  onClick={onDeleteChat}
                >
                  🗑️ Eliminar conversación
                </button>
              </div>
            )}
          </div>
          <Link to="/dashboard" className="back-button">
            ← Volver
          </Link>
        </div>
      </div>
    </header>
  );
}

export default ChatHeader;
