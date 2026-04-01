from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import io
import os
import logging
from src.api.inference import Predictor
from src.api.schemas import RiskResponse, RecommendationRequest
from src.api.rag_module import init_rag_system, get_rag_system

# Configure logging to file
logging.basicConfig(
    filename='backend_api_debug.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Cataract Recurrence Risk Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "model_checkpoints/best_model.pth"
predictor = None

@app.on_event("startup")
def load_predictor():
    global predictor
    logger.info("Starting up API...")
    
    # Initialize Persistent Vector Database & RAG
    init_rag_system()

    if os.path.exists(MODEL_PATH):
        logger.info(f"Loading model from {MODEL_PATH}")
        try:
            predictor = Predictor(MODEL_PATH)
            logger.info("Model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
    else:
        logger.warning("Warning: Model not found. Please train first.")

@app.get("/")
def home():
    return {"message": "API is Running"}

@app.post("/predict", response_model=RiskResponse)
async def predict_risk(file: UploadFile = File(...)):
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded.")
        
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        logger.info(f"Received prediction request for {file.filename}")
        contents = await file.read()
        image_stream = io.BytesIO(contents)
        result = predictor.predict(image_stream, filename=file.filename)
        
        # Fetch RAG-augmented AI advice
        logger.info("Fetching RAG-augmented advice...")
        rag = get_rag_system()
        if rag:
            rag_result = rag.generate_recommendation(result["recurrence_risk"])
            result["recommendation"] = rag_result.get("clinical_recommendation", "Standard clinical monitoring advised.")
            result["detailed_advice"] = (
                f"**Diet Suggestions:**\n{rag_result.get('diet_suggestions', '')}\n\n"
                f"**Lifestyle Plan:**\n{rag_result.get('lifestyle_plan', '')}\n\n"
                f"_{rag_result.get('disclaimer', 'This is not a medical diagnosis.')}_"
            )
        else:
            result["detailed_advice"] = "Secondary AI services are currently unavailable."
        
        logger.info("Prediction successful.")
        return result
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-recommendation")
async def generate_rag_recommendation(request: RecommendationRequest):
    """Standalone RAG generation endpoint satisfying technical requirements."""
    rag = get_rag_system()
    if not rag:
        raise HTTPException(status_code=503, detail="RAG system is not loaded.")
        
    try:
        logger.info(f"Direct RAG request for risk level: {request.risk}")
        return rag.generate_recommendation(request.risk)
    except Exception as e:
        logger.error(f"Failed to generate custom RAG recommendation: {e}")
        raise HTTPException(status_code=500, detail="Generation failed.")
