import React, { useState, useEffect } from 'react';
import { Layout, Card, Typography, List, Tag, Button, Empty, Divider, message, Spin } from 'antd';
import {
    HistoryOutlined,
    CheckCircleOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import SharedHeader from '../components/SharedHeader';
import api from '../services/api';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const HealthHistory: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [historyData, setHistoryData] = useState<any[]>([]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await api.get('/symptoms/history');
            if (res.data.success) {
                setHistoryData(res.data.data);
            }
        } catch (error: any) {
            message.error('Failed to fetch health history');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/symptoms/history/${id}`);
            message.success('History item deleted');
            fetchHistory();
        } catch (error) {
            message.error('Failed to delete history item');
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return (
        <Layout className="min-h-screen bg-white">
            <SharedHeader
                title="Health History"
                showBackButton
                onBack={() => navigate('/dashboard')}
            />

            <Content className="p-6 max-w-4xl mx-auto w-full">
                <div className="mb-10 text-center">
                    <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <HistoryOutlined className="text-3xl text-teal-600" />
                    </div>
                    <Title level={2}>Patient Records</Title>
                    <Paragraph type="secondary" className="text-lg">
                        View and manage your previous AI-powered symptom analyses.
                    </Paragraph>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Spin size="large" />
                    </div>
                ) : historyData.length > 0 ? (
                    <List
                        dataSource={historyData}
                        renderItem={(item) => (
                            <List.Item className="px-0 py-4 border-none">
                                <Card
                                    className="w-full shadow-sm hover:shadow-md transition-all border-gray-100 rounded-3xl overflow-hidden group"
                                    bodyStyle={{ padding: 0 }}
                                >
                                    <div className="flex flex-col md:flex-row">
                                        <div className="p-6 md:w-1/4 bg-gray-50 flex flex-col justify-center items-center md:border-r border-gray-100">
                                            <div className="p-3 bg-white rounded-2xl shadow-sm mb-2">
                                                <FileTextOutlined className="text-xl text-teal-600" />
                                            </div>
                                            <Text strong className="block">{new Date(item.created_at).toLocaleDateString()}</Text>
                                            <Text type="secondary" className="text-xs">{new Date(item.created_at).toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' })}</Text>
                                        </div>
                                        <div className="p-6 md:w-3/4 flex flex-col md:flex-row justify-between items-center group-hover:bg-gray-50/30 transition-colors">
                                            <div className="mb-4 md:mb-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Title level={4} className="m-0">{item.disease_name || 'Analysis'}</Title>
                                                    <Tag color={item.severity === 'severe' ? 'red' : item.severity === 'moderate' ? 'orange' : 'green'} className="rounded-full border-none px-3 font-bold text-[10px] uppercase">
                                                        {item.severity || 'mild'}
                                                    </Tag>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {item.input_data?.symptoms && (
                                                        <Tag className="bg-white border-gray-200 text-gray-500 rounded-full text-xs">
                                                            {Array.isArray(item.input_data.symptoms) ? item.input_data.symptoms.join(', ') : item.input_data.symptoms}
                                                        </Tag>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <div className="flex items-center text-green-600 font-bold mb-1">
                                                        <CheckCircleOutlined className="mr-1" />
                                                        <span className="text-xs">COMPLETED</span>
                                                    </div>
                                                    <Text className="text-[10px] text-gray-400 block">{Math.round((item.confidence || 0) * 100)}% Match</Text>
                                                </div>
                                                <Button
                                                    danger
                                                    type="text"
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => handleDelete(item.id)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </List.Item>
                        )}
                    />
                ) : (
                    <Empty
                        description="No health history found"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button type="primary" onClick={() => navigate('/symptom-checker')}>
                            Start Your First Check
                        </Button>
                    </Empty>
                )}

                <Divider className="my-10" />

                <Card className="bg-gradient-to-r from-teal-600 to-teal-500 border-none rounded-3xl p-4 shadow-lg overflow-hidden relative">
                    <div className="relative z-10 p-4">
                        <Title level={3} className="text-white m-0">Need a New Analysis?</Title>
                        <Paragraph className="text-teal-50 mt-2 mb-6 opacity-90 text-lg">Our AI is ready to help you understand your symptoms with higher accuracy than ever.</Paragraph>
                        <Button
                            size="large"
                            onClick={() => navigate('/symptom-checker')}
                            className="bg-white text-teal-600 border-none font-bold rounded-2xl h-14 px-10 shadow-lg hover:scale-105 transition-transform"
                        >
                            Start New Check
                        </Button>
                    </div>
                    <ClockCircleOutlined className="absolute -right-10 -bottom-10 text-white opacity-10 text-[200px]" />
                </Card>
            </Content>
        </Layout>
    );
};

export default HealthHistory;
