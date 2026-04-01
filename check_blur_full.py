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
        # Resize to 224x224 to match model input and standardize blur score
        image = image.resize((224, 224))
        img_array = np.array(image, dtype=np.float32)
        
        laplacian_kernel = np.array([
            [0, 1, 0],
            [1, -4, 1],
            [0, 1, 0]
        ])
        
        laplacian = convolve2d(img_array, laplacian_kernel, mode='same')
        return laplacian.var()
    except Exception as e:
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

print(f"Processing all {len(c1_images)} cataract images...")

scores = []
for img_path in c1_images:
    score = get_blur_score(img_path)
    if score is not None:
        scores.append(score)

if scores:
    scores = np.array(scores)
    print(f"Total processed: {len(scores)}")
    print(f"Min: {min(scores):.2f}, Max: {max(scores):.2f}, Mean: {np.mean(scores):.2f}")
    for p in [5, 10, 15, 20, 25, 50]:
        print(f"{p}th percentile: {np.percentile(scores, p):.2f}")
else:
    print("No scores calculated.")
