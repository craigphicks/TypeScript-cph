//// [tests/cases/conformance/-instanceQuery/instanceQuery-0014.ts] ////

//// [instanceQuery-0014.ts]
namespace iq0014a {
    class EmptyBase {}
    class A { a = 0; }
    function extendsEmptyBase<T extends EmptyBase>(x: T): x is (EmptyBase & T) {
        // no problem/error here
        return true;
    }
    declare const a: A | EmptyBase | {};
    if (extendsEmptyBase(a)) {
        a;
    }
    else {
        a;
    }
}

namespace iq0014b {
    class EmptyBase {}
    function f<T extends EmptyBase>(t: T): void {
        const x = (0 as any as (instanceof EmptyBase) & T);
        t = x;
    }
}

namespace iq0014c {
    class EmptyBase {}
    class A { a = 0; }
    function extendsEmptyBaseInstance<T extends Object>(x: T): x is ((instanceof EmptyBase) & T) {
        return x instanceof EmptyBase;
    }
    declare const a: A | EmptyBase | {};
    if (extendsEmptyBaseInstance(a)) {
        a;
    }
    else {
        a;
    }
}

namespace iq0014c {
    class EmptyBase {}
    class A extends EmptyBase{ a = 0; }

    function extendsAInstance<T extends Object>(x: T): x is (instanceof A) & T {
        return x instanceof A;
    }
    declare const a: instanceof EmptyBase ; //| (instanceof EmptyBase & A);
    if (extendsAInstance(a)) {
        a;
    }
    else {
        a;
    }
}


namespace iq0014d {
    class EmptyBase {}
    class A extends EmptyBase { a = 0; }
    class B { a = 0; } // does not extend EmptyBase
    function extendsEmptyBaseInstance<T extends Object>(x: T): x is (instanceof EmptyBase) & T {
        return x instanceof EmptyBase;
    }
    function extendsAInstance<T extends Object>(x: T): x is (instanceof A) & T {
        return x instanceof A;
    }
    function extendsBInstance<T extends Object>(x: T): x is (instanceof B) & T {
        return x instanceof B;
    }
    declare const a: A | EmptyBase | {};
    if (extendsEmptyBaseInstance(a)) {
        a; // ((instanceof EmptyBase & EmptyBase)) | ((instanceof EmptyBase & A)))
        if (extendsAInstance(a)) {
            a; // (instanceof A & (A & EmptyBase))
        }
        else {
            a;
        }
        if (extendsBInstance(a)) {
            a; // never
        }
        else {
            a;
        }
    }
    else {
        a;
    }
}

namespace iq0014e {
    class EmptyBase {}
    class A extends EmptyBase { a = 0; }
    class B { a = 0; } // does not extend EmptyBase
    function extendsEmptyBaseInstance<T>(x: T): x is (instanceof EmptyBase) & T {
        return x instanceof EmptyBase;
    }
    function extendsAInstance<T>(x: T): x is (instanceof A) & T {
        return x instanceof A;
    }
    function extendsBInstance<T>(x: T): x is (instanceof B) & T {
        return x instanceof B;
    }
    declare const a: A | EmptyBase | {};
    if (extendsEmptyBaseInstance(a)) {
        a; // ((instanceof EmptyBase & EmptyBase)) | ((instanceof EmptyBase & A)))
        if (extendsAInstance(a)) {
            a; // (instanceof A & (A & EmptyBase))
        }
        else {
            a;
        }
        if (extendsBInstance(a)) {
            a; // never
        }
        else {
            a;
        }
    }
    else {
        a;
    }
}

namespace iq0014f {
    declare class Ax { a: number }
    declare class Bx extends Ax { b: number }
    declare class Cx extends Bx { c: number }

    type A = Ax
    type B = Bx
    type C = Cx

    type AB = A & B
    type AC = A & C
    type BC = B & C

    function isAB(x: any): x is AB {
        return true;
    }
    function isBC(x: any): x is BC {
        return true;
    }
    function isAC(x: any): x is AC {
        return true;
    }

    declare const x: A | B | C;
    if (isAB(x)) {
        x; // ABC
        if (isBC(x)) {
            x; // ABC
            if (isAC(x)) {
                x; // ABC
            }
        }
    }


}


namespace iq0014g {

    declare class Ax { a: number }
    declare class Bx extends Ax { b: number }
    declare class Cx extends Bx { c: number }

    type A = instanceof Ax
    type B = instanceof Bx
    type C = instanceof Cx

    type AB = A & B
    type AC = A & C
    type BC = B & C

