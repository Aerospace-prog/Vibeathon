# Razorpay Payment Testing Guide

## ✅ Configuration Complete

Your Razorpay test credentials have been configured:

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_K1mr1ltDWMN30n
```

**Backend** (`.env`):
```
RAZORPAY_KEY_ID=rzp_test_K1mr1ltDWMN30n
RAZORPAY_KEY_SECRET=f86mEfQVwRkl4vj1SnYpJRic
```

## 🧪 How to Test Payment

### Step 1: Restart Your Servers
After updating environment variables, restart both servers:

**Backend:**
```bash
cd backend
python run.py
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Step 2: Navigate to Doctor Booking
1. Open http://localhost:3000
2. Login as a patient
3. Go to "Book Appointment" or use the symptom checker
4. Select a doctor, date, and time slot
5. Click "Pay ₹[amount] & Book"

### Step 3: Test Payment Modal
The Razorpay payment modal should open with your test credentials.

## 💳 Test Payment Methods

### ⚠️ IMPORTANT: Test Mode Configuration

The application is configured to **ONLY show card payments in test mode** to prevent:
- Real phone number collection
- OTP verification requests
- Confusion with real payment methods

### Test Cards (Only method available in test mode)

**⚠️ IMPORTANT: Use Domestic Cards to Avoid "International Payment" Error**

**✅ Recommended - Domestic Mastercard (Always Works):**
- Card Number: `5267 3181 8797 5449`
- CVV: Any 3 digits (e.g., `123`)
- Expiry: Any future date (e.g., `12/25`)
- Name: Any name (e.g., `Test User`)

**✅ Alternative - RuPay Card (Indian Domestic):**
- Card Number: `6521 5499 8435 2187`
- CVV: Any 3 digits (e.g., `123`)
- Expiry: Any future date (e.g., `12/25`)
- Name: Any name

**⚠️ May Fail - International Visa:**
- Card Number: `4111 1111 1111 1111`
- Note: This card may show "international payment not enabled" error
- Use domestic cards above instead

**Other Test Cards:**
- Mastercard (Generic): `5555 5555 5555 4444`
- Visa (Declined): `4000 0000 0000 0002`

### ❌ Disabled in Test Mode
The following payment methods are **intentionally disabled** in test mode:
- ❌ UPI (requires real phone number)
- ❌ Net Banking (requires real credentials)
- ❌ Wallets (requires real phone number)

These will only be available when using live Razorpay keys in production.

## 🔍 Debugging

### Check Browser Console
Open browser DevTools (F12) and check the Console tab for:
- "Razorpay Key: Loaded" - Confirms key is loaded
- Any error messages

### Common Issues

**Issue: "Razorpay key not configured"**
- Solution: Make sure you restarted the frontend server after updating `.env.local`

**Issue: Payment modal doesn't open**
- Solution: Check browser console for errors
- Ensure Razorpay script is loading (check Network tab)

**Issue: Payment succeeds but appointment not created**
- Solution: Check backend logs
- Verify Supabase connection
- Check appointments table exists

## 📝 Payment Flow

1. User clicks "Pay & Book" button
2. Razorpay checkout modal opens
3. User completes payment with test credentials
4. On success, `handleConfirmBooking()` is called with payment ID
5. Appointment is created in database with payment details
6. User is redirected to appointments list

## 🎯 Expected Behavior

✅ Payment modal opens with "Arogya-AI" branding
✅ Amount shows correctly (in INR)
✅ Test payment methods are available
✅ After successful payment, appointment is created
✅ User sees success message and appointment details

## 🚀 Next Steps

Once testing is complete:

1. **For Production:**
   - Replace test keys with live keys from Razorpay dashboard
   - Complete KYC verification on Razorpay
   - Set up webhooks for payment confirmations
   - Add refund handling

2. **Security:**
   - Never commit `.env` files to git
   - Keep secret keys secure
   - Use environment variables in production

## 📚 Resources

- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
- [Razorpay Checkout Docs](https://razorpay.com/docs/payments/payment-gateway/web-integration/)
- [Razorpay Dashboard](https://dashboard.razorpay.com/)

## 💡 Tips

- Test mode payments don't charge real money
- You can view test transactions in Razorpay Dashboard
- Use different test cards to simulate various scenarios
- Check the "Test Mode" toggle in Razorpay Dashboard
