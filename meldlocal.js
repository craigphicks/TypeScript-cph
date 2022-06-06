const cp = require("child_process");
const fs = require("fs");
const dir = "tests/baselines/local/";
fs.readdirSync(dir,{withFileTypes:true}).forEach(de=>{
    if (de.isFile()){
        const right = dir+de.name;
        const left = right.replace("local","reference");
        const cmd = `meld ${left} ${right}`;
        console.log(cmd);
        cp.execSync(cmd);
    }
});
