
// namespace instanceQuery22x {

//     class A {
//         a = 2;
//     }
//     class B extends A { // treated as though could be `extends A, C`
//         b = 3;
//     }
//     // class C extends A { // treated as though could be `extends A, B`
//     //     c = 4 ;
//     // }

//     declare const b : B;

//     declare const aandb : A & B;

//     const x = Math.random() < 0.5 ? b : aandb; //  ((instanceof A & A)) | ((instanceof B & B))

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

    function isInstanceofA<T>(x: T): x is A & T{
        return x instanceof A;
    }
    function isInstanceofB<T>(x: T): x is B & T{
        return x instanceof B;
    }
    function isInstanceofC<T>(x: T): x is C & T{
        return x instanceof C;
    }

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