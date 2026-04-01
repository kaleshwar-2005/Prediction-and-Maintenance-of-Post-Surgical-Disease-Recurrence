import pandas as pd
import os

def find_samples():
    csv_file = "data/full_df.csv"
    if not os.path.exists(csv_file):
        print("CSV file not found!")
        return

    df = pd.read_csv(csv_file)
    
    high_risk_samples = []
    medium_risk_samples = []
    
    # Check for 'C' column (Cataract)
    if 'C' not in df.columns:
        print("Column 'C' not found in CSV.")
        return

    print(f"Total rows in CSV: {len(df)}")
    
    for idx, row in df.iterrows():
        # Only look at Cataract patients
        if row['C'] == 1:
            # Check Left Eye
            l_key = str(row.get('Left-Diagnostic Keywords', '')).lower()
            l_img = row.get('Left-Fundus')
            
            if 'cataract' in l_key:
                if 'mature' in l_key or 'dense' in l_key or 'severe' in l_key:
                    high_risk_samples.append(f"{l_img} (L) - {l_key}")
                elif 'moderate' in l_key:
                    medium_risk_samples.append(f"{l_img} (L) - {l_key}")

            # Check Right Eye
            r_key = str(row.get('Right-Diagnostic Keywords', '')).lower()
            r_img = row.get('Right-Fundus')
            
            if 'cataract' in r_key:
                if 'mature' in r_key or 'dense' in r_key or 'severe' in r_key:
                    high_risk_samples.append(f"{r_img} (R) - {r_key}")
                elif 'moderate' in r_key:
                    medium_risk_samples.append(f"{r_img} (R) - {r_key}")

    print("Writing results to risk_samples.txt...")
    with open("risk_samples.txt", "w", encoding="utf-8") as f:
        f.write("--- HIGH RISK SAMPLES ---\n")
        for s in high_risk_samples[:10]:
            f.write(s + "\n")
        
        f.write("\n--- MEDIUM RISK SAMPLES ---\n")
        for s in medium_risk_samples[:10]:
            f.write(s + "\n")

if __name__ == "__main__":
    find_samples()
