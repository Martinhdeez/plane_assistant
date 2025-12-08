import { useState } from 'react';
import './PartsList.css';

function PartsList({ parts, onSelectPart, selectedPartId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = ['Todos', 'Turbinas', 'Tren de Aterrizaje', 'Superficies de Control', 'Hélices', 'Aviónica'];

  const filteredParts = parts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         part.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'Todos' || part.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="parts-list-container">
      <div className="parts-list-header">
        <h2>Catálogo de Piezas</h2>
        <p>Selecciona una pieza para visualizarla en 3D</p>
      </div>

      {/* Search Input */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Buscar piezas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category || (!selectedCategory && category === 'Todos') ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category === 'Todos' ? '' : category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Parts List */}
      <div className="parts-grid">
        {filteredParts.length > 0 ? (
          filteredParts.map(part => (
            <div
              key={part.id}
              className={`part-card ${selectedPartId === part.id ? 'selected' : ''}`}
              onClick={() => onSelectPart(part)}
            >
              {part.thumbnail_url && (
                <div className="part-thumbnail">
                  <img src={part.thumbnail_url} alt={part.name} />
                </div>
              )}
              <div className="part-info">
                <h3 className="part-name">{part.name}</h3>
                <p className="part-category">{part.category}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No se encontraron piezas</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PartsList;
