// @strict: true
// @allowUnreachableCode: false
// @declaration: true

const assert: (value: unknown) => asserts value = value => {}

function f01(x: unknown) {
    // if (!!true) {
    //     assert(false);
    //     x;  // Unreachable
    // }
    // if (!!true) {
    //     assert(false && x === undefined);
    //     x;  // Unreachable
    // }
    x = 1;
    if (false && true && false && (true && false)){
        x = 2;
    } else {
        x = 3;
    }
    x;
}