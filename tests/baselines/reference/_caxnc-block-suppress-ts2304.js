//// [tests/cases/conformance/_caxnc-block/_caxnc-block-suppress-ts2304.ts] ////

//// [_caxnc-block-suppress-ts2304.ts]
//

function f(a: number): void {
    {
        let b: number
        b = a;
        {
            let c: number
            c = b;
        }
    }
}

//// [_caxnc-block-suppress-ts2304.js]
//
function f(a) {
    {
        var b = void 0;
        b = a;
        {
            var c = void 0;
            c = b;
        }
    }
}
