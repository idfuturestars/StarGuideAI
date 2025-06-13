/**
 * IDFS StarGuide - Authentication Module
 * Handles user authentication (Demo, Firebase)
 */

window.StarGuideAuth = {
    isSignUp: false,

    // Initialize auth module
    init() {
        this.setupEventListeners();
    },

    // Setup event listeners
    setupEventListeners() {
        // Auth form
        const authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.addEventListener('submit', (e) => this.handleAuthSubmit(e));
        }

        // Auth mode toggle
        const authSwitchLink = document.getElementById('authSwitchLink');
        if (authSwitchLink) {
            authSwitchLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAuthMode();
            });
        }

        // Demo mode button
        const demoModeBtn = document.getElementById('demoModeBtn');
        if (demoModeBtn) {
            demoModeBtn.addEventListener('click', () => this.startDemoMode());
        }

        // Clear errors on input
        ['emailInput', 'passwordInput'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => this.clearAuthError());
            }
        });
    },

    // Toggle auth mode
    toggleAuthMode() {
        this.isSignUp = !this.isSignUp;

        document.getElementById('authTitle').textContent = this.isSignUp ? 'Create Account' : 'Welcome Back';
        document.getElementById('authButtonText').textContent = this.isSignUp ? 'Sign Up' : 'Sign In';
        document.getElementById('authSwitchText').textContent = this.isSignUp ? 'Already have an account?' : "Don't have an account?";
        document.getElementById('authSwitchLink').textContent = this.isSignUp ? 'Sign In' : 'Sign Up';

        this.clearAuthError();
    },

    // Handle auth form submission
    async handleAuthSubmit(event) {
        event.preventDefault();
        this.clearAuthError();

        const email = document.getElementById('emailInput').value.trim();
        const password = document.getElementById('passwordInput').value.trim();

        // Validation
        if (!email || !password) {
            this.showAuthError('Please fill in all fields');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showAuthError('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            this.showAuthError('Password must be at least 6 characters');
            return;
        }

        // Show loading state
        const submitBtn = document.getElementById('authSubmitBtn');
        const buttonText = document.getElementById('authButtonText');
        submitBtn.disabled = true;
        buttonText.textContent = this.isSignUp ? 'Creating Account...' : 'Signing In...';

        try {
            if (StarGuideApp.state.firebase.auth) {
                // Firebase authentication
                if (this.isSignUp) {
                    await StarGuideApp.state.firebase.auth.createUserWithEmailAndPassword(email, password);
                    window.StarGuideUtils.showNotification('🎉 Account created successfully!', 'success');
                } else {
                    await StarGuideApp.state.firebase.auth.signInWithEmailAndPassword(email, password);
                    window.StarGuideUtils.showNotification('👋 Welcome back!', 'success');
                }
            } else {
                // No Firebase - use demo mode
                this.showAuthError('Firebase not available. Please use Demo Mode.');
                this.resetAuthButton();
            }
        } catch (error) {
            this.handleAuthError(error);
            this.resetAuthButton();
        }
    },

    // Start demo mode
    startDemoMode() {
        console.log('Starting demo mode...');

        const demoUser = {
            uid: 'demo-' + Date.now(),
            email: 'demo@starguide.com',
            displayName: 'Demo User ' + Math.floor(Math.random() * 1000),
            isDemo: true
        };

        const demoProfile = {
            displayName: demoUser.displayName,
            email: demoUser.email,
            level: 1,
            xp: 0,
            streak: 0,
            credits: 100,
            achievements: [],
            assessments: [],
            battles: [],
            joinDate: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem('starguide_demo_user', JSON.stringify(demoUser));
        localStorage.setItem('starguide_demo_profile', JSON.stringify(demoProfile));

        // Update app state
        StarGuideApp.state.user = demoUser;
        StarGuideApp.state.isDemo = true;
        StarGuideApp.profile = demoProfile;

        window.StarGuideUtils.showNotification('🚀 Welcome to StarGuide Demo Mode!', 'success');
        
        // Check if profile setup is needed
        setTimeout(() => {
            if (window.StarGuideProfileSetup) {
                window.StarGuideProfileSetup.init();
                
                // Only show main app if profile is complete
                if (window.StarGuideProfileSetup.isComplete) {
                    StarGuideApp.showMainApp();
                }
            } else {
                StarGuideApp.showMainApp();
            }
        }, 500);
    },

    // Handle auth errors
    handleAuthError(error) {
        let userMessage = 'Authentication failed. Please try again.';

        switch (error.code) {
            case 'auth/user-not-found':
                userMessage = 'No account found with this email. Please sign up first.';
                break;
            case 'auth/wrong-password':
                userMessage = 'Incorrect password. Please try again.';
                break;
            case 'auth/email-already-in-use':
                userMessage = 'An account with this email already exists. Please sign in instead.';
                break;
            case 'auth/weak-password':
                userMessage = 'Password is too weak. Please use at least 6 characters.';
                break;
            case 'auth/invalid-email':
                userMessage = 'Invalid email address. Please check and try again.';
                break;
            case 'auth/too-many-requests':
                userMessage = 'Too many failed attempts. Please wait a moment and try again.';
                break;
            case 'auth/network-request-failed':
                userMessage = 'Network error. Please check your connection and try again.';
                break;
            default:
                userMessage = error.message || 'Authentication failed. Please try again.';
        }

        this.showAuthError(userMessage);
    },

    // Show auth error
    showAuthError(message) {
        const errorDiv = document.getElementById('authError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
            setTimeout(() => {
                errorDiv.classList.add('hidden');
            }, 5000);
        }
    },

    // Clear auth error
    clearAuthError() {
        const errorDiv = document.getElementById('authError');
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
    },

    // Reset auth button
    resetAuthButton() {
        const submitBtn = document.getElementById('authSubmitBtn');
        const buttonText = document.getElementById('authButtonText');
        
        if (submitBtn) submitBtn.disabled = false;
        if (buttonText) buttonText.textContent = this.isSignUp ? 'Sign Up' : 'Sign In';
    }
};

// Initialize auth module
StarGuideAuth.init();