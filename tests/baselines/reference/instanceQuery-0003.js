//// [tests/cases/conformance/-instanceQuery/instanceQuery-0003.ts] ////

//// [instanceQuery-0003.ts]
namespace insto0003 {
    class C<T> {
      foo(x: T) { }
    }
    var x = new C<any>(); // Quick Info for x is C<any>
    var y = C.prototype; // Originally C<{}>, but with the new instanceQueryEnableFromNew flag, it is C<any> (no problem)
}




//// [instanceQuery-0003.js]
"use strict";
var insto0003;
(function (insto0003) {
    var C = /** @class */ (function () {
        function C() {
        }
        C.prototype.foo = function (x) { };
        return C;
    }());
    var x = new C(); // Quick Info for x is C<any>
    var y = C.prototype; // Originally C<{}>, but with the new instanceQueryEnableFromNew flag, it is C<any> (no problem)
})(insto0003 || (insto0003 = {}));


//// [instanceQuery-0003.d.ts]
declare namespace insto0003 {
}
