import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const { Title, Text } = Typography;

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        phone?: string;
    }) => {
        setLoading(true);
        const fullName = `${values.firstName} ${values.lastName}`.trim();
        const { error } = await register(values.email, values.password, fullName, values.phone);
        setLoading(false);
        if (error) {
            message.error(error);
        } else {
            message.success('Registration successful! Welcome to MediCare AI.');
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-lg shadow-lg border-none">
                <div className="text-center mb-8">
                    <Title level={2} className="m-0 text-primary-600">Create Account</Title>
                    <Text type="secondary">Join MediCare AI for intelligent health assistance.</Text>
                </div>

                <Form
                    name="register_form"
                    layout="vertical"
                    onFinish={onFinish}
                    requiredMark={false}
                >
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="firstName"
                            label="First Name"
                            rules={[{ required: true, message: 'Required' }]}
                        >
                            <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="First Name" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="lastName"
                            label="Last Name"
                            rules={[{ required: true, message: 'Required' }]}
                        >
                            <Input placeholder="Last Name" size="large" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please input your Email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="Email" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Phone (Optional)"
                        rules={[
                            { pattern: /^[0-9+]{10,15}$/, message: 'Enter a valid 10-15 digit phone number' }
                        ]}
                    >
                        <Input prefix={<PhoneOutlined className="text-gray-400" />} placeholder="9876543210" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: 'Please input your Password!' },
                            { min: 8, message: 'Password must be at least 8 characters' }
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Password (min 8 characters)" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full" size="large" loading={loading}>
                            Create Account
                        </Button>
                    </Form.Item>
                </Form>

                <div className="text-center mt-4">
                    <Text className="text-gray-500">
                        Already have an account? <Link to="/login" className="text-primary-600 font-medium">Login here</Link>
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

export default Register;
