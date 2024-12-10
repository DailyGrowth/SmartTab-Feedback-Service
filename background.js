// Simplified background script for Manifest V3 service worker compatibility

// Ensure top-level await and no immediate execution
(async () => {
    console.log('SmartTab Background Script Initialized');

    // Categorization class with expanded categories
    class TabCategorizer {
        constructor() {
            console.log('TabCategorizer Initialized');
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
            console.log(`Categorizing: URL=${url}, Title=${title}`);
            const lowercaseUrl = url.toLowerCase();
            const lowercaseTitle = title.toLowerCase();

            // Comprehensive categorization logic with weighted scoring
            const categorizations = [
                // Professional Development
                { category: 'Software Development', keywords: ['github', 'stackoverflow', 'gitlab', 'bitbucket', 'coding', 'programming', 'developer', 'code', 'repository'] },
                { category: 'Web Development', keywords: ['html', 'css', 'javascript', 'react', 'angular', 'vue', 'frontend', 'backend', 'webdev'] },
                { category: 'Data Science', keywords: ['python', 'jupyter', 'kaggle', 'machine learning', 'data analysis', 'statistics', 'data science', 'ai'] },
                
                // Professional Networking
                { category: 'LinkedIn', keywords: ['linkedin', 'professional network', 'job search', 'career'] },
                { category: 'Professional Forums', keywords: ['stack exchange', 'quora professional', 'expert forum', 'discussion board'] },
                
                // Learning
                { category: 'Online Courses', keywords: ['coursera', 'udemy', 'edx', 'learning', 'online course', 'tutorial', 'lesson', 'training'] },
                { category: 'Academic Research', keywords: ['scholar', 'research paper', 'academic journal', 'university', 'science', 'publication'] },
                
                // Communication
                { category: 'Video Conferencing', keywords: ['zoom', 'meet.google', 'teams', 'webex', 'conference call', 'remote meeting'] },
                { category: 'Team Collaboration', keywords: ['slack', 'notion', 'asana', 'trello', 'project management', 'teamwork'] },
                
                // Finance
                { category: 'Stock Trading', keywords: ['investing', 'stocks', 'finance', 'market', 'trading platform', 'investment'] },
                { category: 'Cryptocurrency', keywords: ['bitcoin', 'ethereum', 'crypto', 'blockchain', 'coinbase', 'digital currency'] },
                
                // Entertainment
                { category: 'Video Streaming', keywords: ['youtube', 'netflix', 'vimeo', 'video streaming', 'movie', 'film', 'cinema'] },
                { category: 'Music Streaming', keywords: ['spotify', 'apple music', 'soundcloud', 'music platform', 'playlist'] },
                
                // Social Media
                { category: 'Social Media', keywords: ['facebook', 'twitter', 'instagram', 'social network', 'social platform', 'tiktok'] },
                
                // News & Information
                { category: 'Tech News', keywords: ['techcrunch', 'wired', 'verge', 'technology news', 'tech blog', 'gadget'] },
                { category: 'Global News', keywords: ['cnn', 'bbc', 'reuters', 'news website', 'current affairs', 'world news'] }
            ];

            // Multi-pass categorization with weighted scoring
            let bestCategory = 'Uncategorized Resources';
            let bestScore = 0;

            for (const cat of categorizations) {
                const matchScore = cat.keywords.reduce((score, keyword) => {
                    const urlMatch = lowercaseUrl.includes(keyword) ? 2 : 0;
                    const titleMatch = lowercaseTitle.includes(keyword) ? 1 : 0;
                    return score + urlMatch + titleMatch;
                }, 0);

                if (matchScore > bestScore) {
                    bestScore = matchScore;
                    bestCategory = cat.category;
                }
            }

            // Fallback categories based on domain
            const domainCategories = [
                { domain: 'github.com', category: 'Software Development' },
                { domain: 'stackoverflow.com', category: 'Software Development' },
                { domain: 'coursera.org', category: 'Online Courses' },
                { domain: 'udemy.com', category: 'Online Courses' },
                { domain: 'linkedin.com', category: 'Professional Networking' },
                { domain: 'youtube.com', category: 'Video Streaming' },
                { domain: 'netflix.com', category: 'Video Streaming' }
            ];

            const matchedDomainCategory = domainCategories.find(dc => 
                lowercaseUrl.includes(dc.domain)
            );

            return matchedDomainCategory 
                ? matchedDomainCategory.category 
                : bestCategory;
        }

        getAllCategories() {
            return this.categories;
        }
    }

    // Color generator
    class ColorGenerator {
        constructor() {
            this.colorPalette = [
                '#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', '#6C5CE7',
                '#FF8A5B', '#2ECC71', '#3498DB', '#E74C3C', '#9B59B6'
            ];
        }

        getCategoryColor(category) {
            let hash = 0;
            for (let i = 0; i < category.length; i++) {
                hash = ((hash << 5) - hash) + category.charCodeAt(i);
                hash = hash & hash;
            }
            
            const colorIndex = Math.abs(hash) % this.colorPalette.length;
            return this.colorPalette[colorIndex];
        }
    }

    // Action History Management with Persistent Storage
    const ActionHistory = {
        history: [],
        currentIndex: -1,
        originalTabStates: [],

        recordAction(action, originalTabs) {
            console.log('Recording Action:', action);
            if (this.currentIndex < this.history.length - 1) {
                this.history = this.history.slice(0, this.currentIndex + 1);
            }
            
            this.history.push(action);
            this.originalTabStates.push(originalTabs);
            this.currentIndex++;

            if (this.history.length > 50) {
                this.history.shift();
                this.originalTabStates.shift();
                this.currentIndex--;
            }

            // Persist to storage
            chrome.storage.local.set({
                actionHistory: this.history,
                originalTabStates: this.originalTabStates,
                currentIndex: this.currentIndex
            });
        },

        async restoreOriginalState() {
            console.log('Attempting to restore original state');
            if (this.currentIndex >= 0) {
                const originalTabs = this.originalTabStates[this.currentIndex];
                
                // Restore tab positions and groups
                for (const tab of originalTabs) {
                    await chrome.tabs.update(tab.id, { 
                        active: false,
                        pinned: tab.pinned,
                        index: tab.index
                    });
                    
                    if (tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
                        await chrome.tabs.group({
                            tabIds: [tab.id],
                            groupId: tab.groupId
                        });
                    }
                }

                // Move back in history
                this.currentIndex--;
            }
        }
    };

    // Initialize categorizer and color generator
    const tabCategorizer = new TabCategorizer();
    const colorGenerator = new ColorGenerator();

    // Restore action history from storage on startup
    chrome.storage.local.get(['actionHistory', 'originalTabStates', 'currentIndex'], (result) => {
        if (result.actionHistory) {
            ActionHistory.history = result.actionHistory;
            ActionHistory.originalTabStates = result.originalTabStates;
            ActionHistory.currentIndex = result.currentIndex;
        }
    });

    // Message listener with enhanced error handling
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('Received Message:', request.action);

        try {
            switch(request.action) {
                case 'organizeTabs':
                    chrome.tabs.query({ currentWindow: true }, (tabs) => {
                        console.log(`Organizing ${tabs.length} tabs`);
                        
                        const originalTabs = tabs.map(tab => ({
                            id: tab.id,
                            index: tab.index,
                            pinned: tab.pinned,
                            groupId: tab.groupId
                        }));

                        const categorizedTabs = {};
                        
                        tabs.forEach(tab => {
                            const category = tabCategorizer.categorize(tab.url, tab.title);
                            
                            if (!categorizedTabs[category]) {
                                categorizedTabs[category] = [];
                            }
                            categorizedTabs[category].push(tab.id);
                        });

                        console.log('Categorized Tabs:', categorizedTabs);

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

                        ActionHistory.recordAction({
                            type: 'organize',
                            tabs: tabs.map(tab => ({
                                id: tab.id,
                                url: tab.url,
                                title: tab.title
                            }))
                        }, originalTabs);

                        sendResponse({
                            success: true,
                            totalTabs: tabs.length,
                            categorizedTabs: Object.values(categorizedTabs).reduce((sum, group) => sum + group.length, 0),
                            categories: Object.keys(categorizedTabs)
                        });
                    });
                    return true;

                case 'deorganizeTabs':
                    chrome.tabs.query({ currentWindow: true }, (tabs) => {
                        console.log(`Deorganizing ${tabs.length} tabs`);
                        console.log('Current tabs:', tabs.map(tab => ({
                            id: tab.id, 
                            url: tab.url, 
                            groupId: tab.groupId
                        })));
                        
                        const originalTabs = tabs.map(tab => ({
                            id: tab.id,
                            index: tab.index,
                            pinned: tab.pinned,
                            groupId: tab.groupId
                        }));

                        let unGroupedCount = 0;
                        tabs.forEach(tab => {
                            if (tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
                                try {
                                    console.log(`Attempting to ungroup tab: ${tab.id}`);
                                    chrome.tabs.ungroup(tab.id, () => {
                                        if (chrome.runtime.lastError) {
                                            console.error('Error ungrouping tab:', chrome.runtime.lastError);
                                        } else {
                                            unGroupedCount++;
                                        }
                                    });
                                } catch (error) {
                                    console.error('Exception while ungrouping:', error);
                                }
                            }
                        });

                        ActionHistory.recordAction({
                            type: 'deorganize',
                            tabs: tabs.map(tab => ({
                                id: tab.id,
                                url: tab.url,
                                title: tab.title
                            }))
                        }, originalTabs);

                        sendResponse({
                            success: true,
                            totalTabs: tabs.length,
                            unGroupedTabs: unGroupedCount,
                            message: `Deorganized ${unGroupedCount} tabs`
                        });
                    });
                    return true;

                default:
                    console.log('Unknown action:', request.action);
                    sendResponse({ success: false, message: 'Unknown action' });
                    return false;
            }
        } catch (error) {
            console.error('Error in message listener:', error);
            sendResponse({ success: false, message: error.toString() });
            return false;
        }
    });

    console.log('SmartTab Background Script Setup Complete');
})();
