// @strict: true
// @instanceQueryEnableFromNew: true
// @target: es5
// @declaration: true

namespace insto0003 {
    class C<T> {
      foo(x: T) { }
    }
    var x = new C<any>(); // Quick Info for x is C<any>
    var y = C.prototype; // Originally C<{}>, but with the new instanceQueryEnableFromNew flag, it is C<any> (no problem)
}


