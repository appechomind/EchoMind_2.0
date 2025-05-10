export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

export function isImageFile(filename) {
  const ext = getFileExtension(filename).toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
}

export function isVideoFile(filename) {
  const ext = getFileExtension(filename).toLowerCase();
  return ['mp4', 'webm', 'mov'].includes(ext);
}

export function getMediaType(filename) {
  if (isImageFile(filename)) return 'image';
  if (isVideoFile(filename)) return 'video';
  return 'unknown';
}

export function filterMediaByProject(mediaItems, projectId) {
  if (!projectId) return mediaItems;
  return mediaItems.filter(item => item.projectId === projectId);
}

export function searchMedia(mediaItems, query) {
  const searchTerm = query.toLowerCase();
  return mediaItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm) ||
    item.keywords.some(k => k.toLowerCase().includes(searchTerm))
  );
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
} 