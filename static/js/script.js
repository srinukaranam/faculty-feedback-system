// scripts.js - Client-side functionality for Faculty Feedback System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations and event listeners
    initHoverEffects();
    initFormValidations();
    initFeedbackFilters();
    initMobileMenu();
    initPasswordVisibilityToggles();
});

// Initialize hover effects for interactive elements
function initHoverEffects() {
    const hoverElements = document.querySelectorAll('.hover-scale, .smooth-transition');
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.classList.add('transform', 'transition-all');
        });
        element.addEventListener('mouseleave', () => {
            element.classList.remove('transform', 'transition-all');
        });
    });
}

// Form validations for all forms
function initFormValidations() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('border-red-500');
                    input.nextElementSibling?.classList.remove('hidden');
                } else {
                    input.classList.remove('border-red-500');
                    input.nextElementSibling?.classList.add('hidden');
                }
            });

            // Special validation for email fields
            const emailInputs = form.querySelectorAll('input[type="email"]');
            emailInputs.forEach(input => {
                if (!isValidEmail(input.value)) {
                    isValid = false;
                    input.classList.add('border-red-500');
                    const errorMsg = input.nextElementSibling || createErrorElement(input, 'Please enter a valid email address');
                    errorMsg.classList.remove('hidden');
                }
            });

            // Special validation for password fields
            const passwordInputs = form.querySelectorAll('input[type="password"]');
            passwordInputs.forEach(input => {
                if (input.value.length < 6) {
                    isValid = false;
                    input.classList.add('border-red-500');
                    const errorMsg = input.nextElementSibling || createErrorElement(input, 'Password must be at least 6 characters');
                    errorMsg.classList.remove('hidden');
                }
            });

            if (!isValid) {
                e.preventDefault();
                // Scroll to first error
                const firstError = form.querySelector('.border-red-500');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    });
}

// Initialize feedback filters (for faculty and admin dashboards)
function initFeedbackFilters() {
    const filterForms = document.querySelectorAll('.feedback-filter-form');
    filterForms.forEach(form => {
        form.addEventListener('change', function() {
            this.submit();
        });
    });
}

// Mobile menu toggle for responsive design
function initMobileMenu() {
    const menuButton = document.querySelector('.mobile-menu-button');
    const menu = document.querySelector('.mobile-menu');
    
    if (menuButton && menu) {
        menuButton.addEventListener('click', function() {
            menu.classList.toggle('hidden');
        });
    }
}

// Toggle password visibility
function initPasswordVisibilityToggles() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>';
            } else {
                input.type = 'password';
                this.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>';
            }
        });
    });
}

// Helper function to validate email format
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Helper function to create error message elements
function createErrorElement(input, message) {
    const errorElement = document.createElement('p');
    errorElement.className = 'mt-1 text-sm text-red-600 hidden';
    errorElement.textContent = message;
    input.parentNode.insertBefore(errorElement, input.nextSibling);
    return errorElement;
}

// Toast notification for flash messages
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-md shadow-lg text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Auto-hide flash messages after 5 seconds
const flashMessages = document.querySelectorAll('.bg-green-100, .bg-red-100');
flashMessages.forEach(message => {
    setTimeout(() => {
        message.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => {
            message.remove();
        }, 300);
    }, 5000);
});

// Dynamic subject suggestions based on faculty selection (for student dashboard)
const facultySelect = document.getElementById('faculty_id');
const subjectInput = document.getElementById('subject');

if (facultySelect && subjectInput) {
    facultySelect.addEventListener('change', async function() {
        const facultyId = this.value;
        if (facultyId) {
            try {
                const response = await fetch(`/api/faculty/${facultyId}/subjects`);
                const data = await response.json();
                
                // Create datalist for subject suggestions
                let datalist = document.getElementById('subject-suggestions');
                if (!datalist) {
                    datalist = document.createElement('datalist');
                    datalist.id = 'subject-suggestions';
                    subjectInput.parentNode.appendChild(datalist);
                    subjectInput.setAttribute('list', 'subject-suggestions');
                }
                
                // Clear previous options
                datalist.innerHTML = '';
                
                // Add new options
                data.subjects.forEach(subject => {
                    const option = document.createElement('option');
                    option.value = subject;
                    datalist.appendChild(option);
                });
            } catch (error) {
                console.error('Error fetching faculty subjects:', error);
            }
        }
    });
}