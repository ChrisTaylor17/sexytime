// Task management with real CS token rewards
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('consilience_tasks')) || [];
    }

    createTask() {
        const title = prompt('Task title:');
        const description = prompt('Task description:');
        const reward = parseInt(prompt('CS token reward (10-100):')) || 25;
        
        if (!title || !description) return;
        
        const task = {
            id: Date.now().toString(),
            title,
            description,
            reward: Math.min(Math.max(reward, 10), 100), // Clamp between 10-100
            status: 'todo',
            createdAt: new Date().toISOString(),
            createdBy: walletManager.userData?.alias || 'anonymous'
        };
        
        this.tasks.push(task);
        this.saveTasks();
        
        if (pageManager.currentPage === 'tasks') {
            pageManager.loadTasks();
        }
        
        walletManager.showAchievement(`Task created: ${title}`);
    }

    moveTask(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.status = newStatus;
        task.updatedAt = new Date().toISOString();
        
        this.saveTasks();
        pageManager.loadTasks();
        
        if (newStatus === 'progress') {
            walletManager.showAchievement(`Started: ${task.title}`);
        }
    }

    async completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Require proof of completion
        const proof = prompt('Provide proof of completion (description, link, etc.):');
        if (!proof) return;
        
        task.status = 'completed';
        task.completedAt = new Date().toISOString();
        task.proof = proof;
        
        // Award CS tokens
        await walletManager.awardCS(task.reward, `Task: ${task.title}`);
        
        // Record achievement
        if (walletManager.userData) {
            walletManager.userData.achievements = walletManager.userData.achievements || [];
            walletManager.userData.achievements.push({
                type: 'task_completed',
                taskId: task.id,
                taskTitle: task.title,
                amount: task.reward,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('consilience_user', JSON.stringify(walletManager.userData));
        }
        
        this.saveTasks();
        pageManager.loadTasks();
        
        // Send completion to server for verification
        try {
            await fetch(`${API_URL}/api/complete-task`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskId,
                    alias: walletManager.userData?.alias,
                    proof,
                    reward: task.reward
                })
            });
        } catch (error) {
            console.log('Server verification failed, but task completed locally');
        }
    }

    saveTasks() {
        localStorage.setItem('consilience_tasks', JSON.stringify(this.tasks));
    }

    // Predefined productive tasks
    generateProductiveTasks() {
        const productiveTasks = [
            {
                title: 'Create Project Whitepaper',
                description: 'Write a comprehensive whitepaper for your DAO project',
                reward: 75
            },
            {
                title: 'Design Project Logo',
                description: 'Create a professional logo and branding materials',
                reward: 50
            },
            {
                title: 'Build MVP Prototype',
                description: 'Develop a minimum viable product or proof of concept',
                reward: 100
            },
            {
                title: 'Community Outreach',
                description: 'Engage with 10 potential community members',
                reward: 40
            },
            {
                title: 'Technical Documentation',
                description: 'Write technical docs for your project',
                reward: 60
            },
            {
                title: 'Market Research',
                description: 'Conduct thorough market analysis and competitor research',
                reward: 45
            },
            {
                title: 'Token Economics Design',
                description: 'Design tokenomics and distribution model',
                reward: 80
            },
            {
                title: 'Partnership Proposal',
                description: 'Create partnership proposal for another DAO',
                reward: 65
            }
        ];
        
        productiveTasks.forEach(taskTemplate => {
            const task = {
                id: Date.now().toString() + Math.random(),
                ...taskTemplate,
                status: 'todo',
                createdAt: new Date().toISOString(),
                createdBy: 'system',
                isTemplate: true
            };
            this.tasks.push(task);
        });
        
        this.saveTasks();
    }

    // Daily challenges for consistent engagement
    generateDailyChallenge() {
        const challenges = [
            { title: 'Daily Check-in', description: 'Share your progress in the community', reward: 15 },
            { title: 'Help Another Member', description: 'Assist someone in the DAO with their project', reward: 25 },
            { title: 'Share Knowledge', description: 'Post a helpful tip or resource', reward: 20 },
            { title: 'Review Project', description: 'Provide feedback on another member\'s work', reward: 30 },
            { title: 'Brainstorm Ideas', description: 'Contribute 3 new project ideas', reward: 35 }
        ];
        
        const today = new Date().toDateString();
        const existingDaily = this.tasks.find(t => t.isDaily && t.createdAt.includes(today));
        
        if (!existingDaily) {
            const challenge = challenges[Math.floor(Math.random() * challenges.length)];
            const task = {
                id: 'daily-' + Date.now(),
                ...challenge,
                status: 'todo',
                createdAt: new Date().toISOString(),
                createdBy: 'system',
                isDaily: true,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            };
            
            this.tasks.push(task);
            this.saveTasks();
            
            walletManager.showAchievement(`Daily Challenge: ${challenge.title}`);
        }
    }
}

// Global task manager
window.taskManager = new TaskManager();

// Global functions for HTML onclick handlers
window.createTask = () => taskManager.createTask();
window.moveTask = (taskId, status) => taskManager.moveTask(taskId, status);
window.completeTask = (taskId) => taskManager.completeTask(taskId);

// Initialize daily challenges
taskManager.generateDailyChallenge();

// Generate productive tasks if none exist
if (taskManager.tasks.length === 0) {
    taskManager.generateProductiveTasks();
}