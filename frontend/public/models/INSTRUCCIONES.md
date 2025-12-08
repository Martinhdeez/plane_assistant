# Guía para Descargar e Integrar Modelos 3D de Piezas Aeronáuticas

## 📂 Ubicación de los Modelos

Coloca todos los modelos 3D descargados en:
```
/home/mrtx/Documents/datathon/plane_assistant/frontend/public/models/aircraft-parts/
```

## 🔍 Dónde Descargar Modelos Gratuitos

### Opción 1: Sketchfab (Recomendado)
**URL**: https://sketchfab.com

**Modelos recomendados**:
1. **Motor Turbofan**: Busca "turbofan engine" o "jet engine"
   - https://sketchfab.com/3d-models/turbofan-aircraft-jet-engine-6d34ce0d9c5f4c6d8f0e3c8c3c8c3c8c

2. **Hélice**: Busca "aircraft propeller"
   
3. **Tren de Aterrizaje**: Busca "landing gear"

4. **Superficies de Control**: Busca "aileron" o "flap"

**Cómo descargar**:
1. Encuentra el modelo que te guste
2. Haz clic en "Download 3D Model"
3. Selecciona formato **GLTF** o **GLB** (preferiblemente GLB)
4. Descarga el archivo
5. Renombra el archivo según la pieza

### Opción 2: GrabCAD
**URL**: https://grabcad.com/library

**Cómo descargar**:
1. Busca la pieza (ej: "turbofan engine")
2. Descarga el modelo (usualmente en STEP, STL, o OBJ)
3. Si no está en GLTF/GLB, necesitarás convertirlo con Blender

### Opción 3: Free3D
**URL**: https://free3d.com/3d-models/aircraft

## 🔄 Convertir Modelos a GLTF/GLB (si es necesario)

Si descargas modelos en formato STEP, STL, o OBJ, usa Blender:

1. Abre Blender
2. File → Import → Selecciona el formato (STL, OBJ, etc.)
3. Selecciona el archivo descargado
4. File → Export → glTF 2.0 (.glb)
5. Guarda en la carpeta `public/models/aircraft-parts/`

## 📝 Nombres de Archivo Recomendados

Renombra los archivos descargados así:
- `turbofan-engine.glb` - Motor turbofan
- `landing-gear.glb` - Tren de aterrizaje
- `aileron.glb` - Alerón
- `propeller.glb` - Hélice
- `instrument-panel.glb` - Panel de instrumentos
- `flap.glb` - Flap

## ⚙️ Actualizar el Código

Una vez que hayas descargado los modelos, actualiza el archivo:
`frontend/src/features/parts-viewer/pages/PartsViewerPage.jsx`

Cambia las URLs en `MOCK_PARTS`:

```javascript
const MOCK_PARTS = [
  {
    id: 1,
    name: 'Motor Turbofan CFM56',
    category: 'Turbinas',
    description: 'Motor turbofan de alto rendimiento...',
    model_url: '/models/aircraft-parts/turbofan-engine.glb',
    file_format: 'glb'
  },
  {
    id: 2,
    name: 'Tren de Aterrizaje Principal',
    category: 'Tren de Aterrizaje',
    description: 'Sistema de tren de aterrizaje...',
    model_url: '/models/aircraft-parts/landing-gear.glb',
    file_format: 'glb'
  },
  // ... resto de piezas
];
```

## ✅ Verificar que Funciona

1. Coloca los archivos `.glb` en `public/models/aircraft-parts/`
2. Actualiza las URLs en el código
3. Recarga la página del visor 3D
4. Selecciona una pieza
5. Deberías ver el modelo 3D real

## 🎯 Modelos Específicos Recomendados en Sketchfab

Busca estos términos exactos:
- "Turbofan Jet Engine" by Aviation Academy
- "Aircraft Landing Gear" 
- "Propeller" + filter: Downloadable
- "Aileron" o "Wing Flap"

## 📏 Optimización (Opcional)

Si los modelos son muy pesados:
1. Usa Blender para reducir polígonos
2. Reduce el tamaño de texturas
3. Exporta en GLB (más comprimido que GLTF)

## 🆘 Problemas Comunes

**Modelo no se ve**: 
- Verifica que el archivo esté en `public/models/aircraft-parts/`
- Verifica que la URL en el código sea correcta
- Abre la consola del navegador para ver errores

**Modelo muy grande**:
- Reduce polígonos en Blender
- Usa formato GLB en lugar de GLTF

**Modelo mal orientado**:
- Rota el modelo en Blender antes de exportar
- O ajusta la rotación en el código del visor
