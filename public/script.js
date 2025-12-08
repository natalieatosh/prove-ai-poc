// Prove Identity V2 Pre-fill POC

document.addEventListener('DOMContentLoaded', () => {
    const prefillBtn = document.getElementById('prefillBtn');
    const form = document.getElementById('userForm');
    const phoneInput = document.getElementById('phone');

    prefillBtn.addEventListener('click', handlePreFill);
    form.addEventListener('submit', handleFormSubmit);
});

async function handlePreFill() {
    const phoneInput = document.getElementById('phone');
    const phone = phoneInput.value.trim();
    const prefillBtn = document.getElementById('prefillBtn');

    if (!phone) {
        showStatus('Please enter a phone number first', 'error');
        phoneInput.focus();
        return;
    }

    // Disable button and show loading
    prefillBtn.disabled = true;
    const originalText = prefillBtn.innerHTML;
    prefillBtn.innerHTML = '<span class="loading"></span> Verifying Identity...';

    try {
        showStatus('Verifying identity with Prove.com...', 'info');

        // Call Prove Identity V2 API
        const response = await fetch('/api/prove/identity/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone: phone })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Pre-fill the form with verified data (Captain Ahab)
            fillForm(data.userData);
            showStatus('🐋 Ahoy! Captain Ahab\'s identity verified! Form pre-filled with whaling credentials.', 'success');
        } else {
            showStatus(`❌ ${data.message || 'Identity verification failed'}`, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showStatus('❌ Error connecting to Prove API. Please try again.', 'error');
    } finally {
        // Re-enable button
        prefillBtn.disabled = false;
        prefillBtn.innerHTML = originalText;
    }
}

function fillForm(userData) {
    // Fill form fields with verified data (Captain Ahab's information)
    if (userData.firstName) document.getElementById('firstName').value = userData.firstName;
    if (userData.lastName) document.getElementById('lastName').value = userData.lastName;
    if (userData.email) document.getElementById('email').value = userData.email;
    if (userData.address) document.getElementById('address').value = userData.address;
    if (userData.city) document.getElementById('city').value = userData.city;
    if (userData.state) document.getElementById('state').value = userData.state;
    if (userData.zipCode) document.getElementById('zipCode').value = userData.zipCode;
    if (userData.dateOfBirth) document.getElementById('dateOfBirth').value = userData.dateOfBirth;
    if (userData.ssn) document.getElementById('ssn').value = userData.ssn;
    if (userData.occupation) {
        const occupationField = document.getElementById('occupation');
        if (occupationField) occupationField.value = userData.occupation;
    }
    if (userData.vessel) {
        const vesselField = document.getElementById('vessel');
        if (vesselField) vesselField.value = userData.vessel;
    }

    // Highlight filled fields with a whale-themed color
    const filledInputs = document.querySelectorAll('.form-group input[value]');
    filledInputs.forEach(input => {
        if (input.value) {
            input.style.backgroundColor = '#e3f2fd';
            input.style.borderColor = '#2196f3';
            setTimeout(() => {
                input.style.backgroundColor = '';
                input.style.borderColor = '';
            }, 2000);
        }
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    console.log('Form submitted:', data);
    showStatus('✅ Form submitted successfully!', 'success');
    
    // In a real application, you would send this data to your backend
    // fetch('/api/submit', { method: 'POST', body: JSON.stringify(data) });
}

function clearForm() {
    document.getElementById('userForm').reset();
    hideStatus();
}

function showStatus(message, type) {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
    statusEl.style.display = 'block';
}

function hideStatus() {
    document.getElementById('statusMessage').style.display = 'none';
}

// Modal functions
function openVesselModal() {
    const modal = document.getElementById('vesselModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeVesselModal() {
    const modal = document.getElementById('vesselModal');
    modal.classList.remove('show');
    document.body.style.overflow = ''; // Restore scrolling
}

function talkToExpert() {
    // Start a Glance cobrowse session
    try {
        if (typeof GLANCE !== 'undefined' && GLANCE.Cobrowse && GLANCE.Cobrowse.Visitor) {
            GLANCE.Cobrowse.Visitor.startSession("GLANCE_KEYTYPE_RANDOM");
            closeVesselModal();
            showStatus('🔗 Starting Glance cobrowse session with an expert...', 'info');
        } else {
            // Fallback if Glance script hasn't loaded yet
            showStatus('⏳ Loading Glance cobrowse... Please try again in a moment.', 'info');
            setTimeout(() => {
                if (typeof GLANCE !== 'undefined' && GLANCE.Cobrowse && GLANCE.Cobrowse.Visitor) {
                    GLANCE.Cobrowse.Visitor.startSession("GLANCE_KEYTYPE_RANDOM");
                    closeVesselModal();
                    showStatus('🔗 Starting Glance cobrowse session with an expert...', 'info');
                } else {
                    showStatus('❌ Glance cobrowse is not available. Please refresh the page and try again.', 'error');
                }
            }, 1000);
        }
    } catch (error) {
        console.error('Error starting Glance session:', error);
        showStatus('❌ Error starting cobrowse session. Please try again.', 'error');
    }
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('vesselModal');
    if (event.target === modal) {
        closeVesselModal();
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeVesselModal();
    }
});

// ============================================
// PROVE FEATURE IMPLEMENTATIONS
// ============================================

// 1. SMS Authentication / OTP
let otpSessionId = null;

async function sendOTP() {
    const phone = document.getElementById('otpPhone').value.trim();
    const resultDiv = document.getElementById('otpResult');
    
    if (!phone) {
        resultDiv.innerHTML = '<div class="error-text">Please enter a phone number</div>';
        return;
    }

    resultDiv.innerHTML = '<div class="info-text">Sending OTP...</div>';

    try {
        const response = await fetch('/api/prove/sms/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            otpSessionId = data.sessionId;
            document.getElementById('otpCode').style.display = 'block';
            document.getElementById('verifyOtpBtn').style.display = 'block';
            resultDiv.innerHTML = `
                <div class="success-text">
                    ✅ OTP sent! Code expires in ${data.expiresIn} seconds.<br>
                    <small>Demo: OTP code is ${data.otpCode}</small>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `<div class="error-text">❌ ${data.message}</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = '<div class="error-text">❌ Error sending OTP</div>';
    }
}

async function verifyOTP() {
    const phone = document.getElementById('otpPhone').value.trim();
    const otp = document.getElementById('otpCode').value.trim();
    const resultDiv = document.getElementById('otpResult');

    if (!otp) {
        resultDiv.innerHTML = '<div class="error-text">Please enter the OTP code</div>';
        return;
    }

    resultDiv.innerHTML = '<div class="info-text">Verifying OTP...</div>';

    try {
        const response = await fetch('/api/prove/sms/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, otp, sessionId: otpSessionId })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            resultDiv.innerHTML = `<div class="success-text">✅ ${data.message}</div>`;
        } else {
            resultDiv.innerHTML = `<div class="error-text">❌ ${data.message}</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = '<div class="error-text">❌ Error verifying OTP</div>';
    }
}

// 2. Trust Score
async function getTrustScore() {
    const phone = document.getElementById('trustScorePhone').value.trim();
    const resultDiv = document.getElementById('trustScoreResult');

    if (!phone) {
        resultDiv.innerHTML = '<div class="error-text">Please enter a phone number</div>';
        return;
    }

    resultDiv.innerHTML = '<div class="info-text">Calculating trust score...</div>';

    try {
        const response = await fetch('/api/prove/trust-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            const riskColor = data.riskLevel === 'low' ? '#4caf50' : data.riskLevel === 'medium' ? '#ff9800' : '#f44336';
            resultDiv.innerHTML = `
                <div class="success-text">
                    <strong>Trust Score: ${data.trustScore}/100</strong><br>
                    <span style="color: ${riskColor}">Risk Level: ${data.riskLevel.toUpperCase()}</span><br>
                    ${data.riskFactors.length > 0 ? `<br>Risk Factors:<br>${data.riskFactors.map(f => `• ${f}`).join('<br>')}` : ''}
                    <br>Recommendations: ${data.recommendations.join(', ')}
                </div>
            `;
        } else {
            resultDiv.innerHTML = `<div class="error-text">❌ ${data.message}</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = '<div class="error-text">❌ Error getting trust score</div>';
    }
}

// 3. Phone Authentication
async function authenticatePhone() {
    const phone = document.getElementById('phoneAuthPhone').value.trim();
    const resultDiv = document.getElementById('phoneAuthResult');

    if (!phone) {
        resultDiv.innerHTML = '<div class="error-text">Please enter a phone number</div>';
        return;
    }

    resultDiv.innerHTML = '<div class="info-text">Authenticating phone...</div>';

    try {
        const response = await fetch('/api/prove/phone/authenticate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        });

        const data = await response.json();

        if (response.ok && data.success && data.authenticated) {
            resultDiv.innerHTML = `
                <div class="success-text">
                    ✅ ${data.message}<br>
                    Method: ${data.authenticationMethod}
                </div>
            `;
        } else {
            resultDiv.innerHTML = `<div class="error-text">❌ ${data.message}</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = '<div class="error-text">❌ Error authenticating phone</div>';
    }
}

// 4. Selfie Comparison + Liveness
async function checkLiveness() {
    const selfieFile = document.getElementById('selfieImage').files[0];
    const resultDiv = document.getElementById('selfieResult');

    if (!selfieFile) {
        resultDiv.innerHTML = '<div class="error-text">Please select a selfie image</div>';
        return;
    }

    resultDiv.innerHTML = '<div class="info-text">Checking liveness...</div>';

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const response = await fetch('/api/prove/selfie/liveness', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selfieImage: e.target.result })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const statusColor = data.isLive ? '#4caf50' : '#f44336';
                resultDiv.innerHTML = `
                    <div class="success-text">
                        <strong>Liveness Score: ${data.livenessScore}/100</strong><br>
                        <span style="color: ${statusColor}">Status: ${data.isLive ? '✅ LIVE' : '❌ NOT LIVE'}</span><br>
                        ${data.detectedThreats.length > 0 ? `<br>Threats: ${data.detectedThreats.join(', ')}` : ''}
                    </div>
                `;
            } else {
                resultDiv.innerHTML = `<div class="error-text">❌ ${data.message}</div>`;
            }
        } catch (error) {
            resultDiv.innerHTML = '<div class="error-text">❌ Error checking liveness</div>';
        }
    };
    reader.readAsDataURL(selfieFile);
}

async function compareSelfie() {
    const selfieFile = document.getElementById('selfieImage').files[0];
    const idFile = document.getElementById('idImage').files[0];
    const resultDiv = document.getElementById('selfieResult');

    if (!selfieFile || !idFile) {
        resultDiv.innerHTML = '<div class="error-text">Please select both selfie and ID images</div>';
        return;
    }

    resultDiv.innerHTML = '<div class="info-text">Comparing images...</div>';

    const reader1 = new FileReader();
    const reader2 = new FileReader();

    reader1.onload = async (e1) => {
        reader2.onload = async (e2) => {
            try {
                const response = await fetch('/api/prove/selfie/compare', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        selfieImage: e1.target.result,
                        idImage: e2.target.result
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    const verified = data.verified;
                    const statusColor = verified ? '#4caf50' : '#f44336';
                    resultDiv.innerHTML = `
                        <div class="success-text">
                            <strong>Match Score: ${data.matchScore}%</strong><br>
                            <strong>Liveness Score: ${data.livenessScore}%</strong><br>
                            <span style="color: ${statusColor}">
                                ${verified ? '✅ VERIFIED' : '❌ NOT VERIFIED'}
                            </span><br>
                            ${data.message}
                        </div>
                    `;
                } else {
                    resultDiv.innerHTML = `<div class="error-text">❌ ${data.message}</div>`;
                }
            } catch (error) {
                resultDiv.innerHTML = '<div class="error-text">❌ Error comparing images</div>';
            }
        };
        reader2.readAsDataURL(idFile);
    };
    reader1.readAsDataURL(selfieFile);
}

// 5. Knowledge-Based Authentication (KBA)
let kbaSessionId = null;
let kbaQuestions = null;

async function generateKBA() {
    const phone = document.getElementById('kbaPhone').value.trim();
    const questionsDiv = document.getElementById('kbaQuestions');
    const resultDiv = document.getElementById('kbaResult');

    if (!phone) {
        resultDiv.innerHTML = '<div class="error-text">Please enter a phone number</div>';
        return;
    }

    resultDiv.innerHTML = '<div class="info-text">Generating KBA questions...</div>';

    try {
        const response = await fetch('/api/prove/kba/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            kbaSessionId = data.sessionId;
            kbaQuestions = data.questions;
            
            let html = '<div class="kba-questions">';
            data.questions.forEach((q, index) => {
                html += `
                    <div class="kba-question">
                        <strong>Question ${index + 1}:</strong> ${q.question}<br>
                        ${q.options.map((opt, i) => `
                            <label><input type="radio" name="kba_${q.id}" value="${i}"> ${opt}</label><br>
                        `).join('')}
                    </div>
                `;
            });
            html += '<button onclick="verifyKBA()" class="btn-feature">Submit Answers</button></div>';
            
            questionsDiv.innerHTML = html;
            resultDiv.innerHTML = '<div class="success-text">✅ Questions generated. Please answer them.</div>';
        } else {
            resultDiv.innerHTML = `<div class="error-text">❌ ${data.message}</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = '<div class="error-text">❌ Error generating KBA questions</div>';
    }
}

async function verifyKBA() {
    const phone = document.getElementById('kbaPhone').value.trim();
    const resultDiv = document.getElementById('kbaResult');

    if (!kbaQuestions) {
        resultDiv.innerHTML = '<div class="error-text">Please generate questions first</div>';
        return;
    }

    const answers = {};
    kbaQuestions.forEach(q => {
        const selected = document.querySelector(`input[name="kba_${q.id}"]:checked`);
        if (selected) {
            answers[q.id] = parseInt(selected.value);
        }
    });

    resultDiv.innerHTML = '<div class="info-text">Verifying answers...</div>';

    try {
        const response = await fetch('/api/prove/kba/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, answers, sessionId: kbaSessionId })
        });

        const data = await response.json();

        if (response.ok && data.success && data.verified) {
            resultDiv.innerHTML = `
                <div class="success-text">
                    ✅ ${data.message}<br>
                    Correct: ${data.correctAnswers}/${data.totalQuestions}
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="error-text">
                    ❌ ${data.message}<br>
                    Correct: ${data.correctAnswers}/${data.totalQuestions}
                    ${data.attemptsRemaining !== undefined ? `<br>Attempts remaining: ${data.attemptsRemaining}` : ''}
                </div>
            `;
        }
    } catch (error) {
        resultDiv.innerHTML = '<div class="error-text">❌ Error verifying KBA</div>';
    }
}

// 6. Credential Analysis
async function analyzeCredential() {
    const idFile = document.getElementById('credentialImage').files[0];
    const idType = document.getElementById('idType').value;
    const resultDiv = document.getElementById('credentialResult');

    if (!idFile) {
        resultDiv.innerHTML = '<div class="error-text">Please select an ID image</div>';
        return;
    }

    resultDiv.innerHTML = '<div class="info-text">Analyzing credential...</div>';

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const response = await fetch('/api/prove/credential/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    idImage: e.target.result,
                    idType: idType
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const statusColor = data.isAuthentic ? '#4caf50' : '#f44336';
                let html = `
                    <div class="success-text">
                        <strong>Authenticity Score: ${data.authenticityScore}/100</strong><br>
                        <span style="color: ${statusColor}">Status: ${data.isAuthentic ? '✅ AUTHENTIC' : '❌ NOT AUTHENTIC'}</span><br>
                        ${data.detectedIssues.length > 0 ? `<br>Issues: ${data.detectedIssues.join(', ')}` : ''}
                        <br><strong>Extracted Data:</strong><br>
                        Name: ${data.extractedData.firstName} ${data.extractedData.lastName}<br>
                        DOB: ${data.extractedData.dateOfBirth}<br>
                        Address: ${data.extractedData.address}, ${data.extractedData.city}, ${data.extractedData.state} ${data.extractedData.zipCode}<br>
                        ${data.extractedData.licenseNumber ? `License: ${data.extractedData.licenseNumber}<br>` : ''}
                        <br><strong>Security Features:</strong><br>
                        ${Object.entries(data.securityFeatures).map(([k, v]) => `${k}: ${v}`).join('<br>')}
                    </div>
                `;
                resultDiv.innerHTML = html;
            } else {
                resultDiv.innerHTML = `<div class="error-text">❌ ${data.message}</div>`;
            }
        } catch (error) {
            resultDiv.innerHTML = '<div class="error-text">❌ Error analyzing credential</div>';
        }
    };
    reader.readAsDataURL(idFile);
}

// 7. AAMVA Check
async function verifyAAMVA() {
    const licenseNumber = document.getElementById('licenseNumber').value.trim();
    const state = document.getElementById('licenseState').value.trim();
    const dateOfBirth = document.getElementById('licenseDob').value;
    const resultDiv = document.getElementById('aamvaResult');

    if (!licenseNumber || !state) {
        resultDiv.innerHTML = '<div class="error-text">Please enter license number and state</div>';
        return;
    }

    resultDiv.innerHTML = '<div class="info-text">Verifying with DMV...</div>';

    try {
        const response = await fetch('/api/prove/aamva/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ licenseNumber, state, dateOfBirth })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            if (data.verified && data.dmvData) {
                let html = `
                    <div class="success-text">
                        ✅ ${data.message}<br>
                        <strong>DMV Status: ${data.dmvStatus.toUpperCase()}</strong><br><br>
                        <strong>License Information:</strong><br>
                        Name: ${data.dmvData.firstName} ${data.dmvData.lastName}<br>
                        DOB: ${data.dmvData.dateOfBirth}<br>
                        Address: ${data.dmvData.address}<br>
                        Class: ${data.dmvData.licenseClass}<br>
                        Expiration: ${data.dmvData.expirationDate}<br>
                        Restrictions: ${data.dmvData.restrictions}<br>
                        ${data.dmvData.endorsements ? `Endorsements: ${data.dmvData.endorsements.join(', ')}` : ''}
                    </div>
                `;
                resultDiv.innerHTML = html;
            } else {
                resultDiv.innerHTML = `<div class="error-text">❌ ${data.message}</div>`;
            }
        } else {
            resultDiv.innerHTML = `<div class="error-text">❌ ${data.message}</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = '<div class="error-text">❌ Error verifying with DMV</div>';
    }
}

// 8. Multi-Factor Authentication (MFA)
let mfaSessionId = null;

async function initiateMFA() {
    const phone = document.getElementById('mfaPhone').value.trim();
    const resultDiv = document.getElementById('mfaResult');

    if (!phone) {
        resultDiv.innerHTML = '<div class="error-text">Please enter a phone number</div>';
        return;
    }

    resultDiv.innerHTML = '<div class="info-text">Initiating MFA...</div>';

    try {
        const response = await fetch('/api/prove/mfa/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, methods: ['sms', 'phone_auth', 'trust_score'] })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            mfaSessionId = data.mfaSessionId;
            resultDiv.innerHTML = `
                <div class="success-text">
                    ✅ MFA session initiated<br>
                    Methods: ${data.methods.join(', ')}<br>
                    Required: ${data.requiredMethods} method(s)
                </div>
            `;
        } else {
            resultDiv.innerHTML = `<div class="error-text">❌ ${data.message}</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = '<div class="error-text">❌ Error initiating MFA</div>';
    }
}

// 9. Phone Number Intelligence
async function getPhoneIntelligence() {
    const phone = document.getElementById('intelPhone').value.trim();
    const resultDiv = document.getElementById('intelResult');

    if (!phone) {
        resultDiv.innerHTML = '<div class="error-text">Please enter a phone number</div>';
        return;
    }

    resultDiv.innerHTML = '<div class="info-text">Gathering phone intelligence...</div>';

    try {
        const response = await fetch('/api/prove/phone/intelligence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            let html = `
                <div class="success-text">
                    <strong>Carrier Information:</strong><br>
                    Name: ${data.carrier.name}<br>
                    Type: ${data.carrier.type}<br>
                    Region: ${data.carrier.region}, ${data.carrier.country}<br><br>
                    <strong>Line Type:</strong> ${data.lineType}<br>
                    <strong>Portable:</strong> ${data.isPortable ? 'Yes' : 'No'}<br>
                    ${data.portingHistory.length > 0 ? `<br><strong>Porting History:</strong><br>${data.portingHistory.map(p => `${p.date}: ${p.fromCarrier} → ${p.toCarrier}`).join('<br>')}` : ''}
                    <br><strong>Risk Indicators:</strong><br>
                    SIM Swap Risk: ${data.riskIndicators.simSwapRisk}<br>
                    Account Takeover Risk: ${data.riskIndicators.accountTakeoverRisk}<br>
                    Synthetic Identity Risk: ${data.riskIndicators.syntheticIdentityRisk}<br>
                    <br><strong>Metadata:</strong><br>
                    First Seen: ${data.metadata.firstSeen}<br>
                    Reputation Score: ${data.metadata.reputationScore}/100
                </div>
            `;
            resultDiv.innerHTML = html;
        } else {
            resultDiv.innerHTML = `<div class="error-text">❌ ${data.message}</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = '<div class="error-text">❌ Error getting phone intelligence</div>';
    }
}

