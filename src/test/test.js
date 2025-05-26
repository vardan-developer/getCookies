import { getCookies } from '../index.js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

/**
 * Test script for get-cookies-puppeteer package
 * This script demonstrates how to use the package and serves as a basic test
 */

async function runTest() {
    console.log('🧪 Testing get-cookies-puppeteer package...\n');

    // Check environment configuration
    console.log('📋 Environment Configuration:');
    console.log('PUPPETEER_EXECUTABLE_PATH:', process.env.PUPPETEER_EXECUTABLE_PATH || 'Not set');
    console.log('WEBHOOK_URL:', process.env.WEBHOOK_URL || 'Not set');
    console.log('');

    // Test URL - using a simple website for testing
    const testUrl = "https://httpbin.org/cookies/set/test/value";

    try {
        console.log(`🌐 Testing cookie extraction from: ${testUrl}`);
        console.log('⏳ Opening browser... (close the browser window when done)');

        const cookies = await getCookies(testUrl, {}, 'test-cookies.json');

        console.log('✅ Test completed successfully!');
        console.log(`📊 Extracted ${cookies.length} cookies:`);

        if (cookies.length > 0) {
            cookies.forEach((cookie, index) => {
                console.log(`   ${index + 1}. ${cookie.name} = ${cookie.value} (domain: ${cookie.domain})`);
            });
        } else {
            console.log('   No cookies found');
        }

        console.log('💾 Cookies saved to test-cookies.json');

    } catch (error) {
        console.error('❌ Test failed:', error.message);

        if (error.message.includes('PUPPETEER_EXECUTABLE_PATH')) {
            console.log('\n💡 Tip: Set the PUPPETEER_EXECUTABLE_PATH environment variable or pass executablePath in connectionData');
            console.log('Example paths:');
            console.log('  macOS: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
            console.log('  Linux: /usr/bin/google-chrome');
            console.log('  Windows: C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe');
        }

        process.exit(1);
    }
}

// Run the test
runTest();

