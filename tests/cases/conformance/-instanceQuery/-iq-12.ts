// @strict: true
// @target: esnext

// namespace instanceQuery22a {

//     class A {
//         a = 2;
//     }
//     class B extends A { // treated as though could be `extends A, C`
//         b = 3;
//     }
//     class C extends A { // treated as though could be `extends A, B`
//         c = 4 ;
//     }
//     //declare const x: A | B | C;
//     const q = Math.random();
//     const x = q < 0.33 ? new A() : q < 0.66 ? new B() : new C();
//     if (x instanceof A) {
//         x satisfies A;
//         if (x instanceof B) {
//             x; // B
//             x satisfies A;
//             x satisfies B;
//             console.log("B" + x.b);
//             if (x instanceof C) {
//                 x; // B & C (runtime impossible)
//                 x satisfies A;
//                 x satisfies B;
//                 x satisfies C;
//             }
//         }
//     }

// }


namespace instanceQuery22b {

const InstanceofObject = Object as any as { new(): instanceof Object }

class A extends InstanceofObject {
    a = 2;
}
class B extends A { // treated as though could be `extends A, C`
    b = 3;
}
class C extends A { // treated as though could be `extends A, B`
    c = 4 ;
}

function isInstanceofA(x: any): x is A {
    return x instanceof A;
}
function isInstanceofB(x: any): x is B {
    return x instanceof B;
}
function isInstanceofC(x: any): x is C {
    return x instanceof C;
}

const q = Math.random();
const x = q < 0.33 ? new A() : q < 0.66 ? new B() : new C();
// x satisfies A;
// if (isInstanceofA(x)) {
//     x satisfies A;
//     if (isInstanceofB(x)) {
//         x; // B
//         x satisfies A;
//         x satisfies B;
//         console.log("B" + x.b);
//         if (isInstanceofC(x)) {
//             x; // B & C (runtime impossible)
//             x satisfies A;
//             x satisfies B;
//             x satisfies C;
//         }
//     }
// }


}