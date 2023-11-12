import { Debug, LogLevel } from "./debug";
import { SourceFile, TypeChecker, Type, Node, Symbol, Signature, Identifier } from "./types";
import { getNodeId } from "./checker";

export interface ILoggingHost {
    //log(level: LogLevel, message: string | (() => string)) : void;
    ilog(message: string | (()=>string), level?: LogLevel) : void;
    ilogGroup (message: string | (()=>string), level?: LogLevel): number;
    ilogGroupEnd (message?: string | (()=>string), level?: LogLevel, expectedIndent?: number): void;
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
    export function ilog(message: string | (()=>string), level?: LogLevel) {
        if (loggingHost) loggingHost.ilog(message, level);
    }
    export function ilogGroup(message: string | (()=>string), level?: LogLevel) {
        if (loggingHost) loggingHost.ilogGroup(message, level);
    }
    export function ilogGroupEnd(message?: string | (()=>string), level?: LogLevel, expectedIndent?: number) {
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
    log(level: LogLevel, message: string | (() => string)) {
        if (!this.logFileFd) return;
        if (level > IDebug.logLevel) return;
        if (this.numOutLines > this.maxNumOutLines) Debug.fail(`Too many lines (${this.maxNumOutLines}) log file ` + this.logFilename);

        if (typeof message === 'function') {
            message = message();
        }
        const indent = this.oneIndent.repeat(this.indent);
        const msg = indent + message + '\n';
        this.nodeFs.writeSync(this.logFileFd, msg);
        this.numOutLines++;
    }
    ilog(message: string | (()=>string), level: LogLevel = LogLevel.Info) {
        this.log(level, message);
    }
    ilogGroup (message: string | (()=>string), level: LogLevel = LogLevel.Info) {
        this.log(level, message);
        return this.indent++;
    }
    ilogGroupEnd (message?: string | (()=>string), level: LogLevel = LogLevel.Info, expectedIndent: number | undefined = undefined) {
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
        let astr = ["("];
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

    // const dbgFlowToString = (flow: FlowNode | undefined, withAntecedants?: boolean): string => {
    //     if (!flow) return "<undef>";
    //     let str = "";
    //     //if (isFlowWithNode(flow)) str += `[${(flow.node as any).getText()}, (${flow.node.pos},${flow.node.end})]`;
    //     str += `[f${checker.getFlowNodeId(flow)}], ${Debug.formatFlowFlags(flow.flags)}, `;
    //     if (isFlowLabel(flow)){
    //         str += `branchKind: ${flow.branchKind}, `;
    //     }
    //     if (isFlowWithNode(flow)) str += dbgNodeToString(flow.node);
    //     if (isFlowLabel(flow) && flow.originatingExpression){
    //         str += `originatingExpression: [n${flow.originatingExpression.id}]{pos:${flow.originatingExpression.pos},end:${flow.originatingExpression.end}}, `;
    //         // str += `originatingExpression: ${dbgNodeToString(flow.originatingExpression)},`;
    //     }
    //     // if (isFlowJoin(flow)) str += `[joinNode:${dbgNodeToString(flow.joinNode)}`;aaaaaa
    //     if (!withAntecedants) return str;
    //     const antefn = getFlowAntecedents(flow);
    //     if (antefn.length) {
    //         str += `antecedents(${antefn.length}):[`;
    //         antefn.forEach(fn=>{
    //             str += "[";
    //             const withAntecedants2 = isFlowLabel(fn) /*&& fn.branchKind===BranchKind.postIf*/;
    //             str += dbgFlowToString(fn, withAntecedants2);
    //             str += "]";
    //         });
    //         str += "]";
    //     }
    //     if (isFlowLabel(flow) && flow.controlExits){
    //         str += `controlExits:`;
    //         str += "["+flow.controlExits.map(fn=>`${fn.id}`).join(",")+"]";
    //     }
    //     return str;
    // };
    // const dbgTypeToStringDetail = (type: Type): string[] => {
    //     const doOne = (t: Type): string => {
    //         let str = `${checker.typeToString(t)}, id:${t.id}, flags:${Debug.formatTypeFlags(t.flags)}, symbol:${t.symbol?`{${t.symbol.escapedName},${t.symbol.id}}`:`undefined`}`;
    //         if ((t as any).regularType && (t as any).regularType.id !== t.id){
    //             str += `, regularType:{id:${(t as any).regularType.id}}`;
    //         }
    //         return str;
    //     };
    //     const as: string[] = [];
    //     as.push(doOne(type));
    //     if (type.flags & TypeFlags.UnionOrIntersection) {
    //         checker.forEachType(type, t=>{
    //             //Debug.formatTypeFlags(t.flags);
    //             as.push(doOne(t));
    //             return true; // dont stop
    //         });
    //     }
    //     if (as.length===1) return as;
    //     else return ["[", ...as, "]"];
    // };
    // const dbgFloughTypeToString = (ft: FloughType): string => {
    //     return floughTypeModule.dbgFloughTypeToString(ft);
    // };
    // const dbgWriteSignatureArray = (sa: readonly Signature[], write: (s: string) => void = consoleLog): void => {
    //     sa.forEach(s=> write(dbgSignatureToString(s)));
    // };
}

function initialize(){
    IDebug.logLevel = (process.env.myLogLevel===undefined) ? 0 : Number(process.env.myLogLevel);
    IDebug.assertLevel = (process.env.myAssertLevel===undefined) ? 0 : Number(process.env.myAssertLevel);
    IDebug.nouseResolveCallExpressionV2 = (process.env.nouseRcev2===undefined || !Number(process.env.nouseRcev2)) ? false : true
    if (IDebug.logLevel){
        IDebug.loggingHost = new ILoggingClass();
        IDebug.dbgs = new DbgsClass();
    }

}
initialize();
