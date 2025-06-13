/**
 * IDFS StarGuide - Learning Pods Module
 * Collaborative learning groups and sessions
 */

window.StarGuidePods = {
    currentPod: null,
    userPods: [],
    
    // Pod configurations
    availablePods: {
        'js-beginners': {
            name: 'JavaScript Beginners',
            icon: '🌱',
            description: 'Learn JavaScript fundamentals together',
            level: 'Beginner',
            members: 24,
            maxMembers: 30,
            schedule: 'Daily at 3PM EST',
            topics: ['Variables', 'Functions', 'Arrays', 'Objects', 'DOM Manipulation']
        },
        'react-masters': {
            name: 'React Masters',
            icon: '🚀',
            description: 'Advanced React patterns and best practices',
            level: 'Advanced',
            members: 18,
            maxMembers: 25,
            schedule: 'MWF at 5PM EST',
            topics: ['Hooks', 'Context', 'Performance', 'Testing', 'Advanced Patterns']
        },
        'fullstack-squad': {
            name: 'Full Stack Squad',
            icon: '🎯',
            description: 'End-to-end web development',
            level: 'Intermediate',
            members: 32,
            maxMembers: 40,
            schedule: 'Weekly Mondays 7PM EST',
            topics: ['Frontend', 'Backend', 'Databases', 'DevOps', 'Projects']
        },
        'python-pioneers': {
            name: 'Python Pioneers',
            icon: '🐍',
            description: 'Python programming from basics to advanced',
            level: 'All Levels',
            members: 28,
            maxMembers: 35,
            schedule: 'Tue/Thu 4PM EST',
            topics: ['Syntax', 'Data Structures', 'OOP', 'Libraries', 'Projects']
        }
    },

    // Initialize module
    init() {
        console.log('Learning Pods module initialized');
        this.loadUserPods();
    },

    // Load user's pods
    async loadUserPods() {
        try {
            const response = await fetch('/api/pods/user');
            const data = await response.json();
            
            if (data.success) {
                this.userPods = data.pods || [];
            }
        } catch (error) {
            console.error('Error loading user pods:', error);
            // Use localStorage as fallback
            this.userPods = JSON.parse(localStorage.getItem('userPods') || '[]');
        }
    },

    // Join a pod
    async joinPod(podId) {
        const pod = this.availablePods[podId];
        if (!pod) {
            StarGuideUtils.showNotification('Pod not found!', 'error');
            return;
        }

        // Check if already joined
        if (this.userPods.includes(podId)) {
            StarGuideUtils.showNotification('You are already a member of this pod!', 'info');
            this.showPodDetails(podId);
            return;
        }

        // Check if pod is full
        if (pod.members >= pod.maxMembers) {
            StarGuideUtils.showNotification('This pod is full!', 'warning');
            return;
        }

        try {
            // Join pod via API
            const response = await fetch('/api/pods/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ podId })
            });

            const data = await response.json();
            
            if (data.success) {
                this.userPods.push(podId);
                pod.members++;
                StarGuideUtils.showNotification(`Welcome to ${pod.name}!`, 'success');
                this.showPodDetails(podId);
                
                // Save to localStorage
                localStorage.setItem('userPods', JSON.stringify(this.userPods));
            }
        } catch (error) {
            console.error('Error joining pod:', error);
            // Fallback - join locally
            this.userPods.push(podId);
            pod.members++;
            localStorage.setItem('userPods', JSON.stringify(this.userPods));
            StarGuideUtils.showNotification(`Welcome to ${pod.name}!`, 'success');
            this.showPodDetails(podId);
        }
    },

    // Show pod details
    showPodDetails(podId) {
        const pod = this.availablePods[podId];
        const isMember = this.userPods.includes(podId);
        
        const podDetails = document.getElementById('pod-details');
        podDetails.innerHTML = `
            <div class="pod-detail-view">
                <div class="pod-header">
                    <span class="pod-icon-large">${pod.icon}</span>
                    <div class="pod-info">
                        <h2>${pod.name}</h2>
                        <p>${pod.description}</p>
                        <div class="pod-meta">
                            <span class="pod-level">Level: ${pod.level}</span>
                            <span class="pod-members">${pod.members}/${pod.maxMembers} members</span>
                            <span class="pod-schedule">${pod.schedule}</span>
                        </div>
                    </div>
                </div>

                <div class="pod-content">
                    <div class="pod-section">
                        <h3>Topics Covered</h3>
                        <div class="topic-list">
                            ${pod.topics.map(topic => `
                                <span class="topic-tag">${topic}</span>
                            `).join('')}
                        </div>
                    </div>

                    <div class="pod-section">
                        <h3>Next Session</h3>
                        <div class="session-info">
                            <p>📅 ${this.getNextSessionDate(pod.schedule)}</p>
                            <p>🎯 Topic: ${pod.topics[Math.floor(Math.random() * pod.topics.length)]}</p>
                            ${isMember ? `
                                <button class="btn btn-primary" onclick="StarGuidePods.joinSession('${podId}')">
                                    Join Live Session
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    ${isMember ? this.getMemberContent(podId) : this.getNonMemberContent(podId)}

                    <div class="pod-actions">
                        ${isMember ? `
                            <button class="btn btn-secondary" onclick="StarGuidePods.leavePod('${podId}')">
                                Leave Pod
                            </button>
                        ` : `
                            <button class="btn btn-primary" onclick="StarGuidePods.joinPod('${podId}')">
                                Join This Pod
                            </button>
                        `}
                        <button class="btn btn-secondary" onclick="StarGuideNavigation.navigateTo('learning-pods')">
                            Back to Pods
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Get member-specific content
    getMemberContent(podId) {
        return `
            <div class="pod-section">
                <h3>Pod Chat</h3>
                <div class="pod-chat">
                    <div class="chat-messages" id="pod-chat-messages">
                        <div class="chat-message">
                            <span class="chat-author">Sarah:</span>
                            <span class="chat-text">Looking forward to today's session!</span>
                        </div>
                        <div class="chat-message">
                            <span class="chat-author">Mike:</span>
                            <span class="chat-text">Can someone help with the homework?</span>
                        </div>
                        <div class="chat-message">
                            <span class="chat-author">You:</span>
                            <span class="chat-text">Just joined! Excited to learn with everyone!</span>
                        </div>
                    </div>
                    <div class="chat-input-container">
                        <input type="text" id="pod-chat-input" placeholder="Type a message..." 
                               onkeypress="if(event.key==='Enter') StarGuidePods.sendMessage('${podId}')">
                        <button onclick="StarGuidePods.sendMessage('${podId}')">Send</button>
                    </div>
                </div>
            </div>

            <div class="pod-section">
                <h3>Recent Activities</h3>
                <div class="activity-list">
                    <div class="activity-item">
                        <span>📚</span>
                        <span>Completed: Introduction to Functions</span>
                        <span class="activity-date">2 days ago</span>
                    </div>
                    <div class="activity-item">
                        <span>🏆</span>
                        <span>Pod Challenge: Array Methods Quiz</span>
                        <span class="activity-date">1 week ago</span>
                    </div>
                </div>
            </div>
        `;
    },

    // Get non-member content
    getNonMemberContent(podId) {
        const pod = this.availablePods[podId];
        return `
            <div class="pod-section">
                <h3>What You'll Get</h3>
                <div class="benefits-list">
                    <div class="benefit-item">
                        <span>👥</span>
                        <p>Learn with ${pod.members} other students</p>
                    </div>
                    <div class="benefit-item">
                        <span>🎓</span>
                        <p>Expert-led sessions and mentorship</p>
                    </div>
                    <div class="benefit-item">
                        <span>💬</span>
                        <p>24/7 community support and discussion</p>
                    </div>
                    <div class="benefit-item">
                        <span>📈</span>
                        <p>Track progress with pod challenges</p>
                    </div>
                </div>
            </div>
        `;
    },

    // Join live session
    joinSession(podId) {
        const pod = this.availablePods[podId];
        
        // Simulate joining a session
        const sessionWindow = `
            <div class="session-overlay">
                <div class="session-container">
                    <div class="session-header">
                        <h2>${pod.name} - Live Session</h2>
                        <button class="close-btn" onclick="StarGuidePods.closeSession()">✕</button>
                    </div>
                    
                    <div class="session-content">
                        <div class="video-area">
                            <div class="video-placeholder">
                                <span>🎥</span>
                                <p>Live Session Starting...</p>
                            </div>
                        </div>
                        
                        <div class="session-sidebar">
                            <div class="participants">
                                <h4>Participants (${pod.members})</h4>
                                <div class="participant-list">
                                    <div class="participant">🟢 You</div>
                                    <div class="participant">🟢 Sarah M.</div>
                                    <div class="participant">🟢 Mike K.</div>
                                    <div class="participant">🟡 Alex P.</div>
                                </div>
                            </div>
                            
                            <div class="session-chat">
                                <div class="chat-messages">
                                    <p><strong>Instructor:</strong> Welcome everyone!</p>
                                    <p><strong>Sarah:</strong> Hi!</p>
                                </div>
                                <input type="text" placeholder="Type a message...">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', sessionWindow);
        
        // Add XP for joining session
        if (window.StarGuideApp) {
            window.StarGuideApp.addXP(25);
        }
        
        StarGuideUtils.showNotification('Joined live session! +25 XP', 'success');
    },

    // Close session
    closeSession() {
        const overlay = document.querySelector('.session-overlay');
        if (overlay) {
            overlay.remove();
        }
    },

    // Send message in pod chat
    sendMessage(podId) {
        const input = document.getElementById('pod-chat-input');
        const messagesContainer = document.getElementById('pod-chat-messages');
        
        if (input && input.value.trim()) {
            const message = document.createElement('div');
            message.className = 'chat-message';
            message.innerHTML = `
                <span class="chat-author">You:</span>
                <span class="chat-text">${input.value}</span>
            `;
            
            messagesContainer.appendChild(message);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            input.value = '';
            
            // Simulate response after a delay
            setTimeout(() => {
                const responses = [
                    "Great question!",
                    "I had the same doubt!",
                    "Thanks for sharing!",
                    "That's really helpful!"
                ];
                
                const responseMessage = document.createElement('div');
                responseMessage.className = 'chat-message';
                responseMessage.innerHTML = `
                    <span class="chat-author">Bot Helper:</span>
                    <span class="chat-text">${responses[Math.floor(Math.random() * responses.length)]}</span>
                `;
                
                messagesContainer.appendChild(responseMessage);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 1000 + Math.random() * 2000);
        }
    },

    // Leave a pod
    async leavePod(podId) {
        if (!confirm('Are you sure you want to leave this pod?')) {
            return;
        }

        const pod = this.availablePods[podId];
        
        try {
            const response = await fetch('/api/pods/leave', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ podId })
            });

            if (response.ok) {
                this.userPods = this.userPods.filter(id => id !== podId);
                pod.members--;
                localStorage.setItem('userPods', JSON.stringify(this.userPods));
                StarGuideUtils.showNotification(`You have left ${pod.name}`, 'info');
                StarGuideNavigation.navigateTo('learning-pods');
            }
        } catch (error) {
            console.error('Error leaving pod:', error);
            // Fallback
            this.userPods = this.userPods.filter(id => id !== podId);
            pod.members--;
            localStorage.setItem('userPods', JSON.stringify(this.userPods));
            StarGuideUtils.showNotification(`You have left ${pod.name}`, 'info');
            StarGuideNavigation.navigateTo('learning-pods');
        }
    },

    // Get next session date based on schedule
    getNextSessionDate(schedule) {
        const now = new Date();
        
        if (schedule.includes('Daily')) {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toLocaleDateString() + ' at 3:00 PM';
        } else if (schedule.includes('Weekly')) {
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + (7 - now.getDay() + 1) % 7);
            return nextWeek.toLocaleDateString() + ' at 7:00 PM';
        } else if (schedule.includes('MWF')) {
            // Find next Monday, Wednesday, or Friday
            const days = [1, 3, 5]; // Mon, Wed, Fri
            const today = now.getDay();
            let daysUntilNext = days.map(d => (d - today + 7) % 7).filter(d => d > 0);
            if (daysUntilNext.length === 0) daysUntilNext = [days[0] + 7 - today];
            const nextDay = new Date(now);
            nextDay.setDate(nextDay.getDate() + Math.min(...daysUntilNext));
            return nextDay.toLocaleDateString() + ' at 5:00 PM';
        }
        
        return 'Check schedule for details';
    }
};