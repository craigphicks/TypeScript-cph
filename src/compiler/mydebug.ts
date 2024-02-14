import { Debug, LogLevel } from "./debug";
import { SourceFile, TypeChecker, Type, Node, Symbol, Signature, Identifier, Diagnostic, DiagnosticMessageChain, TypeMapper, InferenceInfo, InferenceContext, IntraExpressionInferenceSite, TypeFlags, UnionOrIntersectionType, Ternary } from "./types";
import { getNodeId } from "./checker";
//import { castHereafter } from "./core";

export interface ILoggingHost {
    //log(level: LogLevel, message: string | (() => string)) : void;
    ilog(message: (()=>string), level?: LogLevel) : void;
    ilogGroup (message: (()=>string), level?: LogLevel): number;
    ilogGroupEnd (message?: (()=>string), level?: LogLevel, expectedIndent?: number): void;
    notifySourceFile(sourceFile: SourceFile, typeChecker: TypeChecker): void;
}

export namespace IDebug {
    /* eslint-disable prefer-const */
    export let logLevel = LogLevel.Off;
    export let assertLevel = 0;
    //export let isDebugging = false;
    //export let loggingHost: LoggingHost | undefined;
    export let loggingHost: ILoggingHost | undefined;
    export let dbgs: Dbgs = 0 as any as Dbgs;
    export let checker: TypeChecker | undefined;
    // temporary
    export function ilog(message: (()=>string), level?: LogLevel) {
        if (loggingHost) loggingHost.ilog(message, level);
    }
    export function ilogGroup(message: (()=>string), level?: LogLevel): number {
        if (loggingHost) return loggingHost.ilogGroup(message, level);
        return 0;
    }
    export function ilogGroupEnd(message?: (()=>string), level?: LogLevel, expectedIndent?: number) {
        if (loggingHost) loggingHost.ilogGroupEnd(message, level, expectedIndent);
    }
    export let suffix = "";
}

export class ILoggingClass implements ILoggingHost {
    indent: number = 0;
    oneIndent: string = '  ';
    currentSourceFn: string = '';
    currentSourceFnCount: number = 0;
    sourceToFilenameCount: Map<string, number> = new Map<string, number>();
    logFilename: string | undefined= undefined;
    logFileFd: number = 0;
    numOutLines: number = 0;
    maxNumOutLines: number = 300000;
    nodeFs: any;
    nodePath: any;
    constructor(){
        this.nodeFs = require("fs");
        this.nodePath = require("path");
    }
    log(level: LogLevel, messagef: (() => string)) {
        if (!this.logFileFd) return;
        if (level > IDebug.logLevel) return;
        if (level<0) Debug.fail("ilog: Negative log level");
        if (this.numOutLines > this.maxNumOutLines) Debug.fail(`Too many lines (${this.maxNumOutLines}) log file ` + this.logFilename);
        let message = messagef();
        const indent = this.oneIndent.repeat(this.indent);
        const msg = indent + message + '\n';
        this.nodeFs.writeSync(this.logFileFd, msg);
        this.numOutLines++;
    }
    ilog(message: (()=>string), level: LogLevel = Number.MAX_SAFE_INTEGER) {
        this.log(level, message);
    }
    ilogGroup (message: (()=>string), level: LogLevel = Number.MAX_SAFE_INTEGER) {
        this.log(level, message);
        if (level > IDebug.logLevel) return this.indent;
        return this.indent++;
    }
    ilogGroupEnd (message?: (()=>string), level: LogLevel = Number.MAX_SAFE_INTEGER, expectedIndent: number | undefined = undefined) {
        if (level <= IDebug.logLevel) this.indent--;
        if (level<0) Debug.fail("ilogGroupEnd: Negative log level");
        if (expectedIndent!==undefined && expectedIndent!==this.indent) {
            Debug.fail('Expected indent ' + expectedIndent + ' but got ' + this.indent);
        }
        if (message) {
            this.log(level, message);
        }
    }
    notifySourceFile(sourceFile: SourceFile, typeChecker: TypeChecker) {
        //if (sourceFile.originalFileName!==this.currentSourceFn){
            this.currentSourceFn = sourceFile.originalFileName;
            this.currentSourceFnCount = 0;
            //this.logFilename = this.dbgTestFilenameMatched(sourceFile);
            if (this.dbgTestFilenameMatches(sourceFile)){
                this.sourceToFilenameCount.set(this.currentSourceFn, 0);
                this.logFilename = this.dbgTestFilename(sourceFile);
                this.logFileFd = this.nodeFs.openSync(this.logFilename, 'w');
                this.numOutLines = 0;
                IDebug.checker = typeChecker;
            }
        //}
        // else {
        //     this.currentSourceFnCount++;
        //     this.logFilename = this.dbgTestFilename(sourceFile);
        //     this.logFileFd = this.nodeFs.openSync(this.logFilename, 'w');
        //     this.numOutLines = 0;
        //     //IDebug.checker = typeChecker;
        // }
    }
    private dbgTestFilenameMatches(node: SourceFile): boolean {
        const re = /^\/.src\//;
        const nameMatched = (node.path.match(re) && node.path.slice(-5)!==".d.ts");
        return !!nameMatched;
    }
    private dbgTestFilename(node: SourceFile): string | undefined {
        if (!this.sourceToFilenameCount.has(node.path)){
            this.sourceToFilenameCount.set(node.path, 0);
            this.currentSourceFnCount = 0;
        }
        else {
            this.currentSourceFnCount = this.sourceToFilenameCount.get(node.path)! + 1;
            this.sourceToFilenameCount.set(node.path, this.currentSourceFnCount);
        }
        const nameRet = this.nodePath.basename(node.path, ".ts");
        this.nodeFs.mkdirSync("tmp", {recursive: true});
        const retfn = "tmp/" + nameRet +`.#${this.currentSourceFnCount}` +`.de${IDebug.logLevel}.log${IDebug.suffix?`-${IDebug.suffix}`:""}`;
        return retfn;
    }
}

