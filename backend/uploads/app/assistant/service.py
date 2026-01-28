from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from app.core.config import settings
import google.generativeai as genai
from PIL import Image
import json

# System prompt especializado en mantenimiento de aviones
SYSTEM_PROMPT = """Eres un asistente experto en mantenimiento de aeronaves, especializado en ayudar a operarios y técnicos de mantenimiento aeronáutico.

Tu función es:
- Proporcionar información técnica precisa sobre procedimientos de mantenimiento de aviones
- Ayudar con inspecciones, reparaciones y troubleshooting de sistemas aeronáuticos
- Explicar procedimientos de seguridad y normativas de aviación
- Asistir en la interpretación de manuales técnicos (AMM, CMM, SRM, etc.)
- Proporcionar guías paso a paso para tareas de mantenimiento
- Ayudar con la identificación de componentes y sistemas de aeronaves

Características de tus respuestas:
- Siempre prioriza la seguridad y las normativas aeronáuticas
- Sé preciso y técnico, pero claro en tus explicaciones
- Si no estás seguro de algo, indícalo claramente
- Recomienda siempre consultar la documentación oficial del fabricante
- Usa terminología aeronáutica estándar (ICAO/EASA/FAA)
- Responde en español de forma profesional

**IMPORTANTE - Especificación de Herramientas:**
Cuando proporciones instrucciones de mantenimiento, inspección o reparación, SIEMPRE debes:
1. **Listar las herramientas necesarias** al inicio de tus instrucciones
2. **Especificar el equipo requerido** (herramientas manuales, equipos de medición, EPIs, etc.)
3. **Indicar herramientas especiales** si se requieren (calibradas, específicas del fabricante, etc.)
4. **Mencionar equipos de seguridad** obligatorios para la tarea

Formato recomendado para tus respuestas:
🔧 **Herramientas y Equipo Necesario:**
- [Lista las herramientas específicas]
- [Incluye equipos de medición si aplica]
- [Menciona EPIs/equipos de seguridad]

📝 **Procedimiento:**
- [Pasos detallados]

Recuerda: La seguridad es lo primero. Siempre que sea necesario, recuerda al operario seguir los procedimientos oficiales y las normativas de seguridad aplicables."""

