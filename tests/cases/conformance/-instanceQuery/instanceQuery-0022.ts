// @strict: true
// @target: esnext

namespace instanceQuery22a {

    class A {
        a = 2;
    }
    class B extends A { // treated as though could be `extends A, C`
        b = 3;
    }
    class C extends A { // treated as though could be `extends A, B`
        c = 4 ;
    }
    type IsNeverType<T> = [T] extends [never] ? true : false;

    const q = Math.random();
    const x = q < 0.33 ? new A() : q < 0.66 ? new B() : new C();
    if (x instanceof A) {
        if (x instanceof B) {
            x; // B
            console.log("B" + x.b);
            if (x instanceof C) {
                true satisfies IsNeverType<typeof x>; // will fail
                x; // B & C (runtime impossible)
            }
        }
    }

}


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
// function isInstanceOf<I extends Object, CTor extends { new(): I }>(x:any,ctor:CTor): x is I {
//     return x instanceof ctor;
// }

type IsNeverType<T> = [T] extends [never] ? true : false;

const q = Math.random();
const x = q < 0.33 ? new A() : q < 0.66 ? new B() : new C(); //  ((instanceof A & A)) | ((instanceof B & B)) | ((instanceof C & C))
if (isInstanceofA(x)) {
    x; // ((instanceof A & A))
    if (isInstanceofB(x)) {
        x; // (instanceof B & B)
        if (isInstanceofC(x)) {
            true satisfies IsNeverType<typeof x>;
        }
    }
}


}



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

    function isInstanceofA<T>(x: T): x is A & T{
        return x instanceof A;
    }
    function isInstanceofB<T>(x: T): x is B & T{
        return x instanceof B;
    }
    function isInstanceofC<T>(x: T): x is C & T{
        return x instanceof C;
    }
    // function isInstanceOf<I extends Object, CTor extends { new(): I }>(x:any,ctor:CTor): x is I {
    //     return x instanceof ctor;
    // }

    type IsNeverType<T> = [T] extends [never] ? true : false;

    const q = Math.random();
    const x = q < 0.33 ? new A() : q < 0.66 ? new B() : new C(); //  ((instanceof A & A)) | ((instanceof B & B)) | ((instanceof C & C))
    if (isInstanceofA(x)) {
        x; // ((instanceof A & A))
        if (isInstanceofB(x)) {
            x; // (instanceof B & B)
            if (isInstanceofC(x)) {
                true satisfies IsNeverType<typeof x>;
            }
        }
    }


    }