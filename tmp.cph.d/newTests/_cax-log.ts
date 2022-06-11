// @strict: true
// @ allowUnreachableCode: true
// @declaration: true

const assert: (value: unknown) => asserts value = value => {}
declare const b:boolean;// = !!false;

function flog(x: unknown) {
    // if (!!true) {
    //     assert(false);
    //     x;  // Unreachable
    // }
    // if (!!true) {
    //     assert(false && x === undefined);
    //     x;  // Unreachable
    // }
    const a = !!true;
    const c = !!a && !!b;
    if (c){
        const y = b; // IS: y: true
        const x = a; // IS: x: true
    } 
    else {
        const x = a; // IS: x: true
        const y = b; // IS: y: boolean
    }
}