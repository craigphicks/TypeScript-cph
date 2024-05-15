// @strict: true
// @target: esnext

namespace iq0014gy {

    declare class Ax { a: number }
    declare class Bx extends Ax { b: number }
    declare class Cx extends Bx { c: number }

    type A = & instanceof Ax
    type B = & instanceof Bx
    type C = & instanceof Cx

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