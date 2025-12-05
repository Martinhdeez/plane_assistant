from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.config import settings

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
    
    async def chat(self, user_message: str) -> str:
        """
        Send a message to Gemini and get a response.
        
        Args:
            user_message: The user's question or message
            
        Returns:
            The AI assistant's response
        """
        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=user_message)
        ]
        
        response = await self.model.ainvoke(messages)
        return response.content

# Singleton instance
gemini_service = GeminiService()
