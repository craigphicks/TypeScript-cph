/* eslint-disable no-double-space */
import {
    BranchKind, FloughFlags, FloughLabel, FloughNode, FlowExpressionStatement, SourceFileWithFloughNodes,
    FloughNodeBase,
    NodeWithFlough, FloughWithAntecedent, FloughWithAntecedents,
} from "./floughTsExtensions";

import {
    Debug,
} from "./debug";
import {
    isReturnStatement,
} from "./factory/nodeTests";
import {
    GroupForFlowKind,
    GroupForFlow,
    ConnectedGroupsGraphs,
    extraAsserts,
    GroupsForFlow,
    ContainerItem,
    FlowGroupLabelThen,
    FlowGroupLabelElse,
    FlowGroupLabelKind,
    FlowGroupLabelPostIf,
    FlowGroupLabelLoop,
    FlowGroupLabel,
    FlowGroupLabelLoopThen,
    FlowGroupLabelLoopElse,
    FlowGroupLabelBlock,
    FlowGroupLabelPostBlock,
} from "./floughGroup";
import {
    Node,
    SyntaxKind,
    //SourceFile,
    //TypeChecker,
    //FlowNode,
    //FlowLabel,
    //FlowFlags,
    FlowStart,
    FlowAssignment,
    FlowCall,
    FlowCondition,
    FlowSwitchClause,
    FlowArrayMutation,
    FlowReduceLabel,
    FlowContainer,
    LocalsContainer,
} from "./types";
import {
    isStatement,
} from "./utilitiesPublic";
import {
    FloughTypeChecker
} from "./floughTypedefs";
import { dbgFlowToString } from "./floughNodesDebugWrite"
import { IDebug } from "./mydebug"

function nodeIsExpressionForGrouping(node: Node) {
    const yes = [
        SyntaxKind.ArrayLiteralExpression,
        SyntaxKind.ObjectLiteralExpression,
        SyntaxKind.PropertyAccessExpression,
        SyntaxKind.ElementAccessExpression,
        SyntaxKind.CallExpression,
        SyntaxKind.NewExpression,
        // SyntaxKind.TaggedTemplateExpression,
        SyntaxKind.TypeAssertionExpression,
        SyntaxKind.ParenthesizedExpression,
        SyntaxKind.FunctionExpression,
        // SyntaxKind.ArrowFunction,
        SyntaxKind.DeleteExpression,
        SyntaxKind.TypeOfExpression,
        // SyntaxKind.VoidExpression,
        // SyntaxKind.AwaitExpression,
        SyntaxKind.PrefixUnaryExpression,
        SyntaxKind.PostfixUnaryExpression,
        SyntaxKind.BinaryExpression,
        SyntaxKind.ConditionalExpression,
        // SyntaxKind.TemplateExpression,
        SyntaxKind.YieldExpression,
        SyntaxKind.SpreadElement,
        // SyntaxKind.ClassExpression,
        SyntaxKind.OmittedExpression,
        SyntaxKind.ExpressionWithTypeArguments,
        SyntaxKind.AsExpression,
        SyntaxKind.NonNullExpression,
        // SyntaxKind.MetaProperty,
        // SyntaxKind.SyntheticExpression,
    ].includes(node.kind);
    return yes;
}

function getGroupForFlowKind(maximal: Node): GroupForFlowKind {
    // const maximalNode = orderedNodes[g.maximalIdx];
    // if (maximalNode.flowNode && maximalNode.flowNode )
    switch (maximal.parent.kind) {
        case SyntaxKind.IfStatement:
            return GroupForFlowKind.ifexpr;
        case SyntaxKind.WhileStatement:
        case SyntaxKind.DoStatement:
        case SyntaxKind.ForStatement:
        case SyntaxKind.ForOfStatement:
        case SyntaxKind.ForInStatement:
            return GroupForFlowKind.loop;
        default:
            return GroupForFlowKind.plain;
    }
}

