// @strict: true
// @target: esnext
// @declaration: true
// @instanceQueryEnableFromNew: true

// namespace iq0012a {

//     class EmptyBase {}
//     class B1  extends EmptyBase{ a = 0; }
//     class B2  extends B1 { b = 0; }
//     declare let b1: B1;

//     b1 satisfies B2; // should be error, needs message

// }


namespace iq0012b {

    class EmptyBase {}
    class A1  extends EmptyBase{ a = 0; }
    class A2  extends A1 {}
    declare let a1: instanceof A1;
    const one = 1 as const;
    const sym = Symbol();

    a1 satisfies instanceof A2; // should be error

    ({}) satisfies instanceof EmptyBase; // should be error

    // Note: all the primitives below get promoted to object types so the primitive error message is never triggered.  Is that OK?

    one satisfies instanceof EmptyBase; // should be error

    1n satisfies instanceof EmptyBase; // should be error

    sym satisfies instanceof EmptyBase; // should be error


    ////////////////////////////////////////////////////////////////////
    // compare to rhs without instanceof -- none of these are errors, which might not be desirable.

    a1 satisfies A2; // not an error

    ({}) satisfies EmptyBase; // not an error

    one satisfies EmptyBase; // not an error

    1n satisfies EmptyBase; // not an error

    sym satisfies EmptyBase; // not an error

}