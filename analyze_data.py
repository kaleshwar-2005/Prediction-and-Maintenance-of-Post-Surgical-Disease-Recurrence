import pandas as pd
import os

csv_path = 'backend/data/full_df.csv'
df = pd.read_csv(csv_path)

print(f"Columns: {df.columns.tolist()}")
print(f"Total rows: {len(df)}")

def is_cataract(row, side, keywords):
    if 'cataract' in str(keywords).lower():
        return True
    return False

def assign_risk(keywords):
    k = str(keywords).lower()
    if 'mature' in k or 'dense' in k or 'severe' in k:
        return 2 # High Risk
    elif 'moderate' in k:
        return 1 # Medium Risk
    else:
        return 0 # Low Risk

results = []
for idx, row in df.iterrows():
    # Left Eye
    left_keywords = row.get('Left-Diagnostic Keywords', '')
    if is_cataract(row, 'left', left_keywords):
        label = assign_risk(left_keywords)
        results.append(label)

    # Right Eye
    right_keywords = row.get('Right-Diagnostic Keywords', '')
    if is_cataract(row, 'right', right_keywords):
        label = assign_risk(right_keywords)
        results.append(label)

print(f"Current labeling distribution (only for cataract images):")
label_counts = pd.Series(results).value_counts().sort_index()
print(label_counts)

# Check for 'C' column which usually indicates Cataract in ODIR-5K
if 'C' in df.columns:
    print(f"\nValue counts for column 'C' (Cataract):")
    print(df['C'].value_counts())

# Check how many 'C' = 1 have 'mature', 'dense', 'severe', 'moderate' in keywords
c_1_df = df[df['C'] == 1]
print(f"\nTotal C=1 cases: {len(c_1_df)}")

risk_high = 0
risk_medium = 0
risk_low = 0

for idx, row in c_1_df.iterrows():
    kw = str(row['Left-Diagnostic Keywords']) + " " + str(row['Right-Diagnostic Keywords'])
    k = kw.lower()
    if 'mature' in k or 'dense' in k or 'severe' in k:
        risk_high += 1
    elif 'moderate' in k:
        risk_medium += 1
    else:
        risk_low += 1

print(f"Risk distribution among C=1 (using current simple keyword search):")
print(f"High: {risk_high}")
print(f"Medium: {risk_medium}")
print(f"Low: {risk_low}")