function makeConnectedGroupsGraphs(orderedGroups: Readonly<GroupForFlow[]>, groupToAnteGroupMap: Readonly<Map<GroupForFlow, Set<GroupForFlow>>>): ConnectedGroupsGraphs {
    const arrGroupIndexToConnectGraph: number[] = new Array(orderedGroups.length).fill(-1);
    const arrGroupIndexToDependantCount: number[] = new Array(orderedGroups.length).fill(0);
    const arrConnectedGraphs: GroupForFlow[][] = [];
    for (const groupIdx in orderedGroups) {
        const group = orderedGroups[groupIdx];
        const anteGroups = groupToAnteGroupMap.get(group);
        anteGroups?.forEach(anteGroup => {
            arrGroupIndexToDependantCount[anteGroup.groupIdx]++;
        });
        if (!anteGroups || anteGroups.size === 0) {
            const graphIndex = arrConnectedGraphs.length;
            arrConnectedGraphs.push([group]);
            arrGroupIndexToConnectGraph[groupIdx] = graphIndex;
            if (IDebug.isActive(0)) group.dbgGraphIdx = graphIndex;
        }
        else {
            const anteGroup = anteGroups.values().next().value as GroupForFlow;
            const graphIndex = arrGroupIndexToConnectGraph[anteGroup.groupIdx];
            arrConnectedGraphs[graphIndex].push(group);
            arrGroupIndexToConnectGraph[groupIdx] = graphIndex;
            if (IDebug.isActive(0)) group.dbgGraphIdx = graphIndex;
        }
    }
    if (extraAsserts) {
        arrConnectedGraphs.forEach((graph, graphIndex) => {
            graph.forEach(group => {
                Debug.assert(arrGroupIndexToConnectGraph[group.groupIdx] === graphIndex);
                const anteGroups = groupToAnteGroupMap.get(group);
                if (!anteGroups) return;
                anteGroups?.forEach(anteGroup => {
                    Debug.assert(arrGroupIndexToConnectGraph[anteGroup.groupIdx] === graphIndex);
                });
            });
        });
    }
    return { arrConnectedGraphs, arrGroupIndexToDependantCount, arrGroupIndexToConnectGraph };
}

