import * as ts from "./_namespaces/ts";
import { Debug, LogLevel } from "./debug";
import { SourceFile, TypeChecker, Type, Node, Symbol, Signature, Identifier, Diagnostic, DiagnosticMessageChain, TypeMapper, InferenceInfo, InferenceContext, IntraExpressionInferenceSite, TypeFlags, UnionOrIntersectionType, Ternary, ObjectType } from "./types";
import { getNodeId, CheckMode, SignatureCheckMode } from "./checker";
import { getLineAndCharacterOfPosition } from "./_namespaces/ts";
import { FloughTypeChecker } from "./floughTypedefs";
//import { castHereafter } from "./core";

export interface ILoggingHost {
    //log(level: LogLevel, message: string | (() => string)) : void;
    ilog(message: (()=>string), level?: LogLevel) : void;
    ilogGroup (message: (()=>string), level?: LogLevel): number;
    ilogGroupEnd (message?: (()=>string), level?: LogLevel, expectedIndent?: number): void;
    notifySourceFile(sourceFile: SourceFile, typeChecker: TypeChecker): void;
    isActiveFile(): boolean;
    getCurrentSourceFnCount(): number;
    getBaseTestFilepath(node: SourceFile): string; // including tmp/ directory
}

export namespace IDebug {
    /* eslint-disable prefer-const */
    var loggerLevelDefault = Number.MAX_SAFE_INTEGER;
    export let logLevel = LogLevel.Off;
    export let assertLevel = 0;
    //export let isDebugging = false;
    //export let loggingHost: LoggingHost | undefined;
    export let loggingHost: ILoggingHost | undefined;
    export let dbgs: Dbgs = 0 as any as Dbgs;
    export let checker: FloughTypeChecker | undefined;
    export function isActive(loggerLevel = loggerLevelDefault) {
        return checker && logLevel >= loggerLevel && loggingHost && loggingHost.isActiveFile();
    }
    export function ilog(message: (()=>string), level: LogLevel) {
        if (loggingHost) loggingHost.ilog(message, level);
    }
    export function ilogGroup(message: (()=>string), level: LogLevel): number {
        if (loggingHost) return loggingHost.ilogGroup(message, level);
        return 0;
    }
    export function ilogGroupEnd(message: (()=>string), level: LogLevel, expectedIndent?: number) {
        if (loggingHost) loggingHost.ilogGroupEnd(message, level, expectedIndent);
    }
    export let suffix = "";

    let specialSignatures: {anySignature: Signature,unknownSignature: Signature,resolvingSignature: Signature,silentNeverSignature: Signature};
    export function setSpecialSignatures(arg:{anySignature: Signature, unknownSignature: Signature, resolvingSignature: Signature, silentNeverSignature: Signature}){
        specialSignatures = arg;
    };
    export function getSpecialSignatureString(signature: Signature): string | undefined {
        if (signature===specialSignatures.anySignature) return "anySignature";
        if (signature===specialSignatures.unknownSignature) return "unknownSignature";
        if (signature===specialSignatures.resolvingSignature) return "resolvingSignature";
        if (signature===specialSignatures.silentNeverSignature) return "silentNeverSignature";
        return undefined;
    }

    let specialNeverTypes: {neverType: Type,silentNeverType: Type,implicitNeverType: Type,unreachableNeverType: Type};
    export function setSpecialNeverTypes(arg:{neverType: Type,silentNeverType: Type,implicitNeverType: Type,unreachableNeverType: Type}){
        specialNeverTypes = arg;
    }
    export function getSpecialNeverString(type: Type): string | undefined {
        if (type===specialNeverTypes.neverType) return "neverType";
        if (type===specialNeverTypes.silentNeverType) return "silentNeverType";
        if (type===specialNeverTypes.implicitNeverType) return "implicitNeverType";
        if (type===specialNeverTypes.unreachableNeverType) return "unreachableNeverType";
        return undefined;
    }



}

