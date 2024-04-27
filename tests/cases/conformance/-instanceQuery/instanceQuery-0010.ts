// @strict: true
// @target: esnext
// @declaration: true
// @instanceQueryEnableFromNew: true

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

    declare const x: instanceof A & instanceof B;

    x satisfies EmptyBase; // no error

    declare const y: EmptyBase;

    y satisfies instanceof A & instanceof B; // should error
}