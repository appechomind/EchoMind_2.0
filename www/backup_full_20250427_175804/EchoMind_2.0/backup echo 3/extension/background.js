/**
 * Google Peek - Background Script
 * 
 * This script runs in the background and handles browser events
 * like installation and updates.
 */

// Default settings for the extension
const defaultSettings = {
  enablePreview: true,
  hoverDelay: 500,
  showControls: true
};

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // First installation
    console.log('Google Peek has been installed!');
    
    // Initialize settings with default values
    chrome.storage.sync.set(defaultSettings, () => {
      console.log('Default settings saved');
    });
    
    // Open onboarding page
    chrome.tabs.create({
      url: 'https://github.com/yourusername/google-peek',
      active: true
    });
  } else if (details.reason === 'update') {
    // Extension was updated
    console.log('Google Peek has been updated!');
    
    // Ensure settings are consistent with the new version
    chrome.storage.sync.get(defaultSettings, (items) => {
      // Only save if something is missing or new defaults need to be added
      let needsUpdate = false;
      
      for (const key in defaultSettings) {
        if (items[key] === undefined) {
          items[key] = defaultSettings[key];
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        chrome.storage.sync.set(items, () => {
          console.log('Settings updated after extension update');
        });
      }
    });
  }
});

// Listen for browser icon clicks
chrome.action.onClicked.addListener((tab) => {
  // This will only fire if no popup is defined in the manifest
  // Since we have a popup defined, this is just a fallback
  
  if (!tab.url.includes('google.com/search')) {
    // If not on a Google search page, show a notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'images/icon128.png',
      title: 'Google Peek',
      message: 'Google Peek works on Google search results. Search something on Google to try it out!'
    });
  }
});

// Optional: handle context menu options
chrome.contextMenus.create({
  id: 'toggleGooglePeek',
  title: 'Enable/Disable Google Peek',
  contexts: ['action']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'toggleGooglePeek') {
    chrome.storage.sync.get('enablePreview', (data) => {
      const newState = !data.enablePreview;
      
      chrome.storage.sync.set({
        enablePreview: newState
      }, () => {
        // Show a notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'images/icon128.png',
          title: 'Google Peek',
          message: newState ? 'Google Peek has been enabled' : 'Google Peek has been disabled'
        });
        
        // Send message to any active tabs
        chrome.tabs.query({url: '*://*.google.com/search*'}, (tabs) => {
          for (const tab of tabs) {
            chrome.tabs.sendMessage(tab.id, {
              action: 'updateSettings',
              settings: {
                enablePreview: newState
              }
            });
          }
        });
      });
    });
  }
}); 