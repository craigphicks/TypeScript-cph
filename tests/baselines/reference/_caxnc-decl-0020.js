//// [_caxnc-decl-0020.ts]
function decl0020(){
    type X = 0|1|2;

    // the Type assigned to symbolFlowInfo.effectiveDeclaredTsType has a member "aliasSymbol" with name "X",
    // as well as a member "types" containting the 3 literal types.  "checker.typeToString" prints "X".
    // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: X"
    let x: X = 0;
    x;

}

//// [_caxnc-decl-0020.js]
"use strict";
function decl0020() {
    // the Type assigned to symbolFlowInfo.effectiveDeclaredTsType has a member "aliasSymbol" with name "X",
    // as well as a member "types" containting the 3 literal types.  "checker.typeToString" prints "X".
    // @ts-dev-expect-string "count: 0, effectiveDeclaredTsType: X"
    var x = 0;
    x;
}


//// [_caxnc-decl-0020.d.ts]
declare function decl0020(): void;
