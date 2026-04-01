import torch
from src.api.inference import Predictor
import os
from PIL import Image
import numpy as np

def create_test_images():
    print("Creating test images...")
    os.makedirs("test_samples", exist_ok=True)
    # Clear image (all gray)
    clear_img = np.zeros((224, 224, 3), dtype=np.uint8) + 128
    Image.fromarray(clear_img).save("test_samples/clear.jpg")
    
    # Blurry image (random noise which has high variance/is blurry in terms of information but laplacian might be high? No, noise usually has high variance)
    # Actually, a low contrast blurry image:
    blurry_img = np.zeros((224, 224, 3), dtype=np.uint8) + 128
    # Add a very smooth gradient
    for i in range(224):
        blurry_img[i, :, :] = 100 + i // 4
    Image.fromarray(blurry_img).save("test_samples/blurry.jpg")

def test_inference():
    model_path = "model_checkpoints/best_model.pth"
    if not os.path.exists(model_path):
        print(f"Model not found at {model_path}")
        return
        
    print(f"Loading predictor with {model_path}...")
    predictor = Predictor(model_path)
    
    samples = ["test_samples/clear.jpg", "test_samples/blurry.jpg"]
    for sample in samples:
        print(f"\n--- Testing with {sample} ---")
        try:
            with open(sample, "rb") as f:
                result = predictor.predict(f, filename=os.path.basename(sample))
                print(f"Risk: {result['recurrence_risk']}")
                print(f"Confidence: {result['confidence']}")
                print(f"Recommendation: {result['recommendation']}")
        except Exception as e:
            print(f"Error testing {sample}: {e}")

if __name__ == "__main__":
    create_test_images()
    test_inference()
