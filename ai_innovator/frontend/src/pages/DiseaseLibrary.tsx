import React, { useState, useEffect } from 'react';
import { Layout, Input, Card, Tag, Typography, message, Row, Col, Empty, Spin } from 'antd';
import { SearchOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SharedHeader from '../components/SharedHeader';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const DiseaseLibrary: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [diseases, setDiseases] = useState<any[]>([]);
    const [, setSearchTerm] = useState('');

    const fetchDiseases = async (search = '') => {
        setLoading(true);
        try {
            const response = await api.get(`/diseases${search ? `?search=${search}` : ''}`);
            setDiseases(response.data.data);
        } catch (error: any) {
            message.error('Failed to fetch diseases');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiseases();
    }, []);

    const onSearch = (value: string) => {
        setSearchTerm(value);
        fetchDiseases(value);
    };

    return (
        <Layout className="min-h-screen bg-white">
            <SharedHeader
                title="Disease Library"
                showBackButton
                onBack={() => navigate('/dashboard')}
            />

            <Content className="p-6 max-w-6xl mx-auto w-full">
                <div className="mb-8">
                    <Title level={2}>Medical Knowledge Base</Title>
                    <Paragraph type="secondary" className="text-lg">
                        Search our comprehensive library of health conditions, symptoms, and treatments.
                    </Paragraph>
                    <Input
                        placeholder="Search for a condition (e.g., Flu, Diabetes...)"
                        size="large"
                        prefix={<SearchOutlined className="text-gray-400" />}
                        onChange={(e) => onSearch(e.target.value)}
                        className="mt-4 shadow-sm h-14 rounded-xl border-none"
                        allowClear
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center p-20">
                        <Spin size="large" />
                    </div>
                ) : diseases.length > 0 ? (
                    <Row gutter={[24, 24]}>
                        {diseases.map((disease) => (
                            <Col xs={24} sm={12} lg={8} key={disease.id}>
                                <Card
                                    hoverable
                                    className="h-full shadow-sm hover:shadow-md transition-shadow border-none rounded-xl"
                                    onClick={() => navigate(`/disease/${disease.slug}`)}
                                >
                                    <Tag color="blue" className="mb-3 rounded-full px-3">{disease.body_system || 'General'}</Tag>
                                    <Title level={4}>{disease.name}</Title>
                                    <Paragraph
                                        type="secondary"
                                        ellipsis={{ rows: 3 }}
                                        className="mb-4"
                                    >
                                        {disease.description}
                                    </Paragraph>
                                    <div className="flex items-center text-primary-500 font-medium">
                                        <BookOutlined className="mr-2" />
                                        Read More
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Empty
                        description="No conditions found matching your search."
                        className="mt-20"
                    />
                )}

                <div className="mt-12 py-8 px-6 bg-blue-50 rounded-2xl flex items-center justify-between">
                    <div>
                        <Title level={4} className="text-blue-900 m-0">Can't find what you're looking for?</Title>
                        <Text className="text-blue-700">Try our AI Symptom Checker for a personalized analysis.</Text>
                    </div>
                    <Typography.Link
                        onClick={() => navigate('/symptom-checker')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 shadow-md transition-colors"
                    >
                        Check Symptoms Now
                    </Typography.Link>
                </div>
            </Content>
        </Layout>
    );
};

export default DiseaseLibrary;
