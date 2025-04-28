# Google Peek

A Chrome extension that allows you to preview search results by hovering over links in Google search.

## Features

- Hover over a search result link to see a preview of the website
- Customizable hover delay
- Preview loads in a lightweight container without leaving the search page
- Works on all Google search pages
- Completely client-side with no external server dependencies

## Installation

### From Chrome Web Store

Coming soon!

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click on "Load unpacked" and select the extension directory
5. The extension should now be installed and active

## Testing

For detailed testing instructions, please see the [TESTING.md](TESTING.md) file. This document provides step-by-step guidance for testing all features of the extension.

## Usage

1. Perform a search on Google
2. Hover over any search result link
3. After a short delay, a preview of the linked page will appear
4. Move your mouse away to close the preview
5. Click on the extension icon to access settings:
   - Enable/disable previews
   - Adjust hover delay
   - Configure additional options

## Privacy

Google Peek respects your privacy:
- No data is collected or sent to external servers
- No tracking or analytics
- All content is rendered locally in your browser

## Technology

This extension is built using:
- JavaScript (ES6+)
- Chrome Extension API
- HTML/CSS for the UI

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## Acknowledgments

- Inspired by similar preview features in search engines
- Thanks to the open-source community for providing examples and resources 