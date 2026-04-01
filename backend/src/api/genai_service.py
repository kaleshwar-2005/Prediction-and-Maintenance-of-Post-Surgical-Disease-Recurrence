from google import genai
import os
from dotenv import load_dotenv

# Load env variables from .env file if present
load_dotenv()

def get_dietary_advice(risk_level):
    """
    Fetches personalized dietary and lifestyle advice from Google Gemini
    based on the predicted cataract recurrence risk level.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        return (
            "⚠️ Gemini API Key missing.\n\n"
            "To get personalized AI recommendations regarding food habits and lifestyle:\n"
            "1. Get an API Key from https://aistudio.google.com/\n"
            "2. Add it to a .env file as GEMINI_API_KEY=your_key_here\n"
            "3. Restart the server."
        )

    try:
        # New Google GenAI SDK Usage
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are an expert ophthalmologist and nutritionist.
        A patient has been diagnosed with a '{risk_level}' risk of Post-Surgical Cataract Recurrence (Posterior Capsule Opacification).
        
        Please provide a concise but detailed recommendation covering:
        1. **Food Habits**: Specific foods to eat (antioxidants, vitamins) and foods to avoid.
        2. **Lifestyle Changes**: Habits to adopt to protect eye health.
        3. **Supplementation**: Common supplements (mention consulting a doctor).
        
        Format the output clearly with bullet points. Keep the tone encouraging but professional. Limit to 150 words.
        """
        
        # Try 1.5 Flash first as it's the most widely available stable model
        try:
            response = client.models.generate_content(
                model='gemini-1.5-flash', 
                contents=prompt
            )
            return response.text
        except Exception as e1:
            print(f"Gemini 1.5 Flash Error: {e1}")
            # Try 2.0 Flash as second option
            try:
                response = client.models.generate_content(
                    model='gemini-2.0-flash', 
                    contents=prompt
                )
                return response.text
            except Exception as e2:
                print(f"Gemini 2.0 Flash Error: {e2}")
                raise e2 # Let the outer fallback handle it
                
    except Exception as final_e:
        # FAIL-SAFE FALLBACK (for Demo/Rate Limit cases)
        return get_fallback_advice(risk_level)

def get_fallback_advice(risk_level):
    """
    Returns static advice to ensure the demo works even if API quota is exceeded.
    """
    common = "- **Hydration**: Drink 2-3L of water daily.\n- **UV Protection**: Always wear sunglasses outdoors."
    
    if risk_level == "High":
        return f"""**⚠️ High Risk Care Plan:**
- **Diet**: Strictly limit sugars. High intake of Vitamin C (Oranges, Kiwis) & E (Almonds).
- **Lifestyle**: Absolute cessation of smoking. Wear UV-400 sunglasses.
- **Supplements**: Consult doctor for high-dose antioxidants.
{common}"""
    
    elif risk_level == "Medium":
        return f"""**⚠️ Moderate Risk Care Plan:**
- **Diet**: Eat more green leafy vegetables (Spinach, Kale) for Lutein.
- **Lifestyle**: Manage blood sugar levels strictly. Reduce screen time.
- **Supplements**: Consider Multivitamins.
{common}"""
    
    else: # Low
        return f"""**✅ Maintenance Care Plan:**
- **Diet**: Balanced diet rich in Omega-3 (Fish, Walnuts).
- **Lifestyle**: Regular exercise to maintain blood pressure.
- **Checkups**: Annual eye exams are sufficient.
{common}"""
