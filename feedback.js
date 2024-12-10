// User Feedback Mechanism for SmartTab Organizer

(function() {
    // SmartTab Feedback Service Configuration
    const SMARTTAB_API_SECRET = 'SmartTab_17aaf159c427520b689d58301e437efd64aeec53233f63de258dc92cb5d00f88_FeedbackService_20241210';
    const API_ENDPOINT = 'https://smarttab-feedback-service.onrender.com';

    const FEEDBACK_KEY = 'smarttab_feedback_data';
    const FEEDBACK_PROMPT_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days
    const INSTALLATION_TIME_KEY = 'smarttab_installation_time';

    // Enhanced Logging Function
    function log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const logMessage = `[SmartTab Feedback] [${level.toUpperCase()}] ${message}`;
        
        // Console logging
        console[level](logMessage);
        
        // Optional: Store logs in chrome storage for debugging
        chrome.storage.local.get(['feedbackLogs'], (result) => {
            const logs = result.feedbackLogs || [];
            logs.push({ timestamp, message: logMessage, level });
            
            // Keep only last 100 logs
            const trimmedLogs = logs.slice(-100);
            
            chrome.storage.local.set({ feedbackLogs: trimmedLogs });
        });
    }

    class FeedbackManager {
        constructor() {
            this.initializeInstallationTime();
        }

        // Track installation time
        initializeInstallationTime() {
            chrome.storage.local.get([INSTALLATION_TIME_KEY], (result) => {
                if (!result[INSTALLATION_TIME_KEY]) {
                    chrome.storage.local.set({
                        [INSTALLATION_TIME_KEY]: Date.now()
                    });
                }
            });
        }

        // Collect anonymous usage statistics
        collectUsageStats(action) {
            try {
                const stats = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '{}');
                stats[action] = (stats[action] || 0) + 1;
                localStorage.setItem(FEEDBACK_KEY, JSON.stringify(stats));

                // Send to API
                this.sendUsageStats(stats);
            } catch (error) {
                console.error('Error collecting usage stats:', error);
            }
        }

        // Send usage stats to API
        async sendUsageStats(stats) {
            try {
                log('Attempting to submit usage stats');
                
                const response = await fetch(`${API_ENDPOINT}/usage-stats`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${SMARTTAB_API_SECRET}`
                    },
                    body: JSON.stringify({
                        extension_id: chrome.runtime.id,
                        stats: stats,
                        timestamp: new Date().toISOString()
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Usage stats submission failed: ${errorText}`);
                }

                const result = await response.json();
                log('Usage stats submitted successfully', 'info');
                return result;
            } catch (error) {
                log(`Error submitting usage stats: ${error.message}`, 'error');
                // Optional: Send error to a secondary logging mechanism
                this.logErrorToStorage(error);
                throw error;
            }
        }

        // Prompt for feedback
        shouldPromptFeedback() {
            const installTime = parseInt(localStorage.getItem(INSTALLATION_TIME_KEY) || '0');
            return Date.now() - installTime > FEEDBACK_PROMPT_INTERVAL;
        }

        // Create feedback modal
        createFeedbackModal() {
            const modal = document.createElement('div');
            modal.id = 'smarttab-feedback-modal';
            modal.innerHTML = `
                <style>
                    #smarttab-feedback-modal {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: white;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        z-index: 1000;
                        max-width: 400px;
                        text-align: center;
                    }
                    #smarttab-feedback-modal textarea {
                        width: 100%;
                        margin: 10px 0;
                        min-height: 100px;
                    }
                    .smarttab-button {
                        background: #4a90e2;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 5px;
                        margin: 5px;
                        cursor: pointer;
                    }
                    .smarttab-button:hover {
                        background: #357abd;
                    }
                </style>
                <h2>Enjoying SmartTab?</h2>
                <p>We'd love to hear your thoughts!</p>
                <textarea placeholder="Share your feedback, suggestions, or experience..."></textarea>
                <div>
                    <button class="smarttab-button" id="submit-feedback">Submit Feedback</button>
                    <button class="smarttab-button" id="close-feedback">Remind Me Later</button>
                </div>
            `;

            document.body.appendChild(modal);

            document.getElementById('submit-feedback').addEventListener('click', () => {
                const feedback = modal.querySelector('textarea').value;
                this.submitFeedback(feedback);
                this.closeFeedbackModal();
            });

            document.getElementById('close-feedback').addEventListener('click', () => {
                this.closeFeedbackModal();
            });
        }

        // Submit feedback to API
        async submitFeedback(feedback) {
            try {
                log('Attempting to submit user feedback');
                
                const response = await fetch(`${API_ENDPOINT}/feedback`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${SMARTTAB_API_SECRET}`
                    },
                    body: JSON.stringify({
                        extension_id: chrome.runtime.id,
                        feedback: feedback,
                        timestamp: new Date().toISOString()
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Feedback submission failed: ${errorText}`);
                }

                const result = await response.json();
                log('Feedback submitted successfully', 'info');
                return result;
            } catch (error) {
                log(`Error submitting feedback: ${error.message}`, 'error');
                this.logErrorToStorage(error);
                throw error;
            }
        }

        // Close feedback modal
        closeFeedbackModal() {
            const modal = document.getElementById('smarttab-feedback-modal');
            if (modal) {
                modal.remove();
            }
            localStorage.setItem('feedback_prompted', Date.now());
        }

        logErrorToStorage(error) {
            chrome.storage.local.get(['feedbackErrors'], (result) => {
                const errors = result.feedbackErrors || [];
                errors.push({
                    timestamp: new Date().toISOString(),
                    message: error.message,
                    stack: error.stack
                });

                // Keep only last 50 errors
                const trimmedErrors = errors.slice(-50);
                
                chrome.storage.local.set({ feedbackErrors: trimmedErrors });
            });
        }

        // Initialize feedback mechanisms
        initialize() {
            // Track tab organization actions
            chrome.runtime.onMessage.addListener((request) => {
                if (request.action === 'organizeTabs' || request.action === 'deorganizeTabs') {
                    this.collectUsageStats(request.action);
                }
            });

            // Periodically check for feedback prompt
            if (this.shouldPromptFeedback()) {
                this.createFeedbackModal();
            }
        }
    }

    // Initialize feedback manager
    const feedbackManager = new FeedbackManager();
    feedbackManager.initialize();
})();
