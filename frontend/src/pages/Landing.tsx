import React, { useEffect, useState } from 'react';
import { Button, Typography, Layout, Row, Col, Card } from 'antd';
import { 
    RobotOutlined, 
    MedicineBoxOutlined, 
    SearchOutlined,
    GlobalOutlined,
    ArrowRightOutlined,
    CheckCircleFilled,
    SafetyCertificateOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Content, Header } = Layout;

const Landing: React.FC = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <Layout className="min-h-screen bg-[#f8fafc] font-sans selection:bg-blue-200">
            {/* Header / Nav */}
            <Header 
                className={`fixed w-full z-50 transition-all duration-300 px-6 md:px-12 ${scrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm py-2 border-b border-gray-100' : 'bg-transparent py-4'}`} 
                style={{ height: 'auto', lineHeight: 'normal' }}
            >
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20">
                            <RobotOutlined className="text-xl text-white" />
                        </div>
                        <Title level={4} className="m-0 tracking-tight" style={{ color: '#0f172a', fontWeight: 800 }}>Medicare AI</Title>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button type="text" className="text-slate-600 hover:text-blue-600 font-medium" onClick={() => navigate('/login')}>Login</Button>
                        <Button 
                            type="primary" 
                            className="bg-blue-600 hover:bg-blue-700 border-none rounded-full px-6 font-semibold shadow-md shadow-blue-600/20 h-10" 
                            onClick={() => navigate('/register')}
                        >
                            Get Started
                        </Button>
                    </div>
                </div>
            </Header>

            <Content>
                {/* Hero Section */}
                <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
                    {/* Background decorations */}
                    <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#f0f9ff] to-transparent"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-70 pointer-events-none"></div>
                    <div className="absolute top-40 -left-24 w-72 h-72 bg-indigo-50 rounded-full blur-3xl opacity-70 pointer-events-none"></div>

                    <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                        <Row gutter={[48, 48]} align="middle">
                            <Col xs={24} lg={12} className="text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold mb-6">
                                    <SafetyCertificateOutlined className="text-blue-600" />
                                    The Future of Intelligent Healthcare
                                </div>
                                <Title level={1} className="text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-[1.1]" style={{ color: '#0f172a' }}>
                                    Your Personal AI <br />
                                    <span className="text-blue-600">
                                        Medical Assistant
                                    </span>
                                </Title>
                                <Paragraph className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium" style={{ color: '#475569' }}>
                                    Experience lightning-fast symptom analysis, browse comprehensive disease libraries, and locate the nearest healthcare facilities in seconds.
                                </Paragraph>
                                
                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                                    <Button 
                                        type="primary" 
                                        size="large" 
                                        className="h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-700 border-none text-lg font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-transform hover:-translate-y-1"
                                        onClick={() => navigate('/register')}
                                    >
                                        Start Free Assessment <ArrowRightOutlined />
                                    </Button>
                                    <Button 
                                        size="large" 
                                        className="h-14 px-8 rounded-full bg-white border-2 border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-600 text-lg font-bold flex items-center justify-center transition-all"
                                        onClick={() => {
                                            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        Explore Features
                                    </Button>
                                </div>

                                <div className="flex items-center justify-center lg:justify-start gap-6 text-slate-500 font-medium text-sm">
                                    <div className="flex items-center gap-2"><CheckCircleFilled className="text-green-500" /> 100% Free</div>
                                    <div className="flex items-center gap-2"><CheckCircleFilled className="text-green-500" /> Instant Results</div>
                                    <div className="flex items-center gap-2"><CheckCircleFilled className="text-green-500" /> Secure & Private</div>
                                </div>
                            </Col>
                            
                            <Col xs={24} lg={12}>
                                <div className="relative">
                                    {/* Mockup Card */}
                                    <div className="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 p-6 md:p-8 z-10">
                                        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg"><RobotOutlined /></div>
                                                <div>
                                                    <div className="font-bold text-slate-900 leading-none">Medicare AI</div>
                                                    <div className="text-xs text-green-500 font-semibold mt-1">Online • Ready to help</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="p-4 rounded-2xl rounded-tr-sm bg-blue-600 text-white w-[85%] ml-auto shadow-md">
                                                <Text style={{ color: 'white' }} className="font-medium text-base">I have a severe headache, nausea, and sensitivity to light.</Text>
                                            </div>
                                            <div className="flex items-start gap-3 w-[95%]">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-blue-600"><RobotOutlined /></div>
                                                <div className="p-5 rounded-2xl rounded-tl-sm bg-slate-50 border border-slate-100 shadow-sm">
                                                    <Text style={{ color: '#334155' }} className="font-medium text-base leading-relaxed">
                                                        Based on your symptoms, this strongly indicates a <span className="font-bold text-blue-700">Migraine Attack</span>.
                                                        <br/><br/>
                                                        I recommend resting in a quiet, dark room. For immediate relief, I've compiled a list of recommended medications and the nearest pharmacies.
                                                    </Text>
                                                    <div className="mt-4 flex gap-2">
                                                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm">View Medications</span>
                                                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm">Find Pharmacy</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Decorative elements behind the mockup */}
                                    <div className="absolute -top-6 -right-6 w-32 h-32 bg-yellow-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20"></div>
                                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20"></div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>

                {/* Features Section */}
                <div id="features" className="py-24 bg-[#f8fafc] relative border-t border-slate-200">
                    <div className="max-w-7xl mx-auto px-6 md:px-12">
                        <div className="text-center mb-20">
                            <Title level={2} style={{ color: '#0f172a' }} className="text-4xl lg:text-5xl font-black mb-4 tracking-tight">Powerful Healthcare Tools</Title>
                            <Paragraph style={{ color: '#64748b' }} className="text-xl font-medium max-w-2xl mx-auto">Everything you need to make informed medical decisions, right at your fingertips.</Paragraph>
                        </div>
                        <Row gutter={[32, 32]}>
                            <Col xs={24} md={8}>
                                <Card 
                                    className="border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 h-full rounded-[2rem] bg-white overflow-hidden group" 
                                    bodyStyle={{ padding: '40px 32px' }}
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-blue-50 group-hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center mb-8 shadow-sm">
                                        <MedicineBoxOutlined className="text-3xl text-blue-600 group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <Title level={3} style={{ color: '#0f172a' }} className="mb-4 font-bold text-2xl">AI Symptom Checker</Title>
                                    <Paragraph style={{ color: '#475569' }} className="text-base leading-relaxed font-medium">
                                        Input your symptoms and instantly receive AI-driven insights, possible conditions, and medical recommendations tailored specifically for you.
                                    </Paragraph>
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card 
                                    className="border border-slate-200 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-900/5 transition-all duration-300 h-full rounded-[2rem] bg-white overflow-hidden group" 
                                    bodyStyle={{ padding: '40px 32px' }}
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-purple-50 group-hover:bg-purple-600 transition-colors duration-300 flex items-center justify-center mb-8 shadow-sm">
                                        <SearchOutlined className="text-3xl text-purple-600 group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <Title level={3} style={{ color: '#0f172a' }} className="mb-4 font-bold text-2xl">Disease Library</Title>
                                    <Paragraph style={{ color: '#475569' }} className="text-base leading-relaxed font-medium">
                                        Search and explore an extensive library of medical conditions. Learn about symptoms, precautions, dietary advice, and workouts.
                                    </Paragraph>
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card 
                                    className="border border-slate-200 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 h-full rounded-[2rem] bg-white overflow-hidden group" 
                                    bodyStyle={{ padding: '40px 32px' }}
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 group-hover:bg-emerald-600 transition-colors duration-300 flex items-center justify-center mb-8 shadow-sm">
                                        <GlobalOutlined className="text-3xl text-emerald-600 group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <Title level={3} style={{ color: '#0f172a' }} className="mb-4 font-bold text-2xl">Hospital Finder</Title>
                                    <Paragraph style={{ color: '#475569' }} className="text-base leading-relaxed font-medium">
                                        Instantly locate the nearest hospitals, clinics, and pharmacies on an interactive map. Get directions and emergency contacts immediately.
                                    </Paragraph>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="py-24 relative overflow-hidden bg-blue-600">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                        <Title level={2} style={{ color: 'white' }} className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Ready to take control of your health?</Title>
                        <Paragraph style={{ color: '#e0e7ff' }} className="text-xl mb-10 font-medium">
                            Join thousands of users who trust Medicare AI for instant, reliable medical insights.
                        </Paragraph>
                        <Button 
                            type="primary" 
                            size="large" 
                            className="h-14 px-10 rounded-full bg-white text-blue-700 hover:bg-blue-50 border-none text-lg font-bold shadow-xl shadow-blue-900/20 hover:scale-105 transition-transform"
                            onClick={() => navigate('/register')}
                        >
                            Create Your Free Account
                        </Button>
                        <Paragraph style={{ color: '#bfdbfe' }} className="mt-6 text-sm font-medium">
                            Already have an account? <span className="text-white cursor-pointer hover:underline font-bold" onClick={() => navigate('/login')}>Log in here</span>.
                        </Paragraph>
                    </div>
                </div>
            </Content>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white py-10 text-center">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <RobotOutlined className="text-blue-600 text-xl" />
                        <span className="font-bold text-slate-800 text-lg tracking-tight">Medicare AI</span>
                    </div>
                    <Text style={{ color: '#64748b' }} className="font-medium">© 2026 Medicare AI. All rights reserved.</Text>
                    <div className="mt-4 max-w-2xl mx-auto">
                        <Text style={{ color: '#94a3b8' }} className="text-xs leading-relaxed block">
                            Medical Disclaimer: This platform provides informational AI insights and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                        </Text>
                    </div>
                </div>
            </footer>
        </Layout>
    );
};

export default Landing;
