// @mrNarrowEnable: true
// @mrNarrowConstraintsEnable: false
// @strict: true
// @declaration: true
// @enableTSDevExpectString: true




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