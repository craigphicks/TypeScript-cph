/* eslint-disable only-arrow-functions */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable no-var */

const fs = require("fs");


const raw = `
conformance tests conformance tests for tests/cases/conformance/_caxnc-decl/_caxnc-decl-0001.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-decl/_caxnc-decl-0001.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-decl/_caxnc-decl-0002.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-decl/_caxnc-decl-0002.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-decl/_caxnc-decl-0004.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-decl/_caxnc-decl-0004.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-decl/_caxnc-decl-0020.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-decl/_caxnc-decl-0020.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-decl/_caxnc-decl-0021.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-decl/_caxnc-decl-0021.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0001.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0001.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0002.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0002.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0003.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0003.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0004.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0004.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0006.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0006.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0009.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0009.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0020.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0020.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0022.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0022.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0023.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0023.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0024.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0024.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0030.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0030.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0031.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0031.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0032.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0032.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0033.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0033.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0034.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0034.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0040.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0040.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0043.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0043.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0044.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0044.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0046.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0046.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0047.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0047.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0051.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0051.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0052.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0052.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0053.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0053.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0054.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0054.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0055.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0055.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0056.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0056.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0070.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-loop/_caxnc-whileLoop-0070.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-prop/_caxnc-prop-0001.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-prop/_caxnc-prop-0001.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc-prop/_caxnc-prop-0002.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc-prop/_caxnc-prop-0002.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc/_caxnc-eqneq-0002.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc/_caxnc-eqneq-0002.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc/_caxnc-eqneq-0013.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc/_caxnc-eqneq-0013.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc/_caxnc-rhsAssign-0001.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc/_caxnc-rhsAssign-0001.ts
conformance tests conformance tests for tests/cases/conformance/_caxnc/_caxnc-typeUnknown-0001.ts Correct type/symbol baselines for tests/cases/conformance/_caxnc/_caxnc-typeUnknown-0001.ts
`;

// write a function to extract the filenames from the string raw.
// the filenames are the first group in the regex
function extractFilenames(raw) {
    var filenames = [];
//    var matches = raw.match(/tests\/cases\/conformance\/.*\.ts/g);
    var matches = raw.match(/tests\/cases\/conformance\/[^\s]+/g);
    for (var i = 0; i < matches.length; i++) {
        console.log(`"${matches[i]}"`);
        filenames.push(matches[i]);
    }
    return filenames;
}

// write a function to change the 6th character from the end of a string to a 1.
function   changeFilename(filename) {
    const x = filename.split('');
    x.splice(-6, 1, '1');
    return x.join('');
}

const EOL = "\r\n";

// write a function to read in a file filename1, modify contents, and write the file out to filename2.
function insertString(contents, s) {
    // read in the file filename1
    // const contents = fs.readFileSync(filename1, 'utf8').split(EOL);
    // find fist line that is empty
    const firstEmptyLine = contents.findIndex(line => line === '');
    // insert s at that line
    contents.splice(firstEmptyLine, 0, s);
    return contents;
}

extractFilenames(raw).forEach(function (filename) {
    const oldContents = fs.readFileSync(filename, 'utf8').split(EOL);
    const newContents = insertString(oldContents, "// @mrNarrowDoNotWidenInitalizedFlowType: true");
    const newFilename = changeFilename(filename);
    // write out the file to newFilename
    fs.writeFileSync(filename, newContents.join(EOL));
    fs.writeFileSync(newFilename, oldContents.join(EOL));
    // console.log(`${filename} ---> ${newFilename}`);
    // console.log(newContents.join(EOL));
    // exit the process
    // process.exit();
});