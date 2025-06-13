/**
 * IDFS StarGuide - Configuration
 * Central configuration for the application
 */

// Firebase configuration (replace with your config)
window.firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// API Configuration
window.apiConfig = {
    baseUrl: window.location.origin,
    endpoints: {
        demoLogin: '/api/demo-login',
        logout: '/api/logout',
        profile: '/api/get-profile',
        questions: '/api/get-questions',
        validateAnswer: '/api/validate-answer',
        submitAssessment: '/api/submit-assessment',
        aiChat: '/api/ai-chat',
        findBattle: '/api/find-battle',
        createPod: '/api/create-pod',
        getPods: '/api/get-pods',
        dailyChallenges: '/api/get-daily-challenges',
        tournaments: '/api/get-tournaments',
        helpRequest: '/api/submit-help-request',
        analytics: '/api/get-analytics'
    }
};

// AI Provider Configuration
window.aiConfig = {
    providers: {
        openai: {
            available: true,
            model: 'gpt-3.5-turbo',
            maxTokens: 200
        },
        claude: {
            available: false,
            model: 'claude-3-sonnet'
        },
        gemini: {
            available: false,
            model: 'gemini-pro'
        }
    },
    defaultProvider: 'openai'
};

// Application Settings
window.appSettings = {
    // Assessment settings
    assessment: {
        defaultTimeLimit: 1800, // 30 minutes
        hintPenalty: 5, // XP penalty for using hints
        passingScore: 60,
        excellentScore: 80
    },
    
    // Battle settings
    battle: {
        questionsPerBattle: 5,
        timePerQuestion: 30, // seconds
        matchmakingTimeout: 10000 // 10 seconds
    },
    
    // XP and Leveling
    progression: {
        xpPerLevel: 100,
        baseXpReward: 10,
        perfectScoreBonus: 50,
        streakBonus: 10
    },
    
    // Notification settings
    notifications: {
        defaultDuration: 4000,
        errorDuration: 6000,
        successDuration: 3000
    },
    
    // UI settings
    ui: {
        animationDuration: 300,
        debounceDelay: 300,
        autoSaveInterval: 30000 // 30 seconds
    }
};

// Achievement definitions
window.achievements = [
    {
        id: 'first-steps',
        name: 'First Steps',
        description: 'Complete your first assessment',
        icon: '👶',
        rarity: 'common',
        xpReward: 10
    },
    {
        id: 'quick-learner',
        name: 'Quick Learner',
        description: 'Complete an assessment in under 5 minutes',
        icon: '🚀',
        rarity: 'uncommon',
        xpReward: 25
    },
    {
        id: 'high-scorer',
        name: 'High Scorer',
        description: 'Score 80% or higher on an assessment',
        icon: '🎯',
        rarity: 'rare',
        xpReward: 30
    },
    {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Achieve a perfect score',
        icon: '💯',
        rarity: 'legendary',
        xpReward: 100
    },
    {
        id: 'level-up',
        name: 'Level Up',
        description: 'Reach a new level',
        icon: '📈',
        rarity: 'common',
        xpReward: 15
    },
    {
        id: 'streak-master',
        name: 'Streak Master',
        description: 'Maintain a 7-day learning streak',
        icon: '🔥',
        rarity: 'epic',
        xpReward: 75
    },
    {
        id: 'battle-winner',
        name: 'Battle Winner',
        description: 'Win your first battle',
        icon: '⚔️',
        rarity: 'uncommon',
        xpReward: 20
    },
    {
        id: 'marathon-runner',
        name: 'Marathon Runner',
        description: 'Complete 50 assessments',
        icon: '🏃',
        rarity: 'epic',
        xpReward: 100
    },
    {
        id: 'helping-hand',
        name: 'Helping Hand',
        description: 'Help 10 other students',
        icon: '🤝',
        rarity: 'rare',
        xpReward: 50
    },
    {
        id: 'scholar',
        name: 'Scholar',
        description: 'Reach level 20',
        icon: '🎓',
        rarity: 'legendary',
        xpReward: 200
    }
];

// Subject configuration
window.subjects = {
    math: {
        name: 'Mathematics',
        icon: '🔢',
        color: '#4CAF50',
        topics: ['Algebra', 'Geometry', 'Calculus', 'Statistics']
    },
    science: {
        name: 'Science',
        icon: '🔬',
        color: '#2196F3',
        topics: ['Physics', 'Chemistry', 'Biology', 'Earth Science']
    },
    english: {
        name: 'English',
        icon: '📚',
        color: '#FF9800',
        topics: ['Grammar', 'Literature', 'Writing', 'Vocabulary']
    },
    history: {
        name: 'History',
        icon: '🏛️',
        color: '#9C27B0',
        topics: ['World History', 'US History', 'Geography', 'Civics']
    }
};

// Debug mode
window.debugMode = window.location.hostname === 'localhost';

// Log configuration if in debug mode
if (window.debugMode) {
    console.log('🔧 IDFS StarGuide Configuration Loaded');
    console.log('Firebase:', window.firebaseConfig);
    console.log('API:', window.apiConfig);
    console.log('Settings:', window.appSettings);
}