//// [tests/cases/conformance/-instanceQuery/instanceQuery-0011.ts] ////

//// [instanceQuery-0011.ts]
namespace iq0010b {
    class EmptyBase {}
    class A1  extends EmptyBase{
        a: number|string = "";
    }
    class A2  extends A1 {
        a: number = 0;
    }
    class A3  extends A2 {
        a: 0 | 1 = 0;
    }
    class B3  extends A2 {
        a: 1 | 2 = 2;
    }
    type AQ = instanceof A1 & instanceof A2 & instanceof A3 & instanceof B3;
    declare let a1: instanceof A1;
    declare let a2: instanceof A2;
    declare let a3: instanceof A3;
    declare let b3: instanceof B3;

    a1 satisfies AQ; // error (because (typeof A1).constructor < (typeof A2).constructor)
    a2 satisfies AQ; // error
    a3 satisfies AQ; // error
    b3 satisfies AQ; // error

    class AP  extends A2 {
        a: 1 = 1;
    };

    new AP() as instanceof AP satisfies AQ; // no error

    declare const aq: AQ;
    aq satisfies AP; // no error

    aq as instanceof AP satisfies AQ; // no error

}

//// [instanceQuery-0011.js]
"use strict";
var iq0010b;
(function (iq0010b) {
    class EmptyBase {
    }
    class A1 extends EmptyBase {
        a = "";
    }
    class A2 extends A1 {
        a = 0;
    }
    class A3 extends A2 {
        a = 0;
    }
    class B3 extends A2 {
        a = 2;
    }
    a1; // error (because (typeof A1).constructor < (typeof A2).constructor)
    a2; // error
    a3; // error
    b3; // error
    class AP extends A2 {
        a = 1;
    }
    ;
    new AP(); // no error
    aq; // no error
    aq; // no error
})(iq0010b || (iq0010b = {}));


//// [instanceQuery-0011.d.ts]
declare namespace iq0010b {
}
