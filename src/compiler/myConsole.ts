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
        dbgFlowToString: (flow: FlowNode | undefined) => string;
        dbgFlowTypeToString: (flowType: FlowType) => string;
        dbgNodeToString: (node: Node | undefined) => string;
        dbgSignatureToString: (c: Signature) => string;
        dbgWriteSignatureArray: (sa: readonly Signature[], write?: (s: string) => void) => void;
        dbgFlowNodeGroupToString: (flowNodeGroup: FlowNodeGroup | undefined) => string;
        dbgSymbolToStringSimple(s: Readonly<Symbol | undefined>): string;
        dbgSymbolToStringSimple(s: Readonly<Symbol | undefined>): string;
        //dbgRefTypeToString(rt: Readonly<RefType>): string;
        //dbgRefTypesRtnToStrings(rtr: Readonly<RefTypesRtn>): string[];
    }
    export function createDbgs(checker: TypeChecker): Dbgs{
        const dbgGetNodeText = (node: Node)=>{
            return ((node as any).getText && node.pos>=0) ? (node as any).getText() : (node as Identifier).escapedText??"";
        };
        const dbgFlowToString = (flow: FlowNode | undefined): string => {
            if (!flow) return "<undef>";
            let str = "";
            //if (isFlowWithNode(flow)) str += `[${(flow.node as any).getText()}, (${flow.node.pos},${flow.node.end})]`;
            str += `[f${checker.getFlowNodeId(flow)}], ${Debug.formatFlowFlags(flow.flags)}, `;
            if (isFlowWithNode(flow)) str += dbgNodeToString(flow.node);
            if (isFlowJoin(flow)) str += `[joinNode:${dbgNodeToString(flow.joinNode)}`;
            return str;
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
        const dbgFlowNodeGroupToString = (
            flowNodeGroup: FlowNodeGroup | undefined,
        ): string => {
            if (!flowNodeGroup) return "<undef>";
            let str = "";
            if (isPlainNodefulFlowNodeGroup(flowNodeGroup)){
                str += `[Plain] maximal[fg:${checker.getFlowNodeId(flowNodeGroup.maximal)}]: ${dbgFlowToString(flowNodeGroup.maximal)}`;
            }
            else if (isIfPairFlowNodeGroup(flowNodeGroup)){
                str += `[IfPair] maximalNode[fg:${dbgNodeToString(flowNodeGroup.maximalNode)}], true:${checker.getFlowNodeId(flowNodeGroup.true.flow)}, false:${checker.getFlowNodeId(flowNodeGroup.false.flow)}`;
            }
            else if (isIfBranchFlowNodeGroup(flowNodeGroup)){
                str += `[IfBranch] flow[true: ${flowNodeGroup.true}, fg:${dbgFlowToString(flowNodeGroup.flow)}]`;
            }
            else if (isNodelessFlowNodeGroup(flowNodeGroup)) {
                str += `[Nodeless] flow[fg:${checker.getFlowNodeId(flowNodeGroup.flow)}]: ${dbgFlowToString(flowNodeGroup.flow)}`;
            }
            str += `, getOrdinal: ${getOrdinal(flowNodeGroup)}`;
            return str;
        };
        function dbgSymbolToStringSimple(s: Readonly<Symbol | undefined>): string {
            return s ? `{ id:${getSymbolId(s)}, ename: ${s.escapedName} }` : "<undef>";
        }
        // function dbgRefTypeToString(rt: Readonly<RefType>): string {
        //     return `{ type: ${checker.typeToString(rt.type)}, const: ${rt.const} }`;
        // }
        // function dbgRefTypesRtnToStrings(rtr: Readonly<RefTypesRtn>): string[] {
        //     const astr: string[] = ["{"];
        //     const rtnTypeStr = checker.typeToString(rtr.rtnType);
        // eslint-disable-next-line no-double-space
        //     astr.push(`  rtnType:${rtnTypeStr},`);
        //     const symbolOfRtnTypeStr = dbgSymbolToStringSimple(rtr.symbolOfRtnType);
        // eslint-disable-next-line no-double-space
        //     astr.push(`  symbolOfRtnType:${symbolOfRtnTypeStr},`);
        // eslint-disable-next-line no-double-space
        //     astr.push(`  refTypes:[`);
        //     rtr.refTypes.bySymbol.forEach((rt,s)=>{
        //         const str = `    {symbol:${dbgSymbolToStringSimple(s)}, refType:${dbgRefTypeToString(rt)} }`;
        //         astr.push(str);
        //     });
        // eslint-disable-next-line no-double-space
        //     astr.push(`  ]`);
        //     astr.push(`}`);
        //     return astr;
        // }



        return {
            dbgGetNodeText,
            dbgFlowToString,
            dbgFlowTypeToString,
            dbgNodeToString,
            dbgSignatureToString,
            dbgWriteSignatureArray,
            dbgFlowNodeGroupToString,
            dbgSymbolToStringSimple,
            // dbgRefTypeToString,
            // dbgRefTypesRtnToStrings
        };
    }
}

