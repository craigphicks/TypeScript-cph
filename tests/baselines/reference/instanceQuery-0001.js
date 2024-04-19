//// [tests/cases/conformance/-instanceQuery/instanceQuery-0001.ts] ////

//// [instanceQuery-0001.ts]
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

namespace instof006 {

    declare function safeDataView(buffer: instanceof ArrayBuffer): DataView;
    safeDataView(new ArrayBuffer(0)); // no error expected

    declare let a: ArrayBuffer;
    safeDataView(a); // error expected

}

//// [instanceQuery-0001.js]
"use strict";
var instof0002;
(function (instof0002) {
    var a;
    var b = new ArrayBuffer(0); // should have type instanceof ArrayBuffer
    a;
    b;
    a = b;
})(instof0002 || (instof0002 = {}));
var instof0003;
(function (instof0003) {
    var a;
    var b = new ArrayBuffer(0); // should have type instanceof ArrayBuffer
    a;
    b;
    a = b;
})(instof0003 || (instof0003 = {}));
(function (instof0003) {
    var b = new ArrayBuffer(0); // should have type instanceof ArrayBuffer
    b = a; // should Error
})(instof0003 || (instof0003 = {}));
var instof005;
(function (instof005) {
    var b = new ArrayBuffer(0);
    b = a; // should not Error
})(instof005 || (instof005 = {}));
var instof006;
(function (instof006) {
    safeDataView(new ArrayBuffer(0)); // no error expected
    safeDataView(a); // error expected
})(instof006 || (instof006 = {}));
