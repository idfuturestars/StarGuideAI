/**
 * IDFS StarGuide - Battle Arena Module
 * Code battles against AI bosses
 */

window.StarGuideBattles = {
    currentBattle: null,
    playerHP: 100,
    bossHP: 100,
    combo: 0,
    
    // Boss configurations
    bosses: {
        'javascript-ninja': {
            name: 'JavaScript Ninja',
            avatar: '🥷',
            level: 5,
            hp: 100,
            attacks: ['Callback Hell', 'Promise Chain', 'Scope Strike', 'Closure Trap'],
            difficulty: 'medium'
        },
        'python-wizard': {
            name: 'Python Wizard',
            avatar: '🧙‍♂️',
            level: 8,
            hp: 150,
            attacks: ['Indentation Error', 'List Comprehension', 'Lambda Strike', 'Decorator Curse'],
            difficulty: 'hard'
        },
        'react-robot': {
            name: 'React Robot',
            avatar: '🤖',
            level: 10,
            hp: 200,
            attacks: ['State Mutation', 'Prop Drilling', 'Hook Violation', 'Component Crash'],
            difficulty: 'expert'
        }
    },

    // Initialize module
    init() {
        console.log('Battle Arena module initialized');
    },

    // Start a battle
    async startBattle(bossId) {
        const boss = this.bosses[bossId];
        if (!boss) {
            StarGuideUtils.showNotification('Boss not found!', 'error');
            return;
        }

        // Check if user meets level requirement
        const userLevel = StarGuideApp.state.user?.level || 1;
        if (userLevel < boss.level - 2) {
            StarGuideUtils.showNotification(`You need to be at least level ${boss.level - 2} to challenge this boss!`, 'warning');
            return;
        }

        this.currentBattle = {
            bossId: bossId,
            boss: boss,
            startTime: Date.now(),
            questionsAnswered: 0,
            correctAnswers: 0
        };

        this.playerHP = 100;
        this.bossHP = boss.hp;
        this.combo = 0;

        this.showBattleArena();
    },

    // Show battle arena UI
    showBattleArena() {
        const battleArea = document.getElementById('battle-area');
        const boss = this.currentBattle.boss;

        battleArea.innerHTML = `
            <div class="battle-scene">
                <div class="battle-header">
                    <h2>Battle: ${boss.name}</h2>
                    <div class="battle-timer">
                        <span id="battle-timer">0:00</span>
                    </div>
                </div>

                <div class="battle-field">
                    <div class="fighter player">
                        <div class="fighter-info">
                            <h3>${StarGuideApp.state.user?.username || 'Player'}</h3>
                            <div class="health-bar">
                                <div class="health-fill player-health" style="width: ${this.playerHP}%">
                                    <span>${this.playerHP}/100</span>
                                </div>
                            </div>
                        </div>
                        <div class="fighter-avatar">⚔️</div>
                        <div class="combo-meter">
                            <span>Combo: <span id="combo-count">${this.combo}</span></span>
                        </div>
                    </div>

                    <div class="battle-vs">VS</div>

                    <div class="fighter boss">
                        <div class="fighter-info">
                            <h3>${boss.name}</h3>
                            <div class="health-bar">
                                <div class="health-fill boss-health" style="width: ${(this.bossHP / boss.hp) * 100}%">
                                    <span>${this.bossHP}/${boss.hp}</span>
                                </div>
                            </div>
                        </div>
                        <div class="fighter-avatar boss-avatar">${boss.avatar}</div>
                        <div class="boss-level">Level ${boss.level}</div>
                    </div>
                </div>

                <div class="battle-console">
                    <div id="battle-log">
                        <p class="battle-start">⚔️ Battle Started! Answer coding questions to attack!</p>
                    </div>
                </div>

                <div id="battle-question-area">
                    <!-- Questions will appear here -->
                </div>
            </div>
        `;

        // Start battle timer
        this.startBattleTimer();
        
        // Load first question
        setTimeout(() => this.loadBattleQuestion(), 1000);
    },

    // Start battle timer
    startBattleTimer() {
        const startTime = Date.now();
        
        this.battleTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            
            const timerElement = document.getElementById('battle-timer');
            if (timerElement) {
                timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    },

    // Load a battle question
    async loadBattleQuestion() {
        const questionArea = document.getElementById('battle-question-area');
        
        try {
            // Fetch question from backend
            const response = await fetch(`/api/battles/question?difficulty=${this.currentBattle.boss.difficulty}`);
            const data = await response.json();

            if (data.success) {
                this.showBattleQuestion(data.question);
            } else {
                throw new Error('Failed to load question');
            }
        } catch (error) {
            console.error('Error loading battle question:', error);
            // Use fallback question
            this.showBattleQuestion(this.getFallbackBattleQuestion());
        }
    },

    // Get fallback battle question
    getFallbackBattleQuestion() {
        const questions = [
            {
                question: "Quick! Fix this code:\n```javascript\nfunction sum(a b) {\n  return a + b\n}\n```",
                options: [
                    "Add semicolon after b",
                    "Add comma between a and b",
                    "Add parentheses around a + b",
                    "Remove the return statement"
                ],
                correct: 1,
                type: "debug"
            },
            {
                question: "What will this code output?\n```javascript\nconsole.log(typeof [])\n```",
                options: ["array", "object", "undefined", "list"],
                correct: 1,
                type: "output"
            },
            {
                question: "Complete the function:\n```javascript\nfunction reverseString(str) {\n  return str.______.reverse().______()\n}\n```",
                options: [
                    "split(''), join('')",
                    "slice(), concat()",
                    "charAt(), toString()",
                    "substring(), append()"
                ],
                correct: 0,
                type: "complete"
            }
        ];

        return questions[Math.floor(Math.random() * questions.length)];
    },

    // Show battle question
    showBattleQuestion(question) {
        const questionArea = document.getElementById('battle-question-area');
        
        questionArea.innerHTML = `
            <div class="battle-question">
                <div class="question-header">
                    <span class="question-type">${question.type || 'CHALLENGE'}</span>
                    <span class="question-timer" id="question-timer">15s</span>
                </div>
                
                <div class="question-content">
                    <pre>${question.question}</pre>
                </div>

                <div class="battle-options">
                    ${question.options.map((option, index) => `
                        <button class="battle-option" onclick="StarGuideBattles.answerQuestion(${index})">
                            ${String.fromCharCode(65 + index)}. ${option}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Store current question
        this.currentQuestion = question;
        
        // Start question timer
        this.startQuestionTimer();
    },

    // Start question timer
    startQuestionTimer() {
        let timeLeft = 15;
        
        const updateTimer = () => {
            const timerElement = document.getElementById('question-timer');
            if (timerElement) {
                timerElement.textContent = `${timeLeft}s`;
                if (timeLeft <= 5) {
                    timerElement.classList.add('timer-critical');
                }
            }
        };

        updateTimer();

        this.questionTimer = setInterval(() => {
            timeLeft--;
            updateTimer();

            if (timeLeft <= 0) {
                clearInterval(this.questionTimer);
                this.answerQuestion(-1); // Time's up
            }
        }, 1000);
    },

    // Answer a question
    answerQuestion(index) {
        clearInterval(this.questionTimer);

        const isCorrect = index === this.currentQuestion.correct;
        this.currentBattle.questionsAnswered++;

        if (isCorrect) {
            this.currentBattle.correctAnswers++;
            this.playerAttack();
        } else {
            this.bossAttack();
        }

        // Check battle status
        if (this.playerHP <= 0 || this.bossHP <= 0) {
            this.endBattle();
        } else {
            // Load next question after a delay
            setTimeout(() => this.loadBattleQuestion(), 2000);
        }
    },

    // Player attacks boss
    playerAttack() {
        this.combo++;
        const damage = 10 + (this.combo * 2); // Increased damage with combo
        this.bossHP = Math.max(0, this.bossHP - damage);

        this.updateHealthBars();
        this.addBattleLog(`✅ Correct! You deal ${damage} damage! Combo x${this.combo}`, 'player-action');
        
        // Visual effect
        this.showAttackEffect('boss');
        
        // Update combo display
        document.getElementById('combo-count').textContent = this.combo;
    },

    // Boss attacks player
    bossAttack() {
        this.combo = 0; // Reset combo
        const boss = this.currentBattle.boss;
        const attack = boss.attacks[Math.floor(Math.random() * boss.attacks.length)];
        const damage = 15 + (boss.level * 2);
        
        this.playerHP = Math.max(0, this.playerHP - damage);

        this.updateHealthBars();
        this.addBattleLog(`❌ Wrong! ${boss.name} uses ${attack} for ${damage} damage!`, 'boss-action');
        
        // Visual effect
        this.showAttackEffect('player');
        
        // Update combo display
        document.getElementById('combo-count').textContent = this.combo;
    },

    // Update health bars
    updateHealthBars() {
        const playerHealthBar = document.querySelector('.player-health');
        const bossHealthBar = document.querySelector('.boss-health');

        if (playerHealthBar) {
            playerHealthBar.style.width = `${this.playerHP}%`;
            playerHealthBar.querySelector('span').textContent = `${this.playerHP}/100`;
        }

        if (bossHealthBar) {
            const bossHPPercentage = (this.bossHP / this.currentBattle.boss.hp) * 100;
            bossHealthBar.style.width = `${bossHPPercentage}%`;
            bossHealthBar.querySelector('span').textContent = `${this.bossHP}/${this.currentBattle.boss.hp}`;
        }
    },

    // Show attack visual effect
    showAttackEffect(target) {
        const targetElement = document.querySelector(`.fighter.${target}`);
        if (targetElement) {
            targetElement.classList.add('hit');
            setTimeout(() => targetElement.classList.remove('hit'), 500);
        }
    },

    // Add to battle log
    addBattleLog(message, className = '') {
        const battleLog = document.getElementById('battle-log');
        if (battleLog) {
            const logEntry = document.createElement('p');
            logEntry.className = className;
            logEntry.textContent = message;
            battleLog.appendChild(logEntry);
            battleLog.scrollTop = battleLog.scrollHeight;
        }
    },

    // End battle
    async endBattle() {
        clearInterval(this.battleTimer);
        clearInterval(this.questionTimer);

        const won = this.playerHP > 0;
        const battleTime = Math.floor((Date.now() - this.currentBattle.startTime) / 1000);
        const accuracy = Math.round((this.currentBattle.correctAnswers / this.currentBattle.questionsAnswered) * 100);

        // Calculate rewards
        let xpReward = 0;
        let message = '';

        if (won) {
            xpReward = 100 + (this.currentBattle.boss.level * 10);
            message = `Victory! You defeated ${this.currentBattle.boss.name}!`;
            
            // Bonus XP for accuracy
            if (accuracy >= 80) {
                xpReward += 50;
            }
        } else {
            xpReward = 25; // Consolation XP
            message = `Defeat! ${this.currentBattle.boss.name} was too strong!`;
        }

        // Save battle results
        try {
            await fetch('/api/battles/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bossId: this.currentBattle.bossId,
                    won: won,
                    questionsAnswered: this.currentBattle.questionsAnswered,
                    correctAnswers: this.currentBattle.correctAnswers,
                    accuracy: accuracy,
                    battleTime: battleTime,
                    xpEarned: xpReward
                })
            });
        } catch (error) {
            console.error('Error saving battle results:', error);
        }

        // Add XP
        if (window.StarGuideApp) {
            window.StarGuideApp.addXP(xpReward);
        }

        // Show results
        this.showBattleResults(won, xpReward, accuracy, battleTime);
    },

    // Show battle results
    showBattleResults(won, xpReward, accuracy, battleTime) {
        const battleArea = document.getElementById('battle-area');
        
        battleArea.innerHTML = `
            <div class="battle-results ${won ? 'victory' : 'defeat'}">
                <div class="results-header">
                    <h1>${won ? '🏆 VICTORY!' : '💀 DEFEAT!'}</h1>
                    <p>${won ? 'You are victorious!' : 'Better luck next time!'}</p>
                </div>

                <div class="results-stats">
                    <div class="stat-item">
                        <span class="stat-label">XP Earned</span>
                        <span class="stat-value">+${xpReward} XP</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Accuracy</span>
                        <span class="stat-value">${accuracy}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Battle Time</span>
                        <span class="stat-value">${Math.floor(battleTime / 60)}:${(battleTime % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Max Combo</span>
                        <span class="stat-value">x${this.combo}</span>
                    </div>
                </div>

                <div class="results-actions">
                    <button class="btn btn-primary" onclick="StarGuideBattles.startBattle('${this.currentBattle.bossId}')">
                        ${won ? 'Battle Again' : 'Try Again'}
                    </button>
                    <button class="btn btn-secondary" onclick="StarGuideNavigation.navigateTo('battle-arena')">
                        Choose Another Boss
                    </button>
                </div>
            </div>
        `;

        // Check for achievements
        if (won && accuracy === 100) {
            StarGuideUtils.showNotification('🏆 Perfect Battle! Achievement Unlocked!', 'success');
        }
    }
};