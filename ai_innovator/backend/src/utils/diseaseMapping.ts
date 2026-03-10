export interface DiseaseInfo {
    specialist: string;
    urgency: 'non-urgent' | 'urgent' | 'emergency';
}

export const diseaseMappings: Record<string, DiseaseInfo> = {
    'Fungal infection': { specialist: 'Dermatologist', urgency: 'non-urgent' },
    'Allergy': { specialist: 'Allergist', urgency: 'non-urgent' },
    'GERD': { specialist: 'Gastroenterologist', urgency: 'non-urgent' },
    'Chronic cholestasis': { specialist: 'Gastroenterologist', urgency: 'urgent' },
    'Drug Reaction': { specialist: 'Allergist', urgency: 'urgent' },
    'Peptic ulcer diseae': { specialist: 'Gastroenterologist', urgency: 'urgent' },
    'AIDS': { specialist: 'Infectious Disease Specialist', urgency: 'urgent' },
    'Diabetes ': { specialist: 'Endocrinologist', urgency: 'urgent' },
    'Gastroenteritis': { specialist: 'Gastroenterologist', urgency: 'urgent' },
    'Bronchial Asthma': { specialist: 'Pulmonologist', urgency: 'urgent' },
    'Hypertension ': { specialist: 'Cardiologist', urgency: 'urgent' },
    'Migraine': { specialist: 'Neurologist', urgency: 'non-urgent' },
    'Cervical spondylosis': { specialist: 'Orthopedic Surgeon', urgency: 'non-urgent' },
    'Paralysis (brain hemorrhage)': { specialist: 'Neurologist', urgency: 'emergency' },
    'Jaundice': { specialist: 'Gastroenterologist', urgency: 'urgent' },
    'Malaria': { specialist: 'General Physician', urgency: 'urgent' },
    'Chicken pox': { specialist: 'General Physician', urgency: 'urgent' },
    'Dengue': { specialist: 'General Physician', urgency: 'emergency' },
    'Typhoid': { specialist: 'General Physician', urgency: 'urgent' },
    'hepatitis A': { specialist: 'Gastroenterologist', urgency: 'urgent' },
    'Hepatitis B': { specialist: 'Gastroenterologist', urgency: 'urgent' },
    'Hepatitis C': { specialist: 'Gastroenterologist', urgency: 'urgent' },
    'Hepatitis D': { specialist: 'Gastroenterologist', urgency: 'urgent' },
    'Hepatitis E': { specialist: 'Gastroenterologist', urgency: 'urgent' },
    'Alcoholic hepatitis': { specialist: 'Gastroenterologist', urgency: 'urgent' },
    'Tuberculosis': { specialist: 'Pulmonologist', urgency: 'urgent' },
    'Common Cold': { specialist: 'General Physician', urgency: 'non-urgent' },
    'Pneumonia': { specialist: 'Pulmonologist', urgency: 'urgent' },
    'Dimorphic hemmorhoids(piles)': { specialist: 'Proctologist', urgency: 'non-urgent' },
    'Heart attack': { specialist: 'Cardiologist', urgency: 'emergency' },
    'Varicose veins': { specialist: 'Vascular Surgeon', urgency: 'non-urgent' },
    'Hypothyroidism': { specialist: 'Endocrinologist', urgency: 'non-urgent' },
    'Hyperthyroidism': { specialist: 'Endocrinologist', urgency: 'non-urgent' },
    'Hypoglycemia': { specialist: 'Endocrinologist', urgency: 'urgent' },
    'Osteoarthristis': { specialist: 'Rheumatologist', urgency: 'non-urgent' },
    'Arthritis': { specialist: 'Rheumatologist', urgency: 'non-urgent' },
    '(vertigo) Paroymsal  Positional Vertigo': { specialist: 'Neurologist', urgency: 'non-urgent' },
    'Acne': { specialist: 'Dermatologist', urgency: 'non-urgent' },
    'Urinary tract infection': { specialist: 'Urologist', urgency: 'urgent' },
    'Psoriasis': { specialist: 'Dermatologist', urgency: 'non-urgent' },
    'Impetigo': { specialist: 'Dermatologist', urgency: 'urgent' }
};

export const getFallbackSpecialist = (diseaseName: string): string => {
    return diseaseMappings[diseaseName]?.specialist || 'General Physician';
};

export const getFallbackUrgency = (diseaseName: string): 'non-urgent' | 'urgent' | 'emergency' => {
    return diseaseMappings[diseaseName]?.urgency || 'urgent';
};
