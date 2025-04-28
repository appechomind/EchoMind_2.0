# Google Peek - Testing Instructions

This document provides step-by-step instructions for testing the Google Peek extension.

## Installation Setup

1. Open Chrome browser and go to `chrome://extensions/`

2. Enable "Developer mode" (toggle in the top-right corner)

3. Click "Load unpacked" and navigate to the `extension` folder containing the Google Peek files

4. Verify that Google Peek appears in your extensions list with its icon

## Functionality Testing

### Basic Preview Functionality

1. Go to Google.com and search for something (e.g., "weather forecast")

2. Hover over any search result link and wait for the delay (500ms by default)
   - You should see a preview popup appear next to the link
   - The preview should show the website content in an iframe
   - The popup should have controls at the bottom if enabled

3. Move your mouse away from the link
   - The preview should fade out and disappear

### Settings Customization

1. Click the Google Peek icon in your browser toolbar to open the popup

2. Test the following settings:
   - Toggle "Enable preview on hover" off and verify that previews no longer appear
   - Toggle it back on and confirm previews work again
   - Adjust the hover delay slider to different values (0ms, 500ms, 1000ms) and verify the timing changes
   - Toggle "Show controls" off and verify the controls no longer appear in previews
   - Toggle it back on and confirm controls reappear

3. Click "Apply Settings" after each change to save your preferences

### User Interactions

1. Interaction tests:
   - Hovering over a link should show the preview
   - Moving away from a link should close the preview
   - Pressing ESC key should close an active preview
   - Clicking the preview itself should open the link in a new tab
   - Clicking the "Open in new tab" button should open the link without closing the current page
   - Clicking the "Close" button should close the preview

2. Edge cases:
   - Very long links should still position the preview correctly
   - Links near the edge of the screen should adjust preview position to stay visible
   - Multiple quick hovers should not cause multiple previews to appear

## Troubleshooting

If anything doesn't work as expected:

1. Check the browser console for errors:
   - Right-click on the page
   - Select "Inspect"
   - Click on the "Console" tab
   - Look for any red error messages

2. Verify permissions:
   - On the `chrome://extensions/` page, click "Details" for Google Peek
   - Ensure all required permissions are granted

3. Reload the extension:
   - On the `chrome://extensions/` page, click the refresh icon for Google Peek
   - Reload your Google search page

## Reporting Issues

If you encounter bugs or have suggestions for improvement, please:

1. Check if the issue persists after reloading both the extension and the browser
2. Note the specific steps to reproduce the issue
3. Submit an issue on our GitHub repository with detailed information 