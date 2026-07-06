import React, { useState, useEffect } from 'react';
import { Layout, Card, Typography, Button, message, List, Badge, Spin, Row, Col, Empty, Input, Segmented, Tag } from 'antd';
import {
    CompassOutlined,
    InfoCircleOutlined,
    PhoneOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';
import SharedHeader from '../components/SharedHeader';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const ICONS = {
    private_hospital: {
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z M12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
        fillColor: "#ef4444",
        strokeColor: "#fbbf24"
    },
    govt_hospital: {
        path: "M12 2l9 4-9 4-9-4 9-4m0 12.5l9-4v2.5l-9 4-9-4v-2.5l9 4z",
        fillColor: "#1d4ed8",
        strokeColor: "#ffffff"
    },
    doctor: {
        path: "M12 4A4 4 0 0 1 16 8A4 4 0 0 1 12 12A4 4 0 0 1 8 8A4 4 0 0 1 12 4M12 14C16.42 14 20 15.79 20 18V20H4V18C4 15.79 7.58 14 12 14Z",
        fillColor: "#8b5cf6",
        strokeColor: "#ffffff"
    },
    pharmacy: {
        path: "M16 4H8L6 8V20A2 2 0 0 0 8 22H16A2 2 0 0 0 18 20V8L16 4M15 15H13V17H11V15H9V13H11V11H13V13H15V15Z",
        fillColor: "#10b981",
        strokeColor: "#ffffff"
    }
};

const createLeafletIcon = (iconDef: { path: string; fillColor: string; strokeColor: string }) => {
    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<svg viewBox="0 0 24 24" width="36" height="36" style="fill: ${iconDef.fillColor}; stroke: ${iconDef.strokeColor}; stroke-width: 1.5px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">
                 <path d="${iconDef.path}" />
               </svg>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
    });
};

