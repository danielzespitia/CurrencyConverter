/*
  Currency Converter App - Final Version
  Author: Daniel Edgardo Espitia
  Course: CSE 310
  Description: Console application that converts amounts between different currencies
  using real-time exchange rates.
  
  Requirements Met:
  1. Output to screen.
  2. Use of external library (axios).
  3. ES6 Array Functions (.filter, .push, .map).
  4. Recursion (flow control).
  5. Exception Handling (try/catch).
*/

import axios from 'axios'; // External library for HTTP requests
import readline from 'readline'; // Native module for input/output

// Readline interface configuration
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Temporary storage for session history (Array)
let conversionHistory = [];

/**
 * Helper function to interact with the user returning a Promise.
 * This avoids "callback hell" and allows using async/await.
 * @param {string} question - Text to display.
 */
const ask = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer));
    });
};

/**
 * Simulates a small pause to improve User Experience (UX).
 * @param {number} ms - Milliseconds to wait.
 */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches exchange rates from the public Frankfurter API.
 * Includes exception handling for network errors.
 * @param {string} base - Source currency.
 * @param {string} target - Target currency.
 * @param {number} amount - Amount to convert.
 */
async function getConversion(base, target, amount) {
    try {
        // If currencies are the same, avoid API call
        if (base === target) return amount;

        // API URL Construction
        const url = `https://api.frankfurter.app/latest?amount=${amount}&from=${base}&to=${target}`;
        
        // Async request with Axios
        const response = await axios.get(url);
        
        // Return only the numeric rate value
        return response.data.rates[target];
    } catch (error) {
        // Throw a custom error to be caught in the main function
        throw new Error(`Connection error or invalid currency code. Details: ${error.message}`);
    }
}

/**
 * Displays the conversion history for the current session.
 * Uses native ES6 Array functions (.map).
 */
function showHistory() {
    if (conversionHistory.length === 0) {
        console.log('\n--- No history yet ---');
        return;
    }

    console.log('\n--- Session History ---');
    // Using .map (ES6 Requirement) to format output
    conversionHistory.map((item, index) => {
        console.log(`${index + 1}. ${item}`);
    });
    console.log('-----------------------');
}

/**
 * Main Recursive Function.
 * Contains the core logic and application flow control.
 */
async function startApp() {
    console.clear(); // Clears console for a clean look
    console.log('\n=========================================');
    console.log('   REAL-TIME CURRENCY CONVERTER');
    console.log('=========================================');
    
    // List of common currencies for visual validation
    const popularCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'JPY', 'MXN', 'AUD'];

    try {
        // Option to see history count before starting
        if (conversionHistory.length > 0) {
            console.log(`Records in memory: ${conversionHistory.length}`);
        }

        // 1. DATA INPUT
        const amountInput = await ask('\n> Enter the amount to convert: ');
        const amount = parseFloat(amountInput);

        // Numeric input validation
        if (isNaN(amount)) {
            console.log('ERROR: The value entered is not a number. Please try again.');
            await wait(2000); // Pause so user can read the error
            return startApp(); // Recursion (Retry)
        }

        const baseCurrency = (await ask('> Source Currency (e.g., USD): ')).toUpperCase();
        const targetCurrency = (await ask('> Target Currency (e.g., EUR): ')).toUpperCase();

        // 2. VALIDATION & FEEDBACK (Array Filter ES6)
        const isPopular = popularCurrencies.filter(c => c === targetCurrency);
        if (isPopular.length > 0) {
            console.log(`ℹ️  Info: ${isPopular[0]} is a high-volume currency.`);
        }

        // 3. PROCESSING
        console.log('🔄 Fetching rates from international market...');
        const result = await getConversion(baseCurrency, targetCurrency, amount);

        // Formatting result
        const resultText = `${amount} ${baseCurrency} = ${result} ${targetCurrency}`;
        console.log(`\n✅ FINAL RESULT: ${resultText}`);

        // Save to history (Array Push ES6)
        conversionHistory.push(resultText);

    } catch (error) {
        // General Error Handling (Additional Requirement)
        console.error('\n❌ An unexpected error occurred:', error.message);
        console.log('Please check your internet connection or currency codes.');
    }

    // 4. FLOW CONTROL (Recursion)
    console.log('\n[1] New Conversion');
    console.log('[2] View History');
    console.log('[3] Exit');
    
    const option = await ask('\nSelect an option: ');

    if (option === '1') {
        startApp(); // Recursive call
    } else if (option === '2') {
        showHistory();
        await ask('\nPress Enter to continue...');
        startApp(); // Recursive call after history
    } else {
        // Base case: Break recursion and exit program
        console.log('\nThank you for using the converter. Goodbye!');
        rl.close();
        process.exit(0);
    }
}

// Application Entry Point
startApp();