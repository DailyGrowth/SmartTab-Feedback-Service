document.addEventListener('DOMContentLoaded', () => {
    console.log('SMARTTAB: Popup DOM loaded');

    // Comprehensive runtime and extension connectivity check
    function checkExtensionRuntime() {
        return new Promise((resolve, reject) => {
            console.log('SMARTTAB: Performing comprehensive runtime check');
            
            // Check basic runtime availability
            if (!chrome || !chrome.runtime) {
                console.error('SMARTTAB: Chrome runtime is not available');
                reject(new Error('Chrome runtime is not available'));
                return;
            }

            // Check extension ID
            const extensionId = chrome.runtime.id;
            console.log('SMARTTAB: Extension ID:', extensionId);

            // Attempt to ping background script
            try {
                chrome.runtime.sendMessage({ action: 'ping' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('SMARTTAB: Runtime ping failed:', chrome.runtime.lastError);
                        reject(new Error('Failed to establish connection with background script'));
                        return;
                    }

                    console.log('SMARTTAB: Background script ping successful');
                    resolve(true);
                });
            } catch (error) {
                console.error('SMARTTAB: Ping attempt threw an error:', error);
                reject(error);
            }
        });
    }

    // Enhanced message sending with multiple fallback mechanisms
    function sendExtensionMessage(action, data = {}) {
        return new Promise((resolve, reject) => {
            console.log(`SMARTTAB: Attempting to send ${action} message`);

            const message = { ...data, action: action };

            // Fallback timeout
            const timeoutId = setTimeout(() => {
                console.error(`SMARTTAB: Message sending timeout for ${action}`);
                reject(new Error('Message sending timed out'));
            }, 5000);

            try {
                chrome.runtime.sendMessage(message, (response) => {
                    // Clear timeout
                    clearTimeout(timeoutId);

                    // Check for runtime errors
                    if (chrome.runtime.lastError) {
                        console.error('SMARTTAB: Message sending error:', chrome.runtime.lastError);
                        reject(new Error(`Message sending error: ${chrome.runtime.lastError.message}`));
                        return;
                    }

                    // Validate response
                    if (!response) {
                        console.error('SMARTTAB: No response received');
                        reject(new Error('No response from background script'));
                        return;
                    }

                    console.log(`SMARTTAB: ${action} response:`, response);

                    if (response.success) {
                        resolve(response);
                    } else {
                        reject(new Error(response.message || 'Unknown error'));
                    }
                });
            } catch (error) {
                // Clear timeout
                clearTimeout(timeoutId);
                console.error(`SMARTTAB: Exception sending ${action} message:`, error);
                reject(error);
            }
        });
    }

    // Get references to DOM elements
    const organizeButton = document.getElementById('organizeButton');
    const undoButton = document.getElementById('undoButton');
    const helpLink = document.getElementById('helpLink');
    const donationLink = document.getElementById('donation-link');
    const backButton = document.getElementById('backButton');

    console.log('SMARTTAB: Button references:', {
        organizeButton: !!organizeButton,
        undoButton: !!undoButton,
        helpLink: !!helpLink,
        donationLink: !!donationLink,
        backButton: !!backButton
    });

    // Update tab stats
    function updateTabStats() {
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
            document.getElementById('totalTabsCount').textContent = tabs.length;
            document.getElementById('categorizedTabsCount').textContent = '0';
        });
    }

    // Runtime check on popup load
    checkExtensionRuntime()
        .then(() => {
            console.log('SMARTTAB: Extension runtime is ready');
            
            // Enable buttons after successful runtime check
            if (organizeButton) {
                organizeButton.disabled = false;
                organizeButton.addEventListener('click', async () => {
                    console.log('SMARTTAB: Organize button clicked');
                    try {
                        const response = await sendExtensionMessage('organizeTabs');
                        console.log('SMARTTAB: Organize successful', response);
                        updateTabStats();
                        alert(`Organized ${response.categorizedTabs} tabs into ${response.categories.length} categories`);
                    } catch (error) {
                        console.error('SMARTTAB: Organize failed', error);
                        alert(`Failed to organize tabs: ${error.message}`);
                    }
                });
            }

            if (undoButton) {
                undoButton.disabled = false;
                undoButton.addEventListener('click', async () => {
                    console.log('SMARTTAB: Deorganize button clicked');
                    try {
                        const response = await sendExtensionMessage('deorganizeTabs');
                        console.log('SMARTTAB: Deorganize successful', response);
                        updateTabStats();
                        alert(`Deorganized ${response.unGroupedTabs} tabs`);
                    } catch (error) {
                        console.error('SMARTTAB: Deorganize failed', error);
                        alert(`Failed to deorganize tabs: ${error.message}`);
                    }
                });
            }

            // Initial tab stats update
            updateTabStats();

            // Help and donation links
            if (helpLink) helpLink.addEventListener('click', () => chrome.tabs.create({ url: 'help.html' }));
            if (donationLink) donationLink.addEventListener('click', (e) => {
                e.preventDefault();
                chrome.tabs.create({ url: 'https://ko-fi.com/dailygrowthcollective' });
            });

            // Debugging: Log any runtime errors
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                console.log('SMARTTAB: Received runtime message:', request);
            });
        })
        .catch((error) => {
            console.error('SMARTTAB: Extension runtime check failed:', error);
            
            // Disable buttons and show error
            if (organizeButton) organizeButton.disabled = true;
            if (undoButton) undoButton.disabled = true;
            
            alert(`Extension Error: ${error.message}. Please reload the extension.`);
        });
});
