// @strict: true
// @target: esnext

namespace instanceQuery21f {

    class InstanceofA extends (Object as any as { new(): instanceof Object } ){
        a: number
        constructor() {
            super();
            this satisfies instanceof Object;
            this.a = 1;
        }
    };
}

