from pydantic import BaseModel

class RiskResponse(BaseModel):
    recurrence_risk: str
    confidence: float
    recommendation: str
    detailed_advice: str

class RecommendationRequest(BaseModel):
    risk: str