class GeminiService:
    def __init__(self):
        self.model = ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL,
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0, 
            max_output_tokens=2048,
        )
        # Configure Gemini for vision
        genai.configure(api_key=settings.GOOGLE_API_KEY)
    
    async def chat(self, message: str, history: list[dict], chat_context: dict | None = None) -> str:
        """
        Send a message to Gemini and get a response
        Args:
            message: User's message
            history: List of previous messages [{"role": "user", "content": "..."}, ...]
            chat_context: Optional context with airplane_model, component_type, and current_step
        """
        # Build system prompt with context if provided
        system_prompt = SYSTEM_PROMPT
        if chat_context:
            context_parts = []
            if chat_context.get("airplane_model"):
                context_parts.append(f"- Modelo de avión: {chat_context['airplane_model']}")
            if chat_context.get("component_type"):
                context_parts.append(f"- Componente/Sistema: {chat_context['component_type']}")
            
            if context_parts:
                system_prompt += "\n\nCONTEXTO DE ESTA CONVERSACIÓN:\n" + "\n".join(context_parts)
                system_prompt += "\n\nEnfoca tus respuestas específicamente en este modelo de avión y este sistema/componente."
            
            # Add current step context if available
            if chat_context.get("current_step"):
                step = chat_context["current_step"]
                system_prompt += f"\n\nPASO ACTUAL DEL PROCEDIMIENTO:\n"
                system_prompt += f"Paso {step['step_number']}: {step['title']}\n"
                if step.get('description'):
                    system_prompt += f"Descripción: {step['description']}\n"
                system_prompt += "\n**IMPORTANTE - FORMATO DE RESPUESTA:**\n"
                system_prompt += "Tu objetivo es ayudar al operario a completar ESTE PASO ESPECÍFICO.\n"
                system_prompt += "Cuando proporciones instrucciones o procedimientos, sé MUY ESPECÍFICO:\n\n"
                system_prompt += "✓ Menciona ubicaciones EXACTAS (panel, lado izquierdo/derecho, altura)\n"
                system_prompt += "✓ Especifica herramientas CONCRETAS (llaves de 10mm, torquímetro 0-50 Nm, etc.)\n"
                system_prompt += "✓ Numera cada actividad claramente (1. 2. 3.)\n"
                system_prompt += "✓ Detalla QUÉ hacer, DÓNDE hacerlo, CON QUÉ herramienta, y CÓMO verificar\n\n"
                system_prompt += "Ejemplo de formato:\n"
                system_prompt += "**Herramientas necesarias:**\n"
                system_prompt += "- Llave dinamométrica (0-50 Nm)\n"
                system_prompt += "- Destornillador Phillips #2\n\n"
                system_prompt += "**Procedimiento:**\n"
                system_prompt += "1. Localizar el panel de acceso inferior derecho (a 1.5m del suelo)\n"
                system_prompt += "2. Retirar los 4 tornillos Phillips usando destornillador #2\n"
                system_prompt += "3. Verificar que los tornillos estén en buen estado antes de guardar\n\n"
                system_prompt += "Cuando el operario confirme que ha completado el paso, recuérdale marcar el paso como completado."
        
        messages = [SystemMessage(content=system_prompt)]
        
        # Add message history if provided
        if history:
            for msg in history:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    messages.append(AIMessage(content=msg["content"]))
        
        # Add current user message
        messages.append(HumanMessage(content=message))
        
        response = await self.model.ainvoke(messages)
        return response.content
    
    async def chat_with_image(
        self,
        image_path: str,
        message: str,
        history: list[dict] = None,
        chat_context: dict = None
    ) -> dict:
        """
        Process a message with an image using Gemini Vision.
        
        Args:
            image_path: Path to the image file
            message: The user's question about the image
            history: Optional previous messages for context
            chat_context: Optional dict with airplane_model and component_type
            
        Returns:
            dict with:
                - text: Analysis and instructions
                - annotations: List of {x, y, label, text} for drawing on image
        """
        # Load image
        img = Image.open(image_path)
        
        # Create vision model - use the same model as configured
        vision_model = genai.GenerativeModel(settings.GEMINI_MODEL)
        
        # Build context from history
        context = ""
        if history:
            context = "\n\nContexto de la conversación previa:\n"
            for msg in history[-3:]:  # Last 3 messages for context
                role = "Usuario" if msg["role"] == "user" else "Asistente"
                context += f"{role}: {msg['content']}\n"
        
        # Build context-aware prompt
        context_info = ""
        if chat_context:
            context_info = f"\nModelo de avión: {chat_context.get('airplane_model', 'No especificado')}\n"
            context_info += f"Sistema/Componente: {chat_context.get('component_type', 'No especificado')}\n"
        
        # Structured prompt for annotations - DYNAMIC based on user question
        prompt = f"""Eres un asistente experto en mantenimiento aeronáutico analizando una imagen.

PREGUNTA DEL USUARIO: {message}
{context_info}{context}

INSTRUCCIONES - Analiza la pregunta y responde según el tipo:
1. Verificación ("¿está bien?", "¿es correcto?", "¿va bien?"): Inspecciona buscando problemas, tornillos flojos, fugas, daños. Marca problemas encontrados.
2. Ubicación ("¿dónde está?", "ubica", "localiza"): Encuentra y marca el componente/tornillo/pieza específica que menciona.
3. Identificación ("¿qué es?", "identifica"): Identifica componentes principales visibles (máximo 5-6 más relevantes).
4. Inspección/procedimiento: Proporciona pasos específicos y marca puntos clave.

REGLAS para anotaciones (círculos):
- Radius: 8-13% del ancho de la imagen
- NO superposición entre círculos
- Coordenadas x,y: centro exacto del elemento (0-100%)
- Text: nombre corto y técnico en español
- IMPORTANTE: Solo marca elementos RELEVANTES a la pregunta del usuario

Responde directamente y útilmente a lo que el usuario preguntó."""

        try:
            # Use JSON schema mode for consistent output
            from google.generativeai.types import GenerationConfig
            
            generation_config = GenerationConfig(
                temperature=0.1,
                max_output_tokens=2048,
                response_mime_type="application/json",
                response_schema={
                    "type": "object",
                    "properties": {
                        "analysis": {"type": "string"},
                        "steps": {
                            "type": "array",
                            "items": {"type": "string"}
                        },
                        "annotations": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "x": {"type": "number"},
                                    "y": {"type": "number"},
                                    "radius": {"type": "number"},
                                    "text": {"type": "string"}
                                },
                                "required": ["x", "y", "radius", "text"]
                            }
                        }
                    },
                    "required": ["analysis", "steps", "annotations"]
                }
            )
            
            # Generate response with image
            response = vision_model.generate_content(
                [prompt, img],
                generation_config=generation_config
            )
            
            # Parse JSON response
            response_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            result = json.loads(response_text)
            
            # Format response text
            formatted_text = f"{result['analysis']}\n\n"
            formatted_text += "Pasos a seguir:\n"
            for i, step in enumerate(result['steps'], 1):
                formatted_text += f"{i}. {step}\n"
            
            return {
                "text": formatted_text,
                "annotations": result.get('annotations', [])
            }
            
        except json.JSONDecodeError as e:
            # Fallback if JSON parsing fails
            print(f"JSON parse error: {e}")
            print(f"Response text: {response_text}")
            return {
                "text": f"Análisis de la imagen:\n\n{response.text}\n\nNota: No se pudieron generar anotaciones automáticas.",
                "annotations": []
            }
        except Exception as e:
            print(f"Error processing image: {e}")
            return {
                "text": f"Error al procesar la imagen: {str(e)}",
                "annotations": []
            }

# Singleton instance
gemini_service = GeminiService()
