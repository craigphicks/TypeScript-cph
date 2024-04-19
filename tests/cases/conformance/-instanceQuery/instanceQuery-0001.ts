// @strict: true
// @returnInstanceofFromNew: true

namespace instof000 {}

namespace instof0002 {
    let a: instanceof ArrayBuffer | undefined;
    let b = new ArrayBuffer(0); // should have type instanceof ArrayBuffer
    a;b;
    a = b;
}
namespace instof0003 {
    let a: ArrayBuffer | undefined;
    let b = new ArrayBuffer(0); // should have type instanceof ArrayBuffer
    a;b;
    a = b;
}
namespace instof0003 {
    declare let a: ArrayBuffer;
    let b = new ArrayBuffer(0); // should have type instanceof ArrayBuffer
    b = a ; // should Error
}
namespace instof005 {
    declare let a: ArrayBuffer;
    let b: ArrayBuffer = new ArrayBuffer(0);
    b = a ; // should not Error
}



