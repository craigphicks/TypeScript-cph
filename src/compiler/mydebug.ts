import { Debug, LogLevel } from "./debug";
import { SourceFile, TypeChecker, Type, Node, Symbol, Signature, Identifier, Diagnostic, DiagnosticMessageChain, TypeMapper, InferenceInfo, InferenceContext, IntraExpressionInferenceSite } from "./types";
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
    export let loggingHost: ILoggingHost | undefined = undefined;
    export let dbgs: Dbgs = 0 as any as Dbgs;
    export let checker: TypeChecker | undefined = undefined;
    // temporary
    export let nouseResolveCallExpressionV2: boolean = false;
    export function ilog(message: (()=>string), level?: LogLevel) {
        if (loggingHost) loggingHost.ilog(message, level);
    }
    export function ilogGroup(message: (()=>string), level?: LogLevel) {
        if (loggingHost) loggingHost.ilogGroup(message, level);
    }
    export function ilogGroupEnd(message?: (()=>string), level?: LogLevel, expectedIndent?: number) {
        if (loggingHost) loggingHost.ilogGroupEnd(message, level, expectedIndent);
    }
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
        if (this.numOutLines > this.maxNumOutLines) Debug.fail(`Too many lines (${this.maxNumOutLines}) log file ` + this.logFilename);
        let message = messagef();
        const indent = this.oneIndent.repeat(this.indent);
        const msg = indent + message + '\n';
        this.nodeFs.writeSync(this.logFileFd, msg);
        this.numOutLines++;
    }
    ilog(message: (()=>string), level: LogLevel = LogLevel.Info) {
        this.log(level, message);
    }
    ilogGroup (message: (()=>string), level: LogLevel = LogLevel.Info) {
        this.log(level, message);
        return this.indent++;
    }
    ilogGroupEnd (message?: (()=>string), level: LogLevel = LogLevel.Info, expectedIndent: number | undefined = undefined) {
        this.indent--;
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
        const retfn = "tmp/" + nameRet +`.#${this.currentSourceFnCount}` +`.de${IDebug.logLevel}.rcev${IDebug.nouseResolveCallExpressionV2?1:2}.log`;
        return retfn;
    }
}

export interface Dbgs {
    dbgGetNodeText: (node: Node) => any;
    // dbgFlowToString: (flow: FlowNode | undefined, withAntecedants?: boolean) => string;
    // dbgFloughTypeToString: (flowType: FloughType) => string;
    dbgTypeToString: (type: Type | undefined) => string;
    // dbgTypeToStringDetail: (type: Type) => string[];
    dbgNodeToString: (node: Node | undefined) => string;
    dbgSignatureToString: (c: Signature | undefined) => string;
    // dbgWriteSignatureArray: (sa: readonly Signature[], write?: (s: string) => void) => void;
    dbgSymbolToString(s: Readonly<Symbol | undefined>): string;
    dbgDiagnosticsToStrings(diagnostic: Diagnostic | undefined): string[];
    dbgMapperToString(mapper: TypeMapper | undefined): string;
    dbgInferenceInfoToStrings(info: InferenceInfo): string[];
    dbgInferenceContextToStrings(ic: InferenceContext): string[];
}

export class DbgsClass implements Dbgs{
    constructor(){}
    private getNodeId(node: Node){ return getNodeId(node); /*return node.id??"<undef>";*/ }
    private getSymbolId(symbol: Symbol){ return symbol.id??"<undef>"; }
    private getSafeCheckerTypeToString(type: Type): string{
        return IDebug.checker!.typeToString(type);
    }
    private getSafeCheckerTypeOfSymbol(symbol: Symbol): Type {
        return IDebug.checker!.getTypeOfSymbol(symbol);
    }
    dbgGetNodeText(node: Node){
        return (node as Identifier).escapedText ?? (((node as any).getText && node.pos>=0) ? (node as any).getText() : "<text is unknown>");
    };
    dbgTypeToString = (type: Type | undefined): string => {
        if (!type) return "<undef>";
        return `[t${type.id}] ${this.getSafeCheckerTypeToString(type)}`;
    };
    dbgNodeToString(node: Node | undefined): string {
        if (!node) return "<undef>";
        return `[n${this.getNodeId(node)}] ${this.dbgGetNodeText(node)}, [${node.pos},${node.end}], ${Debug.formatSyntaxKind(node.kind)}`;
    };
    dbgSignatureToString(c: Signature | undefined): string {
        if (!c) return "<undef>";
        let astr: string[] = [];
        c.parameters.forEach(symbol=> {
            const typeOfSymbol = this.getSafeCheckerTypeOfSymbol(symbol);
            astr.push(this.dbgTypeToString(typeOfSymbol));
        });
        let str = "(" + astr.join("; ") + ") => ";
        str += c.resolvedReturnType ? this.dbgTypeToString(c.resolvedReturnType) : "<no resolved type>";
        return str;
    };
    dbgSymbolToString(s: Readonly<Symbol | undefined>): string {
        return s ? `{ id:${this.getSymbolId(s)}, ename: ${s.escapedName} }` : "<undef>";
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
    IDebug.nouseResolveCallExpressionV2 = (process.env.nouseRcev2===undefined || !Number(process.env.nouseRcev2)) ? false : true
    if (IDebug.logLevel){
        Debug.isDebugging = true;
        IDebug.loggingHost = new ILoggingClass();
        IDebug.dbgs = new DbgsClass();
    }

}
initialize();
