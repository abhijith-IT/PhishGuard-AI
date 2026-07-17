import os
import json
import logging
import time
from dotenv import load_dotenv
load_dotenv()
from groq import Groq

logger = logging.getLogger(__name__)
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

MODEL = "llama-3.3-70b-versatile"


def analyze_with_ai(prompt: str):
    """
    Analyze phishing content using Groq.
    Returns a dictionary or None if every retry fails.
    """

    for attempt in range(3):

        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert cybersecurity analyst."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.2,
                response_format={"type": "json_object"},
            )

            result = json.loads(
                response.choices[0].message.content
            )

            return result

        except Exception as e:

            logger.error(
                "Groq attempt %d failed: %s",
                attempt + 1,
                str(e)
            )

            if attempt < 2:
                time.sleep(2)

    return None