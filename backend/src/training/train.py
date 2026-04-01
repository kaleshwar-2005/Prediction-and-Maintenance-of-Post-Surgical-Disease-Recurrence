import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
import os
import argparse
from tqdm import tqdm
import numpy as np

from src.data.dataset import ODIR5KDataset
from src.data.transforms import get_transforms
from src.model.classifier import CataractRiskModel

def calculate_class_weights(dataset):
    labels = [d[1] for d in dataset.data]
    unique, counts = np.unique(labels, return_counts=True)
    counts_dict = dict(zip(unique, counts))
    
    total = sum(counts)
    num_classes = 3
    # Use inverse frequency for weights: w = total / (num_classes * count)
    weights = []
    for i in range(num_classes):
        count = counts_dict.get(i, 0)
        if count > 0:
            weights.append(total / (num_classes * count))
        else:
            weights.append(1.0) # Should not happen with 80/20 split on 6k rows
            
    return torch.tensor(weights, dtype=torch.float32)

def train_model(args):
    # Device Config
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    # Updated paths based on user upload
    # args.data_dir is root, we look for data/preprocessed_images
    data_root = os.path.join(args.data_dir, "data", "preprocessed_images")
    csv_path = os.path.join(args.data_dir, "data", "full_df.csv")
    
    print(f"Looking for data in: {data_root}")
    if not os.path.exists(data_root):
        # Fallback for different path structure
        data_root = os.path.join(args.data_dir, "backend", "data", "preprocessed_images")
        csv_path = os.path.join(args.data_dir, "backend", "data", "full_df.csv")
        if not os.path.exists(data_root):
            print(f"Error: Dataset directory not found.")
            return

    # Dataset
    train_dataset = ODIR5KDataset(data_root, csv_path, transform=get_transforms('train'), mode='train')
    val_dataset = ODIR5KDataset(data_root, csv_path, transform=get_transforms('val'), mode='val')
    
    if len(train_dataset) == 0:
        print("No images loaded! Check dataset path or CSV.")
        return

    # Weights for imbalance
    class_weights = calculate_class_weights(train_dataset).to(device)
    print(f"Applied Class Weights: {class_weights.cpu().numpy()}")

    # Loader
    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, num_workers=0)
    
    # Model
    model = CataractRiskModel(num_classes=3).to(device)
    criterion = nn.CrossEntropyLoss(weight=class_weights)
    optimizer = optim.Adam(model.parameters(), lr=args.lr)
    
    best_acc = 0.0
    
    for epoch in range(args.epochs):
        print(f"\nEpoch {epoch+1}/{args.epochs}")
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        # tqdm for progress bar
        pbar = tqdm(train_loader, desc=f"Epoch {epoch+1}")
        for images, labels in pbar:
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            
            pbar.set_postfix({'loss': running_loss/len(train_loader), 'acc': 100*correct/total})
            
        train_acc = 100 * correct / total
        
        # Validation
        model.eval()
        val_correct = 0
        val_total = 0
        conf_matrix = np.zeros((3, 3))
        
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                _, predicted = torch.max(outputs.data, 1)
                val_total += labels.size(0)
                val_correct += (predicted == labels).sum().item()
                
                for t, p in zip(labels.view(-1), predicted.view(-1)):
                    conf_matrix[t.long(), p.long()] += 1
                
        val_acc = 100 * val_correct / val_total
        print(f"Val Acc: {val_acc:.2f}%")

        print("\nClass-wise Accuracy:")
        labels_map = {0: "Low Risk", 1: "Medium Risk", 2: "High Risk"}
        for i in range(3):
            class_total = np.sum(conf_matrix[i, :])
            class_correct = conf_matrix[i, i]
            class_acc = 100 * class_correct / class_total if class_total > 0 else 0
            print(f"{labels_map[i]:<12}: {class_acc:>6.2f}% ({int(class_correct)}/{int(class_total)})")
            
        print("\nConfusion Matrix:")
        print(conf_matrix)
        
        if val_acc > best_acc:
            best_acc = val_acc
            save_path = os.path.join(args.save_dir, "best_model.pth")
            torch.save(model.state_dict(), save_path)
            print(f"New best model saved to {save_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", type=str, default=".")
    parser.add_argument("--save_dir", type=str, default="model_checkpoints")
    parser.add_argument("--epochs", type=int, default=5)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=0.0002)
    args = parser.parse_args()
    
    os.makedirs(args.save_dir, exist_ok=True)
    train_model(args)
