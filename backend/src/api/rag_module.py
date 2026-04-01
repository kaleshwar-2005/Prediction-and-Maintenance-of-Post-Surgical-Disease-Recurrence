import os
import json
import logging
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class RAGSystem:
    def __init__(self, docs_dir="rag_docs", db_dir="chroma_db", collection_name="cataract_rag"):
        """Initialize the RAG system and load documents into Chroma if empty."""
        self.docs_dir = docs_dir
        self.db_dir = db_dir
        self.collection_name = collection_name
        
        logger.info("Initializing HuggingFaceEmbeddings...")
        self.embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
        self.vector_store = self._init_vector_store()
        
    def _init_vector_store(self):
        """Initializes ChromaDB. Loads and embeds documents only if DB is empty."""
        if not os.path.exists(self.db_dir):
            os.makedirs(self.db_dir)
            
        store = Chroma(
            collection_name=self.collection_name,
            embedding_function=self.embeddings,
            persist_directory=self.db_dir
        )
        
        # Check if we already have documents
        collection = store.get()
        if len(collection["ids"]) == 0:
            logger.info("Chroma DB is empty. Proceeding to load documents...")
            self._load_and_embed_documents(store)
        else:
            logger.info(f"Loaded existing Chroma DB with {len(collection['ids'])} chunks.")
            
        return store

    def _load_and_embed_documents(self, store: Chroma):
        """Loads PDFs and TXTs from the docs directory and adds them to Chroma DB."""
        if not os.path.exists(self.docs_dir):
            logger.warning(f"RAG documents directory '{self.docs_dir}' not found. Embedding skipped.")
            return

        documents = []
        for filename in os.listdir(self.docs_dir):
            filepath = os.path.join(self.docs_dir, filename)
            try:
                if filename.endswith(".pdf"):
                    loader = PyPDFLoader(filepath)
                    documents.extend(loader.load())
                    logger.info(f"Loaded PDF: {filename}")
                elif filename.endswith(".txt"):
                    loader = TextLoader(filepath, encoding="utf-8")
                    documents.extend(loader.load())
                    logger.info(f"Loaded TXT: {filename}")
            except Exception as e:
                logger.error(f"Failed to load {filename}: {e}")

        if not documents:
            logger.warning("No parseable documents found in rag_docs/.")
            return

        # Split using the chunk size/overlap specified by rules
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=100
        )
        
        chunks = text_splitter.split_documents(documents)
        logger.info(f"Split documents into {len(chunks)} chunks.")
        
        store.add_documents(chunks)
        # In newer versions of Chroma >0.4 persist() is automatic, but safe to call if it exists
        if hasattr(store, 'persist'):
             store.persist()
             
        logger.info("Successfully persisted chunks to Chroma DB.")

    def generate_recommendation(self, risk: str) -> dict:
        """
        Retrieves context and asks Gemini to generate a recommendation.
        Returns a dictionary matching the specified schema format.
        """
        query = f"Give medical and lifestyle recommendations for {risk} cataract risk patient"
        docs = self.vector_store.similarity_search(query, k=4)
        context = "\n\n".join([doc.page_content for doc in docs])
        
        prompt = f"""
Patient Risk Level: {risk.upper()}

Using the context below, generate:
1. Clinical Recommendation
2. Lifestyle Plan
3. Diet Suggestions

Rules:
- HIGH → urgent medical attention
- MEDIUM → monitoring + lifestyle changes
- LOW → preventive care

Respond strictly with valid JSON using exactly these keys:
"clinical_recommendation", "lifestyle_plan", "diet_suggestions", "disclaimer"

Context:
{context}

Add disclaimer:
"This is not a medical diagnosis."
"""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY missing - returning fallback response.")
            return self._fallback_response(risk, "API key missing.")

        try:
            client = genai.Client(api_key=api_key)
            try:
                response = client.models.generate_content(
                    model='gemini-1.5-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json"
                    )
                )
                return json.loads(response.text)
            except Exception as e1:
                logger.warning(f"gemini-1.5-flash failed: {e1}. Trying gemini-2.0-flash...")
                response = client.models.generate_content(
                    model='gemini-2.0-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json"
                    )
                )
                return json.loads(response.text)
            
        except Exception as e:
            logger.error(f"Gemini API Generation Error: {e}")
            return self._fallback_response(risk, f"API error: {e}")
            
    def _fallback_response(self, risk: str, reason: str) -> dict:
        logger.warning(f"Generating fallback advice for {risk.upper()} due to: {reason}")
        level = risk.upper()
        
        if level == "HIGH" or level == "HIGH RISK":
            return {
                "clinical_recommendation": "🚨 **URGENT CONSULTATION REQUIRED**\n- Immediate consultation with an ophthalmologist is strongly recommended.\n- Detailed eye examination and imaging required.\n- Evaluate for surgical intervention.",
                "lifestyle_plan": "🚗 **Avoid Driving:** Especially at night or in low visibility conditions.\n👓 **Wear Protective Eyewear:** Consistently shield eyes from UV rays and pollutants.\n🩸 **Comorbid Conditions:** Maintain strict control of diabetes or hypertension.",
                "diet_suggestions": "🥗 **Nutrient-Rich Diet:** High antioxidant content.\n🚫 **Avoid Sugar:** Strictly limit sugars and processed foods.\n🍊 **Vitamins C & E:** High intake of Oranges, Kiwis, and Almonds.",
                "disclaimer": "This system provides AI-assisted recommendations based on available data. It is not a substitute for professional medical diagnosis or treatment. Always consult a qualified ophthalmologist."
            }
        elif level == "MEDIUM" or level == "MODERATE" or level == "MEDIUM RISK":
            return {
                "clinical_recommendation": "⚠️ **MODERATE CAUTION ADVISED**\n- Periodic eye examinations (every 3–6 months).\n- Regular ophthalmologist monitoring is advised.\n- Consider medical consultation if symptoms (like blurred vision or glare) worsen.",
                "lifestyle_plan": "💻 **Digital Eye Strain:** Reduce screen time and use proper lighting.\n🩸 **Blood Sugar:** Manage levels strictly, especially if diabetic.\n🚗 **Driving Restrictions:** Limit night driving and activities requiring sharp vision.",
                "diet_suggestions": "🥬 **Leafy Greens:** Eat more Spinach and Kale for Lutein.\n🐟 **Omega-3 Fats:** Increase antioxidant-rich foods and omega-3 intake.\n💊 **Supplements:** Consider doctor-approved Multivitamins.",
                "disclaimer": "This system provides AI-assisted recommendations based on available data. It is not a substitute for professional medical diagnosis or treatment. Always consult a qualified ophthalmologist."
            }
        else:
            return {
                "clinical_recommendation": "✅ **ROUTINE MAINTENANCE**\n- No immediate medical intervention required.\n- Maintain regular eye check-ups (every 6–12 months).",
                "lifestyle_plan": "💻 **Screen Management:** Reduce prolonged screen exposure and take frequent breaks.\n🕶️ **UV Protection:** Wear UV-protective sunglasses outdoors.\n💧 **General Health:** Maintain good hydration and healthy sleep habits.",
                "diet_suggestions": "🥗 **Balanced Diet:** Rich in antioxidants (Vitamin A, C, E).\n🥬 **Vegetables:** Increase intake of leafy vegetables (spinach, kale).\n🍊 **Fruits:** Include carrots, oranges, and berries.",
                "disclaimer": "This system provides AI-assisted recommendations based on available data. It is not a substitute for professional medical diagnosis or treatment. Always consult a qualified ophthalmologist."
            }

# Global singleton to be initialized by FastAPI startup event
rag_system = None

def init_rag_system():
    global rag_system
    if rag_system is None:
        logger.info("Initializing Default RAG System Instance...")
        try:
            rag_system = RAGSystem()
            logger.info("RAG System successfully initialized.")
        except Exception as e:
            logger.error(f"Failed to initialize RAG system: {e}", exc_info=True)

def get_rag_system() -> RAGSystem:
    return rag_system