export function makeGroupsForFlow(sourceFile: SourceFileWithFloughNodes, checker: FloughTypeChecker): GroupsForFlow {
    const flowNodes: FloughNode[] = sourceFile.allFlowNodes ?? [];
    const nodesWithFlow: NodeWithFlough[] = sourceFile.allNodesWithFlowOneSourceFile ?? [];

    interface Container extends Node {
        nextContainer: Node | undefined;
    }
    const mapContainerToIndex = new Map<Container, number>();
    // const container: Container | undefined = sourceFile as Container;
    for (let container: Container | undefined = sourceFile as Container, i = 0; container; container = container.nextContainer as Container | undefined) {
        mapContainerToIndex.set(container, i++);
    }

    const precOrderCI: ContainerItem[] = [];
    for (let container: Container | undefined = sourceFile as Container; container; container = container.nextContainer as Container | undefined) {
        precOrderCI.push({ node: container, precOrderIdx: precOrderCI.length });
    }
    const arefCI = precOrderCI.map((_v, i) => i);
    const compareCIpos = (a: number, b: number) => {
        return precOrderCI[a].node.pos - precOrderCI[b].node.pos;
    };
    arefCI.sort(compareCIpos);
    // const posOrderCI = arefCI.map(idx=>precOrderCI[idx]);

    // const findPrecOrdCIIdx = (n: Node) => {
    //     let i = 0;
    //     for (; i<posOrderCI.length && posOrderCI[i].node.pos<=n.pos; i++);
    //     i--;
    //     while (i>0 && !(n.end <= posOrderCI[i].node.end)) i--;
    //     return posOrderCI[i].precOrderIdx;
    // };

    const setOfNodes = new Set<Node>();
    nodesWithFlow.forEach((n: NodeWithFlough) => {
        Debug.assert(isNodeWithFlow(n));
        const fn = n.flowNode;
        if (isFlowStart(fn)) return;
        if (!isStatement(n)) {
            setOfNodes.add(n);
        }
        else if (isReturnStatement(n) && n.expression) setOfNodes.add(n.expression);
    });
    flowNodes.forEach(f => {
        if (isFlowWithNode(f)) setOfNodes.add(f.node);
    });
    let tmpSetOfNodes0: Set<Node> = setOfNodes;
    let tmpSetOfNodes1 = new Set<Node>();
    while (tmpSetOfNodes0.size) {
        tmpSetOfNodes0.forEach(n => {
            if (nodeIsExpressionForGrouping(n.parent)) {
                tmpSetOfNodes1.add(n.parent);
            }
        });
        tmpSetOfNodes1.forEach(n => setOfNodes.add(n));
        tmpSetOfNodes0 = tmpSetOfNodes1;
        tmpSetOfNodes1 = new Set<Node>();
    }

    // setOfNodes.forEach(n=>{
    //     if (nodeIsExpressionForGrouping(n)){
    //         setOfNodes.add(n.parent);
    //     }
    //     // if (n.parent.kind===SyntaxKind.BinaryExpression){
    //     //     const pk = (n.parent as BinaryExpression).operatorToken.kind;
    //     //     if (pk===SyntaxKind.AmpersandAmpersandToken
    //     //     || pk===SyntaxKind.AmpersandAmpersandEqualsToken
    //     //     || pk===SyntaxKind.BarBarToken
    //     //     || pk===SyntaxKind.BarBarEqualsToken){
    //     //         setOfNodes.add(n.parent);
    //     //     }
    //     // }
    //     // else if (n.parent.kind===SyntaxKind.ConditionalExpression){
    //     //     setOfNodes.add(n.parent);
    //     // }
    // });
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const unorderedNodes = Array.from(setOfNodes.keys()) as Node[];
    const aref = unorderedNodes.map((_v, i) => i);

    const compare0 = (ai: number, bi: number) => {
        if (unorderedNodes[ai].pos < unorderedNodes[bi].pos) return -1;
        else if (unorderedNodes[ai].pos === unorderedNodes[bi].pos) {
            if (unorderedNodes[ai].end < unorderedNodes[bi].end) return -1;
            else if (unorderedNodes[ai].end === unorderedNodes[bi].end) {
                return 0;
            }
            else return 1;
        }
        else return 1;
    };
    aref.sort(compare0);
    const orderedNodes = aref.map(idx => unorderedNodes[idx]);

    const groups: GroupForFlow[] = [];
    let idxb = 0;
    let { pos: curpos, end: curend } = orderedNodes.length ? orderedNodes[0] : { pos: -1, end: -1 };
    let maximalIdx = 0;
    let maximalLength = curend - curpos;
    for (let fi = 1; fi < orderedNodes.length; fi++) {
        const on = orderedNodes[fi];
        const { pos, end } = on;
        if (pos > curpos && pos >= curend) {
            const maximal = orderedNodes[maximalIdx];
            const kind = getGroupForFlowKind(maximal);
            const group: GroupForFlow = {
                kind,
                idxb,
                idxe: fi,
                maximalIdx,
                // precOrdContainerIdx: findPrecOrdCIIdx(orderedNodes[maximalIdx]),
                groupIdx: -1,
                anteGroupLabels: [], // referencingGroupIdxs:[],
            };
            groups.push(group);
            idxb = fi;
            curpos = pos;
            curend = end;
            maximalIdx = fi;
            maximalLength = curend - curpos;
        }
        else {
            if (end - pos >= maximalLength) {
                maximalIdx = fi;
                maximalLength = end - pos;
            }
            if (end > curend) {
                curend = end;
            }
        }
    }
    if (orderedNodes.length) {
        // const precOrdCIIdx = findPrecOrdCIIdx(orderedNodes[maximalIdx]);
        const maximal = orderedNodes[maximalIdx];
        const kind = getGroupForFlowKind(maximal);
        const group: GroupForFlow = {
            kind,
            idxb,
            idxe: orderedNodes.length,
            maximalIdx,
            // precOrdContainerIdx: precOrdCIIdx,
            groupIdx: -1,
            anteGroupLabels: [], // referencingGroupIdxs:[]
        };
        groups.push(group);
    }
    const arefGroups = groups.map((_v, i) => i);
    /**
     * @param a
     * @param b
     * @returns
     */
    const compareGroups = (a: number, b: number) => {
        /**
         * Use `pos` order of each groups maximal node.
         */
        const apos = orderedNodes[groups[a].maximalIdx].pos;
        const bpos = orderedNodes[groups[b].maximalIdx].pos;
        return apos - bpos;
        // return groups[a].precOrdContainerIdx - groups[b].precOrdContainerIdx;
    };
    arefGroups.sort(compareGroups);
    const orderedGroups = arefGroups.map(idx => groups[idx]);

    /**
     * Create Node to GroupForFlow map
     */
    const nodeToGroupMap = new Map<Node, GroupForFlow>();
    orderedGroups.forEach(g => {
        for (let idx = g.idxb; idx !== g.idxe; idx++) {
            nodeToGroupMap.set(orderedNodes[idx], g);
        }
    });

    /**
     * Set group index and
     * Find the flow linked groups for each group.
     */
    const groupToSetOfFlowMap = new Map<GroupForFlow, Set<FloughNode>>();
    const flowToOriginatingGroupIdx = new Map<FloughNode, number>();
    orderedGroups.forEach((g, groupIdx) => {
        g.groupIdx = groupIdx;
        const set = new Set<FloughNode>();
        const { pos: gpos, end: gend } = orderedNodes[g.maximalIdx];
        for (let idx = g.idxb; idx !== g.idxe; idx++) {
            const node = orderedNodes[idx];
            if (isNodeWithFlow(node)) {
                const fn = node.flowNode;
                flowToOriginatingGroupIdx.set(fn, groupIdx);
                if (isFlowWithNode(fn)) {
                    const nodeOfFlow = fn.node;
                    if (nodeOfFlow.pos >= gpos && nodeOfFlow.pos < gend) {
                        continue; // filter in-group references
                    }
                    set.add(fn); // nodeful flow
                }
                else {
                    if (isFlowWithAntecedents(fn) && fn.antecedents.length === 1) {
                        let tmpfn = fn.antecedents[0];
                        while (!isFlowWithNode(tmpfn) && isFlowWithAntecedents(tmpfn) && tmpfn.antecedents.length === 1) tmpfn = tmpfn.antecedents[0];
                        if (isFlowWithNode(tmpfn) && tmpfn.node.pos >= gpos && tmpfn.node.pos < gend) {
                            continue; // a chain of flow that leads back to the same-group, i.e., a same group reference.
                        }
                    }
                    set.add(fn); // non-nodeful flow
                }
            }
        }
        if (set.size) {
            groupToSetOfFlowMap.set(g, set);
        }
    });

    /**
     * Set localContainers for each group
     */
    orderedGroups.forEach((g, groupIdx) => {
        let node = orderedNodes[g.maximalIdx];
        for (; node; node = node.parent) {
            if ((node as LocalsContainer).locals) {
                g.localsContainer = node as LocalsContainer;
                break;
            }
        }
    });

    /**
     * Mark which groups are referenced by true/false conditions
     */
    {
        flowNodes.forEach(fn => {
            checker.getFlowNodeId(fn);
        });
    }
    // const setOfFlowLoop = new Set<FlowWithAntecedents>();
    const groupToAnteGroupMap = new Map<GroupForFlow, Set<GroupForFlow>>();
    orderedGroups.forEach(g => {
        const origSetOfFlow = groupToSetOfFlowMap.get(g);
        if (!origSetOfFlow) return;
        const setOfGroup = new Set<GroupForFlow>();
        const setOfAnteGroup = new Set<GroupForFlow>(); // determined through previousAnteGroupIdx and FlowGroupLabel's
        const filteredSetOfFlow = new Set<FloughNode>();
        // const anteLabels: GroupForFlow["anteLabels"] = {};
        // let hadAnteLabel = false;
        const dbgSetOfUnhandledFlowLabel = new Set<FloughLabel>();
        origSetOfFlow.forEach(fn => {
            if (isFlowStart(fn)) return;
            if (isFlowWithNode(fn)) {
                const groupToAdd = nodeToGroupMap.get(fn.node);
                if (!groupToAdd) {
                    Debug.fail();
                }
                if (groupToAdd === g) {
                    Debug.fail();
                }
                setOfGroup.add(groupToAdd);
                Debug.assert(g.previousAnteGroupIdx === undefined);
                g.previousAnteGroupIdx = groupToAdd.groupIdx;
                setOfAnteGroup.add(groupToAdd);
                filteredSetOfFlow.add(fn); // TODO: we need only the maximal node in flowGroupingInfer.ts
            }
            else {
                // flow without node
                // branches can lead to branches or flow with node.
                ////////////////////////////////////////////////////////////////////////////////////////
                if (isFlowLabel(fn)) {
                    // const flowBranchLoopResolve = (fn: FlowLabel):
                    const flowBranchThenElseToFlowGroupLabelThenElse = (fn: FloughLabel): FlowGroupLabelThen | FlowGroupLabelElse => {
                        Debug.assert(fn.antecedents);
                        Debug.assert(fn.antecedents.length >= 1); // Turns out fn.antecedents[1], if exists, leads to redundent duplicate oppostite logic
                        let fnante = fn.antecedents[0];
                        while (!isFlowWithNode(fnante)) {
                            Debug.assert(isFlowLabel(fnante) && fnante.antecedents?.length === 1);
                            fnante = fnante.antecedents[0];
                        }
                        Debug.assert(isFlowWithNode(fnante));

                        if (!!(fn.flags & FloughFlags.TrueCondition)) Debug.assert(fn.branchKind === BranchKind.then);
                        if (!!(fn.flags & FloughFlags.FalseCondition)) Debug.assert(fn.branchKind === BranchKind.else);

                        const anteg = nodeToGroupMap.get(fnante.node);
                        Debug.assert(anteg && anteg !== g);
                        const fglkind = fn.branchKind === BranchKind.then ? FlowGroupLabelKind.then
                            : BranchKind.else ? FlowGroupLabelKind.else
                            : Debug.fail("unexpected");
                        setOfAnteGroup.add(anteg);
                        return { kind: fglkind, ifGroupIdx: anteg.groupIdx };
                    }; // flowBranchThenElseToFlowGroupLabelThenElse
                    const flowBranchPostIfResolve = (fn: FloughLabel): FlowGroupLabelPostIf => {
                        //  fn.antecedents?.length may be less than 2, c.f., while(x){ if (x) continue; }
                        Debug.assert(!fn.antecedents || fn.antecedents.length <= 2);
                        const originatingGroupIdx = nodeToGroupMap.get(fn.originatingExpression!)!.groupIdx;
                        type ArrAnteElement = FlowGroupLabelPostIf["arrAnte"]["0"];
                        const arrAnte: ArrAnteElement[] = [];
                        if (fn.antecedents) {
                            for (const antecedent of fn.antecedents) {
                                const x = flowNodeResolve(antecedent)!;
                                Debug.assert(x);
                                arrAnte.push(x as ArrAnteElement);
                            }
                        }
                        return {
                            kind: FlowGroupLabelKind.postIf,
                            arrAnte,
                            originatingGroupIdx,
                        };
                    };
                    const flowBranchPreWhileLoopResolve = (fn: FloughLabel): FlowGroupLabelLoop => {
                        Debug.assert(fn.flags & FloughFlags.LoopLabel && fn.branchKind === BranchKind.preWhileLoop);
                        Debug.assert(fn.antecedents && fn.antecedents.length >= 1);
                        const antePrevious: FlowGroupLabel = flowNodeResolve(fn.antecedents[0])!;
                        Debug.assert(antePrevious);
                        const arrAnteContinue: FlowGroupLabel[] = fn.antecedents.slice(1).map(fna => {
                            const fglab = flowNodeResolve(fna)!;
                            Debug.assert(fglab);
                            return fglab;
                        }); // .filter(x=>!!x);
                        const ret: FlowGroupLabelLoop = {
                            kind: FlowGroupLabelKind.loop,
                            antePrevious,
                            arrAnteContinue,
                        };
                        if (fn.controlExits) {
                            const arrControlExit: FlowGroupLabel[] = fn.controlExits?.map(fnce => flowNodeResolve(fnce)).filter(x => !!x) as FlowGroupLabel[];
                            ret.arrControlExit = arrControlExit;
                        }
                        return ret;
                    };
                    const flowBranchPreWhileBodyResolve = (fn: FloughLabel): FlowGroupLabelLoopThen => {
                        Debug.assert(fn.flags & FloughFlags.BranchLabel && fn.branchKind === BranchKind.preWhileBody);
                        Debug.assert(fn.antecedents && fn.antecedents.length === 1);
                        Debug.assert(fn.antecedents[0].flags & FloughFlags.TrueCondition && isFlowWithNode(fn.antecedents[0]));
                        const loopGroupIdx = nodeToGroupMap.get(fn.antecedents[0].node)!.groupIdx;
                        setOfAnteGroup.add(orderedGroups[loopGroupIdx]);
                        return {
                            kind: FlowGroupLabelKind.loopThen,
                            loopGroupIdx,
                        };
                    };
                    const flowBranchPostWhileLoopResolve = (fn: FloughLabel): FlowGroupLabelLoopElse => {
                        Debug.assert(fn.flags & FloughFlags.BranchLabel && fn.branchKind === BranchKind.postWhileLoop);
                        Debug.assert(fn.antecedents && fn.antecedents.length >= 1);
                        Debug.assert(fn.antecedents[0].flags & FloughFlags.FalseCondition && isFlowWithNode(fn.antecedents[0]));
                        const loopGroup = nodeToGroupMap.get(fn.antecedents[0].node)!;
                        const loopGroupIdx = loopGroup.groupIdx;
                        setOfAnteGroup.add(loopGroup);
                        const arrAnteBreak: FlowGroupLabel[] = fn.antecedents.slice(1).map(fna => {
                            const fglab = flowNodeResolve(fna)!;
                            Debug.assert(fglab);
                            return fglab;
                        });
                        Debug.assert(orderedGroups[loopGroupIdx].postLoopGroupIdx === undefined);
                        orderedGroups[loopGroupIdx].postLoopGroupIdx = g.groupIdx;
                        if (g.arrPreLoopGroupsIdx === undefined) g.arrPreLoopGroupsIdx = [loopGroupIdx];
                        else g.arrPreLoopGroupsIdx.push(loopGroupIdx);
                        return {
                            kind: FlowGroupLabelKind.postLoop,
                            loopGroupIdx,
                            arrAnteBreak,
                        };
                    };
                    const flowNodeResolve = (fn: FloughNode): FlowGroupLabel | undefined => {
                        if (isFlowStart(fn)) {
                            return {
                                kind: FlowGroupLabelKind.start,
                            };
                        }
                        if (isFlowWithNode(fn)) {
                            const groupToAdd = nodeToGroupMap.get(fn.node);
                            Debug.assert(groupToAdd);
                            setOfAnteGroup.add(groupToAdd);
                            return {
                                kind: FlowGroupLabelKind.ref,
                                groupIdx: groupToAdd.groupIdx,
                            };
                        }
                        Debug.assert(isFlowLabel(fn));
                        switch (fn.branchKind) {
                            case undefined:
                                Debug.fail("not yet implemented, branchKind is undefined");
                                break;
                            case BranchKind.none:
                                if (isFlowWithAntecedents(fn)) {
                                    if (fn.antecedents.length === 0) {
                                        return undefined;
                                        // ignore
                                    }
                                    else if (fn.antecedents.length === 1) {
                                        // pass-through (c.f. _caxnc-whileLoop-0034, outer loop postLoop antecedent of a BranchKind.none)
                                        return flowNodeResolve(fn.antecedents[0]);
                                    }
                                    else {
                                        dbgSetOfUnhandledFlowLabel.add(fn);
                                        return undefined;
                                        // Debug.fail("unexpected");
                                    }
                                }
                                Debug.fail(`unexpected, branch kind 'none' but no 'antecedencts' member`);
                                break;
                            case BranchKind.else:
                            case BranchKind.then:
                                return flowBranchThenElseToFlowGroupLabelThenElse(fn);
                                break;
                            case BranchKind.postIf:
                                return flowBranchPostIfResolve(fn);
                                break;
                            case BranchKind.preWhileLoop:
                                return flowBranchPreWhileLoopResolve(fn);
                                break;
                            case BranchKind.preWhileBody:
                                return flowBranchPreWhileBodyResolve(fn);
                                break;
                            case BranchKind.postWhileLoop:
                                {
                                    const fglab = flowBranchPostWhileLoopResolve(fn);
                                    /**
                                     * Important side effect - set the postLoopGroupIdx within the loop group.
                                     */
                                    const loopGroup = orderedGroups[fglab.loopGroupIdx];
                                    if (loopGroup.anteGroupLabels.length) {
                                        Debug.assert(loopGroup.anteGroupLabels.length === 1); // loopElseGroupIdx = g.groupIdx;
                                        Debug.assert(loopGroup.anteGroupLabels[0].kind === FlowGroupLabelKind.loop);
                                        loopGroup.anteGroupLabels[0].loopElseGroupIdx = g.groupIdx;
                                    }
                                    return fglab;
                                }
                                break;
                            case BranchKind.block: {
                                Debug.assert(fn.antecedents?.length === 1);
                                const ante = flowNodeResolve(fn.antecedents[0]);
                                Debug.assert(ante);
                                const originatingBlock = fn.originatingExpression;
                                Debug.assert(originatingBlock);
                                const r: FlowGroupLabelBlock = {
                                    kind: FlowGroupLabelKind.block,
                                    ante,
                                    originatingBlock,
                                };
                                return r;
                            }
                            case BranchKind.postBlock: {
                                Debug.assert(fn.antecedents?.length === 1);
                                const ante = flowNodeResolve(fn.antecedents[0]);
                                Debug.assert(ante);
                                const originatingBlock = fn.originatingExpression;
                                Debug.assert(originatingBlock);
                                const r: FlowGroupLabelPostBlock = {
                                    kind: FlowGroupLabelKind.postBlock,
                                    ante,
                                    originatingBlock,
                                };
                                return r;
                            }
                            default:
                                dbgSetOfUnhandledFlowLabel.add(fn); // TODO: remove this post dev
                                return undefined;
                        }
                    }; // flowBranchResolve
                    // if (fn.branchKind!==BranchKind.none) {
                    const fglab: FlowGroupLabel | undefined = flowNodeResolve(fn);
                    if (fglab) g.anteGroupLabels.push(fglab);
                    // }
                }
            }
        });
        g.dbgSetOfUnhandledFlow = dbgSetOfUnhandledFlowLabel;
        // check that setOfAnteGroup === setOfGroup, eventually kill setOfGroup
        setOfGroup.forEach(g => Debug.assert(setOfAnteGroup.has(g)));
        // If turns out setOfGroup is a subset of setOfAnteGroup in case of postIf labels.
        // setOfAnteGroups is the correct.
        // setOfAnteGroup.forEach(g=>Debug.assert(setOfGroup.has(g)));

        // if (setOfGroup.size) groupToAnteGroupMap.set(g,setOfGroup);
        groupToAnteGroupMap.set(g, setOfAnteGroup);
        groupToSetOfFlowMap.set(g, filteredSetOfFlow);
    });

    const retval: GroupsForFlow = {
        orderedGroups,
        posOrderedNodes: orderedNodes,
        precOrderContainerItems: precOrderCI,
        // groupToSetOfFlowMap,
        groupToAnteGroupMap,
        nodeToGroupMap,
        connectedGroupsGraphs: makeConnectedGroupsGraphs(orderedGroups, groupToAnteGroupMap),
        // dbgFlowToOriginatingGroupIdx: flowToOriginatingGroupIdx,
    };
    if (IDebug.isActive(0)) {
        retval.dbgFlowToOriginatingGroupIdx = flowToOriginatingGroupIdx;
    }
    return retval;
}

