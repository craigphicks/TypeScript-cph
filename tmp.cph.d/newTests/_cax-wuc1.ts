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
//declare type P = RP | BP | readonly string[];
//declare const program: RP | BP | readonly string[] | undefined;
declare function isBP(p: BP|RP): p is BP;
declare function isArray(x: any): x is readonly any[];
declare function find<T>(t:readonly T[], f:(t: T)=>boolean ): T | undefined;


function foo({program}:{program:RP | BP | readonly string[] | undefined}){

    if (!program) return false;
    //const filePathWithoutExtension = removeFileExtension(fileOrDirectoryPath);
    const realProgram = isArray(program) ? undefined : isBP(program) ? program.getProgramOrUndefined() : program;
    const builderProgram = !realProgram && !isArray(program) ? program as BP : undefined;
    // program;
    // if (!realProgram) program;
    // if (!builderProgram) program;
    // if (!realProgram && !builderProgram) program;
    //if (!program) return false;
    if (hasSourceFile("foo")){
        return true;
    }

    function hasSourceFile(file: string): boolean {
        // program;
        // if (!realProgram) program;
        // if (!builderProgram) program;
        // if (!realProgram && !builderProgram) program;
        return realProgram ?
            !!realProgram.find(file) :
            builderProgram ?
                !!builderProgram.find(file) :
                !!find(program as readonly string[], f => f === file);
    }

}