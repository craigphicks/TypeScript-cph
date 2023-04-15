//// [_caxnc-decl-0121.ts]
function decl0021(){
    enum X {
        zero=0,
        one=1,
        two="2",
    };

    // the Type assigned to symbolFlowInfo.effectiveDeclaredTsType has a member "aliasSymbol" with name "X",
    // as well as a member "types" containting the 3 literal types.  "checker.typeToString" prints "X".
    // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: X"
    let x: X = X.two;
    x;

}

//// [_caxnc-decl-0121.js]
"use strict";
function decl0021() {
    var X;
    (function (X) {
        X[X["zero"] = 0] = "zero";
        X[X["one"] = 1] = "one";
        X["two"] = "2";
    })(X || (X = {}));
    ;
    // the Type assigned to symbolFlowInfo.effectiveDeclaredTsType has a member "aliasSymbol" with name "X",
    // as well as a member "types" containting the 3 literal types.  "checker.typeToString" prints "X".
    // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: X"
    var x = X.two;
    x;
}


//// [_caxnc-decl-0121.d.ts]
declare function decl0021(): void;
