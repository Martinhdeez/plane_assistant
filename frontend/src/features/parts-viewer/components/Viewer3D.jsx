import { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import './Viewer3D.css';

// Check if WebGL is available
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

function Model({ url, fileFormat }) {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    setLoading(true);
    setError(null);

    let loader;
    const format = fileFormat?.toLowerCase() || 'gltf';

    // Select appropriate loader based on file format
    switch (format) {
      case 'gltf':
      case 'glb':
        loader = new GLTFLoader();
        break;
      case 'obj':
        loader = new OBJLoader();
        break;
      case 'stl':
        loader = new STLLoader();
        break;
      default:
        loader = new GLTFLoader();
    }

    loader.load(
      url,
      (loadedModel) => {
        let scene;
        
        if (format === 'gltf' || format === 'glb') {
          scene = loadedModel.scene;
        } else if (format === 'stl') {
          // STL returns geometry, need to create mesh
          const geometry = loadedModel;
          const material = new THREE.MeshStandardMaterial({ 
            color: 0x0288d1,
            metalness: 0.5,
            roughness: 0.5
          });
          scene = new THREE.Mesh(geometry, material);
        } else {
          scene = loadedModel;
        }

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        
        scene.scale.multiplyScalar(scale);
        scene.position.sub(center.multiplyScalar(scale));

        setModel(scene);
        setLoading(false);
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total) * 100, '%');
      },
      (err) => {
        console.error('Error loading model:', err);
        setError('Error al cargar el modelo 3D');
        setLoading(false);
      }
    );
  }, [url, fileFormat]);

  if (loading) return null;
  if (error) return null;
  if (!model) return null;

  return <primitive object={model} />;
}

function Viewer3D({ modelUrl, fileFormat, wireframe = false }) {
  const controlsRef = useRef();
  const [webglAvailable, setWebglAvailable] = useState(true);

  useEffect(() => {
    setWebglAvailable(isWebGLAvailable());
  }, []);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  if (!webglAvailable) {
    return (
      <div className="viewer3d-container">
        <div className="webgl-error">
          <div className="error-icon">⚠️</div>
          <h3>WebGL no está disponible</h3>
          <p>El visor 3D requiere WebGL para funcionar. Por favor, habilita WebGL en tu navegador:</p>
          
          <div className="instructions">
            <h4>Firefox:</h4>
            <ol>
              <li>Escribe <code>about:config</code> en la barra de direcciones</li>
              <li>Busca <code>webgl.disabled</code></li>
              <li>Cambia el valor a <strong>false</strong></li>
              <li>Reinicia el navegador</li>
            </ol>

            <h4>Chrome/Edge:</h4>
            <ol>
              <li>Escribe <code>chrome://settings</code> en la barra de direcciones</li>
              <li>Ve a "Sistema"</li>
              <li>Activa "Usar aceleración por hardware cuando esté disponible"</li>
              <li>Reinicia el navegador</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="viewer3d-container">
      <Canvas className="viewer3d-canvas">
        <PerspectiveCamera makeDefault position={[3, 3, 3]} />
        <OrbitControls 
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          minDistance={1}
          maxDistance={10}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        
        {/* Environment for reflections */}
        <Environment preset="city" />
        
        {/* Grid helper */}
        <gridHelper args={[10, 10]} />
        
        {/* Load the 3D model */}
        {modelUrl && <Model url={modelUrl} fileFormat={fileFormat} />}
      </Canvas>
      
      <div className="viewer3d-controls">
        <button className="control-btn" onClick={resetCamera} title="Reset Camera">
          🔄
        </button>
      </div>
    </div>
  );
}

export default Viewer3D;

