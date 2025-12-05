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
    
    async def chat(self, user_message: str, message_history: list[dict] = None) -> str:
        """
        Send a message to Gemini and get a response.
        
        Args:
            user_message: The user's question or message
            message_history: Optional list of previous messages for context
                            Format: [{"role": "user"|"assistant", "content": "..."}]
            
        Returns:
            The AI assistant's response
        """
        messages = [SystemMessage(content=SYSTEM_PROMPT)]
        
        # Add message history if provided
        if message_history:
            for msg in message_history:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    messages.append(AIMessage(content=msg["content"]))
        
        # Add current user message
        messages.append(HumanMessage(content=user_message))
        
        response = await self.model.ainvoke(messages)
        return response.content
    
    async def chat_with_image(
        self,
        user_message: str,
        image_path: str,
        message_history: list[dict] = None
    ) -> dict:
        """
        Process a message with an image using Gemini Vision.
        
        Args:
            user_message: The user's question about the image
            image_path: Path to the image file
            message_history: Optional previous messages for context
            
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
        if message_history:
            context = "\n\nContexto de la conversación previa:\n"
            for msg in message_history[-3:]:  # Last 3 messages for context
                role = "Usuario" if msg["role"] == "user" else "Asistente"
                context += f"{role}: {msg['content']}\n"
        
        # Structured prompt for annotations - SIMPLIFIED for JSON mode
        prompt = f"""Analiza esta imagen de un motor de avión y responde a: {user_message}

Identifica 5-6 componentes principales del motor.

REGLAS para círculos:
- Radius: 8-13% del ancho (círculos moderados que rodean bien)
- NO superposición: círculos separados
- Coordenadas x,y: centro exacto del componente (0-100%)
- Nombres: terminología técnica en español

Componentes típicos: Carenado del Núcleo, Carenado del Ventilador, Ventilador (Fan), Compresor Alta Presión, Cámara de Combustión, Tobera de Escape."""

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
