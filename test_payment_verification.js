const http = require('http');

const AUTH = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4OGQ4YTJkOC01OTc1LTQyMzctODNhYS1lYzM1YzcxYWUyNjciLCJ1c2VybmFtZSI6InRlc3QtYWRtaW4iLCJyb2xlIjoic3VwZXIgYWRtaW4iLCJwZXJtaXNzaW9ucyI6WyJjcmVhdGVfY2xpZW50Iiwidmlld19jbGllbnRzIiwidmlld19ib29raW5ncyIsInZpZXdfcGF5bWVudHMiLCJ2aWV3X2Fzc2Vzc21lbnRzIiwidmlld19zYXRpc2ZhY3Rpb24iLCJ2aWV3X2V4cGVuc2VzIiwidmlld19yZXBvcnRzIiwidmlld19wYXlvdXRzIiwibWFuYWdlX3VzZXJzIiwibWFuYWdlX3JvbGVzIiwidmlld19jaGFuZ2VfbG9nIiwidmlld190aGVyYXBpc3RzIiwibWFuYWdlX3RoZXJhcGlzdHMiLCJjcmVhdGVfdGhlcmFwaXN0IiwibWFuYWdlX2NsaWVudHMiXSwiZXhwIjoxNzI2MzE2NTk2fQ.VlRJeGpqMVRTNG9xY2RhSmRqSXhkaE1iV25IWkhqbmVzRXJkWkFxQTRNQT0=';
const CLIENT_ID = 125;
const BOOKING_ID = 216;

console.log('\n=== Testing Payment Verification ===\n');

// Step 1: Get current client state
console.log('1. Fetching current client state...');
const getOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/clients/' + CLIENT_ID,
  method: 'GET',
  headers: { 'Cookie': 'auth=' + AUTH }
};

http.request(getOptions, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const client = JSON.parse(data).data;
      const totalBefore = client.total_amount_paid;
      console.log('   Total Paid BEFORE: ' + totalBefore + ' EGP');
      console.log('   Session Payment Received: ' + client.session_payment_received);

      // Step 2: Update client with payment
      console.log('\n2. Sending PUT request to update client payment...');
      const putData = JSON.stringify({
        session_payment_received: true,
        session_payment_date: '2026-07-25',
        session_payment_amount: 2000,
        total_amount_paid: totalBefore + 2000
      });

      const putOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/admin/clients/' + CLIENT_ID,
        method: 'PUT',
        headers: {
          'Cookie': 'auth=' + AUTH,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(putData)
        }
      };

      http.request(putOptions, (res2) => {
        let data2 = '';
        res2.on('data', chunk => data2 += chunk);
        res2.on('end', () => {
          console.log('   Response Status: ' + res2.statusCode);
          if (res2.statusCode === 200) {
            console.log('   ✅ PUT request succeeded');
          } else {
            console.log('   ❌ PUT request failed');
            console.log('   Response: ' + data2.substring(0, 200));
          }

          // Step 3: Verify the update
          console.log('\n3. Fetching client again to verify update...');
          setTimeout(() => {
            http.request(getOptions, (res3) => {
              let data3 = '';
              res3.on('data', chunk => data3 += chunk);
              res3.on('end', () => {
                const client2 = JSON.parse(data3).data;
                const totalAfter = client2.total_amount_paid;
                console.log('   Total Paid AFTER: ' + totalAfter + ' EGP');
                console.log('   Session Payment Received: ' + client2.session_payment_received);
                console.log('\n   Expected: 4000 + 2000 = 6000');
                console.log('   Got: ' + totalAfter);
                if (totalAfter === 6000) {
                  console.log('   ✅ PAYMENT VERIFICATION WORKED');
                } else {
                  console.log('   ❌ PAYMENT VERIFICATION FAILED - Total did not increase');
                }
              });
            }).end();
          }, 500);
        });
      }).end(putData);
    } catch(e) {
      console.error('Error:', e.message);
    }
  });
}).end();
