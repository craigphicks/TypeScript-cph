//// [tests/cases/conformance/-instanceQuery/instanceQuery-0021.ts] ////

//// [instanceQuery-0021.ts]
/**
 * instanceQuery types cannot be automatically generated for every `new XXX()`
 * because that would break back compatibility with existing code.
 * However, any class inherting from the constructor value `Object` cast as type `{ new(): instanceof Object }`
 * will automatically generate instanceQuery types.
 * That is the workaround to avoid casting every desired `new XXX()` to `new XXX() as instsanceof XXX`
 */

namespace instanceQuery21a {

declare class InstanceofA extends (Object as any as { new(): instanceof Object } ){ a: number };
const x = new InstanceofA();
x satisfies instanceof Object; // OK
x satisfies InstanceofA; // OK

}

namespace instanceQuery21b {

const InstanceofObject = Object as any as { new(): instanceof Object }; // the only cast required to generate instanceQuery constructors
class InstanceofA extends InstanceofObject {
    constructor(){
        super();
    }
};
const x = new InstanceofA();
x satisfies instanceof Object; // OK
x satisfies InstanceofA; // OK


}

namespace instanceQuery21b_2 {

    const InstanceofObject = Object as any as { new(): instanceof Object }; // the only cast required to generate instanceQuery constructors
    class InstanceofA extends InstanceofObject {
        a: any;
        constructor(){
            super();
        }
    };
    const x = new InstanceofA();
    x satisfies instanceof Object; // OK
    x satisfies InstanceofA; // OK

}

namespace instanceQuery21b_3 {

    const InstanceofObject = Object as any as { new(): instanceof Object }; // the only cast required to generate instanceQuery constructors
    class InstanceofA extends InstanceofObject {
        a: number;
        constructor(){
            super();
            this.a=1;
        }
    };
    const x = new InstanceofA();
    x satisfies instanceof Object; // OK
    x satisfies InstanceofA; // OK

}

namespace instanceQuery21c {

    const InstanceofObject = Object as any as { new(): instanceof Object }; // the only cast required to generate instanceQuery constructors
    class InstanceofA extends InstanceofObject {
        // default constructor OK
        // constructor(){
        //     super();
        // }
    };
    const x = new InstanceofA();
    x satisfies instanceof Object; // OK
    x satisfies InstanceofA; // OK


}

namespace instanceQuery21d {

    declare const InstanceofObject: { new(): instanceof Object }; // the only cast required to generate instanceQuery constructors
    declare class InstanceofA extends InstanceofObject {};
    const x = new InstanceofA();
    x satisfies instanceof Object; // OK
    x satisfies InstanceofA; // OK

}



//// [instanceQuery-0021.js]
"use strict";
/**
 * instanceQuery types cannot be automatically generated for every `new XXX()`
 * because that would break back compatibility with existing code.
 * However, any class inherting from the constructor value `Object` cast as type `{ new(): instanceof Object }`
 * will automatically generate instanceQuery types.
 * That is the workaround to avoid casting every desired `new XXX()` to `new XXX() as instsanceof XXX`
 */
var instanceQuery21a;
(function (instanceQuery21a) {
    ;
    const x = new InstanceofA();
    x; // OK
    x; // OK
})(instanceQuery21a || (instanceQuery21a = {}));
var instanceQuery21b;
(function (instanceQuery21b) {
    const InstanceofObject = Object; // the only cast required to generate instanceQuery constructors
    class InstanceofA extends InstanceofObject {
        constructor() {
            super();
        }
    }
    ;
    const x = new InstanceofA();
    x; // OK
    x; // OK
})(instanceQuery21b || (instanceQuery21b = {}));
var instanceQuery21b_2;
(function (instanceQuery21b_2) {
    const InstanceofObject = Object; // the only cast required to generate instanceQuery constructors
    class InstanceofA extends InstanceofObject {
        a;
        constructor() {
            super();
        }
    }
    ;
    const x = new InstanceofA();
    x; // OK
    x; // OK
})(instanceQuery21b_2 || (instanceQuery21b_2 = {}));
var instanceQuery21b_3;
(function (instanceQuery21b_3) {
    const InstanceofObject = Object; // the only cast required to generate instanceQuery constructors
    class InstanceofA extends InstanceofObject {
        a;
        constructor() {
            super();
            this.a = 1;
        }
    }
    ;
    const x = new InstanceofA();
    x; // OK
    x; // OK
})(instanceQuery21b_3 || (instanceQuery21b_3 = {}));
var instanceQuery21c;
(function (instanceQuery21c) {
    const InstanceofObject = Object; // the only cast required to generate instanceQuery constructors
    class InstanceofA extends InstanceofObject {
    }
    ;
    const x = new InstanceofA();
    x; // OK
    x; // OK
})(instanceQuery21c || (instanceQuery21c = {}));
var instanceQuery21d;
(function (instanceQuery21d) {
    ;
    const x = new InstanceofA();
    x; // OK
    x; // OK
})(instanceQuery21d || (instanceQuery21d = {}));
