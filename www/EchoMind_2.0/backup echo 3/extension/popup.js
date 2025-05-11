/**
 * Google Peek - Popup Script
 * Handles user interaction with the popup
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  const enablePreviewCheckbox = document.getElementById('enablePreview');
  const hoverDelaySlider = document.getElementById('hoverDelay');
  const delayValueDisplay = document.getElementById('delayValue');
  const showControlsCheckbox = document.getElementById('showControls');
  const applySettingsBtn = document.getElementById('applySettings');
  const statusIcon = document.getElementById('statusIcon');
  const statusText = document.getElementById('statusText');
  
  // Load saved settings
  loadSettings();
  
  // Add event listeners
  hoverDelaySlider.addEventListener('input', updateDelayDisplay);
  applySettingsBtn.addEventListener('click', saveSettings);
  
  // Check if we're on Google search page
  checkCurrentPage();
  
  /**
   * Load settings from storage
   */
  function loadSettings() {
    chrome.storage.sync.get({
      // Default values
      enablePreview: true,
      hoverDelay: 500,
      showControls: true
    }, function(items) {
      enablePreviewCheckbox.checked = items.enablePreview;
      hoverDelaySlider.value = items.hoverDelay;
      showControlsCheckbox.checked = items.showControls;
      
      // Update display
      updateDelayDisplay();
      updateStatusUI(items.enablePreview);
    });
  }
  
  /**
   * Save settings to storage
   */
  function saveSettings() {
    const settings = {
      enablePreview: enablePreviewCheckbox.checked,
      hoverDelay: parseInt(hoverDelaySlider.value),
      showControls: showControlsCheckbox.checked
    };
    
    chrome.storage.sync.set(settings, function() {
      // Show success message
      applySettingsBtn.textContent = 'Settings Saved!';
      
      // Apply settings to any open Google search pages
      applySettingsToActivePages(settings);
      
      // Update status UI
      updateStatusUI(settings.enablePreview);
      
      // Reset button text after a delay
      setTimeout(function() {
        applySettingsBtn.textContent = 'Apply Settings';
      }, 1500);
    });
  }
  
  /**
   * Update the display of the delay value
   */
  function updateDelayDisplay() {
    delayValueDisplay.textContent = hoverDelaySlider.value + ' ms';
  }
  
  /**
   * Update the status icon and text based on enabled state
   */
  function updateStatusUI(enabled) {
    if (enabled) {
      statusIcon.classList.remove('inactive');
      statusText.textContent = 'Active on google.com search results';
    } else {
      statusIcon.classList.add('inactive');
      statusText.textContent = 'Preview on hover is disabled';
    }
  }
  
  /**
   * Apply settings to any active Google search pages
   */
  function applySettingsToActivePages(settings) {
    chrome.tabs.query({url: '*://*.google.com/search*'}, function(tabs) {
      tabs.forEach(function(tab) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'updateSettings',
          settings: settings
        });
      });
    });
  }
  
  /**
   * Check if current page is a Google search page
   */
  function checkCurrentPage() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      const url = currentTab.url || '';
      
      if (url.match(/^https?:\/\/(?:www\.)?google\.[^/]+\/search/)) {
        // We're on a Google search page
        const infoElement = document.createElement('div');
        infoElement.style.cssText = `
          background-color: #e8f0fe;
          color: #1a73e8;
          padding: 8px 15px;
          margin-top: 10px;
          border-radius: 4px;
          font-size: 13px;
          text-align: center;
        `;
        infoElement.textContent = 'Google Peek is available on this page!';
        
        const settingsDiv = document.querySelector('.settings');
        settingsDiv.appendChild(infoElement);
      }
    });
  }
}); 