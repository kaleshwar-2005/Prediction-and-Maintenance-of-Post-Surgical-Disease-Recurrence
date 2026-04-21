import torch
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report, confusion_matrix
import argparse
import os
import numpy as np

from src.data.dataset import ODIR5KDataset
from src.data.transforms import get_transforms
from src.model.classifier import CataractRiskModel


def evaluate(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    data_root = os.path.join(args.data_dir, "data", "preprocessed_images")
    csv_path = os.path.join(args.data_dir, "data", "full_df.csv")

    dataset = ODIR5KDataset(
        data_root,
        csv_path,
        transform=get_transforms('val'),
        mode='val'
    )

    loader = DataLoader(
        dataset,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=4
    )

    model = CataractRiskModel(num_classes=3)

    # ✅ Validate model path
    if not os.path.isfile(args.model_path):
        raise FileNotFoundError(f"Model file not found: {args.model_path}")

    if not args.model_path.endswith(".pth"):
        raise ValueError("Invalid model file format. Only .pth allowed.")

    # ✅ Safe loading (prevents pickle RCE)
    state_dict = torch.load(
        args.model_path,
        map_location=device,
        weights_only=True
    )
    model.load_state_dict(state_dict)

    model.to(device)
    model.eval()

    all_preds = []
    all_labels = []

    print("Running Evaluation...")

    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)

            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.numpy())

    print("\nClassification Report:")
    target_names = ["Low Risk", "Medium Risk", "High Risk"]

    print(classification_report(
        all_labels,
        all_preds,
        labels=[0, 1, 2],
        target_names=target_names
    ))

    print("\nConfusion Matrix:")
    print(confusion_matrix(all_labels, all_preds))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", type=str, default=".")
    parser.add_argument("--model_path", type=str, required=True)
    parser.add_argument("--batch_size", type=int, default=32)

    args = parser.parse_args()

    evaluate(args)
