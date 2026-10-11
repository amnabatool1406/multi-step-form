let currentStep = 1;
const totalSteps = 4;

const formSteps = document.querySelectorAll('.form-step');
const stepIndicators = document.querySelectorAll('.step-indicator');
const progressBar = document.getElementById('progressBar');
const form = document.getElementById('multiStepForm');

// 1. Load saved data from localStorage on startup (Autosave feature)
window.addEventListener('DOMContentLoaded', () => {
    const savedData = JSON.parse(localStorage.getItem('multiStepFormData'));
    if (savedData) {
        for (let key in savedData) {
            const input = form.elements[key];
            if (input) {
                input.value = savedData[key];
            }
        }
    }
});

// 2. Autosave input changes to localStorage automatically
form.addEventListener('input', (e) => {
    const formData = new FormData(form);
    const dataObj = Object.fromEntries(formData.entries());
    localStorage.setItem('multiStepFormData', JSON.stringify(dataObj));
});

function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            currentStep++;
            if (currentStep === 4) {
                generateSummary();
            }
            updateFormUI();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateFormUI();
    }
}

function updateFormUI() {
    // Show/Hide form steps
    formSteps.forEach((step, index) => {
        if (index + 1 === currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });

    // Update Progress Bar & Indicators
    stepIndicators.forEach((indicator, index) => {
        const stepNum = index + 1;
        if (stepNum < currentStep) {
            indicator.classList.add('completed');
            indicator.classList.remove('active');
            indicator.textContent = '✓';
        } else if (stepNum === currentStep) {
            indicator.classList.add('active');
            indicator.classList.remove('completed');
            indicator.textContent = stepNum;
        } else {
            indicator.classList.remove('active', 'completed');
            indicator.textContent = stepNum;
        }
    });

    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}

// Minimal Show/Hide Password Toggle Function
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePasswordBtn');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = 'Hide';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = 'Show';
    }
}

// Field Validation Logic
function validateCurrentStep() {
    const activeStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const inputs = activeStepElement.querySelectorAll('input[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        const errorMsg = input.parentElement.querySelector('.error-msg') || input.closest('.form-group').querySelector('.error-msg');
        
        if (!input.value.trim()) {
            input.classList.add('error');
            if (errorMsg) errorMsg.textContent = 'This field is required.';
            isValid = false;
        } else {
            // Email Validation Rule
            if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    input.classList.add('error');
                    if (errorMsg) errorMsg.textContent = 'Please enter a valid email address.';
                    isValid = false;
                    return;
                }
            }

            // Password Validation Rule (Minimum 6 characters)
            if (input.id === 'password') {
                if (input.value.length < 6) {
                    input.classList.add('error');
                    if (errorMsg) errorMsg.textContent = 'Password must be at least 6 characters.';
                    isValid = false;
                    return;
                }
            }

            input.classList.remove('error');
            if (errorMsg) errorMsg.textContent = '';
        }
    });

    return isValid;
}

// Generate Summary for Step 4 (Excluding password for security)
function generateSummary() {
    const summaryContainer = document.getElementById('summaryContent');
    const formData = new FormData(form);
    
    let html = '';
    const labels = {
        fullName: 'Full Name',
        email: 'Email Address',
        username: 'Username',
        role: 'Primary Role',
        bio: 'Short Bio'
    };

    for (let [key, value] of formData.entries()) {
        if (key === 'password') continue;
        if (value.trim() !== '') {
            html += `
                <div class="summary-item">
                    <span class="summary-label">${labels[key] || key}:</span>
                    <span class="summary-value">${escapeHTML(value)}</span>
                </div>
            `;
        }
    }
    summaryContainer.innerHTML = html;
}

// Prevent XSS injection for dynamic summary values
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Form Submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    localStorage.removeItem('multiStepFormData');

    form.style.display = 'none';
    document.querySelector('.progress-bar-container').style.display = 'none';
    document.getElementById('successMessage').style.display = 'block';
});

// Reset Form to initial state
function resetForm() {
    form.reset();
    localStorage.removeItem('multiStepFormData');
    currentStep = 1;
    document.getElementById('successMessage').style.display = 'none';
    form.style.display = 'block';
    document.querySelector('.progress-bar-container').style.display = 'block';
    updateFormUI();
}