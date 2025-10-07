const DASHBOARD_BASE_URL = 'https://stats.rb2.fr';

// DOM elements
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const currentSession = document.getElementById('currentSession');
const sessionDuration = document.getElementById('sessionDuration');
const userId = document.getElementById('userId');
const viewDashboardBtn = document.getElementById('viewDashboard');
const refreshStatusBtn = document.getElementById('refreshStatus');

// User ID edit elements
const userIdContainer = document.getElementById('userIdContainer');
const userIdEditMode = document.getElementById('userIdEditMode');
const copyUserIdBtn = document.getElementById('copyUserId');
const editUserIdBtn = document.getElementById('editUserId');
const saveUserIdBtn = document.getElementById('saveUserId');
const cancelEditUserIdBtn = document.getElementById('cancelEditUserId');
const userIdInput = document.getElementById('userIdInput');

// First day banner elements
const firstDayBanner = document.getElementById('firstDayBanner');
const dismissBannerBtn = document.getElementById('dismissBanner');

// Store current user UUID for edit operations
let currentUserUUID = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
    loadSessionStatus();
    setupEventListeners();
    checkFirstDayBanner();
});

// Set up event listeners
function setupEventListeners() {
    viewDashboardBtn.addEventListener('click', openDashboard);
    refreshStatusBtn.addEventListener('click', refreshStatus);

    // User ID edit listeners
    copyUserIdBtn.addEventListener('click', copyUserIdToClipboard);
    editUserIdBtn.addEventListener('click', enterEditMode);
    saveUserIdBtn.addEventListener('click', saveUserIdEdit);
    cancelEditUserIdBtn.addEventListener('click', cancelEditMode);

    // Banner listener
    dismissBannerBtn.addEventListener('click', dismissFirstDayBanner);
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
        currentUserUUID = sessionData.userUUID;
        userId.textContent = formatUserID(sessionData.userUUID);
        viewDashboardBtn.disabled = false;
    } else {
        currentUserUUID = null;
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

// Format user ID for display (first 8 characters + "...")
function formatUserID(uuid) {
    if (!uuid) return '--';
    return uuid.substring(0, 8) + '...';
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

// Copy User ID to clipboard
async function copyUserIdToClipboard() {
    if (!currentUserUUID) {
        alert('No User ID available to copy');
        return;
    }

    try {
        await navigator.clipboard.writeText(currentUserUUID);
        // Visual feedback
        const originalText = copyUserIdBtn.textContent;
        copyUserIdBtn.textContent = '✓';
        setTimeout(() => {
            copyUserIdBtn.textContent = originalText;
        }, 1000);
    } catch (error) {
        console.error('Failed to copy User ID:', error);
        alert('Failed to copy User ID. Please try again.');
    }
}

// Enter edit mode for User ID
function enterEditMode() {
    if (!currentUserUUID) return;

    userIdContainer.style.display = 'none';
    userIdEditMode.style.display = 'flex';
    userIdInput.value = currentUserUUID;
    userIdInput.focus();
    userIdInput.select();
}

// Cancel edit mode
function cancelEditMode() {
    userIdContainer.style.display = 'flex';
    userIdEditMode.style.display = 'none';
    userIdInput.value = '';
}

// Save edited User ID
async function saveUserIdEdit() {
    const newUUID = userIdInput.value.trim();

    if (!newUUID) {
        alert('User ID cannot be empty');
        return;
    }

    try {
        // Save to chrome.storage.sync (same location as background.js)
        await chrome.storage.sync.set({ userUUID: newUUID });

        // Update local state
        currentUserUUID = newUUID;
        userId.textContent = formatUserID(newUUID);

        // Exit edit mode
        cancelEditMode();

        // Visual feedback
        const originalText = userId.textContent;
        userId.textContent = '✓ Saved';
        setTimeout(() => {
            userId.textContent = originalText;
        }, 1500);
    } catch (error) {
        console.error('Failed to save User ID:', error);
        alert('Failed to save User ID. Please try again.');
    }
}

// Check if first-day banner should be shown
async function checkFirstDayBanner() {
    try {
        const result = await chrome.storage.sync.get(['dismissedFirstDayBanner', 'installDate']);

        // If already dismissed, don't show
        if (result.dismissedFirstDayBanner) {
            return;
        }

        // If no install date, set it now (extension just installed or updated)
        if (!result.installDate) {
            const now = new Date().toISOString();
            await chrome.storage.sync.set({ installDate: now });
            // Show banner on first install
            firstDayBanner.style.display = 'flex';
            return;
        }

        // Check if it's still the first day
        const installDate = new Date(result.installDate);
        const now = new Date();
        const daysSinceInstall = Math.floor((now - installDate) / (1000 * 60 * 60 * 24));

        if (daysSinceInstall === 0) {
            firstDayBanner.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error checking first-day banner:', error);
    }
}

// Dismiss first-day banner
async function dismissFirstDayBanner() {
    try {
        await chrome.storage.sync.set({ dismissedFirstDayBanner: true });
        firstDayBanner.style.display = 'none';
    } catch (error) {
        console.error('Error dismissing banner:', error);
    }
}

// Clean up on popup close
window.addEventListener('beforeunload', () => {
    if (window.durationTimer) {
        clearInterval(window.durationTimer);
    }
});