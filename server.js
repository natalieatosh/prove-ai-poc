const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// Serve static files - handle both local and Vercel environments
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html')); // Welcome page
});

app.get('/form', (req, res) => {
  res.sendFile(path.join(publicPath, 'form.html')); // Main form page
});

app.get('/form.html', (req, res) => {
  res.sendFile(path.join(publicPath, 'form.html')); // Main form page (alternative route)
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Prove AI POC' });
});

// Prove Identity V2 API Mock Endpoint
// In production, this would call the actual Prove.com API
// Reference: https://docs.prove.com/customer/reference/identityv2
app.post('/api/prove/identity/v2', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required'
    });
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock response - In production, this would be the actual Prove API response
  // Based on Prove Identity V2 API structure
  // Moby Dick themed: Captain Ahab
  const mockUserData = {
    firstName: 'Captain',
    lastName: 'Ahab',
    email: 'captain.ahab@pequod.com',
    address: '1 Pequod Wharf',
    city: 'Nantucket',
    state: 'MA',
    zipCode: '02554',
    dateOfBirth: '1800-01-01',
    ssn: '1851',
    phone: phone,
    verified: true,
    verificationLevel: 'high',
    occupation: 'Whaling Ship Captain',
    vessel: 'Pequod'
  };

  // Simulate different responses based on phone number
  if (phone.includes('555') || phone.includes('123')) {
    // Success case
    res.json({
      success: true,
      message: 'Captain Ahab\'s identity verified successfully',
      userData: mockUserData,
      verificationId: 'pequod_verify_' + Date.now(),
      timestamp: new Date().toISOString()
    });
  } else {
    // Failure case for demonstration
    res.status(400).json({
      success: false,
      message: 'Unable to verify identity. Please check your phone number and try again.',
      errorCode: 'VERIFICATION_FAILED'
    });
  }
});

// ============================================
// PROVE API ENDPOINTS - All Features
// ============================================

// 1. SMS Authentication / OTP Verification
app.post('/api/prove/sms/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required'
    });
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock OTP code (in production, this would be generated and sent via Prove)
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP in memory (in production, use Redis or database)
  if (!global.otpStore) global.otpStore = {};
  global.otpStore[phone] = {
    code: otpCode,
    expiresAt: Date.now() + 300000, // 5 minutes
    attempts: 0
  };

  res.json({
    success: true,
    message: 'OTP sent successfully to ' + phone,
    sessionId: 'otp_session_' + Date.now(),
    expiresIn: 300, // 5 minutes
    // In production, OTP would be sent via SMS, not returned
    // For demo purposes only:
    otpCode: otpCode
  });
});

app.post('/api/prove/sms/verify-otp', async (req, res) => {
  const { phone, otp, sessionId } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Phone number and OTP code are required'
    });
  }

  await new Promise(resolve => setTimeout(resolve, 800));

  if (!global.otpStore || !global.otpStore[phone]) {
    return res.status(400).json({
      success: false,
      message: 'OTP session not found or expired'
    });
  }

  const otpData = global.otpStore[phone];
  
  if (Date.now() > otpData.expiresAt) {
    delete global.otpStore[phone];
    return res.status(400).json({
      success: false,
      message: 'OTP has expired. Please request a new one.'
    });
  }

  if (otpData.attempts >= 3) {
    delete global.otpStore[phone];
    return res.status(400).json({
      success: false,
      message: 'Too many failed attempts. Please request a new OTP.'
    });
  }

  if (otp !== otpData.code) {
    otpData.attempts++;
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP code',
      attemptsRemaining: 3 - otpData.attempts
    });
  }

  // Success
  delete global.otpStore[phone];
  res.json({
    success: true,
    message: 'Phone number verified successfully',
    verified: true,
    phone: phone,
    timestamp: new Date().toISOString()
  });
});

