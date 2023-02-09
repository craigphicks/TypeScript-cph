namespace ts {

    let myconsole: undefined | MyConsole;
    interface SystemWithAppendFile extends System {
        openFileForWriteFd(path: string): number; // returns number which is file description
        writeFileFd(fd: number, data: string): void;
    }
    const mySys: SystemWithAppendFile = (()=>{
        const nodeFs = require("fs");
        return {
            ...sys,
            openFileForWriteFd: (path: string) => {
                return nodeFs.openSync(path,"w+");
            },
            writeFileFd: (fd: number, data: string) => {
                nodeFs.writeFileSync(fd, data);
            }
        };
    })();
    //mySys.enableCPUProfiler("tmp.prof",()=>{});
    export interface MyConsole {
        fd: number;
        currentIndent: number;
        oneIndent: string;
        numOutLines: number;
        dbgFileCount: number;
        indent(): string;
        log(s: string): void;
        group(s: string): void;
        groupEnd(): void;
    };

    export function createMyConsole({myMaxLinesOut, getDbgFileCount, getMyDebug, getMyDisableInfer, setMyDebug}: {
        myMaxLinesOut: number;
        getDbgFileCount: () => number;
        getMyDebug: () => boolean;
        getMyDisableInfer: () => boolean,
        setMyDebug: (b: false) => void;
    }): void {
        const myConsole: MyConsole = {
            fd:0,
            currentIndent: 0,
            oneIndent: "  ",
            numOutLines: 0,
            dbgFileCount: 0,
            indent(){ return myConsole.oneIndent.repeat(myConsole.currentIndent); },
            log(s: string){
                if (myConsole.dbgFileCount!==getDbgFileCount()) {
                   myConsole.fd=0;
                   myConsole.dbgFileCount = getDbgFileCount();
                }
                if (!myConsole.fd) {
                    let filename = "";
                    if (process.env.myDbgOutFilename) {
                        filename = `${process.env.myDbgOutFilename}.dfc${myConsole.dbgFileCount}`;
                    }
                    else {
                        filename = "tmp.";
                        if (process.env.myTestFilename) filename += process.env.myTestFilename + ".";
                        filename += `de${getMyDebug()?1:0}.di${getMyDisableInfer()?1:0}.dfc${myConsole.dbgFileCount}.txt`;
                    }
                    myConsole.fd = mySys.openFileForWriteFd(filename);
                }
                if (this.numOutLines>=myMaxLinesOut) {
                    if (this.numOutLines===myMaxLinesOut) {
                        mySys.writeFileFd(myConsole.fd, "REACHED MAX LINE LIMIT = "+myMaxLinesOut+sys.newLine);
                        setMyDebug(false);
                        throw new Error("REACHED MAX DEBUG LINE LIMIT");
                    }
                    ++myConsole.numOutLines;
                    return;
                }
                mySys.writeFileFd(myConsole.fd, myConsole.indent()+s+mySys.newLine);
                ++myConsole.numOutLines;
            },
            group(s: string){
                myConsole.currentIndent++;
                myConsole.log(s);
            },
            groupEnd(){
                myConsole.currentIndent--;
                Debug.assert(myConsole.currentIndent>=0,"myConsole.currentIndent>=0");
            }

        };
        myconsole = myConsole;
    }
    export function getMyConsole(){
        return myconsole!;
    }

    export interface Dbgs {
        dbgGetNodeText: (node: Node) => any;
        dbgFlowToString: (flow: FlowNode | undefined, withAntecedants?: boolean) => string;
        dbgFlowTypeToString: (flowType: FlowType) => string;
        dbgTypeToString: (type: Type) => string;
        dbgTypeToStringDetail: (type: Type) => string[];
        dbgNodeToString: (node: Node | undefined) => string;
        dbgSignatureToString: (c: Signature) => string;
        dbgWriteSignatureArray: (sa: readonly Signature[], write?: (s: string) => void) => void;
        dbgSymbolToStringSimple(s: Readonly<Symbol | undefined>): string;
        dbgSymbolToStringSimple(s: Readonly<Symbol | undefined>): string;
    }
    export function createDbgs(checker: TypeChecker): Dbgs{
        const dbgGetNodeText = (node: Node)=>{
            return ((node as any).getText && node.pos>=0) ? (node as any).getText() : (node as Identifier).escapedText??"";
        };
        const dbgFlowToString = (flow: FlowNode | undefined, withAntecedants?: boolean): string => {
            if (!flow) return "<undef>";
            let str = "";
            //if (isFlowWithNode(flow)) str += `[${(flow.node as any).getText()}, (${flow.node.pos},${flow.node.end})]`;
            str += `[f${checker.getFlowNodeId(flow)}], ${Debug.formatFlowFlags(flow.flags)}, `;
            if (isFlowLabel(flow)){
                str += `branchKind: ${flow.branchKind}, `;
            }
            if (isFlowWithNode(flow)) str += dbgNodeToString(flow.node);
            if (isFlowLabel(flow) && flow.originatingExpression){
                str += `originatingExpression: [n${flow.originatingExpression.id}]{pos:${flow.originatingExpression.pos},end:${flow.originatingExpression.end}}`;
                // str += `originatingExpression: ${dbgNodeToString(flow.originatingExpression)},`;
            }
            // if (isFlowJoin(flow)) str += `[joinNode:${dbgNodeToString(flow.joinNode)}`;aaaaaa
            if (!withAntecedants) return str;
            const antefn = getFlowAntecedents(flow);
            if (antefn.length) {
                str += `antecedents(${antefn.length}):[`;
                antefn.forEach(fn=>{
                    str += "[";
                    const withAntecedants2 = isFlowLabel(fn) /*&& fn.branchKind===BranchKind.postIf*/;
                    str += dbgFlowToString(fn, withAntecedants2);
                    str += "]";
                });
                str += "]";
            }
            return str;
        };
        const dbgTypeToString = (type: Type): string => {
            const alwaysDetail = false;
            if (alwaysDetail) return "(type detail)" + dbgTypeToStringDetail(type).join(", ");
            return checker.typeToString(type);
        };
        const dbgTypeToStringDetail = (type: Type): string[] => {
            const doOne = (t: Type): string => {
                let str = `${checker.typeToString(t)}, id:${t.id}, flags:${Debug.formatTypeFlags(t.flags)}, symbol:${t.symbol?`{${t.symbol.escapedName},${t.symbol.id}}`:`undefined`}`;
                if ((t as any).regularType && (t as any).regularType.id !== t.id){
                    str += `, regularType:{id:${(t as any).regularType.id}}`;
                }
                return str;
            };
            const as: string[] = [];
            as.push(doOne(type));
            if (type.flags & TypeFlags.UnionOrIntersection) {
                checker.everyContainedType(type, t=>{
                    //Debug.formatTypeFlags(t.flags);
                    as.push(doOne(t));
                    return true; // dont stop
                });
            }
            if (as.length===1) return as;
            else return ["[", ...as, "]"];
        };
        const dbgFlowTypeToString = (flowType: FlowType): string => {
            if (!flowType.flags) return "IncompleteType";
            return checker.typeToString(flowType as Type);
        };
        const dbgNodeToString = (node: Node | undefined): string => {
            return !node?"<undef>":`[n${getNodeId(node)}] ${dbgGetNodeText(node)}, [${node.pos},${node.end}], ${Debug.formatSyntaxKind(node.kind)}`;
        };
        const dbgSignatureToString = (c: Signature): string => {
            let str = "(,";
            c.parameters.forEach(p=> str += `${checker.typeToString(checker.getTypeOfSymbol(p))},`);
            str = str.slice(0,-1) + ") => ";
            str += c.resolvedReturnType ? checker.typeToString(c.resolvedReturnType) : "<no resolved type>";
            return str;
        };
        const dbgWriteSignatureArray = (sa: readonly Signature[], write: (s: string) => void = consoleLog): void => {
            sa.forEach(s=> write(dbgSignatureToString(s)));
        };
        function dbgSymbolToStringSimple(s: Readonly<Symbol | undefined>): string {
            return s ? `{ id:${getSymbolId(s)}, ename: ${s.escapedName} }` : "<undef>";
        }
        return {
            dbgGetNodeText,
            dbgFlowToString,
            dbgFlowTypeToString,
            dbgTypeToString,
            dbgTypeToStringDetail,
            dbgNodeToString,
            dbgSignatureToString,
            dbgWriteSignatureArray,
            dbgSymbolToStringSimple,
        };
    }
}

