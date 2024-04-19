// @strict: true
// @returnInstanceofFromNew: true

namespace instof0002 {
    declare function safeDataView(buffer: instanceof ArrayBuffer): DataView;
    //safeDataView(new ArrayBuffer(0)); // no error     OK

    declare let a: ArrayBuffer;
    safeDataView(a); // error  CRASH


    // if (a instanceof ArrayBuffer) {
    //     safeDataView(a); // no error
    // }

}




