/**
 * write an async function the get user input and echo it back to the console.
 */
function askUser(question) {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => {
        readline.question(question, (ans) => {
            readline.close();
            resolve(ans);
        });
    });
}

/** 
 * Write a command loop to call askUser()
 */
async function main() {
    let ans = '';
    while (ans !== 'q') {
        ans = await askUser('Enter a command (q to quit): ');
        console.log(`You entered: ${ans}`);
    }
    console.log('Goodbye!');
}
