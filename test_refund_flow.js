const fetch = require('node-fetch');

const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4OGQ4YTJkOC01OTc1LTQyMzctODNhYS1lYzM1YzcxYWUyNjciLCJ1c2VybmFtZSI6InRlc3QtYWRtaW4iLCJyb2xlIjoic3VwZXIgYWRtaW4iLCJwZXJtaXNzaW9ucyI6WyJjcmVhdGVfY2xpZW50Iiwidmlld19jbGllbnRzIiwidmlld19ib29raW5ncyIsInZpZXdfcGF5bWVudHMiLCJ2aWV3X2Fzc2Vzc21lbnRzIiwidmlld19zYXRpc2ZhY3Rpb24iLCJ2aWV3X2V4cGVuc2VzIiwidmlld19yZXBvcnRzIiwidmlld19wYXlvdXRzIiwibWFuYWdlX3VzZXJzIiwibWFuYWdlX3JvbGVzIiwidmlld19jaGFuZ2VfbG9nIiwidmlld190aGVyYXBpc3RzIiwibWFuYWdlX3RoZXJhcGlzdHMiLCJjcmVhdGVfdGhlcmFwaXN0IiwibWFuYWdlX2NsaWVudHMiXSwiZXhwIjoxNzI2MzE2NTk2fQ.VlRJeGpqMVRTNG9xY2RhSmRqSXhkaE1iV25IWkhqbmVzRXJkWkFxQTRNQT0=';
const BASE_URL = 'http://localhost:3000';

async function testRefundFlow() {
  const clientId = 123; // The test client we just created

  console.log('\n========================================');
  console.log('🧪 REFUND FLOW TEST');
  console.log('========================================\n');

  try {
    // Step 1: Get client info before cancellation
    console.log('1️⃣  Getting client info BEFORE cancellation...');
    const clientBeforeRes = await fetch(`${BASE_URL}/api/admin/clients/${clientId}`, {
      method: 'GET',
      headers: {
        'Cookie': `auth=${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!clientBeforeRes.ok) {
      throw new Error(`Failed to fetch client: ${clientBeforeRes.status}`);
    }

    const clientBefore = await clientBeforeRes.json();
    const totalBeforeCancellation = clientBefore.data.total_amount_paid;
    console.log(`   ✓ Client ID: ${clientId}`);
    console.log(`   ✓ Total Amount Paid BEFORE: EGP ${totalBeforeCancellation}\n`);

    // Step 2: Get the future booking (Jul 20 session)
    console.log('2️⃣  Finding the future booking (Jul 20)...');
    const bookingsRes = await fetch(`${BASE_URL}/api/admin/clients/${clientId}/bookings`, {
      method: 'GET',
      headers: {
        'Cookie': `auth=${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!bookingsRes.ok) {
      throw new Error(`Failed to fetch bookings: ${bookingsRes.status}`);
    }

    const bookingsData = await bookingsRes.json();
    const bookings = bookingsData.data || [];

    // Find the future booking (Session 3 on Jul 20)
    const futureBooking = bookings.find(b => b.session_date && b.session_date.includes('2026-07-20'));

    if (!futureBooking) {
      console.log(`   ✗ Could not find future booking on Jul 20`);
      console.log(`   Available bookings:`, bookings.map(b => ({
        id: b.id,
        date: b.session_date,
        status: b.booking_status,
        paymentStatus: b.payment_status
      })));
      throw new Error('Future booking not found');
    }

    const bookingId = futureBooking.id;
    console.log(`   ✓ Found future booking:`);
    console.log(`     - ID: ${bookingId}`);
    console.log(`     - Date: ${futureBooking.session_date}`);
    console.log(`     - Status: ${futureBooking.booking_status}`);
    console.log(`     - Payment Status: ${futureBooking.payment_status}\n`);

    // Step 3: Cancel the booking
    console.log('3️⃣  CANCELLING the future booking...');
    const cancelRes = await fetch(`${BASE_URL}/api/admin/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: {
        'Cookie': `auth=${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!cancelRes.ok) {
      const errorData = await cancelRes.json();
      console.log(`   ✗ Cancel failed with status ${cancelRes.status}`);
      console.log(`   Error:`, errorData);
      throw new Error(`Failed to cancel booking: ${cancelRes.status}`);
    }

    const cancelData = await cancelRes.json();
    console.log(`   ✓ Booking cancelled successfully`);
    console.log(`   ✓ Response:`, cancelData.message || 'Success\n');

    // Step 4: Get client info after cancellation
    console.log('4️⃣  Getting client info AFTER cancellation...');
    const clientAfterRes = await fetch(`${BASE_URL}/api/admin/clients/${clientId}`, {
      method: 'GET',
      headers: {
        'Cookie': `auth=${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!clientAfterRes.ok) {
      throw new Error(`Failed to fetch client after cancellation: ${clientAfterRes.status}`);
    }

    const clientAfter = await clientAfterRes.json();
    const totalAfterCancellation = clientAfter.data.total_amount_paid;
    console.log(`   ✓ Total Amount Paid AFTER: EGP ${totalAfterCancellation}\n`);

    // Step 5: Verify the refund
    console.log('5️⃣  VERIFYING REFUND...\n');
    const refundAmount = totalBeforeCancellation - totalAfterCancellation;
    const expectedRefund = 2000;

    console.log(`   📊 Refund Analysis:`);
    console.log(`      Before Cancellation: EGP ${totalBeforeCancellation}`);
    console.log(`      After Cancellation:  EGP ${totalAfterCancellation}`);
    console.log(`      Refund Amount:       EGP ${refundAmount}`);
    console.log(`      Expected Refund:     EGP ${expectedRefund}`);

    if (refundAmount === expectedRefund) {
      console.log(`\n   ✅ REFUND CORRECT! Amount deducted as expected.\n`);
    } else {
      console.log(`\n   ❌ REFUND INCORRECT! Expected EGP ${expectedRefund}, got EGP ${refundAmount}\n`);
    }

    // Step 6: Check the booking's payment status changed to "refunded"
    console.log('6️⃣  Checking booking payment status...');
    const bookingAfterRes = await fetch(`${BASE_URL}/api/admin/bookings/${bookingId}`, {
      method: 'GET',
      headers: {
        'Cookie': `auth=${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (bookingAfterRes.ok) {
      const bookingAfter = await bookingAfterRes.json();
      const bookingData = bookingAfter.data || bookingAfter;
      const paymentStatus = bookingData.payment_status;
      const bookingStatus = bookingData.booking_status;

      console.log(`   ✓ Booking Status: ${bookingStatus}`);
      console.log(`   ✓ Payment Status: ${paymentStatus}`);

      if (paymentStatus === 'refunded') {
        console.log(`\n   ✅ PAYMENT STATUS CORRECT! Changed to "refunded"\n`);
      } else {
        console.log(`\n   ❌ PAYMENT STATUS INCORRECT! Expected "refunded", got "${paymentStatus}"\n`);
      }
    }

    // Summary
    console.log('========================================');
    console.log('📋 TEST SUMMARY');
    console.log('========================================');
    console.log(`\n✅ Total Amount Refunded: ${refundAmount === expectedRefund ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`✅ Payment Status Update: ${(await fetch(`${BASE_URL}/api/admin/bookings/${bookingId}`, {
      method: 'GET',
      headers: { 'Cookie': `auth=${AUTH_TOKEN}` },
    }).then(r => r.json()).then(d => d.data?.payment_status)) === 'refunded' ? 'PASS ✓' : 'FAIL ✗'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testRefundFlow();
