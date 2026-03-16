import React from 'react';
import { Layout, Card, Avatar, Typography, Row, Col, Tag, Button, Divider } from 'antd';
import {
    UserOutlined,
    MailOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    SafetyCertificateOutlined,
    EditOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import SharedHeader from '../components/SharedHeader';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

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
                            <Tag color="teal" className="rounded-full px-4 py-0.5 border-none font-medium mb-6">Verified Member</Tag>

                            <Divider />

                            <div className="text-left space-y-4">
                                <div className="flex items-center">
                                    <MailOutlined className="text-gray-400 mr-3" />
                                    <Text>{user?.email || '—'}</Text>
                                </div>
                                <div className="flex items-center">
                                    <EnvironmentOutlined className="text-gray-400 mr-3" />
                                    <Text>{[user?.district, user?.state].filter(Boolean).join(', ') || '—'}</Text>
                                </div>
                                <div className="flex items-center">
                                    <CalendarOutlined className="text-gray-400 mr-3" />
                                    <Text>{user?.age ? `Age: ${user.age}` : '—'}</Text>
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
                            {/* Premium CTA */}
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