export interface Dbgs {
    dbgGetNodeText: (node: Node) => any;
    // dbgFlowToString: (flow: FlowNode | undefined, withAntecedants?: boolean) => string;
    // dbgFloughTypeToString: (flowType: FloughType) => string;
    dbgIntersectionState(x: /*IntersectionState*/0|1|2): string;
    dbgRecursionFlags(x: 0|1|2|3): string;
    dbgTernaryToString(x: Ternary): string;
    dbgTypeToString: (type: Type | undefined) => string;
    // dbgTypeToStringDetail: (type: Type) => string[];
    dbgNodeToString: (node: Node | undefined) => string;
    dbgSignatureId: (c: Signature | undefined) => number;
    dbgSignatureToString: (c: Signature | undefined) => string;
    // Show composite signatures
    dbgSignatureAndCompositesToStrings: (c: Signature | undefined) => string[];
    // dbgWriteSignatureArray: (sa: readonly Signature[], write?: (s: string) => void) => void;
    dbgSymbolToString(s: Readonly<Symbol | undefined>): string;
    dbgDiagnosticsToStrings(diagnostic: Diagnostic | undefined): string[];
    dbgMapperToString(mapper: TypeMapper | undefined): string;
    dbgInferenceInfoToStrings(info: InferenceInfo): string[];
    dbgInferenceContextToStrings(ic: InferenceContext): string[];
}

export class DbgsClass implements Dbgs{
    nextSignatureId = 1;
    constructor(){}
    private getNodeId(node: Node){ return getNodeId(node); /*return node.id??"<undef>";*/ }
    private getSymbolId(symbol: Symbol){ return symbol.id??"<undef>"; }
    private getSafeCheckerTypeToString(type: Type): string{
        if (type.flags & TypeFlags.Intersection) {
            const astr: string[] = [];
            (type as UnionOrIntersectionType).types.forEach(t=>astr.push(this.getSafeCheckerTypeToString(t)));
            return astr.join(" & ");
        }
        return IDebug.checker!.typeToString(type);
    }
    private getSafeCheckerTypeOfSymbol(symbol: Symbol): Type {
        return IDebug.checker!.getTypeOfSymbol(symbol);
    }
    private getSignatureId(signature: Signature & {id?: number}): number {
        if (!signature.id) {
            signature.id = this.nextSignatureId++;
        }
        return signature.id;
    }


