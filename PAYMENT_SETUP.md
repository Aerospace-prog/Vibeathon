# Payment Gateway Setup Guide

## Razorpay Integration (For India)

### 1. Create Razorpay Account
1. Go to https://razorpay.com/
2. Sign up for a free account
3. Complete KYC verification (for live mode)

### 2. Get API Keys
1. Login to Razorpay Dashboard
2. Go to Settings → API Keys
3. Generate Test/Live Keys
4. Copy the **Key ID** and **Key Secret**

### 3. Add Keys to Environment Variables

Create/Update `frontend/.env.local`:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
```

Create/Update `backend/.env`:
```env
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
```

### 4. Test Mode vs Live Mode

**Test Mode** (for development):
- Use test API keys (starts with `rzp_test_`)
- Use test cards: https://razorpay.com/docs/payments/payments/test-card-details/
- No real money is charged

**Live Mode** (for production):
- Complete KYC verification
- Use live API keys (starts with `rzp_live_`)
- Real payments will be processed

### 5. Payment Flow

1. Patient selects doctor, date, and time
2. Clicks "Pay ₹800 & Book"
3. Razorpay payment modal opens
4. Patient completes payment (UPI/Card/Net Banking/Wallet)
5. On success, appointment is created in database
6. Patient is redirected to dashboard

### 6. Supported Payment Methods

- **UPI**: Google Pay, PhonePe, Paytm, BHIM
- **Cards**: Visa, Mastercard, Amex, RuPay
- **Net Banking**: All major banks
- **Wallets**: Paytm, Mobikwik, Freecharge, etc.

### 7. Testing

Use these test credentials in Test Mode:

**Test Cards:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- Name: Any name

**Test UPI:**
- UPI ID: `success@razorpay`

### 8. Webhook Setup (Optional)

For production, set up webhooks to handle payment confirmations:

1. Go to Razorpay Dashboard → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Select events: `payment.captured`, `payment.failed`
4. Save webhook secret

### 9. Alternative: Stripe (International)

If you want to support international payments:

1. Sign up at https://stripe.com/
2. Get API keys from Dashboard
3. Update environment variables:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```
4. Install Stripe: `npm install @stripe/stripe-js @stripe/react-stripe-js`

### 10. Security Best Practices

✅ **DO:**
- Always verify payment on backend
- Store payment IDs in database
- Use HTTPS in production
- Keep secret keys secure (never commit to git)
- Validate payment amount on server

❌ **DON'T:**
- Trust client-side payment confirmation alone
- Expose secret keys in frontend code
- Skip payment verification
- Store card details (PCI compliance)

### 11. Go Live Checklist

- [ ] Complete KYC verification
- [ ] Switch to live API keys
- [ ] Test with real small amount
- [ ] Set up webhooks
- [ ] Add refund policy
- [ ] Add terms & conditions
- [ ] Enable 2FA on Razorpay account
- [ ] Monitor transactions regularly

### 12. Support

- Razorpay Docs: https://razorpay.com/docs/
- Support: support@razorpay.com
- Phone: 1800-123-0000 (India)

---

## Current Implementation

The payment is integrated in:
- **File**: `frontend/components/patient/DoctorBooking.tsx`
- **Function**: `handlePayment()`
- **Flow**: Select Date/Time → Click Pay Button → Razorpay Modal → Payment → Appointment Created

**Note**: Currently using dummy test key. Replace with your actual Razorpay key to enable payments!
