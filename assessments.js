/**
 * IDFS StarGuide - Assessments Module
 * Handles skill assessments and quizzes
 */

window.StarGuideAssessments = {
    currentAssessment: null,
    currentQuestion: 0,
    score: 0,
    timeLeft: 0,
    timer: null,
    answers: [],

    // Initialize module
    init() {
        console.log('Assessments module initialized');
    },

    // Start an assessment
    async startAssessment(category) {
        console.log(`Starting assessment: ${category}`);
        
        // Show loading
        const assessmentArea = document.getElementById('assessment-area');
        assessmentArea.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading assessment...</p>
        `;

        try {
            // Fetch questions from backend
            const response = await fetch(`/api/assessments/questions?category=${category}&count=10`);
            const data = await response.json();

            if (data.success) {
                this.currentAssessment = {
                    category: category,
                    questions: data.questions,
                    startTime: Date.now()
                };
                this.currentQuestion = 0;
                this.score = 0;
                this.answers = [];
                this.showQuestion();
            } else {
                throw new Error(data.message || 'Failed to load questions');
            }
        } catch (error) {
            console.error('Error starting assessment:', error);
            // Use fallback questions
            this.loadFallbackQuestions(category);
        }
    },

    // Load fallback questions if API fails
    loadFallbackQuestions(category) {
        const questions = this.getFallbackQuestions(category);
        this.currentAssessment = {
            category: category,
            questions: questions,
            startTime: Date.now()
        };
        this.currentQuestion = 0;
        this.score = 0;
        this.answers = [];
        this.showQuestion();
    },

    // Get fallback questions
    getFallbackQuestions(category) {
        const questionSets = {
            javascript: [
                {
                    question: "What is the correct way to declare a variable in JavaScript ES6?",
                    options: ["var x = 5;", "let x = 5;", "variable x = 5;", "int x = 5;"],
                    correct: 1,
                    explanation: "In ES6, 'let' is the preferred way to declare variables with block scope."
                },
                {
                    question: "Which method is used to add an element to the end of an array?",
                    options: ["push()", "pop()", "shift()", "unshift()"],
                    correct: 0,
                    explanation: "The push() method adds one or more elements to the end of an array."
                },
                {
                    question: "What does '===' compare in JavaScript?",
                    options: ["Only value", "Only type", "Both value and type", "Neither value nor type"],
                    correct: 2,
                    explanation: "The === operator compares both value and type (strict equality)."
                },
                {
                    question: "Which of the following is NOT a JavaScript data type?",
                    options: ["undefined", "number", "float", "boolean"],
                    correct: 2,
                    explanation: "JavaScript doesn't have a separate 'float' type. All numbers are of type 'number'."
                },
                {
                    question: "What is the result of: typeof null?",
                    options: ["'null'", "'undefined'", "'object'", "'boolean'"],
                    correct: 2,
                    explanation: "Due to a historical bug, typeof null returns 'object' in JavaScript."
                }
            ],
            python: [
                {
                    question: "How do you create a list in Python?",
                    options: ["list = {}", "list = []", "list = ()", "list = <>"],
                    correct: 1,
                    explanation: "Lists in Python are created using square brackets []."
                },
                {
                    question: "Which keyword is used to define a function in Python?",
                    options: ["function", "def", "func", "define"],
                    correct: 1,
                    explanation: "The 'def' keyword is used to define functions in Python."
                },
                {
                    question: "What is the correct way to comment in Python?",
                    options: ["// This is a comment", "# This is a comment", "/* This is a comment */", "-- This is a comment"],
                    correct: 1,
                    explanation: "In Python, comments start with the # symbol."
                },
                {
                    question: "How do you check the type of a variable in Python?",
                    options: ["typeof(x)", "type(x)", "x.type()", "checktype(x)"],
                    correct: 1,
                    explanation: "The type() function is used to check the type of a variable in Python."
                },
                {
                    question: "Which of these is immutable in Python?",
                    options: ["list", "dict", "tuple", "set"],
                    correct: 2,
                    explanation: "Tuples are immutable in Python - they cannot be changed after creation."
                }
            ],
            react: [
                {
                    question: "What is JSX?",
                    options: ["A JavaScript extension", "A CSS framework", "A database", "A testing library"],
                    correct: 0,
                    explanation: "JSX is a syntax extension for JavaScript used in React."
                },
                {
                    question: "Which hook is used for side effects in React?",
                    options: ["useState", "useEffect", "useContext", "useReducer"],
                    correct: 1,
                    explanation: "useEffect is used to perform side effects in React components."
                },
                {
                    question: "What is the virtual DOM?",
                    options: ["A copy of the real DOM", "A JavaScript library", "A CSS property", "A database"],
                    correct: 0,
                    explanation: "The virtual DOM is a JavaScript representation of the real DOM."
                },
                {
                    question: "How do you pass data from parent to child component?",
                    options: ["Using state", "Using props", "Using context", "Using refs"],
                    correct: 1,
                    explanation: "Props are used to pass data from parent to child components."
                },
                {
                    question: "What does useState return?",
                    options: ["A single value", "An array with two elements", "An object", "A function"],
                    correct: 1,
                    explanation: "useState returns an array with the current state value and a setter function."
                }
            ],
            general: [
                {
                    question: "What does API stand for?",
                    options: ["Application Programming Interface", "Advanced Programming Interface", "Application Process Integration", "Automated Programming Interface"],
                    correct: 0,
                    explanation: "API stands for Application Programming Interface."
                },
                {
                    question: "What is Git?",
                    options: ["A programming language", "A version control system", "A database", "An operating system"],
                    correct: 1,
                    explanation: "Git is a distributed version control system."
                },
                {
                    question: "What is the purpose of a database index?",
                    options: ["To encrypt data", "To speed up queries", "To backup data", "To compress data"],
                    correct: 1,
                    explanation: "Database indexes are used to speed up data retrieval operations."
                },
                {
                    question: "What does HTTP stand for?",
                    options: ["HyperText Transfer Protocol", "High Transfer Protocol", "Home Transfer Protocol", "HyperText Transaction Protocol"],
                    correct: 0,
                    explanation: "HTTP stands for HyperText Transfer Protocol."
                },
                {
                    question: "What is cloud computing?",
                    options: ["Storing data in the sky", "On-demand computing resources over the internet", "A type of weather prediction", "Local server storage"],
                    correct: 1,
                    explanation: "Cloud computing provides on-demand computing resources over the internet."
                }
            ]
        };

        // Return 5 random questions from the category
        const allQuestions = questionSets[category] || questionSets.general;
        return allQuestions.sort(() => Math.random() - 0.5).slice(0, 5);
    },

    // Show current question
    showQuestion() {
        if (!this.currentAssessment || this.currentQuestion >= this.currentAssessment.questions.length) {
            this.finishAssessment();
            return;
        }

        const question = this.currentAssessment.questions[this.currentQuestion];
        const assessmentArea = document.getElementById('assessment-area');

        assessmentArea.innerHTML = `
            <div class="assessment-header">
                <h3>${this.currentAssessment.category.toUpperCase()} Assessment</h3>
                <div class="assessment-progress">
                    <span>Question ${this.currentQuestion + 1} of ${this.currentAssessment.questions.length}</span>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${((this.currentQuestion + 1) / this.currentAssessment.questions.length) * 100}%"></div>
                    </div>
                </div>
                <div class="timer" id="assessment-timer">
                    <span class="timer-icon">⏱️</span>
                    <span class="timer-text">30s</span>
                </div>
            </div>

            <div class="question-container">
                <h2 class="question-text">${question.question}</h2>
                
                <div class="options-container">
                    ${question.options.map((option, index) => `
                        <div class="option-card" onclick="StarGuideAssessments.selectAnswer(${index})">
                            <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                            <span class="option-text">${option}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="assessment-actions">
                <button class="btn btn-secondary" onclick="StarGuideAssessments.skipQuestion()">Skip</button>
            </div>
        `;

        // Start timer
        this.startTimer();
    },

    // Start question timer
    startTimer() {
        this.timeLeft = 30;
        this.updateTimer();

        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();

            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.selectAnswer(-1); // Time's up, no answer
            }
        }, 1000);
    },

    // Update timer display
    updateTimer() {
        const timerElement = document.querySelector('.timer-text');
        if (timerElement) {
            timerElement.textContent = `${this.timeLeft}s`;
            
            // Add warning class if time is running out
            if (this.timeLeft <= 10) {
                timerElement.parentElement.classList.add('timer-warning');
            }
        }
    },

    // Select an answer
    selectAnswer(index) {
        clearInterval(this.timer);

        const question = this.currentAssessment.questions[this.currentQuestion];
        const isCorrect = index === question.correct;

        // Store answer
        this.answers.push({
            questionIndex: this.currentQuestion,
            selectedAnswer: index,
            isCorrect: isCorrect,
            timeSpent: 30 - this.timeLeft
        });

        // Update score
        if (isCorrect) {
            this.score++;
            // Calculate XP based on time spent
            const xpEarned = Math.max(10, 50 - (30 - this.timeLeft));
            this.addXP(xpEarned);
        }

        // Show feedback
        this.showFeedback(isCorrect, question.explanation);
    },

    // Show answer feedback
    showFeedback(isCorrect, explanation) {
        const feedbackHtml = `
            <div class="feedback-overlay">
                <div class="feedback-card ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="feedback-icon">${isCorrect ? '✅' : '❌'}</div>
                    <h3>${isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                    <p>${explanation}</p>
                    <button class="btn btn-primary" onclick="StarGuideAssessments.nextQuestion()">
                        ${this.currentQuestion < this.currentAssessment.questions.length - 1 ? 'Next Question' : 'Finish Assessment'}
                    </button>
                </div>
            </div>
        `;

        document.getElementById('assessment-area').insertAdjacentHTML('beforeend', feedbackHtml);
    },

    // Skip current question
    skipQuestion() {
        this.selectAnswer(-1);
    },

    // Go to next question
    nextQuestion() {
        this.currentQuestion++;
        this.showQuestion();
    },

    // Finish assessment
    async finishAssessment() {
        const totalQuestions = this.currentAssessment.questions.length;
        const percentage = Math.round((this.score / totalQuestions) * 100);
        const timeTaken = Math.round((Date.now() - this.currentAssessment.startTime) / 1000);

        // Calculate performance rating
        let rating = 'Needs Practice';
        if (percentage >= 90) rating = 'Excellent!';
        else if (percentage >= 70) rating = 'Good Job!';
        else if (percentage >= 50) rating = 'Keep Learning!';

        // Save results
        try {
            await fetch('/api/assessments/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: this.currentAssessment.category,
                    score: this.score,
                    totalQuestions: totalQuestions,
                    percentage: percentage,
                    timeTaken: timeTaken,
                    answers: this.answers
                })
            });
        } catch (error) {
            console.error('Error saving assessment results:', error);
        }

        // Show results
        const assessmentArea = document.getElementById('assessment-area');
        assessmentArea.innerHTML = `
            <div class="assessment-results">
                <h2>Assessment Complete!</h2>
                
                <div class="results-summary">
                    <div class="result-card">
                        <div class="result-icon">🎯</div>
                        <h3>Score</h3>
                        <p class="result-value">${this.score} / ${totalQuestions}</p>
                    </div>
                    
                    <div class="result-card">
                        <div class="result-icon">📊</div>
                        <h3>Percentage</h3>
                        <p class="result-value">${percentage}%</p>
                    </div>
                    
                    <div class="result-card">
                        <div class="result-icon">⏱️</div>
                        <h3>Time</h3>
                        <p class="result-value">${this.formatTime(timeTaken)}</p>
                    </div>
                    
                    <div class="result-card">
                        <div class="result-icon">⭐</div>
                        <h3>Rating</h3>
                        <p class="result-value">${rating}</p>
                    </div>
                </div>

                <div class="results-breakdown">
                    <h3>Question Breakdown</h3>
                    <div class="breakdown-list">
                        ${this.answers.map((answer, index) => `
                            <div class="breakdown-item ${answer.isCorrect ? 'correct' : 'incorrect'}">
                                <span>Question ${index + 1}</span>
                                <span>${answer.isCorrect ? '✅' : '❌'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="results-actions">
                    <button class="btn btn-primary" onclick="StarGuideAssessments.retakeAssessment()">Retake Assessment</button>
                    <button class="btn btn-secondary" onclick="StarGuideNavigation.navigateTo('skill-assessment')">Choose Another</button>
                </div>
            </div>
        `;

        // Check for achievements
        this.checkAchievements(percentage);
    },

    // Format time display
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    // Retake the same assessment
    retakeAssessment() {
        if (this.currentAssessment) {
            this.startAssessment(this.currentAssessment.category);
        }
    },

    // Add XP to user
    addXP(amount) {
        if (window.StarGuideApp && window.StarGuideApp.addXP) {
            window.StarGuideApp.addXP(amount);
        }
    },

    // Check for assessment achievements
    checkAchievements(percentage) {
        if (percentage === 100) {
            StarGuideUtils.showNotification('🏆 Perfect Score! Achievement Unlocked!', 'success');
        } else if (percentage >= 90) {
            StarGuideUtils.showNotification('⭐ Excellence Achievement Unlocked!', 'success');
        }
    }
};