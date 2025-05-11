/**
 * Google Peek - A Chrome extension to preview search results
 * 
 * This content script adds preview functionality to Google search results.
 */

// Configuration
let config = {
  previewDelay: 500,        // Delay in ms before showing the preview (to prevent accidental triggers)
  previewWidth: 400,        // Width of the preview iframe
  previewHeight: 300,       // Height of the preview iframe
  fadeInDuration: 200,      // Duration of fade-in animation in ms
  maxZIndex: 2147483647,    // Maximum z-index to ensure preview appears on top
  enabled: true,            // Whether preview functionality is enabled
  showControls: true        // Whether to show controls in the preview
};

// Global variables
let currentPreview = null;
let previewTimer = null;
let lastHoveredLink = null;

// Load settings from storage
chrome.storage.sync.get({
  // Default values
  enablePreview: true,
  hoverDelay: 500,
  showControls: true
}, function(items) {
  config.enabled = items.enablePreview;
  config.previewDelay = items.hoverDelay;
  config.showControls = items.showControls;
});

// Listen for settings updates from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'updateSettings') {
    config.enabled = request.settings.enablePreview;
    config.previewDelay = request.settings.hoverDelay;
    config.showControls = request.settings.showControls;
    
    // If disabled, hide any active preview
    if (!config.enabled && currentPreview) {
      hidePreview();
    }
    
    sendResponse({success: true});
  }
  return true;
});