// 2. Trust Score
app.post('/api/prove/trust-score', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required'
    });
  }

  await new Promise(resolve => setTimeout(resolve, 1200));

  // Mock trust score calculation
  const baseScore = phone.includes('555') || phone.includes('123') ? 85 : 45;
  const riskFactors = [];
  
  if (baseScore < 50) {
    riskFactors.push('SIM swap risk detected');
    riskFactors.push('Recent number porting activity');
  } else if (baseScore < 70) {
    riskFactors.push('Moderate account activity');
  }

  res.json({
    success: true,
    phone: phone,
    trustScore: baseScore,
    riskLevel: baseScore >= 80 ? 'low' : baseScore >= 60 ? 'medium' : 'high',
    riskFactors: riskFactors,
    recommendations: baseScore < 60 ? ['Require additional verification'] : ['Phone number appears trustworthy'],
    timestamp: new Date().toISOString()
  });
});

// 3. Phone Authentication
app.post('/api/prove/phone/authenticate', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required'
    });
  }

  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate phone authentication
  const isAuthenticated = phone.includes('555') || phone.includes('123');
  
  if (isAuthenticated) {
    res.json({
      success: true,
      authenticated: true,
      phone: phone,
      message: 'Phone number successfully authenticated',
      authenticationMethod: 'active_phone_possession',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(400).json({
      success: false,
      authenticated: false,
      message: 'Phone authentication failed. Unable to verify active phone possession.',
      errorCode: 'AUTHENTICATION_FAILED'
    });
  }
});

