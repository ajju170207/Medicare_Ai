import axios from 'axios';

const baseURL = 'http://localhost:5001/api/v1';
let token = '';

const runTest = async () => {
  try {
    console.log('1. Registering new user...');
    const registerRes = await axios.post(`${baseURL}/auth/register`, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      age: 30,
      gender: 'male'
    });
    token = registerRes.data.token;
    console.log('✅ Registered! Token obtained.');

    console.log('2. Fetching Profile...');
    const profileRes = await axios.get(`${baseURL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile Fetched:', profileRes.data.data.name);

    console.log('3. Analyzing Symptoms...');
    const analyzeRes = await axios.post(`${baseURL}/symptoms/analyze`, {
      symptoms: ['headache', 'fever', 'cough'],
      duration: '3 days',
      severity: 'moderate',
      age: 30,
      gender: 'male'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Symptoms Analyzed! Primary condition:', analyzeRes.data.data.result.primaryCondition);

    console.log('4. Fetching History...');
    const historyRes = await axios.get(`${baseURL}/symptoms/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ History Fetched! Count: ${historyRes.data.count}`);

    console.log('5. Fetching Dashboard...');
    const dashboardRes = await axios.get(`${baseURL}/symptoms/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Dashboard Fetched! Total checks:', dashboardRes.data.data.total_checks);

    console.log('🎉 All tests passed successfully!');
  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

runTest();
