import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Specify path to .env file in the backend root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import Disease from '../src/models/Disease';
import EmergencyContact from '../src/models/EmergencyContact';
import DailyTip from '../src/models/DailyTip';
import connectDB from '../src/config/db';

const diseases = [
  {
    name: 'Fungal Infection',
    slug: 'fungal-infection',
    description: 'A fungal infection occurs when a normally harmless fungus begins to grow out of control on or inside the body. Common in skin folds, feet, and nails. Usually treatable with antifungal medications.',
    symptoms: ['itching', 'skin_rash', 'nodal_skin_eruptions', 'dischromic_patches'],
    severity: 'mild',
    severity_score: 2.5,
    precautions: ['Keep infected area dry and clean', 'Use antifungal cream as directed', 'Avoid sharing towels or clothing', 'Wear breathable cotton clothing'],
    medications: ['Clotrimazole', 'Fluconazole', 'Terbinafine', 'Miconazole'],
    diet_recommendations: ['Eat probiotic-rich foods like yogurt', 'Reduce sugar intake', 'Stay hydrated', 'Avoid processed foods'],
    workout_recommendations: ['Light yoga', 'Walking', 'Avoid swimming until healed', 'Keep exercise areas dry'],
    specialist_type: 'Dermatologist',
    icd_code: 'B49',
    body_system: 'dermatological',
    is_active: true
  },
  {
    name: 'Diabetes',
    slug: 'diabetes',
    description: 'Diabetes mellitus is a group of metabolic diseases characterized by high blood sugar levels over a prolonged period. Type 1 requires insulin therapy; Type 2 is managed with lifestyle changes and medication.',
    symptoms: ['fatigue', 'weight_loss', 'restlessness', 'lethargy', 'irregular_sugar_level', 'blurred_and_distorted_vision', 'obesity', 'excessive_hunger', 'increased_appetite', 'polyuria'],
    severity: 'severe',
    severity_score: 7.5,
    precautions: ['Monitor blood sugar levels regularly', 'Follow a diabetic-friendly diet', 'Exercise daily', 'Take medications as prescribed'],
    medications: ['Metformin', 'Insulin', 'Glipizide', 'Sitagliptin'],
    diet_recommendations: ['Low glycemic index foods', 'Avoid refined sugars', 'High fiber diet', 'Lean proteins', 'Regular small meals'],
    workout_recommendations: ['Walking 30 minutes daily', 'Swimming', 'Cycling', 'Resistance training'],
    specialist_type: 'Endocrinologist',
    icd_code: 'E11',
    body_system: 'endocrine',
    is_active: true
  },
  {
    name: 'Hypertension',
    slug: 'hypertension',
    description: 'Hypertension, or high blood pressure, is a long-term medical condition in which the blood pressure in the arteries is persistently elevated. It is a major risk factor for stroke, heart attack, and kidney failure.',
    symptoms: ['headache', 'chest_pain', 'dizziness', 'loss_of_balance', 'lack_of_concentration'],
    severity: 'severe',
    severity_score: 7.0,
    precautions: ['Reduce salt intake', 'Exercise regularly', 'Avoid smoking and alcohol', 'Monitor blood pressure daily'],
    medications: ['Amlodipine', 'Lisinopril', 'Losartan', 'Atenolol', 'Hydrochlorothiazide'],
    diet_recommendations: ['DASH diet (low sodium, high potassium)', 'Fruits and vegetables', 'Whole grains', 'Reduce red meat', 'Limit caffeine'],
    workout_recommendations: ['Brisk walking', 'Swimming', 'Cycling', 'Yoga', 'Avoid heavy weightlifting'],
    specialist_type: 'Cardiologist',
    icd_code: 'I10',
    body_system: 'cardiovascular',
    is_active: true
  },
  {
    name: 'Common Cold',
    slug: 'common-cold',
    description: 'The common cold is a viral infection of the upper respiratory tract, primarily affecting the nose and throat. Most people recover within 7–10 days without medical treatment.',
    symptoms: ['continuous_sneezing', 'chills', 'fatigue', 'cough', 'headache', 'high_fever', 'swelled_lymph_nodes', 'malaise', 'phlegm', 'throat_irritation', 'redness_of_eyes', 'sinus_pressure', 'runny_nose', 'congestion', 'chest_pain', 'loss_of_smell', 'muscle_pain'],
    severity: 'mild',
    severity_score: 2.0,
    precautions: ['Rest and stay hydrated', 'Use saline nasal spray', 'Gargle with warm salt water', 'Avoid close contact with others'],
    medications: ['Paracetamol', 'Antihistamines', 'Decongestants', 'Cough syrup'],
    diet_recommendations: ['Warm soups and broths', 'Honey and ginger tea', 'Citrus fruits for Vitamin C', 'Avoid cold beverages'],
    workout_recommendations: ['Rest during acute phase', 'Light stretching after recovery', 'Deep breathing exercises'],
    specialist_type: 'General Physician',
    icd_code: 'J00',
    body_system: 'respiratory',
    is_active: true
  },
  {
    name: 'Migraine',
    slug: 'migraine',
    description: 'Migraine is a neurological condition characterized by intense, debilitating headaches often accompanied by nausea, vomiting, and extreme sensitivity to light and sound. Episodes can last hours to days.',
    symptoms: ['headache', 'ulcers', 'vomiting', 'acidity', 'stiff_neck', 'depression', 'irritability', 'visual_disturbances', 'excessive_hunger'],
    severity: 'moderate',
    severity_score: 5.0,
    precautions: ['Avoid known triggers (stress, certain foods)', 'Maintain regular sleep schedule', 'Stay hydrated', 'Keep a migraine diary'],
    medications: ['Sumatriptan', 'Ibuprofen', 'Paracetamol', 'Topiramate', 'Propranolol'],
    diet_recommendations: ['Avoid caffeine and alcohol', 'Regular meal timing', 'Magnesium-rich foods', 'Avoid processed meats'],
    workout_recommendations: ['Gentle yoga', 'Regular aerobic exercise', 'Avoid high-intensity exercise during episodes', 'Relaxation techniques'],
    specialist_type: 'Neurologist',
    icd_code: 'G43',
    body_system: 'neurological',
    is_active: true
  }
];

