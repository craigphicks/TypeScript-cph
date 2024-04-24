// @strict: true
// @target: es2015

namespace iq0000A {

    declare class A {
        x: number;
        constructor(x: number);
    }

    // The constructor as a variable.
    A; // displayed as "typeof A"

    type AInstanceType = InstanceType<typeof A>; // displayed as "A"
    A.prototype; // displayed as "A";
    type APrototype = (typeof A)["prototype"]; // displayed as "A"

    // When the r.h.s. of "instanceof" is not a generic class, we can write:
    type AInstanceQueryType = instanceof A; // displayed as "instanceof A & A"

    A.prototype.x; // displayed as "number" (existing TS behavior, inconsistent with "B.prototype.x : any" below )

}

namespace iq0000B {

    declare class B<T extends number | string = string> {
        x: T;
        constructor(x: T);
    }
    // When the r.h.s. of "instanceof" is the instantiation of a generic class, an error is reported:
    instanceof B<number>; // error
    // The right-hand side of an 'instanceof' expression must not be an instantiation expression.ts(2848)

    // It might not be necessary to have that error, but it is consistent with the existing TS spec.
    // The next example shows a workaround for this error.

    type BInstanceType = InstanceType<typeof B>; // displayed as "B"
    B.prototype; // displayed as "B";
    type BPrototype = (typeof B)["prototype"]; // displayed as "B"

    // When the r.h.s. of "instanceof" is not a generic class, we can write:
    type BInstanceQueryType = instanceof B; // displayed as "instanceof B & B"

    B.prototype.x; // displayed as "any" (existing TS behavior, inconsistent with "A.prototype.x : number" above)
    type BinstanceXType = BInstanceType["x"] // displayed as "string | number"

}


namespace iq0000C {

    declare class C<T extends number | string = string> {
        x: T;
        constructor(x: T);
    }

    C.prototype; // C<any>; this is correct according to the existing TS spec

    const CNumberConstructor = C<number>; // the variable CNumberConstructor should have type { c:number, constructor(c:number): C<number>, prototype: C<any> }
    type CNumberConstructor = typeof CNumberConstructor; // we can declare the type of CNumberConstructor with the same name.
    type CnumberPrototype = CNumberConstructor["prototype"]; // C<any> ; correct according to the existing TS spec

    type CNumberConstructorInstanceQueryType = instanceof CNumberConstructor; // should display as "instanceof C & C<number>"

    C.prototype.x; // displayed as "any"

}

namespace iq0000D {

    declare class D {
        x: number;
        // no explicit constructor, TS considers constructor to implicity exist
    }

    // The constructor as a variable.
    D; // displayed as "typeof D"

    type AInstanceType = InstanceType<typeof D>; // displayed as "D"
    D.prototype; // displayed as "D";
    type APrototype = (typeof D)["prototype"]; // displayed as "D"

    // When the r.h.s. of "instanceof" is not a generic class, we can write:
    type DInstanceQueryType = instanceof D; // displayed as "instanceof D & D"

}