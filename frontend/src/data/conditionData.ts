export interface Condition {
    name: string;
    description: string;
    symptoms: string[];
    causes: string[];
    treatments: string[];
    emergency_signs: string[];
    risk_factors: string[];
    category: string;
}

export const conditions: Condition[] = [
    {
        name: "Common Cold",
        description: "A viral infection of your nose and throat.",
        symptoms: ["runny nose", "sore throat", "cough", "congestion", "slight body aches", "sneezing", "low-grade fever"],
        causes: ["Rhinoviruses", "Direct contact with infected person"],
        treatments: ["Rest", "Fluids", "Over-the-counter pain relievers", "Decongestants"],
        emergency_signs: ["Difficulty breathing", "Extreme wheezing"],
        risk_factors: ["Weakened immune system", "Crowded spaces"],
        category: "Infectious Disease"
    },
    {
        name: "Migraine",
        description: "A primary headache disorder characterized by recurrent headaches that are moderate to severe.",
        symptoms: ["headache", "throbbing pain", "nausea", "sensitivity to light", "sensitivity to sound", "vomiting"],
        causes: ["Genetics", "Environmental factors", "Hormonal changes"],
        treatments: ["Pain relievers", "Triptans", "Anti-nausea drugs", "Rest in dark room"],
        emergency_signs: ["Sudden severe headache", "Weakness on one side", "Slurred speech"],
        risk_factors: ["Family history", "Stress", "Sleep changes"],
        category: "Neurological"
    },
    {
        name: "Gastroenteritis (Stomach Flu)",
        description: "An inflammation of the lining of the intestines caused by a virus, bacteria, or parasites.",
        symptoms: ["diarrhea", "stomach cramps", "nausea", "vomiting", "mild fever", "body aches"],
        causes: ["Norovirus", "Rotavirus", "Contaminated food or water"],
        treatments: ["Hydration", "Bland diet", "Rest", "Probiotics"],
        emergency_signs: ["Severe dehydration", "Inability to keep liquids down", "Bloody stools"],
        risk_factors: ["Contaminated food", "Poor hygiene"],
        category: "Gastrointestinal"
    },
    {
        name: "Seasonal Allergies",
        description: "An allergic reaction to pollen from trees, grasses, and weeds.",
        symptoms: ["itchy eyes", "watery eyes", "sneezing", "runny nose", "nasal congestion", "scratchy throat"],
        causes: ["Pollen", "Mold", "Pet dander"],
        treatments: ["Antihistamines", "Nasal corticosteroids", "Decongestants", "Avoiding triggers"],
        emergency_signs: ["Anaphylaxis", "Swollen throat"],
        risk_factors: ["Family history", "Other allergies"],
        category: "Allergy"
    },
    {
        name: "Lower Back Pain (Muscle Strain)",
        description: "Injury to the muscles or tendons in the lower back.",
        symptoms: ["back pain", "muscle spasms", "stiffness", "limited range of motion", "pain radiating to buttocks"],
        causes: ["Lifting heavy objects", "Poor posture", "Sudden twist"],
        treatments: ["Ice/Heat therapy", "Rest", "Gentle stretching", "Pain relievers"],
        emergency_signs: ["Loss of bladder control", "Leg weakness", "Numbness in groin area"],
        risk_factors: ["Lack of exercise", "Improper lifting", "Excess weight"],
        category: "Musculoskeletal"
    },
    {
        name: "Bronchitis",
        description: "Inflammation of the lining of your bronchial tubes, which carry air to and from your lungs.",
        symptoms: ["cough", "mucus production", "fatigue", "shortness of breath", "slight fever", "chest discomfort"],
        causes: ["Viruses", "Cigarette smoke", "Air pollution"],
        treatments: ["Rest", "Fluids", "Cough medicine", "Humidifier"],
        emergency_signs: ["Coughing up blood", "Difficulty breathing", "High fever over 101F"],
        risk_factors: ["Smoking", "Low resistance", "Exposure to irritants"],
        category: "Respiratory"
    }
];
