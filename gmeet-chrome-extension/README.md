# Google Meet Time Tracker Chrome Extension

A Chrome extension that automatically tracks time spent in Google Meet calls and integrates with a NestJS backend for analytics.

## Features

- ⏱️ Automatic time tracking for Google Meet sessions
- 🔄 Reliable 1-minute interval monitoring using Chrome alarms API
- 📊 Simple popup UI showing current session status
- 🌐 Dashboard integration via user UUID
- 🔧 Works across browser restarts

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select this directory
4. The extension will generate a unique user UUID on first install

## Configuration

Before using the extension, update the API endpoints in:

- `background.js`: Change `API_BASE_URL` to your NestJS backend URL
- `popup.js`: Change `DASHBOARD_BASE_URL` to your dashboard URL

## File Structure

```
├── manifest.json          # Extension configuration
├── background.js          # Service worker for tab monitoring
├── popup.html            # Popup interface
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
└── icons/                # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## API Integration

The extension sends session data to your backend with this structure:

```json
{
  "uuid": "user-uuid",
  "session_id": "session-uuid",
  "start_time": "2023-01-01T12:00:00.000Z",
  "end_time": "2023-01-01T12:30:00.000Z"
}
```

- **POST** `/sessions` - Create new session
- **PUT** `/sessions` - Update existing session

## How It Works

1. **Installation**: Generates permanent UUID for user identification
2. **Monitoring**: Checks all tabs every minute for `meet.google.com/*` URLs
3. **Session Start**: Creates session when Meet tab detected
4. **Session Update**: Updates end_time every minute while Meet tab exists
5. **Session End**: Sends final update when no Meet tabs found

## Permissions

- `tabs`: Monitor browser tabs for Google Meet URLs
- `storage`: Store user UUID and session data
- `alarms`: Reliable background monitoring
- `host_permissions`: Access Google Meet domains