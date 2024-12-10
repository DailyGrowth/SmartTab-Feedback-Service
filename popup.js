document.addEventListener('DOMContentLoaded', () => {
    console.log('SMARTTAB: Popup DOM loaded');

    // Logging function with error tracking
    function safeLog(message, ...args) {
        try {
            console.log(`SMARTTAB: ${message}`, ...args);
        } catch (error) {
            // Fallback logging
            console.error('SMARTTAB: Logging failed', error);
        }
    }

    // Comprehensive runtime and extension connectivity check
    function checkExtensionRuntime() {
        return new Promise((resolve, reject) => {
            safeLog('Performing comprehensive runtime check');
            
            // Check basic runtime availability
            if (!chrome || !chrome.runtime) {
                safeLog('Chrome runtime is not available');
                reject(new Error('Chrome runtime is not available'));
                return;
            }

            // Check extension ID
            const extensionId = chrome.runtime.id;
            safeLog('Extension ID:', extensionId);

            // Attempt to ping background script
            const pingTimeout = setTimeout(() => {
                safeLog('Ping timeout');
                reject(new Error('Background script ping timeout'));
            }, 5000);

            try {
                chrome.runtime.sendMessage({ action: 'ping' }, (response) => {
                    clearTimeout(pingTimeout);

                    if (chrome.runtime.lastError) {
                        safeLog('Runtime ping failed:', chrome.runtime.lastError);
                        reject(new Error('Failed to establish connection with background script'));
                        return;
                    }

                    safeLog('Background script ping successful', response);
                    resolve(response);
                });
            } catch (error) {
                clearTimeout(pingTimeout);
                safeLog('Ping attempt threw an error:', error);
                reject(error);
            }
        });
    }

    // Enhanced message sending with multiple fallback mechanisms
    function sendExtensionMessage(action, data = {}) {
        return new Promise((resolve, reject) => {
            safeLog(`Attempting to send ${action} message`);

            const message = { ...data, action: action };

            // Fallback timeout
            const timeoutId = setTimeout(() => {
                safeLog(`Message sending timeout for ${action}`);
                reject(new Error('Message sending timed out'));
            }, 5000);

            try {
                chrome.runtime.sendMessage(message, (response) => {
                    // Clear timeout
                    clearTimeout(timeoutId);

                    // Check for runtime errors
                    if (chrome.runtime.lastError) {
                        safeLog('Message sending error:', chrome.runtime.lastError);
                        reject(new Error(`Message sending error: ${chrome.runtime.lastError.message}`));
                        return;
                    }

                    // Validate response
                    if (!response) {
                        safeLog('No response received');
                        reject(new Error('No response from background script'));
                        return;
                    }

                    safeLog(`${action} response:`, response);

                    if (response.success) {
                        resolve(response);
                    } else {
                        reject(new Error(response.message || 'Unknown error'));
                    }
                });
            } catch (error) {
                // Clear timeout
                clearTimeout(timeoutId);
                safeLog(`Exception sending ${action} message:`, error);
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

    safeLog('Button references:', {
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
            safeLog('Extension runtime is ready');
            
            // Enable buttons after successful runtime check
            if (organizeButton) {
                organizeButton.disabled = false;
                organizeButton.addEventListener('click', async () => {
                    safeLog('Organize button clicked');
                    try {
                        const response = await sendExtensionMessage('organizeTabs');
                        safeLog('Organize successful', response);
                        updateTabStats();
                        alert(`Organized ${response.categorizedTabs} tabs into ${response.categories.length} categories`);
                    } catch (error) {
                        safeLog('Organize failed', error);
                        alert(`Failed to organize tabs: ${error.message}`);
                    }
                });
            }

            if (undoButton) {
                undoButton.disabled = false;
                undoButton.addEventListener('click', async () => {
                    safeLog('Deorganize button clicked');
                    try {
                        const response = await sendExtensionMessage('deorganizeTabs');
                        safeLog('Deorganize successful', response);
                        updateTabStats();
                        alert(`Deorganized ${response.unGroupedTabs} tabs`);
                    } catch (error) {
                        safeLog('Deorganize failed', error);
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
                safeLog('Received runtime message:', request);
            });
        })
        .catch((error) => {
            safeLog('Extension runtime check failed:', error);
            
            // Disable buttons and show error
            if (organizeButton) organizeButton.disabled = true;
            if (undoButton) undoButton.disabled = true;
            
            alert(`Extension Error: ${error.message}. Please reload the extension.`);
        });
});
