import axios from 'axios';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let conversionHistory = [];

const ask = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer));
    });
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getConversion(base, target, amount) {
    try {
        if (base === target) return amount;

        const url = `https://api.frankfurter.app/latest?amount=${amount}&from=${base}&to=${target}`;
        
        const response = await axios.get(url);
        
        return response.data.rates[target];
    } catch (error) {
        throw new Error(`Connection error or invalid currency code. Details: ${error.message}`);
    }
}

function showHistory() {
    if (conversionHistory.length === 0) {
        console.log('\n--- No history yet ---');
        return;
    }

    console.log('\n--- Session History ---');
    conversionHistory.map((item, index) => {
        console.log(`${index + 1}. ${item}`);
    });
    console.log('-----------------------');
}

async function startApp() {
    console.clear();
    console.log('\n=========================================');
    console.log('   REAL-TIME CURRENCY CONVERTER');
    console.log('=========================================');
    
    const popularCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'JPY', 'MXN', 'AUD'];

    try {
        if (conversionHistory.length > 0) {
            console.log(`Records in memory: ${conversionHistory.length}`);
        }

        const amountInput = await ask('\n> Enter the amount to convert: ');
        const amount = parseFloat(amountInput);

        if (isNaN(amount)) {
            console.log('ERROR: The value entered is not a number. Please try again.');
            await wait(2000);
            return startApp();
        }

        const baseCurrency = (await ask('> Source Currency (e.g., USD): ')).toUpperCase();
        const targetCurrency = (await ask('> Target Currency (e.g., EUR): ')).toUpperCase();

        const isPopular = popularCurrencies.filter(c => c === targetCurrency);
        if (isPopular.length > 0) {
            console.log(`ℹ️  Info: ${isPopular[0]} is a high-volume currency.`);
        }

        console.log('🔄 Fetching rates from international market...');
        const result = await getConversion(baseCurrency, targetCurrency, amount);

        const resultText = `${amount} ${baseCurrency} = ${result} ${targetCurrency}`;
        console.log(`\n✅ FINAL RESULT: ${resultText}`);

        conversionHistory.push(resultText);

    } catch (error) {
        console.error('\n❌ An unexpected error occurred:', error.message);
        console.log('Please check your internet connection or currency codes.');
    }

    console.log('\n[1] New Conversion');
    console.log('[2] View History');
    console.log('[3] Exit');
    
    const option = await ask('\nSelect an option: ');

    if (option === '1') {
        startApp();
    } else if (option === '2') {
        showHistory();
        await ask('\nPress Enter to continue...');
        startApp();
    } else {
        console.log('\nThank you for using the converter. Goodbye!');
        rl.close();
        process.exit(0);
    }
}

startApp();