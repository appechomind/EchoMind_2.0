// Command handling
function handleCommand(command) {
  console.log('Received command:', command);

  // Navigation commands
  if (command.includes('go to') || command.includes('open')) {
    if (command.includes('mentalism')) {
      window.location.href = 'tricks/mentalism/mind-reader.html';
    } else if (command.includes('dual device')) {
      window.location.href = 'tricks/dual-device.html';
    } else if (command.includes('phone effects')) {
      alert('Phone Effects coming soon!');
    } else if (command.includes('puzzles')) {
      alert('Puzzles coming soon!');
    } else if (command.includes('community')) {
      alert('Community features coming soon!');
    } else if (command.includes('tricks')) {
      window.location.href = 'tricks/index.html';
    } else if (command.includes('settings')) {
      alert('Settings coming soon!');
    } else if (command.includes('mind reader')) {
      window.location.href = 'mind reader offical/index.html';
    }
  }

  // Help command
  if (command.includes('help') || command.includes('what can you do')) {
    const helpMessage = `
      I can help you navigate to different sections:
      - Mentalism
      - Dual Device Tricks
      - Phone Effects
      - Puzzles
      - Community
      - Tricks
      - Settings
      - Mind Reader
      
      Just say "go to" or "open" followed by the section name.
    `;
    alert(helpMessage);
  }
} 