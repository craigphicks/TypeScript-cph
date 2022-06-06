// @strict: true
// @strictNullChecks: true
// @declaration: true

// This reacreates the bug discovered when trying to compile corePublic.ts

declare function fn():number;
declare function fb():boolean;
declare const foo: undefined | { fb: typeof fb };

//const x = n ?? b;  // number | boolean
// const y = fn() ?? fb();
const z = fn() ?? foo?.fb();  // IS: number | boolean | undefined , SHOULD BE: number | boolean

// The flow nodes look like 
// ~~~~~~
// id: 1, FID: 1, NID: 1, TID: 1, flags: Assignment
// z = fn() ?? foo?.fb() [261,283], (261,283), VariableDeclaration
// antecedent:
//  -~~~~~~
//  -id: 2, FID: 2, flags: BranchLabel|Label|Referenced
//  -antecedents:[4]
//  - -~~~~~~
//  - -id: 3, FID: 3, flags: Referenced|Shared|Join
//  - -joinNode: z = fn() ?? foo?.fb() [261,283]
//  - -antecedent:
//  - - -~~~~~~
//  - - -id: 4, FID: 4, flags: Start|Referenced
//  - -~~~~~~
//  - -id: 5, FID: 5, NID: 2, TID: 2, flags: FalseCondition|Condition|Referenced
//  - -foo [273,277], (273,277), Identifier
//  - -antecedent:
//  - - -~~~~~~
//  - - -id: 3, FID: 3, flags: Referenced|Shared|Join, REPEAT REFERENCE!!!
//  - -~~~~~~
//  - -id: 6, FID: 6, NID: 3, TID: 3, flags: TrueCondition|Condition|Referenced
//  - -foo?.fb() [273,283], (273,283), CallExpression
//  - -antecedent:
//  - - -~~~~~~
//  - - -id: 7, FID: 7, NID: 2, TID: 2, flags: TrueCondition|Condition|Referenced|Shared
//  - - -foo [273,277], (273,277), Identifier
//  - - -antecedent:
//  - - - -~~~~~~
//  - - - -id: 3, FID: 3, flags: Referenced|Shared|Join, REPEAT REFERENCE!!!
//  - -~~~~~~
//  - -id: 8, FID: 8, NID: 3, TID: 3, flags: FalseCondition|Condition|Referenced
//  - -foo?.fb() [273,283], (273,283), CallExpression
//  - -antecedent:
//  - - -~~~~~~
//  - - -id: 7, FID: 7, NID: 2, TID: 2, flags: TrueCondition|Condition|Referenced|Shared, REPEAT REFERENCE!!!
//  - - -foo [273,277], (273,277), Identifier

// # of FlowNodes:8
// # of unique Nodes referenced:3
// # of unique text positions referenced:3