// interface NodeWithFlow extends Node {
//     flowNode: FloughNode;
// }
export function isNodeWithFlow(n: Node): n is NodeWithFlough {
    return !!(n as FlowContainer).flowNode;
}

export function isFlowStart(fn: FloughNode | undefined): fn is FlowStart {
    return !!fn && !!(fn.flags & FloughFlags.Start);
}
export function isFlowLabel(fn: FloughNode | undefined): fn is FloughLabel {
    return !!fn && !!(fn.flags & FloughFlags.Label);
}
export function isFlowBranch(fn: FloughNode | undefined): fn is FloughLabel {
    return !!fn && !!(fn.flags & FloughFlags.BranchLabel);
}
export function isFlowLoop(fn: FloughNode | undefined): fn is FloughLabel {
    return !!fn && !!(fn.flags & FloughFlags.LoopLabel);
}
export function isFlowAssignment(fn: FloughNode | undefined): fn is FlowAssignment {
    return !!fn && !!(fn.flags & FloughFlags.Assignment);
}
export function isFlowCall(fn: FloughNode | undefined): fn is FlowCall {
    return !!fn && !!(fn.flags & FloughFlags.Call);
}
export function isFlowCondition(fn: FloughNode | undefined): fn is FlowCondition {
    return !!fn && !!(fn.flags & FloughFlags.Condition);
}
export function isFlowSwitchClause(fn: FloughNode | undefined): fn is FlowSwitchClause {
    return !!fn && !!(fn.flags & FloughFlags.SwitchClause);
}
export function isFlowArrayMutation(fn: FloughNode | undefined): fn is FlowArrayMutation {
    return !!fn && !!(fn.flags & FloughFlags.ArrayMutation);
}
export function isFlowReduceLabel(fn: FloughNode | undefined): fn is FlowReduceLabel {
    return !!fn && !!(fn.flags & FloughFlags.ReduceLabel);
}
export function isFlowExpressionStatement(fn: FloughNode): fn is FlowExpressionStatement & FloughNode {
    return !!fn && !!(fn.flags & FloughFlags.ExpressionStatement);
}
// export function isFlowJoin(fn: FlowNode): fn is FlowJoin {
//     return !!fn &&  !!(fn.flags & FlowFlags.Join);
// }
export function isFlowWithNode(fn: FloughNode | undefined): fn is FloughNode & { node: Node; } {
    return !!fn && !!(fn as any).node;
}
export function isFlowConditionBoolean(fn: FlowCondition): boolean {
    return !!(fn.flags & (FloughFlags.TrueCondition | FloughFlags.FalseCondition));
}
export function getFlowConditionBoolean(fn: FlowCondition): boolean {
    return !!(fn.flags & FloughFlags.TrueCondition) ? true : !!(fn.flags & FloughFlags.FalseCondition) ? false : (() => {
        Debug.assert(false, "getFlowConditionBoolean neither true nor false, qualify with isFlowConditionBoolean");
        return true;
    })();
}
// interface FlowWithAntecedent extends FlowNodeBase {
//     antecedent: FloughNode;
// }
/* @ ts-expect-error */
function isFlowWithAntecedent(fn: FloughNodeBase): fn is FloughWithAntecedent {
    return !!(fn as any).antecedent;
}
// interface FlowWithAntecedents extends FlowNodeBase {
//     antecedents: FloughNode[];
// }
/* @ ts-expect-error */
function isFlowWithAntecedents(fn: FloughNodeBase): fn is FloughWithAntecedents {
    return !!(fn as any).antecedents;
}
export function getFlowAntecedents(fn: FloughNodeBase): FloughNode[] {
    if (isFlowWithAntecedent(fn)) {
        if (isFlowWithAntecedents(fn)) return [fn.antecedent, ...fn.antecedents];
        else return [fn.antecedent];
    }
    else if (isFlowWithAntecedents(fn)) return fn.antecedents;
    else return [];
}

