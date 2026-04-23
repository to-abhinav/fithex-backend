const fs = require('fs');

const logFile = 'docs/superpowers/api-test-results.txt';

// Initialize file with clear header to avoid encoding issues
fs.writeFileSync(logFile, `--- FitHex API Test Session: ${new Date().toLocaleString()} ---\n\n`, 'utf8');

async function logResult(testName, requestInfo, response) {
    const separator = '\n' + '-'.repeat(40) + '\n';
    const entry = `TEST: ${testName}\nRequest: ${requestInfo}\nStatus: ${response.status}\nResponse: ${typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data}${separator}`;
    fs.appendFileSync(logFile, entry, 'utf8');
    console.log(`Completed: ${testName}`);
}

async function runTests() {
    const baseUrl = 'http://localhost:5000';
    
    // Test 1: GET /
    try {
        const res = await fetch(`${baseUrl}/`);
        const text = await res.text();
        await logResult('GET /', `GET ${baseUrl}/`, { status: res.status, data: text });
    } catch (e) { await logResult('GET /', 'ERROR', { status: 500, data: e.message }); }

    // Test 2: POST /users/send-otp (Correct field: email)
    try {
        const body = { email: 'testuser@example.com' };
        const res = await fetch(`${baseUrl}/users/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const json = await res.json();
        await logResult('POST /users/send-otp', `POST ${baseUrl}/users/send-otp`, { status: res.status, data: json });
    } catch (e) { await logResult('POST /users/send-otp', 'ERROR', { status: 500, data: e.message }); }

    // Test 3: POST /auth/login (Invalid credentials)
    try {
        const body = { email: 'testuser@example.com', password: 'wrongpassword123' };
        const res = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const json = await res.json();
        await logResult('POST /auth/login', `POST ${baseUrl}/auth/login`, { status: res.status, data: json });
    } catch (e) { await logResult('POST /auth/login', 'ERROR', { status: 500, data: e.message }); }
}

runTests();
