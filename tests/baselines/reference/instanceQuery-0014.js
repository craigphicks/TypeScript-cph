//// [tests/cases/conformance/-instanceQuery/instanceQuery-0014.ts] ////

//// [instanceQuery-0014.ts]
// namespace iq0014a {
//     class EmptyBase {}
//     class A { a = 0; }
//     function extendsEmptyBase<T extends EmptyBase>(x: T): x is (EmptyBase & T) {
//         // no problem/error here
//         return true;
//     }
//     declare const a: A | EmptyBase | {};
//     if (extendsEmptyBase(a)) {
//         a;
//     }
//     else {
//         a;
//     }
// }

// namespace iq0014b {
//     class EmptyBase {}
//     function f<T extends EmptyBase>(t: T): void {
//         const x = (0 as any as (instanceof EmptyBase) & T);
//         t = x;
//     }
// }

// namespace iq0014c {
//     class EmptyBase {}
//     class A { a = 0; }
//     function extendsEmptyBaseInstance<T extends Object>(x: T): x is ((instanceof EmptyBase) & T) {
//         return x instanceof EmptyBase;
//     }
//     declare const a: A | EmptyBase | {};
//     if (extendsEmptyBaseInstance(a)) {
//         a;
//     }
//     else {
//         a;
//     }
// }

// namespace iq0014c {
//     class EmptyBase {}
//     class A extends EmptyBase{ a = 0; }

//     function extendsAInstance<T extends Object>(x: T): x is (instanceof A) & T {
//         return x instanceof A;
//     }
//     declare const a: instanceof EmptyBase ; //| (instanceof EmptyBase & A);
//     if (extendsAInstance(a)) {
//         a;
//     }
//     else {
//         a;
//     }
// }


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



//// [instanceQuery-0014.js]
"use strict";
// namespace iq0014a {
//     class EmptyBase {}
//     class A { a = 0; }
//     function extendsEmptyBase<T extends EmptyBase>(x: T): x is (EmptyBase & T) {
//         // no problem/error here
//         return true;
//     }
//     declare const a: A | EmptyBase | {};
//     if (extendsEmptyBase(a)) {
//         a;
//     }
//     else {
//         a;
//     }
// }
// namespace iq0014b {
//     class EmptyBase {}
//     function f<T extends EmptyBase>(t: T): void {
//         const x = (0 as any as (instanceof EmptyBase) & T);
//         t = x;
//     }
// }
// namespace iq0014c {
//     class EmptyBase {}
//     class A { a = 0; }
//     function extendsEmptyBaseInstance<T extends Object>(x: T): x is ((instanceof EmptyBase) & T) {
//         return x instanceof EmptyBase;
//     }
//     declare const a: A | EmptyBase | {};
//     if (extendsEmptyBaseInstance(a)) {
//         a;
//     }
//     else {
//         a;
//     }
// }
// namespace iq0014c {
//     class EmptyBase {}
//     class A extends EmptyBase{ a = 0; }
//     function extendsAInstance<T extends Object>(x: T): x is (instanceof A) & T {
//         return x instanceof A;
//     }
//     declare const a: instanceof EmptyBase ; //| (instanceof EmptyBase & A);
//     if (extendsAInstance(a)) {
//         a;
//     }
//     else {
//         a;
//     }
// }
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


//// [instanceQuery-0014.d.ts]
declare namespace iq0014d {
}
declare namespace iq0014e {
}
