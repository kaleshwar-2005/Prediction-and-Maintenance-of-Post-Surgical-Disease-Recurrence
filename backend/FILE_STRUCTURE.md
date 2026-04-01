# Backend File Structure Documentation

This document explains the purpose of each file and directory within the `backend/` folder of the **Cataract Recurrence Risk Prediction** project.

## 📂 Root Directory (`backend/`)

| File | Purpose |
| :--- | :--- |
| `requirements.txt` | Lists all Python dependencies (e.g., `fastapi`, `torch`, `google-genai`) required to run the project. |
| `.env` | Stores sensitive environment variables such as the `GEMINI_API_KEY`. **Do not commit this file.** |
| `README.md` | Contains specific instructions for setting up and running the backend server. |

---

## 📂 Source Code (`backend/src/`)

The core application logic is organized into modular packages.

### 🌐 API Layer (`src/api/`)
Handles the web server, HTTP requests, and external integrations.

| File | Purpose |
| :--- | :--- |
| **`app.py`** | The main entry point for the FastAPI application. Defines the `/predict` endpoint and initializes the server. |
| **`genai_service.py`** | Manages integration with Google Gemini AI. Handles prompt engineering, API calls, and fallback logic for dietary advice. |
| **`inference.py`** | Contains the logic to load the trained PyTorch model (`.pth`) and run predictions on input images. |
| **`schemas.py`** | Defines Pydantic data models (e.g., `PredictionResult`) to validate API request inputs and response outputs. |

### 📊 Data Layer (`src/data/`)
Handles dataset loading and preprocessing.

| File | Purpose |
| :--- | :--- |
| **`dataset.py`** | Custom PyTorch `Dataset` class (`ODIRDataset`). Loads images and labels, handles filtering for "Cataract" keywords. |
| **`transforms.py`** | Defines image transformations (Resize, Normalize, ToTensor) for both training and validation pipelines. |

### 🧠 Model Layer (`src/model/`)
Defines the neural network architecture.

| File | Purpose |
| :--- | :--- |
| **`classifier.py`** | Defines the `CataractRiskModel` class based on **ResNet18**, modified for 3-class classification (Low/Medium/High). |

### 🏋️ Training Layer (`src/training/`)
Scripts for training and evaluating the model.

| File | Purpose |
| :--- | :--- |
| **`train.py`** | The main training script. Runs the training loop, computes loss, backpropagates errors, and saves model checkpoints. |
| **`evaluate.py`** | Loads a trained model and evaluates it against the validation set, generating metrics like Accuracy and Confusion Matrix. |

---

## 🛠️ Scripts (`backend/scripts/`)

Utility scripts for testing and maintenance.

| File | Purpose |
| :--- | :--- |
| **`find_samples.py`** | A utility to scan the dataset and find example images for specific risk classes (High/Medium) for testing purposes. |
| **`test_api.py`** | A standalone script to send a test POST request to the running API (`localhost:8000/predict`) and print the response. |
