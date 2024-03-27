//// [tests/cases/conformance/_caxnc-block/_caxnc-block-0020.ts] ////

//// [_caxnc-block-0020.ts]
//

function f(a: number): void {
    {
        let b: number | string
        b = a;
        {
            let c: number
            c = b;
            b = "hello";
        }
        b;
    }
    a;
}

//// [_caxnc-block-0020.js]
//
function f(a) {
    {
        var b = void 0;
        b = a;
        {
            var c = void 0;
            c = b;
            b = "hello";
        }
        b;
    }
    a;
}
