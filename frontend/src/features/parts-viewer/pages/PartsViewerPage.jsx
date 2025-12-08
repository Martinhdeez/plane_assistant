import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PartsList from '../components/PartsList';
import Viewer3D from '../components/Viewer3D';
import PartCard from '../components/PartCard';
import './PartsViewerPage.css';

// Mock data - Modelos 3D reales descargados y organizados por categorías
const MOCK_PARTS = [
  // AERONAVE COMPLETA
  {
    id: 1,
    name: 'Avión Completo',
    category: 'Aeronaves',
    description: 'Modelo 3D completo de un avión comercial con fuselaje, alas, cola y todos los detalles.',
    model_url: '/models/aircraft-parts/airplane-complete/Airplane_v1_L1.123c4a6fedec-1680-4a36-a228-b0d440a4f280/11803_Airplane_v1_l1.obj',
    thumbnail_url: null,
    file_format: 'obj'
  },
  
  // HÉLICES
  {
    id: 2,
    name: 'Hélice de 3 Palas',
    category: 'Hélices',
    description: 'Hélice de tres palas para aeronaves de propulsión.',
    model_url: '/models/aircraft-parts/4_tri_blade_propeller.glb',
    thumbnail_url: null,
    file_format: 'glb'
  },
  
  // MOTORES Y TURBINAS - Ensamblajes Completos
  {
    id: 3,
    name: 'Motor Turbofan - Ensamblaje Completo',
    category: 'Motores',
    description: 'Ensamblaje completo del motor turbofan con todos los componentes integrados.',
    model_url: '/models/aircraft-parts/Turbine JET Engine- Project/Turbine Assembly- JET v9.stl',
    thumbnail_url: null,
    file_format: 'stl'
  },
  {
    id: 4,
    name: 'Etapa de Combustión Completa',
    category: 'Motores',
    description: 'Ensamblaje completo de la etapa de combustión del motor.',
    model_url: '/models/aircraft-parts/Turbine JET Engine- Project/Combustion Stage - JET v6.stl',
    thumbnail_url: null,
    file_format: 'stl'
  },
  
  // COMPONENTES DE COMPRESIÓN
  {
    id: 5,
    name: 'Ventilador de Compresión Frontal',
    category: 'Compresión',
    description: 'Ventilador frontal de compresión del motor turbofan.',
    model_url: '/models/aircraft-parts/Turbine JET Engine- Project/Front Compression Fan-1- JET v3.stl',
    thumbnail_url: null,
    file_format: 'stl'
  },
  {
    id: 6,
    name: 'Ventilador de Admisión',
    category: 'Compresión',
    description: 'Ventilador de admisión de aire del motor.',
    model_url: '/models/aircraft-parts/Turbine JET Engine- Project/Intake Fan- JET v2.stl',
    thumbnail_url: null,
    file_format: 'stl'
  },
  {
    id: 7,
    name: 'Cono Nasal Aerodinámico',
    category: 'Compresión',
    description: 'Cono nasal aerodinámico del motor turbofan.',
    model_url: '/models/aircraft-parts/Turbine JET Engine- Project/Nose Cone - JET v2.stl',
    thumbnail_url: null,
    file_format: 'stl'
  },
  
  // COMPONENTES DE COMBUSTIÓN
  {
    id: 8,
    name: 'Cámara de Combustión',
    category: 'Combustión',
    description: 'Cámara de combustión principal del motor a reacción.',
    model_url: '/models/aircraft-parts/Turbine JET Engine- Project/Combustion Chamber Assembly- JET v4.stl',
    thumbnail_url: null,
    file_format: 'stl'
  },
  {
    id: 9,
    name: 'Carcasa de Combustión',
    category: 'Combustión',
    description: 'Carcasa externa de la cámara de combustión.',
    model_url: '/models/aircraft-parts/Turbine JET Engine- Project/Combustion Casing - JET v2.stl',
    thumbnail_url: null,
    file_format: 'stl'
  },
  
  // COMPONENTES DE TURBINA
  {
    id: 10,
    name: 'Álabes de Turbina',
    category: 'Turbina',
    description: 'Álabes de la turbina del motor a reacción.',
    model_url: '/models/aircraft-parts/Turbine JET Engine- Project/Turbine Fan-1- JET v1.stl',
    thumbnail_url: null,
    file_format: 'stl'
  },
  {
    id: 11,
    name: 'Carcasa de Turbina',
    category: 'Turbina',
    description: 'Carcasa protectora de la turbina del motor.',
    model_url: '/models/aircraft-parts/Turbine JET Engine- Project/Turbine Housing- JET v3.stl',
    thumbnail_url: null,
    file_format: 'stl'
  },
  {
    id: 12,
    name: 'Eje de Turbina',
    category: 'Turbina',
    description: 'Eje principal de la turbina.',
    model_url: '/models/aircraft-parts/Turbine JET Engine- Project/Turbine Shaft- JET v3.stl',
    thumbnail_url: null,
    file_format: 'stl'
  },
  
  // COMPONENTES ESTRUCTURALES
  {
    id: 13,
    name: 'Eje Principal del Motor',
    category: 'Estructura',
    description: 'Eje principal del ensamblaje del motor turbofan.',
    model_url: '/models/aircraft-parts/Turbine JET Engine- Project/Main Axis Assembly v11.stl',
    thumbnail_url: null,
    file_format: 'stl'
  },
  {
    id: 14,
    name: 'Rodamiento de Alta Velocidad',
    category: 'Estructura',
    description: 'Rodamiento de alta velocidad del motor.',
    model_url: '/models/aircraft-parts/Turbine JET Engine- Project/Bearing- JET v3.stl',
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
