import csv
import json
import os
import ast

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)

DATASET_DIR = ROOT_DIR 
if not os.path.exists(os.path.join(DATASET_DIR, 'symptoms_df.csv')):
    DATASET_DIR = os.path.join(BASE_DIR, 'dataset')

def clean_value(val):
    if not val or val.strip() == '' or val.lower() == 'nan':
        return None
    return str(val).strip()

try:
    print("Reading CSVs...")
    
    db = {
        "description": {},
        "precautions": {},
        "medications": {},
        "diets": {},
        "workout": {}
    }

    # Description
    with open(os.path.join(DATASET_DIR, 'description.csv'), 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            db["description"][row['Disease']] = clean_value(row['Description'])
    
    # Precautions
    with open(os.path.join(DATASET_DIR, 'precautions_df.csv'), 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            pre = [clean_value(row['Precaution_1']), clean_value(row['Precaution_2']), 
                   clean_value(row['Precaution_3']), clean_value(row['Precaution_4'])]
            db["precautions"][row['Disease']] = [p for p in pre if p is not None]
    
    # Medications
    with open(os.path.join(DATASET_DIR, 'medications.csv'), 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                db["medications"][row['Disease']] = ast.literal_eval(row['Medication'])
            except:
                db["medications"][row['Disease']] = [row['Medication']]
            
    # Diets
    with open(os.path.join(DATASET_DIR, 'diets.csv'), 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                db["diets"][row['Disease']] = ast.literal_eval(row['Diet'])
            except:
                db["diets"][row['Disease']] = [row['Diet']]

    # Workout
    with open(os.path.join(DATASET_DIR, 'workout_df.csv'), 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            disease = row['disease']
            if disease not in db["workout"]:
                db["workout"][disease] = []
            db["workout"][disease].append(row['workout'])

    out_path = os.path.join(BASE_DIR, 'dataset.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=4)
        
    print(f"Successfully created {out_path}")

except Exception as e:
    print(f"Error: {e}")
