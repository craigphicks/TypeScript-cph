// @strict: true
// @returnInstanceofFromNew: true

namespace instof0002 {
    declare function safeDataView(buffer: instanceof ArrayBuffer): DataView;
    safeDataView(new ArrayBuffer(0)); // no error expected

    declare let a: ArrayBuffer;
    safeDataView(a); // error expected


    if (a instanceof ArrayBuffer) {
        a; // expect instanceof ArrayBuffer
        safeDataView(a); // no error
    }

}




