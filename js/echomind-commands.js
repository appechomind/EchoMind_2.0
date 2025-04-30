class CommandsHandler {
    constructor() {
        this.commands = new Map();
        this.defaultHandler = null;
    }

    registerCommand(command, handler) {
        this.commands.set(command.toLowerCase(), handler);
    }

    setDefaultHandler(handler) {
        this.defaultHandler = handler;
    }

    processCommand(text) {
        const command = text.toLowerCase().trim();
        
        // Check for exact command matches
        if (this.commands.has(command)) {
            return this.commands.get(command)(command);
        }

        // Check for partial matches
        for (const [cmd, handler] of this.commands) {
            if (command.includes(cmd)) {
                return handler(command);
            }
        }

        // Use default handler if no match found
        if (this.defaultHandler) {
            return this.defaultHandler(command);
        }

        return null;
    }

    // Common command handlers
    static createDefaultHandlers() {
        const handlers = new CommandsHandler();
        
        handlers.registerCommand('help', () => {
            return {
                type: 'help',
                message: 'Available commands: help, start, stop, reset'
            };
        });

        handlers.registerCommand('start', () => {
            return {
                type: 'start',
                message: 'Starting EchoMind...'
            };
        });

        handlers.registerCommand('stop', () => {
            return {
                type: 'stop',
                message: 'Stopping EchoMind...'
            };
        });

        handlers.registerCommand('reset', () => {
            return {
                type: 'reset',
                message: 'Resetting EchoMind...'
            };
        });

        return handlers;
    }
}

// Export for use in other files
window.CommandsHandler = CommandsHandler; 