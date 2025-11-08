// Quick test script to verify Razorpay configuration
// Run with: node test-razorpay-config.js

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking Razorpay Configuration...\n');

const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

if (!razorpayKey) {
  console.log('❌ NEXT_PUBLIC_RAZORPAY_KEY_ID is NOT set');
  console.log('   Please check your .env.local file');
} else if (razorpayKey === 'rzp_test_dummy') {
  console.log('⚠️  Using dummy Razorpay key');
  console.log('   Please update with your actual test key');
} else if (razorpayKey.startsWith('rzp_test_')) {
  console.log('✅ Razorpay TEST key is configured');
  console.log(`   Key: ${razorpayKey.substring(0, 15)}...`);
  console.log('   Mode: TEST (no real charges)');
} else if (razorpayKey.startsWith('rzp_live_')) {
  console.log('✅ Razorpay LIVE key is configured');
  console.log(`   Key: ${razorpayKey.substring(0, 15)}...`);
  console.log('   ⚠️  Mode: LIVE (real charges will occur!)');
} else {
  console.log('⚠️  Razorpay key format looks unusual');
  console.log(`   Key: ${razorpayKey}`);
}

console.log('\n📝 Next Steps:');
console.log('1. Restart your Next.js dev server (npm run dev)');
console.log('2. Navigate to the doctor booking page');
console.log('3. Select a doctor and time slot');
console.log('4. Click "Pay & Book" to test payment');
console.log('\n💳 Test Card: 4111 1111 1111 1111');
console.log('   CVV: Any 3 digits | Expiry: Any future date');