    function isAB(x: any): x is AB {
        return true;
    }
    function isBC(x: any): x is BC {
        return true;
    }
    function isAC(x: any): x is AC {
        return true;
    }

    declare const x: A | B | C;
    if (isAB(x)) {
        x; // ABC
        if (isBC(x)) {
            x; // ABC
            if (isAC(x)) {
                x; // ABC
            }
        }
    }

}

//// [instanceQuery-0014.js]
"use strict";
var iq0014a;
(function (iq0014a) {
    class EmptyBase {
    }
    class A {
        a = 0;
    }
    function extendsEmptyBase(x) {
        // no problem/error here
        return true;
    }
    if (extendsEmptyBase(a)) {
        a;
    }
    else {
        a;
    }
})(iq0014a || (iq0014a = {}));
var iq0014b;
(function (iq0014b) {
    class EmptyBase {
    }
    function f(t) {
        const x = 0;
        t = x;
    }
})(iq0014b || (iq0014b = {}));
var iq0014c;
(function (iq0014c) {
    class EmptyBase {
    }
    class A {
        a = 0;
    }
    function extendsEmptyBaseInstance(x) {
        return x instanceof EmptyBase;
    }
    if (extendsEmptyBaseInstance(a)) {
        a;
    }
    else {
        a;
    }
})(iq0014c || (iq0014c = {}));
(function (iq0014c) {
    class EmptyBase {
    }
    class A extends EmptyBase {
        a = 0;
    }
    function extendsAInstance(x) {
        return x instanceof A;
    }
    if (extendsAInstance(a)) {
        a;
    }
    else {
        a;
    }
})(iq0014c || (iq0014c = {}));
var iq0014d;
(function (iq0014d) {
    class EmptyBase {
    }
    class A extends EmptyBase {
        a = 0;
    }
    class B {
        a = 0;
    } // does not extend EmptyBase
    function extendsEmptyBaseInstance(x) {
        return x instanceof EmptyBase;
    }
    function extendsAInstance(x) {
        return x instanceof A;
    }
    function extendsBInstance(x) {
        return x instanceof B;
    }
    if (extendsEmptyBaseInstance(a)) {
        a; // ((instanceof EmptyBase & EmptyBase)) | ((instanceof EmptyBase & A)))
        if (extendsAInstance(a)) {
            a; // (instanceof A & (A & EmptyBase))
        }
        else {
            a;
        }
        if (extendsBInstance(a)) {
            a; // never
        }
        else {
            a;
        }
    }
    else {
        a;
    }
})(iq0014d || (iq0014d = {}));
var iq0014e;
(function (iq0014e) {
    class EmptyBase {
    }
    class A extends EmptyBase {
        a = 0;
    }
    class B {
        a = 0;
    } // does not extend EmptyBase
    function extendsEmptyBaseInstance(x) {
        return x instanceof EmptyBase;
    }
    function extendsAInstance(x) {
        return x instanceof A;
    }
    function extendsBInstance(x) {
        return x instanceof B;
    }
    if (extendsEmptyBaseInstance(a)) {
        a; // ((instanceof EmptyBase & EmptyBase)) | ((instanceof EmptyBase & A)))
        if (extendsAInstance(a)) {
            a; // (instanceof A & (A & EmptyBase))
        }
        else {
            a;
        }
        if (extendsBInstance(a)) {
            a; // never
        }
        else {
            a;
        }
    }
    else {
        a;
    }
})(iq0014e || (iq0014e = {}));
var iq0014f;
(function (iq0014f) {
    function isAB(x) {
        return true;
    }
    function isBC(x) {
        return true;
    }
    function isAC(x) {
        return true;
    }
    if (isAB(x)) {
        x; // ABC
        if (isBC(x)) {
            x; // ABC
            if (isAC(x)) {
                x; // ABC
            }
        }
    }
})(iq0014f || (iq0014f = {}));
var iq0014g;
(function (iq0014g) {
    function isAB(x) {
        return true;
    }
    function isBC(x) {
        return true;
    }
    function isAC(x) {
        return true;
    }
    if (isAB(x)) {
        x; // ABC
        if (isBC(x)) {
            x; // ABC
            if (isAC(x)) {
                x; // ABC
            }
        }
    }
})(iq0014g || (iq0014g = {}));


//// [instanceQuery-0014.d.ts]
declare namespace iq0014a {
}
declare namespace iq0014b {
}
declare namespace iq0014c {
}
declare namespace iq0014c {
}
declare namespace iq0014d {
}
declare namespace iq0014e {
}
declare namespace iq0014f {
}
declare namespace iq0014g {
}
