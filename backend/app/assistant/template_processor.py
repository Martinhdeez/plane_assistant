"""
PDF Template Processor
Extracts maintenance steps from PDF instruction templates using Gemini AI
"""
import PyPDF2
from pathlib import Path
from app.core.config import settings
import google.generativeai as genai

# Configure Gemini
genai.configure(api_key=settings.GOOGLE_API_KEY)

async def extract_steps_from_pdf(pdf_path: str) -> list[dict]:
    """
    Extract structured maintenance steps from a PDF template
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        List of steps with structure: [{"step_number": 1, "title": "...", "description": "..."}]
    """
    # Read PDF content
    pdf_file_path = Path(pdf_path)
    if not pdf_file_path.exists():
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    
    # Extract text from PDF
    text_content = ""
    with open(pdf_file_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            text_content += page.extract_text() + "\n"
    
    if not text_content.strip():
        raise ValueError("No text content found in PDF")
    
    # Use Gemini to extract structured steps
    model = genai.GenerativeModel(settings.GEMINI_MODEL)
    
    prompt = f"""Analiza el siguiente documento de instrucciones de mantenimiento aeronáutico y extrae los pasos en formato estructurado.

DOCUMENTO:
{text_content[:8000]}  # Limit to avoid token limits

INSTRUCCIONES:
1. Identifica todos los pasos del procedimiento de mantenimiento
2. Para cada paso, extrae:
   - Número del paso
   - Título/resumen breve del paso (máximo 100 caracteres)
   - Descripción detallada del paso

3. Devuelve SOLO un JSON válido con este formato exacto:
{{
  "steps": [
    {{
      "step_number": 1,
      "title": "Título del paso 1",
      "description": "Descripción detallada del paso 1"
    }},
    {{
      "step_number": 2,
      "title": "Título del paso 2",
      "description": "Descripción detallada del paso 2"
    }}
  ]
}}

IMPORTANTE: Devuelve SOLO el JSON, sin texto adicional antes o después."""

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.1,
                max_output_tokens=4096,
            )
        )
        
        # Parse response
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        import json
        result = json.loads(response_text)
        
        steps = result.get("steps", [])
        
        # Renumber steps sequentially to avoid duplicates
        # The PDF might have steps numbered 1, 1, 1 or 1.A, 1.B, etc.
        # We need sequential integers: 1, 2, 3, ...
        valid_steps = []
        for index, step in enumerate(steps, start=1):
            # Skip if essential fields are missing
            if not step.get("title"):
                continue
            
            valid_steps.append({
                "step_number": index,  # Use sequential index
                "title": step.get("title", f"Paso {index}"),
                "description": step.get("description")
            })
        
        return valid_steps
        
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        print(f"Response text: {response_text}")
        # Return empty list if parsing fails
        return []
    except Exception as e:
        print(f"Error extracting steps: {e}")
        return []
