import React, { useState, useEffect } from 'react';
import { Layout, Card, Tag, Typography, message, Row, Col, Spin, Button, Divider } from 'antd';
import { SafetyCertificateOutlined, AlertOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import SharedHeader from '../components/SharedHeader';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const DiseaseDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [disease, setDisease] = useState<any>(null);

    useEffect(() => {
        const fetchDisease = async () => {
            try {
                const response = await api.get(`/diseases/${id}`);
                setDisease(response.data.data);
            } catch (error: any) {
                message.error('Failed to fetch disease details');
                navigate('/disease-library');
            } finally {
                setLoading(false);
            }
        };

        fetchDisease();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Layout className="min-h-screen bg-gray-50">
            <SharedHeader
                title={disease.name}
                showBackButton
                onBack={() => navigate('/disease-library')}
            />

            <Content className="p-6 max-w-5xl mx-auto w-full">
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        <Card className="shadow-sm border-none rounded-2xl overflow-hidden pb-4">
                            <Tag color="blue" className="mb-4 rounded-full px-4 py-1 text-sm font-medium">
                                {disease.body_system || 'General'}
                            </Tag>
                            <Title level={1}>{disease.name}</Title>
                            <Paragraph className="text-lg leading-relaxed text-gray-700">
                                {disease.description}
                            </Paragraph>

                            <Title level={3} className="mt-10">Common Symptoms</Title>
                            <div className="flex flex-wrap gap-2">
                                {disease.symptoms?.map((s: string, i: number) => (
                                    <Tag key={i} className="bg-gray-100 border-none rounded-full px-4 py-1.5 text-gray-700 text-sm">
                                        {s.replace(/_/g, ' ')}
                                    </Tag>
                                ))}
                            </div>

                            <Title level={3} className="mt-10">Specialist</Title>
                            <Paragraph className="text-lg text-gray-700">
                                You should consult a <Text strong>{disease.specialist_type}</Text> for this condition.
                            </Paragraph>

                            <Title level={3} className="mt-10">Medications</Title>
                            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-lg">
                                {disease.medications?.map((m: string, i: number) => (
                                    <li key={i}>{m}</li>
                                ))}
                            </ul>

                            <Title level={3} className="mt-10">Precautions</Title>
                            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-lg">
                                {disease.precautions?.map((p: string, i: number) => (
                                    <li key={i}>{p}</li>
                                ))}
                            </ul>

                            <Title level={3} className="mt-10">Dietary Recommendations</Title>
                            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-lg">
                                {disease.diet_recommendations?.map((d: string, i: number) => (
                                    <li key={i}>{d}</li>
                                ))}
                            </ul>
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card className="shadow-sm border-none rounded-2xl bg-blue-50 mb-6">
                            <div className="flex items-center text-blue-600 mb-4">
                                <SafetyCertificateOutlined className="text-2xl mr-3" />
                                <Title level={4} className="m-0 text-blue-600">Health Tips</Title>
                            </div>
                            <Paragraph className="text-blue-700 font-medium mb-4">
                                Recommended workouts and activities:
                            </Paragraph>
                            <ul className="p-0 list-none space-y-3">
                                {disease.workout_recommendations?.map((w: string, i: number) => (
                                    <li key={i} className="flex items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-3 mt-2" />
                                        <Text className="text-blue-800">{w}</Text>
                                    </li>
                                ))}
                            </ul>
                            <Button
                                type="primary"
                                block
                                className="mt-6 rounded-xl h-12 font-bold shadow-md"
                                onClick={() => navigate('/symptom-checker')}
                            >
                                Re-check Symptoms
                            </Button>
                        </Card>

                        <Card className="shadow-sm border-none rounded-2xl bg-red-50 border-red-100 border">
                            <div className="flex items-center text-red-600 mb-4">
                                <AlertOutlined className="text-2xl mr-3" />
                                <Title level={4} className="m-0 text-red-600">Severity Level</Title>
                            </div>
                            <Tag color={disease.severity === 'severe' ? 'red' : disease.severity === 'moderate' ? 'orange' : 'green'} className="text-lg py-1 px-4 mb-3">
                                {disease.severity?.toUpperCase()}
                            </Tag>
                            <Paragraph className="text-sm text-red-800">
                                This condition has a severity score of {disease.severity_score}/10.
                                {disease.severity === 'severe' && " Please seek medical attention immediately."}
                            </Paragraph>
                        </Card>

                        <div className="mt-8 p-6 bg-gray-100 rounded-2xl">
                            <Text type="secondary" className="text-sm block">
                                Last reviewed: {new Date(disease.last_reviewed).toLocaleDateString()}
                            </Text>
                            <Divider className="my-3" />
                            <Paragraph className="text-xs text-gray-500 mb-0 italic">
                                This information is compiled from trusted health sources. However, it should not replace professional medical advice.
                            </Paragraph>
                        </div>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default DiseaseDetail;
