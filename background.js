// Simplified background script for Manifest V3 service worker compatibility

(async () => {
    console.log('SMARTTAB: Background Script Initializing');

    // Comprehensive runtime check
    function checkChromeRuntime() {
        const requiredAPIs = [
            'chrome.tabs',
            'chrome.tabs.query',
            'chrome.tabGroups',
            'chrome.runtime.onMessage'
        ];

        const missingAPIs = requiredAPIs.filter(api => {
            try {
                const parts = api.split('.');
                return parts.reduce((obj, part) => obj && obj[part], window) === undefined;
            } catch (error) {
                return true;
            }
        });

        if (missingAPIs.length > 0) {
            console.error('SMARTTAB: Missing APIs:', missingAPIs);
            return false;
        }

        return true;
    }

    // Validate Chrome runtime
    if (!checkChromeRuntime()) {
        console.error('SMARTTAB: Chrome runtime validation failed');
        return;
    }

    // Tab Categorization Logic
    class TabCategorizer {
        constructor() {
            this.categories = [
                // Professional & Work Categories
                'Software Development', 'Web Development', 'Mobile Development', 
                'Cloud Computing', 'DevOps', 'Data Science', 'Machine Learning', 
                'Cybersecurity', 'IT Infrastructure', 'Technical Writing',
                
                // Design & Creative
                'Graphic Design', 'UI/UX Design', 'Digital Art', 'Video Editing', 
                '3D Modeling', 'Animation', 'Photography', 'Music Production',
                
                // Business & Professional
                'Project Management', 'Business Strategy', 'Entrepreneurship', 
                'Marketing', 'Digital Marketing', 'Sales', 'Customer Support', 
                'Human Resources', 'Finance', 'Accounting', 'Consulting',
                
                // Professional Networking
                'LinkedIn', 'Professional Forums', 'Industry Conferences', 
                'Recruitment Platforms', 'Professional Communities',
                
                // Communication & Collaboration
                'Email', 'Messaging', 'Video Conferencing', 'Team Collaboration', 
                'Project Tracking', 'Document Sharing', 'Virtual Meetings',
                
                // Learning & Education
                'Online Courses', 'Academic Research', 'E-Learning', 
                'Professional Training', 'Language Learning', 'Skill Development', 
                'Educational Platforms', 'Academic Journals', 'Tutorials',
                
                // Technology & Innovation
                'Tech News', 'Startup Ecosystem', 'Innovation Platforms', 
                'Emerging Technologies', 'Tech Blogs', 'Product Hunt',
                
                // Finance & Investment
                'Banking', 'Stock Trading', 'Cryptocurrency', 'Investment Platforms', 
                'Financial News', 'Personal Finance', 'Fintech', 'Market Analysis',
                
                // Health & Wellness
                'Medical Information', 'Fitness Tracking', 'Mental Health', 
                'Nutrition', 'Telemedicine', 'Healthcare Resources',
                
                // Entertainment & Media
                'Video Streaming', 'Music Streaming', 'Podcasts', 'Gaming', 
                'Digital Media', 'Movie Reviews', 'Entertainment News',
                
                // Social & Personal
                'Social Media', 'Personal Blogs', 'Travel', 'Food & Cooking', 
                'Personal Development', 'Hobbies', 'Personal Interests',
                
                // News & Information
                'Global News', 'Science News', 'Technology News', 'Current Affairs', 
                'Political News', 'Environmental News', 'Sports News',
                
                // E-commerce & Services
                'Online Shopping', 'Travel Booking', 'Food Delivery', 
                'Subscription Services', 'Marketplace Platforms', 'Comparison Sites',
                
                // Productivity & Utilities
                'Note-Taking', 'Task Management', 'Calendar & Scheduling', 
                'Productivity Suites', 'File Storage', 'Password Managers',
                
                // Miscellaneous
                'Reference Sites', 'Creative Platforms', 'Research Tools', 
                'Browser Extensions', 'Uncategorized Resources'
            ];
        }

        categorize(url, title) {
            // Implement categorization logic
            const urlLower = url.toLowerCase();
            const titleLower = title.toLowerCase();

            // Professional Development
            if (urlLower.includes('github.com') || urlLower.includes('stackoverflow.com')) 
                return 'Software Development';
            
            // Design
            if (urlLower.includes('dribbble.com') || urlLower.includes('behance.net')) 
                return 'UI/UX Design';
            
            // Learning
            if (urlLower.includes('coursera.org') || urlLower.includes('udemy.com')) 
                return 'Online Courses';
            
            // News
            if (urlLower.includes('techcrunch.com') || urlLower.includes('wired.com')) 
                return 'Tech News';
            
            // Social Media
            if (urlLower.includes('linkedin.com') || urlLower.includes('twitter.com')) 
                return 'Professional Networking';
            
            // Default
            return 'Uncategorized Resources';
        }

        getAllCategories() {
            return this.categories;
        }
    }

    // Color Generation Logic
    class ColorGenerator {
        constructor() {
            this.colorPalette = [
                '#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', '#6C5CE7',
                '#FF8A5B', '#2ECC71', '#3498DB', '#E74C3C', '#9B59B6'
            ];
        }

        getCategoryColor(category) {
            // Generate a consistent color based on category
            const hash = this.hashCode(category);
            return this.colorPalette[Math.abs(hash) % this.colorPalette.length];
        }

        hashCode(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return hash;
        }
    }

    // Action History Management
    const ActionHistory = {
        history: [],
        currentIndex: -1,

        recordAction(action, originalTabs) {
            this.history.push({
                type: action.type,
                tabs: action.tabs,
                timestamp: Date.now(),
                originalTabs: originalTabs
            });
            this.currentIndex++;
        },

        restoreOriginalState() {
            if (this.currentIndex >= 0) {
                const lastAction = this.history[this.currentIndex];
                
                // Restore tabs to their original state
                lastAction.originalTabs.forEach(tab => {
                    chrome.tabs.move(tab.id, { 
                        index: tab.index, 
                        windowId: chrome.windows.WINDOW_ID_CURRENT 
                    });

                    // Restore group if applicable
                    if (tab.groupId !== -1) {
                        chrome.tabs.group({
                            tabIds: [tab.id],
                            groupId: tab.groupId
                        });
                    }
                });

                // Remove the last action
                this.history.pop();
                this.currentIndex--;

                return true;
            }
            return false;
        }
    };

    // Initialize categorizer and color generator
    const tabCategorizer = new TabCategorizer();
    const colorGenerator = new ColorGenerator();

    // Enhanced message listener
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('SMARTTAB: Received message:', request.action);

        // Ensure async response is possible
        const asyncSendResponse = (response) => {
            try {
                sendResponse(response);
            } catch (error) {
                console.error('SMARTTAB: Error sending response:', error);
            }
        };

        try {
            switch(request.action) {
                case 'ping':
                    console.log('SMARTTAB: Received ping from popup');
                    asyncSendResponse({
                        success: true,
                        message: 'Pong',
                        timestamp: Date.now()
                    });
                    return true;

                case 'organizeTabs':
                    chrome.tabs.query({ currentWindow: true }, (tabs) => {
                        console.log(`SMARTTAB: Organizing ${tabs.length} tabs`);
                        
                        try {
                            const categorizedTabs = {};
                            
                            tabs.forEach(tab => {
                                const category = tabCategorizer.categorize(tab.url, tab.title);
                                
                                if (!categorizedTabs[category]) {
                                    categorizedTabs[category] = [];
                                }
                                categorizedTabs[category].push(tab.id);
                            });

                            console.log('SMARTTAB: Categorized Tabs:', categorizedTabs);

                            Object.entries(categorizedTabs).forEach(([category, tabIds]) => {
                                if (tabIds.length > 0) {
                                    chrome.tabs.group({
                                        tabIds: tabIds
                                    }, (groupId) => {
                                        chrome.tabGroups.update(groupId, {
                                            title: category,
                                            color: colorGenerator.getCategoryColor(category)
                                        });
                                    });
                                }
                            });

                            asyncSendResponse({
                                success: true,
                                totalTabs: tabs.length,
                                categorizedTabs: Object.values(categorizedTabs).reduce((sum, group) => sum + group.length, 0),
                                categories: Object.keys(categorizedTabs)
                            });
                        } catch (error) {
                            console.error('SMARTTAB: Organize tabs error:', error);
                            asyncSendResponse({
                                success: false,
                                message: `Organize failed: ${error.message}`
                            });
                        }
                    });
                    return true;

                case 'deorganizeTabs':
                    chrome.tabs.query({ currentWindow: true }, async (tabs) => {
                        console.log('SMARTTAB: Deorganizing tabs');
                        
                        try {
                            const groups = await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT });
                            console.log('SMARTTAB: Current tab groups', groups);

                            let unGroupedTabs = [];
                            
                            for (const group of groups) {
                                try {
                                    await chrome.tabs.ungroup(group.tabIds);
                                    unGroupedTabs.push(...group.tabIds);
                                } catch (error) {
                                    console.error(`SMARTTAB: Error ungrouping tabs in group ${group.id}:`, error);
                                }
                            }

                            console.log(`SMARTTAB: Ungrouped ${unGroupedTabs.length} tabs`);

                            asyncSendResponse({
                                success: true,
                                totalTabs: tabs.length,
                                unGroupedTabs: unGroupedTabs.length,
                                message: `Successfully deorganized ${unGroupedTabs.length} tabs`
                            });
                        } catch (error) {
                            console.error('SMARTTAB: Deorganize error:', error);
                            asyncSendResponse({
                                success: false,
                                message: `Deorganize failed: ${error.message}`
                            });
                        }
                    });
                    return true;

                default:
                    console.log('SMARTTAB: Unknown message action', request.action);
                    asyncSendResponse({ 
                        success: false, 
                        message: 'Unknown action' 
                    });
                    return false;
            }
        } catch (error) {
            console.error('SMARTTAB: Global message handler error:', error);
            asyncSendResponse({ 
                success: false, 
                message: error.toString() 
            });
            return false;
        }
    });

    console.log('SMARTTAB: Background Script Setup Complete');
})();
