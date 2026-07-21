import os
import json
import logging
import time
import re
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

logger = logging.getLogger(__name__)

# Initialize client with timeout to prevent hanging
client = Groq(
    api_key=os.getenv("GROQ_API_KEY"),
    timeout=15.0
)

MODEL = "llama-3.3-70b-versatile"

def _clean_json_response(raw_text: str) -> str:
    """
    Remove markdown code blocks wrapping JSON if present.
    """
    raw_text = raw_text.strip()
    if raw_text.startswith("```"):
        match = re.search(r'```(?:json)?\s*(.*?)\s*```', raw_text, re.DOTALL)
        if match:
            return match.group(1).strip()
    return raw_text

def _validate_schema(data: dict) -> dict:
    """
    Ensure the returned dictionary has the expected keys.
    Supply defaults for any missing keys to prevent crashes in main.py.
    """
    return {
        "possible_attack": data.get("possible_attack", "None"),
        "attack_confidence": data.get("attack_confidence", 0),
        "executive_summary": data.get("executive_summary", ""),
        "indicators": data.get("indicators", {}),
        "specific_observations": data.get("specific_observations", []),
        "recommendation": data.get("recommendation", "Exercise caution."),
        "target_brand": data.get("target_brand", None)
    }

def analyze_with_ai(prompt: str) -> dict | None:
    """
    Analyze phishing content using Groq.
    Returns a predictable dictionary or None on total failure.
    """
    for attempt in range(3):
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert cybersecurity analyst. Return ONLY raw JSON without markdown wrapping."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.2,
                response_format={"type": "json_object"},
            )

            raw_content = response.choices[0].message.content
            if not raw_content:
                raise ValueError("Empty response from model")

            clean_json_str = _clean_json_response(raw_content)
            
            try:
                result = json.loads(clean_json_str)
            except json.JSONDecodeError as e:
                logger.warning(f"JSON Parsing failed on attempt {attempt + 1}: {e}")
                continue # Retry on bad JSON

            if not isinstance(result, dict):
                raise ValueError(f"Expected dict, got {type(result)}")
                
            return _validate_schema(result)

        except Exception as e:
            logger.warning(f"Groq attempt {attempt + 1} failed: {type(e).__name__} - {e}")
            if attempt < 2:
                time.sleep(2)

    logger.error("All AI attempts failed.")
    return None