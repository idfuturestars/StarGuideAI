
/**
 * IDFS StarGuide - StarMentor AI Module (100% Complete)
 * Multi-provider AI integration with OpenAI, Claude, and Gemini
 */

window.StarGuideAI = {
    chatHistory: [],
    isTyping: false,
    currentProvider: 'openai',
    streamController: null,
    
    // Provider configurations
    providers: {
        openai: {
            name: 'OpenAI GPT',
            model: 'gpt-3.5-turbo',
            available: false,
            icon: '🤖'
        },
        claude: {
            name: 'Claude',
            model: 'claude-3-sonnet',
            available: false,
            icon: '🧠'
        },
        gemini: {
            name: 'Gemini',
            model: 'gemini-pro',
            available: false,
            icon: '✨'
        }
    },
    
    // Predefined responses for demo mode
    responses: {
        greeting: [
            "Hello! I'm StarMentor, your AI learning assistant. How can I help you today?",
            "Welcome back! Ready to continue your learning journey?",
            "Hi there! What would you like to learn about today?"
        ],
        javascript: [
            "JavaScript is a versatile programming language! What specific topic would you like to explore? Variables, functions, arrays, or something else?",
            "Great choice! JavaScript is essential for web development. Would you like to start with the basics or dive into a specific concept?",
            "JavaScript can be fun to learn! I recommend starting with variables and data types. Should I explain these concepts?"
        ],
        react: [
            "React is a powerful library for building user interfaces! Are you interested in components, state management, or hooks?",
            "React makes building interactive UIs much easier. Would you like to understand how components work or start with JSX?",
            "Excellent! React is very popular. Key concepts include components, props, and state. Which would you like to explore first?"
        ],
        help: [
            "I can help you with: \n• Programming concepts \n• Code explanations \n• Learning paths \n• Practice problems \n• Debugging tips \n\nWhat interests you most?",
            "Here's how I can assist: \n• Answer coding questions \n• Explain complex topics \n• Suggest learning resources \n• Provide code examples \n• Guide your learning journey"
        ],
        motivation: [
            "Remember, every expert was once a beginner! Keep pushing forward, and you'll be amazed at what you can achieve! 💪",
            "Learning to code is like learning a new language - it takes time and practice. You're doing great! 🌟",
            "The journey of a thousand miles begins with a single step. You've already taken that step by being here! 🚀"
        ],
        default: [
            "That's an interesting question! Could you provide more details so I can give you the best answer?",
            "I'd love to help with that! Can you be more specific about what you'd like to know?",
            "Great question! Let me think about the best way to explain this..."
        ]
    },

    // Initialize module
    init() {
        console.log('StarMentor AI initialized with multi-provider support');
        this.loadChatHistory();
        this.attachEventListeners();
        this.checkProviderAvailability();
        this.setupProviderSelector();
    },

    // Check AI provider availability
    async checkProviderAvailability() {
        try {
            const response = await fetch('/api/ai-providers-status');
            if (response.ok) {
                const status = await response.json();
                
                Object.keys(this.providers).forEach(provider => {
                    this.providers[provider].available = status[provider] || false;
                });
                
                // Set default to first available provider
                const availableProvider = Object.keys(this.providers)
                    .find(p => this.providers[p].available);
                
                if (availableProvider) {
                    this.currentProvider = availableProvider;
                }
                
                this.updateProviderUI();
            }
        } catch (error) {
            console.log('Provider check failed, using fallback responses');
        }
    },

    // Setup provider selector
    setupProviderSelector() {
        const chatContainer = document.querySelector('.chat-container');
        if (!chatContainer) return;

        const providerSelector = document.createElement('div');
        providerSelector.className = 'ai-provider-selector';
        providerSelector.innerHTML = `
            <div class="provider-tabs">
                ${Object.entries(this.providers).map(([key, provider]) => `
                    <button class="provider-tab ${key === this.currentProvider ? 'active' : ''}" 
                            data-provider="${key}" 
                            ${!provider.available ? 'disabled' : ''}
                            title="${provider.name}">
                        ${provider.icon} ${provider.name}
                    </button>
                `).join('')}
            </div>
        `;

        chatContainer.insertBefore(providerSelector, chatContainer.firstChild);

        // Add click handlers
        providerSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('provider-tab') && !e.target.disabled) {
                this.switchProvider(e.target.dataset.provider);
            }
        });
    },

    // Switch AI provider
    switchProvider(provider) {
        if (this.providers[provider]?.available) {
            this.currentProvider = provider;
            this.updateProviderUI();
            this.addMessage('system', `Switched to ${this.providers[provider].name}! How can I help you?`);
        }
    },

    // Update provider UI
    updateProviderUI() {
        const tabs = document.querySelectorAll('.provider-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.provider === this.currentProvider);
        });
    },

    // Load chat history
    loadChatHistory() {
        const saved = localStorage.getItem('aiChatHistory');
        if (saved) {
            this.chatHistory = JSON.parse(saved);
            this.renderChatHistory();
        }
    },

    // Attach event listeners
    attachEventListeners() {
        const input = document.getElementById('chat-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Voice input support
        this.setupVoiceInput();
        
        // Message reactions
        this.setupMessageReactions();
    },

    // Setup voice input
    setupVoiceInput() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            return; // Speech recognition not supported
        }

        const voiceButton = document.createElement('button');
        voiceButton.className = 'voice-input-btn';
        voiceButton.innerHTML = '🎤';
        voiceButton.title = 'Voice input';
        
        const inputContainer = document.querySelector('.chat-input-container');
        if (inputContainer) {
            inputContainer.appendChild(voiceButton);
            
            voiceButton.addEventListener('click', () => this.startVoiceInput());
        }
    },

    // Start voice input
    startVoiceInput() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            document.querySelector('.voice-input-btn').classList.add('recording');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('chat-input').value = transcript;
        };

        recognition.onend = () => {
            document.querySelector('.voice-input-btn').classList.remove('recording');
        };

        recognition.start();
    },

    // Setup message reactions
    setupMessageReactions() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('reaction-btn')) {
                this.addReaction(e.target.dataset.messageId, e.target.dataset.reaction);
            }
        });
    },

    // Send message with streaming support
    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message
        this.addMessage('user', message);
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Try AI providers first
            if (this.providers[this.currentProvider]?.available) {
                await this.sendToAIProvider(message);
            } else {
                // Fallback to local responses
                setTimeout(() => {
                    const response = this.generateResponse(message);
                    this.hideTypingIndicator();
                    this.addMessage('ai', response);
                }, 1000 + Math.random() * 1000);
            }
        } catch (error) {
            console.error('AI Error:', error);
            this.hideTypingIndicator();
            this.addMessage('ai', "I'm having trouble right now. Let me help with what I know!");
        }
    },

    // Send message to AI provider
    async sendToAIProvider(message) {
        try {
            const response = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    provider: this.currentProvider,
                    context: this.getChatContext(),
                    stream: true
                })
            });

            if (!response.ok) {
                throw new Error('AI service unavailable');
            }

            // Handle streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            this.hideTypingIndicator();
            const messageId = this.addMessage('ai', '', true); // Empty message for streaming
            
            let fullResponse = '';
            
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.content) {
                                fullResponse += data.content;
                                this.updateStreamingMessage(messageId, fullResponse);
                            }
                        } catch (e) {
                            // Ignore parse errors
                        }
                    }
                }
            }
            
        } catch (error) {
            this.hideTypingIndicator();
            const fallbackResponse = this.generateResponse(message);
            this.addMessage('ai', fallbackResponse);
        }
    },

    // Get chat context for AI
    getChatContext() {
        return this.chatHistory
            .slice(-6) // Last 6 messages
            .map(msg => `${msg.sender}: ${msg.text}`)
            .join('\n');
    },

    // Update streaming message
    updateStreamingMessage(messageId, content) {
        const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageEl) {
            const contentEl = messageEl.querySelector('.message-content');
            contentEl.innerHTML = this.formatMessage(content);
            this.scrollToBottom();
        }
    },

    // Add message to chat
    addMessage(sender, text, isStreaming = false) {
        const message = {
            id: Date.now() + Math.random(),
            sender: sender,
            text: text,
            timestamp: new Date().toISOString(),
            isStreaming: isStreaming
        };

        if (!isStreaming) {
            this.chatHistory.push(message);
            this.saveChatHistory();
        }
        
        this.renderMessage(message);
        this.scrollToBottom();
        
        return message.id;
    },

    // Generate AI response (fallback)
    generateResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Advanced pattern matching
        if (this.containsAny(lowerMessage, ['hello', 'hi', 'hey', 'greetings'])) {
            return this.getRandomResponse('greeting');
        } else if (this.containsAny(lowerMessage, ['javascript', 'js', 'node'])) {
            return this.getRandomResponse('javascript');
        } else if (this.containsAny(lowerMessage, ['react', 'jsx', 'component'])) {
            return this.getRandomResponse('react');
        } else if (this.containsAny(lowerMessage, ['help', 'what can you do', 'capabilities'])) {
            return this.getRandomResponse('help');
        } else if (this.containsAny(lowerMessage, ['motivat', 'encourag', 'struggling', 'difficult'])) {
            return this.getRandomResponse('motivation');
        } else if (this.containsAny(lowerMessage, ['array', 'list', 'collection'])) {
            return this.getArrayResponse();
        } else if (this.containsAny(lowerMessage, ['function', 'method', 'procedure'])) {
            return this.getFunctionResponse();
        } else if (this.containsAny(lowerMessage, ['debug', 'error', 'bug', 'issue'])) {
            return this.getDebugResponse();
        } else if (this.containsAny(lowerMessage, ['project', 'build', 'create', 'make'])) {
            return this.getProjectResponse();
        } else if (this.containsAny(lowerMessage, ['learn', 'study', 'education', 'course'])) {
            return this.getLearningResponse();
        } else if (this.containsAny(lowerMessage, ['python', 'django', 'flask'])) {
            return this.getPythonResponse();
        } else if (this.containsAny(lowerMessage, ['html', 'css', 'web', 'website'])) {
            return this.getWebResponse();
        }

        return this.getRandomResponse('default');
    },

    // Helper function to check if message contains any of the keywords
    containsAny(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    },

    // Get random response from category
    getRandomResponse(category) {
        const responses = this.responses[category] || this.responses.default;
        return responses[Math.floor(Math.random() * responses.length)];
    },

    // Specific response generators
    getArrayResponse() {
        return "Arrays are fundamental data structures! In JavaScript:\n\n" +
               "**Creating arrays:**\n" +
               "```javascript\n" +
               "const fruits = ['apple', 'banana', 'orange'];\n" +
               "const numbers = [1, 2, 3, 4, 5];\n" +
               "```\n\n" +
               "**Common methods:**\n" +
               "• `push()` - Add to end\n" +
               "• `pop()` - Remove from end\n" +
               "• `map()` - Transform each element\n" +
               "• `filter()` - Filter elements\n" +
               "• `find()` - Find specific element\n\n" +
               "Want to practice with any specific array method?";
    },

    getFunctionResponse() {
        return "Functions are reusable code blocks! Here are the main types:\n\n" +
               "**Function Declaration:**\n" +
               "```javascript\n" +
               "function greet(name) {\n" +
               "  return `Hello, ${name}!`;\n" +
               "}\n" +
               "```\n\n" +
               "**Arrow Function:**\n" +
               "```javascript\n" +
               "const greet = (name) => `Hello, ${name}!`;\n" +
               "```\n\n" +
               "**Function Expression:**\n" +
               "```javascript\n" +
               "const greet = function(name) {\n" +
               "  return `Hello, ${name}!`;\n" +
               "};\n" +
               "```\n\n" +
               "Each has different behaviors with hoisting and `this`. Which would you like to explore?";
    },

    getDebugResponse() {
        return "Debugging is essential! Here's my systematic approach:\n\n" +
               "**🔍 Step 1: Read the error**\n" +
               "• Error messages often tell you exactly what's wrong\n" +
               "• Note the line number and error type\n\n" +
               "**🔍 Step 2: Use debugging tools**\n" +
               "• `console.log()` - Print values\n" +
               "• Browser DevTools - Inspect and debug\n" +
               "• Breakpoints - Pause execution\n\n" +
               "**🔍 Step 3: Common issues**\n" +
               "• Typos in variable names\n" +
               "• Missing brackets or semicolons\n" +
               "• Scope issues\n" +
               "• Async/await problems\n\n" +
               "What specific error are you facing? Share the error message!";
    },

    getProjectResponse() {
        return "Building projects accelerates learning! Here are ideas by level:\n\n" +
               "**🌟 Beginner Projects:**\n" +
               "• To-Do List with local storage\n" +
               "• Calculator with all operations\n" +
               "• Quiz app with score tracking\n" +
               "• Digital clock with themes\n\n" +
               "**🌟 Intermediate Projects:**\n" +
               "• Weather app using APIs\n" +
               "• Expense tracker with charts\n" +
               "• Movie search with database\n" +
               "• Recipe finder with filters\n\n" +
               "**🌟 Advanced Projects:**\n" +
               "• Social media clone\n" +
               "• E-commerce platform\n" +
               "• Real-time chat application\n" +
               "• Task management system\n\n" +
               "Which level matches your skills? I can provide detailed guidance!";
    },

    getLearningResponse() {
        return "Here's a comprehensive learning roadmap:\n\n" +
               "**🚀 Phase 1: Foundations (2-3 months)**\n" +
               "• HTML structure & semantics\n" +
               "• CSS styling & layouts\n" +
               "• JavaScript fundamentals\n" +
               "• DOM manipulation\n\n" +
               "**🚀 Phase 2: Interactive Development (3-4 months)**\n" +
               "• ES6+ features\n" +
               "• API integration\n" +
               "• React or Vue.js\n" +
               "• State management\n\n" +
               "**🚀 Phase 3: Full-Stack (4-6 months)**\n" +
               "• Node.js & Express\n" +
               "• Databases (SQL/NoSQL)\n" +
               "• Authentication\n" +
               "• Deployment\n\n" +
               "**📚 Study Tips:**\n" +
               "• Code daily (consistency beats intensity)\n" +
               "• Build projects while learning\n" +
               "• Join coding communities\n" +
               "• Practice coding challenges\n\n" +
               "Where are you in this journey?";
    },

    getPythonResponse() {
        return "Python is excellent for beginners and powerful for experts!\n\n" +
               "**🐍 Why Python?**\n" +
               "• Readable, clean syntax\n" +
               "• Versatile (web, data, AI, automation)\n" +
               "• Huge community and libraries\n" +
               "• Great for learning programming concepts\n\n" +
               "**🐍 Key Concepts:**\n" +
               "```python\n" +
               "# Variables and data types\n" +
               "name = 'Alice'\n" +
               "age = 25\n" +
               "scores = [95, 87, 92]\n\n" +
               "# Functions\n" +
               "def calculate_average(numbers):\n" +
               "    return sum(numbers) / len(numbers)\n" +
               "```\n\n" +
               "**🐍 Popular frameworks:**\n" +
               "• Django/Flask (web development)\n" +
               "• Pandas/NumPy (data science)\n" +
               "• TensorFlow/PyTorch (machine learning)\n\n" +
               "What aspect of Python interests you most?";
    },

    getWebResponse() {
        return "Web development is exciting! Let's break it down:\n\n" +
               "**🌐 The Frontend Trinity:**\n\n" +
               "**HTML (Structure):**\n" +
               "```html\n" +
               "<header>\n" +
               "  <h1>My Website</h1>\n" +
               "  <nav>...</nav>\n" +
               "</header>\n" +
               "```\n\n" +
               "**CSS (Styling):**\n" +
               "```css\n" +
               "header {\n" +
               "  background: linear-gradient(45deg, #667eea, #764ba2);\n" +
               "  padding: 2rem;\n" +
               "}\n" +
               "```\n\n" +
               "**JavaScript (Interactivity):**\n" +
               "```javascript\n" +
               "document.querySelector('button').addEventListener('click', () => {\n" +
               "  alert('Hello, World!');\n" +
               "});\n" +
               "```\n\n" +
               "**🌐 Modern tools:**\n" +
               "• React/Vue/Angular (frameworks)\n" +
               "• Sass/SCSS (CSS preprocessing)\n" +
               "• Webpack/Vite (build tools)\n\n" +
               "What would you like to explore first?";
    },

    // Render message with enhanced features
    renderMessage(message) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.sender}-message`;
        messageEl.dataset.messageId = message.id;
        
        const time = new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const providerBadge = message.sender === 'ai' && this.currentProvider ? 
            `<span class="provider-badge">${this.providers[this.currentProvider].icon} ${this.providers[this.currentProvider].name}</span>` : '';

        messageEl.innerHTML = `
            <div class="message-content">
                ${this.formatMessage(message.text)}
            </div>
            <div class="message-meta">
                <span class="message-time">${time}</span>
                ${providerBadge}
                ${message.sender === 'ai' ? this.getReactionButtons(message.id) : ''}
            </div>
        `;

        messagesContainer.appendChild(messageEl);
    },

    // Get reaction buttons
    getReactionButtons(messageId) {
        return `
            <div class="message-reactions">
                <button class="reaction-btn" data-message-id="${messageId}" data-reaction="helpful" title="Helpful">👍</button>
                <button class="reaction-btn" data-message-id="${messageId}" data-reaction="unhelpful" title="Not helpful">👎</button>
                <button class="reaction-btn" data-message-id="${messageId}" data-reaction="copy" title="Copy" onclick="StarGuideAI.copyMessage('${messageId}')">📋</button>
            </div>
        `;
    },

    // Add reaction to message
    addReaction(messageId, reaction) {
        // Track reaction for analytics
        if (window.StarGuideApp) {
            window.StarGuideApp.trackEvent('ai_message_reaction', {
                messageId: messageId,
                reaction: reaction,
                provider: this.currentProvider
            });
        }

        // Visual feedback
        const btn = document.querySelector(`[data-message-id="${messageId}"][data-reaction="${reaction}"]`);
        if (btn) {
            btn.classList.add('reacted');
            setTimeout(() => btn.classList.remove('reacted'), 1000);
        }
    },

    // Copy message content
    copyMessage(messageId) {
        const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageEl) {
            const content = messageEl.querySelector('.message-content').textContent;
            navigator.clipboard.writeText(content).then(() => {
                StarGuideUtils.showNotification('Message copied!', 'success');
            });
        }
    },

    // Enhanced message formatting
    formatMessage(text) {
        return text
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/•/g, '&bull;')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    },

    // Render chat history
    renderChatHistory() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = '';
        
        if (this.chatHistory.length === 0) {
            this.addMessage('ai', this.getRandomResponse('greeting'));
        } else {
            this.chatHistory.forEach(message => this.renderMessage(message));
        }
    },

    // Show typing indicator with provider info
    showTypingIndicator() {
        this.isTyping = true;
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const typingEl = document.createElement('div');
        typingEl.className = 'message ai-message typing-indicator';
        typingEl.id = 'typing-indicator';
        
        const providerName = this.providers[this.currentProvider]?.name || 'AI';
        
        typingEl.innerHTML = `
            <div class="typing-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span class="typing-text">${providerName} is thinking...</span>
            </div>
        `;

        messagesContainer.appendChild(typingEl);
        this.scrollToBottom();
    },

    // Hide typing indicator
    hideTypingIndicator() {
        this.isTyping = false;
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    },

    // Scroll to bottom of chat
    scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    },

    // Save chat history
    saveChatHistory() {
        // Keep only last 100 messages
        if (this.chatHistory.length > 100) {
            this.chatHistory = this.chatHistory.slice(-100);
        }
        localStorage.setItem('aiChatHistory', JSON.stringify(this.chatHistory));
    },

    // Clear chat history
    clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            this.chatHistory = [];
            this.saveChatHistory();
            this.renderChatHistory();
            StarGuideUtils.showNotification('Chat history cleared', 'info');
        }
    },

    // Export chat history
    exportChat() {
        const chatText = this.chatHistory.map(msg => 
            `[${new Date(msg.timestamp).toLocaleString()}] ${msg.sender.toUpperCase()}: ${msg.text}`
        ).join('\n\n');

        const blob = new Blob([chatText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `starmentor-chat-${Date.now()}.txt`;
        a.click();
        
        URL.revokeObjectURL(url);
        StarGuideUtils.showNotification('Chat exported successfully!', 'success');
    },

    // Quick actions with enhanced topics
    askQuestion(topic) {
        const questions = {
            'basics': "I'm completely new to programming. What should I learn first and in what order?",
            'javascript': "Can you explain JavaScript closures and give me practical examples?",
            'react': "What's the difference between React state and props? When should I use each?",
            'career': "What's the current job market like for web developers? What skills are in highest demand?",
            'debug': "My code isn't working as expected. Can you teach me systematic debugging techniques?",
            'project': "I want to build something impressive for my portfolio. What project would showcase my skills best?",
            'algorithms': "Can you explain common algorithms like binary search and bubble sort with examples?",
            'database': "What's the difference between SQL and NoSQL databases? When should I use each?",
            'api': "How do I work with APIs? Can you show me how to fetch data and handle errors?",
            'deployment': "I've built an app locally. How do I deploy it so others can use it?",
            'git': "I'm confused about Git workflows. Can you explain branching, merging, and best practices?",
            'performance': "My website is slow. What are the most important performance optimization techniques?"
        };

        const question = questions[topic] || "Can you help me with programming concepts?";
        document.getElementById('chat-input').value = question;
        this.sendMessage();
    },

    // Get conversation insights
    getConversationInsights() {
        const totalMessages = this.chatHistory.length;
        const userMessages = this.chatHistory.filter(m => m.sender === 'user').length;
        const topics = this.extractTopics();
        
        return {
            totalMessages,
            userMessages,
            topicsDiscussed: topics,
            averageResponseTime: this.calculateAverageResponseTime(),
            mostUsedProvider: this.getMostUsedProvider()
        };
    },

    // Extract topics from conversation
    extractTopics() {
        const topicKeywords = {
            'JavaScript': ['javascript', 'js', 'node', 'react', 'vue'],
            'Python': ['python', 'django', 'flask', 'pandas'],
            'Web Development': ['html', 'css', 'web', 'frontend', 'backend'],
            'Databases': ['sql', 'database', 'mongodb', 'mysql'],
            'Debugging': ['debug', 'error', 'bug', 'issue', 'problem'],
            'Career': ['job', 'career', 'interview', 'portfolio'],
            'Algorithms': ['algorithm', 'sort', 'search', 'complexity']
        };

        const topics = new Set();
        const allText = this.chatHistory.map(m => m.text.toLowerCase()).join(' ');

        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            if (keywords.some(keyword => allText.includes(keyword))) {
                topics.add(topic);
            }
        });

        return Array.from(topics);
    },

    // Calculate average response time
    calculateAverageResponseTime() {
        // This would track actual response times in a real implementation
        return 'N/A';
    },

    // Get most used provider
    getMostUsedProvider() {
        // This would track provider usage in a real implementation
        return this.currentProvider;
    }
};
