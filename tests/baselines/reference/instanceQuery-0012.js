//// [tests/cases/conformance/-instanceQuery/instanceQuery-0012.ts] ////

//// [instanceQuery-0012.ts]
namespace iq0012b {

    interface A1 {}
    interface A1Constructor {
        prototype: A1;
        new(): A1;
    }
    declare const A1: A1Constructor;

    interface A2  extends A1 {}
    interface A2Constructor {
        prototype: A2;
        new(): A2;
    }
    declare const A2: A2Constructor;

    declare let a1: instanceof A1;
    declare let a2: instanceof A2;
    const one = 1 as const;
    const sym = Symbol();

    ////////////////////////////////////////////////////////////////////
    // compare to rhs without instanceof -- none of these are errors, which might not be desirable.

    a1 satisfies A2; // not an error

    ({}) satisfies A2; // not an error

    one satisfies A2; // not an error

    1n satisfies A2; // not an error

    sym satisfies A2; // not an error


    ////////////////////////////////////////////////////////////////////
    // using instanceof queries these can no be discriminated

    a1 satisfies instanceof A2; // should be error

    ({}) satisfies instanceof A2; // should be error

    one satisfies instanceof A2; // should be error

    1n satisfies instanceof A2; // should be error

    sym satisfies instanceof A2; // should be error

}

//// [instanceQuery-0012.js]
"use strict";
var iq0012b;
(function (iq0012b) {
    const one = 1;
    const sym = Symbol();
    ////////////////////////////////////////////////////////////////////
    // compare to rhs without instanceof -- none of these are errors, which might not be desirable.
    a1; // not an error
    ({}); // not an error
    one; // not an error
    1n; // not an error
    sym; // not an error
    ////////////////////////////////////////////////////////////////////
    // using instanceof queries these can no be discriminated
    a1; // should be error
    ({}); // should be error
    one; // should be error
    1n; // should be error
    sym; // should be error
})(iq0012b || (iq0012b = {}));


//// [instanceQuery-0012.d.ts]
declare namespace iq0012b {
}
