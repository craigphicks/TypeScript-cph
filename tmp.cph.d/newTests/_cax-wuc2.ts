// @strict:true
// @declaration:true
declare class RP {
    rp:true
    find(s:string):string|undefined;
};
declare class BP {
    bp:true
    getProgramOrUndefined(): RP | undefined;
    find(s:string):string|undefined;
}; 
declare function isBP(p: BP|RP): p is BP;
declare function isArray(x: any): x is readonly any[];
declare function find<T>(t:readonly T[], f:(t: T)=>boolean ): T | undefined;
function foo({program}:{program:RP | BP | readonly string[] | undefined}){
    const realProgram = isArray(program) ? undefined : true; //isBP(program) ? program.getProgramOrUndefined() : program;
    if (!realProgram){
        //realProgram;
        program;
    }
}