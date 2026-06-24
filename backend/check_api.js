const http = require('http');

async function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function testAPI() {
  try {
    console.log('Testing Admin Login...');
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admins/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: 'admin@fashionstore.com',
      password: 'AdminPassword123!'
    });

    console.log('Login Status:', loginRes.statusCode);
    if (!loginRes.body.success || !loginRes.body.data || !loginRes.body.data.token) {
      console.error('Login failed!', loginRes.body);
      return;
    }

    const token = loginRes.body.data.token;

    console.log('\nTesting Fetch Roles...');
    const rolesRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/roles',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Fetch Roles Status:', rolesRes.statusCode);
    console.log('Fetch Roles Response:', JSON.stringify(rolesRes.body, null, 2));

  } catch (err) {
    console.error('Error during API test:', err);
  }
}

testAPI();
