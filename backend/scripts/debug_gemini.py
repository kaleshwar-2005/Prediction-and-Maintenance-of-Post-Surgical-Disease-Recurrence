import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

def debug_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ Error: GEMINI_API_KEY not found in .env file.")
        return

    print(f"Attempting to connect with API Key: {api_key[:5]}...{api_key[-5:]}")
    
    client = genai.Client(api_key=api_key)
    
    models_to_test = ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-2.0-flash']
    
    for model_name in models_to_test:
        print(f"\nTesting model: {model_name}...")
        try:
            response = client.models.generate_content(
                model=model_name,
                contents="Hello, say 'API Working'"
            )
            print(f"✅ Success! Response: {response.text.strip()}")
            return # Stop if one works
        except Exception as e:
            print(f"❌ Failed: {e}")

    print("\nListing available models for your key:")
    try:
        for m in client.models.list():
            print(f"- {m.name} (Supported: {m.supported_generation_methods})")
    except Exception as e:
        print(f"❌ Could not list models: {e}")

if __name__ == "__main__":
    debug_gemini()
