import { BranchKind, FloughFlags, FloughLabel, FloughNode, FlowExpressionStatement, SourceFileWithFloughNodes} from "./floughTsExtensions";

import {
    getNodeId,
} from "./checker";
import {
    Debug,
} from "./debug";
import {
    isFlowSwitchClause,
    isFlowReduceLabel,
    isFlowStart,
    getFlowAntecedents,
    isFlowLabel,
    isFlowWithNode,

} from "./floughNodesGrouping";
import {
    forEachChild,
} from "./parser";
import {
    sys,
} from "./sys";
import {
    //FlowNode,
    Type,
    TypeChecker,
    Node,
    //FlowLabel,
    //SourceFile,
    FlowFlags as OriginalFlowFlags,
} from "./types";


import { IDebug } from "./mydebug";


function formatFloughFlags(flags: FloughFlags | OriginalFlowFlags): string {
    // @ts-expect-error
    return Debug.formatEnum(flags, FloughFlags, /*isFlags*/ true);
}


function writeFlowNodesUp(writeIn: (s: string) => void, arrFlowNodes: Readonly<FloughNode[]>, mapPeType: Map<string, Type> | undefined, checker: TypeChecker): void {
    const map_peID = new Map<string, number>(); // TID, text ID
    const map_nID = new Map<Node, number>(); // NID, node ID
    const map_fID = new Map<FloughNode, number>(); // FID, physical FlowNode object ID
    const set_loopDetect = new Set<FloughNode>();
    const write = (s: string) => {
        writeIn(s + sys.newLine);
    };
    let nextTID = 1;
    let nextFID = 1;
    let nextNID = 1;
    let currentIndent = -1;
    const indent = () => {
        return " -".repeat(currentIndent);
    };
    const getText = (node: Node) => {
        let t = "";
        if ((node as any).getText && (node as any).getText()) t = (node as any).getText();
        else if ((node as any).escapedText) t = (node as any).escapedText;
        else if ((node as any).escapedName) t = (node as any).escapedName;
        t += ` [${node.pos},${node.end}]`;
        return t;
    };
    const doOne = (fn: FloughNode) => {
        const recursiveReference = set_loopDetect.has(fn);
        currentIndent++;
        write(indent() + "~~~~~~");
        let node: Node | undefined;
        let pekey = "";
        // let tIDmap: number | undefined; // text position ID ~? node id.  Can 2 diff nodes have same pos,end?
        // let fIDmap: number | undefined; // physical FlowNode object ID
        let utype: Type | undefined;
        if (!map_fID.has(fn)) {
            map_fID.set(fn, nextFID++);
        }
        if ((fn as any).node) {
            node = (fn as any).node as Node;
            const nid = getNodeId(node);
            nextNID++; // now only counting nodes
            if (!map_nID.get(node)) map_nID.set(node, nid);
            pekey = `${node.pos},${node.end}`;
            if (!map_peID.has(pekey)) map_peID.set(pekey, nextTID++);
            // tIDmap = map_peID.get(pekey);
            if (mapPeType?.has(pekey)) utype = mapPeType?.get(pekey); // should be by Node, not text position
        }
        // Flows with nodes that have same text range should have same ID. (edit: => TID)
        let idstr = `id: ${fn.id}, `;
        if ((fn as FloughLabel).branchKind) idstr += ` branchKind: ${(fn as FloughLabel).branchKind}, `;
        idstr += `FID: ${map_fID.get(fn)!}`;
        if (node && map_nID.has(node)) idstr += `, NID: [n${map_nID.get(node)}]`;
        if (pekey && map_peID.has(pekey)) idstr += `, TID: ${map_peID.get(pekey)}`;
        idstr += `, flags: ${formatFloughFlags(fn.flags)}`;
        if (recursiveReference) idstr += `, REPEAT REFERENCE!!!`;
        write(indent() + idstr);
        if (node) {
            const { pos, end } = node;
            //    const symbol = getSymbolAtLocation(node);
            //    const type = symbol ? getTypeOfSymbol(symbol) : undefined;
            //    , ${type? `type: ${typeToString(type)}`:""}
            let str = `${getText(node)}, (${pos},${end})`;
            //    if (symbol && symbol.id) str += `, sid: ${symbol.id}`;
            str += ", " + Debug.formatSyntaxKind(node.kind);
            write(indent() + str);
        }
        if (recursiveReference) {
            currentIndent--;
            return;
        }
        set_loopDetect.add(fn);
        if (utype) {
            write(indent() + `utype: ${checker.typeToString(utype)}`);
        }
        if (isFlowSwitchClause(fn)) {
            write(indent() + getText(fn.switchStatement));
            write(indent() + `clauseStart: ${fn.clauseStart}, clauseEnd: ${fn.clauseEnd}`);
        }
        else if (isFlowReduceLabel(fn)) {
            write(indent() + "target:");
            doOne(fn.target);
        }
        // else if (isFlowJoin(fn)){
        //     write(indent()+`joinNode: ${getText(fn.joinNode)}`);
        // }
        if (isFlowLabel(fn) && fn.originatingExpression) {
            write(indent() + `originatingExpression: ${Debug.formatSyntaxKind(fn.originatingExpression.kind)}, pos:${fn.originatingExpression.pos}, end:${fn.originatingExpression.end}`);
        }
        if ((fn as any).antecedents) {
            write(indent() + `antecedents:[${((fn as any).antecedents as FloughNode[]).length}]`);
            ((fn as any).antecedents as Readonly<FloughNode[]>).forEach(a => doOne(a));
        }
        if ((fn as FloughLabel).controlExits) {
            write(indent() + `controlExits:[${((fn as FloughLabel).controlExits as FloughNode[]).length}]`);
            ((fn as FloughLabel).controlExits as Readonly<FloughNode[]>).forEach(a => doOne(a));
        }
        if ((fn as any).antecedent) {
            write(indent() + "antecedent:");
            doOne((fn as any).antecedent);
        }
        // set_loopDetect.delete(fn);
        currentIndent--;
    };
    arrFlowNodes.forEach(fn => doOne(fn));
    write("");
    write(`# of FlowNodes:${nextFID - 1}`);
    write(`# of unique Nodes referenced:${nextNID - 1}`);
    write(`# of unique text positions referenced:${nextNID - 1}`);
    // write(`myMaxDepth:${myMaxDepth}`);
}