// 4. Selfie Comparison + Liveness Check
app.post('/api/prove/selfie/compare', async (req, res) => {
  const { selfieImage, idImage } = req.body;

  if (!selfieImage || !idImage) {
    return res.status(400).json({
      success: false,
      message: 'Both selfie and ID images are required'
    });
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock comparison results
  const matchScore = Math.floor(85 + Math.random() * 10); // 85-95%
  const livenessScore = Math.floor(90 + Math.random() * 8); // 90-98%

  res.json({
    success: true,
    matchScore: matchScore,
    livenessScore: livenessScore,
    isMatch: matchScore >= 80,
    isLive: livenessScore >= 85,
    verified: matchScore >= 80 && livenessScore >= 85,
    message: matchScore >= 80 && livenessScore >= 85 
      ? 'Selfie matches ID photo and liveness check passed' 
      : 'Verification failed - images do not match or liveness check failed',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/prove/selfie/liveness', async (req, res) => {
  const { selfieImage } = req.body;

  if (!selfieImage) {
    return res.status(400).json({
      success: false,
      message: 'Selfie image is required'
    });
  }

  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock liveness check
  const livenessScore = Math.floor(88 + Math.random() * 10); // 88-98%
  const isLive = livenessScore >= 85;

  res.json({
    success: true,
    livenessScore: livenessScore,
    isLive: isLive,
    detectedThreats: isLive ? [] : ['Possible deepfake detected', 'Spoofing attempt'],
    message: isLive 
      ? 'Liveness check passed - confirmed live person' 
      : 'Liveness check failed - possible spoofing detected',
    timestamp: new Date().toISOString()
  });
});

// 5. Knowledge-Based Authentication (KBA)
app.post('/api/prove/kba/generate', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required'
    });
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock KBA questions (in production, these come from Prove's data sources)
  const questions = [
    {
      id: 'kba_1',
      question: 'Which of the following addresses have you been associated with?',
      type: 'multiple_choice',
      options: [
        '1 Pequod Wharf, Nantucket, MA',
        '123 Main Street, Boston, MA',
        '456 Ocean Drive, Cape Cod, MA',
        '789 Harbor Lane, Salem, MA'
      ],
      correctAnswer: 0
    },
    {
      id: 'kba_2',
      question: 'What is the make of your first vehicle?',
      type: 'multiple_choice',
      options: [
        'Whaleboat',
        'Horse Carriage',
        'Steam Engine',
        'Sailing Ship'
      ],
      correctAnswer: 0
    },
    {
      id: 'kba_3',
      question: 'Which financial institution did you open your first account with?',
      type: 'multiple_choice',
      options: [
        'Nantucket Whalers Bank',
        'Boston National Bank',
        'Massachusetts Savings',
        'Atlantic Credit Union'
      ],
      correctAnswer: 0
    }
  ];

  // Store questions for verification
  if (!global.kbaStore) global.kbaStore = {};
  global.kbaStore[phone] = {
    questions: questions,
    expiresAt: Date.now() + 600000, // 10 minutes
    attempts: 0
  };

  res.json({
    success: true,
    sessionId: 'kba_session_' + Date.now(),
    questions: questions,
    expiresIn: 600,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/prove/kba/verify', async (req, res) => {
  const { phone, answers, sessionId } = req.body;

  if (!phone || !answers) {
    return res.status(400).json({
      success: false,
      message: 'Phone number and answers are required'
    });
  }

  await new Promise(resolve => setTimeout(resolve, 1200));

  if (!global.kbaStore || !global.kbaStore[phone]) {
    return res.status(400).json({
      success: false,
      message: 'KBA session not found or expired'
    });
  }

  const kbaData = global.kbaStore[phone];
  
  if (Date.now() > kbaData.expiresAt) {
    delete global.kbaStore[phone];
    return res.status(400).json({
      success: false,
      message: 'KBA session has expired'
    });
  }

  if (kbaData.attempts >= 2) {
    delete global.kbaStore[phone];
    return res.status(400).json({
      success: false,
      message: 'Too many failed attempts'
    });
  }

  // Verify answers
  let correctCount = 0;
  kbaData.questions.forEach((q, index) => {
    if (answers[q.id] === q.correctAnswer) {
      correctCount++;
    }
  });

  const requiredCorrect = Math.ceil(kbaData.questions.length * 0.67); // 67% correct

  if (correctCount >= requiredCorrect) {
    delete global.kbaStore[phone];
    res.json({
      success: true,
      verified: true,
      correctAnswers: correctCount,
      totalQuestions: kbaData.questions.length,
      message: 'KBA verification passed',
      timestamp: new Date().toISOString()
    });
  } else {
    kbaData.attempts++;
    res.status(400).json({
      success: false,
      verified: false,
      correctAnswers: correctCount,
      totalQuestions: kbaData.questions.length,
      message: 'KBA verification failed - insufficient correct answers',
      attemptsRemaining: 2 - kbaData.attempts
    });
  }
});

// 6. Credential Analysis
app.post('/api/prove/credential/analyze', async (req, res) => {
  const { idImage, idType } = req.body;

  if (!idImage) {
    return res.status(400).json({
      success: false,
      message: 'ID image is required'
    });
  }

  await new Promise(resolve => setTimeout(resolve, 2500));

  // Mock credential analysis
  const authenticityScore = Math.floor(88 + Math.random() * 10); // 88-98%
  const isAuthentic = authenticityScore >= 85;

  res.json({
    success: true,
    idType: idType || 'driver_license',
    authenticityScore: authenticityScore,
    isAuthentic: isAuthentic,
    detectedIssues: isAuthentic ? [] : ['Possible tampering detected', 'Inconsistent security features'],
    extractedData: {
      firstName: 'Captain',
      lastName: 'Ahab',
      dateOfBirth: '1800-01-01',
      address: '1 Pequod Wharf',
      city: 'Nantucket',
      state: 'MA',
      zipCode: '02554',
      licenseNumber: 'MA-1851-WHALE',
      expirationDate: '1855-12-31'
    },
    securityFeatures: {
      holograms: 'verified',
      microprint: 'verified',
      uvPattern: 'verified',
      barcode: 'verified'
    },
    message: isAuthentic 
      ? 'ID credential analysis passed - document appears authentic' 
      : 'ID credential analysis failed - possible fraud detected',
    timestamp: new Date().toISOString()
  });
});

// 7. AAMVA Check (DMV Verification)
app.post('/api/prove/aamva/verify', async (req, res) => {
  const { licenseNumber, state, dateOfBirth } = req.body;

  if (!licenseNumber || !state) {
    return res.status(400).json({
      success: false,
      message: 'License number and state are required'
    });
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock AAMVA/DMV verification
  const isValid = licenseNumber.includes('1851') || licenseNumber.includes('WHALE');

  res.json({
    success: true,
    verified: isValid,
    licenseNumber: licenseNumber,
    state: state,
    dmvStatus: isValid ? 'active' : 'not_found',
    dmvData: isValid ? {
      firstName: 'Captain',
      lastName: 'Ahab',
      dateOfBirth: dateOfBirth || '1800-01-01',
      address: '1 Pequod Wharf, Nantucket, MA 02554',
      licenseClass: 'D',
      expirationDate: '1855-12-31',
      restrictions: 'None',
      endorsements: ['Maritime Operations']
    } : null,
    message: isValid 
      ? 'License verified against DMV records' 
      : 'License not found in DMV records',
    timestamp: new Date().toISOString()
  });
});

// 8. Multi-Factor Authentication (MFA)
app.post('/api/prove/mfa/initiate', async (req, res) => {
  const { phone, methods } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required'
    });
  }

  const mfaMethods = methods || ['sms', 'phone_auth', 'trust_score'];

  await new Promise(resolve => setTimeout(resolve, 1000));

  res.json({
    success: true,
    mfaSessionId: 'mfa_session_' + Date.now(),
    methods: mfaMethods,
    requiredMethods: mfaMethods.length,
    completedMethods: [],
    status: 'pending',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/prove/mfa/verify', async (req, res) => {
  const { mfaSessionId, method, verificationData } = req.body;

  if (!mfaSessionId || !method) {
    return res.status(400).json({
      success: false,
      message: 'MFA session ID and method are required'
    });
  }

  await new Promise(resolve => setTimeout(resolve, 1200));

  // Mock MFA verification
  const isVerified = verificationData && (
    verificationData.otp === '123456' || 
    verificationData.phone?.includes('555') ||
    verificationData.trustScore >= 70
  );

  res.json({
    success: true,
    mfaSessionId: mfaSessionId,
    method: method,
    verified: isVerified,
    message: isVerified 
      ? `MFA method ${method} verified successfully` 
      : `MFA method ${method} verification failed`,
    timestamp: new Date().toISOString()
  });
});

// 9. Phone Number Intelligence
app.post('/api/prove/phone/intelligence', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required'
    });
  }

  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock phone intelligence data
  const isPortable = phone.includes('555');
  const portingHistory = isPortable ? [
    { date: '2023-01-15', fromCarrier: 'Verizon', toCarrier: 'AT&T' }
  ] : [];

  res.json({
    success: true,
    phone: phone,
    carrier: {
      name: 'Nantucket Maritime Communications',
      type: 'mobile',
      country: 'US',
      region: 'Massachusetts'
    },
    lineType: 'mobile',
    isPortable: isPortable,
    portingHistory: portingHistory,
    riskIndicators: {
      simSwapRisk: phone.includes('123') ? 'low' : 'medium',
      accountTakeoverRisk: 'low',
      syntheticIdentityRisk: 'low'
    },
    metadata: {
      firstSeen: '2020-01-01',
      lastVerified: new Date().toISOString(),
      reputationScore: phone.includes('555') ? 85 : 65
    },
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel serverless functions
// Vercel will use this as the handler
module.exports = app;

// Only start server if running locally (not on Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Prove AI POC server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Frontend: http://localhost:${PORT}`);
    console.log(`\n📡 API Endpoints:`);
    console.log(`  - Identity V2: POST /api/prove/identity/v2`);
    console.log(`  - SMS OTP Send: POST /api/prove/sms/send-otp`);
    console.log(`  - SMS OTP Verify: POST /api/prove/sms/verify-otp`);
    console.log(`  - Trust Score: POST /api/prove/trust-score`);
    console.log(`  - Phone Auth: POST /api/prove/phone/authenticate`);
    console.log(`  - Selfie Compare: POST /api/prove/selfie/compare`);
    console.log(`  - Liveness Check: POST /api/prove/selfie/liveness`);
    console.log(`  - KBA Generate: POST /api/prove/kba/generate`);
    console.log(`  - KBA Verify: POST /api/prove/kba/verify`);
    console.log(`  - Credential Analysis: POST /api/prove/credential/analyze`);
    console.log(`  - AAMVA Check: POST /api/prove/aamva/verify`);
    console.log(`  - MFA Initiate: POST /api/prove/mfa/initiate`);
    console.log(`  - MFA Verify: POST /api/prove/mfa/verify`);
    console.log(`  - Phone Intelligence: POST /api/prove/phone/intelligence`);
  });
}

