document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const organizeButton = document.getElementById('organizeButton');
    const undoButton = document.getElementById('undoButton');
    const helpLink = document.getElementById('helpLink');
    const donationLink = document.getElementById('donation-link');
    const backButton = document.getElementById('backButton');

    // Utility function to open Ko-Fi page
    function openKoFiPage(e) {
        e.preventDefault();
        chrome.tabs.create({ 
            url: 'https://ko-fi.com/dailygrowthcollective',
            active: true 
        });
    }

    // Update tab stats
    function updateTabStats() {
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
            document.getElementById('totalTabsCount').textContent = tabs.length;
            document.getElementById('categorizedTabsCount').textContent = '0';
        });
    }

    // Generic error handler for message sending
    function sendMessageWithErrorHandling(action, callback) {
        try {
            chrome.runtime.sendMessage({ action: action }, (response) => {
                console.log(`${action} response:`, response);
                if (response && response.success) {
                    updateTabStats();
                    if (callback) callback(response);
                } else {
                    console.error(`Error in ${action}:`, response);
                    alert(`Failed to ${action}. Please check console for details.`);
                }
            });
        } catch (error) {
            console.error(`Exception in ${action}:`, error);
            alert(`An error occurred while trying to ${action}. Please check console for details.`);
        }
    }

    // Organize tabs functionality
    organizeButton.addEventListener('click', () => {
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
            chrome.runtime.sendMessage({ 
                action: 'organizeTabs',
                originalTabs: tabs.map(tab => ({
                    id: tab.id,
                    index: tab.index,
                    pinned: tab.pinned,
                    groupId: tab.groupId
                }))
            }, (response) => {
                console.log('Organize response:', response);
                if (response && response.success) {
                    updateTabStats();
                } else {
                    console.error('Error in organizeTabs:', response);
                    alert('Failed to organize tabs. Please check console for details.');
                }
            });
        });
    });

    // Deorganize action
    undoButton.addEventListener('click', () => {
        sendMessageWithErrorHandling('deorganizeTabs');
    });

    // Help icon - open help page
    helpLink.addEventListener('click', () => {
        chrome.tabs.create({ url: 'help.html' });
    });

    // Donation link
    donationLink.addEventListener('click', openKoFiPage);

    // Initial tab stats update
    updateTabStats();
});
