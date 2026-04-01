# Technology Stack Documentation

This document provides a detailed overview of the frameworks, libraries, and tools used in the **Cataract Recurrence Risk Prediction** project, explaining the specific purpose of each component.

## 🖥️ Frontend (User Interface)

The frontend is a Single Page Application (SPA) built for a seamless, interactive user experience.

### Core Frameworks
| Library | Version | Purpose in Project |
| :--- | :--- | :--- |
| **React** | v19.0+ | The main JavaScript library used for building the user interface components (Upload, Results, History). |
| **Vite** | v6.0+ | A next-generation build tool that provides a blazing fast development server and optimized production builds. |
| **TypeScript** | v5.0+ | Adds static typing to JavaScript, ensuring type safety for API responses (`PredictionResult`) and component props. |

### Styling & UI
| Library | Version | Purpose in Project |
| :--- | :--- | :--- |
| **Tailwind CSS** | v4.0+ | A utility-first CSS framework used for the entire styling system (Layouts, Grids, Spacing, Colors). |
| **PostCSS** | v8.0+ | A tool for transforming CSS with JavaScript, used here to compile Tailwind CSS. |
| **Lucide React** | v0.469+ | Provides the consistent, beautiful icon set (e.g., `Activity`, `FileUp`, `History`, `ShieldCheck`) used throughout the app. |

---

## ⚙️ Backend (API & Machine Learning)

The backend is a robust Python application that handles data processing, model inference, and AI integration.

### Web Server & API
| Library | Version | Purpose in Project |
| :--- | :--- | :--- |
| **FastAPI** | v0.95+ | A modern, high-performance web framework used to create the REST API endpoints (`/predict`). |
| **Uvicorn** | v0.22+ | An ASGI web server implementation used to run the FastAPI application. |
| **Python-Multipart** | v0.0.6+ | Required by FastAPI to handle form data parsing, specifically for **image file uploads**. |

### Artificial Intelligence & Deep Learning
| Library | Version | Purpose in Project |
| :--- | :--- | :--- |
| **PyTorch** | v2.0+ | The primary deep learning framework. Used to load and run the **ResNet18** model. |
| **Torchvision** | v0.15+ | Provides the pre-trained model architectures (ResNet) and image transformation utilities (Normalization, Resize). |
| **Google GenAI** | Latest | The official SDK for accessing **Google Gemini 2.0 Flash**. Used to generate personalized dietary/lifestyle advice based on risk level. |

### Data Processing & Utilities
| Library | Version | Purpose in Project |
| :--- | :--- | :--- |
| **Pandas** | v2.0+ | Used for handling structured data, specifically loading the ODIR-5K labels from CSV files. |
| **NumPy** | v1.24+ | Fundamental package for scientific computing, used for array manipulations of image tensors. |
| **Pillow (PIL)** | v9.0+ | Python Imaging Library. Used to open, manipulate, and convert uploaded images before passing them to the model. |
| **Scikit-Learn** | v1.2+ | Used during `evaluate.py` to calculate metrics like Confusion Matrix and Classification Report. |
| **Python-Dotenv** | Latest | Loads configuration (like `GEMINI_API_KEY`) from the `.env` file into environment variables. |

## 📁 Directory Structure Overview

- **`frontend/`**: Contains the React + Vite application.
  - `src/App.tsx`: Main application logic.
  - `src/index.css`: Tailwind global styles.
- **`backend/`**: Contains the Python logic.
  - `src/api/`: FastAPI routes and Gemini integration.
  - `src/model/`: PyTorch model definition.
  - `src/training/`: Training and evaluation scripts.
