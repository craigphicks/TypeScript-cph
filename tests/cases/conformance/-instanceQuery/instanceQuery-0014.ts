// @strict: true
// @target: esnext
// @declaration: true

namespace iq0014a {
    class EmptyBase {}
    class A { a = 0; }
    function extendsEmptyBase<T extends EmptyBase>(x: T): x is (EmptyBase & T) {
        // no problem/error here
        return true;
    }
    declare const a: A | EmptyBase | {};
    if (extendsEmptyBase(a)) {
        a;
    }
    else {
        a;
    }
}

namespace iq0014b {
    class EmptyBase {}
    function f<T extends EmptyBase>(t: T): void {
        const x = (0 as any as (instanceof EmptyBase) & T);
        t = x;
    }
}

namespace iq0014c1 {
    class EmptyBase {}
    class A { a = 0; }
    function extendsEmptyBaseInstance<T extends Object>(x: T): x is ((instanceof EmptyBase) & T) {
        return x instanceof EmptyBase;
    }
    declare const a: A | EmptyBase | {};
    if (extendsEmptyBaseInstance(a)) {
        a;
    }
    else {
        a;
    }
}

namespace iq0014c2 {
    class EmptyBase {}
    class A extends EmptyBase{ a = 0; }

    function extendsAInstance<T extends Object>(x: T): x is (instanceof A) & T {
        return x instanceof A;
    }
    declare const a: instanceof EmptyBase ; //| (instanceof EmptyBase & A);
    if (extendsAInstance(a)) {
        a;
    }
    else {
        a;
    }
}


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

namespace iq0014f {
    declare class Ax { a: number }
    declare class Bx extends Ax { b: number }
    declare class Cx extends Bx { c: number }

    type A = Ax
    type B = Bx
    type C = Cx

    type AB = A & B
    type AC = A & C
    type BC = B & C

    function isAB(x: any): x is AB {
        return true;
    }
    function isBC(x: any): x is BC {
        return true;
    }
    function isAC(x: any): x is AC {
        return true;
    }

    declare const x: A | B | C;
    if (isAB(x)) {
        x; // ABC
        if (isBC(x)) {
            x; // ABC
            if (isAC(x)) {
                x; // ABC
            }
        }
    }


}


namespace iq0014g {

    declare class Ax { a: number }
    declare class Bx extends Ax { b: number }
    declare class Cx extends Bx { c: number }

    type A = instanceof Ax
    type B = instanceof Bx
    type C = instanceof Cx

    type AB = A & B
    type AC = A & C
    type BC = B & C

    function isAB(x: any): x is AB {
        return true;
    }
    function isBC(x: any): x is BC {
        return true;
    }
    function isAC(x: any): x is AC {
        return true;
    }

    declare const x: A | B | C;
    if (isAB(x)) {
        x; // ABC
        if (isBC(x)) {
            x; // ABC
            if (isAC(x)) {
                x; // ABC
            }
        }
    }

}