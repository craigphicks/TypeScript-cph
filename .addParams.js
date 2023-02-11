const fs = require("fs");
const dir0 = "tests/cases/conformance/_cax"
const dir1 = "tests/cases/conformance/_caxyc"
fs.mkdirSync(dir1,{recursive:true});
fs.readdirSync(dir0,{withFileTypes:true}).forEach(de=>{
    if (de.isFile()){
        const fpin = dir0+"/"+de.name;
        let lines = fs.readFileSync(fpin).toString().split("\n");
        lines.splice(0,0,"// @mrNarrowEnable: true", "// @mrNarrowConstraintsEnable: true");
        let fpout = dir1+"/"+de.name.replace("_cax-","_caxyc-");
        fs.writeFileSync(fpout,lines.join("\n"));
    }
});