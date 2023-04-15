/* eslint-disable @typescript-eslint/quotes */
const cp = require("child_process");
//const fs = require("fs/promises");
const fs = require("fs");
const path = require("path");
const readlinem = require("readline");
const dir = "tests/baselines/local/";

function escapeRegExp1(text) {
    return Array.from(text)
           .map(char => `\\u{${char.charCodeAt(0).toString(16)}}`)
           .join('');
}
function escapeRegExp2(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}


let idx = 2;
let interactiveAccept = false;
if (process.argv[idx]==="-i"){
    interactiveAccept = true;
    idx++;
}

// eslint-disable-next-line prefer-const
let basefilts = process.argv.slice(idx);
//basefilts = basefilts.map(filt=>escapeRegExp2(filt));
console.log(`basefilt: [${basefilts.length}] ${basefilts}`);
basefilts.forEach((b,idx)=>{
    console.log(`baseline[${idx}]: ${b}, re.source: ${(new RegExp(b)).source}, re: ${new RegExp(b)}`);
});

function askUser(question) {
    const readline = readlinem.createInterface({
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

async function main(){
    const arrdirent = await fs.promises.readdir(dir,{ withFileTypes:true });
    arrdirent.forEach(de=>{
        if (de.isFile()){
            console.log(`de.name:${de.name}`);
        }
        else console.log(`de.name:${de.name} (dir)`);
    });
    arrdirent.reduce(async (promise,de)=>{
        await promise;
        if (de.isFile()){
            // if (!basefilts.every(filt=>de.name.includes(filt))) return;
            if (!basefilts.every(filt=>{
                const re = new RegExp(filt);
                const tmp = de.name+"";
                return tmp.match(re);
            })) return;
            console.log(`de.name:${de.name}`);
            const right = dir+de.name;
            const left = right.replace("local","reference");
            const cmd = `meld ${left} ${right}`;
            console.log(cmd);
            cp.execSync(cmd);
            if (interactiveAccept && path.extname(de.name)===".types"){
                const accept = await askUser(`accept into baseline? Ny (${path.basename(de.name)})`);
                if (accept!=="y"){
                    console.log(`not accepting ${de.name}`);
                }
                else {
                    console.log(`accepting ${de.name}`);
                    await fs.promises.copyFile(right,left);
                    console.log(`copy ${right} -> ${left} success`);

                    const jsFile = right.replace(".types",".js");
                    if (fs.existsSync(jsFile)){
                        const jsFileLeft = left.replace(".types",".js");
                        await fs.promises.copyFile(jsFile,jsFileLeft);
                        console.log(`copy ${jsFile} -> ${jsFileLeft} success`);
                    }

                    const symbolsFile = right.replace(".types",".symbols");
                    if (fs.existsSync(symbolsFile)){
                        const symbolsFileLeft = left.replace(".types",".symbols");
                        await fs.promises.copyFile(symbolsFile,symbolsFileLeft);
                        console.log(`copy ${symbolsFile} -> ${symbolsFileLeft} success`);
                    }
                    const errorsFile = right.replace(".types",".errors.txt");
                    if (fs.existsSync(errorsFile)){
                        const errorsFileLeft = left.replace(".types",".errors.txt");
                        await fs.promises.copyFile(errorsFile,errorsFileLeft);
                        console.log(`copy ${errorsFile} -> ${errorsFileLeft} success`);
                    }
                }
            }
        }
    }, Promise.resolve());
}

main()
.then(()=>{ console.log("done");})
.catch(err=>{ console.log(err); });