    dbgGetNodeText(node: Node){
        return (node as Identifier).escapedText ?? (((node as any).getText && node.pos>=0) ? (node as any).getText() : "<text is unknown>");
    }
    dbgTernaryToString(x: Ternary): string {
        switch (x){
            case Ternary.True: return "True";
            case Ternary.False: return "False";
            case Ternary.Maybe: return "Maybe";
            case Ternary.Unknown: return "Unknown";
            default: Debug.assertNever(0 as any as never);
        }
    }
    // const enum IntersectionState {
    //     None = 0,
    //     Source = 1 << 0, // Source type is a constituent of an outer intersection
    //     Target = 1 << 1, // Target type is a constituent of an outer intersection
    // }
    dbgIntersectionState(x: /*IntersectionState*/0|1|2): string {
        switch (x){
            case 0: return "None";
            case 1: return "Source";
            case 2: return "Target";
            default: Debug.assertNever(x);
        }
    }
    // const enum RecursionFlags {
    //     None = 0,
    //     Source = 1 << 0,
    //     Target = 1 << 1,
    //     Both = Source | Target,
    // }
    dbgRecursionFlags(x: 0|1|2|3): string {
        switch (x){
            case 0: return "None";
            case 1: return "Source";
            case 2: return "Target";
            case 3: return "Both";
            default: Debug.assertNever(x);
        }
    }

    dbgTypeToString = (type: Type | undefined): string => {
        if (!type) return "<undef>";
        return `[t${type.id}] ${this.getSafeCheckerTypeToString(type)}`;
    };
    dbgNodeToString(node: Node | undefined): string {
        if (!node) return "<undef>";
        return `[n${this.getNodeId(node)}] ${this.dbgGetNodeText(node)}, [${node.pos},${node.end}], ${Debug.formatSyntaxKind(node.kind)}`;
    }
    dbgSignatureId(c: Signature | undefined): number {
        return c ? this.getSignatureId(c) : -1;
    }
    dbgSignatureToString(c: Signature | undefined): string {
        if (!c) return "<undef>";
        let astr: string[] = [`[sg:${this.getSignatureId(c)}] `];

        c.parameters.forEach(symbol=> {
            const typeOfSymbol = this.getSafeCheckerTypeOfSymbol(symbol);
            astr.push(this.dbgTypeToString(typeOfSymbol));
        });
        let str = "(" + astr.join("; ") + ") => ";
        str += c.resolvedReturnType ? this.dbgTypeToString(c.resolvedReturnType) : "<no resolved type>";
        if (c.compositeKind===TypeFlags.Union) str += ` /* composite union [${c.compositeSignatures?.length}] */`;
        else if (c.compositeKind===TypeFlags.Intersection) str += ` /* composite intersection [${c.compositeSignatures?.length}] */`;
        else if (c.compositeSignatures) str += ` /* composite ??? [${c.compositeSignatures?.length}] */`;
        return str;
    }
    dbgSignatureAndCompositesToStrings(c: Signature | undefined): string[] {
        if (!c) return ["<undef>"];
        let astr: string[] = [];
        astr.push(this.dbgSignatureToString(c));
        if (c.compositeSignatures){
            c.compositeSignatures.forEach((s,i)=>{
                astr.push(`composite[${i}]: ${this.dbgSignatureToString(s)}`);
            });
        }
        return astr;
    }