export function flowNodesToString(sourceFile: SourceFileWithFloughNodes, getFlowNodeId: (flow: FloughNode) => number, checker: TypeChecker): string {
    let contents = "";
    let write = (s: string) => {
        contents += s;
    };
    let False = false;
    False = false;
    if (False) write = console.log;
    // const write = (s: string)=>contents+=s;
    const endFlowNodes: FloughNode[] = [];
    // @ts-ignore
    const flowNodes: FloughNode[] = [];
    // endFlowNodes is at least not always easy to find, might not even exist in any container?
    const setv = new Set<FloughNode>();
    const visitorEfn = (n: Node) => {
        // if ((n as any).endFlowNode) endFlowNodes.push((n as any).endFlowNode);
        if ((n as any).flowNode) {
            const fn = (n as any).flowNode as FloughNode;
            if (!setv.has(fn) && !isFlowStart(fn)) {
                flowNodes.push(fn);
                setv.add(fn);
            }
        }
        if ((n as any).endFlowNode) {
            const fn = (n as any).endFlowNode as FloughNode;
            if (!setv.has(fn) && !isFlowStart(fn)) {
                flowNodes.push(fn);
                setv.add(fn);
            }
        }
        forEachChild(n, visitorEfn);
    };
    visitorEfn(sourceFile);
    const setAnte = new Set<FloughNode>();
    // const setNotAnte = new Set<FlowNode>();
    // some flow nodes are not referenced by any node
    const addAntesToSet = (f: FloughNode) => {
        if ((f as any).antecedent) {
            if (!setAnte.has((f as any).antecedent)) setAnte.add((f as any).antecedent);
        }
        if ((f as any).antecedents) {
            (f as any).antecedents.forEach((a: FloughNode) => {
                if (!setAnte.has(a)) setAnte.add(a);
            });
        }
    };
    flowNodes.forEach(f => addAntesToSet(f));
    // get antecedents of antecedents until no change
    let change = true;
    while (change) {
        const size = setAnte.size;
        setAnte.forEach(a => addAntesToSet(a));
        change = setAnte.size !== size;
    }
    setv.clear();
    const visitMark = (f: FloughNode) => {
        if (setv.has(f)) return;
        setv.add(f);
        if ((f as any).antecedent) {
            const a: FloughNode = (f as any).antecedent;
            getFlowNodeId(a);
            visitMark(a);
        }
        else if ((f as any).antecedents) {
            (f as any).antecedents.forEach((a: FloughNode) => {
                getFlowNodeId(a);
                visitMark(a);
            });
        }
    };
    flowNodes.forEach(f => {
        if (!setAnte.has(f)) {
            (f as any).isEndFlowNode = true;
            getFlowNodeId(f);
            endFlowNodes.push(f);
            visitMark(f);
        }
    });
    // endFlowNodes.forEach(f=>)
    // let n = node as ReadonlyTextRange & SourceFile;
    // while (true){
    //     if (n.endFlowNode && !isFlowStart(n.endFlowNode)){
    //         endFlowNodes.push(n.endFlowNode);
    //     }
    //     if (n.nextContainer) n = n.nextContainer as ReadonlyTextRange & SourceFile;
    //     else break;
    // }
    writeFlowNodesUp(write, endFlowNodes, /*mapPeType*/ undefined, checker);
    // ofilenameRoot = `tmp.${getBaseFileName(node.originalFileName)}.di${myDisableInfer?1:0}.${dbgFlowFileCnt}.flow`;
    // sys.writeFile(`${ofilenameRoot}.before.txt`, contents);
    return contents;
}


