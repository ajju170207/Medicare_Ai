import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const { Title, Text } = Typography;

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: { email: string; password: string }) => {
        setLoading(true);
        const { error } = await login(values.email, values.password);
        setLoading(false);
        if (error) {
            message.error(error);
        } else {
            message.success('Login successful');
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg border-none">
                <div className="text-center mb-8">
                    <Title level={2} className="m-0 text-primary-600">MediCare AI</Title>
                    <Text type="secondary">Welcome back! Please login to your account.</Text>
                </div>

                <Form
                    name="login_form"
                    layout="vertical"
                    onFinish={onFinish}
                    requiredMark={false}
                >
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please input your Email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Email" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Password" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full" size="large" loading={loading}>
                            Log in
                        </Button>
                    </Form.Item>
                </Form>

                <div className="text-center mt-4">
                    <Text className="text-gray-500">
                        Don't have an account? <Link to="/register" className="text-primary-600 font-medium">Register here</Link>
                    </Text>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <Text type="danger" className="text-xs">
                        ⚠️ This is not medical advice. Always consult a healthcare
                        professional for diagnosis and treatment. In emergency, call 112.
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default Login;
