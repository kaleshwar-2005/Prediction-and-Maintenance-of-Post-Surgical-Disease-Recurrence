import os
import pandas as pd
import torch
from torch.utils.data import Dataset
from PIL import Image
import numpy as np


class ODIR5KDataset(Dataset):
    """
    Custom Dataset for ODIR-5K with Risk Labeling.
    0: Low Risk (No Cataract)
    1: Medium Risk (Cataract, Clear Image)
    2: High Risk (Cataract, Blurry/Low Visibility Image)
    """

    def __init__(self, root_dir, csv_file, transform=None, mode='train', blur_threshold=100):
        self.root_dir = root_dir
        self.transform = transform
        self.blur_threshold = blur_threshold
        self.data = []

        if not os.path.exists(csv_file):
            raise FileNotFoundError(f"CSV file not found: {csv_file}")

        df = pd.read_csv(csv_file)
        print(f"[{mode.upper()}] Processing CSV for labels...")

        for _, row in df.iterrows():
            # Cataract status
            is_cataract_patient = row.get('C', 0) == 1

            # Left Eye
            left_img = row.get('Left-Fundus')
            if self._image_exists(left_img):
                label = self._get_label(left_img, is_cataract_patient)
                if label is not None:
                    self.data.append((left_img, label))

            # Right Eye
            right_img = row.get('Right-Fundus')
            if self._image_exists(right_img):
                label = self._get_label(right_img, is_cataract_patient)
                if label is not None:
                    self.data.append((right_img, label))

        # ✅ Safe, reproducible shuffle (not security-sensitive)
        # Using NumPy Generator avoids predictable PRNG warnings from SonarQube
        rng = np.random.default_rng(seed=42)
        rng.shuffle(self.data)

        # Split (80/20)
        split_idx = int(0.8 * len(self.data))
        if mode == 'train':
            self.data = self.data[:split_idx]
        else:
            self.data = self.data[split_idx:]

        print(f"[{mode.upper()}] Loaded {len(self.data)} images from {self.root_dir}")
        self._print_stats()

    def _image_exists(self, img_name):
        if not img_name or pd.isna(img_name):
            return False
        return os.path.exists(os.path.join(self.root_dir, str(img_name)))

    def _get_label(self, img_name, is_cataract):
        if not is_cataract:
            return 0  # Low Risk

        img_path = os.path.join(self.root_dir, str(img_name))

        try:
            with Image.open(img_path) as img:
                blur_score = self._calculate_blur(img)

                if blur_score < self.blur_threshold:
                    return 2  # High Risk (Blurry)
                else:
                    return 1  # Medium Risk (Clear)

        except Exception:
            return None

    def _calculate_blur(self, pil_img):
        """
        Calculate Laplacian variance using numpy.
        """
        img = pil_img.convert('L').resize((224, 224))
        img_array = np.array(img, dtype=np.float32)

        padded = np.pad(img_array, pad_width=1, mode='edge')

        laplacian = (
            padded[0:-2, 1:-1] +     # top
            padded[2:, 1:-1] +       # bottom
            padded[1:-1, 0:-2] +     # left
            padded[1:-1, 2:] -       # right
            4 * padded[1:-1, 1:-1]   # center
        )

        return laplacian.var()

    def _print_stats(self):
        if not self.data:
            print("Dataset is empty.")
            return

        labels = [d[1] for d in self.data]
        unique, counts = np.unique(labels, return_counts=True)
        stats = dict(zip(unique, counts))
        print(f"Class distribution: {stats}")

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        img_name, label = self.data[idx]
        img_path = os.path.join(self.root_dir, str(img_name))

        try:
            with Image.open(img_path) as img:
                image = img.convert('RGB')
        except Exception as e:
            print(f"Error loading {img_path}: {e}")
            image = Image.new('RGB', (224, 224))

        if self.transform:
            image = self.transform(image)

        return image, label
