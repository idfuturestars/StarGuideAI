/**
 * IDFS StarGuide - Analytics Module
 * Progress tracking and data visualization
 */

window.StarGuideAnalytics = {
    currentPeriod: 'week',
    charts: {},
    
    // Initialize module
    init() {
        console.log('Analytics module initialized');
        this.loadAnalyticsData();
        setTimeout(() => this.renderCharts(), 100);
    },

    // Load analytics data
    loadAnalyticsData() {
        // Simulate loading data
        this.data = {
            xpHistory: this.generateXPData(),
            activityData: this.generateActivityData(),
            skillProgress: this.generateSkillData(),
            achievements: this.generateAchievementData()
        };
    },

    // Generate XP data for chart
    generateXPData() {
        const days = this.currentPeriod === 'week' ? 7 : this.currentPeriod === 'month' ? 30 : 365;
        const data = [];
        let totalXP = 0;

        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dailyXP = Math.floor(Math.random() * 200) + 50;
            totalXP += dailyXP;
            
            data.push({
                date: date.toLocaleDateString(),
                xp: dailyXP,
                total: totalXP
            });
        }

        return data;
    },

    // Generate activity heatmap data
    generateActivityData() {
        const activities = [];
        const today = new Date();

        for (let week = 0; week < 12; week++) {
            for (let day = 0; day < 7; day++) {
                const date = new Date();
                date.setDate(today.getDate() - (week * 7 + day));
                
                activities.push({
                    date: date.toISOString().split('T')[0],
                    count: Math.floor(Math.random() * 10),
                    day: day,
                    week: week
                });
            }
        }

        return activities;
    },

    // Generate skill progress data
    generateSkillData() {
        return [
            { skill: 'JavaScript', level: 75, trend: 'up' },
            { skill: 'React', level: 60, trend: 'up' },
            { skill: 'Python', level: 45, trend: 'stable' },
            { skill: 'CSS', level: 80, trend: 'stable' },
            { skill: 'Node.js', level: 55, trend: 'up' },
            { skill: 'SQL', level: 40, trend: 'down' }
        ];
    },

    // Generate achievement data
    generateAchievementData() {
        return {
            total: 25,
            thisMonth: 5,
            categories: [
                { name: 'Coding', count: 10 },
                { name: 'Learning', count: 8 },
                { name: 'Community', count: 4 },
                { name: 'Challenges', count: 3 }
            ]
        };
    },

    // Update period
    updatePeriod(period) {
        this.currentPeriod = period;
        this.loadAnalyticsData();
        this.renderCharts();
    },

    // Render all charts
    renderCharts() {
        this.renderXPChart();
        this.renderActivityChart();
        this.renderSkillsChart();
        this.renderAchievementStats();
    },

    // Render XP progress chart
    renderXPChart() {
        const canvas = document.getElementById('xp-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.data.xpHistory;

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = 300;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Chart settings
        const padding = 40;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;

        // Find max XP for scaling
        const maxXP = Math.max(...data.map(d => d.xp));

        // Draw axes
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();

        // Draw grid lines
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();

            // Y-axis labels
            ctx.fillStyle = '#999';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(Math.round(maxXP - (maxXP / 5) * i), padding - 10, y + 4);
        }

        // Draw XP line
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = canvas.height - padding - (point.xp / maxXP) * chartHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            // Draw point
            ctx.fillStyle = '#00ff88';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.stroke();

        // Draw labels
        ctx.fillStyle = '#999';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';

        // X-axis labels (show every nth label based on period)
        const labelInterval = this.currentPeriod === 'week' ? 1 : this.currentPeriod === 'month' ? 5 : 30;
        data.forEach((point, index) => {
            if (index % labelInterval === 0) {
                const x = padding + (chartWidth / (data.length - 1)) * index;
                ctx.save();
                ctx.translate(x, canvas.height - padding + 20);
                ctx.rotate(-Math.PI / 4);
                ctx.fillText(point.date, 0, 0);
                ctx.restore();
            }
        });

        // Title
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('XP Progress Over Time', canvas.width / 2, 20);
    },

    // Render activity heatmap
    renderActivityChart() {
        const canvas = document.getElementById('activity-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.data.activityData;

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = 200;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Heatmap settings
        const cellSize = 15;
        const cellPadding = 3;
        const startX = 50;
        const startY = 40;

        // Draw day labels
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        ctx.fillStyle = '#999';
        ctx.font = '11px Arial';
        days.forEach((day, i) => {
            if (i % 2 === 0) { // Show every other day to save space
                ctx.fillText(day, 10, startY + i * (cellSize + cellPadding) + cellSize / 2);
            }
        });

        // Draw cells
        data.forEach(activity => {
            const x = startX + activity.week * (cellSize + cellPadding);
            const y = startY + activity.day * (cellSize + cellPadding);

            // Color based on activity count
            const intensity = activity.count / 10;
            if (activity.count === 0) {
                ctx.fillStyle = '#1a1a1a';
            } else {
                const green = Math.floor(255 * intensity);
                ctx.fillStyle = `rgb(0, ${green}, ${Math.floor(green * 0.5)})`;
            }

            ctx.fillRect(x, y, cellSize, cellSize);
        });

        // Legend
        ctx.fillStyle = '#999';
        ctx.font = '11px Arial';
        ctx.fillText('Less', startX, startY + 8 * (cellSize + cellPadding));
        
        for (let i = 0; i <= 4; i++) {
            const intensity = i / 4;
            const green = Math.floor(255 * intensity);
            ctx.fillStyle = i === 0 ? '#1a1a1a' : `rgb(0, ${green}, ${Math.floor(green * 0.5)})`;
            ctx.fillRect(startX + 40 + i * (cellSize + cellPadding), startY + 7.5 * (cellSize + cellPadding), cellSize, cellSize);
        }
        
        ctx.fillStyle = '#999';
        ctx.fillText('More', startX + 40 + 5 * (cellSize + cellPadding) + 5, startY + 8 * (cellSize + cellPadding));

        // Title
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Activity Heatmap - Last 12 Weeks', canvas.width / 2, 20);
    },

    // Render skills chart
    renderSkillsChart() {
        const container = document.getElementById('analytics-charts');
        const existingSkillChart = document.getElementById('skills-progress-chart');
        
        if (existingSkillChart) {
            existingSkillChart.remove();
        }

        const skillsHtml = `
            <div class="chart-container" id="skills-progress-chart">
                <h3>Skills Progress</h3>
                <div class="skills-bars">
                    ${this.data.skillProgress.map(skill => `
                        <div class="skill-bar-item">
                            <div class="skill-header">
                                <span class="skill-name">${skill.skill}</span>
                                <span class="skill-level">${skill.level}%</span>
                                <span class="skill-trend ${skill.trend}">
                                    ${skill.trend === 'up' ? '↑' : skill.trend === 'down' ? '↓' : '→'}
                                </span>
                            </div>
                            <div class="skill-bar-bg">
                                <div class="skill-bar-fill" style="width: ${skill.level}%; background: ${this.getSkillColor(skill.level)}"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', skillsHtml);
    },

    // Get color based on skill level
    getSkillColor(level) {
        if (level >= 80) return '#00ff88';
        if (level >= 60) return '#ffaa00';
        if (level >= 40) return '#ff6600';
        return '#ff3333';
    },

    // Render achievement stats
    renderAchievementStats() {
        const container = document.getElementById('analytics-charts');
        const existingStats = document.getElementById('achievement-stats');
        
        if (existingStats) {
            existingStats.remove();
        }

        const statsHtml = `
            <div class="chart-container" id="achievement-stats">
                <h3>Achievement Statistics</h3>
                <div class="achievement-summary">
                    <div class="stat-box">
                        <div class="stat-value">${this.data.achievements.total}</div>
                        <div class="stat-label">Total Achievements</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${this.data.achievements.thisMonth}</div>
                        <div class="stat-label">This Month</div>
                    </div>
                </div>
                <div class="achievement-categories">
                    ${this.data.achievements.categories.map(cat => `
                        <div class="category-stat">
                            <span class="category-name">${cat.name}</span>
                            <div class="category-bar">
                                <div class="category-fill" style="width: ${(cat.count / this.data.achievements.total) * 100}%"></div>
                            </div>
                            <span class="category-count">${cat.count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', statsHtml);
    },

    // Export data
    exportData() {
        const exportData = {
            period: this.currentPeriod,
            xpHistory: this.data.xpHistory,
            skillProgress: this.data.skillProgress,
            achievements: this.data.achievements,
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `starguide-analytics-${this.currentPeriod}-${Date.now()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        StarGuideUtils.showNotification('Analytics data exported!', 'success');
    }
};