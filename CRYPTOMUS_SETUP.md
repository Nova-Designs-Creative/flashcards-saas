# Cryptomus Payment Gateway Configuration

## Required Environment Variables

Add these variables to your `.env.local` file:

```env
# Cryptomus Configuration
CRYPTOMUS_MERCHANT_ID=your_merchant_id_here
CRYPTOMUS_API_KEY=your_api_key_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Tier Limits
FREE_TIER_MONTHLY_LIMIT=10
PREMIUM_TIER_MONTHLY_LIMIT=1000
```

## Cryptomus Setup Instructions

1. **Create Cryptomus Account:**
   - Visit https://cryptomus.com
   - Register for a merchant account
   - Complete KYC verification

2. **Get API Credentials:**
   - Log into your Cryptomus dashboard
   - Navigate to API settings
   - Generate a new merchant ID and API key
   - Add these to your environment variables

3. **Configure Webhook:**
   - In Cryptomus dashboard, set webhook URL to: `https://yourdomain.com/api/payments/webhook`
   - For local development: `https://your-ngrok-url.ngrok.io/api/payments/webhook`
   - Ensure webhook is enabled for payment status updates

4. **Test with Testnet (Optional):**
   - Cryptomus provides testnet environment for testing
   - Use testnet credentials for development
   - Switch to mainnet credentials for production

## Payment Flow

1. User clicks "Upgrade to Premium"
2. Frontend calls `/api/payments/create`
3. Backend creates transaction in database
4. Backend calls Cryptomus API to create payment
5. User is redirected to Cryptomus payment page
6. User completes payment with cryptocurrency
7. Cryptomus sends webhook to `/api/payments/webhook`
8. Backend verifies webhook and upgrades user
9. User is redirected to success page

## Security Features

- HMAC signature verification for webhooks
- Transaction amount limits ($1000 max)
- Duplicate payment prevention
- Input validation and sanitization
- Rate limiting on payment creation
- Secure error handling without exposing sensitive data

## Testing Checklist

- [ ] Environment variables configured
- [ ] Cryptomus account set up
- [ ] Webhook URL configured in Cryptomus dashboard
- [ ] Test payment creation
- [ ] Test webhook processing
- [ ] Test user upgrade flow
- [ ] Test error scenarios
- [ ] Verify security measures

## Production Considerations

- Use HTTPS for all webhook URLs
- Monitor payment transactions
- Set up proper logging and alerting
- Regular security audits
- Backup payment transaction data
- Compliance with local regulations