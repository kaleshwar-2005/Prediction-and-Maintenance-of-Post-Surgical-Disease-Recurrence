import torch
from PIL import Image
from src.model.classifier import CataractRiskModel
from src.data.transforms import get_transforms

class Predictor:
    def __init__(self, model_path, device='cpu'):
        self.device = torch.device(device)
        self.model = CataractRiskModel(num_classes=3)
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.to(self.device)
        self.model.eval()
        self.transforms = get_transforms('val')
        
        self.labels_map = {
            0: "Low",
            1: "Medium",
            2: "High"
        }
        
    def predict(self, image_file, filename=None):
        # Normalize filename for matching (logging only now)
        name = filename.lower() if filename else ""
        print(f"DEBUG: Inferencing file '{filename}'")
        
        image = Image.open(image_file).convert('RGB')
        image = self.transforms(image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(image)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted_class = torch.max(probabilities, 1)
            
        risk_level = self.labels_map[predicted_class.item()]
        score = confidence.item()
        
        recommendation = self._get_recommendation(risk_level)
        
        return {
            "recurrence_risk": risk_level,
            "confidence": round(score, 2),
            "recommendation": recommendation
        }

    def _get_recommendation(self, risk):
        if risk == "Low":
            return "Standard follow-up recommended"
        elif risk == "Medium":
            return "Regular monitoring advised"
        else:
            return "Close post-operative monitoring advised"
