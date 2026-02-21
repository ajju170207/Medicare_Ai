import React from 'react';
import { Layout, Card, Avatar, Typography, Row, Col, Tag, Button, Statistic, List, Divider } from 'antd';
import {
    UserOutlined,
    MailOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    SafetyCertificateOutlined,
    EditOutlined,
    HistoryOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import SharedHeader from '../components/SharedHeader';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const healthStats = [
        { title: 'Blood Type', value: 'O+', icon: <SafetyCertificateOutlined className="text-red-500" /> },
        { title: 'Last Check', value: '2 Days Ago', icon: <HistoryOutlined className="text-blue-500" /> },
        { title: 'Status', value: 'Verified', icon: <SafetyCertificateOutlined className="text-green-500" /> },
    ];

    const recentActivity = [
        { title: 'Lower Back Pain Analysis', date: 'Feb 14, 2026', result: 'Muscle Strain' },
        { title: 'Seasonal Allergy Library Search', date: 'Feb 12, 2026', result: 'Information Viewed' },
        { title: 'Hospital Search: Mumbai Central', date: 'Feb 10, 2026', result: '3 Facilities Found' },
    ];

    return (
        <Layout className="min-h-screen bg-gray-50">
            <SharedHeader
                title="Patient Profile"
                showBackButton
                onBack={() => navigate('/dashboard')}
            />

            <Content className="p-6 max-w-5xl mx-auto w-full">
                <Row gutter={[24, 24]}>
                    {/* Sidebar / Brief Info */}
                    <Col xs={24} lg={8}>
                        <Card className="text-center shadow-sm border-none rounded-2xl">
                            <Avatar
                                size={120}
                                icon={<UserOutlined />}
                                src={(user as any)?.avatar}
                                className="bg-teal-500 border-4 border-teal-50 shadow-md mb-4"
                            >
                                {(user as any)?.firstName?.charAt(0)}
                            </Avatar>
                            <Title level={3} className="mb-0">{(user as any)?.firstName} {(user as any)?.lastName}</Title>
                            <Text type="secondary" className="block mb-4">Patient ID: #MC-001245</Text>
                            <Tag color="teal" className="rounded-full px-4 py-0.5 border-none font-medium mb-6">Verified Member</Tag>

                            <Divider />

                            <div className="text-left space-y-4">
                                <div className="flex items-center">
                                    <MailOutlined className="text-gray-400 mr-3" />
                                    <Text>{user?.email || 'patient@medicare.ai'}</Text>
                                </div>
                                <div className="flex items-center">
                                    <EnvironmentOutlined className="text-gray-400 mr-3" />
                                    <Text>Mumbai, Maharashtra, India</Text>
                                </div>
                                <div className="flex items-center">
                                    <CalendarOutlined className="text-gray-400 mr-3" />
                                    <Text>Joined Feb 2026</Text>
                                </div>
                            </div>

                            <Button
                                type="primary"
                                ghost
                                icon={<EditOutlined />}
                                className="w-full mt-8 rounded-xl h-11 border-teal-200 text-teal-600"
                            >
                                Edit Profile
                            </Button>
                        </Card>
                    </Col>

                    {/* Main Content */}
                    <Col xs={24} lg={16}>
                        <div className="space-y-6">
                            {/* Stats */}
                            <Row gutter={16}>
                                {healthStats.map((stat, idx) => (
                                    <Col span={8} key={idx}>
                                        <Card className="shadow-sm border-none rounded-2xl">
                                            <Statistic
                                                title={<span className="text-xs uppercase tracking-wider font-bold text-gray-400">{stat.title}</span>}
                                                value={stat.value}
                                                prefix={stat.icon}
                                                valueStyle={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}
                                            />
                                        </Card>
                                    </Col>
                                ))}
                            </Row>

                            {/* Recent Activity */}
                            <Card
                                title={<span className="text-lg font-bold text-gray-800">Recent Health Activity</span>}
                                className="shadow-sm border-none rounded-2xl"
                                extra={<Button type="link" className="text-teal-600 font-medium">Clear All</Button>}
                            >
                                <List
                                    itemLayout="horizontal"
                                    dataSource={recentActivity}
                                    renderItem={(item) => (
                                        <List.Item className="px-0 py-4 hover:bg-gray-50 transition-colors">
                                            <List.Item.Meta
                                                avatar={<div className="p-3 bg-teal-50 rounded-xl"><HistoryOutlined className="text-teal-600" /></div>}
                                                title={<Text strong>{item.title}</Text>}
                                                description={
                                                    <div className="flex justify-between w-full">
                                                        <Text type="secondary" className="text-xs">{item.date}</Text>
                                                        <Tag color="blue" className="text-[10px] rounded-full border-none px-2 uppercase font-bold">{item.result}</Tag>
                                                    </div>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Card>

                            <Card className="bg-teal-600 border-none rounded-2xl shadow-lg p-2 overflow-hidden relative">
                                <div className="relative z-10 p-4">
                                    <Title level={4} className="text-white m-0">Go Premium</Title>
                                    <Paragraph className="text-teal-50 mt-1 mb-4 opacity-90">Get unlimited AI analyses and 24/7 doctor consultations.</Paragraph>
                                    <Button className="bg-white text-teal-600 border-none font-bold rounded-xl h-10 px-6">Explore Plans</Button>
                                </div>
                                <SafetyCertificateOutlined className="absolute -right-6 -bottom-6 text-white opacity-10 text-[140px]" />
                            </Card>
                        </div>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default Profile;
