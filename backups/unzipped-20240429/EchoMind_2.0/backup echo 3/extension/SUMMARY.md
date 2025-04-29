# Google Peek Extension - Architecture and Implementation

## Overview

Google Peek is a Chrome extension that enhances Google search by allowing users to preview search results by hovering over links. The extension creates a lightweight preview window that shows the linked website without requiring the user to leave the search page.

## Components

### 1. Manifest (manifest.json)

The manifest file is the entry point for the Chrome extension and defines:
- Basic metadata (name, version, description)
- Required permissions (activeTab, storage, contextMenus, notifications)
- Content scripts that run on Google search pages
- Background script for handling browser events
- Extension icons and popup UI

### 2. Content Script (content.js)

The content script is injected into Google search pages and handles:
- Detecting when a user hovers over search result links
- Creating and displaying the preview container
- Positioning the preview relative to the link
- Loading the linked page in an iframe
- Handling various user interactions (click, hover, escape key)
- Applying user settings to the preview behavior

### 3. Background Script (background.js)

The background script runs in the browser background and manages:
- Extension installation and updates
- Initializing default settings
- Context menu creation
- Handling browser icon clicks
- Cross-tab communication

### 4. Popup UI (popup.html, popup.js)

The popup interface appears when the user clicks the extension icon and allows:
- Enabling/disabling the preview functionality
- Adjusting settings like hover delay
- Toggling feature options like preview controls
- Displaying the extension's status

### 5. Styles (styles.css)

The CSS file defines the appearance of:
- The preview container and iframe
- Loading spinners and animations
- Control buttons and UI elements
- Accessibility-focused styles

## Technical Implementation

### Preview Creation Process

1. When the user hovers over a link, a timer is started (configurable delay)
2. After the delay, a container is created with a loading spinner
3. An iframe is created inside the container to load the linked page
4. The container is positioned next to the link, considering screen edges
5. The container fades in with a smooth animation
6. When the iframe loads, the spinner is hidden and the content is shown

### Settings Management

1. Default settings are stored during installation
2. User changes are saved to chrome.storage.sync
3. Content script loads settings when the page loads
4. Settings can be updated in real-time via messaging

### User Experience Considerations

1. Preview only appears after a delay to prevent accidental triggers
2. Users can adjust delay time to their preference
3. Preview can be closed by moving the mouse away, clicking escape, or clicking the close button
4. Controls allow opening the link in a new tab directly from the preview
5. Active links are highlighted with a subtle indicator

## Testing Instructions

Follow these steps to test the Google Peek extension:

1. Installation:
   - Open Chrome browser and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top-right corner)
   - Click "Load unpacked" and navigate to the extension folder
   - Verify Google Peek appears in your extensions list

2. Basic functionality:
   - Go to Google.com and search for something (e.g., "weather forecast")
   - Hover over any search result link and wait for the delay (500ms by default)
   - Check that a preview popup appears next to the link
   - Verify the preview shows the website content in an iframe
   - Confirm the popup has controls at the bottom if enabled

3. Settings verification:
   - Click the extension icon to open the popup
   - Toggle "Enable preview on hover" and verify preview behavior changes
   - Adjust the hover delay slider and test different delay times
   - Toggle the "Show controls" option and verify it affects the preview UI

4. Interaction testing:
   - Moving away from a link should close the preview
   - Pressing ESC should close an active preview
   - Clicking the preview should open the link in a new tab
   - The "Open in new tab" button should work as expected
   - The "Close" button should close the preview

If you encounter any issues during testing, check the browser console for error messages. You may need to right-click on the page, select "Inspect", and then click on the "Console" tab to view these errors.

## Performance Optimizations

1. Lazy loading of previews only when needed
2. Single event listeners for the document rather than individual links
3. Efficient positioning calculations to prevent layout thrashing
4. Cleanup of DOM elements when no longer needed
5. Transition animations handled by CSS for smooth performance

## Future Enhancements

Potential improvements to consider:
- Support for additional search engines beyond Google
- Screenshot mode for faster previews with less bandwidth
- Advanced previews for specific content types (videos, documents, etc.)
- Keyboard navigation for power users
- Customizable preview size and appearance 