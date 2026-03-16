import React, { useState, useEffect } from 'react';
import { Layout, Input, Card, Tag, Typography, message, Row, Col, Empty, Spin, Drawer, List, Avatar, Button, FloatButton } from 'antd';
import { SearchOutlined, BookOutlined, MessageOutlined, SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SharedHeader from '../components/SharedHeader';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const DiseaseLibrary: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [diseases, setDiseases] = useState<any[]>([]);

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([
        { role: 'assistant', content: 'Hello! I am your Medicare AI Assistant. How can I help you today with information about diseases or treatments?' }
    ]);

    const fetchDiseases = async (search = '') => {
        setLoading(true);
        try {
            let allDiseases: any[] = [];

            if (import.meta.env && import.meta.env.DEV) {
                const mod = await import('../data/expandedDiseaseLibrary.json');
                allDiseases = (mod && (mod.default || mod)) as any[];
            } else {
                const response = await api.get(`/diseases${search ? `?search=${search}` : ''}`);
                allDiseases = response.data.data;
            }

            // FILTER: Only show diseases that have actual content for Diet, Precautions and Medications
            const filtered = allDiseases.filter(d => {
                const hasPrecautions = Array.isArray(d.precautions) && d.precautions.length > 0;
                const hasMedications = Array.isArray(d.medications) && d.medications.length > 0;
                const hasDiet = Array.isArray(d.diet_recommendations) && d.diet_recommendations.length > 0;

                // Match search term if provided
                const matchesSearch = search
                    ? d.name.toLowerCase().includes(search.toLowerCase())
                    : true;

                return hasPrecautions && hasMedications && hasDiet && matchesSearch;
            });

            setDiseases(filtered);
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
        fetchDiseases(value);
    };

    const handleSendMessage = async () => {
        if (!chatMessage.trim()) return;

        const newUserMessage = { role: 'user', content: chatMessage };
        setMessages(prev => [...prev, newUserMessage]);
        setChatMessage('');
        setChatLoading(true);

        try {
            const response = await api.post('/chat/disease', {
                message: chatMessage,
                history: messages.map(m => ({ role: m.role, content: m.content }))
            });

            setMessages(prev => [...prev, { role: 'assistant', content: response.data.data }]);
        } catch (error) {
            message.error('Failed to get response from AI');
        } finally {
            setChatLoading(false);
        }
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

                <FloatButton
                    icon={<MessageOutlined />}
                    type="primary"
                    style={{ right: 48, bottom: 48, width: 64, height: 64 }}
                    onClick={() => setIsChatOpen(true)}
                    tooltip={<div>Medical Chatbot</div>}
                />

                <Drawer
                    title={
                        <div className="flex items-center gap-3">
                            <Avatar icon={<RobotOutlined />} className="bg-blue-500" />
                            <div>
                                <Text strong className="block leading-none">Medicare AI Assistant</Text>
                                <Text type="secondary" style={{ fontSize: '10px' }}>Online • Disease Knowledge Base</Text>
                            </div>
                        </div>
                    }
                    placement="right"
                    onClose={() => setIsChatOpen(false)}
                    open={isChatOpen}
                    width={400}
                    bodyStyle={{ display: 'flex', flexDirection: 'column', padding: '16px' }}
                    headerStyle={{ borderBottom: '1px solid #f0f0f0' }}
                >
                    <div className="flex-1 overflow-y-auto mb-4 pr-2 custom-scrollbar">
                        <List
                            itemLayout="horizontal"
                            dataSource={messages}
                            renderItem={(item) => (
                                <div className={`flex mb-4 ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-3 max-w-[85%] ${item.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <Avatar
                                            icon={item.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                                            className={item.role === 'user' ? 'bg-gray-400' : 'bg-blue-500'}
                                            size="small"
                                        />
                                        <div className={`p-3 rounded-2xl ${item.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none shadow-sm'}`}>
                                            <Text className={item.role === 'user' ? 'text-white' : 'text-gray-800'}>{item.content}</Text>
                                        </div>
                                    </div>
                                </div>
                            )}
                        />
                        {chatLoading && (
                            <div className="flex gap-3 mb-4">
                                <Avatar icon={<RobotOutlined />} className="bg-blue-500" size="small" />
                                <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                                    <Spin size="small" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <Input.TextArea
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onPressEnter={(e) => {
                                if (!e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Ask about symptoms, treatments, or medical data..."
                            autoSize={{ minRows: 2, maxRows: 4 }}
                            className="rounded-xl border-gray-200"
                        />
                        <div className="flex justify-between items-center mt-3">
                            <Text type="secondary" className="text-[10px]">AI-generated content. Consult a doctor.</Text>
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleSendMessage}
                                loading={chatLoading}
                                className="rounded-lg h-10 px-6 font-semibold shadow-md"
                            >
                                Send
                            </Button>
                        </div>
                    </div>
                </Drawer>
            </Content>
        </Layout >
    );
};

export default DiseaseLibrary;
