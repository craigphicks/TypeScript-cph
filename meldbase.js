const cp = require("child_process");
const args = process.argv.slice(2);
const right = args[0];
const left = right.replace("local","reference");
const cmd = `meld ${left} ${right}`;
console.log(cmd);
cp.execSync(cmd);
