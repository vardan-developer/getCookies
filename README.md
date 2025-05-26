# get-cookies-puppeteer

[![npm version](https://badge.fury.io/js/get-cookies-puppeteer.svg)](https://badge.fury.io/js/get-cookies-puppeteer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)

A lightweight Node.js package that enables you to effortlessly retrieve all cookies from any specified website using Puppeteer. Perfect for web scraping, testing, automation, and development workflows.

## Features

- 🍪 **Extract all cookies** from any website
- 🔄 **Flexible browser connection** - Use local Chrome/Chromium or connect to remote browser instances
- 💾 **Save cookies to file** - Automatically save extracted cookies to JSON files
- 🔧 **Environment variable support** - Configure browser paths and endpoints via environment variables
- 📦 **Lightweight** - Minimal dependencies with puppeteer-core
- 🚀 **Easy to use** - Simple API with comprehensive documentation
- 🔒 **Secure** - Handles browser cleanup and connection management

## Installation

```bash
npm install get-cookies-puppeteer
```

### Prerequisites

You'll need either:
1. **Local Chrome/Chromium browser** installed on your system, OR
2. **Remote browser instance** (like browserless.io, or your own remote Chrome instance) Make sure that the websocket will open on your machine and it's GUI is accessible to you otherwise you won't be able to interact with it.

## Quick Start

```javascript
import { getCookies } from 'get-cookies-puppeteer';

// Using local Chrome browser
const cookies = await getCookies('https://example.com', {
  executablePath: '/path/to/chrome'  // Path to your Chrome/Chromium executable
});

console.log('Extracted cookies:', cookies);
```

## Usage

### Basic Usage with Local Browser

```javascript
import { getCookies } from 'get-cookies-puppeteer';

const cookies = await getCookies('https://example.com', {
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' // macOS
  // executablePath: '/usr/bin/google-chrome' // Linux
  // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' // Windows
});
```

### Using Remote Browser (WebSocket)

```javascript
import { getCookies } from 'get-cookies-puppeteer';

const cookies = await getCookies('https://example.com', {
  browserWSEndpoint: 'ws://127.0.0.1:9222/devtools/browser/your-browser-id'
});
```

### Save Cookies to File

```javascript
const cookies = await getCookies(
  'https://example.com',
  { executablePath: '/path/to/chrome' },
  './cookies.json'  // Save cookies to this file
);
```

### Using Environment Variables

Set environment variables to avoid passing paths repeatedly:

```bash
# For local browser
export PUPPETEER_EXECUTABLE_PATH="/path/to/chrome"

# For remote browser
export WEBHOOK_URL="ws://127.0.0.1:9222/devtools/browser/your-browser-id"
```

Then use without connection data:

```javascript
const cookies = await getCookies('https://example.com');
```

### Setting Initial Cookies

```javascript
const initialCookies = [
  {
    name: 'session',
    value: 'abc123',
    domain: '.example.com',
    path: '/'
  }
];

const cookies = await getCookies(
  'https://example.com',
  { executablePath: '/path/to/chrome' },
  '',  // No file save
  initialCookies
);
```

## API Reference

### `getCookies(url, connectionData, cookieSavePath, defaultCookies)`

Extracts cookies from a specified website.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | `string` | ✅ | The URL to navigate to and extract cookies from |
| `connectionData` | `object` | ❌ | Browser connection configuration |
| `connectionData.executablePath` | `string` | ❌ | Path to Chrome/Chromium executable |
| `connectionData.browserWSEndpoint` | `string` | ❌ | WebSocket endpoint for remote browser |
| `cookieSavePath` | `string` | ❌ | File path to save cookies (empty string = no save) |
| `defaultCookies` | `array` | ❌ | Initial cookies to set before navigation |

#### Returns

`Promise<Array>` - Array of cookie objects

#### Cookie Object Format

```javascript
{
  name: "cookie_name",
  value: "cookie_value",
  domain: ".example.com",
  path: "/",
  expires: 1234567890,
  httpOnly: false,
  secure: true,
  sameSite: "Lax"
}
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PUPPETEER_EXECUTABLE_PATH` | Path to Chrome/Chromium executable | `/usr/bin/google-chrome` |
| `WEBHOOK_URL` | WebSocket endpoint for remote browser | `ws://127.0.0.1:9222/devtools/browser/id` |

## Browser Executable Paths

### Common Chrome/Chromium paths:

**macOS:**
```
/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
/Applications/Chromium.app/Contents/MacOS/Chromium
```

**Linux:**
```
/usr/bin/google-chrome
/usr/bin/chromium-browser
/snap/bin/chromium
```

**Windows:**
```
C:\Program Files\Google\Chrome\Application\chrome.exe
C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
```

## Error Handling

The package includes comprehensive error handling:

```javascript
try {
  const cookies = await getCookies('https://example.com', {
    executablePath: '/path/to/chrome'
  });
} catch (error) {
  if (error.message.includes('binary path')) {
    console.error('Chrome executable not found. Please check the path.');
  } else if (error.message.includes('PUPPETEER_EXECUTABLE_PATH')) {
    console.error('Please set browser configuration.');
  } else {
    console.error('An error occurred:', error.message);
  }
}
```

## How It Works

1. **Browser Launch/Connection**: Creates a browser instance using either local Chrome or remote WebSocket connection
2. **Navigation**: Opens a new page and navigates to the specified URL
3. **Cookie Monitoring**: Listens for HTTP responses and captures cookies in real-time
4. **Manual Interaction**: Waits for you to manually interact with the page (login, navigate, etc.)
5. **Cookie Extraction**: When you close the browser, all captured cookies are returned
6. **Cleanup**: Properly closes or disconnects from the browser

## Use Cases

- **Authentication Testing**: Extract session cookies after manual login
- **Web Scraping**: Get cookies for authenticated scraping sessions
- **Development**: Debug cookie-related issues in web applications
- **Automation**: Capture cookies for use in automated workflows
- **Session Management**: Export/import user sessions between environments

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/vardanverma/get-cookies/issues) on GitHub.

## Changelog

### v1.0.0
- Initial release
- Basic cookie extraction functionality
- Support for local and remote browser connections
- Environment variable configuration
- File saving capabilities
