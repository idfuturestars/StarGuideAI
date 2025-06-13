/**
 * IDFS StarGuide - Vision Quest Module
 * Career planning and goal setting tools
 */

window.StarGuideVision = {
    currentTool: null,
    userGoals: [],
    careerPath: null,
    
    // Initialize module
    init() {
        console.log('Vision Quest module initialized');
        this.loadUserData();
    },

    // Load user's vision data
    loadUserData() {
        // Load from localStorage
        const savedGoals = localStorage.getItem('userGoals');
        const savedPath = localStorage.getItem('careerPath');
        
        if (savedGoals) {
            this.userGoals = JSON.parse(savedGoals);
        }
        
        if (savedPath) {
            this.careerPath = JSON.parse(savedPath);
        }
    },

    // Open a vision tool
    openTool(toolId) {
        this.currentTool = toolId;
        const workspace = document.getElementById('vision-workspace');

        switch(toolId) {
            case 'career-map':
                this.showCareerMap(workspace);
                break;
            case 'goal-setter':
                this.showGoalSetter(workspace);
                break;
            case 'skill-planner':
                this.showSkillPlanner(workspace);
                break;
            case 'mentor-match':
                this.showMentorMatch(workspace);
                break;
            default:
                workspace.innerHTML = '<p>Tool not found</p>';
        }
    },

    // Career Roadmap Tool
    showCareerMap(workspace) {
        workspace.innerHTML = `
            <div class="career-map-tool">
                <h3>🗺️ Career Roadmap</h3>
                <p>Visualize your journey from where you are to where you want to be.</p>

                <div class="career-selector">
                    <label>Select Your Career Goal:</label>
                    <select id="career-goal" onchange="StarGuideVision.updateCareerPath()">
                        <option value="">Choose a career path...</option>
                        <option value="frontend">Frontend Developer</option>
                        <option value="backend">Backend Developer</option>
                        <option value="fullstack">Full Stack Developer</option>
                        <option value="mobile">Mobile Developer</option>
                        <option value="devops">DevOps Engineer</option>
                        <option value="data">Data Scientist</option>
                        <option value="security">Security Engineer</option>
                        <option value="architect">Software Architect</option>
                    </select>
                </div>
        `;

        StarGuideUtils.showNotification('Found 3 mentors matching your preferences!', 'success');
    },

    // Request mentor
    requestMentor(mentorName) {
        StarGuideUtils.showNotification(`Mentorship request sent to ${mentorName}!`, 'success');
        
        // Add XP for requesting a mentor
        if (window.StarGuideApp) {
            window.StarGuideApp.addXP(15);
        }
    },

    // View mentor profile
    viewMentorProfile(mentorName) {
        StarGuideUtils.showNotification(`Opening ${mentorName}'s profile...`, 'info');
    }
};

                <div id="career-path-display">
                    ${this.careerPath ? this.renderCareerPath() : '<p>Select a career goal to see your roadmap</p>'}
                </div>

                <div class="career-timeline">
                    <h4>Suggested Timeline</h4>
                    <div id="timeline-display"></div>
                </div>
            </div>
        `;

        // Load existing selection
        if (this.careerPath) {
            document.getElementById('career-goal').value = this.careerPath.goal;
            this.updateCareerPath();
        }
    },

    // Update career path based on selection
    updateCareerPath() {
        const goal = document.getElementById('career-goal').value;
        if (!goal) return;

        const paths = {
            frontend: {
                goal: 'frontend',
                title: 'Frontend Developer',
                stages: [
                    { phase: 'Foundation', duration: '2-3 months', skills: ['HTML', 'CSS', 'JavaScript Basics'] },
                    { phase: 'Advanced', duration: '3-4 months', skills: ['React/Vue', 'State Management', 'CSS Frameworks'] },
                    { phase: 'Professional', duration: '2-3 months', skills: ['Testing', 'Performance', 'Accessibility'] },
                    { phase: 'Expert', duration: 'Ongoing', skills: ['Architecture', 'Team Lead', 'Mentoring'] }
                ]
            },
            backend: {
                goal: 'backend',
                title: 'Backend Developer',
                stages: [
                    { phase: 'Foundation', duration: '2-3 months', skills: ['Programming Basics', 'Databases', 'APIs'] },
                    { phase: 'Advanced', duration: '3-4 months', skills: ['Frameworks', 'Security', 'Caching'] },
                    { phase: 'Professional', duration: '2-3 months', skills: ['Microservices', 'DevOps', 'Scaling'] },
                    { phase: 'Expert', duration: 'Ongoing', skills: ['Architecture', 'System Design', 'Leadership'] }
                ]
            },
            fullstack: {
                goal: 'fullstack',
                title: 'Full Stack Developer',
                stages: [
                    { phase: 'Foundation', duration: '3-4 months', skills: ['HTML/CSS/JS', 'Backend Basics', 'Databases'] },
                    { phase: 'Advanced', duration: '4-5 months', skills: ['React', 'Node.js', 'Full Stack Frameworks'] },
                    { phase: 'Professional', duration: '3-4 months', skills: ['DevOps', 'Testing', 'Security'] },
                    { phase: 'Expert', duration: 'Ongoing', skills: ['Architecture', 'Team Management', 'Business Logic'] }
                ]
            }
            // Add more paths...
        };

        this.careerPath = paths[goal] || paths.fullstack;
        localStorage.setItem('careerPath', JSON.stringify(this.careerPath));

        // Update display
        document.getElementById('career-path-display').innerHTML = this.renderCareerPath();
        this.renderTimeline();
    },

    // Render career path
    renderCareerPath() {
        if (!this.careerPath) return '';

        return `
            <div class="career-path">
                <h4>Path to ${this.careerPath.title}</h4>
                <div class="path-stages">
                    ${this.careerPath.stages.map((stage, index) => `
                        <div class="path-stage ${index === 0 ? 'current' : ''}">
                            <div class="stage-marker">${index + 1}</div>
                            <div class="stage-content">
                                <h5>${stage.phase}</h5>
                                <p class="duration">${stage.duration}</p>
                                <div class="skill-tags">
                                    ${stage.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('<div class="path-connector"></div>')}
                </div>
            </div>
        `;
    },

    // Render timeline
    renderTimeline() {
        const timelineDisplay = document.getElementById('timeline-display');
        if (!this.careerPath) return;

        let totalMonths = 0;
        const timeline = this.careerPath.stages.map(stage => {
            const duration = parseInt(stage.duration) || 3;
            const start = totalMonths;
            totalMonths += duration;
            
            return {
                phase: stage.phase,
                start: start,
                duration: duration
            };
        });

        timelineDisplay.innerHTML = `
            <div class="timeline-bar">
                ${timeline.map(item => `
                    <div class="timeline-segment" style="width: ${(item.duration / totalMonths) * 100}%">
                        <span>${item.phase}</span>
                    </div>
                `).join('')}
            </div>
            <p class="timeline-total">Estimated Total: ${totalMonths-3}-${totalMonths} months to proficiency</p>
        `;
    },

    // Goal Setter Tool
    showGoalSetter(workspace) {
        workspace.innerHTML = `
            <div class="goal-setter-tool">
                <h3>🎯 SMART Goal Setter</h3>
                <p>Set Specific, Measurable, Achievable, Relevant, Time-bound goals.</p>

                <div class="goal-form">
                    <div class="form-group">
                        <label>Goal Title</label>
                        <input type="text" id="goal-title" placeholder="e.g., Learn React">
                    </div>

                    <div class="form-group">
                        <label>Specific - What exactly do you want to achieve?</label>
                        <textarea id="goal-specific" placeholder="I want to build 3 React projects..."></textarea>
                    </div>

                    <div class="form-group">
                        <label>Measurable - How will you track progress?</label>
                        <input type="text" id="goal-measurable" placeholder="Complete X tutorials, build Y projects">
                    </div>

                    <div class="form-group">
                        <label>Achievable - What resources do you need?</label>
                        <input type="text" id="goal-achievable" placeholder="2 hours daily, React course, mentor">
                    </div>

                    <div class="form-group">
                        <label>Relevant - Why is this important to you?</label>
                        <input type="text" id="goal-relevant" placeholder="To get a frontend developer job">
                    </div>

                    <div class="form-group">
                        <label>Time-bound - When will you complete this?</label>
                        <input type="date" id="goal-deadline">
                    </div>

                    <button class="btn btn-primary" onclick="StarGuideVision.saveGoal()">Save Goal</button>
                </div>

                <div class="existing-goals">
                    <h4>Your Goals</h4>
                    <div id="goals-list">
                        ${this.renderGoals()}
                    </div>
                </div>
            </div>
        `;
    },

    // Save a goal
    saveGoal() {
        const goal = {
            id: Date.now(),
            title: document.getElementById('goal-title').value,
            specific: document.getElementById('goal-specific').value,
            measurable: document.getElementById('goal-measurable').value,
            achievable: document.getElementById('goal-achievable').value,
            relevant: document.getElementById('goal-relevant').value,
            deadline: document.getElementById('goal-deadline').value,
            createdAt: new Date().toISOString(),
            progress: 0
        };

        if (!goal.title) {
            StarGuideUtils.showNotification('Please enter a goal title', 'warning');
            return;
        }

        this.userGoals.push(goal);
        localStorage.setItem('userGoals', JSON.stringify(this.userGoals));

        // Clear form
        document.querySelectorAll('.goal-form input, .goal-form textarea').forEach(el => el.value = '');

        // Update display
        document.getElementById('goals-list').innerHTML = this.renderGoals();

        StarGuideUtils.showNotification('Goal saved successfully!', 'success');
        
        // Add XP for setting a goal
        if (window.StarGuideApp) {
            window.StarGuideApp.addXP(10);
        }
    },

    // Render goals list
    renderGoals() {
        if (this.userGoals.length === 0) {
            return '<p>No goals set yet. Create your first goal above!</p>';
        }

        return this.userGoals.map(goal => `
            <div class="goal-card">
                <div class="goal-header">
                    <h5>${goal.title}</h5>
                    <button class="btn-icon" onclick="StarGuideVision.deleteGoal(${goal.id})">🗑️</button>
                </div>
                <p class="goal-deadline">Deadline: ${new Date(goal.deadline).toLocaleDateString()}</p>
                <div class="goal-progress">
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${goal.progress}%"></div>
                    </div>
                    <span>${goal.progress}%</span>
                </div>
                <button class="btn btn-sm" onclick="StarGuideVision.updateProgress(${goal.id})">Update Progress</button>
            </div>
        `).join('');
    },

    // Update goal progress
    updateProgress(goalId) {
        const goal = this.userGoals.find(g => g.id === goalId);
        if (!goal) return;

        const newProgress = prompt(`Current progress: ${goal.progress}%. Enter new progress (0-100):`);
        if (newProgress !== null) {
            goal.progress = Math.min(100, Math.max(0, parseInt(newProgress) || 0));
            localStorage.setItem('userGoals', JSON.stringify(this.userGoals));
            document.getElementById('goals-list').innerHTML = this.renderGoals();

            if (goal.progress === 100) {
                StarGuideUtils.showNotification('🎉 Goal completed! Great job!', 'success');
                if (window.StarGuideApp) {
                    window.StarGuideApp.addXP(100);
                }
            }
        }
    },

    // Delete goal
    deleteGoal(goalId) {
        if (confirm('Are you sure you want to delete this goal?')) {
            this.userGoals = this.userGoals.filter(g => g.id !== goalId);
            localStorage.setItem('userGoals', JSON.stringify(this.userGoals));
            document.getElementById('goals-list').innerHTML = this.renderGoals();
        }
    },

    // Skill Planner Tool
    showSkillPlanner(workspace) {
        workspace.innerHTML = `
            <div class="skill-planner-tool">
                <h3>📊 Skill Development Planner</h3>
                <p>Plan your learning journey and track skill progress.</p>

                <div class="skill-categories">
                    <button class="category-btn active" onclick="StarGuideVision.showSkillCategory('frontend')">Frontend</button>
                    <button class="category-btn" onclick="StarGuideVision.showSkillCategory('backend')">Backend</button>
                    <button class="category-btn" onclick="StarGuideVision.showSkillCategory('tools')">Tools</button>
                    <button class="category-btn" onclick="StarGuideVision.showSkillCategory('soft')">Soft Skills</button>
                </div>

                <div id="skill-list">
                    ${this.renderSkillList('frontend')}
                </div>

                <div class="learning-plan">
                    <h4>Your Learning Plan</h4>
                    <div id="learning-plan-display">
                        ${this.renderLearningPlan()}
                    </div>
                </div>
            </div>
        `;
    },

    // Show skill category
    showSkillCategory(category) {
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase().includes(category));
        });

        // Update skill list
        document.getElementById('skill-list').innerHTML = this.renderSkillList(category);
    },

    // Render skill list
    renderSkillList(category) {
        const skills = {
            frontend: [
                { name: 'HTML5', level: 'Beginner', resources: 3 },
                { name: 'CSS3', level: 'Beginner', resources: 4 },
                { name: 'JavaScript', level: 'Intermediate', resources: 6 },
                { name: 'React', level: 'Intermediate', resources: 5 },
                { name: 'Vue.js', level: 'Intermediate', resources: 4 },
                { name: 'TypeScript', level: 'Advanced', resources: 3 }
            ],
            backend: [
                { name: 'Node.js', level: 'Intermediate', resources: 5 },
                { name: 'Python', level: 'Beginner', resources: 6 },
                { name: 'Java', level: 'Intermediate', resources: 4 },
                { name: 'SQL', level: 'Beginner', resources: 3 },
                { name: 'MongoDB', level: 'Intermediate', resources: 3 },
                { name: 'GraphQL', level: 'Advanced', resources: 2 }
            ],
            tools: [
                { name: 'Git', level: 'Beginner', resources: 3 },
                { name: 'Docker', level: 'Intermediate', resources: 4 },
                { name: 'AWS', level: 'Advanced', resources: 5 },
                { name: 'CI/CD', level: 'Intermediate', resources: 3 },
                { name: 'Webpack', level: 'Intermediate', resources: 2 }
            ],
            soft: [
                { name: 'Communication', level: 'All', resources: 4 },
                { name: 'Problem Solving', level: 'All', resources: 5 },
                { name: 'Time Management', level: 'All', resources: 3 },
                { name: 'Leadership', level: 'Advanced', resources: 4 },
                { name: 'Collaboration', level: 'All', resources: 3 }
            ]
        };

        const categorySkills = skills[category] || skills.frontend;

        return `
            <div class="skills-grid">
                ${categorySkills.map(skill => `
                    <div class="skill-card">
                        <h5>${skill.name}</h5>
                        <p class="skill-level">Level: ${skill.level}</p>
                        <p class="skill-resources">${skill.resources} resources available</p>
                        <button class="btn btn-sm" onclick="StarGuideVision.addToLearningPlan('${skill.name}')">
                            Add to Plan
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Add skill to learning plan
    addToLearningPlan(skillName) {
        let learningPlan = JSON.parse(localStorage.getItem('learningPlan') || '[]');
        
        if (learningPlan.find(s => s.name === skillName)) {
            StarGuideUtils.showNotification('Skill already in your learning plan', 'info');
            return;
        }

        learningPlan.push({
            name: skillName,
            addedAt: new Date().toISOString(),
            progress: 0
        });

        localStorage.setItem('learningPlan', JSON.stringify(learningPlan));
        document.getElementById('learning-plan-display').innerHTML = this.renderLearningPlan();
        
        StarGuideUtils.showNotification(`${skillName} added to your learning plan!`, 'success');
    },

    // Render learning plan
    renderLearningPlan() {
        const learningPlan = JSON.parse(localStorage.getItem('learningPlan') || '[]');
        
        if (learningPlan.length === 0) {
            return '<p>No skills in your learning plan yet. Add skills from the categories above!</p>';
        }

        return `
            <div class="plan-list">
                ${learningPlan.map((skill, index) => `
                    <div class="plan-item">
                        <span class="plan-order">${index + 1}</span>
                        <span class="plan-skill">${skill.name}</span>
                        <span class="plan-progress">${skill.progress}%</span>
                        <button class="btn-icon" onclick="StarGuideVision.removeFromPlan('${skill.name}')">❌</button>
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-primary" onclick="StarGuideVision.startLearning()">Start Learning</button>
        `;
    },

    // Remove from learning plan
    removeFromPlan(skillName) {
        let learningPlan = JSON.parse(localStorage.getItem('learningPlan') || '[]');
        learningPlan = learningPlan.filter(s => s.name !== skillName);
        localStorage.setItem('learningPlan', JSON.stringify(learningPlan));
        document.getElementById('learning-plan-display').innerHTML = this.renderLearningPlan();
    },

    // Start learning
    startLearning() {
        const learningPlan = JSON.parse(localStorage.getItem('learningPlan') || '[]');
        if (learningPlan.length > 0) {
            StarGuideUtils.showNotification(`Starting with ${learningPlan[0].name}!`, 'success');
            // Could navigate to resources or start a learning session
        }
    },

    // Mentor Match Tool
    showMentorMatch(workspace) {
        workspace.innerHTML = `
            <div class="mentor-match-tool">
                <h3>🤝 Mentor Match</h3>
                <p>Find the perfect mentor for your learning journey.</p>

                <div class="mentor-preferences">
                    <h4>Your Preferences</h4>
                    <div class="preference-form">
                        <label>
                            Area of Interest:
                            <select id="mentor-area">
                                <option value="frontend">Frontend Development</option>
                                <option value="backend">Backend Development</option>
                                <option value="fullstack">Full Stack</option>
                                <option value="mobile">Mobile Development</option>
                                <option value="career">Career Guidance</option>
                            </select>
                        </label>

                        <label>
                            Experience Level:
                            <select id="mentor-level">
                                <option value="mid">Mid-Level (3-5 years)</option>
                                <option value="senior">Senior (5-10 years)</option>
                                <option value="expert">Expert (10+ years)</option>
                            </select>
                        </label>

                        <label>
                            Meeting Frequency:
                            <select id="mentor-frequency">
                                <option value="weekly">Weekly</option>
                                <option value="biweekly">Bi-weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </label>

                        <button class="btn btn-primary" onclick="StarGuideVision.findMentors()">Find Mentors</button>
                    </div>
                </div>

                <div id="mentor-results"></div>
            </div>
        `;
    },

    // Find mentors
    findMentors() {
        const area = document.getElementById('mentor-area').value;
        const level = document.getElementById('mentor-level').value;
        
        // Simulated mentor data
        const mentors = [
            {
                name: 'Sarah Chen',
                title: 'Senior Frontend Engineer',
                company: 'Tech Corp',
                experience: '8 years',
                specialties: ['React', 'TypeScript', 'Performance'],
                rating: 4.8,
                availability: 'Weekly'
            },
            {
                name: 'Michael Rodriguez',
                title: 'Full Stack Architect',
                company: 'StartupXYZ',
                experience: '12 years',
                specialties: ['System Design', 'Node.js', 'AWS'],
                rating: 4.9,
                availability: 'Bi-weekly'
            },
            {
                name: 'Emily Johnson',
                title: 'Lead Developer',
                company: 'Enterprise Co',
                experience: '10 years',
                specialties: ['Career Growth', 'Leadership', 'Full Stack'],
                rating: 4.7,
                availability: 'Monthly'
            }
        ];

        const resultsDiv = document.getElementById('mentor-results');
        resultsDiv.innerHTML = `
            <h4>Available Mentors</h4>
            <div class="mentor-list">
                ${mentors.map(mentor => `
                    <div class="mentor-card">
                        <div class="mentor-header">
                            <div class="mentor-avatar">${mentor.name.split(' ').map(n => n[0]).join('')}</div>
                            <div class="mentor-info">
                                <h5>${mentor.name}</h5>
                                <p>${mentor.title} at ${mentor.company}</p>
                                <p class="mentor-experience">${mentor.experience} experience</p>
                            </div>
                            <div class="mentor-rating">
                                <span class="stars">⭐ ${mentor.rating}</span>
                            </div>
                        </div>
                        
                        <div class="mentor-specialties">
                            ${mentor.specialties.map(s => `<span class="specialty-tag">${s}</span>`).join('')}
                        </div>
                        
                        <div class="mentor-availability">
                            <span>Available: ${mentor.availability}</span>
                        </div>
                        
                        <div class="mentor-actions">
                            <button class="btn btn-primary" onclick="StarGuideVision.requestMentor('${mentor.name}')">
                                Request Mentorship
                            </button>
                            <button class="btn btn-secondary" onclick="StarGuideVision.viewMentorProfile('${mentor.name}')">
                                View Profile
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>