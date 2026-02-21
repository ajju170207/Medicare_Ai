import React from 'react';
import { Layout, Button, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;
const { Title } = Typography;

interface SharedHeaderProps {
    title: string;
    showBackButton?: boolean;
    onBack?: () => void;
    leftExtra?: React.ReactNode;
    extra?: React.ReactNode;
    icon?: React.ReactNode;
}

const SharedHeader: React.FC<SharedHeaderProps> = ({
    title,
    showBackButton = false,
    onBack,
    leftExtra,
    extra,
    icon
}) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <Header
            style={{ background: '#ffffff' }}
            className="p-0 flex items-center justify-between px-8 sticky top-0 z-20 h-20 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)] border-b border-gray-100"
        >
            <div className="flex items-center">
                {leftExtra}
                {showBackButton && (
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined className="text-lg" />}
                        onClick={handleBack}
                        className="mr-4 w-12 h-12 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100"
                    />
                )}
                {icon && <div className="mr-3 flex items-center">{icon}</div>}
                <Title level={4} className="m-0 text-gray-800">{title}</Title>
            </div>

            <div className="flex items-center">
                {extra}
            </div>
        </Header>
    );
};

export default SharedHeader;
