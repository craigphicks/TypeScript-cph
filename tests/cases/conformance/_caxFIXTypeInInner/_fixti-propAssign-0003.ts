// @floughEnable: true
// @floughConstraintsEnable: false
// @strict: true
// @declaration: true

function propAssign0003_1(): any {
    // Unlike propAssign-0002, the definition of T2 is inside the same function as t.  This causes the .types file to show {} instead of T2. :(
    // That happens even though the log file shows "In getIdentifier(), getFlowTypeOfReference returned T2".
    // The timing of the .types file generation is different from the log file generation.
    // This same problem happens when using non-flough (original flow) as well, so it might not be a flough bug.
    type T2 = { };
    let t: T2 = { };
    t;
    t;
}