const userIcon = L.divIcon({
    className: 'custom-leaflet-user-icon',
    html: `<div style="width: 20px; height: 20px; background: #60a5fa; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(96,165,250,0.8);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

// Component to programmatically move the map
const MapUpdater: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] && center[1]) {
            map.setView(center, zoom || map.getZoom());
        }
    }, [center, zoom, map]);
    return null;
};

const HospitalFinder: React.FC = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [filteredHospitals, setFilteredHospitals] = useState<any[]>([]);
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [diseaseQuery, setDiseaseQuery] = useState('');
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
    const [mapZoom, setMapZoom] = useState(14);
    const [recommendedSpecialist, setRecommendedSpecialist] = useState<{ specialist: string; types: string[]; emoji: string } | null>(null);

    const DISEASE_SPECIALIST_MAP: Record<string, { specialist: string; types: string[]; emoji: string }> = {
        'fungal': { specialist: 'Dermatologist', types: ['hospital', 'doctor', 'clinic'], emoji: '🧴' },
        'acne': { specialist: 'Dermatologist', types: ['hospital', 'doctor', 'clinic'], emoji: '🧴' },
        'psoriasis': { specialist: 'Dermatologist', types: ['hospital', 'doctor'], emoji: '🧴' },
        'impetigo': { specialist: 'Dermatologist', types: ['doctor', 'clinic'], emoji: '🧴' },
        'skin rash': { specialist: 'Dermatologist', types: ['doctor', 'clinic'], emoji: '🧴' },
        'rash': { specialist: 'Dermatologist', types: ['doctor', 'clinic'], emoji: '🧴' },
        'dental': { specialist: 'Dentist', types: ['doctor', 'clinic'], emoji: '🦷' },
        'tooth': { specialist: 'Dentist', types: ['doctor', 'clinic'], emoji: '🦷' },
        'teeth': { specialist: 'Dentist', types: ['doctor', 'clinic'], emoji: '🦷' },
        'cavity': { specialist: 'Dentist', types: ['doctor', 'clinic'], emoji: '🦷' },
        'heart attack': { specialist: 'Cardiologist', types: ['hospital', 'medical'], emoji: '❤️' },
        'heart': { specialist: 'Cardiologist', types: ['hospital', 'medical'], emoji: '❤️' },
        'hypertension': { specialist: 'Cardiologist', types: ['hospital', 'doctor'], emoji: '❤️' },
        'chest pain': { specialist: 'Cardiologist', types: ['hospital', 'medical'], emoji: '❤️' },
        'varicose': { specialist: 'Vascular Surgeon', types: ['hospital', 'doctor'], emoji: '🩺' },
        'blood pressure': { specialist: 'Cardiologist', types: ['hospital', 'doctor'], emoji: '❤️' },
        'bp': { specialist: 'Cardiologist', types: ['hospital', 'doctor'], emoji: '❤️' },
        'asthma': { specialist: 'Pulmonologist', types: ['hospital', 'doctor', 'clinic'], emoji: '🫁' },
        'pneumonia': { specialist: 'Pulmonologist', types: ['hospital', 'medical'], emoji: '🫁' },
        'tuberculosis': { specialist: 'Pulmonologist', types: ['hospital', 'medical'], emoji: '🫁' },
        'tb': { specialist: 'Pulmonologist', types: ['hospital', 'medical'], emoji: '🫁' },
        'cough': { specialist: 'General Physician', types: ['doctor', 'clinic', 'hospital'], emoji: '😷' },
        'cold': { specialist: 'General Physician', types: ['doctor', 'clinic'], emoji: '😷' },
        'breathing': { specialist: 'Pulmonologist', types: ['hospital', 'medical'], emoji: '🫁' },
        'gerd': { specialist: 'Gastroenterologist', types: ['hospital', 'doctor'], emoji: '🫀' },
        'gastroenteritis': { specialist: 'Gastroenterologist', types: ['hospital', 'doctor'], emoji: '🫀' },
        'peptic ulcer': { specialist: 'Gastroenterologist', types: ['hospital', 'doctor'], emoji: '🫀' },
        'ulcer': { specialist: 'Gastroenterologist', types: ['hospital', 'doctor'], emoji: '🫀' },
        'cholestasis': { specialist: 'Gastroenterologist', types: ['hospital', 'doctor'], emoji: '🫀' },
        'piles': { specialist: 'Proctologist', types: ['hospital', 'doctor'], emoji: '🏥' },
        'hemorrhoids': { specialist: 'Proctologist', types: ['hospital', 'doctor'], emoji: '🏥' },
        'stomach': { specialist: 'Gastroenterologist', types: ['hospital', 'doctor'], emoji: '🫀' },
        'diarrhea': { specialist: 'General Physician', types: ['doctor', 'clinic'], emoji: '😷' },
        'vomiting': { specialist: 'General Physician', types: ['doctor', 'clinic'], emoji: '😷' },
        'hepatitis': { specialist: 'Hepatologist', types: ['hospital', 'doctor'], emoji: '🏥' },
        'jaundice': { specialist: 'Hepatologist', types: ['hospital', 'doctor'], emoji: '🏥' },
        'liver': { specialist: 'Hepatologist', types: ['hospital', 'doctor'], emoji: '🏥' },
        'alcoholic': { specialist: 'Hepatologist', types: ['hospital', 'doctor'], emoji: '🏥' },
        'diabetes': { specialist: 'Endocrinologist', types: ['hospital', 'doctor'], emoji: '💉' },
        'thyroid': { specialist: 'Endocrinologist', types: ['hospital', 'doctor'], emoji: '💉' },
        'hypoglycemia': { specialist: 'Endocrinologist', types: ['hospital', 'doctor'], emoji: '💉' },
        'hypothyroidism': { specialist: 'Endocrinologist', types: ['hospital', 'doctor'], emoji: '💉' },
        'hyperthyroidism': { specialist: 'Endocrinologist', types: ['hospital', 'doctor'], emoji: '💉' },
        'aids': { specialist: 'Infectious Disease Specialist', types: ['hospital', 'doctor'], emoji: '🦠' },
        'hiv': { specialist: 'Infectious Disease Specialist', types: ['hospital', 'doctor'], emoji: '🦠' },
        'allergy': { specialist: 'Allergist', types: ['doctor', 'clinic'], emoji: '🤧' },
        'malaria': { specialist: 'Infectious Disease Specialist', types: ['hospital', 'medical'], emoji: '🦠' },
        'dengue': { specialist: 'Infectious Disease Specialist', types: ['hospital', 'medical'], emoji: '🦠' },
        'typhoid': { specialist: 'Infectious Disease Specialist', types: ['hospital', 'medical'], emoji: '🦠' },
        'chicken pox': { specialist: 'Dermatologist', types: ['hospital', 'doctor'], emoji: '🦠' },
        'chickenpox': { specialist: 'Dermatologist', types: ['hospital', 'doctor'], emoji: '🦠' },
        'arthritis': { specialist: 'Orthopedist', types: ['hospital', 'doctor'], emoji: '🦴' },
        'bone': { specialist: 'Orthopedist', types: ['hospital', 'doctor'], emoji: '🦴' },
        'fracture': { specialist: 'Orthopedist', types: ['hospital', 'medical'], emoji: '🦴' },
        'joint': { specialist: 'Orthopedist', types: ['hospital', 'doctor'], emoji: '🦴' },
        'cervical spondylosis': { specialist: 'Orthopedist', types: ['hospital', 'doctor'], emoji: '🦴' },
        'spondylosis': { specialist: 'Orthopedist', types: ['hospital', 'doctor'], emoji: '🦴' },
        'neck pain': { specialist: 'Orthopedist', types: ['hospital', 'doctor'], emoji: '🦴' },
        'back pain': { specialist: 'Orthopedist', types: ['hospital', 'doctor'], emoji: '🦴' },
        'migraine': { specialist: 'Neurologist', types: ['hospital', 'doctor'], emoji: '🧠' },
        'headache': { specialist: 'Neurologist', types: ['doctor', 'clinic'], emoji: '🧠' },
        'vertigo': { specialist: 'Neurologist', types: ['hospital', 'doctor'], emoji: '🧠' },
        'paralysis': { specialist: 'Neurologist', types: ['hospital', 'medical'], emoji: '🧠' },
        'stroke': { specialist: 'Neurologist', types: ['hospital', 'medical'], emoji: '🧠' },
        'uti': { specialist: 'Urologist', types: ['hospital', 'doctor'], emoji: '🧬' },
        'urinary': { specialist: 'Urologist', types: ['hospital', 'doctor'], emoji: '🧬' },
        'kidney': { specialist: 'Nephrologist', types: ['hospital', 'doctor'], emoji: '🧬' },
        'cancer': { specialist: 'Oncologist', types: ['hospital', 'medical'], emoji: '🏥' },
        'fever': { specialist: 'General Physician', types: ['doctor', 'clinic', 'hospital'], emoji: '🌡️' },
        'infection': { specialist: 'General Physician', types: ['doctor', 'clinic'], emoji: '🌡️' },
        'drug reaction': { specialist: 'Allergist', types: ['hospital', 'doctor'], emoji: '💊' },
        'emergency': { specialist: 'Emergency Medicine', types: ['hospital', 'medical'], emoji: '🚨' },
    };

    const analyzeDisease = (query: string): { specialist: string; types: string[]; emoji: string } => {
        const lowerQuery = query.toLowerCase().trim();
        if (!lowerQuery) return { specialist: '', types: [], emoji: '' };
        for (const [keyword, info] of Object.entries(DISEASE_SPECIALIST_MAP)) {
            if (lowerQuery.includes(keyword)) {
                return info;
            }
        }
        return { specialist: 'General Physician', types: ['hospital', 'doctor', 'clinic', 'medical'], emoji: '🏥' };
    };

    const handleSearch = () => {
        if (!diseaseQuery.trim()) {
            setFilteredHospitals(hospitals);
            setRecommendedSpecialist(null);
            return;
        }
        const rec = analyzeDisease(diseaseQuery);
        setRecommendedSpecialist(rec);

        let filtered = hospitals;
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(h => h.category === categoryFilter);
        }
        if (rec.types.length > 0) {
            filtered = filtered.filter(h =>
                rec.types.includes(h.type) ||
                (h.type === 'hospital' && rec.types.includes('medical')) ||
                (h.type === 'medical' && rec.types.includes('hospital'))
            );
        }
        setFilteredHospitals(filtered);
        
        if (filtered.length > 0) {
            message.success(`Found ${filtered.length} ${rec.specialist} facilities near you`);
            const first = filtered[0];
            const lat = first.latitude || first.location?.lat;
            const lng = first.longitude || first.location?.lng;
            if (lat && lng) {
                setMapCenter([lat, lng]);
                setMapZoom(15);
            }
        } else {
            message.warning(`No nearby ${rec.specialist} facilities found. See fallback recommendations below.`);
        }
    };

    useEffect(() => {
        let filtered = hospitals;
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(h => h.category === categoryFilter);
        }
        if (diseaseQuery.trim()) {
            const recInfo = analyzeDisease(diseaseQuery);
            filtered = filtered.filter(h =>
                recInfo.types.includes(h.type) ||
                (h.type === 'hospital' && recInfo.types.includes('medical'))
            );
        }
        setFilteredHospitals(filtered);
    }, [categoryFilter, hospitals]);

    const getOsmHospitals = async (lat: number, lng: number) => {
        try {
            const query = `
                [out:json][timeout:25];
                (
                  node["amenity"="hospital"](around:5000,${lat},${lng});
                  node["amenity"="clinic"](around:5000,${lat},${lng});
                  node["amenity"="doctors"](around:5000,${lat},${lng});
                  node["amenity"="pharmacy"](around:5000,${lat},${lng});
                );
                out body;
                >;
                out skel qt;
            `;
            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query
            });
            const data = await response.json();
            return data.elements.filter((el: any) => el.type === 'node').map((el: any) => {
                let facilityType = 'hospital';
                if (el.tags.amenity === 'clinic' || el.tags.amenity === 'doctors') facilityType = 'doctor';
                if (el.tags.amenity === 'pharmacy') facilityType = 'pharmacy';
                const isGovt = el.id % 3 === 0;
                return {
                    id: `osm-${el.id}`,
                    name: el.tags.name || `Unnamed ${facilityType}`,
                    category: isGovt ? 'government' : 'private',
                    type: facilityType,
                    latitude: el.lat,
                    longitude: el.lon,
                    address: [el.tags['addr:street'], el.tags['addr:city']].filter(Boolean).join(', ') || 'Address not available',
                    phone: el.tags['phone'] || 'No phone',
                    open_now: el.tags['opening_hours'] ? true : false
                };
            });
        } catch (error) {
            console.error("Failed to fetch OSM data:", error);
            return [];
        }
    };

    const getHospitals = async (lat: number, lng: number) => {
        setLoading(true);
        try {
            const response = await api.get(`/hospitals/nearby?lat=${lat}&lng=${lng}&type=hospital,pharmacy,doctor,medical`);
            let dbData = response.data.data || [];
            dbData = dbData.map((d: any) => ({
                ...d,
                category: d.hospital_type === 'government' ? 'government' : 'private'
            }));
            const osmData = await getOsmHospitals(lat, lng);
            const combinedData = [...dbData, ...osmData].filter((item, index, self) =>
                index === self.findIndex((t) => t.name === item.name)
            );
            setHospitals(combinedData);
        } catch (error: any) {
            message.error('Failed to find nearby healthcare facilities');
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
                setMapCenter([latitude, longitude]);
                getHospitals(latitude, longitude);
            },
            () => {
                setLoading(false);
                message.error('Unable to retrieve your location. Using default location.');
                const mockLat = 40.7128;
                const mockLng = -74.0060;
                setUserLocation({ lat: mockLat, lng: mockLng });
                setMapCenter([mockLat, mockLng]);
                getHospitals(mockLat, mockLng);
            }
        );
    };

    useEffect(() => {
        handleGetLocation();
    }, []);

    const resetFilters = () => {
        setDiseaseQuery('');
        setCategoryFilter('all');
        setFilteredHospitals(hospitals);
    };

    return (
        <Layout className="min-h-screen bg-[#0f172a]">
            <SharedHeader
                title="Hospital Finder"
                showBackButton
                onBack={() => navigate('/dashboard')}
            />

            <Content className="p-6 max-w-7xl mx-auto w-full">
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Title level={2} className="m-0 text-white">Healthcare Near You</Title>
                        <Paragraph className="text-gray-400 text-lg">
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

                <div className="mb-6 flex flex-col lg:flex-row gap-4 bg-[#1e293b] p-4 rounded-3xl items-center shadow-lg">
                    <Input
                        prefix={<SearchOutlined className="text-gray-400" />}
                        placeholder="Type symptoms (e.g., chest pain, fever, fracture)..."
                        value={diseaseQuery}
                        onChange={(e) => setDiseaseQuery(e.target.value)}
                        onPressEnter={handleSearch}
                        className="rounded-xl h-12 bg-[#0f172a] border-none text-white hover:bg-[#0f172a] focus:bg-[#0f172a] flex-grow"
                        style={{ color: 'white' }}
                        suffix={
                            <Button
                                type="primary"
                                onClick={handleSearch}
                                className="rounded-lg bg-blue-600 hover:bg-blue-500 border-none"
                            >
                                Find Facilities
                            </Button>
                        }
                    />
                    <Segmented
                        options={[
                            { label: 'All Facilities', value: 'all' },
                            { label: 'Private Only', value: 'private' },
                            { label: 'Govt. Only', value: 'government' }
                        ]}
                        value={categoryFilter}
                        onChange={(val) => setCategoryFilter(val as string)}
                        className="bg-[#0f172a] p-1 rounded-xl h-12 items-center flex text-gray-300"
                    />
                    <Button
                        onClick={resetFilters}
                        className="h-12 rounded-xl bg-[#0f172a] border-none text-gray-400 hover:text-white"
                    >
                        Reset
                    </Button>
                </div>

                <div className="mb-4 px-2 flex justify-between items-center">
                    <Text className="text-gray-400">
                        Showing <span className="text-blue-400 font-bold">{filteredHospitals.length}</span> healthcare facilities found nearby
                    </Text>
                </div>

                {diseaseQuery && recommendedSpecialist && (
                    <div className="mb-6 animate-fade-in bg-blue-900/20 p-4 rounded-2xl border border-blue-800">
                        <Text className="text-blue-300 mr-2">
                            <InfoCircleOutlined className="mr-2" />
                            {recommendedSpecialist.emoji} For "{diseaseQuery}", you should see a <strong className="text-blue-100">{recommendedSpecialist.specialist}</strong>. Showing suitable facilities:
                        </Text>
                        {recommendedSpecialist.types.map(t => <Tag color="#3b82f6" key={t} className="uppercase font-bold border-none ml-1">{t}</Tag>)}
                    </div>
                )}

                {diseaseQuery && filteredHospitals.length === 0 && !loading && recommendedSpecialist && (
                    <div className="mb-6 bg-yellow-900/20 border border-yellow-700 rounded-2xl p-5">
                        <Title level={4} className="text-yellow-300 mb-1">⚠️ No Nearby {recommendedSpecialist.specialist} Found</Title>
                        <Paragraph className="text-yellow-200 text-sm mb-4">
                            We couldn't find a <strong>{recommendedSpecialist.specialist}</strong> near your location for "{diseaseQuery}". Here's what you can do:
                        </Paragraph>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-[#1e293b] rounded-xl p-4 border border-yellow-800">
                                <Text strong className="text-yellow-300 block mb-1">📞 Call Emergency</Text>
                                <Text className="text-gray-300 text-sm block mb-2">If urgent, call India's national helpline immediately.</Text>
                                <Button danger size="small" block onClick={() => window.location.href = 'tel:112'} className="rounded-lg">📞 Dial 112</Button>
                            </div>
                            <div className="bg-[#1e293b] rounded-xl p-4 border border-yellow-800">
                                <Text strong className="text-yellow-300 block mb-1">🔍 Search on Google Maps</Text>
                                <Text className="text-gray-300 text-sm block mb-2">Find {recommendedSpecialist.specialist}s in your area on Google Maps.</Text>
                                <Button size="small" block className="rounded-lg bg-blue-600 text-white border-none"
                                    onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(recommendedSpecialist.specialist + ' near me')}`, '_blank')}>
                                    Open Google Maps
                                </Button>
                            </div>
                            <div className="bg-[#1e293b] rounded-xl p-4 border border-yellow-800">
                                <Text strong className="text-yellow-300 block mb-1">💊 Visit Pharmacy First</Text>
                                <Text className="text-gray-300 text-sm block mb-2">A pharmacist can offer initial guidance and first-aid remedies.</Text>
                                <Button size="small" block className="rounded-lg bg-green-700 text-white border-none"
                                    onClick={() => window.open(`https://www.google.com/maps/search/pharmacy+near+me`, '_blank')}>
                                    Find Pharmacy
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        <Card
                            className="shadow-sm border-none rounded-3xl overflow-hidden p-0 relative"
                            bodyStyle={{ padding: 0 }}
                        >
                            <div className="w-full h-[600px] bg-gray-900 rounded-[24px] overflow-hidden">
                                {mapCenter ? (
                                    <MapContainer 
                                        center={mapCenter} 
                                        zoom={mapZoom} 
                                        style={{ height: '100%', width: '100%', zIndex: 0 }}
                                    >
                                        <MapUpdater center={mapCenter} zoom={mapZoom} />
                                        <TileLayer
                                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                        />
                                        
                                        {/* User Location Marker */}
                                        {userLocation && (
                                            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                                                <Popup>You are here</Popup>
                                            </Marker>
                                        )}

                                        {/* Facility Markers */}
                                        {filteredHospitals.map((facility, index) => {
                                            let iconDef = ICONS.private_hospital;
                                            if (facility.type === 'hospital' || facility.type === 'medical') {
                                                iconDef = facility.category === 'government' ? ICONS.govt_hospital : ICONS.private_hospital;
                                            } else if (facility.type === 'doctor') {
                                                iconDef = ICONS.doctor;
                                            } else if (facility.type === 'pharmacy') {
                                                iconDef = ICONS.pharmacy;
                                            }

                                            const lat = facility.latitude || facility.location?.lat;
                                            const lng = facility.longitude || facility.location?.lng;

                                            if (!lat || !lng) return null;

                                            return (
                                                <Marker key={index} position={[lat, lng]} icon={createLeafletIcon(iconDef)}>
                                                    <Popup className="custom-popup">
                                                        <div style={{ background: '#1f2937', color: 'white', margin: '-14px', padding: '16px', borderRadius: '12px', minWidth: '240px' }}>
                                                            <h4 style={{ margin: '0 0 8px 0', color: '#60a5fa', fontSize: '16px', fontWeight: 600 }}>{facility.name}</h4>
                                                            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#9ca3af', lineHeight: 1.4 }}>{facility.address || 'Address not available'}</p>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <span style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: '13px' }}>{facility.phone || 'No phone'}</span>
                                                                    <span style={{ background: iconDef.fillColor, color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>
                                                                        {facility.category ? facility.category + ' ' : ''}{facility.type}
                                                                    </span>
                                                                </div>
                                                                <a 
                                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    style={{ display: 'block', textAlign: 'center', background: '#3b82f6', color: 'white', padding: '8px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 500, marginTop: '8px' }}
                                                                >
                                                                    Get Directions
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            );
                                        })}
                                    </MapContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <Spin tip="Loading Map..." />
                                    </div>
                                )}
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <div className="flex flex-col gap-6">
                            <Card className="shadow-sm border-none rounded-3xl bg-red-50 border-t-8 border-red-500 overflow-hidden">
                                <div className="p-2">
                                    <Title level={4} className="mb-4 flex items-center text-red-900 leading-none">
                                        <InfoCircleOutlined className="mr-2" />
                                        Medical Emergency
                                    </Title>
                                    <Paragraph className="text-red-700 text-sm mb-6">
                                        Immediately dial India's national emergency number for critical health assistance.
                                    </Paragraph>
                                    <Button
                                        danger
                                        type="primary"
                                        size="large"
                                        block
                                        icon={<PhoneOutlined className="animate-pulse" />}
                                        className="h-14 font-extrabold rounded-2xl shadow-xl shadow-red-200 text-lg flex items-center justify-center gap-2"
                                        onClick={() => window.location.href = 'tel:112'}
                                    >
                                        DIAL 112 (INDIA)
                                    </Button>

                                    <div className="mt-8 space-y-3">
                                        <Text strong className="text-[10px] uppercase tracking-widest text-red-400 block mb-2 px-1">Medical Helplines</Text>
                                        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-red-100 group hover:border-red-300 transition-all cursor-pointer" onClick={() => window.location.href = 'tel:108'}>
                                            <div>
                                                <Text strong className="block text-sm text-red-900 leading-tight">Emergency Medical</Text>
                                                <Text className="text-[10px] text-red-500">Ambulance Response</Text>
                                            </div>
                                            <Badge count="108" color="#ef4444" className="scale-110" />
                                        </div>
                                        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-red-100 group hover:border-red-300 transition-all cursor-pointer" onClick={() => window.location.href = 'tel:102'}>
                                            <div>
                                                <Text strong className="block text-sm text-red-900 leading-tight">Ambulance (NHM)</Text>
                                                <Text className="text-[10px] text-red-500">National Health Mission</Text>
                                            </div>
                                            <Badge count="102" color="#ef4444" className="scale-110" />
                                        </div>
                                        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-red-100 group hover:border-red-300 transition-all cursor-pointer" onClick={() => window.location.href = 'tel:104'}>
                                            <div>
                                                <Text strong className="block text-sm text-red-900 leading-tight">Health Helpline</Text>
                                                <Text className="text-[10px] text-red-500">Medical Advice</Text>
                                            </div>
                                            <Badge count="104" color="#ef4444" className="scale-110" />
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <div className="h-[430px] overflow-y-auto pr-2 custom-scrollbar">
                                <List
                                    header={<Text strong className="text-gray-500 uppercase tracking-wider text-xs px-2">Nearby Facilities</Text>}
                                    dataSource={filteredHospitals}
                                    loading={loading}
                                    renderItem={(item) => (
                                        <List.Item className="px-0 py-2 border-none">
                                            <Card
                                                className="shadow-md border-none rounded-2xl bg-[#1e293b] hover:bg-[#334155] transition-all cursor-pointer w-full group"
                                                bodyStyle={{ padding: '16px' }}
                                                onClick={() => {
                                                    const lat = item.latitude || item.location?.lat;
                                                    const lng = item.longitude || item.location?.lng;
                                                    if (lat && lng) {
                                                        setMapCenter([lat, lng]);
                                                        setMapZoom(16);
                                                    }
                                                }}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <div>
                                                        <Title level={5} className="m-0 text-blue-100 group-hover:text-blue-400 transition-colors">{item.name}</Title>
                                                        <Tag color={item.category === 'government' ? 'blue' : (item.category === 'private' ? 'red' : 'default')} className="mt-1 uppercase text-[9px] border-none">
                                                            {item.category || item.type}
                                                        </Tag>
                                                    </div>
                                                    <Badge status={item.open_now ? "success" : "default"} />
                                                </div>
                                                <Text className="text-gray-400 text-xs block mb-3">{item.address}</Text>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="small"
                                                        type="primary"
                                                        ghost
                                                        className="rounded-lg text-[10px] h-7 px-3 border-blue-500/50 hover:border-blue-400"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const lat = item.latitude || item.location?.lat;
                                                            const lng = item.longitude || item.location?.lng;
                                                            if (lat && lng) {
                                                                setMapCenter([lat, lng]);
                                                                setMapZoom(17);
                                                            }
                                                        }}
                                                    >
                                                        Show on Map
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        className="rounded-lg text-[10px] h-7 px-3 bg-[#0f172a] border-none text-gray-300 hover:text-white"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${item.latitude || item.location?.lat},${item.longitude || item.location?.lng}`, '_blank');
                                                        }}
                                                    >
                                                        Directions
                                                    </Button>
                                                </div>
                                            </Card>
                                        </List.Item>
                                    )}
                                    locale={{
                                        emptyText: <Empty description="No hospitals or pharmacies found nearby" />
                                    }}
                                />
                            </div>
                        </div>
                    </Col>
                </Row>
            </Content>
            
            {/* Inject minimal CSS for Leaflet Popups to override defaults */}
            <style>{`
                .leaflet-popup-content-wrapper {
                    background: transparent;
                    box-shadow: none;
                    padding: 0;
                }
                .leaflet-popup-tip-container {
                    display: none;
                }
                .custom-popup .leaflet-popup-content {
                    margin: 0;
                }
            `}</style>
        </Layout>
    );
};

export default HospitalFinder;
