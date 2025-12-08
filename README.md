# Prove AI POC

Proof of Concept application demonstrating all Prove.com identity verification features.

## 🚀 Features

This POC implements 10 Prove.com API features:

1. **Identity V2 Pre-fill** - Form pre-population with verified identity data
2. **SMS Authentication / OTP** - One-time passcode verification via SMS
3. **Trust Score** - Real-time risk assessment for phone numbers
4. **Phone Authentication** - Active phone possession verification
5. **Selfie Comparison + Liveness** - Biometric verification with anti-spoofing
6. **Knowledge-Based Authentication (KBA)** - Security questions verification
7. **Credential Analysis** - ID document authenticity verification
8. **AAMVA Check** - DMV driver's license verification
9. **Multi-Factor Authentication (MFA)** - Combined verification methods
10. **Phone Number Intelligence** - Carrier info, porting history, risk indicators

## 📋 Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser to:
```
http://localhost:3005
```

## 🏗️ Project Structure

- `server.js` - Express server with all Prove API endpoints
- `public/` - Frontend files
  - `index.html` - Main HTML file with all feature cards
  - `styles.css` - Styles
  - `script.js` - JavaScript for all features

## 🌐 Deployment

### Option 1: Vercel (Recommended)
This project includes `vercel.json` configuration. Deploy with:
```bash
npm i -g vercel
vercel
```

### Option 2: Render
This project includes `render.yaml` configuration. Connect your GitHub repo to Render.

### Option 3: GitHub Pages
For static hosting, you can use GitHub Pages (note: requires a static build or separate frontend/backend setup).

## 📡 API Endpoints

All endpoints are available at `/api/prove/*`:
- `POST /api/prove/identity/v2` - Identity verification
- `POST /api/prove/sms/send-otp` - Send OTP
- `POST /api/prove/sms/verify-otp` - Verify OTP
- `POST /api/prove/trust-score` - Get trust score
- `POST /api/prove/phone/authenticate` - Phone authentication
- `POST /api/prove/selfie/compare` - Compare selfie with ID
- `POST /api/prove/selfie/liveness` - Check liveness
- `POST /api/prove/kba/generate` - Generate KBA questions
- `POST /api/prove/kba/verify` - Verify KBA answers
- `POST /api/prove/credential/analyze` - Analyze ID credential
- `POST /api/prove/aamva/verify` - Verify with DMV
- `POST /api/prove/mfa/initiate` - Initiate MFA
- `POST /api/prove/mfa/verify` - Verify MFA
- `POST /api/prove/phone/intelligence` - Get phone intelligence

## 🧪 Testing

All features include mock implementations. For testing:
- Use phone numbers containing "555" or "123" for successful verifications
- Upload images for selfie/ID comparison features
- Follow the UI prompts for each feature

## 📝 License

ISC
