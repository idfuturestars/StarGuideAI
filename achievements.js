/**
 * IDFS StarGuide - Achievements Module
 * Track and display user achievements and badges
 */

window.StarGuideAchievements = {
    userAchievements: [],
    
    // All available achievements
    achievements: {
        // Learning achievements
        'first-steps': {
            id: 'first-steps',
            name: 'First Steps',
            description: 'Complete your first assessment',
            icon: '👣',
            category: 'learning',
            xp: 50,
            rarity: 'common'
        },
        'quick-learner': {
            id: 'quick-learner',
            name: 'Quick Learner',
            description: 'Complete 5 assessments',
            icon: '🎓',
            category: 'learning',
            xp: 100,
            rarity: 'common'
        },
        'knowledge-seeker': {
            id: 'knowledge-seeker',
            name: 'Knowledge Seeker',
            description: 'Complete 20 assessments',
            icon: '📚',
            category: 'learning',
            xp: 250,
            rarity: 'rare'
        },
        'perfect-score': {
            id: 'perfect-score',
            name: 'Perfect Score',
            description: 'Score 100% on any assessment',
            icon: '💯',
            category: 'learning',
            xp: 150,
            rarity: 'rare'
        },
        
        // Battle achievements
        'first-blood': {
            id: 'first-blood',
            name: 'First Blood',
            description: 'Win your first battle',
            icon: '⚔️',
            category: 'battle',
            xp: 75,
            rarity: 'common'
        },
        'warrior': {
            id: 'warrior',
            name: 'Code Warrior',
            description: 'Win 10 battles',
            icon: '🗡️',
            category: 'battle',
            xp: 200,
            rarity: 'rare'
        },
        'flawless-victory': {
            id: 'flawless-victory',
            name: 'Flawless Victory',
            description: 'Win a battle without taking damage',
            icon: '🛡️',
            category: 'battle',
            xp: 300,
            rarity: 'epic'
        },
        
        // Quest achievements
        'adventurer': {
            id: 'adventurer',
            name: 'Adventurer',
            description: 'Complete your first quest',
            icon: '🗺️',
            category: 'quest',
            xp: 100,
            rarity: 'common'
        },
        'quest-master': {
            id: 'quest-master',
            name: 'Quest Master',
            description: 'Complete all available quests',
            icon: '🏆',
            category: 'quest',
            xp: 500,
            rarity: 'legendary'
        },
        
        // Social achievements
        'team-player': {
            id: 'team-player',
            name: 'Team Player',
            description: 'Join your first learning pod',
            icon: '🤝',
            category: 'social',
            xp: 50,
            rarity: 'common'
        },
        'mentor': {
            id: 'mentor',
            name: 'Mentor',
            description: 'Help 5 other users',
            icon: '🧑‍🏫',
            category: 'social',
            xp: 200,
            rarity: 'rare'
        },
        
        // Progress achievements
        'dedicated': {
            id: 'dedicated',
            name: 'Dedicated',
            description: 'Log in 7 days in a row',
            icon: '📅',
            category: 'progress',
            xp: 100,
            rarity: 'common'
        },
        'milestone-100': {
            id: 'milestone-100',
            name: 'Century',
            description: 'Earn 1,000 total XP',
            icon: '💎',
            category: 'progress',
            xp: 150,
            rarity: 'rare'
        },
        'milestone-1000': {
            id: 'milestone-1000',
            name: 'Elite',
            description: 'Earn 10,000 total XP',
            icon: '👑',
            category: 'progress',
            xp: 500,
            rarity: 'epic'
        },
        'speed-demon': {
            id: 'speed-demon',
            name: 'Speed Demon',
            description: 'Complete 10 challenges in under 30 seconds each',
            icon: '⚡',
            category: 'progress',
            xp: 250,
            rarity: 'epic'
        }
    },

    // Initialize module
    init() {
        console.log('Achievements module initialized');
        this.loadUserAchievements();
        this.renderAchievements();
    },

    // Load user achievements
    loadUserAchievements() {
        const saved = localStorage.getItem('userAchievements');
        if (saved) {
            this.userAchievements = JSON.parse(saved);
        }
    },

    // Check and unlock achievement
    unlockAchievement(achievementId) {
        if (this.userAchievements.includes(achievementId)) {
            return false; // Already unlocked
        }

        const achievement = this.achievements[achievementId];
        if (!achievement) return false;

        // Add to user achievements
        this.userAchievements.push(achievementId);
        localStorage.setItem('userAchievements', JSON.stringify(this.userAchievements));

        // Show notification
        this.showAchievementNotification(achievement);

        // Add XP
        if (window.StarGuideApp) {
            window.StarGuideApp.addXP(achievement.xp);
        }

        // Re-render if on achievements page
        if (window.StarGuideNavigation?.currentView === 'achievements') {
            this.renderAchievements();
        }

        return true;
    },

    // Show achievement notification
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-popup">
                <div class="achievement-header">
                    <span class="achievement-unlocked">🎉 Achievement Unlocked!</span>
                </div>
                <div class="achievement-content">
                    <span class="achievement-icon-large">${achievement.icon}</span>
                    <div class="achievement-details">
                        <h4>${achievement.name}</h4>
                        <p>${achievement.description}</p>
                        <p class="achievement-xp">+${achievement.xp} XP</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    },

    // Render achievements grid
    renderAchievements() {
        const grid = document.getElementById('achievements-grid');
        if (!grid) return;

        const categories = ['learning', 'battle', 'quest', 'social', 'progress'];
        
        grid.innerHTML = categories.map(category => `
            <div class="achievement-category">
                <h3>${this.getCategoryTitle(category)}</h3>
                <div class="achievement-list">
                    ${this.renderCategoryAchievements(category)}
                </div>
            </div>
        `).join('');

        // Update stats
        this.updateAchievementStats();
    },

    // Get category title
    getCategoryTitle(category) {
        const titles = {
            learning: '📚 Learning',
            battle: '⚔️ Battle',
            quest: '🗺️ Quest',
            social: '🤝 Social',
            progress: '📈 Progress'
        };
        return titles[category] || category;
    },

    // Render achievements for a category
    renderCategoryAchievements(category) {
        const categoryAchievements = Object.values(this.achievements)
            .filter(a => a.category === category);

        return categoryAchievements.map(achievement => {
            const isUnlocked = this.userAchievements.includes(achievement.id);
            
            return `
                <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'} rarity-${achievement.rarity}">
                    <div class="achievement-icon">${isUnlocked ? achievement.icon : '🔒'}</div>
                    <div class="achievement-info">
                        <h5>${achievement.name}</h5>
                        <p>${achievement.description}</p>
                        <div class="achievement-meta">
                            <span class="achievement-xp">${achievement.xp} XP</span>
                            <span class="achievement-rarity">${achievement.rarity}</span>
                        </div>
                    </div>
                    ${!isUnlocked ? '<div class="achievement-progress">Not unlocked</div>' : '<div class="achievement-progress">✅ Unlocked</div>'}
                </div>
            `;
        }).join('');
    },

    // Update achievement stats
    updateAchievementStats() {
        const totalAchievements = Object.keys(this.achievements).length;
        const unlockedCount = this.userAchievements.length;
        const percentage = Math.round((unlockedCount / totalAchievements) * 100);

        // Update any stat displays
        const statElements = document.querySelectorAll('.achievements-stats .stat');
        if (statElements.length >= 3) {
            statElements[0].querySelector('p').textContent = `${unlockedCount} / ${totalAchievements}`;
            statElements[2].querySelector('p').textContent = `${percentage}%`;
        }
    },

    // Check various achievement conditions
    checkAchievements(context, data) {
        switch(context) {
            case 'assessment_complete':
                this.checkAssessmentAchievements(data);
                break;
            case 'battle_complete':
                this.checkBattleAchievements(data);
                break;
            case 'quest_complete':
                this.checkQuestAchievements(data);
                break;
            case 'xp_earned':
                this.checkXPAchievements(data);
                break;
            case 'login':
                this.checkLoginAchievements(data);
                break;
        }
    },

    // Check assessment achievements
    checkAssessmentAchievements(data) {
        // First assessment
        if (!this.userAchievements.includes('first-steps')) {
            this.unlockAchievement('first-steps');
        }

        // Perfect score
        if (data.percentage === 100) {
            this.unlockAchievement('perfect-score');
        }

        // Count total assessments
        const assessmentCount = parseInt(localStorage.getItem('totalAssessments') || '0') + 1;
        localStorage.setItem('totalAssessments', assessmentCount.toString());

        if (assessmentCount >= 5) {
            this.unlockAchievement('quick-learner');
        }

        if (assessmentCount >= 20) {
            this.unlockAchievement('knowledge-seeker');
        }
    },

    // Check battle achievements
    checkBattleAchievements(data) {
        if (data.won) {
            // First win
            if (!this.userAchievements.includes('first-blood')) {
                this.unlockAchievement('first-blood');
            }

            // Flawless victory
            if (data.playerHP === 100) {
                this.unlockAchievement('flawless-victory');
            }

            // Count wins
            const battleWins = parseInt(localStorage.getItem('battleWins') || '0') + 1;
            localStorage.setItem('battleWins', battleWins.toString());

            if (battleWins >= 10) {
                this.unlockAchievement('warrior');
            }
        }
    },

    // Check quest achievements
    checkQuestAchievements(data) {
        // First quest
        if (!this.userAchievements.includes('adventurer')) {
            this.unlockAchievement('adventurer');
        }

        // Check if all quests completed
        const completedQuests = Object.values(data.questProgress || {})
            .filter(q => q.completed).length;
        
        if (completedQuests >= 4) { // Assuming 4 total quests
            this.unlockAchievement('quest-master');
        }
    },

    // Check XP achievements
    checkXPAchievements(data) {
        const totalXP = data.totalXP || 0;

        if (totalXP >= 1000) {
            this.unlockAchievement('milestone-100');
        }

        if (totalXP >= 10000) {
            this.unlockAchievement('milestone-1000');
        }
    },

    // Check login achievements
    checkLoginAchievements() {
        const today = new Date().toDateString();
        const lastLogin = localStorage.getItem('lastLogin');
        const loginStreak = parseInt(localStorage.getItem('loginStreak') || '0');

        if (lastLogin !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            let newStreak = 1;
            if (lastLogin === yesterday.toDateString()) {
                newStreak = loginStreak + 1;
            }

            localStorage.setItem('lastLogin', today);
            localStorage.setItem('loginStreak', newStreak.toString());

            if (newStreak >= 7) {
                this.unlockAchievement('dedicated');
            }
        }
    },

    // Get achievement progress
    getProgress() {
        const total = Object.keys(this.achievements).length;
        const unlocked = this.userAchievements.length;
        
        return {
            total: total,
            unlocked: unlocked,
            percentage: Math.round((unlocked / total) * 100),
            byCategory: this.getProgressByCategory(),
            totalXP: this.getTotalAchievementXP()
        };
    },

    // Get progress by category
    getProgressByCategory() {
        const categories = {};
        
        Object.values(this.achievements).forEach(achievement => {
            if (!categories[achievement.category]) {
                categories[achievement.category] = { total: 0, unlocked: 0 };
            }
            
            categories[achievement.category].total++;
            
            if (this.userAchievements.includes(achievement.id)) {
                categories[achievement.category].unlocked++;
            }
        });

        return categories;
    },

    // Get total XP from achievements
    getTotalAchievementXP() {
        return this.userAchievements.reduce((total, achievementId) => {
            const achievement = this.achievements[achievementId];
            return total + (achievement ? achievement.xp : 0);
        }, 0);
    }
};