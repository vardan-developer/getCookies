import puppeteer from "puppeteer-core";
import fs from "fs";

/**
 * Creates and returns a browser instance using either a remote connection or local launch
 * 
 * @param {Object} connectionData - Configuration object for browser connection
 * @param {string|undefined} connectionData.executablePath - Path to Chrome/Chromium executable (optional)
 * @param {string|undefined} connectionData.browserWSEndpoint - WebSocket endpoint URL for remote browser (optional)
 * @param {Array} cookies - Array of cookie objects to set in the browser (optional)
 * 
 * @returns {Promise<Browser>} - Puppeteer browser instance
 * 
 * @description
 * This function creates a browser instance in one of two ways:
 * 1. Remote Connection: If browserWSEndpoint is provided, connects to an existing browser via WebSocket
 * 2. Local Launch: If executablePath is provided, launches a new browser instance locally
 * 3. If connecting via webhook, we will need to be able to use the GUI to do the work
 * 
 * Environment Variables Used:
 * - WEBHOOK_URL: Fallback WebSocket endpoint for remote browser connection
 * - PUPPETEER_EXECUTABLE_PATH: Fallback path to Chrome/Chromium executable
 * 
 * Priority Order:
 * 1. browserWSEndpoint parameter > WEBHOOK_URL env var (for remote connection)
 * 2. executablePath parameter > PUPPETEER_EXECUTABLE_PATH env var (for local launch)
 * 
 * @throws {Error} If neither browserWSEndpoint nor executablePath is available
 * @throws {Error} If connection to remote browser fails
 * @throws {Error} If local browser launch fails
 */
async function getBrowser(connectionData = {
    executablePath: undefined,
    browserWSEndpoint: undefined,
}, cookies = []) {
    let browser;

    // Get environment variables as fallback values
    const binaryPath = process.env.PUPPETEER_EXECUTABLE_PATH;
    const webhookUrl = process.env.WEBHOOK_URL;

    // Determine which connection method to use (parameter takes priority over env var)
    const executablePath = connectionData.executablePath || binaryPath;
    const browserWSEndpoint = connectionData.browserWSEndpoint || webhookUrl;

    if (browserWSEndpoint) {
        /** 
         * REMOTE CONNECTION MODE:
         * Connect to an existing browser instance via WebSocket endpoint
         * This is useful when using browser-as-a-service providers or remote browser instances
         */
        try {
            browser = await puppeteer.connect({
                browserWSEndpoint,
            });
        } catch (error) {
            console.error("Error connecting to webhook URL", error);
            throw error;
        }
    } else if (executablePath) {
        /**
         * LOCAL LAUNCH MODE:
         * Launch a new browser instance using the specified executable path
         * Browser runs in non-headless mode (visible) for debugging purposes
         */
        try {
            browser = await puppeteer.launch({
                executablePath,
                headless: false, // Browser window will be visible
            });
        } catch (error) {
            console.error("Error launching browser, check if the binary path is correct and is compatible with the package", error);
            throw error;
        }
    } else {
        // Neither connection method is available
        throw new Error("Set either PUPPETEER_EXECUTABLE_PATH or WEBHOOK_URL environment variable");
    }

    /**
     * SET INITIAL COOKIES:
     * If cookies array is provided, set them in the browser before returning
     * Note: This sets cookies at browser level, not page level
     */
    if (cookies.length > 0) {
        await browser.setCookie(...cookies);
    }

    return browser;
}

/**
 * Navigates to a URL and captures cookies, handling browser closure gracefully
 * 
 * @param {string} url - The URL to navigate to and capture cookies from
 * @param {Object} connectionData - Browser connection configuration (optional)
 * @param {string|undefined} connectionData.executablePath - Path to Chrome/Chromium executable
 * @param {string|undefined} connectionData.browserWSEndpoint - WebSocket endpoint for remote browser
 * @param {string} cookieSavePath - File path to save cookies when browser closes (optional, empty string = no save)
 * @param {Array} defaultCookies - Initial cookies to set before navigation (optional)
 * 
 * @returns {Promise<Array>} - Array of cookie objects captured from the browser
 * 
 * @description
 * This function performs the following steps:
 * 1. Creates a browser instance using getBrowser()
 * 2. Opens a new page and navigates to the specified URL
 * 3. Sets up event listeners to capture cookies whenever HTTP responses occur
 * 4. Waits indefinitely until the browser is manually closed
 * 5. When browser closes, optionally saves cookies to file and returns them
 * 
 * Cookie Object Format (returned):
 * [
 *   {
 *     name: "cookie_name",
 *     value: "cookie_value", 
 *     domain: ".example.com",
 *     path: "/",
 *     expires: 1234567890,
 *     httpOnly: false,
 *     secure: true,
 *     sameSite: "Lax"
 *   }
 * ]
 * 
 * Usage Examples:
 * 
 * // Basic usage with local browser
 * const cookies = await getCookies("https://example.com", {
 *   executablePath: "/path/to/chrome"
 * });
 * 
 * // With remote browser and cookie saving
 * const cookies = await getCookies("https://example.com", {
 *   browserWSEndpoint: "ws://127.0.0.1:9222/devtools/browser/878b5668-eb0f-4772-a51c-db428d6bdd8b"
 * }, "./saved-cookies.json");
 * 
 * // With initial cookies
 * const cookies = await getCookies("https://example.com", {}, "", [
 *   { name: "session", value: "abc123", domain: ".example.com", path: "/" }
 * ]);
 * 
 * @throws {Error} If browser creation fails
 * @throws {Error} If navigation to URL fails
 */
async function getCookies(url, connectionData = {
    executablePath: undefined,
    browserWSEndpoint: undefined,
}, cookieSavePath = '', defaultCookies = []) {

    // Determine if we're using a remote browser connection
    const browserWSEndpoint = connectionData.browserWSEndpoint || process.env.WEBHOOK_URL;
    const isConnectedBrowser = !!browserWSEndpoint;

    // Create browser instance with optional default cookies
    const browser = await getBrowser(connectionData, defaultCookies);
    const page = await browser.newPage();

    // Initialize cookies array to store captured cookies
    let cookies = [];

    // Navigate to the target URL
    await page.goto(url);

    /**
     * COOKIE CAPTURE MECHANISM:
     * Listen for HTTP responses and capture cookies after each response
     * This ensures we get updated cookies as the page loads and makes requests
     */
    page.on('response', async (response) => {
        cookies = await browser.cookies();
    });

    try {
        /**
         * INFINITE WAIT:
         * Wait indefinitely until browser is manually closed
         * waitForFunction(() => false) with timeout: 0 means wait forever
         * This will throw an error when the browser/page is closed
         */
        await page.waitForFunction(() => false, { timeout: 0 });
    } catch (error) {
        /**
         * BROWSER CLOSURE HANDLING:
         * When browser is closed manually, this catch block executes
         * Save cookies to file if path is provided, then return the captured cookies
         */
        if (cookieSavePath) {
            fs.writeFileSync(cookieSavePath, JSON.stringify(cookies, null, 2));
        }
        return cookies;
    }
    finally {
        /**
         * CLEANUP:
         * Properly close or disconnect from browser based on connection type
         * - Remote browser: disconnect (don't close the remote browser)
         * - Local browser: close (terminate the browser process)
         */
        try {
            if (isConnectedBrowser) {
                await browser.disconnect(); // Disconnect from remote browser
            } else {
                await browser.close(); // Close local browser instance
            }
        } catch (error) {
            console.error("Error closing browser", error);
        }
    }
}

// Export the main function for use in other modules
export { getCookies };