export class ILoggingClass implements ILoggingHost {
    indent: number = 0;
    oneIndent: string = '  ';
    currentSourceFn: string = '';
    currentSourceFnCount: number = -1;
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
    isActiveFile() { return !!this.logFileFd; }
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
        //this.log(level, message);
        this.log(level+1, message);
    }
    ilogGroup (message: (()=>string), level: LogLevel = Number.MAX_SAFE_INTEGER) {
        if (!this.logFileFd) return 0;
        this.log(level, message);
        if (level > IDebug.logLevel) return this.indent;
        return this.indent++;
    }
    ilogGroupEnd (message?: (()=>string), level: LogLevel = Number.MAX_SAFE_INTEGER, expectedIndent: number | undefined = undefined) {
        if (!this.logFileFd) return;
        if (level <= IDebug.logLevel) this.indent--;
        if (level<0) Debug.fail("ilogGroupEnd: Negative log level");
        if (expectedIndent!==undefined && expectedIndent!==this.indent) {
            Debug.fail('Expected indent ' + expectedIndent + ' but got ' + this.indent);
        }
        if (message) {
            this.log(level, message);
        }
    }
    notifySourceFile(sourceFile: SourceFile, typeChecker: FloughTypeChecker) {
        this.currentSourceFn = sourceFile.originalFileName;
        this.currentSourceFnCount = -1;
        this.logFilename = undefined;
        this.logFileFd = 0;
        this.numOutLines = 0;

        if (this.dbgTestFilenameMatches(sourceFile)){
            if (!this.sourceToFilenameCount.has(sourceFile.path)){
                this.currentSourceFnCount = 0;
                //this.sourceToFilenameCount.set(sourceFile.path, 0)
            }
            else {
                this.currentSourceFnCount = this.sourceToFilenameCount.get(sourceFile.path)! + 1;
                //this.sourceToFilenameCount.set(sourceFile.path, this.sourceToFilenameCount.get(sourceFile.path)! + 1)
            }
            this.sourceToFilenameCount.set(sourceFile.path, this.currentSourceFnCount);

            this.logFilename = this.dbgTestFilename(sourceFile, this.currentSourceFnCount);
            this.logFileFd = this.nodeFs.openSync(this.logFilename, 'w');
            this.numOutLines = 0;
            IDebug.checker = typeChecker;
        }
    }
    getCurrentSourceFnCount() { return this.currentSourceFnCount; }
    private dbgTestFilenameMatches(node: SourceFile): boolean {
        const re = /^\/.src\//;
        const nameMatched = (node.path.match(re) && node.path.slice(-5)!==".d.ts");
        return !!nameMatched;
    }
    private dbgTestFilename(node: SourceFile, index: number): string | undefined {
        // if (!this.sourceToFilenameCount.has(node.path)){
        //     this.sourceToFilenameCount.set(node.path, 0);
        //     this.currentSourceFnCount = 0;
        // }
        // else {
        //     this.currentSourceFnCount = this.sourceToFilenameCount.get(node.path)! + 1;
        //     this.sourceToFilenameCount.set(node.path, this.currentSourceFnCount);
        // }
        const nameRet = this.nodePath.basename(node.path, ".ts");
        this.nodeFs.mkdirSync("tmp", {recursive: true});
        const retfn = "tmp/" + nameRet +`.#${index}` +`.de${IDebug.logLevel}.log${IDebug.suffix?`-${IDebug.suffix}`:""}`;
        return retfn;
    }
    getBaseTestFilepath(node: SourceFile) {
        const nameRet = this.nodePath.basename(node.path, ".ts");
        this.nodeFs.mkdirSync("tmp", {recursive: true});
        const retfn = "tmp/" + nameRet;
        return retfn;
    }
}


export interface Dbgs {
    getNodeText: (node: Node) => any;
    // dbgFlowToString: (flow: FlowNode | undefined, withAntecedants?: boolean) => string;
    // dbgFloughTypeToString: (flowType: FloughType) => string;
    intersectionState(x: /*IntersectionState*/0|1|2): string;
    recursionFlags(x: 0|1|2|3): string;
    ternaryToString(x: Ternary): string;
    typeToString: (type: Type | undefined) => string;
    // dbgTypeToStringDetail: (type: Type) => string[];
    nodeToString: (node: Node | undefined) => string;
    signatureId: (c: Signature | undefined) => number;
    signatureToString: (c: Signature | undefined) => string;
    // Show composite signatures
    signatureAndCompositesToStrings: (c: Signature | undefined) => string[];
    // dbgWriteSignatureArray: (sa: readonly Signature[], write?: (s: string) => void) => void;
    symbolToString(s: Readonly<Symbol | undefined>): string;
    diagnosticsToStrings(diagnostic: Diagnostic | undefined): string[];
    mapperToString(mapper: TypeMapper | undefined): string;
    inferenceInfoToStrings(info: InferenceInfo): string[];
    inferenceContextToStrings(ic: InferenceContext): string[];

