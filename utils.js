/**
 * IDFS StarGuide - Utilities Module
 * Common utility functions used across the application
 */

window.StarGuideUtils = {
    // Show notification
    showNotification(message, type = 'info', duration = 4000) {
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: var(--bg-secondary);
            border: 1px solid ${type === 'error' ? 'var(--error)' : 
                               type === 'warning' ? 'var(--warning)' : 
                               type === 'success' ? 'var(--accent-primary)' : 'var(--info)'};
            border-radius: 12px;
            padding: 16px 20px;
            box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
            animation: slideIn 0.3s ease;
            z-index: 2000;
            max-width: 400px;
        `;
        
        notification.innerHTML = message;
        document.body.appendChild(notification);

        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    },

    // Format time
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    },

    // Format date
    formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Format relative time
    formatRelativeTime(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }

        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    },

    // Generate random ID
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Deep clone object
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (obj instanceof Object) {
            const cloned = {};
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
    },

    // Validate email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Save to localStorage with expiry
    saveWithExpiry(key, value, expiryMinutes = 60) {
        const item = {
            value: value,
            expiry: new Date().getTime() + (expiryMinutes * 60 * 1000)
        };
        localStorage.setItem(key, JSON.stringify(item));
    },

    // Get from localStorage with expiry check
    getWithExpiry(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;

        try {
            const item = JSON.parse(itemStr);
            const now = new Date().getTime();

            if (now > item.expiry) {
                localStorage.removeItem(key);
                return null;
            }

            return item.value;
        } catch (e) {
            return null;
        }
    },

    // Calculate reading time
    calculateReadingTime(text) {
        const wordsPerMinute = 200;
        const words = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return minutes;
    },

    // Shuffle array
    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    // Get achievement icon
    getAchievementIcon(achievementId) {
        const icons = {
            'first-steps': '👶',
            'quick-learner': '🚀',
            'high-scorer': '🎯',
            'level-up': '📈',
            'streak-master': '🔥',
            'battle-winner': '⚔️',
            'perfectionist': '💯',
            'marathon-runner': '🏃',
            'helping-hand': '🤝',
            'scholar': '🎓'
        };
        return icons[achievementId] || '🏆';
    },

    // Get subject icon
    getSubjectIcon(subject) {
        const icons = {
            'math': '🔢',
            'science': '🔬',
            'english': '📚',
            'history': '🏛️',
            'mixed': '🎯'
        };
        return icons[subject] || '📖';
    },

    // Show loading overlay
    showLoading(message = 'Loading...') {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        overlay.innerHTML = `
            <div style="text-align: center;">
                <div class="loading">
                    <span></span><span></span><span></span>
                </div>
                <p style="margin-top: 20px; color: white;">${message}</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
    },

    // Hide loading overlay
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.remove();
        }
    },

    // Create modal
    createModal(title, content, buttons = []) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 24px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;

        modalContent.innerHTML = `
            <h2 style="margin-bottom: 16px;">${title}</h2>
            <div style="margin-bottom: 24px;">${content}</div>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                ${buttons.map(btn => `
                    <button class="btn ${btn.primary ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="${btn.onclick}">
                        ${btn.text}
                    </button>
                `).join('')}
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        return modal;
    },

    // Close modal
    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    },

    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Copied to clipboard!', 'success');
        } catch (err) {
            this.showNotification('Failed to copy', 'error');
        }
    },

    // Check if mobile
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    // Get random motivational quote
    getMotivationalQuote() {
        const quotes = [
            "Every expert was once a beginner! 🌟",
            "Mistakes are proof that you're trying! 💪",
            "Your only limit is you! 🚀",
            "Progress, not perfection! 📈",
            "Learning is a superpower! 🦸‍♂️",
            "Small steps lead to big achievements! 👣",
            "You're closer than you think! 🎯",
            "Keep going, star explorer! ⭐",
            "Every challenge makes you stronger! 💪",
            "Believe in yourself! 🌟"
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    }
};