import os
from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv()

# Get API key
api_key = os.getenv("GEMINI_API_KEY")

print("Current Folder:", os.getcwd())
print("API Key Loaded:", "Yes" if api_key else "No")

# Create Gemini client
client = genai.Client(api_key=api_key)

# Generate response
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="Say Hello"
)

print("\nGemini Response:")
print(response.text)