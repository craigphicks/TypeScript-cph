//// [tests/cases/conformance/-instanceQuery/instanceQuery-0013.ts] ////

//// [instanceQuery-0013.ts]
namespace iq0013z {
    declare const WrongInstanceofOpenrand: {};
    declare const asWrong : instanceof WrongInstanceofOpenrand; // error
}

namespace iq0013a {
    class EmptyBase {}
    class A1<T extends string|number>  extends EmptyBase{
        a: T;
        constructor(a: T) {
            super();
            this.a = a;
        }
    }
    const ANumVar = A1<number>;
    const AStrVar = A1<string>;

    declare const an: instanceof ANumVar;
    declare const as: instanceof AStrVar;


    an satisfies EmptyBase; // no error
    an satisfies instanceof A1; // no error
    an satisfies instanceof A1<number>; // no error
    an satisfies instanceof ANumVar; // no error

    as satisfies EmptyBase; // no error
    as satisfies instanceof A1; // no error
    as satisfies instanceof A1<number>; // error
    as satisfies instanceof ANumVar; // error

}

namespace iq0013b {
    class EmptyBase {}
    class A1<T extends string|number>  extends EmptyBase{
        a: T;
        constructor(a: T) {
            super();
            this.a = a;
        }
    }
    const ANumVar = A1<number>;
    const AStrVar = A1<string>;

    declare const an: instanceof A1<number>;
    declare const as: instanceof A1<string>;

    // const an = new ANumVar(1) as instanceof ANumVar;
    // const as = new ANumStr("one") as instanceof ANumStr;

    an satisfies EmptyBase; // no error
    an satisfies instanceof A1; // no error
    an satisfies instanceof A1<number>; // no error
    an satisfies instanceof ANumVar; // no error

    as satisfies EmptyBase; // no error
    as satisfies instanceof A1; // no error
    as satisfies instanceof A1<number>; // error
    as satisfies instanceof ANumVar; // error

}

namespace iq0013c {
    class EmptyBase {}
    class A1<T extends string|number>  extends EmptyBase{
        a: T;
        constructor(a: T) {
            super();
            this.a = a;
        }
    }
    const ANumVar = A1<number>;
    const AStrVar = A1<string>;

    const an = new A1<number>(1) as instanceof A1<number>;
    const as = new A1<string>("one") as instanceof A1<string>;

    an satisfies EmptyBase; // no error
    an satisfies instanceof A1; // no error
    an satisfies instanceof A1<number>; // no error
    an satisfies instanceof ANumVar; // no error

    as satisfies EmptyBase; // no error
    as satisfies instanceof A1; // no error
    as satisfies instanceof A1<number>; // error
    as satisfies instanceof ANumVar; // error

}

//// [instanceQuery-0013.js]
"use strict";
var iq0013z;
(function (iq0013z) {
})(iq0013z || (iq0013z = {}));
var iq0013a;
(function (iq0013a) {
    class EmptyBase {
    }
    class A1 extends EmptyBase {
        a;
        constructor(a) {
            super();
            this.a = a;
        }
    }
    const ANumVar = (A1);
    const AStrVar = (A1);
    an; // no error
    an; // no error
    an; // no error
    an; // no error
    as; // no error
    as; // no error
    as; // error
    as; // error
})(iq0013a || (iq0013a = {}));
var iq0013b;
(function (iq0013b) {
    class EmptyBase {
    }
    class A1 extends EmptyBase {
        a;
        constructor(a) {
            super();
            this.a = a;
        }
    }
    const ANumVar = (A1);
    const AStrVar = (A1);
    // const an = new ANumVar(1) as instanceof ANumVar;
    // const as = new ANumStr("one") as instanceof ANumStr;
    an; // no error
    an; // no error
    an; // no error
    an; // no error
    as; // no error
    as; // no error
    as; // error
    as; // error
})(iq0013b || (iq0013b = {}));
var iq0013c;
(function (iq0013c) {
    class EmptyBase {
    }
    class A1 extends EmptyBase {
        a;
        constructor(a) {
            super();
            this.a = a;
        }
    }
    const ANumVar = (A1);
    const AStrVar = (A1);
    const an = new A1(1);
    const as = new A1("one");
    an; // no error
    an; // no error
    an; // no error
    an; // no error
    as; // no error
    as; // no error
    as; // error
    as; // error
})(iq0013c || (iq0013c = {}));


//// [instanceQuery-0013.d.ts]
declare namespace iq0013z {
}
declare namespace iq0013a {
}
declare namespace iq0013b {
}
declare namespace iq0013c {
}
