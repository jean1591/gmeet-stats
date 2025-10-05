// API Configuration - Toggle between DEV and PROD
const API_BASE_URL = 'http://127.0.0.1:3000/sessions';  // DEV (local)
// const API_BASE_URL = 'https://api.stats.rb2.fr/sessions';  // PROD (production)

const MEET_URL_PATTERN = /^https:\/\/meet\.google\.com\/.*/;
const CHECK_INTERVAL = 1; // minutes

// Generate UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Get or create user UUID
async function getUserUUID() {
  const result = await chrome.storage.sync.get(['userUUID']);
  if (!result.userUUID) {
    const newUUID = generateUUID();
    await chrome.storage.sync.set({ userUUID: newUUID });
    console.log('Generated new user UUID:', newUUID);
    return newUUID;
  }
  return result.userUUID;
}

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Google Meet Time Tracker installed');

  // Ensure user UUID exists
  const userUUID = await getUserUUID();
  console.log('Using user UUID:', userUUID);

  // Set up recurring alarm for tab checking
  chrome.alarms.create('checkMeetTabs', {
    periodInMinutes: CHECK_INTERVAL
  });

  // Initial check
  checkMeetTabs();
});

// Load UUID on startup
chrome.runtime.onStartup.addListener(async () => {
  // Resume session checking
  chrome.alarms.create('checkMeetTabs', {
    periodInMinutes: CHECK_INTERVAL
  });
});

// Handle alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkMeetTabs') {
    checkMeetTabs();
  }
});

// Main function to check for Google Meet tabs
async function checkMeetTabs() {
  try {
    const tabs = await chrome.tabs.query({});
    const meetTabs = tabs.filter(tab => MEET_URL_PATTERN.test(tab.url));

    console.log(`Found ${meetTabs.length} Google Meet tabs`);

    if (meetTabs.length > 0) {
      await handleMeetTabsFound();
    } else {
      await handleNoMeetTabs();
    }
  } catch (error) {
    console.error('Error checking Meet tabs:', error);
  }
}

// Handle when Meet tabs are found
async function handleMeetTabsFound() {
  const now = new Date().toISOString();
  const userUUID = await getUserUUID();

  // Check if we have an active session
  const result = await chrome.storage.local.get(['currentSessionId']);

  if (!result.currentSessionId) {
    // Start new session
    await startNewSession(userUUID, now);
  } else {
    // Update existing session
    await updateSession(result.currentSessionId, now);
  }
}

// Handle when no Meet tabs are found
async function handleNoMeetTabs() {
  const result = await chrome.storage.local.get(['currentSessionId']);

  if (result.currentSessionId) {
    // End current session
    const now = new Date().toISOString();
    await endSession(result.currentSessionId, now);
  }
}

// Start a new session
async function startNewSession(userUUID, timestamp) {
  try {
    const sessionData = {
      user_id: userUUID,
      start_time: timestamp,
      end_time: timestamp
    };

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData)
    });

    if (response.ok) {
      const createdSession = await response.json();
      await chrome.storage.local.set({
        currentSessionId: createdSession.id,
        sessionStartTime: timestamp
      });
      console.log('New session started:', createdSession.id);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error starting new session:', error);
  }
}

// Update existing session
async function updateSession(sessionId, timestamp) {
  try {
    const sessionData = {
      end_time: timestamp
    };

    const response = await fetch(`${API_BASE_URL}/${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData)
    });

    if (response.ok) {
      console.log('Session updated:', sessionId, 'end_time:', timestamp);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error updating session:', error);
  }
}

// End current session
async function endSession(sessionId, timestamp) {
  try {
    const sessionData = {
      end_time: timestamp
    };

    const response = await fetch(`${API_BASE_URL}/${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData)
    });

    if (response.ok) {
      await chrome.storage.local.remove(['currentSessionId', 'sessionStartTime']);
      console.log('Session ended:', sessionId);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error ending session:', error);
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSessionStatus') {
    getSessionStatus().then(sendResponse);
    return true; // Keep message channel open for async response
  }
});

// Get current session status for popup
async function getSessionStatus() {
  try {
    const [syncResult, localResult] = await Promise.all([
      chrome.storage.sync.get(['userUUID']),
      chrome.storage.local.get(['currentSessionId', 'sessionStartTime'])
    ]);

    return {
      userUUID: syncResult.userUUID,
      isActive: !!localResult.currentSessionId,
      sessionId: localResult.currentSessionId,
      startTime: localResult.sessionStartTime
    };
  } catch (error) {
    console.error('Error getting session status:', error);
    return {
      userUUID: null,
      isActive: false,
      sessionId: null,
      startTime: null
    };
  }
}