    checkModeToString(mode: CheckMode | undefined): string;
    signatureCheckModeToString(mode: SignatureCheckMode | undefined): string;
}

export class DbgsClass implements Dbgs{
    nextSignatureId = 1;
    constructor(){}
    private getNodeId(node: Node){ return getNodeId(node); /*return node.id??"<undef>";*/ }
    private getSymbolId(symbol: Symbol){ return symbol.id??"<undef>"; }
    private getSafeCheckerTypeToString(type: Type): string{
        const neverStr = IDebug.getSpecialNeverString(type);
        if (neverStr) return neverStr;
        if (type.flags & TypeFlags.Intersection) {
            const astr: string[] = [];
            (type as UnionOrIntersectionType).types.forEach(t=>astr.push(this.getSafeCheckerTypeToString(t)));
            return astr.join(" & ");
        }
        let str = IDebug.checker!.typeToString(type);
        if (type.flags & TypeFlags.Object && (type as ObjectType).callSignatures?.length) {
            const c = (type as ObjectType).callSignatures![0];
            if (c.compositeKind===TypeFlags.Union) str += ` /* composite union [${c.compositeSignatures?.length}] */`;
            else if (c.compositeKind===TypeFlags.Intersection) str += ` /* composite intersection [${c.compositeSignatures?.length}] */`;
            else if (c.compositeSignatures) str += ` /* composite ??? [${c.compositeSignatures?.length}] */`;
        }
        return str;
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


    getNodeText(node: Node){
        return (node as Identifier).escapedText ?? (((node as any).getText && node.pos>=0) ? (node as any).getText() : "<text is unknown>");
    }
    ternaryToString(x: Ternary): string {
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
    intersectionState(x: /*IntersectionState*/0|1|2): string {
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
    recursionFlags(x: 0|1|2|3): string {
        switch (x){
            case 0: return "None";
            case 1: return "Source";
            case 2: return "Target";
            case 3: return "Both";
            default: Debug.assertNever(x);
        }
    }

    typeToString = (type: Type | undefined): string => {
        if (!type) return "<undef>";
        return `[t${type.id}] ${this.getSafeCheckerTypeToString(type)}`;
    };
    nodeToString(node: Node | undefined): string {
        if (!node) return "<undef>";

        const sourceFile = IDebug.checker?.getCurrentSourceFileFloughState().sourceFile;
        const line = sourceFile ? getLineAndCharacterOfPosition(sourceFile, node.pos) : undefined;
        const linestr = line ? `(${line.line},${line.character})` : "(?,?)";

        const getOneLineNodeTxt = (()=>{
            let str = this.getNodeText(node);
            str = str.replace(/\n/g, " ");
            if (str.length>120) str = str.slice(0,50) + "..." + str.slice(-50);
            return str;
        });
        return `[n${this.getNodeId(node)}] ${getOneLineNodeTxt()}, [${linestr}:${node.pos},${node.end}], ${Debug.formatSyntaxKind(node.kind)}`;
    }
    signatureId(c: Signature | undefined): number {
        return c ? this.getSignatureId(c) : -1;
    }
    signatureToString(c: Signature | undefined): string {
        if (!c) return "<undef>";
        const specialStr = IDebug.getSpecialSignatureString(c);
        if (specialStr) return specialStr;

        let astr: string[] = [];
        c.parameters.forEach(symbol=> {
            const typeOfSymbol = this.getSafeCheckerTypeOfSymbol(symbol);
            astr.push(this.typeToString(typeOfSymbol));
        });
        let str = `[sg:${this.getSignatureId(c)}] (` +astr.join("; ") + ") => ";
        str += c.resolvedReturnType ? this.typeToString(c.resolvedReturnType) : "<no resolved type>";
        if (c.compositeKind===TypeFlags.Union) str += ` /* composite union [${c.compositeSignatures?.length}] */`;
        else if (c.compositeKind===TypeFlags.Intersection) str += ` /* composite intersection [${c.compositeSignatures?.length}] */`;
        else if (c.compositeSignatures) str += ` /* composite ??? [${c.compositeSignatures?.length}] */`;
        return str;
    }
    signatureAndCompositesToStrings(c: Signature | undefined): string[] {
        if (!c) return ["<undef>"];
        let astr: string[] = [];
        astr.push(this.signatureToString(c));
        if (c.compositeSignatures){
            c.compositeSignatures.forEach((s,i)=>{
                astr.push(`composite[${i}]: ${this.signatureToString(s)}`);
            });
        }
        return astr;
    }

    symbolToString(s: Readonly<Symbol | undefined>): string {
        if (!s) return "<undef>";
        const idStr = s.id ? `id:${s.id}, ` : "";
        const transientIdStr = s.transientId ? `transientId:${s.transientId}, ` : "";
        return `{ ${idStr}${transientIdStr}ename: ${s.escapedName} }`;
    }
    diagnosticsToStrings(diagnostic: Diagnostic | undefined): string[] {
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
    mapperToString(mapper: TypeMapper | undefined): string {
        if (!mapper) return "<#undef>";
        return "CANNOT DO - using Debug.DebugTypeMapper.__debugToString() may change inference results"
        return (mapper as any as Debug.DebugTypeMapper).__debugToString();
        //const dtm = new Debug.DebugTypeMapper();
        //dtm.__debugToString;
        //Debug.assert(dtm.__debugToString);
        //return dtm.__debugToString.call(mapper);
    }

    inferenceInfoToStrings(info: InferenceInfo): string[] {
        //castHereafter<DbgsClass>(this);
        const ret: string[] = [];
        ret.push(`typeParameter: ${this.typeToString(info.typeParameter)}`);
        ret.push(`candidates: ${info.candidates?.map(this.typeToString).join(",")}`);
        ret.push(`contraCandidates: ${info.contraCandidates?.map(this.typeToString).join(",")}`);
        ret.push(`inferredType: ${this.typeToString(info.inferredType)}`);
        ret.push(`priority: ${info.priority}`);
        ret.push(`topLevel: ${info.topLevel}`);
        ret.push(`isFixed: ${info.isFixed}`);
        ret.push(`impliedArity: ${info.impliedArity}`);
        return ret;
    }

    intraExpressionInferenceSite(site: IntraExpressionInferenceSite): string {
        return `node: ${this.nodeToString(site.node)}, type: ${this.typeToString(site.type)}`;
    }

    inferenceContextToStrings(ic: InferenceContext): string[] {
        const ret: string[] = [];
        ret.push(`signature: ${this.signatureToString(ic.signature)}`);
        ret.push(`flags: ${ic.flags}`);
        ret.push(`inferredTypeParameters: ${ic.inferredTypeParameters?.map(this.typeToString).join(",")}`);
        // ret.push(`mapper: ${this.dbgMapperToString(ic.mapper)}`);
        // ret.push(`nonFixingMapper: ${this.dbgMapperToString(ic.nonFixingMapper)}`);
        // ret.push(`returnMapper: ${this.dbgMapperToString(ic.returnMapper)}`);
        ic.intraExpressionInferenceSites?.forEach((site,i)=>{
            ret.push(`intraExpressionInferenceSite[${i}]: ${this.intraExpressionInferenceSite(site)}`);
        });
        ic.inferences.forEach((inf,i)=>{
            this.inferenceInfoToStrings(inf).forEach(s=>ret.push(`inference[${i}]: ${s}`));
        });
        ret.push(`compareTypes: TODO`);
        return ret;
    }

    checkModeToString(mode: CheckMode | undefined): string {
        const str = Debug.formatEnum(mode, (ts as any).CheckMode, /*isFlags*/ true);
        return `CheckMode: ${str}`;
    }
    signatureCheckModeToString(mode: SignatureCheckMode | undefined): string {
        const str = Debug.formatEnum(mode, (ts as any).SignatureCheckMode, /*isFlags*/ true);
        return `SignatureCheckMode: ${str}`;
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