// Create and initialize the preview container
function createPreviewContainer() {
  const container = document.createElement('div');
  container.id = 'google-peek-preview';
  container.style.cssText = `
    position: absolute;
    width: ${config.previewWidth}px;
    height: ${config.previewHeight}px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    z-index: ${config.maxZIndex};
    overflow: hidden;
    opacity: 0;
    transition: opacity ${config.fadeInDuration}ms ease;
    display: none;
  `;
  
  // Add loading spinner
  const spinner = document.createElement('div');
  spinner.className = 'google-peek-spinner';
  spinner.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: google-peek-spin 1s linear infinite;
  `;
  container.appendChild(spinner);
  
  // Create iframe for the preview
  const iframe = document.createElement('iframe');
  iframe.style.cssText = `
    width: 100%;
    height: ${config.showControls ? 'calc(100% - 36px)' : '100%'};
    border: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  container.appendChild(iframe);
  
  // Add controls if enabled
  if (config.showControls) {
    const controls = document.createElement('div');
    controls.className = 'google-peek-controls';
    controls.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 36px;
      background-color: #f8f9fa;
      border-top: 1px solid #eee;
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 0 10px;
    `;
    
    // Open in new tab button
    const openButton = document.createElement('button');
    openButton.textContent = 'Open in new tab';
    openButton.style.cssText = `
      background: none;
      border: none;
      color: #1a73e8;
      font-size: 13px;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
    `;
    openButton.addEventListener('click', function(e) {
      e.stopPropagation();
      window.open(iframe.src, '_blank');
      hidePreview();
    });
    controls.appendChild(openButton);
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.cssText = `
      background: none;
      border: none;
      color: #5f6368;
      font-size: 13px;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
    `;
    closeButton.addEventListener('click', function(e) {
      e.stopPropagation();
      hidePreview();
    });
    controls.appendChild(closeButton);
    
    container.appendChild(controls);
  }
  
  document.body.appendChild(container);
  return container;
}

// Position the preview container relative to the link
function positionPreview(container, link) {
  const linkRect = link.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  
  // Determine if we should show the preview on the left or right side
  const viewportWidth = window.innerWidth;
  const spaceOnRight = viewportWidth - (linkRect.right + scrollX);
  
  let left;
  if (spaceOnRight >= config.previewWidth + 20) {
    // Position on the right
    left = linkRect.right + scrollX + 10;
  } else {
    // Position on the left
    left = linkRect.left + scrollX - config.previewWidth - 10;
  }
  
  // Make sure preview is not positioned off-screen
  left = Math.max(10, Math.min(left, viewportWidth - config.previewWidth - 10));
  
  // Position vertically centered with the link if possible
  let top = linkRect.top + scrollY - (config.previewHeight / 2) + (linkRect.height / 2);
  
  // Make sure the preview is not positioned off-screen vertically
  const viewportHeight = window.innerHeight;
  top = Math.max(10 + scrollY, Math.min(top, scrollY + viewportHeight - config.previewHeight - 10));
  
  container.style.left = `${left}px`;
  container.style.top = `${top}px`;
}

// Show the preview for a specific URL
function showPreview(url, link) {
  // Check if previews are enabled
  if (!config.enabled) {
    return;
  }
  
  // If we already have a preview, hide it first
  if (currentPreview) {
    hidePreview();
  }
  
  // Create a new preview container
  currentPreview = createPreviewContainer();
  lastHoveredLink = link;
  
  // Add active link class to the link
  link.classList.add('google-peek-active-link');
  
  // Position the preview next to the link
  positionPreview(currentPreview, link);
  
  // Show the container
  currentPreview.style.display = 'block';
  
  // Trigger reflow to ensure the transition works
  void currentPreview.offsetWidth;
  
  // Fade in the container
  currentPreview.style.opacity = '1';
  
  // Load the URL in the iframe
  const iframe = currentPreview.querySelector('iframe');
  iframe.onload = function() {
    // Hide spinner and show iframe content
    currentPreview.querySelector('.google-peek-spinner').style.display = 'none';
    iframe.style.opacity = '1';
  };
  
  iframe.src = url;
  
  // Add event listener to hide preview when mouse leaves
  currentPreview.addEventListener('mouseleave', hidePreviewDelayed);
  
  // Add event listener for clicking the iframe to open the link
  currentPreview.addEventListener('click', function(e) {
    // Only handle clicks on the container itself, not its controls
    if (e.target === currentPreview || e.target === iframe) {
      window.open(url, '_blank');
      hidePreview();
    }
  });
}

// Hide the preview with delay
function hidePreviewDelayed() {
  previewTimer = setTimeout(hidePreview, 300);
}

// Immediately hide the preview
function hidePreview() {
  if (currentPreview) {
    currentPreview.style.opacity = '0';
    
    // Remove active link class
    if (lastHoveredLink) {
      lastHoveredLink.classList.remove('google-peek-active-link');
    }
    
    setTimeout(function() {
      if (currentPreview && currentPreview.parentNode) {
        document.body.removeChild(currentPreview);
        currentPreview = null;
      }
    }, config.fadeInDuration);
  }
  
  if (previewTimer) {
    clearTimeout(previewTimer);
    previewTimer = null;
  }
}

// Handle mouse enter on search result links
function handleLinkMouseEnter(e) {
  // Check if previews are enabled
  if (!config.enabled) {
    return;
  }
  
  const link = e.target.closest('a');
  if (!link || !link.href || link.href.includes('google.com')) {
    return;
  }
  
  // Clear any existing preview timer
  if (previewTimer) {
    clearTimeout(previewTimer);
  }
  
  // Set timer to show preview after delay
  previewTimer = setTimeout(function() {
    showPreview(link.href, link);
  }, config.previewDelay);
  
  // Remember the current link
  lastHoveredLink = link;
}

// Handle mouse leave on search result links
function handleLinkMouseLeave() {
  if (previewTimer) {
    clearTimeout(previewTimer);
    previewTimer = null;
  }
  
  if (currentPreview) {
    // Only hide if mouse is not over the preview
    previewTimer = setTimeout(function() {
      if (currentPreview && !isMouseOverElement(currentPreview)) {
        hidePreview();
      }
    }, 300);
  }
}

// Check if mouse is over an element
function isMouseOverElement(element) {
  const rect = element.getBoundingClientRect();
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  
  return (
    mouseX >= rect.left &&
    mouseX <= rect.right &&
    mouseY >= rect.top &&
    mouseY <= rect.bottom
  );
}

// Add CSS animation for the spinner
function addSpinnerAnimation() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes google-peek-spin {
      0% { transform: translate(-50%, -50%) rotate(0deg); }
      100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
    
    .google-peek-active-link {
      position: relative;
    }
    
    .google-peek-active-link::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -2px;
      width: 100%;
      height: 2px;
      background-color: #4285f4;
      animation: google-peek-pulse 1.5s infinite;
    }
    
    @keyframes google-peek-pulse {
      0% { opacity: 0.6; }
      50% { opacity: 0.9; }
      100% { opacity: 0.6; }
    }
  `;
  document.head.appendChild(style);
}

// Initialize the extension
function initialize() {
  addSpinnerAnimation();
  
  // Add event listeners to search result links
  document.addEventListener('mouseover', function(e) {
    if (e.target.tagName === 'A' || e.target.closest('a')) {
      handleLinkMouseEnter(e);
    }
  });
  
  document.addEventListener('mouseout', function(e) {
    if (e.target.tagName === 'A' || e.target.closest('a')) {
      handleLinkMouseLeave();
    }
  });
  
  // Handle scroll event to reposition preview
  window.addEventListener('scroll', function() {
    if (currentPreview && lastHoveredLink) {
      positionPreview(currentPreview, lastHoveredLink);
    }
  });
  
  // Handle window resize
  window.addEventListener('resize', function() {
    if (currentPreview && lastHoveredLink) {
      positionPreview(currentPreview, lastHoveredLink);
    }
  });
  
  // Handle keyboard escape key to close preview
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && currentPreview) {
      hidePreview();
    }
  });
}

// Initialize when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
} 