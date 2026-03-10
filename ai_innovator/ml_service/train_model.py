import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import accuracy_score, classification_report
import pickle
import os

# Paths
DATASET_PATH = '../Training.csv'
MODEL_DIR = 'model'
MODEL_PATH = os.path.join(MODEL_DIR, 'RandomForest.pkl')

def train():
    print("Loading dataset...")
    df = pd.read_csv(DATASET_PATH)
    
    # Dropping any unnecessary columns if they exist (sometimes datasets have an extra unnamed index)
    if 'Unnamed: 133' in df.columns:
        df = df.drop('Unnamed: 133', axis=1)

    X = df.drop('prognosis', axis=1)
    y = df['prognosis']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Define Model and Parameters for GridSearch
    rf = RandomForestClassifier(random_state=42)
    
    param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [None, 10, 20],
        'min_samples_split': [2, 5],
        'criterion': ['gini', 'entropy']
    }
    
    print("Starting GridSearch for optimal hyperparameters...")
    grid_search = GridSearchCV(estimator=rf, param_grid=param_grid, cv=3, n_jobs=-1, verbose=2)
    grid_search.fit(X_train, y_train)
    
    best_rf = grid_search.best_estimator_
    print(f"Best Parameters: {grid_search.best_params_}")
    
    # Evaluate
    y_pred = best_rf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {accuracy*100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save model
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)
        
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(best_rf, f)
    print(f"Model saved to {MODEL_PATH}")

if __name__ == "__main__":
    train()
