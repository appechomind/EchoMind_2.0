const fs = require('fs');
const { createCanvas } = require('canvas');

// Function to create an icon
function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background - Google blue
  ctx.fillStyle = '#4285F4';
  ctx.fillRect(0, 0, size, size);
  
  // Magnifying glass circle - white
  const centerX = size * 0.4;
  const centerY = size * 0.4;
  const radius = size * 0.25;
  
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fill();
  
  // Magnifying glass inner circle - light blue
  ctx.fillStyle = '#E8F0FE';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.7, 0, 2 * Math.PI);
  ctx.fill();
  
  // Handle - white
  const handleWidth = size * 0.12;
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(centerX + radius * 0.7, centerY + radius * 0.7);
  ctx.lineTo(size * 0.8, size * 0.8);
  ctx.lineTo(size * 0.8 - handleWidth, size * 0.8);
  ctx.lineTo(centerX + radius * 0.7 - handleWidth / 2, centerY + radius * 0.7);
  ctx.closePath();
  ctx.fill();
  
  // Document preview - white rectangle
  const previewWidth = size * 0.35;
  const previewHeight = size * 0.25;
  const previewX = size * 0.6;
  const previewY = size * 0.6;
  
  ctx.fillStyle = 'white';
  ctx.fillRect(previewX, previewY, previewWidth, previewHeight);
  
  // Document lines - blue
  if (size >= 48) {
    ctx.fillStyle = '#4285F4';
    ctx.fillRect(previewX + size * 0.05, previewY + size * 0.05, previewWidth * 0.7, size * 0.03);
    ctx.fillRect(previewX + size * 0.05, previewY + size * 0.12, previewWidth * 0.5, size * 0.03);
  }
  
  return canvas;
}

// Create icons
const sizes = [16, 48, 128];

sizes.forEach(size => {
  const canvas = createIcon(size);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`icon${size}.png`, buffer);
  console.log(`Created icon${size}.png`);
});

console.log('All icons created successfully!'); 