    dbgSymbolToString(s: Readonly<Symbol | undefined>): string {
        if (!s) return "<undef>";
        const idStr = s.id ? `id:${s.id}, ` : "";
        const transientIdStr = s.transientId ? `transientId:${s.transientId}, ` : "";
        return `{ ${idStr}${transientIdStr}ename: ${s.escapedName} }`;
    }
    dbgDiagnosticsToStrings(diagnostic: Diagnostic | undefined): string[] {
        if (!diagnostic) return ["<undef>"];
        const astr: string[] = [];
        let d: Diagnostic | DiagnosticMessageChain | undefined = diagnostic;
        while (d?.messageText){
            if (typeof d.messageText === "string") {
                astr.push(d.messageText);
                d = undefined;
            }
            else if (typeof d.messageText.messageText === "string") {
                astr.push(d.messageText.messageText);
                if (d.messageText.next) {
                    d = d.messageText.next[0] as DiagnosticMessageChain;
                }
            }
        }
        return astr;
    }
    dbgMapperToString(mapper: TypeMapper | undefined): string {
        if (!mapper) return "<#undef>";
        return "CANNOT DO - using Debug.DebugTypeMapper.__debugToString() may change inference results"
        return (mapper as any as Debug.DebugTypeMapper).__debugToString();
        //const dtm = new Debug.DebugTypeMapper();
        //dtm.__debugToString;
        //Debug.assert(dtm.__debugToString);
        //return dtm.__debugToString.call(mapper);
    }

    dbgInferenceInfoToStrings(info: InferenceInfo): string[] {
        //castHereafter<DbgsClass>(this);
        const ret: string[] = [];
        ret.push(`typeParameter: ${this.dbgTypeToString(info.typeParameter)}`);
        ret.push(`candidates: ${info.candidates?.map(this.dbgTypeToString).join(",")}`);
        ret.push(`contraCandidates: ${info.contraCandidates?.map(this.dbgTypeToString).join(",")}`);
        ret.push(`inferredType: ${this.dbgTypeToString(info.inferredType)}`);
        ret.push(`priority: ${info.priority}`);
        ret.push(`topLevel: ${info.topLevel}`);
        ret.push(`isFixed: ${info.isFixed}`);
        ret.push(`impliedArity: ${info.impliedArity}`);
        return ret;
    }

    dbgIntraExpressionInferenceSite(site: IntraExpressionInferenceSite): string {
        return `node: ${this.dbgNodeToString(site.node)}, type: ${this.dbgTypeToString(site.type)}`;
    }

    dbgInferenceContextToStrings(ic: InferenceContext): string[] {
        const ret: string[] = [];
        ret.push(`signature: ${this.dbgSignatureToString(ic.signature)}`);
        ret.push(`flags: ${ic.flags}`);
        ret.push(`inferredTypeParameters: ${ic.inferredTypeParameters?.map(this.dbgTypeToString).join(",")}`);
        // ret.push(`mapper: ${this.dbgMapperToString(ic.mapper)}`);
        // ret.push(`nonFixingMapper: ${this.dbgMapperToString(ic.nonFixingMapper)}`);
        // ret.push(`returnMapper: ${this.dbgMapperToString(ic.returnMapper)}`);
        ic.intraExpressionInferenceSites?.forEach((site,i)=>{
            ret.push(`intraExpressionInferenceSite[${i}]: ${this.dbgIntraExpressionInferenceSite(site)}`);
        });
        ic.inferences.forEach((inf,i)=>{
            this.dbgInferenceInfoToStrings(inf).forEach(s=>ret.push(`inference[${i}]: ${s}`));
        });
        ret.push(`compareTypes: TODO`);
        return ret;
    }


}

// export interface InferenceInfo {
//     typeParameter: TypeParameter;            // Type parameter for which inferences are being made
//     candidates: Type[] | undefined;          // Candidates in covariant positions (or undefined)
//     contraCandidates: Type[] | undefined;    // Candidates in contravariant positions (or undefined)
//     inferredType?: Type;                     // Cache for resolved inferred type
//     priority?: InferencePriority;            // Priority of current inference set
//     topLevel: boolean;                       // True if all inferences are to top level occurrences
//     isFixed: boolean;                        // True if inferences are fixed
//     impliedArity?: number;
// }




function initialize(){
    IDebug.logLevel = (process.env.myLogLevel===undefined) ? 0 : Number(process.env.myLogLevel);
    IDebug.assertLevel = (process.env.myAssertLevel===undefined) ? 0 : Number(process.env.myAssertLevel);
    IDebug.suffix = (process.env.suffix===undefined) ? "" : process.env.suffix;
    if (IDebug.logLevel){
        Debug.isDebugging = true;
        IDebug.loggingHost = new ILoggingClass();
        IDebug.dbgs = new DbgsClass();
    }

}
initialize();
