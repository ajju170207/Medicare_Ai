import pandas as pd
import json
import re
import os

# Find project root (assuming script is in backend/scripts)
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(script_dir, "../../"))

# Paths to datasets
base_path = os.path.join(project_root, 'ml_service/dataset')
desc_path = os.path.join(base_path, 'description.csv')
diet_path = os.path.join(base_path, 'diets.csv')
med_path = os.path.join(base_path, 'medications.csv')
prec_path = os.path.join(base_path, 'precautions_df.csv')
work_path = os.path.join(base_path, 'workout_df.csv')

def clean_array_str(s):
    if pd.isna(s) or s == '':
        return []
    # Convert string like "['a', 'b']" to list
    try:
        # Use regex to handle potential malformed strings
        res = re.findall(r"'(.*?)'", s)
        if not res:
            res = re.findall(r"\"(.*?)\"", s)
        return res
    except:
        return []

def to_pg_array(list_val):
    if not list_val:
        return "ARRAY[]::text[]"
    # Escape single quotes for SQL
    escaped = [str(v).replace("'", "''") for v in list_val]
    items = ", ".join([f"'{v}'" for v in escaped])
    return f"ARRAY[{items}]::text[]"

# Load dataframes
df_desc = pd.read_csv(desc_path)
df_diet = pd.read_csv(diet_path)
df_med = pd.read_csv(med_path)
df_prec = pd.read_csv(prec_path)
df_work = pd.read_csv(work_path)

# Merge datasets on Disease name
df_desc['Disease'] = df_desc['Disease'].str.strip()
df_diet['Disease'] = df_diet['Disease'].str.strip()
df_med['Disease'] = df_med['Disease'].str.strip()
df_prec['Disease'] = df_prec['Disease'].str.strip()
df_work['disease'] = df_work['disease'].str.strip()

# Aggregate workouts
workouts_agg = df_work.groupby('disease')['workout'].apply(list).reset_index()

# Merge all
merged = df_desc.merge(df_diet, on='Disease', how='left')
merged = merged.merge(df_med, on='Disease', how='left')
merged = merged.merge(df_prec, on='Disease', how='left')
merged = merged.merge(workouts_agg, left_on='Disease', right_on='disease', how='left')

sql_statements = ["TRUNCATE public.disease_library RESTART IDENTITY;"]

for _, row in merged.iterrows():
    name = row['Disease']
    slug = name.lower().replace(' ', '-').replace('(', '').replace(')', '').replace(',', '')
    desc = row['Description'] if not pd.isna(row['Description']) else ""
    
    diet = clean_array_str(row['Diet'])
    meds = clean_array_str(row['Medication'])
    
    # Precautions are in multiple columns
    precs = []
    for i in range(1, 4): 
        p = row.get(f'Precaution_{i}')
        if pd.notna(p) and p != '':
            precs.append(str(p))
            
    workout = row['workout'] if isinstance(row['workout'], list) else []
    
    # Escape single quotes for SQL
    name_esc = name.replace("'", "''")
    desc_esc = desc.replace("'", "''")
    
    precs_array = to_pg_array(precs)
    meds_array = to_pg_array(meds)
    diet_array = to_pg_array(diet)
    work_array = to_pg_array(workout)

    sql = f"""INSERT INTO public.disease_library (name, slug, description, symptoms, precautions, medications, diet_recommendations, workout_recommendations, specialist_type, severity, severity_score, is_active)
VALUES ('{name_esc}', '{slug}', '{desc_esc}', ARRAY[]::text[], {precs_array}, {meds_array}, {diet_array}, {work_array}, 'General Physician', 'moderate', 5, true);"""
    sql_statements.append(sql)

# Write to file
output_path = os.path.join(script_dir, 'seed_disease_library.sql')
with open(output_path, 'w') as f:
    f.write('\n'.join(sql_statements))

print(f"Generated seed SQL for {len(merged)} diseases at {output_path}")
