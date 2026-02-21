import React, { useState, useEffect, useRef } from 'react';
import { Layout, Card, Typography, Button, message, List, Badge, Rate, Spin, Row, Col, Empty } from 'antd';
import {
    CompassOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SharedHeader from '../components/SharedHeader';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

declare global {
    interface Window {
        google: any;
    }
}

const HospitalFinder: React.FC = () => {
    const navigate = useNavigate();
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [_userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    const initMap = async (lat: number, lng: number) => {
        if (!mapRef.current || !window.google) return;

        try {
            const { Map } = await window.google.maps.importLibrary("maps");
            googleMapRef.current = new Map(mapRef.current, {
                center: { lat, lng },
                zoom: 14,
                mapId: "DEMO_MAP_ID",
                disableDefaultUI: false,
            });

            // Add user marker
            new window.google.maps.Marker({
                position: { lat, lng },
                map: googleMapRef.current,
                title: "Your Location",
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "#3b82f6",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#ffffff",
                }
            });
        } catch (error) {
            console.error("Error initializing map:", error);
        }
    };

    const updateMarkers = (hospitalList: any[]) => {
        if (!googleMapRef.current || !window.google) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Add new markers
        hospitalList.forEach(hospital => {
            const marker = new window.google.maps.Marker({
                position: { lat: hospital.location.lat, lng: hospital.location.lng },
                map: googleMapRef.current,
                title: hospital.name,
                animation: window.google.maps.Animation.DROP
            });

            const infoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div style="padding: 10px;">
                        <h4 style="margin: 0 0 5px 0; color: #0d9488;">${hospital.name}</h4>
                        <p style="margin: 0; font-size: 12px;">${hospital.address}</p>
                        <p style="margin: 5px 0 0 0; font-weight: bold;">Rating: ${hospital.rating} ⭐</p>
                    </div>
                `
            });

            marker.addListener("click", () => {
                infoWindow.open({
                    anchor: marker,
                    map: googleMapRef.current,
                    shouldFocus: false,
                });
            });

            markersRef.current.push(marker);
        });
    };

    const getHospitals = async (lat: number, lng: number) => {
        setLoading(true);
        try {
            const response = await api.get(`/hospitals/nearby?lat=${lat}&lng=${lng}`);
            const data = response.data.data;
            setHospitals(data);
            updateMarkers(data);
        } catch (error: any) {
            message.error('Failed to find nearby hospitals');
        } finally {
            setLoading(false);
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            message.error('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
                initMap(latitude, longitude);
                getHospitals(latitude, longitude);
            },
            () => {
                setLoading(false);
                message.error('Unable to retrieve your location. Using default location.');
                const mockLat = 40.7128;
                const mockLng = -74.0060;
                setUserLocation({ lat: mockLat, lng: mockLng });
                initMap(mockLat, mockLng);
                getHospitals(mockLat, mockLng);
            }
        );
    };

    useEffect(() => {
        handleGetLocation();
    }, []);

    return (
        <Layout className="min-h-screen bg-white">
            <SharedHeader
                title="Hospital Finder"
                showBackButton
                onBack={() => navigate('/dashboard')}
            />

            <Content className="p-6 max-w-7xl mx-auto w-full">
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Title level={2} className="m-0 text-gray-800">Healthcare Near You</Title>
                        <Paragraph type="secondary" className="text-lg">
                            Interactive map of medical facilities and clinics in your area.
                        </Paragraph>
                    </div>
                    <Button
                        icon={<CompassOutlined />}
                        onClick={handleGetLocation}
                        loading={loading}
                        size="large"
                        type="primary"
                        className="rounded-xl h-12 px-8 font-semibold shadow-md"
                    >
                        Update My Location
                    </Button>
                </div>

                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        <Card
                            className="shadow-sm border-none rounded-3xl overflow-hidden p-0"
                            bodyStyle={{ padding: 0 }}
                        >
                            <div
                                ref={mapRef}
                                className="w-full h-[600px] bg-gray-100"
                                style={{ borderRadius: '24px' }}
                            >
                                {!window.google && (
                                    <div className="flex items-center justify-center h-full">
                                        <Spin tip="Loading Interactive Map..." />
                                    </div>
                                )}
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <div className="flex flex-col gap-6">
                            <Card className="shadow-sm border-none rounded-2xl bg-teal-50 border-l-4 border-teal-500">
                                <Title level={4} className="mb-4 flex items-center text-teal-900">
                                    <InfoCircleOutlined className="mr-2" />
                                    Emergency Info
                                </Title>
                                <Paragraph className="text-teal-800">
                                    Markers on the map indicate emergency rooms (red) and general clinics (blue).
                                </Paragraph>
                                <Button
                                    danger
                                    type="primary"
                                    size="large"
                                    block
                                    className="h-12 font-bold rounded-xl shadow-lg shadow-red-100"
                                    onClick={() => window.location.href = 'tel:911'}
                                >
                                    Call Emergency (911)
                                </Button>
                            </Card>

                            <div className="h-[430px] overflow-y-auto pr-2 custom-scrollbar">
                                <List
                                    header={<Text strong className="text-gray-500 uppercase tracking-wider text-xs px-2">Nearby Facilities</Text>}
                                    dataSource={hospitals}
                                    loading={loading}
                                    renderItem={(item) => (
                                        <List.Item className="px-0 py-2 border-none">
                                            <Card
                                                className="shadow-sm border-none rounded-2xl hover:shadow-md transition-all cursor-pointer w-full group"
                                                onClick={() => {
                                                    if (googleMapRef.current) {
                                                        googleMapRef.current.setCenter(item.location);
                                                        googleMapRef.current.setZoom(16);
                                                    }
                                                }}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <Title level={5} className="m-0 text-gray-800 group-hover:text-primary-600 transition-colors">{item.name}</Title>
                                                    <Badge status={item.open_now ? "success" : "default"} />
                                                </div>
                                                <Text type="secondary" className="text-xs block mb-2">{item.address}</Text>
                                                <div className="flex items-center gap-2">
                                                    <Rate disabled defaultValue={item.rating} className="text-[10px]" />
                                                    <Text className="text-xs text-gray-400">({item.user_ratings_total})</Text>
                                                </div>
                                            </Card>
                                        </List.Item>
                                    )}
                                    locale={{
                                        emptyText: <Empty description="Scan to find hospitals" />
                                    }}
                                />
                            </div>
                        </div>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default HospitalFinder;

