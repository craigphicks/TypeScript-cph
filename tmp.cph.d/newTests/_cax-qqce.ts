// @strict: true
// @strictNullChecks: true
// @declaration: true

// This reacreates the bug discovered when trying to compile corePublic.ts

// declare const n:number|string|undefined;
// declare const b:boolean;
declare function fn():number|undefined;
declare function fb():boolean;
declare const foo: undefined | { fb: typeof fb };

//const x = n ?? b;  // number | boolean
// const y = fn() ?? fb();
const z = fn() ?? foo?.fb();  // IS: number | boolean | undefined , SHOULD BE: number | boolean

// The flow nodes look like 

// ~~~~~~
// id: 1, FID: 1, NID: 1, TID: 1, flags: Assignment
// z = fn() ?? foo?.fb() [343,365], (343,365), VariableDeclaration
// antecedent:
//  -~~~~~~
//  -id: 2, FID: 2, flags: BranchLabel|Label|Referenced
//  -antecedents:[4]
//  - -~~~~~~
//  - -id: 3, FID: 3, flags: Referenced|Shared|Join
//  - -joinNode: z = fn() ?? foo?.fb() [343,365]
//  - -antecedent:
//  - - -~~~~~~
//  - - -id: 4, FID: 4, flags: Start|Referenced
//  - -~~~~~~
//  - -id: 5, FID: 5, NID: 2, TID: 2, flags: FalseCondition|Condition|Referenced
//  - -foo [355,359], (355,359), Identifier
//  - -antecedent:
//  - - -~~~~~~
//  - - -id: 3, FID: 3, flags: Referenced|Shared|Join, RECURSIVE REFERENCE!!!
//  - -~~~~~~
//  - -id: 6, FID: 6, NID: 3, TID: 3, flags: TrueCondition|Condition|Referenced
//  - -foo?.fb() [355,365], (355,365), CallExpression
//  - -antecedent:
//  - - -~~~~~~
//  - - -id: 7, FID: 7, NID: 2, TID: 2, flags: TrueCondition|Condition|Referenced|Shared
//  - - -foo [355,359], (355,359), Identifier
//  - - -antecedent:
//  - - - -~~~~~~
//  - - - -id: 3, FID: 3, flags: Referenced|Shared|Join, RECURSIVE REFERENCE!!!
//  - -~~~~~~
//  - -id: 8, FID: 8, NID: 3, TID: 3, flags: FalseCondition|Condition|Referenced
//  - -foo?.fb() [355,365], (355,365), CallExpression
//  - -antecedent:
//  - - -~~~~~~
//  - - -id: 7, FID: 7, NID: 2, TID: 2, flags: TrueCondition|Condition|Referenced|Shared, RECURSIVE REFERENCE!!!
//  - - -foo [355,359], (355,359), Identifier

// # of FlowNodes:8
// # of unique Nodes referenced:3
