const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/clients/125',
  method: 'GET',
  headers: {
    'Cookie': 'auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4OGQ4YTJkOC01OTc1LTQyMzctODNhYS1lYzM1YzcxYWUyNjciLCJ1c2VybmFtZSI6InRlc3QtYWRtaW4iLCJyb2xlIjoic3VwZXIgYWRtaW4iLCJwZXJtaXNzaW9ucyI6WyJjcmVhdGVfY2xpZW50Iiwidmlld19jbGllbnRzIiwidmlld19ib29raW5ncyIsInZpZXdfcGF5bWVudHMiLCJ2aWV3X2Fzc2Vzc21lbnRzIiwidmlld19zYXRpc2ZhY3Rpb24iLCJ2aWV3X2V4cGVuc2VzIiwidmlld19yZXBvcnRzIiwidmlld19wYXlvdXRzIiwibWFuYWdlX3VzZXJzIiwibWFuYWdlX3JvbGVzIiwidmlld19jaGFuZ2VfbG9nIiwidmlld190aGVyYXBpc3RzIiwibWFuYWdlX3RoZXJhcGlzdHMiLCJjcmVhdGVfdGhlcmFwaXN0IiwibWFuYWdlX2NsaWVudHMiXSwiZXhwIjoxNzI2MzE2NTk2fQ.VlRJeGpqMVRTNG9xY2RhSmRqSXhkaE1iV25IWkhqbmVzRXJkWkFxQTRNQT0='
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const json = JSON.parse(data);
    console.log('\n📋 API RESPONSE FOR CLIENT 125:');
    console.log('Total Amount Paid:', json.data.total_amount_paid);
    console.log('Session Payment Received:', json.data.session_payment_received);
    console.log('Session Payment Amount:', json.data.session_payment_amount);
    console.log('Session Payment Date:', json.data.session_payment_date);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
