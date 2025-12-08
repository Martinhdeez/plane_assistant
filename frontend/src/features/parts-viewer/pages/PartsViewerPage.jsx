import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PartsList from '../components/PartsList';
import Viewer3D from '../components/Viewer3D';
import PartCard from '../components/PartCard';
import './PartsViewerPage.css';

// Mock data - Modelos 3D reales descargados
const MOCK_PARTS = [
  {
    id: 1,
    name: 'Motor Turbofan CFM56',
    category: 'Turbinas',
    description: 'Motor turbofan de alto rendimiento utilizado en aeronaves comerciales Boeing 737 y Airbus A320.',
    model_url: '/models/aircraft-parts/Turbine JET Engine- Project/Turbine Assembly- JET v9.stl',
    thumbnail_url: null,
    file_format: 'stl'
  },
  {
    id: 2,
    name: 'Ventilador de Compresión',
    category: 'Turbinas',
    description: 'Ventilador frontal de compresión del motor turbofan.',
    model_url: '/models/aircraft-parts/Turbine JET Engine- Project/Front Compression Fan-1- JET v3.stl',
    thumbnail_url: null,
    file_format: 'stl'
  },
  {
    id: 3,
    name: 'Cámara de Combustión',
    category: 'Turbinas',
    description: 'Cámara de combustión del motor a reacción.',
    model_url: '/models/aircraft-parts/Turbine JET Engine- Project/Combustion Chamber Assembly- JET v4.stl',
    thumbnail_url: null,
    file_format: 'stl'
  },
  {
    id: 4,
    name: 'Hélice de 3 Palas',
    category: 'Hélices',
    description: 'Hélice de tres palas para aeronaves de propulsión.',
    model_url: '/models/aircraft-parts/4_tri_blade_propeller.glb',
    thumbnail_url: null,
    file_format: 'glb'
  },
  {
    id: 5,
    name: 'Eje Principal del Motor',
    category: 'Turbinas',
    description: 'Eje principal del ensamblaje del motor turbofan.',
    model_url: '/models/aircraft-parts/Turbine JET Engine- Project/Main Axis Assembly v11.stl',
    thumbnail_url: null,
    file_format: 'stl'
  },
  {
    id: 6,
    name: 'Carcasa de Turbina',
    category: 'Turbinas',
    description: 'Carcasa protectora de la turbina del motor.',
    model_url: '/models/aircraft-parts/Turbine JET Engine- Project/Turbine Housing- JET v3.stl',
    thumbnail_url: null,
    file_format: 'stl'
  }
];

function PartsViewerPage() {
  const [parts, setParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setParts(MOCK_PARTS);
      setLoading(false);
    }, 500);
  }, []);

  const handleSelectPart = (part) => {
    setSelectedPart(part);
  };

  return (
    <div className="parts-viewer-page">
      {/* Clouds Background */}
      <div className="clouds-background">
        <div className="cloud cloud-1">☁️</div>
        <div className="cloud cloud-2">☁️</div>
        <div className="cloud cloud-3">☁️</div>
        <div className="cloud cloud-4">☁️</div>
        <div className="cloud cloud-5">☁️</div>
        <div className="cloud cloud-6">☁️</div>
      </div>

      {/* Header */}
      <header className="parts-viewer-header">
        <div className="container">
          <Link to="/dashboard" className="back-link">
            ← Volver al Dashboard
          </Link>
          <h1 className="page-title">Visor 3D de Piezas Aeronáuticas</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="parts-viewer-content">
        <div className="container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Cargando catálogo de piezas...</p>
            </div>
          ) : (
            <div className="viewer-layout">
              {/* Sidebar with parts list */}
              <aside className="viewer-sidebar">
                <PartsList
                  parts={parts}
                  onSelectPart={handleSelectPart}
                  selectedPartId={selectedPart?.id}
                />
              </aside>

              {/* Main viewer area */}
              <div className="viewer-main">
                <div className="viewer-section">
                  <Viewer3D
                    modelUrl={selectedPart?.model_url}
                    fileFormat={selectedPart?.file_format}
                  />
                </div>
                
                <div className="info-section">
                  <PartCard part={selectedPart} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PartsViewerPage;
