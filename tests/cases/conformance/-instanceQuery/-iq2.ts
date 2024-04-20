// @strict: true
// @instanceQueryEnableFromNew: true
// @target: esnext

namespace instof000 {
    if (a instanceof ArrayBuffer) {
        a; // expect instanceof ArrayBuffer
        safeDataView(a); // no error
    }
}





