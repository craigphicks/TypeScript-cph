//// [tests/cases/conformance/-instanceQuery/instanceQuery-0010.ts] ////

//// [instanceQuery-0010.ts]
namespace iq0010 {

    class EmptyBase {}

    class APre  extends EmptyBase{
    }
    class A  extends APre {
        a: number = 0;
    }

    class BPre  extends EmptyBase{
    }
    class B extends BPre {
        b: number = 0;
    }

    declare const x: instanceof A & instanceof B; // should be never

    x satisfies EmptyBase; // no error, (never satisfies EmptyBase does not trigger an error)

    declare const y: EmptyBase;

    y satisfies instanceof A & instanceof B; // should error (EmptyBase does not satisfy never)
}

//// [instanceQuery-0010.js]
"use strict";
var iq0010;
(function (iq0010) {
    class EmptyBase {
    }
    class APre extends EmptyBase {
    }
    class A extends APre {
        a = 0;
    }
    class BPre extends EmptyBase {
    }
    class B extends BPre {
        b = 0;
    }
    x; // no error, (never satisfies EmptyBase does not trigger an error)
    y; // should error (EmptyBase does not satisfy never)
})(iq0010 || (iq0010 = {}));


//// [instanceQuery-0010.d.ts]
declare namespace iq0010 {
}
