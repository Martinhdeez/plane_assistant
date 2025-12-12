from sqlalchemy.orm import Session
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.maintenance_history.models import MaintenanceHistory
from app.maintenance_history.schemas import MaintenanceHistoryCreate
from app.assistant.chat.chat import Chat
from app.assistant.message.message import Message
from app.core.config import settings
import google.generativeai as genai
import json


# Configure Gemini
genai.configure(api_key=settings.GOOGLE_API_KEY)


async def generate_history_from_chat(
    db: AsyncSession,
    chat_id: int,
    user_id: int
) -> MaintenanceHistory:
    """
    Generate maintenance history from chat using AI
    """
    # Get chat and messages
    chat_result = await db.execute(
        select(Chat).where(Chat.id == chat_id, Chat.user_id == user_id)
    )
    chat = chat_result.scalar_one_or_none()
    
    if not chat:
        raise ValueError("Chat not found")
    
    messages_result = await db.execute(
        select(Message).where(Message.chat_id == chat_id).order_by(Message.created_at)
    )
    messages = messages_result.scalars().all()
    
    if len(messages) < 2:
        raise ValueError("El chat debe tener al menos 1 intercambio (2 mensajes) para generar un histórico")
    
    # Build conversation text
    conversation = "\n\n".join([
        f"{'USUARIO' if msg.role == 'user' else 'ASISTENTE'}: {msg.content}"
        for msg in messages
    ])
    
    # Create AI prompt
    prompt = f"""Analiza esta conversación de mantenimiento aeronáutico y genera un histórico estructurado.

CONVERSACIÓN:
{conversation}

Genera un JSON con la siguiente estructura exacta:
{{
  "title": "Título breve del mantenimiento (máximo 100 caracteres)",
  "summary": "Resumen ejecutivo de 2-3 líneas explicando qué se hizo",
  "aircraft_info": {{
    "model": "Modelo de aeronave (o null si no se menciona)",
    "registration": "Matrícula (o null si no se menciona)",
    "operator": "Operador (o null si no se menciona)"
  }},
  "maintenance_actions": [
    {{
      "action": "Descripción clara de la acción realizada",
      "result": "Resultado de la acción",
      "date": "Fecha si se menciona, null si no"
    }}
  ],
  "parts_used": [
    {{
      "part_name": "Nombre de la pieza",
      "part_number": "Número de parte si se menciona",
      "quantity": 1
    }}
  ]
}}

REGLAS IMPORTANTES:
1. Solo incluye información que se mencione EXPLÍCITAMENTE en la conversación
2. Si no se menciona algo, usa null o lista vacía []
3. El resumen debe ser conciso pero informativo
4. Las acciones deben ser específicas del mantenimiento realizado
5. Solo incluye piezas que realmente se mencionen que fueron utilizadas
6. Responde SOLO con el JSON, sin texto adicional"""

    # Call Gemini AI
    model = genai.GenerativeModel("gemini-2.0-flash-exp")
    response = model.generate_content(prompt)
    
    # Parse JSON response
    try:
        # Extract JSON from response
        response_text = response.text.strip()
        # Remove markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        history_data = json.loads(response_text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Error al parsear la respuesta de IA: {str(e)}")
    
    # Create maintenance history
    history = MaintenanceHistory(
        chat_id=chat_id,
        user_id=user_id,
        title=history_data.get("title", "Histórico de Mantenimiento"),
        summary=history_data.get("summary", ""),
        aircraft_info=history_data.get("aircraft_info"),
        maintenance_actions=history_data.get("maintenance_actions", []),
        parts_used=history_data.get("parts_used", [])
    )
    
    db.add(history)
    await db.commit()
    await db.refresh(history)
    
    return history


async def get_histories_by_user(
    db: AsyncSession,
    user_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[MaintenanceHistory]:
    """Get all maintenance histories for a user"""
    result = await db.execute(
        select(MaintenanceHistory)
        .where(MaintenanceHistory.user_id == user_id)
        .order_by(desc(MaintenanceHistory.created_at))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def get_history_by_id(
    db: AsyncSession,
    history_id: int,
    user_id: int
) -> Optional[MaintenanceHistory]:
    """Get a specific maintenance history"""
    result = await db.execute(
        select(MaintenanceHistory).where(
            MaintenanceHistory.id == history_id,
            MaintenanceHistory.user_id == user_id
        )
    )
    return result.scalar_one_or_none()


async def get_history_by_chat(
    db: AsyncSession,
    chat_id: int,
    user_id: int
) -> Optional[MaintenanceHistory]:
    """Get maintenance history for a specific chat"""
    result = await db.execute(
        select(MaintenanceHistory).where(
            MaintenanceHistory.chat_id == chat_id,
            MaintenanceHistory.user_id == user_id
        )
    )
    return result.scalar_one_or_none()


async def delete_history(
    db: AsyncSession,
    history_id: int,
    user_id: int
) -> bool:
    """Delete a maintenance history"""
    result = await db.execute(
        select(MaintenanceHistory).where(
            MaintenanceHistory.id == history_id,
            MaintenanceHistory.user_id == user_id
        )
    )
    history = result.scalar_one_or_none()
    
    if not history:
        return False
    
    await db.delete(history)
    await db.commit()
    return True

