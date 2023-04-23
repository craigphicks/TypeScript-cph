
const path = require("path");
const fs = require("fs");
// function to substitute "fixme" to "caxnc" in the basename of a file path
function subs(fp) {
    const base = path.basename(fp);
    const dir = path.dirname(fp);
    const base2 = base.replace(/fixme/g, "caxnc");
    return path.join(dir,base2);
}

// get files in a directory dir

function getFiles(dir) {
    return fs.readdirSync(dir);
}

const dir="tests/cases/conformance/_caxFIXME";
getFiles(dir).forEach((file) => {
    const fnsrc = path.join(dir, file);
    const fndst = subs(fnsrc);
    if (fnsrc === fndst) return;
    console.log(fnsrc, fndst);
    fs.renameSync(fnsrc, fndst);
});
