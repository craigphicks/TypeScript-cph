// @strict: true
// @target: esnext

namespace iq0014b {
    class EmptyBase {}
    function f<T extends EmptyBase>(t: T): void {
        const x = (0 as any as (instanceof EmptyBase) & T);
        t = x;
    }
}