export function dbgFlowGroupLabelToStrings(fglab: FlowGroupLabel, checker: FloughTypeChecker): string[] {
    const as: string[] = [`kind:${fglab.kind}`];
    switch (fglab.kind) {
        case FlowGroupLabelKind.ref:
            as.push(`groupIdx:${fglab.groupIdx}`);
            break;
        case FlowGroupLabelKind.then:
        case FlowGroupLabelKind.else:
            as.push(`ifGroupIdx:${fglab.ifGroupIdx}`);
            break;
        case FlowGroupLabelKind.postIf:
            as.push(`originatingGroupIdx:${fglab.originatingGroupIdx}`);
            fglab.arrAnte.forEach((ante, anteidx) => {
                as.push(...dbgFlowGroupLabelToStrings(ante, checker).map(s => `    ante[${anteidx}]: ` + s));
            });
            // as.push(`anteThen:`);
            // as.push(...dbgFlowGroupLabelToStrings(fglab.anteThen, dbgs, checker).map(s=>"    "+s));
            // as.push(`anteElse:`);
            // as.push(...dbgFlowGroupLabelToStrings(fglab.anteElse, dbgs, checker).map(s=>"    "+s));
            break;
        case FlowGroupLabelKind.loop:
            as.push(`antePrevious:`);
            as.push(...dbgFlowGroupLabelToStrings(fglab.antePrevious, checker).map(s => "    " + s));
            as.push(`arrAnteContinue:`);
            fglab.arrAnteContinue.forEach((fgac, fgacidx) => {
                as.push(...dbgFlowGroupLabelToStrings(fgac, checker).map(s => `    [${fgacidx}]  ${s}`));
            });
            if (fglab.arrControlExit) {
                as.push(`arrControlExits:`);
                fglab.arrControlExit.forEach((fgac, fgacidx) => {
                    as.push(...dbgFlowGroupLabelToStrings(fgac, checker).map(s => `    [${fgacidx}]  ${s}`));
                });
            }
            break;
        case FlowGroupLabelKind.loopThen:
            as.push(`loopGroupIdx: ${fglab.loopGroupIdx}`);
            break;
        case FlowGroupLabelKind.postLoop:
            as.push(`loopGroupIdx: ${fglab.loopGroupIdx}`);
            as.push(`arrAnteBreak:`);
            fglab.arrAnteBreak.forEach((fgac, fgacidx) => {
                as.push(...dbgFlowGroupLabelToStrings(fgac, checker).map(s => `    [${fgacidx}]  ${s}`));
            });
            break;
        case FlowGroupLabelKind.block:
        case FlowGroupLabelKind.postBlock:
            as.push(`originatingBlock: [n${fglab.originatingBlock.id}](${fglab.originatingBlock.pos},${fglab.originatingBlock.end})`);
            as.push(...dbgFlowGroupLabelToStrings(fglab.ante, checker).map(s => `ante: ${s}`));
            break;
            // as.push( fglab.originatingBlock
        case FlowGroupLabelKind.none:
        case FlowGroupLabelKind.start:
            break;
        default:
            // @ts-ignore
            Debug.fail(`fglab.kind:${fglab.kind}: not yet implemented`);
    }
    return as;
}

