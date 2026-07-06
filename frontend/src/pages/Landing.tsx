import React, { useEffect, useState } from 'react';
import { Button, Typography, Layout, Row, Col, Card } from 'antd';
import { 
    RobotOutlined, 
    StethoscopeOutlined, 
    SearchOutlined,
    GlobalOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Content, Header } = Layout;

const Landing: React.FC = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <Layout className="min-h-screen bg-[#0f172a] text-white selection:bg-blue-500 selection:text-white">
            {/* Header / Nav */}
            <Header className={`fixed w-full z-50 transition-all duration-300 px-6 md:px-12 ${scrolled ? 'bg-[#0f172a]/90 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'}`} style={{ height: 'auto', lineHeight: 'normal' }}>
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <RobotOutlined className="text-xl text-white" />
                        </div>
                        <Title level={4} className="m-0 text-white tracking-tight" style={{ color: 'white' }}>Medicare AI</Title>
                    </div>
                    <div className="flex gap-4">
                        <Button type="text" className="text-gray-300 hover:text-white" onClick={() => navigate('/login')}>Login</Button>
                        <Button type="primary" className="bg-blue-600 hover:bg-blue-500 border-none rounded-full px-6 font-medium shadow-lg shadow-blue-600/20" onClick={() => navigate('/register')}>Get Started</Button>
                    </div>
                </div>
            </Header>

            <Content className="pt-32">
                {/* Hero Section */}
                <div className="relative overflow-hidden">
                    {/* Abstract background shapes */}
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse"></div>
                    <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30"></div>
                    
                    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-32 relative z-10">
                        <Row gutter={[48, 48]} align="middle">
                            <Col xs={24} lg={14} className="text-center lg:text-left">
                                <div className="inline-block px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-700/30 text-blue-300 text-sm font-semibold mb-6 backdrop-blur-sm">
                                    ✨ The Future of Intelligent Healthcare
                                </div>
                                <Title level={1} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight" style={{ color: 'white' }}>
                                    Your Personal AI <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                                        Medical Assistant
                                    </span>
                                </Title>
                                <Paragraph className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                    Experience lightning-fast symptom analysis, browse comprehensive disease libraries, and locate the nearest healthcare facilities in seconds.
                                </Paragraph>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <Button 
                                        type="primary" 
                                        size="large" 
                                        className="h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-500 border-none text-lg font-medium shadow-xl shadow-blue-900/50 flex items-center gap-2"
                                        onClick={() => navigate('/register')}
                                    >
                                        Start Free Assessment <ArrowRightOutlined />
                                    </Button>
                                    <Button 
                                        size="large" 
                                        className="h-14 px-8 rounded-full bg-transparent border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 text-lg font-medium"
                                        onClick={() => {
                                            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        Explore Features
                                    </Button>
                                </div>
                            </Col>
                            <Col xs={24} lg={10}>
                                <div className="relative rounded-3xl overflow-hidden border border-gray-800 bg-[#1e293b]/50 backdrop-blur-xl shadow-2xl p-6 group hover:border-gray-700 transition-all duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-2xl bg-gray-800/50 border border-gray-700/50 w-[80%] animate-pulse">
                                            <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                                            <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-blue-900/30 border border-blue-800/50 w-[85%] ml-auto text-right">
                                            <Text className="text-blue-100">I have a severe headache and fever.</Text>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-gray-800/50 border border-gray-700/50 w-[90%]">
                                            <Text className="text-gray-300">Based on your symptoms, this could be early signs of Migraine or Viral Fever. I recommend consulting a General Physician.</Text>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>

                {/* Features Section */}
                <div id="features" className="py-24 bg-[#0a0f1c] relative z-10">
                    <div className="max-w-7xl mx-auto px-6 md:px-12">
                        <div className="text-center mb-16">
                            <Title level={2} style={{ color: 'white' }} className="text-4xl font-bold mb-4">Powerful Healthcare Tools</Title>
                            <Paragraph className="text-gray-400 text-lg">Everything you need to make informed medical decisions.</Paragraph>
                        </div>
                        <Row gutter={[24, 24]}>
                            <Col xs={24} md={8}>
                                <Card className="bg-[#1e293b]/40 border-gray-800 hover:border-blue-500/50 hover:bg-[#1e293b]/60 transition-all duration-300 h-full rounded-3xl" bodyStyle={{ padding: '32px' }}>
                                    <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400 text-2xl">
                                        <StethoscopeOutlined />
                                    </div>
                                    <Title level={3} style={{ color: 'white' }} className="mb-4">AI Symptom Checker</Title>
                                    <Paragraph className="text-gray-400 text-base leading-relaxed">
                                        Input your symptoms and instantly receive AI-driven insights, possible conditions, and medical recommendations tailored for you.
                                    </Paragraph>
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card className="bg-[#1e293b]/40 border-gray-800 hover:border-purple-500/50 hover:bg-[#1e293b]/60 transition-all duration-300 h-full rounded-3xl" bodyStyle={{ padding: '32px' }}>
                                    <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400 text-2xl">
                                        <SearchOutlined />
                                    </div>
                                    <Title level={3} style={{ color: 'white' }} className="mb-4">Disease Library</Title>
                                    <Paragraph className="text-gray-400 text-base leading-relaxed">
                                        Search and explore an extensive library of medical conditions. Learn about symptoms, precautions, diets, and treatments.
                                    </Paragraph>
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card className="bg-[#1e293b]/40 border-gray-800 hover:border-emerald-500/50 hover:bg-[#1e293b]/60 transition-all duration-300 h-full rounded-3xl" bodyStyle={{ padding: '32px' }}>
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400 text-2xl">
                                        <GlobalOutlined />
                                    </div>
                                    <Title level={3} style={{ color: 'white' }} className="mb-4">Hospital Finder</Title>
                                    <Paragraph className="text-gray-400 text-base leading-relaxed">
                                        Instantly locate the nearest hospitals, clinics, and pharmacies. Get directions and emergency contact numbers immediately.
                                    </Paragraph>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                        <Title level={2} style={{ color: 'white' }} className="text-4xl md:text-5xl font-bold mb-6">Ready to take control of your health?</Title>
                        <Paragraph className="text-xl text-gray-400 mb-10">
                            Join thousands of users who trust Medicare AI for instant, reliable medical insights.
                        </Paragraph>
                        <Button 
                            type="primary" 
                            size="large" 
                            className="h-14 px-10 rounded-full bg-white text-blue-900 hover:bg-gray-100 border-none text-lg font-bold shadow-xl"
                            onClick={() => navigate('/register')}
                        >
                            Create Your Free Account
                        </Button>
                        <Paragraph className="mt-6 text-gray-500 text-sm">
                            Already have an account? <span className="text-blue-400 cursor-pointer hover:underline" onClick={() => navigate('/login')}>Log in here</span>.
                        </Paragraph>
                    </div>
                </div>
            </Content>

            {/* Footer */}
            <footer className="border-t border-gray-800 bg-[#0a0f1c] py-8 text-center">
                <Text className="text-gray-500">© 2026 Medicare AI. All rights reserved.</Text>
                <div className="mt-2">
                    <Text className="text-gray-600 text-xs">Medical Disclaimer: This platform provides informational AI insights and is not a substitute for professional medical advice.</Text>
                </div>
            </footer>
        </Layout>
    );
};

export default Landing;
