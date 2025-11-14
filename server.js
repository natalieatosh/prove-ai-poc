const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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

app.listen(PORT, () => {
  console.log(`Prove AI POC server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API Endpoint: http://localhost:${PORT}/api/prove/identity/v2`);
});

