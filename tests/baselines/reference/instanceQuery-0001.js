//// [tests/cases/conformance/-instanceQuery/instanceQuery-0001.ts] ////

//// [instanceQuery-0001.ts]
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

    declare let a: ArrayBuffer;
    safeDataView(a); // should error

    declare let b: instanceof ArrayBuffer;
    safeDataView(b); // should not error

}

//// [instanceQuery-0001.js]
"use strict";
var instof0002;
(function (instof0002) {
    a = b; // should not Error
    b = a; // should Error
})(instof0002 || (instof0002 = {}));
var instof0003;
(function (instof0003) {
    let a;
    let b = new ArrayBuffer(0);
    a = b; // should not error
})(instof0003 || (instof0003 = {}));
(function (instof0003) {
    let b = new ArrayBuffer(0);
    b = a; // should Error
})(instof0003 || (instof0003 = {}));
var instof005;
(function (instof005) {
    let b = new ArrayBuffer(0);
    b = a; // should not Error
    a = b; // should not Error
})(instof005 || (instof005 = {}));
var instof006;
(function (instof006) {
    safeDataView(new ArrayBuffer(0)); // should error
    safeDataView(new ArrayBuffer(0)); // should not error
    safeDataView(a); // should error
    safeDataView(b); // should not error
})(instof006 || (instof006 = {}));
