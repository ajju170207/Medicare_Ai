import React from 'react';
import { Select, Space, Button, Tooltip, message } from 'antd';
import { GlobalOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'te', native: 'తెలుగు', name: 'Telugu' },
    { code: 'ta', native: 'தமிழ்', name: 'Tamil' },
    { code: 'gu', native: 'ગુજરાતી', name: 'Gujarati' },
    { code: 'kn', native: 'ಕನ್ನಡ', name: 'Kannada' },
    { code: 'ml', native: 'മലയാളം', name: 'Malayalam' },
    { code: 'or', native: 'ଓଡ଼ିଆ', name: 'Odia' },
    { code: 'pa', native: 'ਪੰਜਾਬੀ', name: 'Punjabi' },
    { code: 'as', native: 'অসমীয়া', name: 'Assamese' },
    { code: 'ma', native: 'मैथिली', name: 'Maithili' },
    { code: 'sa', native: 'संस्कृतम्', name: 'Sanskrit' },
    { code: 'ur', native: 'اردو', name: 'Urdu' },
    { code: 'ks', native: 'کأشُر', name: 'Kashmiri' },
    { code: 'sd', native: 'सिंधी', name: 'Sindhi' },
    { code: 'ko', native: 'कोंकणी', name: 'Konkani' },
    { code: 'mn', native: 'মণিপুরী', name: 'Manipuri' },
    { code: 'ne', native: 'नेपाली', name: 'Nepali' },
    { code: 'bo', native: 'बड़ो', name: 'Bodo' },
    { code: 'do', native: 'डोगरी', name: 'Dogri' },
    { code: 'sat', native: 'संताली', name: 'Santali' },
];

const LanguageSelector: React.FC = () => {
    const handleChange = (value: string) => {
        message.info(`Language changed to: ${value.toUpperCase()}`);
        // In a real app, this would trigger i18n.changeLanguage(value)
    };

    const handleAddLanguage = () => {
        message.success('Add Language feature requested! Our team will prioritize your suggestion.');
    };

    return (
        <Space size="middle" className="language-selector-container">
            <Select
                defaultValue="en"
                style={{ width: 160 }}
                onChange={handleChange}
                dropdownStyle={{ borderRadius: '12px' }}
                suffixIcon={<GlobalOutlined className="text-gray-400 group-hover:text-teal-600 transition-colors" />}
                className="language-select-dropdown group"
            >
                {languages.map((lang) => (
                    <Option key={lang.code} value={lang.code}>
                        <div className="flex items-center justify-between w-full py-1">
                            <span className="font-medium text-inherit">{lang.native}</span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 ml-4 font-bold">{lang.name}</span>
                        </div>
                    </Option>
                ))}
            </Select>
            <Tooltip title="Add New Language">
                <Button
                    type="primary"
                    shape="circle"
                    icon={<PlusOutlined />}
                    onClick={handleAddLanguage}
                    className="flex items-center justify-center bg-teal-500 border-none hover:bg-teal-600 shadow-md"
                />
            </Tooltip>
        </Space>
    );
};

export default LanguageSelector;
