
/**
 * IDFS StarGuide - Profile Setup Module
 * First-time user onboarding and profile completion
 */

window.StarGuideProfileSetup = {
    isComplete: false,
    currentStep: 1,
    totalSteps: 4,
    
    // Initialize profile setup
    init() {
        console.log('Profile Setup initialized');
        this.checkProfileStatus();
    },

    // Check if profile setup is needed
    checkProfileStatus() {
        // Check if user has completed profile setup
        const profileComplete = localStorage.getItem('profile_complete');
        const user = StarGuideApp.state.user;
        
        if (!profileComplete && user) {
            this.showProfileSetup();
        } else {
            this.isComplete = true;
        }
    },

    // Show profile setup overlay
    showProfileSetup() {
        const overlay = document.createElement('div');
        overlay.id = 'profile-setup-overlay';
        overlay.className = 'profile-setup-overlay';
        overlay.innerHTML = this.getProfileSetupHTML();
        
        document.body.appendChild(overlay);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Show first step
        this.showStep(1);
    },

    // Get profile setup HTML
    getProfileSetupHTML() {
        return `
            <div class="profile-setup-modal">
                <div class="profile-setup-header">
                    <h2>🚀 Welcome to StarGuide!</h2>
                    <p>Let's set up your learning profile</p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 25%"></div>
                    </div>
                    <div class="step-indicator">Step 1 of 4</div>
                </div>
                
                <div class="profile-setup-content">
                    <!-- Step 1: Basic Info -->
                    <div class="setup-step" id="step-1">
                        <h3>📝 Tell us about yourself</h3>
                        <div class="form-group">
                            <label for="display-name">Display Name</label>
                            <input type="text" id="display-name" placeholder="How should we call you?" maxlength="50">
                        </div>
                        <div class="form-group">
                            <label for="bio">Short Bio (Optional)</label>
                            <textarea id="bio" placeholder="Tell us a bit about yourself..." maxlength="200"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="avatar">Choose an Avatar</label>
                            <div class="avatar-grid">
                                <div class="avatar-option" data-avatar="🧑‍💻">🧑‍💻</div>
                                <div class="avatar-option" data-avatar="👩‍🚀">👩‍🚀</div>
                                <div class="avatar-option" data-avatar="🧑‍🎓">🧑‍🎓</div>
                                <div class="avatar-option" data-avatar="👨‍🔬">👨‍🔬</div>
                                <div class="avatar-option" data-avatar="👩‍💼">👩‍💼</div>
                                <div class="avatar-option" data-avatar="🧑‍🎨">🧑‍🎨</div>
                            </div>
                            <input type="hidden" id="selected-avatar" value="🧑‍💻">
                        </div>
                    </div>

                    <!-- Step 2: Learning Goals -->
                    <div class="setup-step hidden" id="step-2">
                        <h3>🎯 What are your learning goals?</h3>
                        <div class="goal-grid">
                            <div class="goal-option" data-goal="career-change">
                                <div class="goal-icon">💼</div>
                                <h4>Career Change</h4>
                                <p>Transition to tech industry</p>
                            </div>
                            <div class="goal-option" data-goal="skill-upgrade">
                                <div class="goal-icon">📈</div>
                                <h4>Skill Upgrade</h4>
                                <p>Improve current skills</p>
                            </div>
                            <div class="goal-option" data-goal="hobby-learning">
                                <div class="goal-icon">🎨</div>
                                <h4>Hobby Learning</h4>
                                <p>Learn for fun and curiosity</p>
                            </div>
                            <div class="goal-option" data-goal="academic">
                                <div class="goal-icon">🎓</div>
                                <h4>Academic</h4>
                                <p>Support school/university</p>
                            </div>
                        </div>
                        <input type="hidden" id="selected-goals">
                    </div>

                    <!-- Step 3: Tech Interests -->
                    <div class="setup-step hidden" id="step-3">
                        <h3>💻 Which technologies interest you?</h3>
                        <div class="tech-grid">
                            <div class="tech-option" data-tech="javascript">
                                <div class="tech-icon">🟨</div>
                                <span>JavaScript</span>
                            </div>
                            <div class="tech-option" data-tech="python">
                                <div class="tech-icon">🐍</div>
                                <span>Python</span>
                            </div>
                            <div class="tech-option" data-tech="react">
                                <div class="tech-icon">⚛️</div>
                                <span>React</span>
                            </div>
                            <div class="tech-option" data-tech="html-css">
                                <div class="tech-icon">🎨</div>
                                <span>HTML/CSS</span>
                            </div>
                            <div class="tech-option" data-tech="nodejs">
                                <div class="tech-icon">🟢</div>
                                <span>Node.js</span>
                            </div>
                            <div class="tech-option" data-tech="databases">
                                <div class="tech-icon">🗄️</div>
                                <span>Databases</span>
                            </div>
                            <div class="tech-option" data-tech="mobile">
                                <div class="tech-icon">📱</div>
                                <span>Mobile Dev</span>
                            </div>
                            <div class="tech-option" data-tech="ai-ml">
                                <div class="tech-icon">🤖</div>
                                <span>AI/ML</span>
                            </div>
                        </div>
                        <input type="hidden" id="selected-tech">
                    </div>

                    <!-- Step 4: Learning Style -->
                    <div class="setup-step hidden" id="step-4">
                        <h3>🎭 How do you prefer to learn?</h3>
                        <div class="learning-style-grid">
                            <div class="style-option" data-style="hands-on">
                                <div class="style-icon">🛠️</div>
                                <h4>Hands-on</h4>
                                <p>Learn by doing projects</p>
                            </div>
                            <div class="style-option" data-style="structured">
                                <div class="style-icon">📚</div>
                                <h4>Structured</h4>
                                <p>Step-by-step courses</p>
                            </div>
                            <div class="style-option" data-style="collaborative">
                                <div class="style-icon">👥</div>
                                <h4>Collaborative</h4>
                                <p>Learn with others</p>
                            </div>
                            <div class="style-option" data-style="competitive">
                                <div class="style-icon">🏆</div>
                                <h4>Competitive</h4>
                                <p>Challenges and battles</p>
                            </div>
                        </div>
                        <input type="hidden" id="selected-style">
                        
                        <div class="form-group">
                            <label for="daily-time">How much time can you dedicate daily?</label>
                            <select id="daily-time">
                                <option value="15-30">15-30 minutes</option>
                                <option value="30-60">30-60 minutes</option>
                                <option value="1-2">1-2 hours</option>
                                <option value="2+">2+ hours</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="profile-setup-footer">
                    <button id="prev-step" class="btn btn-secondary" disabled>Previous</button>
                    <button id="next-step" class="btn btn-primary">Next</button>
                    <button id="complete-setup" class="btn btn-success hidden">Complete Setup</button>
                </div>
            </div>
        `;
    },

    // Setup event listeners
    setupEventListeners() {
        // Navigation buttons
        document.getElementById('prev-step').addEventListener('click', () => this.previousStep());
        document.getElementById('next-step').addEventListener('click', () => this.nextStep());
        document.getElementById('complete-setup').addEventListener('click', () => this.completeSetup());

        // Avatar selection
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectAvatar(e.target.dataset.avatar));
        });

        // Goal selection
        document.querySelectorAll('.goal-option').forEach(option => {
            option.addEventListener('click', (e) => this.toggleGoal(e.currentTarget.dataset.goal));
        });

        // Tech selection
        document.querySelectorAll('.tech-option').forEach(option => {
            option.addEventListener('click', (e) => this.toggleTech(e.currentTarget.dataset.tech));
        });

        // Learning style selection
        document.querySelectorAll('.style-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectLearningStyle(e.currentTarget.dataset.style));
        });
    },

    // Show specific step
    showStep(step) {
        // Hide all steps
        document.querySelectorAll('.setup-step').forEach(s => s.classList.add('hidden'));
        
        // Show current step
        document.getElementById(`step-${step}`).classList.remove('hidden');
        
        // Update progress
        const progress = (step / this.totalSteps) * 100;
        document.querySelector('.progress-fill').style.width = `${progress}%`;
        document.querySelector('.step-indicator').textContent = `Step ${step} of ${this.totalSteps}`;
        
        // Update buttons
        document.getElementById('prev-step').disabled = step === 1;
        document.getElementById('next-step').classList.toggle('hidden', step === this.totalSteps);
        document.getElementById('complete-setup').classList.toggle('hidden', step !== this.totalSteps);
        
        this.currentStep = step;
    },

    // Navigate to next step
    nextStep() {
        if (this.validateCurrentStep() && this.currentStep < this.totalSteps) {
            this.showStep(this.currentStep + 1);
        }
    },

    // Navigate to previous step
    previousStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    },

    // Validate current step
    validateCurrentStep() {
        switch(this.currentStep) {
            case 1:
                const displayName = document.getElementById('display-name').value.trim();
                if (!displayName) {
                    this.showStepError('Please enter a display name');
                    return false;
                }
                break;
            case 2:
                const goals = document.getElementById('selected-goals').value;
                if (!goals) {
                    this.showStepError('Please select at least one learning goal');
                    return false;
                }
                break;
            case 3:
                const tech = document.getElementById('selected-tech').value;
                if (!tech) {
                    this.showStepError('Please select at least one technology');
                    return false;
                }
                break;
            case 4:
                const style = document.getElementById('selected-style').value;
                if (!style) {
                    this.showStepError('Please select a learning style');
                    return false;
                }
                break;
        }
        return true;
    },

    // Show step error
    showStepError(message) {
        window.StarGuideUtils.showNotification(message, 'error');
    },

    // Handle avatar selection
    selectAvatar(avatar) {
        document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelector(`[data-avatar="${avatar}"]`).classList.add('selected');
        document.getElementById('selected-avatar').value = avatar;
    },

    // Handle goal selection (multiple)
    toggleGoal(goal) {
        const element = document.querySelector(`[data-goal="${goal}"]`);
        element.classList.toggle('selected');
        
        const selected = Array.from(document.querySelectorAll('.goal-option.selected'))
            .map(el => el.dataset.goal);
        document.getElementById('selected-goals').value = selected.join(',');
    },

    // Handle tech selection (multiple)
    toggleTech(tech) {
        const element = document.querySelector(`[data-tech="${tech}"]`);
        element.classList.toggle('selected');
        
        const selected = Array.from(document.querySelectorAll('.tech-option.selected'))
            .map(el => el.dataset.tech);
        document.getElementById('selected-tech').value = selected.join(',');
    },

    // Handle learning style selection (single)
    selectLearningStyle(style) {
        document.querySelectorAll('.style-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelector(`[data-style="${style}"]`).classList.add('selected');
        document.getElementById('selected-style').value = style;
    },

    // Complete profile setup
    completeSetup() {
        if (!this.validateCurrentStep()) return;

        const profileData = this.collectProfileData();
        this.saveProfile(profileData);
    },

    // Collect all profile data
    collectProfileData() {
        return {
            displayName: document.getElementById('display-name').value.trim(),
            bio: document.getElementById('bio').value.trim(),
            avatar: document.getElementById('selected-avatar').value,
            goals: document.getElementById('selected-goals').value.split(','),
            interests: document.getElementById('selected-tech').value.split(','),
            learningStyle: document.getElementById('selected-style').value,
            dailyTime: document.getElementById('daily-time').value,
            setupCompleted: true,
            setupDate: new Date().toISOString()
        };
    },

    // Save profile to storage and backend
    saveProfile(profileData) {
        try {
            // Update local storage
            localStorage.setItem('starguide_profile_data', JSON.stringify(profileData));
            localStorage.setItem('profile_complete', 'true');
            
            // Update app state
            if (StarGuideApp.profile) {
                Object.assign(StarGuideApp.profile, profileData);
            }

            // Show success and proceed
            window.StarGuideUtils.showNotification('🎉 Profile setup complete! Welcome to StarGuide!', 'success');
            
            // Award first-time setup achievement
            if (window.StarGuideAchievements) {
                window.StarGuideAchievements.unlockAchievement('first-steps');
            }

            // Remove setup overlay
            setTimeout(() => {
                document.getElementById('profile-setup-overlay').remove();
                this.isComplete = true;
                
                // Continue to main app
                StarGuideApp.showMainApp();
            }, 1500);

        } catch (error) {
            console.error('Profile setup error:', error);
            window.StarGuideUtils.showNotification('Failed to save profile. Please try again.', 'error');
        }
    }
};
