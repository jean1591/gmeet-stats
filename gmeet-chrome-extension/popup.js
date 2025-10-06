const DASHBOARD_BASE_URL = 'https://stats.rb2.fr';

// DOM elements
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const currentSession = document.getElementById('currentSession');
const sessionDuration = document.getElementById('sessionDuration');
const userId = document.getElementById('userId');
const viewDashboardBtn = document.getElementById('viewDashboard');
const refreshStatusBtn = document.getElementById('refreshStatus');

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
    loadSessionStatus();
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    viewDashboardBtn.addEventListener('click', openDashboard);
    refreshStatusBtn.addEventListener('click', refreshStatus);
}

// Load session status from background script
async function loadSessionStatus() {
    try {
        setLoadingState(true);

        const response = await chrome.runtime.sendMessage({
            action: 'getSessionStatus'
        });

        updateUI(response);
    } catch (error) {
        console.error('Error loading session status:', error);
        showError('Failed to load session status');
    } finally {
        setLoadingState(false);
    }
}

// Update UI with session data
function updateUI(sessionData) {
    if (!sessionData) {
        showError('No session data available');
        return;
    }

    // Update user ID
    if (sessionData.userUUID) {
        userId.textContent = formatUserID(sessionData.userUUID);
        viewDashboardBtn.disabled = false;
    } else {
        userId.textContent = 'Not generated';
        viewDashboardBtn.disabled = true;
    }

    // Update session status
    if (sessionData.isActive) {
        setActiveStatus(sessionData);
    } else {
        setInactiveStatus();
    }
}

// Set active session status
function setActiveStatus(sessionData) {
    statusDot.className = 'status-dot active';
    statusText.textContent = 'Meeting Active';

    if (sessionData.sessionId) {
        currentSession.textContent = formatSessionID(sessionData.sessionId);
    }

    if (sessionData.startTime) {
        const duration = calculateDuration(sessionData.startTime);
        sessionDuration.textContent = duration;

        // Update duration every second
        startDurationTimer(sessionData.startTime);
    }
}

// Set inactive session status
function setInactiveStatus() {
    statusDot.className = 'status-dot inactive';
    statusText.textContent = 'No Active Meeting';
    currentSession.textContent = '--';
    sessionDuration.textContent = '--';

    // Clear any existing timer
    if (window.durationTimer) {
        clearInterval(window.durationTimer);
    }
}

// Set loading state
function setLoadingState(isLoading) {
    if (isLoading) {
        statusDot.className = 'status-dot loading';
        statusText.textContent = 'Loading...';
        refreshStatusBtn.disabled = true;
    } else {
        refreshStatusBtn.disabled = false;
    }
}

// Show error state
function showError(message) {
    statusDot.className = 'status-dot inactive';
    statusText.textContent = 'Error';
    statusText.className = 'error';
    currentSession.textContent = message;
}

// Calculate duration from start time
function calculateDuration(startTime) {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
}

// Start duration timer
function startDurationTimer(startTime) {
    // Clear existing timer
    if (window.durationTimer) {
        clearInterval(window.durationTimer);
    }

    // Update every second
    window.durationTimer = setInterval(() => {
        const duration = calculateDuration(startTime);
        sessionDuration.textContent = duration;
    }, 1000);
}

// Format user ID for display
function formatUserID(uuid) {
    if (!uuid) return '--';
    return uuid.split('-')[0] + '...';
}

// Format session ID for display
function formatSessionID(sessionId) {
    if (!sessionId) return '--';
    return sessionId.split('-')[0] + '...';
}

// Open dashboard in new tab
async function openDashboard() {
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'getSessionStatus'
        });

        if (response && response.userUUID) {
            const dashboardUrl = `${DASHBOARD_BASE_URL}/${response.userUUID}`;
            chrome.tabs.create({ url: dashboardUrl });
        } else {
            alert('User ID not available. Please try refreshing.');
        }
    } catch (error) {
        console.error('Error opening dashboard:', error);
        alert('Failed to open dashboard. Please try again.');
    }
}

// Refresh status
function refreshStatus() {
    loadSessionStatus();
}

// Clean up on popup close
window.addEventListener('beforeunload', () => {
    if (window.durationTimer) {
        clearInterval(window.durationTimer);
    }
});