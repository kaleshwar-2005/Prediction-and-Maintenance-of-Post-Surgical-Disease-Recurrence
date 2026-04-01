from PIL import Image
import os
import pandas as pd
import numpy as np
from scipy.signal import convolve2d

def get_blur_score(image_path):
    if not os.path.exists(image_path):
        return None
    try:
        image = Image.open(image_path).convert('L')
        img_array = np.array(image, dtype=np.float32)
        
        # Laplacian kernel
        laplacian_kernel = np.array([
            [0, 1, 0],
            [1, -4, 1],
            [0, 1, 0]
        ])
        
        # Convolve
        laplacian = convolve2d(img_array, laplacian_kernel, mode='same')
        return laplacian.var()
    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        return None

csv_path = 'backend/data/full_df.csv'
data_root = 'backend/data/preprocessed_images'
df = pd.read_csv(csv_path)

c1_images = []
for idx, row in df[df['C'] == 1].iterrows():
    l_img = row['Left-Fundus']
    if os.path.exists(os.path.join(data_root, l_img)):
        c1_images.append(os.path.join(data_root, l_img))
    r_img = row['Right-Fundus']
    if os.path.exists(os.path.join(data_root, r_img)):
        c1_images.append(os.path.join(data_root, r_img))

print(f"Found {len(c1_images)} cataract images. Calculating blur scores...")

scores = []
for img_path in c1_images[:50]: # Check first 50 for speed
    score = get_blur_score(img_path)
    if score is not None:
        scores.append(score)

if scores:
    print(f"Blur scores: min={min(scores):.2f}, max={max(scores):.2f}, mean={np.mean(scores):.2f}, median={np.median(scores):.2f}")
    print(f"Percentiles: 10th={np.percentile(scores, 10):.2f}, 25th={np.percentile(scores, 25):.2f}, 50th={np.percentile(scores, 50):.2f}")
else:
    print("No scores calculated.")
