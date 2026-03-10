"""
Script to generate a comprehensive expandedDiseaseLibrary.json
sourced entirely from the ML training dataset CSVs.
"""
import csv
import json
import re
import ast
import os

DATASET_DIR = os.path.join(os.path.dirname(__file__), 'dataset')
OUTPUT_PATH = os.path.join(
    os.path.dirname(__file__),
    '../frontend/src/data/expandedDiseaseLibrary.json'
)


def read_csv(filename):
    with open(os.path.join(DATASET_DIR, filename), newline='', encoding='utf-8') as f:
        return list(csv.DictReader(f))


def safe_parse_list(s):
    """Parse a Python-list-looking string like "['a', 'b']" into a list."""
    try:
        result = ast.literal_eval(s.strip())
        return [x.strip() for x in result] if isinstance(result, list) else []
    except Exception:
        return []


def slugify(name):
    slug = name.lower().strip()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug


def body_system_for(disease):
    mapping = {
        'skin': ['Fungal infection', 'Acne', 'Psoriasis', 'Impetigo', 'Chicken pox'],
        'respiratory': ['Common Cold', 'Pneumonia', 'Bronchial Asthma', 'Tuberculosis'],
        'digestive': ['GERD', 'Chronic cholestasis', 'Peptic ulcer diseae', 'Gastroenteritis',
                      'Alcoholic hepatitis', 'Dimorphic hemmorhoids(piles)'],
        'liver': ['hepatitis A', 'Hepatitis B', 'Hepatitis C', 'Hepatitis D', 'Hepatitis E', 'Jaundice'],
        'cardiovascular': ['Heart attack', 'Hypertension ', 'Varicose veins'],
        'endocrine': ['Diabetes ', 'Hypothyroidism', 'Hyperthyroidism', 'Hypoglycemia'],
        'immune': ['AIDS', 'Allergy', 'Drug Reaction'],
        'musculoskeletal': ['Arthritis', 'Osteoarthristis', 'Cervical spondylosis'],
        'neurological': ['Migraine', 'Paralysis (brain hemorrhage)', '(vertigo) Paroymsal  Positional Vertigo'],
        'infectious': ['Malaria', 'Dengue', 'Typhoid'],
        'urinary': ['Urinary tract infection'],
    }
    for system, diseases in mapping.items():
        if disease in diseases:
            return system
    return 'general'


def severity_for(score):
    if score <= 3:
        return 'mild'
    if score <= 6:
        return 'moderate'
    return 'severe'


