// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

/**
 * This tests is just to help with modifying binder.ts so that the expression after return is included in the flow.
 */
function test1(a: number): number {
    a;
    1;
    return 1;
}