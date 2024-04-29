// @strict: true
// @target: es2017

namespace instof000 {}

namespace instof0002 {
    declare let a: ArrayBuffer;
    declare let b: instanceof ArrayBuffer;
    a = b; // should not Error
    b = a; // should Error

}
namespace instof0003 {
    let a: ArrayBuffer | undefined;
    let b = new ArrayBuffer(0);
    a = b; // should not error
}
namespace instof0003 {
    declare let a: ArrayBuffer;
    let b = new ArrayBuffer(0) as instanceof ArrayBuffer;
    b = a ; // should Error
}
namespace instof005 {
    declare let a: instanceof ArrayBuffer;
    let b = new ArrayBuffer(0) as instanceof ArrayBuffer;
    b = a ; // should not Error
    a = b ; // should not Error
}

namespace instof006 {

    declare function safeDataView(buffer: instanceof ArrayBuffer): DataView;

    safeDataView(new ArrayBuffer(0)); // should error

    safeDataView(new ArrayBuffer(0) as instanceof ArrayBuffer); // should not error

}

namespace instof007 {

    declare function safeDataView(buffer: instanceof ArrayBuffer): DataView;
    let a: ArrayBuffer = new Uint8Array()
    safeDataView(a); // should error

    let b: instanceof ArrayBuffer = new Uint8Array(); // now the error is here
    safeDataView(b); // should not error

    let c: instanceof ArrayBuffer = new Uint8Array() as instanceof Uint8Array; // still error, but better error explanation
    safeDataView(c); // should not error
}