const contacts = [
  { name: 'National Emergency Number', phone: '112', type: 'helpline', state: 'national', available_24h: true },
  { name: 'Ambulance Service', phone: '102', type: 'ambulance', state: 'national', available_24h: true },
  { name: 'Emergency Medical Response (EMRI)', phone: '108', type: 'ambulance', state: 'national', available_24h: true },
  { name: 'Medical Helpline', phone: '1911', type: 'helpline', state: 'national', available_24h: true },
  { name: 'Health Helpline (Swasth Bharat)', phone: '104', type: 'helpline', state: 'national', available_24h: false },
  { name: 'Mental Health Helpline (iCall)', phone: '9152987821', type: 'helpline', state: 'national', available_24h: false },
  { name: 'Poison Control Centre (AIIMS Delhi)', phone: '011-26589391', type: 'helpline', state: 'national', available_24h: true },
  { name: 'Blood Bank Helpline', phone: '1910', type: 'blood_bank', state: 'national', available_24h: false },
  { name: 'Disaster Management', phone: '1078', type: 'helpline', state: 'national', available_24h: true },
  { name: 'Railway Emergency', phone: '1072', type: 'helpline', state: 'national', available_24h: true }
];

const tips = [
  {
    tip_text: 'Drink at least 8 glasses of water daily. Staying hydrated helps maintain healthy blood pressure and kidney function.',
    tip_text_hi: 'रोज कम से कम 8 गिलास पानी पिएं। हाइड्रेटेड रहने से रक्तचाप और किडनी स्वस्थ रहती है।',
    tip_date: new Date()
  },
  {
    tip_text: 'Wash your hands for at least 20 seconds with soap and water before eating and after using the restroom.',
    tip_text_hi: 'खाने से पहले और शौचालय के बाद कम से कम 20 सेकंड तक साबुन और पानी से हाथ धोएं।',
    tip_date: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
  },
  {
    tip_text: 'Aim for 7–9 hours of sleep per night. Poor sleep is linked to increased risk of heart disease and diabetes.',
    tip_text_hi: 'रात को 7-9 घंटे की नींद लें। नींद की कमी से हृदय रोग और मधुमेह का खतरा बढ़ता है।',
    tip_date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000)
  },
  {
    tip_text: 'Include at least 5 servings of fruits and vegetables in your daily diet for essential vitamins and minerals.',
    tip_text_hi: 'आवश्यक विटामिन और खनिज के लिए अपने दैनिक आहार में कम से कम 5 फल और सब्जियां शामिल करें।',
    tip_date: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000)
  }
];

const importData = async () => {
  try {
    await connectDB();

    await Disease.deleteMany();
    await EmergencyContact.deleteMany();
    await DailyTip.deleteMany();

    await Disease.insertMany(diseases);
    await EmergencyContact.insertMany(contacts);
    await DailyTip.insertMany(tips);

    console.log('✅ Data Imported Successfully!');
    process.exit();
  } catch (error: any) {
    console.error('❌ Error importing data:', error.message);
    process.exit(1);
  }
};

importData();
