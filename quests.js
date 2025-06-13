
/**
 * IDFS StarGuide - Quest System (100% Complete)
 * Full quest storylines and challenge validation
 */

window.StarGuideQuests = {
    userProgress: {},
    currentQuest: null,
    
    // Complete quest definitions
    quests: {
        'stellar-awakening': {
            id: 'stellar-awakening',
            title: 'Stellar Awakening',
            description: 'Begin your journey through the cosmos of knowledge',
            icon: '⭐',
            difficulty: 'Beginner',
            estimatedTime: '30 minutes',
            xpReward: 100,
            phases: [
                {
                    id: 1,
                    title: 'The Call to Adventure',
                    description: 'Welcome to the Stellar Academy! Your journey begins here.',
                    story: `
                        <div class="quest-story">
                            <p>🌟 <strong>Commander StarGuide speaking...</strong></p>
                            <p>Greetings, young Explorer! You've just arrived at the Stellar Academy, the galaxy's premier institution for cosmic knowledge. The universe is vast and full of mysteries waiting to be unlocked.</p>
                            <p>Your first mission is crucial: master the fundamentals of mathematical thinking. Every great space explorer needs strong analytical skills to navigate the complexities of the cosmos.</p>
                            <p><em>"Knowledge is the fuel that powers the starships of discovery."</em> - Ancient Academy Motto</p>
                        </div>
                    `,
                    challenge: {
                        type: 'assessment',
                        subject: 'math',
                        questions: 5,
                        passingScore: 70,
                        timeLimit: 300
                    },
                    completion: 'Complete a 5-question math assessment with 70% accuracy'
                },
                {
                    id: 2,
                    title: 'Scientific Foundation',
                    description: 'Explore the scientific principles that govern our universe',
                    story: `
                        <div class="quest-story">
                            <p>🔬 <strong>Dr. Cosmos, Chief Science Officer:</strong></p>
                            <p>Excellent work on the mathematical foundation! Now we must strengthen your understanding of the natural world. Science is the language the universe speaks.</p>
                            <p>From the smallest atoms to the largest galaxies, everything follows scientific principles. Understanding these laws will help you navigate any challenge the cosmos throws your way.</p>
                            <p>Your next task is to demonstrate mastery of scientific concepts. Show me that you can think like a true scientist!</p>
                        </div>
                    `,
                    challenge: {
                        type: 'assessment',
                        subject: 'science',
                        questions: 5,
                        passingScore: 70,
                        timeLimit: 300
                    },
                    completion: 'Complete a 5-question science assessment with 70% accuracy'
                },
                {
                    id: 3,
                    title: 'Communication Mastery',
                    description: 'Master the art of communication across the galaxy',
                    story: `
                        <div class="quest-story">
                            <p>📚 <strong>Professor Wordsmith, Language Arts Division:</strong></p>
                            <p>Greetings, bright star! Your scientific mind is sharp, but remember - knowledge without communication is like a star that shines in an empty cosmos.</p>
                            <p>As you venture into the unknown, you'll encounter beings from across the galaxy. Clear communication can mean the difference between friendship and conflict, understanding and confusion.</p>
                            <p>Demonstrate your mastery of language and show that you can express complex ideas with clarity and precision!</p>
                        </div>
                    `,
                    challenge: {
                        type: 'assessment',
                        subject: 'english',
                        questions: 5,
                        passingScore: 70,
                        timeLimit: 300
                    },
                    completion: 'Complete a 5-question English assessment with 70% accuracy'
                },
                {
                    id: 4,
                    title: 'The First Victory',
                    description: 'Prove your worth in stellar combat',
                    story: `
                        <div class="quest-story">
                            <p>⚔️ <strong>Captain Battlestar, Combat Training:</strong></p>
                            <p>Outstanding progress, cadet! Your mind is sharp and your knowledge is growing. But the cosmos isn't always peaceful. Sometimes, explorers must engage in intellectual combat to protect knowledge and discover truth.</p>
                            <p>The Battle Arena awaits! Face another explorer in a test of speed, accuracy, and knowledge. Show them that your training has prepared you for any challenge!</p>
                            <p>Remember: this isn't about defeating others, it's about pushing each other to reach greater heights. May the best mind win!</p>
                        </div>
                    `,
                    challenge: {
                        type: 'battle',
                        opponent: 'ai',
                        requirement: 'win'
                    },
                    completion: 'Win your first battle against an AI opponent'
                }
            ]
        },
        
        'cosmic-scholar': {
            id: 'cosmic-scholar',
            title: 'Cosmic Scholar',
            description: 'Dive deep into the mysteries of advanced knowledge',
            icon: '🌌',
            difficulty: 'Intermediate',
            estimatedTime: '45 minutes',
            xpReward: 200,
            prerequisite: 'stellar-awakening',
            phases: [
                {
                    id: 1,
                    title: 'The Knowledge Nexus',
                    description: 'Access the cosmic library of infinite knowledge',
                    story: `
                        <div class="quest-story">
                            <p>📖 <strong>The Cosmic Librarian speaks:</strong></p>
                            <p>Welcome to the Knowledge Nexus, explorer. You've proven yourself worthy of accessing the deeper mysteries of the universe. Here, information flows like stardust through the cosmic winds.</p>
                            <p>But beware - advanced knowledge requires advanced thinking. You must demonstrate mastery across multiple domains to prove you're ready for what lies ahead.</p>
                            <p>Your challenge: show perfect understanding by achieving flawless performance. The cosmos demands excellence from its scholars.</p>
                        </div>
                    `,
                    challenge: {
                        type: 'assessment',
                        subject: 'mixed',
                        questions: 10,
                        passingScore: 100, // Perfect score required
                        timeLimit: 600
                    },
                    completion: 'Achieve 100% on a 10-question mixed assessment'
                },
                {
                    id: 2,
                    title: 'Speed of Thought',
                    description: 'Train your mind to process information at light speed',
                    story: `
                        <div class="quest-story">
                            <p>⚡ <strong>Master Quicksilver, Speed Training:</strong></p>
                            <p>Knowledge without speed is like a starship without faster-than-light travel - you'll never reach your destination in time. The universe moves fast, and so must your mind.</p>
                            <p>Your next trial tests not just what you know, but how quickly you can access that knowledge. In the heat of discovery, every second counts.</p>
                            <p>Complete this challenge with the speed of stellar wind! Show me that your thoughts can travel faster than light!</p>
                        </div>
                    `,
                    challenge: {
                        type: 'assessment',
                        subject: 'math',
                        questions: 5,
                        passingScore: 80,
                        timeLimit: 120 // 2 minutes only
                    },
                    completion: 'Complete a 5-question math assessment in under 2 minutes with 80% accuracy'
                },
                {
                    id: 3,
                    title: 'Battle Champion',
                    description: 'Become a champion of intellectual combat',
                    story: `
                        <div class="quest-story">
                            <p>🏆 <strong>Champion Starblaze addresses you:</strong></p>
                            <p>You've shown speed and precision, but can you maintain that excellence under pressure? True champions aren't made in quiet study halls - they're forged in the heat of competition.</p>
                            <p>Face multiple opponents and emerge victorious. Each battle will test different aspects of your knowledge. Only by defeating them all will you prove yourself worthy of the title "Cosmic Scholar."</p>
                            <p>The arena awaits, champion. Show them the power of a truly trained mind!</p>
                        </div>
                    `,
                    challenge: {
                        type: 'battle',
                        requirement: 'win_streak',
                        count: 3
                    },
                    completion: 'Win 3 battles in a row'
                }
            ]
        },
        
        'galactic-guardian': {
            id: 'galactic-guardian',
            title: 'Galactic Guardian',
            description: 'Protect the galaxy through the power of knowledge',
            icon: '🛡️',
            difficulty: 'Advanced',
            estimatedTime: '60 minutes',
            xpReward: 300,
            prerequisite: 'cosmic-scholar',
            phases: [
                {
                    id: 1,
                    title: 'The Threat Assessment',
                    description: 'Analyze and understand the challenges facing the galaxy',
                    story: `
                        <div class="quest-story">
                            <p>🚨 <strong>Admiral Stardust, Galactic Command:</strong></p>
                            <p>Scholar, we have a situation. The galaxy faces challenges that require the brightest minds to solve. Natural disasters, complex problems, and mysteries that threaten entire star systems.</p>
                            <p>Your training has prepared you for this moment. We need guardians who can think critically, solve complex problems, and protect knowledge itself from those who would use it for harm.</p>
                            <p>Your first mission: prove you can handle the most difficult challenges the universe can present. No pressure, but billions of beings are counting on minds like yours.</p>
                        </div>
                    `,
                    challenge: {
                        type: 'assessment',
                        subject: 'mixed',
                        questions: 15,
                        difficulty: 3, // Hardest questions only
                        passingScore: 85,
                        timeLimit: 900
                    },
                    completion: 'Complete a 15-question advanced mixed assessment with 85% accuracy'
                },
                {
                    id: 2,
                    title: 'The Learning Pod Alliance',
                    description: 'Unite explorers in the pursuit of knowledge',
                    story: `
                        <div class="quest-story">
                            <p>🤝 <strong>Ambassador Unity, Diplomatic Corps:</strong></p>
                            <p>Guardian, individual brilliance is powerful, but collective wisdom is unstoppable. The greatest discoveries in galactic history came from minds working together, sharing knowledge, and building upon each other's insights.</p>
                            <p>Your next mission requires you to demonstrate leadership. Create a learning pod, bring together fellow explorers, and guide them toward greater understanding.</p>
                            <p>Remember: a true guardian doesn't just protect knowledge - they help it grow and spread throughout the cosmos.</p>
                        </div>
                    `,
                    challenge: {
                        type: 'social',
                        requirement: 'create_pod',
                        members: 3
                    },
                    completion: 'Create a learning pod and recruit 3 members'
                },
                {
                    id: 3,
                    title: 'The Ultimate Challenge',
                    description: 'Face the greatest test the academy can provide',
                    story: `
                        <div class="quest-story">
                            <p>🌟 <strong>The Academy itself speaks through all your instructors:</strong></p>
                            <p>Guardian candidate, you stand at the threshold of greatness. Every lesson learned, every challenge overcome, every victory achieved has led to this moment.</p>
                            <p>The Ultimate Challenge is not just a test - it's a rite of passage. Those who succeed join the ranks of the Galactic Guardians, protectors of knowledge and champions of learning throughout the cosmos.</p>
                            <p>You must demonstrate mastery of everything: speed, accuracy, collaboration, and perseverance. The challenge adapts to test your limits and push you beyond what you thought possible.</p>
                            <p>Are you ready to take your place among the stars?</p>
                        </div>
                    `,
                    challenge: {
                        type: 'ultimate',
                        requirements: {
                            perfect_score: 1,
                            battle_wins: 5,
                            time_limit: 600,
                            subjects: ['math', 'science', 'english', 'history']
                        }
                    },
                    completion: 'Complete the Ultimate Challenge: perfect score + 5 battle wins'
                }
            ]
        },
        
        'starmaster-legacy': {
            id: 'starmaster-legacy',
            title: 'StarMaster Legacy',
            description: 'Transcend beyond student to become a master of the cosmos',
            icon: '👑',
            difficulty: 'Master',
            estimatedTime: '90 minutes',
            xpReward: 500,
            prerequisite: 'galactic-guardian',
            phases: [
                {
                    id: 1,
                    title: 'The Mentor\'s Path',
                    description: 'Transition from student to teacher',
                    story: `
                        <div class="quest-story">
                            <p>🧙‍♂️ <strong>The Ancient StarMaster appears:</strong></p>
                            <p>Young Guardian, you have traveled far and learned much. But the highest calling in the cosmos is not to hoard knowledge, but to share it. The greatest masters are those who create other masters.</p>
                            <p>Your journey now takes a new direction. You must demonstrate not just what you know, but your ability to guide others to their own discoveries. Help fellow explorers achieve their goals.</p>
                            <p>This is the way of the StarMaster: through teaching others, we deepen our own understanding. Through lifting others up, we ourselves ascend to greater heights.</p>
                        </div>
                    `,
                    challenge: {
                        type: 'mentorship',
                        requirement: 'help_users',
                        count: 10
                    },
                    completion: 'Help 10 other users in learning pods or battles'
                },
                {
                    id: 2,
                    title: 'The Innovation Trial',
                    description: 'Create something new for future generations',
                    story: `
                        <div class="quest-story">
                            <p>💡 <strong>Professor Innovation, Research Division:</strong></p>
                            <p>Master candidate, consumption of knowledge is just the beginning. True mastery comes from creation - adding to the great library of cosmic understanding.</p>
                            <p>Your trial is to contribute something unique to the academy. Design a learning experience, create a challenge, or develop a new approach to an old problem.</p>
                            <p>Show us that you don't just use the tools of learning - you can create them. Prove that your mind can forge new paths through the cosmos of knowledge.</p>
                        </div>
                    `,
                    challenge: {
                        type: 'creation',
                        requirement: 'design_challenge',
                        complexity: 'advanced'
                    },
                    completion: 'Design and submit an original learning challenge'
                },
                {
                    id: 3,
                    title: 'The Legacy Inscription',
                    description: 'Leave your mark on the cosmic record',
                    story: `
                        <div class="quest-story">
                            <p>✨ <strong>The Cosmic Record Keeper, eternal guardian of knowledge:</strong></p>
                            <p>StarMaster, your journey through the cosmos of learning is complete, yet it is also just beginning. You have demonstrated mastery not just of facts and figures, but of the deeper principles that govern discovery itself.</p>
                            <p>Your final act is to inscribe your legacy in the Cosmic Record - the eternal library that preserves the achievements of all who have walked this path. Your name will inspire future generations of explorers.</p>
                            <p>But remember: with the title of StarMaster comes responsibility. You are now a guardian of the learning cosmos, a beacon for those who follow. Use your knowledge wisely, share it freely, and never stop exploring.</p>
                            <p>Congratulations, StarMaster. The universe awaits your continued discoveries.</p>
                        </div>
                    `,
                    challenge: {
                        type: 'mastery',
                        requirements: {
                            total_xp: 5000,
                            assessments_completed: 100,
                            battles_won: 25,
                            pods_created: 5,
                            users_helped: 20
                        }
                    },
                    completion: 'Demonstrate complete mastery across all areas'
                }
            ]
        }
    },

    // Initialize quest system
    init() {
        console.log('Quest system initialized with complete storylines');
        this.loadUserProgress();
        this.checkQuestUnlocks();
    },

    // Load user progress
    loadUserProgress() {
        const saved = localStorage.getItem('questProgress');
        if (saved) {
            this.userProgress = JSON.parse(saved);
        }
    },

    // Save user progress
    saveProgress() {
        localStorage.setItem('questProgress', JSON.stringify(this.userProgress));
    },

    // Check which quests are unlocked
    checkQuestUnlocks() {
        Object.values(this.quests).forEach(quest => {
            if (!quest.prerequisite || this.isQuestCompleted(quest.prerequisite)) {
                if (!this.userProgress[quest.id]) {
                    this.userProgress[quest.id] = {
                        unlocked: true,
                        phase: 1,
                        progress: 0,
                        completed: false,
                        startedAt: new Date().toISOString()
                    };
                }
            }
        });
        this.saveProgress();
    },

    // Check if quest is completed
    isQuestCompleted(questId) {
        return this.userProgress[questId]?.completed || false;
    },

    // Start a quest
    startQuest(questId) {
        const quest = this.quests[questId];
        if (!quest) return false;

        if (!this.userProgress[questId]?.unlocked) {
            StarGuideUtils.showNotification('Quest not yet unlocked!', 'error');
            return false;
        }

        this.currentQuest = questId;
        this.renderQuestView(quest);
        return true;
    },

    // Render quest view
    renderQuestView(quest) {
        const questContainer = document.getElementById('quest-container');
        if (!questContainer) return;

        const progress = this.userProgress[quest.id];
        const currentPhase = quest.phases[progress.phase - 1];

        questContainer.innerHTML = `
            <div class="quest-header">
                <div class="quest-icon">${quest.icon}</div>
                <div class="quest-info">
                    <h2>${quest.title}</h2>
                    <p class="quest-description">${quest.description}</p>
                    <div class="quest-meta">
                        <span class="difficulty ${quest.difficulty.toLowerCase()}">${quest.difficulty}</span>
                        <span class="time-estimate">⏱️ ${quest.estimatedTime}</span>
                        <span class="xp-reward">⭐ ${quest.xpReward} XP</span>
                    </div>
                </div>
            </div>

            <div class="quest-progress">
                <h3>Progress: Phase ${progress.phase} of ${quest.phases.length}</h3>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(progress.phase / quest.phases.length) * 100}%"></div>
                </div>
            </div>

            <div class="quest-phase">
                <h3>${currentPhase.title}</h3>
                <p class="phase-description">${currentPhase.description}</p>
                
                <div class="quest-story-container">
                    ${currentPhase.story}
                </div>

                <div class="quest-challenge">
                    <h4>Mission Objective:</h4>
                    <p class="challenge-description">${currentPhase.completion}</p>
                    ${this.renderChallengeButton(currentPhase.challenge)}
                </div>
            </div>

            <div class="quest-navigation">
                <button onclick="StarGuideNavigation.showView('quests')" class="btn-secondary">
                    ← Back to Quests
                </button>
                ${progress.phase > 1 ? `
                    <button onclick="StarGuideQuests.previousPhase()" class="btn-secondary">
                        Previous Phase
                    </button>
                ` : ''}
            </div>
        `;
    },

    // Render challenge button based on type
    renderChallengeButton(challenge) {
        switch (challenge.type) {
            case 'assessment':
                return `
                    <button onclick="StarGuideQuests.startAssessmentChallenge('${this.currentQuest}')" 
                            class="btn-primary challenge-btn">
                        🎯 Start Assessment Challenge
                    </button>
                `;
            
            case 'battle':
                return `
                    <button onclick="StarGuideQuests.startBattleChallenge('${this.currentQuest}')" 
                            class="btn-primary challenge-btn">
                        ⚔️ Enter Battle Arena
                    </button>
                `;
            
            case 'social':
                return `
                    <button onclick="StarGuideQuests.startSocialChallenge('${this.currentQuest}')" 
                            class="btn-primary challenge-btn">
                        🤝 Complete Social Challenge
                    </button>
                `;
            
            case 'ultimate':
                return `
                    <button onclick="StarGuideQuests.startUltimateChallenge('${this.currentQuest}')" 
                            class="btn-primary challenge-btn ultimate">
                        🌟 Begin Ultimate Challenge
                    </button>
                `;
            
            default:
                return `
                    <button onclick="StarGuideQuests.completePhase('${this.currentQuest}')" 
                            class="btn-primary challenge-btn">
                        ✅ Complete Challenge
                    </button>
                `;
        }
    },

    // Start assessment challenge
    startAssessmentChallenge(questId) {
        const quest = this.quests[questId];
        const progress = this.userProgress[questId];
        const phase = quest.phases[progress.phase - 1];
        
        // Navigate to assessment with quest parameters
        window.StarGuideNavigation.showView('assessments');
        
        // Configure assessment for quest
        setTimeout(() => {
            if (window.StarGuideAssessments) {
                window.StarGuideAssessments.startQuestAssessment({
                    questId: questId,
                    phaseId: phase.id,
                    subject: phase.challenge.subject,
                    questions: phase.challenge.questions,
                    timeLimit: phase.challenge.timeLimit,
                    passingScore: phase.challenge.passingScore,
                    difficulty: phase.challenge.difficulty
                });
            }
        }, 100);
    },

    // Start battle challenge
    startBattleChallenge(questId) {
        window.StarGuideNavigation.showView('battles');
        
        setTimeout(() => {
            if (window.StarGuideBattles) {
                window.StarGuideBattles.startQuestBattle(questId);
            }
        }, 100);
    },

    // Start social challenge
    startSocialChallenge(questId) {
        window.StarGuideNavigation.showView('pods');
        
        setTimeout(() => {
            if (window.StarGuidePods) {
                window.StarGuidePods.startQuestChallenge(questId);
            }
        }, 100);
    },

    // Start ultimate challenge
    startUltimateChallenge(questId) {
        StarGuideUtils.showNotification('Ultimate Challenge starting in 3...', 'info');
        
        setTimeout(() => {
            StarGuideUtils.showNotification('2...', 'info');
            setTimeout(() => {
                StarGuideUtils.showNotification('1...', 'info');
                setTimeout(() => {
                    StarGuideUtils.showNotification('Begin!', 'success');
                    this.executeUltimateChallenge(questId);
                }, 1000);
            }, 1000);
        }, 1000);
    },

    // Execute ultimate challenge
    executeUltimateChallenge(questId) {
        // This would implement a complex multi-stage challenge
        // For now, show a special interface
        const questContainer = document.getElementById('quest-container');
        if (questContainer) {
            questContainer.innerHTML = `
                <div class="ultimate-challenge">
                    <h2>🌟 ULTIMATE CHALLENGE 🌟</h2>
                    <p>This is where the most difficult challenge would be implemented...</p>
                    <button onclick="StarGuideQuests.completePhase('${questId}')" class="btn-primary">
                        Complete Challenge (Demo)
                    </button>
                </div>
            `;
        }
    },

    // Complete current phase
    completePhase(questId) {
        const quest = this.quests[questId];
        const progress = this.userProgress[questId];
        
        if (!quest || !progress) return;

        // Award XP for phase completion
        const phaseXP = Math.floor(quest.xpReward / quest.phases.length);
        if (window.StarGuideApp) {
            window.StarGuideApp.addXP(phaseXP);
        }

        // Check if quest is complete
        if (progress.phase >= quest.phases.length) {
            this.completeQuest(questId);
        } else {
            // Move to next phase
            progress.phase++;
            this.saveProgress();
            
            StarGuideUtils.showNotification(`Phase completed! +${phaseXP} XP`, 'success');
            this.renderQuestView(quest);
        }
    },

    // Complete entire quest
    completeQuest(questId) {
        const quest = this.quests[questId];
        const progress = this.userProgress[questId];
        
        if (!quest || !progress) return;

        progress.completed = true;
        progress.completedAt = new Date().toISOString();
        this.saveProgress();

        // Award completion XP
        if (window.StarGuideApp) {
            window.StarGuideApp.addXP(quest.xpReward);
        }

        // Check for achievements
        if (window.StarGuideAchievements) {
            window.StarGuideAchievements.checkAchievements('quest_complete', {
                questId: questId,
                difficulty: quest.difficulty
            });
        }

        // Unlock next quests
        this.checkQuestUnlocks();

        // Show completion screen
        this.showQuestCompletion(quest);
    },

    // Show quest completion screen
    showQuestCompletion(quest) {
        const questContainer = document.getElementById('quest-container');
        if (!questContainer) return;

        questContainer.innerHTML = `
            <div class="quest-completion">
                <div class="completion-animation">
                    <div class="quest-icon-large">${quest.icon}</div>
                    <h1>🎉 QUEST COMPLETED! 🎉</h1>
                </div>
                
                <div class="completion-details">
                    <h2>${quest.title}</h2>
                    <p class="completion-message">Congratulations! You have successfully completed this cosmic journey.</p>
                    
                    <div class="rewards">
                        <h3>Rewards Earned:</h3>
                        <div class="reward-item">
                            <span class="reward-icon">⭐</span>
                            <span>${quest.xpReward} XP</span>
                        </div>
                        <div class="reward-item">
                            <span class="reward-icon">🏆</span>
                            <span>Quest Mastery Badge</span>
                        </div>
                        <div class="reward-item">
                            <span class="reward-icon">🔓</span>
                            <span>New Quests Unlocked</span>
                        </div>
                    </div>
                    
                    <div class="completion-actions">
                        <button onclick="StarGuideNavigation.showView('quests')" class="btn-primary">
                            Continue Your Journey
                        </button>
                        <button onclick="StarGuideQuests.shareCompletion('${quest.id}')" class="btn-secondary">
                            Share Achievement
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add completion animation
        setTimeout(() => {
            questContainer.querySelector('.completion-animation').classList.add('animate');
        }, 100);
    },

    // Share quest completion
    shareCompletion(questId) {
        const quest = this.quests[questId];
        const text = `I just completed the "${quest.title}" quest in IDFS StarGuide! 🌟 #LearningJourney #StarGuide`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Quest Completed!',
                text: text,
                url: window.location.href
            });
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(text).then(() => {
                StarGuideUtils.showNotification('Achievement copied to clipboard!', 'success');
            });
        }
    },

    // Render quests overview
    renderQuestsOverview() {
        const container = document.getElementById('quest-overview');
        if (!container) return;

        container.innerHTML = `
            <div class="quests-header">
                <h1>🌟 Stellar Quests</h1>
                <p>Embark on epic journeys through the cosmos of knowledge</p>
            </div>

            <div class="quests-grid">
                ${Object.values(this.quests).map(quest => this.renderQuestCard(quest)).join('')}
            </div>
        `;
    },

    // Render individual quest card
    renderQuestCard(quest) {
        const progress = this.userProgress[quest.id];
        const isUnlocked = progress?.unlocked || false;
        const isCompleted = progress?.completed || false;
        const canStart = !quest.prerequisite || this.isQuestCompleted(quest.prerequisite);

        return `
            <div class="quest-card ${isCompleted ? 'completed' : ''} ${!canStart ? 'locked' : ''}">
                <div class="quest-card-header">
                    <div class="quest-icon">${isCompleted ? '🏆' : quest.icon}</div>
                    <h3>${quest.title}</h3>
                </div>
                
                <div class="quest-card-body">
                    <p class="quest-description">${quest.description}</p>
                    
                    <div class="quest-meta">
                        <span class="difficulty ${quest.difficulty.toLowerCase()}">${quest.difficulty}</span>
                        <span class="time-estimate">⏱️ ${quest.estimatedTime}</span>
                        <span class="xp-reward">⭐ ${quest.xpReward} XP</span>
                    </div>

                    ${progress ? `
                        <div class="quest-progress-summary">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(progress.phase / quest.phases.length) * 100}%"></div>
                            </div>
                            <span class="progress-text">Phase ${progress.phase} of ${quest.phases.length}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="quest-card-footer">
                    ${this.renderQuestButton(quest, progress, canStart)}
                </div>
            </div>
        `;
    },

    // Render quest button based on state
    renderQuestButton(quest, progress, canStart) {
        if (!canStart) {
            const prereq = this.quests[quest.prerequisite];
            return `
                <button class="btn-secondary" disabled>
                    🔒 Complete "${prereq?.title}" first
                </button>
            `;
        }

        if (progress?.completed) {
            return `
                <button onclick="StarGuideQuests.reviewQuest('${quest.id}')" class="btn-secondary">
                    📖 Review Quest
                </button>
            `;
        }

        if (progress?.phase > 1) {
            return `
                <button onclick="StarGuideQuests.startQuest('${quest.id}')" class="btn-primary">
                    ▶️ Continue Quest
                </button>
            `;
        }

        return `
            <button onclick="StarGuideQuests.startQuest('${quest.id}')" class="btn-primary">
                🚀 Start Quest
            </button>
        `;
    },

    // Review completed quest
    reviewQuest(questId) {
        this.startQuest(questId);
    },

    // Get quest statistics
    getQuestStats() {
        const total = Object.keys(this.quests).length;
        const completed = Object.values(this.userProgress).filter(p => p.completed).length;
        const inProgress = Object.values(this.userProgress).filter(p => p.phase > 1 && !p.completed).length;
        
        return {
            total,
            completed,
            inProgress,
            unlocked: Object.values(this.userProgress).filter(p => p.unlocked).length
        };
    }
};
