# EchoMind Voice Commands Integration

This directory contains examples of how to integrate the EchoMind voice command system into your magic tricks.

## Files

- `voice-command-trick-example.html` - A complete example of a voice-controlled card prediction trick
- `google-peek.html` - The Google Peek mind reading effect
- `test-speech.html` - A simple test page for speech recognition

## Voice Command Trick Example

The voice command example demonstrates how to create a magic trick that uses voice commands to control the presentation. This example shows:

- How to initialize and connect the speech recognition and command modules
- Registering custom voice commands for your trick
- Using voice commands to trigger effects
- Creating a user interface that responds to voice input

### How to use

1. Open `voice-command-trick-example.html` in a Chrome browser
2. Allow microphone access when prompted
3. Click "Start Listening" or say "Hey Echo, start listening"
4. Use the following voice commands:
   - "Hey Echo, reveal the card" - Reveals a selected card
   - "Hey Echo, reset trick" - Resets the trick
   - "Hey Echo, select ace of hearts" (and other cards) - Force selection of specific cards
   - "Hey Echo, stop listening" - Stops the speech recognition

## Implementation Details

The example integrates two core EchoMind modules:

1. **EchoMind.Speech** - Handles speech recognition using the Web Speech API
2. **EchoMind.Commands** - Processes recognized speech to detect and execute commands

The command system uses a trigger phrase ("Hey Echo" by default) to enter command mode, which makes the system listen for specific command phrases. This approach minimizes false positives during your performance.

## Creating Your Own Voice-Controlled Tricks

To create your own voice-controlled trick:

1. Include the necessary JavaScript modules:
```html
<script src="js/echo-speech.js"></script>
<script src="js/echo-commands.js"></script>
```

2. Initialize the speech recognition:
```javascript
EchoMind.Speech.init({
    continuous: true,
    interimResults: true,
    // Additional options and callbacks
});
```

3. Initialize the command system:
```javascript
EchoMind.Commands.init({
    triggerPhrase: "hey echo", // Customize as needed
    // Additional options and callbacks
});
```

4. Register your custom commands:
```javascript
EchoMind.Commands.registerCommand("your command phrase", function() {
    // Action to perform when this command is recognized
});
```

5. Pass speech recognition results to the command processor:
```javascript
EchoMind.Speech.init({
    // ...
    onResult: function(event, results) {
        const transcript = results[0][0].transcript;
        EchoMind.Commands.processText(transcript);
    }
});
```

## Browser Compatibility

The voice command system relies on the Web Speech API, which is best supported in Google Chrome. For optimal performance, use Chrome on desktop. 