const cp = require("child_process");
const fs = require("fs");
const dir0 = "tmp.cph.d/old-reference/";
const dir1 = "tests/baselines/reference/";
fs.readdirSync(dir0,{withFileTypes:true}).forEach(de=>{
    if (de.isFile()){
        const right = dir0+de.name;
        const left = dir1 + de.name.replace("_cax-","_caxyc-");
        const cmd = `meld ${left} ${right}`;
        console.log(cmd);
        cp.execSync(cmd);
    }
});
