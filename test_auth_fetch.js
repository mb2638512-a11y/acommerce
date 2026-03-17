async function testAuth() {
    console.log('--- Testing Backend Auth ---');
    const testEmail = 'test_' + Date.now() + '@acommerce.com';
    const testPassword = 'TestPassword123!';

    try {
        console.log('1. Registering user: ' + testEmail);
        const regRes = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, name: 'Test Automation', password: testPassword })
        });
        const regData = await regRes.json();
        console.log('Register Success:', JSON.stringify({ status: regRes.status, user: regData.user?.email, hasToken: !!regData.token, error: regData.error }));

        console.log('2. Logging in user: ' + testEmail);
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: testPassword })
        });
        const loginData = await loginRes.json();
        console.log('Login Success:', JSON.stringify({ status: loginRes.status, user: loginData.user?.email, hasToken: !!loginData.token, error: loginData.error }));
    } catch (err) {
        console.error('Test Failed:', err.message);
    }
}
testAuth();
