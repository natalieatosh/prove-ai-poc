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

