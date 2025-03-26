// Authentication module with API integration
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const authContainer = document.getElementById('auth-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.querySelector('[data-tab="login"]');
    const registerTab = document.querySelector('[data-tab="register"]');
    const loginFormDiv = document.getElementById('login-form');
    const registerFormDiv = document.getElementById('register-form');
    const registerRoleSelect = document.getElementById('register-role');
    const doctorFields = document.getElementById('doctor-fields');
    
    // API Base URL
    const API_BASE_URL = 'http://localhost:5000/api/v1';
    
    // Tab switching
    loginTab.addEventListener('click', function() {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginFormDiv.classList.add('active');
        registerFormDiv.classList.remove('active');
    });
    
    registerTab.addEventListener('click', function() {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerFormDiv.classList.add('active');
        loginFormDiv.classList.remove('active');
    });
    
    // Show/hide doctor fields based on role selection
    registerRoleSelect.addEventListener('change', function() {
        if (this.value === 'doctor') {
            doctorFields.style.display = 'block';
        } else {
            doctorFields.style.display = 'none';
        }
    });
    
    // Login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const role = document.getElementById('login-role').value;
        
        // Basic validation
        if (!email || !password || !role) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, role })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }
            
            // Login successful
            showNotification('Login successful', 'success');
            
            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Hide auth container, show dashboard
            authContainer.style.display = 'none';
            dashboardContainer.style.display = 'block';
            
            // Initialize dashboard based on user role
            initializeDashboard(data.user);
        } catch (error) {
            showNotification(error.message || 'Invalid email or password', 'error');
        }
    });
    
    // Register form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const role = document.getElementById('register-role').value;
        const specialization = document.getElementById('register-specialization')?.value.trim();
        
        // Basic validation
        if (!name || !email || !password || !role) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        if (!isValidPassword(password)) {
            showNotification('Password must be at least 6 characters', 'error');
            return;
        }
        
        try {
            const registerData = {
                name,
                email,
                password,
                role
            };
            
            if (role === 'doctor') {
                registerData.specialization = specialization;
            }
            
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }
            
            showNotification('Registration successful! Please login.', 'success');
            
            // Switch to login tab
            loginTab.click();
            document.getElementById('login-email').value = email;
            document.getElementById('login-role').value = role;
        } catch (error) {
            showNotification(error.message || 'Registration failed', 'error');
        }
    });
    
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token && user) {
        // Verify token and get fresh user data
        verifyTokenAndInitialize(token, user);
    }
});

async function verifyTokenAndInitialize(token, user) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error('Session expired');
        }
        
        // Update user data
        localStorage.setItem('user', JSON.stringify(data.data));
        
        // Initialize dashboard
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('dashboard-container').style.display = 'block';
        initializeDashboard(data.data);
    } catch (error) {
        // Clear invalid token and user data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showNotification('Please login again', 'error');
    }
}

// Initialize dashboard based on user role
function initializeDashboard(user) {
    // Set user greeting
    document.getElementById('user-greeting').textContent = `Welcome, ${user.name}`;
    
    // Set dashboard title based on role
    let dashboardTitle = 'Hospital Management System';
    if (user.role === 'admin') dashboardTitle += ' - Admin Panel';
    else if (user.role === 'doctor') dashboardTitle += ' - Doctor Portal';
    else if (user.role === 'patient') dashboardTitle += ' - Patient Portal';
    
    document.getElementById('dashboard-title').textContent = dashboardTitle;
    
    // Load sidebar menu based on role
    loadSidebarMenu(user.role);
    
    // Set up logout button
    document.getElementById('logout-btn').addEventListener('click', function() {
        logoutUser();
    });
}

async function logoutUser() {
    try {
        const token = localStorage.getItem('token');
        
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Reload the page
        window.location.reload();
    } catch (error) {
        console.error('Logout error:', error);
        // Still clear local storage and reload
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    }
}