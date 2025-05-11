# Contributing to EchoMind

First off, thank you for considering contributing to EchoMind! It's people like you that make EchoMind such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots and animated GIFs if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful
* List some other applications where this enhancement exists, if applicable

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Include screenshots and animated GIFs in your pull request whenever possible
* Follow the JavaScript/React styleguides
* Include thoughtfully-worded, well-structured tests
* Document new code
* End all files with a newline

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider starting the commit message with an applicable emoji:
    * 🎨 `:art:` when improving the format/structure of the code
    * 🐎 `:racehorse:` when improving performance
    * 🚱 `:non-potable_water:` when plugging memory leaks
    * 📝 `:memo:` when writing docs
    * 🐛 `:bug:` when fixing a bug
    * 🔥 `:fire:` when removing code or files
    * 💚 `:green_heart:` when fixing the CI build
    * ✅ `:white_check_mark:` when adding tests
    * 🔒 `:lock:` when dealing with security
    * ⬆️ `:arrow_up:` when upgrading dependencies
    * ⬇️ `:arrow_down:` when downgrading dependencies

### JavaScript Styleguide

* Use modern ES6+ syntax
* Use semicolons
* Use 2 spaces for indentation
* Prefer `const` over `let`
* Avoid `var`
* Use meaningful variable names
* Use arrow functions
* Use template literals
* Use destructuring where possible
* Use async/await over promises
* Use === and !==

### React Styleguide

* Use functional components
* Use hooks
* Use prop-types
* Use meaningful component names
* Keep components small and focused
* Use CSS-in-JS or CSS modules
* Follow the React hooks rules
* Use proper component organization
* Write meaningful comments
* Use proper error boundaries

### Testing Styleguide

* Treat `describe` as a noun or situation
* Treat `it` as a statement about state or how an operation changes state
* Use meaningful test names
* Write testable code
* Test edge cases
* Keep tests simple
* Use proper assertions
* Clean up after tests

## Development Process

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Setting Up Your Development Environment

1. Install Node.js (v14 or higher)
2. Clone the repository
3. Install dependencies (`npm install`)
4. Start the development server (`npm start`)
5. Run tests (`npm test`)

## Project Structure

```
EchoMind_2.0/
├── src/
│   ├── core/
│   │   ├── ai/
│   │   ├── magic/
│   │   ├── ui/
│   │   └── utils/
│   ├── components/
│   │   ├── magic-tricks/
│   │   ├── ai-assistant/
│   │   └── settings/
│   ├── styles/
│   └── assets/
├── public/
│   ├── tricks/
│   └── tools/
├── tests/
└── docs/
```

## Questions?

Feel free to open an issue or contact the maintainers if you have any questions.

Thank you for contributing to EchoMind! 🎭✨ 