def main():
    # Load all CSVs
    descriptions_raw = {row['Disease'].strip(): row['Description'].strip() for row in read_csv('description.csv')}

    # diets.csv: Disease, Diet
    diets_raw = {}
    for row in read_csv('diets.csv'):
        d = row.get('Disease', '').strip()
        val = row.get('Diet', '').strip()
        items = safe_parse_list(val)
        if d and items:
            diets_raw[d] = items

    # medications.csv: Disease, Medication
    meds_raw = {}
    for row in read_csv('medications.csv'):
        d = row.get('Disease', '').strip()
        val = row.get('Medication', '').strip()
        items = safe_parse_list(val)
        if d and items:
            meds_raw[d] = items

    # precautions_df.csv columns: Disease, Precaution_1..4
    prec_raw = {}
    for row in read_csv('precautions_df.csv'):
        d = row.get('Disease', '').strip()
        precs = [
            row.get('Precaution_1', '').strip(),
            row.get('Precaution_2', '').strip(),
            row.get('Precaution_3', '').strip(),
            row.get('Precaution_4', '').strip(),
        ]
        precs = [p for p in precs if p]
        if d:
            prec_raw[d] = precs

    # workout_df.csv: disease, workout (one row per workout item)
    workout_raw = {}
    for row in read_csv('workout_df.csv'):
        d = row.get('disease', '').strip()
        w = row.get('workout', '').strip()
        if d and w:
            workout_raw.setdefault(d, []).append(w)

    # symptoms from Training.csv (columns = symptoms, last col = prognosis)
    symptom_map = {}
    training_rows = read_csv('Training.csv')
    if training_rows:
        symptom_cols = [c for c in training_rows[0].keys() if c != 'prognosis']
        for row in training_rows:
            disease = row.get('prognosis', '').strip()
            syms = [c for c in symptom_cols if row.get(c, '0').strip() == '1']
            if disease and syms:
                # collect unique symptoms
                if disease not in symptom_map:
                    symptom_map[disease] = set()
                symptom_map[disease].update(syms)
    # Convert sets to sorted lists
    symptom_map = {k: sorted(list(v)) for k, v in symptom_map.items()}

    # Build the full set of diseases from precautions keys (all dataset diseases)
    all_diseases = sorted(set(
        list(prec_raw.keys()) +
        list(meds_raw.keys()) +
        list(diets_raw.keys())
    ))

    output = []
    severity_scores = {
        'Fungal infection': 4.0, 'Allergy': 4.0, 'GERD': 6.0,
        'Chronic cholestasis': 7.0, 'Drug Reaction': 5.0, 'Peptic ulcer diseae': 6.0,
        'AIDS': 9.0, 'Diabetes ': 8.0, 'Gastroenteritis': 4.0, 'Bronchial Asthma': 6.0,
        'Hypertension ': 6.0, 'Migraine': 8.0, 'Cervical spondylosis': 5.0,
        'Paralysis (brain hemorrhage)': 9.0, 'Jaundice': 7.0, 'Malaria': 8.0,
        'Chicken pox': 5.0, 'Dengue': 8.0, 'Typhoid': 8.0, 'hepatitis A': 7.0,
        'Hepatitis B': 7.0, 'Hepatitis C': 7.0, 'Hepatitis D': 8.0, 'Hepatitis E': 7.0,
        'Alcoholic hepatitis': 7.0, 'Tuberculosis': 8.0, 'Common Cold': 3.0,
        'Pneumonia': 7.0, 'Dimorphic hemmorhoids(piles)': 4.0, 'Heart attack': 10.0,
        'Varicose veins': 4.0, 'Hypothyroidism': 5.0, 'Hyperthyroidism': 6.0,
        'Hypoglycemia': 6.0, 'Osteoarthristis': 5.0, 'Arthritis': 5.0,
        '(vertigo) Paroymsal  Positional Vertigo': 4.0, 'Acne': 3.0,
        'Urinary tract infection': 4.0, 'Psoriasis': 5.0, 'Impetigo': 5.0,
    }
    specialist_map = {
        'skin': 'Dermatologist', 'respiratory': 'Pulmonologist',
        'digestive': 'Gastroenterologist', 'liver': 'Hepatologist',
        'cardiovascular': 'Cardiologist', 'endocrine': 'Endocrinologist',
        'immune': 'Immunologist', 'musculoskeletal': 'Orthopedist',
        'neurological': 'Neurologist', 'infectious': 'Infectious Disease Specialist',
        'urinary': 'Urologist', 'general': 'General Physician',
    }

    for disease in all_diseases:
        precs = prec_raw.get(disease, [])
        meds = meds_raw.get(disease, [])
        diets = diets_raw.get(disease, [])
        workouts = workout_raw.get(disease, [])
        symptoms = symptom_map.get(disease, [])

        # skip if missing critical fields
        if not precs or not meds or not diets:
            continue

        body_sys = body_system_for(disease)
        score = severity_scores.get(disease, 5.0)
        specialist = specialist_map.get(body_sys, 'General Physician')
        description = descriptions_raw.get(disease, f'{disease} is a medical condition.')

        entry = {
            'name': disease.strip(),
            'slug': slugify(disease),
            'description': description,
            'symptoms': symptoms[:8],  # top 8 symptoms max
            'severity_score': score,
            'severity': severity_for(score),
            'precautions': precs,
            'medications': meds,
            'diet_recommendations': diets,
            'workout_recommendations': workouts,
            'specialist_type': specialist,
            'body_system': body_sys,
            'is_active': True,
        }
        output.append(entry)

    print(f'Total diseases: {len(output)}')
    print('Diseases:', [d['name'] for d in output])

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f'Written to {OUTPUT_PATH}')


if __name__ == '__main__':
    main()
