# Cataract Recurrence Risk Prediction System

This system uses a **ResNet18** deep learning model to predict the risk of post-surgical cataract recurrence (PCO) based on retinal fundus images. It also provides personalized dietary and lifestyle advice via **Google Gemini AI**.

## Project Structure
- **backend/**: FastAPI server, Model training (PyTorch), and Dataset logic.
- **frontend/**: React.js interface (Vite + Tailwind CSS + Lucide Icons).

---

## 🚀 Getting Started

### 1. Backend Setup
1. **Environment**: Ensure you have Python 3.8+ installed.
2. **Install Dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
3. **Configure API Key**: Create a `.env` file in `backend/` and add:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
4. **Run Server**:
   ```bash
   python -m uvicorn src.api.app:app --reload --port 8000
   ```
   *API Documentation: http://127.0.0.1:8000/docs*

### 2. Frontend Setup
1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```
2. **Run UI**:
   ```bash
   npm run dev -- --port 3000
   ```
   *Dashboard: http://localhost:3000*

### 3. Model Training (Optional)
To retrain the model with the latest fix (3classes: Low, Medium, High Risk):
```bash
cd backend
python -m src.training.train --data_dir . --epochs 10 --batch_size 32
```

---

## 🛠️ Recent Fixes
The model now correctly predicts **High Risk** cases by:
- **Redefined Labeling**: Labeled blurry cataract images as Class 2 (High Risk).
- **Class Weights**: Applied to handle dataset imbalance (Cataract cases are minority).
- **Shuffle Split**: Ensures a representative distribution across Train/Validation sets.

---

## 📊 Verification
Use `python verify_labeling.py` in the backend to check the current class distribution of the dataset.
Structure
- **backend/**: Contains the Python FastAPI server, ML models, and dataset logic.
- **frontend/**: Contains the React.js web interface built with Vite and Tailwind CSS.

## Getting Started

The backend handles image processing, risk prediction, and AI advice generation.

```bash
cd backend
# Ensure your virtual environment is activated
uvicorn src.api.app:app --reload
```
*Runs on: http://127.0.0.1:8000*

### 2. Start the Frontend UI
The frontend provides the user interface for uploading images and viewing results.

```bash
cd frontend
npm run dev
```
*Runs on: http://localhost:5173*

## System Requirements
- Node.js & npm
- Python 3.8+
- Google Gemini API Key (set in `backend/.env`)
