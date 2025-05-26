import { getCookies } from 'get-cookies-puppeteer';

/**
 * Basic usage examples for get-cookies-puppeteer
 */

async function basicExample() {
    console.log('🍪 Basic Cookie Extraction Example\n');

    try {
        // Example 1: Using local Chrome browser
        console.log('Example 1: Local Chrome browser');
        const cookies1 = await getCookies('https://httpbin.org/cookies/set/example/value', {
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' // Update this path
        });
        console.log(`Extracted ${cookies1.length} cookies\n`);

        // Example 2: Using environment variables
        console.log('Example 2: Using environment variables (set PUPPETEER_EXECUTABLE_PATH)');
        // Make sure to set: export PUPPETEER_EXECUTABLE_PATH="/path/to/chrome"
        const cookies2 = await getCookies('https://httpbin.org/cookies/set/env/example');
        console.log(`Extracted ${cookies2.length} cookies\n`);

        // Example 3: Save cookies to file
        console.log('Example 3: Save cookies to file');
        const cookies3 = await getCookies(
            'https://httpbin.org/cookies/set/saved/cookie',
            {},
            './extracted-cookies.json'
        );
        console.log(`Extracted ${cookies3.length} cookies and saved to file\n`);

        // Example 4: Using initial cookies
        console.log('Example 4: Setting initial cookies');
        const initialCookies = [
            {
                name: 'initial',
                value: 'test123',
                domain: '.httpbin.org',
                path: '/'
            }
        ];
        const cookies4 = await getCookies(
            'https://httpbin.org/cookies',
            {},
            '',
            initialCookies
        );
        console.log(`Extracted ${cookies4.length} cookies with initial cookies set\n`);

    } catch (error) {
        console.error('Error:', error.message);
        console.log('\n💡 Make sure to:');
        console.log('1. Install Chrome or Chromium browser');
        console.log('2. Set PUPPETEER_EXECUTABLE_PATH environment variable, or');
        console.log('3. Pass executablePath in connectionData parameter');
    }
}

// Run the example
basicExample(); 