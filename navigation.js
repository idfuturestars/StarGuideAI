/**
 * IDFS StarGuide - Navigation Module
 * Handles all view navigation and routing
 */

window.StarGuideNavigation = {
    currentView: 'mission-control',
    viewHistory: [],
    
    // Initialize module
    init() {
        console.log('Navigation module initialized');
        this.attachEventListeners();
        this.restoreLastView();
    },

    // Attach navigation event listeners
    attachEventListeners() {
        // Handle menu item clicks
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                if (view) {
                    this.navigateTo(view);
                }
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.view) {
                this.loadView(e.state.view, false);
            }
        });
    },

    // Navigate to a view
    navigateTo(view) {
        console.log(`Navigating to: ${view}`);
        
        // Add to history
        this.viewHistory.push(view);
        
        // Update browser history
        history.pushState({ view }, '', `#${view}`);
        
        // Load the view
        this.loadView(view);
    },

    // Load a specific view
    loadView(view, updateHistory = true) {
        // Show loading state
        this.showLoading();
        
        // Update current view
        this.currentView = view;
        
        // Update active menu item
        this.updateActiveMenuItem(view);
        
        // Store last view
        localStorage.setItem('lastView', view);
        
        // Load view content
        setTimeout(() => {
            this.renderView(view);
            this.hideLoading();
        }, 300);
    },

    // Render view content
    renderView(view) {
        const content = document.getElementById('content');
        
        // Get view content based on route
        const viewContent = this.getViewContent(view);
        
        // Update content
        content.innerHTML = viewContent;
        
        // Initialize view-specific features
        this.initializeViewFeatures(view);
        
        // Trigger view loaded event
        window.dispatchEvent(new CustomEvent('viewLoaded', { detail: { view } }));
    },

    // Get content for each view
    getViewContent(view) {
        const views = {
            'mission-control': this.getMissionControlView(),
            'skill-assessment': this.getSkillAssessmentView(),
            'battle-arena': this.getBattleArenaView(),
            'learning-pods': this.getLearningPodsView(),
            'galaxy-quests': this.getGalaxyQuestsView(),
            'vision-quest': this.getVisionQuestView(),
            'achievements': this.getAchievementsView(),
            'leaderboard': this.getLeaderboardView(),
            'profile': this.getProfileView(),
            'skills-matrix': this.getSkillsMatrixView(),
            'analytics': this.getAnalyticsView(),
            'resources': this.getResourcesView(),
            'calendar': this.getCalendarView(),
            'starmentor-ai': this.getStarMentorView(),
            'settings': this.getSettingsView()
        };

        return views[view] || this.getNotFoundView();
    },

    // Mission Control View
    getMissionControlView() {
        return `
            <div class="mission-control-container">
                <h1 class="page-title">Mission Control</h1>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">🚀</div>
                        <div class="stat-info">
                            <h3>Active Missions</h3>
                            <p class="stat-value">5</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-info">
                            <h3>XP Earned Today</h3>
                            <p class="stat-value">250</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">🏆</div>
                        <div class="stat-info">
                            <h3>Achievements</h3>
                            <p class="stat-value">12/50</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-info">
                            <h3>Progress</h3>
                            <p class="stat-value">65%</p>
                        </div>
                    </div>
                </div>
                
                <div class="recent-activity">
                    <h2>Recent Activity</h2>
                    <div class="activity-list">
                        <div class="activity-item">
                            <span class="activity-icon">✅</span>
                            <span>Completed JavaScript Fundamentals</span>
                            <span class="activity-time">2 hours ago</span>
                        </div>
                        <div class="activity-item">
                            <span class="activity-icon">🏆</span>
                            <span>Earned "Code Warrior" achievement</span>
                            <span class="activity-time">5 hours ago</span>
                        </div>
                        <div class="activity-item">
                            <span class="activity-icon">⚔️</span>
                            <span>Won battle against Python Boss</span>
                            <span class="activity-time">1 day ago</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Skill Assessment View
    getSkillAssessmentView() {
        return `
            <div class="skill-assessment-container">
                <h1 class="page-title">Skill Assessment</h1>
                
                <div class="assessment-intro">
                    <p>Test your knowledge and discover your strengths!</p>
                </div>
                
                <div class="assessment-categories">
                    <div class="category-card" onclick="StarGuideAssessments.startAssessment('javascript')">
                        <div class="category-icon">🟨</div>
                        <h3>JavaScript</h3>
                        <p>Test your JS skills</p>
                        <button class="btn btn-primary">Start Assessment</button>
                    </div>
                    
                    <div class="category-card" onclick="StarGuideAssessments.startAssessment('python')">
                        <div class="category-icon">🐍</div>
                        <h3>Python</h3>
                        <p>Python fundamentals</p>
                        <button class="btn btn-primary">Start Assessment</button>
                    </div>
                    
                    <div class="category-card" onclick="StarGuideAssessments.startAssessment('react')">
                        <div class="category-icon">⚛️</div>
                        <h3>React</h3>
                        <p>React & components</p>
                        <button class="btn btn-primary">Start Assessment</button>
                    </div>
                    
                    <div class="category-card" onclick="StarGuideAssessments.startAssessment('general')">
                        <div class="category-icon">💡</div>
                        <h3>General Tech</h3>
                        <p>Overall knowledge</p>
                        <button class="btn btn-primary">Start Assessment</button>
                    </div>
                </div>
                
                <div id="assessment-area"></div>
            </div>
        `;
    },

    // Battle Arena View
    getBattleArenaView() {
        return `
            <div class="battle-arena-container">
                <h1 class="page-title">Battle Arena</h1>
                
                <div class="arena-intro">
                    <p>Challenge code bosses and level up your skills!</p>
                </div>
                
                <div class="boss-selection">
                    <div class="boss-card" onclick="StarGuideBattles.startBattle('javascript-ninja')">
                        <div class="boss-avatar">🥷</div>
                        <h3>JavaScript Ninja</h3>
                        <p>Level: 5</p>
                        <div class="boss-health">
                            <div class="health-bar" style="width: 100%"></div>
                        </div>
                        <button class="btn btn-danger">Challenge</button>
                    </div>
                    
                    <div class="boss-card" onclick="StarGuideBattles.startBattle('python-wizard')">
                        <div class="boss-avatar">🧙‍♂️</div>
                        <h3>Python Wizard</h3>
                        <p>Level: 8</p>
                        <div class="boss-health">
                            <div class="health-bar" style="width: 100%"></div>
                        </div>
                        <button class="btn btn-danger">Challenge</button>
                    </div>
                    
                    <div class="boss-card" onclick="StarGuideBattles.startBattle('react-robot')">
                        <div class="boss-avatar">🤖</div>
                        <h3>React Robot</h3>
                        <p>Level: 10</p>
                        <div class="boss-health">
                            <div class="health-bar" style="width: 100%"></div>
                        </div>
                        <button class="btn btn-danger">Challenge</button>
                    </div>
                </div>
                
                <div id="battle-area"></div>
            </div>
        `;
    },

    // Learning Pods View
    getLearningPodsView() {
        return `
            <div class="learning-pods-container">
                <h1 class="page-title">Learning Pods</h1>
                
                <div class="pods-intro">
                    <p>Join collaborative learning groups and grow together!</p>
                </div>
                
                <div class="pods-grid">
                    <div class="pod-card">
                        <div class="pod-icon">🌱</div>
                        <h3>JavaScript Beginners</h3>
                        <p>Members: 24</p>
                        <p>Next Session: Tomorrow 3PM</p>
                        <button class="btn btn-primary" onclick="StarGuidePods.joinPod('js-beginners')">Join Pod</button>
                    </div>
                    
                    <div class="pod-card">
                        <div class="pod-icon">🚀</div>
                        <h3>React Masters</h3>
                        <p>Members: 18</p>
                        <p>Next Session: Friday 5PM</p>
                        <button class="btn btn-primary" onclick="StarGuidePods.joinPod('react-masters')">Join Pod</button>
                    </div>
                    
                    <div class="pod-card">
                        <div class="pod-icon">🎯</div>
                        <h3>Full Stack Squad</h3>
                        <p>Members: 32</p>
                        <p>Next Session: Weekly Mondays</p>
                        <button class="btn btn-primary" onclick="StarGuidePods.joinPod('fullstack-squad')">Join Pod</button>
                    </div>
                </div>
                
                <div id="pod-details"></div>
            </div>
        `;
    },

    // Galaxy Quests View
    getGalaxyQuestsView() {
        return `
            <div class="galaxy-quests-container">
                <h1 class="page-title">Galaxy Quests</h1>
                
                <div class="quests-intro">
                    <p>Embark on epic coding adventures!</p>
                </div>
                
                <div class="quest-list">
                    <div class="quest-card">
                        <div class="quest-icon">🌟</div>
                        <div class="quest-info">
                            <h3>The Array Odyssey</h3>
                            <p>Master array methods through space exploration</p>
                            <div class="quest-progress">
                                <div class="progress-bar" style="width: 30%"></div>
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="StarGuideQuests.startQuest('array-odyssey')">Continue</button>
                    </div>
                    
                    <div class="quest-card">
                        <div class="quest-icon">🔮</div>
                        <div class="quest-info">
                            <h3>Async Nebula</h3>
                            <p>Navigate the mysteries of asynchronous programming</p>
                            <div class="quest-progress">
                                <div class="progress-bar" style="width: 0%"></div>
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="StarGuideQuests.startQuest('async-nebula')">Start Quest</button>
                    </div>
                    
                    <div class="quest-card locked">
                        <div class="quest-icon">🔒</div>
                        <div class="quest-info">
                            <h3>React Constellation</h3>
                            <p>Build component galaxies (Unlock at Level 10)</p>
                            <div class="quest-progress">
                                <div class="progress-bar" style="width: 0%"></div>
                            </div>
                        </div>
                        <button class="btn btn-secondary" disabled>Locked</button>
                    </div>
                </div>
                
                <div id="quest-content"></div>
            </div>
        `;
    },

    // Vision Quest View
    getVisionQuestView() {
        return `
            <div class="vision-quest-container">
                <h1 class="page-title">Vision Quest</h1>
                
                <div class="vision-intro">
                    <p>Plan your career path and set meaningful goals!</p>
                </div>
                
                <div class="vision-tools">
                    <div class="tool-card" onclick="StarGuideVision.openTool('career-map')">
                        <div class="tool-icon">🗺️</div>
                        <h3>Career Roadmap</h3>
                        <p>Visualize your tech journey</p>
                    </div>
                    
                    <div class="tool-card" onclick="StarGuideVision.openTool('goal-setter')">
                        <div class="tool-icon">🎯</div>
                        <h3>Goal Setter</h3>
                        <p>Set SMART goals</p>
                    </div>
                    
                    <div class="tool-card" onclick="StarGuideVision.openTool('skill-planner')">
                        <div class="tool-icon">📊</div>
                        <h3>Skill Planner</h3>
                        <p>Plan your learning path</p>
                    </div>
                    
                    <div class="tool-card" onclick="StarGuideVision.openTool('mentor-match')">
                        <div class="tool-icon">🤝</div>
                        <h3>Mentor Match</h3>
                        <p>Find your guide</p>
                    </div>
                </div>
                
                <div id="vision-workspace"></div>
            </div>
        `;
    },

    // Initialize view-specific features
    initializeViewFeatures(view) {
        switch(view) {
            case 'skill-assessment':
                if (window.StarGuideAssessments) {
                    window.StarGuideAssessments.init();
                }
                break;
            case 'battle-arena':
                if (window.StarGuideBattles) {
                    window.StarGuideBattles.init();
                }
                break;
            case 'learning-pods':
                if (window.StarGuidePods) {
                    window.StarGuidePods.init();
                }
                break;
            case 'galaxy-quests':
                if (window.StarGuideQuests) {
                    window.StarGuideQuests.init();
                }
                break;
            case 'vision-quest':
                if (window.StarGuideVision) {
                    window.StarGuideVision.init();
                }
                break;
            case 'analytics':
                if (window.StarGuideAnalytics) {
                    window.StarGuideAnalytics.init();
                }
                break;
            case 'achievements':
                if (window.StarGuideAchievements) {
                    window.StarGuideAchievements.init();
                }
                break;
            case 'starmentor-ai':
                if (window.StarGuideAI) {
                    window.StarGuideAI.init();
                }
                break;
        }
    },

    // Update active menu item
    updateActiveMenuItem(view) {
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.view === view) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },

    // Show loading state
    showLoading() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        `;
    },

    // Hide loading state
    hideLoading() {
        // Loading is replaced by content
    },

    // Restore last view
    restoreLastView() {
        const lastView = localStorage.getItem('lastView') || 'mission-control';
        this.loadView(lastView);
    },

    // Get other view contents
    getAchievementsView() {
        return `
            <div class="achievements-container">
                <h1 class="page-title">Achievements</h1>
                <div class="achievements-stats">
                    <div class="stat">
                        <h3>Total Earned</h3>
                        <p>12 / 50</p>
                    </div>
                    <div class="stat">
                        <h3>Points</h3>
                        <p>2,450</p>
                    </div>
                    <div class="stat">
                        <h3>Completion</h3>
                        <p>24%</p>
                    </div>
                </div>
                <div id="achievements-grid"></div>
            </div>
        `;
    },

    getLeaderboardView() {
        return `
            <div class="leaderboard-container">
                <h1 class="page-title">Leaderboard</h1>
                <div class="leaderboard-tabs">
                    <button class="tab-btn active" onclick="StarGuideApp.loadLeaderboard('weekly')">Weekly</button>
                    <button class="tab-btn" onclick="StarGuideApp.loadLeaderboard('monthly')">Monthly</button>
                    <button class="tab-btn" onclick="StarGuideApp.loadLeaderboard('alltime')">All Time</button>
                </div>
                <div id="leaderboard-content">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;
    },

    getProfileView() {
        const user = StarGuideApp.state.user || {};
        return `
            <div class="profile-container">
                <h1 class="page-title">My Profile</h1>
                <div class="profile-header">
                    <div class="profile-avatar">
                        <div class="avatar-placeholder">${user.username ? user.username[0].toUpperCase() : 'U'}</div>
                    </div>
                    <div class="profile-info">
                        <h2>${user.username || 'StarGuide User'}</h2>
                        <p>Level ${user.level || 1} • ${user.xp || 0} XP</p>
                        <p>Member since ${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}</p>
                    </div>
                </div>
                <div id="profile-stats"></div>
            </div>
        `;
    },

    getSkillsMatrixView() {
        return `
            <div class="skills-matrix-container">
                <h1 class="page-title">Skills Matrix</h1>
                <div class="skills-overview">
                    <p>Track your proficiency across different technologies</p>
                </div>
                <div id="skills-chart"></div>
                <div id="skills-details"></div>
            </div>
        `;
    },

    getAnalyticsView() {
        return `
            <div class="analytics-container">
                <h1 class="page-title">Analytics</h1>
                <div class="analytics-controls">
                    <select id="analytics-period" onchange="StarGuideAnalytics.updatePeriod(this.value)">
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>
                </div>
                <div id="analytics-charts">
                    <div class="chart-container">
                        <h3>XP Progress</h3>
                        <canvas id="xp-chart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3>Activity Heatmap</h3>
                        <canvas id="activity-chart"></canvas>
                    </div>
                </div>
            </div>
        `;
    },

    getResourcesView() {
        return `
            <div class="resources-container">
                <h1 class="page-title">Resources</h1>
                <div class="resource-categories">
                    <div class="resource-category">
                        <h3>📚 Documentation</h3>
                        <ul class="resource-list">
                            <li><a href="#" onclick="StarGuideApp.openResource('js-docs')">JavaScript Guide</a></li>
                            <li><a href="#" onclick="StarGuideApp.openResource('react-docs')">React Documentation</a></li>
                            <li><a href="#" onclick="StarGuideApp.openResource('python-docs')">Python Tutorial</a></li>
                        </ul>
                    </div>
                    <div class="resource-category">
                        <h3>🎥 Video Tutorials</h3>
                        <ul class="resource-list">
                            <li><a href="#" onclick="StarGuideApp.openResource('video-1')">Getting Started</a></li>
                            <li><a href="#" onclick="StarGuideApp.openResource('video-2')">Advanced Concepts</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    },

    getCalendarView() {
        return `
            <div class="calendar-container">
                <h1 class="page-title">Calendar</h1>
                <div class="calendar-controls">
                    <button onclick="StarGuideApp.previousMonth()">← Previous</button>
                    <h3 id="calendar-month">${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                    <button onclick="StarGuideApp.nextMonth()">Next →</button>
                </div>
                <div id="calendar-grid"></div>
                <div id="upcoming-events">
                    <h3>Upcoming Events</h3>
                    <div class="event-list"></div>
                </div>
            </div>
        `;
    },

    getStarMentorView() {
        return `
            <div class="starmentor-container">
                <h1 class="page-title">StarMentor AI</h1>
                <div class="chat-container">
                    <div id="chat-messages">
                        <div class="message ai-message">
                            <p>Hello! I'm StarMentor, your AI learning assistant. How can I help you today?</p>
                        </div>
                    </div>
                    <div class="chat-input-container">
                        <input type="text" id="chat-input" placeholder="Ask me anything..." onkeypress="if(event.key==='Enter') StarGuideAI.sendMessage()">
                        <button onclick="StarGuideAI.sendMessage()">Send</button>
                    </div>
                </div>
            </div>
        `;
    },

    getSettingsView() {
        return `
            <div class="settings-container">
                <h1 class="page-title">Settings</h1>
                <div class="settings-section">
                    <h3>Profile Settings</h3>
                    <div class="setting-item">
                        <label>Username</label>
                        <input type="text" id="settings-username" value="${StarGuideApp.state.user?.username || ''}">
                    </div>
                    <div class="setting-item">
                        <label>Email</label>
                        <input type="email" id="settings-email" value="${StarGuideApp.state.user?.email || ''}">
                    </div>
                </div>
                <div class="settings-section">
                    <h3>Preferences</h3>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="settings-notifications" checked>
                            Enable notifications
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="settings-sound" checked>
                            Enable sound effects
                        </label>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="StarGuideApp.saveSettings()">Save Settings</button>
            </div>
        `;
    },

    getNotFoundView() {
        return `
            <div class="not-found-container">
                <h1>404 - View Not Found</h1>
                <p>The requested view does not exist.</p>
                <button class="btn btn-primary" onclick="StarGuideNavigation.navigateTo('mission-control')">Return to Mission Control</button>
            </div>
        `;
    }
};