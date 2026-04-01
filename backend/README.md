# Cataract Recurrence Risk Prediction Backend

## Setup
1. **Dependencies**: `pip install -r requirements.txt`
2. **Data**: Ensure `data/` folder contains `preprocessed_images/` and `full_df.csv`.

## Run
- **Train**: `python -m src.training.train --epochs 10`
- **API**: `uvicorn src.api.app:app --reload`
