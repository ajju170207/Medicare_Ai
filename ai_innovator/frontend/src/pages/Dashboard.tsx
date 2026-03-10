import React, { useState } from 'react';
import { Layout, Menu, Button, Card, Typography, Row, Col, Badge, Avatar, Space, Dropdown, List } from 'antd';
import {
    LogoutOutlined,
    BellOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    HeartOutlined
} from '@ant-design/icons';
import {
    LayoutDashboard,
    Stethoscope as StethoscopeIcon,
    BookOpen as BookOpenIcon,
    Hospital as HospitalIcon,
    History as HistoryIcon,
    AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LanguageSelector from '../components/LanguageSelector';
import SharedHeader from '../components/SharedHeader';
import { getNotifications, markAsRead } from '../services/notificationService';
import type { Notification } from '../services/notificationService';
import { formatDistanceToNow } from 'date-fns';

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// Removed hardcoded notifications

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [collapsed, setCollapsed] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoadingNotifications(true);
            const data = await getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoadingNotifications(false);
        }
    };

    React.useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const menuItems = [
        { key: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard' },
        { key: '/symptom-checker', icon: <StethoscopeIcon className="w-4 h-4" />, label: 'Symptom Checker' },
        { key: '/disease-library', icon: <BookOpenIcon className="w-4 h-4" />, label: 'Disease Library' },
        { key: '/hospital-finder', icon: <HospitalIcon className="w-4 h-4" />, label: 'Hospital Finder' },
        { key: '/profile', icon: <HistoryIcon className="w-4 h-4" />, label: 'My Health' },
    ];

    const quickActions = [
        {
            title: 'Symptom Checker',
            description: 'Get an instant AI-powered health analysis based on your symptoms.',
            icon: <StethoscopeIcon className="w-8 h-8 text-blue-500" />,
            color: 'bg-blue-50',
            path: '/symptom-checker',
        },
        {
            title: 'Disease Library',
            description: 'Search our comprehensive database of medical conditions and treatments.',
            icon: <BookOpenIcon className="w-8 h-8 text-green-500" />,
            color: 'bg-green-50',
            path: '/disease-library',
        },
        {
            title: 'Hospital Finder',
            description: 'Locate the nearest medical facilities and emergency centers in real-time.',
            icon: <HospitalIcon className="w-8 h-8 text-red-500" />,
            color: 'bg-red-50',
            path: '/hospital-finder',
        },
        {
            title: 'Health History',
            description: 'Keep track of your previous analyses and health records in one place.',
            icon: <HistoryIcon className="w-8 h-8 text-purple-500" />,
            color: 'bg-purple-50',
            path: '/history',
        },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Layout className="min-h-screen">
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                theme="light"
                className="shadow-xl bg-white border-r border-gray-100"
                width={260}
            >
                <div className="flex items-center px-6 h-20 border-b border-gray-50">
                    <HeartOutlined className="text-teal-600 text-3xl mr-3" />
                    {!collapsed && <span className="text-2xl font-bold tracking-tight text-gray-800">MediCare AI</span>}
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    defaultSelectedKeys={['/dashboard']}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    className="mt-6 border-none px-2 bg-transparent"
                />
                <div className="absolute bottom-6 w-full px-6">
                    <Button
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        block
                        type="text"
                        size="large"
                        className="flex items-center justify-center rounded-xl text-red-600 hover:text-red-500 hover:bg-red-50 transition-colors font-medium border border-transparent hover:border-red-100"
                    >
                        {!collapsed && <span className="ml-2">Sign Out</span>}
                    </Button>
                </div>
            </Sider>

            <Layout className="bg-white">
                <SharedHeader
                    title="Medical Dashboard"
                    leftExtra={
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            className="text-xl w-12 h-12 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100"
                        />
                    }
                    extra={
                        <div className="flex items-center space-x-6">
                            {/* Removed redundant middle Verified Patient badge */}
                            <LanguageSelector />

                            <Space size="large" className="ml-4">
                                <Dropdown
                                    trigger={['click']}
                                    placement="bottomRight"
                                    overlayClassName="notification-dropdown"
                                    menu={{ items: [] }} // Using overlay instead
                                    dropdownRender={() => (
                                        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-80">
                                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                                <Text strong className="text-gray-800">Notifications</Text>
                                                <Badge count={unreadCount} color="#10b981" />
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                <List
                                                    itemLayout="horizontal"
                                                    dataSource={notifications}
                                                    loading={loadingNotifications}
                                                    locale={{ emptyText: <div className="p-8 text-center text-gray-400">No notifications yet</div> }}
                                                    renderItem={(item) => (
                                                        <List.Item
                                                            className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 last:border-none ${!item.read ? 'bg-teal-50/30' : 'hover:bg-gray-50'}`}
                                                            onClick={() => !item.read && handleMarkAsRead(item.id)}
                                                        >
                                                            <List.Item.Meta
                                                                title={
                                                                    <div className="flex items-center justify-between">
                                                                        <Text strong className={`text-sm ${!item.read ? 'text-teal-900' : 'text-gray-700'}`}>{item.title}</Text>
                                                                        {!item.read && <div className="w-2 h-2 rounded-full bg-teal-500 shadow-sm"></div>}
                                                                    </div>
                                                                }
                                                                description={
                                                                    <div className="flex flex-col mt-0.5">
                                                                        <Text className={`text-xs ${!item.read ? 'text-gray-700' : 'text-gray-500'}`}>{item.body}</Text>
                                                                        <Text className="text-[10px] text-gray-400 mt-1">{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</Text>
                                                                    </div>
                                                                }
                                                            />
                                                        </List.Item>
                                                    )}
                                                />
                                            </div>
                                            <div className="p-2 text-center bg-gray-50 border-t border-gray-100">
                                                <Button type="link" size="small" className="text-teal-600 font-semibold" onClick={fetchNotifications}>Refresh</Button>
                                            </div>
                                        </div>
                                    )}
                                >
                                    <Badge count={unreadCount} offset={[-2, 6]} color="#10b981">
                                        <Button
                                            type="text"
                                            icon={<BellOutlined />}
                                            className="text-xl w-12 h-12 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100"
                                        />
                                    </Badge>
                                </Dropdown>
                                <div className="flex items-center bg-white py-1.5 pl-4 pr-1.5 rounded-full border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                    <div className="text-right hidden md:block mr-3">
                                        <Text strong className="block text-sm text-gray-800 leading-tight">{(user as any)?.firstName} {(user as any)?.lastName}</Text>
                                        <div className="flex items-center justify-end">
                                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-1.5 animate-pulse"></div>
                                            <span className="text-[10px] uppercase tracking-wider font-black text-teal-600 leading-none">Verified Patient</span>
                                        </div>
                                    </div>
                                    <Avatar
                                        size={40}
                                        className="bg-teal-500 shadow-sm border-2 border-white group-hover:scale-105 transition-transform"
                                    >
                                        {(user as any)?.firstName?.charAt(0)}
                                    </Avatar>
                                </div>
                            </Space>
                        </div>
                    }
                />


                <Content className="m-6 overflow-initial">
                    <div className="mb-8">
                        <Title level={2}>Welcome back, {(user as any)?.firstName}! 👋</Title>
                        <Text type="secondary" className="text-lg">What would you like to do today?</Text>
                    </div>

                    <Row gutter={[24, 24]}>
                        {quickActions.map((action, index) => (
                            <Col xs={24} md={12} key={index}>
                                <Card
                                    hoverable
                                    onClick={() => navigate(action.path)}
                                    className="shadow-sm border-none rounded-2xl h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                                >
                                    <div className="flex items-start">
                                        <div className={`p-4 rounded-2xl ${action.color} mr-6`}>
                                            {action.icon}
                                        </div>
                                        <div>
                                            <Title level={4} className="mb-1">{action.title}</Title>
                                            <Paragraph type="secondary" className="mb-0 text-gray-500">
                                                {action.description}
                                            </Paragraph>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <Card className="mt-8 border-none bg-red-50 rounded-2xl shadow-sm border-l-4 border-red-500">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center">
                                <div className="p-3 bg-red-100 rounded-xl mr-4">
                                    <AlertTriangle className="text-red-500 w-6 h-6" />
                                </div>
                                <div>
                                    <Title level={4} className="m-0 text-red-700">Medical Emergency?</Title>
                                    <Text className="text-red-600">Immediate help is available. Find the nearest hospital now.</Text>
                                </div>
                            </div>
                            <Button
                                type="primary"
                                danger
                                size="large"
                                className="rounded-xl h-12 px-8 font-bold shadow-md shadow-red-200"
                                onClick={() => navigate('/hospital-finder')}
                            >
                                Emergency Services
                            </Button>
                        </div>
                    </Card>

                    <footer className="mt-12 text-center text-gray-400 text-sm italic">
                        "Your health is our priority. MediCare AI provides smart insights for a healthier you."
                    </footer>
                </Content>
            </Layout>
        </Layout>
    );
};

export default Dashboard;
