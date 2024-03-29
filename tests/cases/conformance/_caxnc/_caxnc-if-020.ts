// @strict: true
// @declaration: true
declare let c1: boolean;
declare function fmaybe(): boolean;
if (c1) {
    c1;
    let c2 = fmaybe();
    if (c2) {
        let c3 = fmaybe();
        c2 = c3;
    }
    c1;
    c2
}
c1;