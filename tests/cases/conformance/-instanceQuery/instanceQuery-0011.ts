// @strict: true
// @target: esnext
// @declaration: true
// @instanceQueryEnableFromNew: true

namespace iq0011b {
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
    type AQ = instanceof A1 & instanceof A2;
    declare let a1: instanceof A1;
    declare let a2: instanceof A2;
    declare let a3: instanceof A3;
    declare let b3: instanceof B3;

    a1 satisfies AQ; // error (because (typeof A1).constructor < (typeof A2).constructor)
    a2 satisfies AQ; // no error
    a3 satisfies AQ; // no error
    b3 satisfies AQ; // no error

    type ANope = instanceof A3 & instanceof B3;
    a3 satisfies ANope; // error
    b3 satisfies ANope; // error


    class AP  extends A2 {
        a: 1 = 1;
    };

    new AP() as instanceof AP satisfies AQ; // no error

    declare const aq: AQ;
    aq satisfies AP; // structure error

    declare const ap: instanceof AP;
    ap satisfies AQ; // no error

}