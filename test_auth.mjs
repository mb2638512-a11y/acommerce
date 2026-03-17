import axios from 'axios';

async function testAuth() {
    console.log('--- Testing Backend Auth ---');
    const api = axios.create({ baseURL: 'http://localhost:5000/api' });
    const testEmail = `test_${Date.now()}@acommerce.com`;
    const testPassword = 'TestPassword123!';

    try {
        console.log(`1. Registering user: ${testEmail}`);
        const regRes = await api.post('/auth/register', {
            email: testEmail,
            name: 'Test Automation',
            password: testPassword
        });
        console.log('Register Success:', {
            status: regRes.status,
            user: regRes.data.user?.email,
            hasToken: !!regRes.data.token
        });

        console.log(`2. Logging in user: ${testEmail}`);
        const loginRes = await api.post('/auth/login', {
            email: testEmail,
            password: testPassword
        });
        console.log('Login Success:', {
            status: loginRes.status,
            user: loginRes.data.user?.email,
            hasToken: !!loginRes.data.token
        });

    } catch (err) {
        console.error('Test Failed:', err.response?.data || err.message);
    }
}

testAuth();
