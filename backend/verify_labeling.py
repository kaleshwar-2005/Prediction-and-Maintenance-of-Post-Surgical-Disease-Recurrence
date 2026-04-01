import os
from src.data.dataset import ODIR5KDataset
from src.data.transforms import get_transforms

data_root = "data/preprocessed_images"
csv_path = "data/full_df.csv"

# Check if we are in backend dir or root
if not os.path.exists(data_root):
    data_root = "backend/data/preprocessed_images"
    csv_path = "backend/data/full_df.csv"

print(f"Verifying dataset at: {data_root}")

try:
    # Use a small subset or just initialize to see the print_stats output
    dataset = ODIR5KDataset(data_root, csv_path, transform=get_transforms('val'), mode='val')
    # The stats are printed in __init__
except Exception as e:
    print(f"Error during verification: {e}")