export function dbgGroupsForFlowToStrings(
    gff: GroupsForFlow,
    checker: FloughTypeChecker,
): string[] {
    const astr: string[] = [];
    gff.orderedGroups.forEach((g, i) => {
        const maxnode = gff.posOrderedNodes[g.maximalIdx];
        // const maxnodecont = gff.precOrderContainerItems[g.precOrdContainerIdx];
        astr.push(`groups[${i}]: {kind, ${g.kind}, maxnode: ${IDebug.dbgs.nodeToString(maxnode)}}`);
        for (let idx = g.idxb; idx !== g.idxe; idx++) {
            const node = gff.posOrderedNodes[idx];
            let str = `groups[${i}]:  [${idx}]: node: ${IDebug.dbgs.nodeToString(node)}`;
            if (isNodeWithFlow(node)) str += `, flow: ${dbgFlowToString(node.flowNode, /**/ true)}`;
            astr.push(str);
        }
        // const setOfFlow = gff.groupToSetOfFlowMap.get(g);
        // astr.push(`groups[${i}]:  setOfFlow.size===${setOfFlow?.size??0}`);
        // if (setOfFlow) {
        //     setOfFlow.forEach(fn=>{
        //         astr.push(`groups[${i}]:    flow: ${dbgFlowToString(fn)}`);
        //     });
        // }
        const setOfAnteGroups = gff.groupToAnteGroupMap.get(g);
        let str = `groups[${i}]:  setOfAnteGroups.size===${setOfAnteGroups?.size ?? 0}, [`;
        astr.push(`groups[${i}]:  setOfAnteGroups.size===${setOfAnteGroups?.size ?? 0}`);
        if (setOfAnteGroups) {
            setOfAnteGroups.forEach(anteg => {
                str += `${anteg.groupIdx},`;
                // astr.push(`groups[${i}]:    anteGroupIdx: ${anteg.groupIdx}`);
            });
        }
        str += "]";
        astr.push(str);
        // if (g.anteLabels){
        //     for (const k in g.anteLabels){
        //         astr.push(`groups[${i}]:    anteLabels[${k}]: ${dbgFlowToString(g.anteLabels[k as keyof GroupForFlow["anteLabels"]], /*withAntecedants*/ true)}`);
        //     }
        // }
        if (g.previousAnteGroupIdx !== undefined) {
            astr.push(`groups[${i}]:    previousAnteGroupIdx:${g.previousAnteGroupIdx}`);
        }
        g.anteGroupLabels.forEach((fglab, idx) => {
            dbgFlowGroupLabelToStrings(fglab, checker).forEach(s => {
                astr.push(`groups[${i}]:    anteGroupLabels[${idx}]: ${s}`);
            });
        });
        if (g.postLoopGroupIdx) astr.push(`groups[${i}]:    postLoopGroupIdx:${g.postLoopGroupIdx}`);
        if (g.arrPreLoopGroupsIdx) astr.push(`groups[${i}]:    arrPreLoopGroupIdx:[${g.arrPreLoopGroupsIdx.map(idx => `${idx}`).join(",")}]`);
        if (g.dbgSetOfUnhandledFlow) {
            g.dbgSetOfUnhandledFlow.forEach((fnlab, fnlabidx) => {
                astr.push(`groups[${i}]:    dbgSetOfUnhandledFlow[${fnlabidx}]: ${dbgFlowToString(fnlab, /*withAntecedents*/ true)}`);
            });
        }
        if (g.dbgGraphIdx !== undefined) {
            astr.push(`groups[${i}]:    dbgGraphIdx:${g.dbgGraphIdx}`);
        }
    });

    gff.precOrderContainerItems.forEach((ci, i) => {
        astr.push(`containerItems[${i}]: node:${IDebug.dbgs.nodeToString(ci.node)}`);
    });
    gff.posOrderedNodes.forEach((node, i) => {
        astr.push(`[${i}]: node:${IDebug.dbgs.nodeToString(node)}`);
    });
    return astr;
}