export function dbgFlowToString1(flow: FloughNode | undefined, _withAntecedentants = false): string {
    if (!flow) return "<undef>";
    const getFlowNodeId = (flow: FloughNode) => {
        return flow.id;
    };
    let str = "";
    str += `[f${getFlowNodeId(flow)}], ${formatFloughFlags(flow.flags)}, `;
    if ((flow as FloughLabel).branchKind) str += `branchKind:${((flow as FloughLabel).branchKind)}, `;
    if ((flow as any).node) str += IDebug.dbgs.nodeToString((flow as any).node as any as Node);
    return str;
};

function getFlowNodeId(flow: FloughNode): number {
    return flow.id ?? 0;
}
export function dbgFlowToString(flow: FloughNode | undefined, withAntecedants?: boolean): string {
    if (!flow) return "<undef>";
    let str = "";
    //if (isFlowWithNode(flow)) str += `[${(flow.node as any).getText()}, (${flow.node.pos},${flow.node.end})]`;
    str += `[f${getFlowNodeId(flow)}], ${formatFloughFlags(flow.flags)}, `;
    if (isFlowLabel(flow)){
        str += `branchKind: ${flow.branchKind}, `;
    }
    if (isFlowWithNode(flow)) str += IDebug.dbgs.nodeToString(flow.node);
    if (isFlowLabel(flow) && flow.originatingExpression){
        str += `originatingExpression: [n${flow.originatingExpression.id}]{pos:${flow.originatingExpression.pos},end:${flow.originatingExpression.end}}, `;
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
    if (isFlowLabel(flow) && flow.controlExits){
        str += `controlExits:`;
        str += "["+flow.controlExits.map(fn=>`${fn.id}`).join(",")+"]";
    }
    return str;
};
