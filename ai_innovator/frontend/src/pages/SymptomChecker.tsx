import React, { useState } from 'react';
import { Layout, Form, Input, Button, Card, Select, Typography, Steps, Row, Col, Divider, Tag, List } from 'antd';
import {
    SendOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    HistoryOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import SharedHeader from '../components/SharedHeader';
import api from '../services/api';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const supportedSymptoms = [
    'itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing', 'shivering', 'chills', 'joint_pain', 'stomach_pain', 'acidity', 'ulcers_on_tongue', 'muscle_wasting', 'vomiting', 'burning_micturition', 'spotting_ urination', 'fatigue', 'weight_gain', 'anxiety', 'cold_hands_and_feets', 'mood_swings', 'weight_loss', 'restlessness', 'lethargy', 'patches_in_throat', 'irregular_sugar_level', 'cough', 'high_fever', 'sunken_eyes', 'breathlessness', 'sweating', 'dehydration', 'indigestion', 'headache', 'yellowish_skin', 'dark_urine', 'nausea', 'loss_of_appetite', 'pain_behind_the_eyes', 'back_pain', 'constipation', 'abdominal_pain', 'diarrhoea', 'mild_fever', 'yellow_urine', 'yellowing_of_eyes', 'acute_liver_failure', 'fluid_overload', 'swelling_of_stomach', 'swelled_lymph_nodes', 'malaise', 'blurred_and_distorted_vision', 'phlegm', 'throat_irritation', 'redness_of_eyes', 'sinus_pressure', 'runny_nose', 'congestion', 'chest_pain', 'weakness_in_limbs', 'fast_heart_rate', 'pain_during_bowel_movements', 'pain_in_anal_region', 'bloody_stool', 'irritation_in_anus', 'neck_pain', 'dizziness', 'cramps', 'bruising', 'obesity', 'swollen_legs', 'swollen_blood_vessels', 'puffy_face_and_eyes', 'enlarged_thyroid', 'brittle_nails', 'swollen_extremeties', 'excessive_hunger', 'extra_marital_contacts', 'drying_and_tingling_lips', 'slurred_speech', 'knee_pain', 'hip_joint_pain', 'muscle_weakness', 'stiff_neck', 'swelling_joints', 'movement_stiffness', 'spinning_movements', 'loss_of_balance', 'unsteadiness', 'weakness_of_one_body_side', 'loss_of_smell', 'bladder_discomfort', 'foul_smell_of urine', 'continuous_feel_of_urine', 'passage_of_gases', 'internal_itching', 'toxic_look_(typhos)', 'depression', 'irritability', 'muscle_pain', 'altered_sensorium', 'red_spots_over_body', 'belly_pain', 'abnormal_menstruation', 'dischromic _patches', 'watering_from_eyes', 'increased_appetite', 'polyuria', 'family_history', 'mucoid_sputum', 'rusty_sputum', 'lack_of_concentration', 'visual_disturbances', 'receiving_blood_transfusion', 'receiving_unsterile_injections', 'coma', 'stomach_bleeding', 'distention_of_abdomen', 'history_of_alcohol_consumption', 'fluid_overload', 'blood_in_sputum', 'prominent_veins_on_calf', 'palpitations', 'painful_walking', 'pus_filled_pimples', 'blackheads', 'scurring', 'skin_peeling', 'silver_like_dusting', 'small_dents_in_nails', 'inflammatory_nails', 'blister', 'red_sore_around_nose', 'yellow_crust_ooze'
];

const SymptomChecker: React.FC = () => {
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSymptomAnalysis = async (values: any) => {
        setLoading(true);
        // Ensure symptoms is always an array
        const payload = {
            ...values,
            symptoms: Array.isArray(values.symptoms) ? values.symptoms : [values.symptoms]
        };

        try {
            const res = await api.post('/symptoms/analyze', payload);
            if (res.data.success) {
                setAnalysisResult(res.data.data.result);
                setCurrentStep(2);
            }
        } catch (error: any) {
            console.error('Analysis failed', error);
        } finally {
            setLoading(false);
        }
    };

    const stepsItems = [
        { title: 'Information' },
        { title: 'Symptoms' },
        { title: 'Analysis' }
    ];

    return (
        <Layout className="min-h-screen bg-white">
            <SharedHeader
                title="AI Symptom Checker"
                showBackButton
                onBack={() => navigate('/dashboard')}
            />

            <Content className="p-6 max-w-4xl mx-auto w-full">
                <Steps current={currentStep} items={stepsItems} className="mb-8 px-4" />

                {currentStep === 0 && (
                    <Card className="shadow-sm border-none rounded-3xl p-4">
                        <Title level={3} className="text-gray-800 mb-6">Patient Information</Title>
                        <Form
                            layout="vertical"
                            onFinish={() => setCurrentStep(1)}
                            initialValues={{ gender: 'male', age: 25 }}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="age" label="Age" rules={[{ required: true }]}>
                                        <Input type="number" placeholder="Enter your age" className="rounded-xl h-12" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
                                        <Select className="rounded-xl h-12">
                                            <Option value="male">Male</Option>
                                            <Option value="female">Female</Option>
                                            <Option value="other">Other</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item name="location" label="Location" rules={[{ required: true }]}>
                                <Input placeholder="Mumbai, India" className="rounded-xl h-12" />
                            </Form.Item>
                            <Button type="primary" htmlType="submit" size="large" className="w-full h-12 rounded-xl mt-4 font-bold">
                                Next Step
                            </Button>
                        </Form>
                    </Card>
                )}

                {currentStep === 1 && (
                    <Card className="shadow-sm border-none rounded-3xl p-4">
                        <Title level={3} className="text-gray-800 mb-6">Select Your Symptoms</Title>
                        <Form form={form} layout="vertical" onFinish={handleSymptomAnalysis}>
                            <Form.Item name="symptoms" label="Symptoms" rules={[{ required: true, message: 'Please select at least one symptom' }]}>
                                <Select
                                    mode="multiple"
                                    allowClear
                                    style={{ width: '100%' }}
                                    placeholder="Search and select symptoms..."
                                    className="rounded-xl min-h-[48px]"
                                    optionFilterProp="label"
                                    options={supportedSymptoms.map(s => ({
                                        label: s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                                        value: s
                                    }))}
                                />
                            </Form.Item>
                            <Form.Item name="severity" label="Severity of Symptoms" rules={[{ required: true }]}>
                                <Select className="rounded-xl h-12">
                                    <Option value="mild">Mild (Noticeable but easy to ignore)</Option>
                                    <Option value="moderate">Moderate (Interferes with daily activities)</Option>
                                    <Option value="severe">Severe (Unable to perform daily activities)</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item name="duration" label="How long have you had these symptoms?">
                                <Select className="rounded-xl h-12">
                                    <Option value="hours">A few hours</Option>
                                    <Option value="days">A few days</Option>
                                    <Option value="weeks">Weeks or more</Option>
                                </Select>
                            </Form.Item>
                            <div className="flex gap-4">
                                <Button size="large" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setCurrentStep(0)}>
                                    Back
                                </Button>
                                <Button type="primary" htmlType="submit" size="large" loading={loading} className="flex-2 h-12 rounded-xl font-bold flex items-center justify-center gap-2">
                                    Run AI Analysis <SendOutlined />
                                </Button>
                            </div>
                        </Form>

                        <Divider plain className="mt-12">Common Symptoms</Divider>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {['itching', 'skin_rash', 'fatigue', 'high_fever', 'headache', 'nausea'].map(s => (
                                <Tag
                                    key={s}
                                    className="cursor-pointer px-4 py-2 rounded-full border-gray-200 hover:border-teal-500 hover:text-teal-600 transition-colors"
                                    onClick={() => {
                                        const current = form.getFieldValue('symptoms') || [];
                                        if (!current.includes(s)) {
                                            form.setFieldsValue({ symptoms: [...current, s] });
                                        }
                                    }}
                                >
                                    {s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Tag>
                            ))}
                        </div>
                    </Card>
                )}

                {currentStep === 2 && analysisResult && (
                    <div className="space-y-6">
                        <Card className="shadow-md border-none rounded-3xl p-6 bg-teal-50">
                            <div className="text-center mb-8">
                                <CheckCircleOutlined className="text-5xl text-teal-600 mb-4" />
                                <Title level={2} className="m-0 text-teal-900">Analysis Complete</Title>
                                <Paragraph className="text-teal-700">Based on your symptoms and AI medical database.</Paragraph>
                            </div>

                            <Row gutter={24}>
                                <Col span={12}>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm h-full flex flex-col justify-between">
                                        <div>
                                            <Text type="secondary" className="uppercase text-xs font-bold tracking-widest">Potential Condition</Text>
                                            <Title level={3} className="m-0 mt-1 text-gray-800">{analysisResult.primaryCondition}</Title>
                                        </div>
                                        <div className="mt-4">
                                            <Tag color="#14b8a6" className="rounded-full border-none px-3 py-1 text-sm font-medium">
                                                {Math.round((analysisResult.confidence || 0.98) * 100)}% Probability
                                            </Tag>
                                        </div>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm h-full flex flex-col justify-between">
                                        <div>
                                            <Text type="secondary" className="uppercase text-xs font-bold tracking-widest">Recommendation</Text>
                                            <Title level={4} className="m-0 mt-1 text-gray-800">Visit a {analysisResult.specialist}</Title>
                                        </div>
                                        <div className="mt-4">
                                            <Tag color={analysisResult.urgency === 'high' ? 'red' : analysisResult.urgency === 'medium' ? 'orange' : 'blue'} className="rounded-full border-none px-3 py-1 text-sm font-medium capitalize">
                                                {analysisResult.urgency || 'Consultation advised'}
                                            </Tag>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card>

                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Card className="shadow-sm border-none rounded-3xl p-4" title={<span className="font-bold">About the Condition</span>}>
                                    <Paragraph className="m-0">{analysisResult.description}</Paragraph>
                                </Card>
                            </Col>

                            <Col span={12}>
                                <Card className="shadow-sm border-none rounded-3xl p-4 h-full" title={<span className="font-bold">Recommended Medications</span>}>
                                    <List
                                        size="small"
                                        dataSource={analysisResult.details?.medications || []}
                                        renderItem={(item: string) => <List.Item className="border-none py-1">{item}</List.Item>}
                                        locale={{ emptyText: 'No specific medications listed.' }}
                                    />
                                </Card>
                            </Col>

                            <Col span={12}>
                                <Card className="shadow-sm border-none rounded-3xl p-4 h-full" title={<span className="font-bold">Dietary Advice</span>}>
                                    <List
                                        size="small"
                                        dataSource={analysisResult.details?.diet || []}
                                        renderItem={(item: string) => <List.Item className="border-none py-1">{item}</List.Item>}
                                        locale={{ emptyText: 'No specific dietary advice.' }}
                                    />
                                </Card>
                            </Col>

                            <Col span={24}>
                                <Card className="shadow-sm border-none rounded-3xl p-4" title={<span className="font-bold">Workout & Lifestyle</span>}>
                                    <List
                                        size="small"
                                        dataSource={analysisResult.details?.workout || []}
                                        renderItem={(item: string) => <List.Item className="border-none py-1">{item}</List.Item>}
                                        locale={{ emptyText: 'No specific workout recommended.' }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        <Card className="shadow-sm border-none rounded-3xl p-4" title={<span className="font-bold flex items-center gap-2"><HistoryOutlined /> Precautions & Care Steps</span>}>
                            <List
                                dataSource={analysisResult.recommendations}
                                renderItem={(item: string) => (
                                    <List.Item className="border-none py-2 px-0">
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-teal-500 rounded-full mt-2" />
                                            <Text>{item}</Text>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </Card>

                        <Card className="shadow-sm border-none rounded-3xl p-4 bg-orange-50 border-l-4 border-orange-400">
                            <div className="flex items-start gap-4">
                                <ExclamationCircleOutlined className="text-xl text-orange-500 mt-1" />
                                <div>
                                    <Title level={5} className="m-0 text-orange-800">Medical Disclaimer</Title>
                                    <Paragraph className="text-orange-700 m-0">This AI assessment is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.</Paragraph>
                                </div>
                            </div>
                        </Card>

                        <div className="flex gap-4">
                            <Button size="large" className="flex-1 h-14 rounded-2xl font-bold" onClick={() => setCurrentStep(1)}>
                                Restart Analysis
                            </Button>
                            <Button type="primary" size="large" className="flex-1 h-14 rounded-2xl font-bold" onClick={() => navigate('/dashboard')}>
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>
                )}
            </Content>
        </Layout>
    );
};

export default SymptomChecker;
