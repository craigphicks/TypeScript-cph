namespace ts {
    interface AllFlowNodes  {
        flowNodes: FlowNode[];
        endFlowNodes?: FlowNode[];
    };

    export enum FlowNodeGroupKind {
        Nodeless="Nodeless",
        PlainNodeful="PlainNodeful",
        IfBranch="IfBranch",
        IfPair="IfPair"
    };

    export interface FlowNodeGroupBase {
        kind: FlowNodeGroupKind,
        //ordinal: number;
    }

    /**
     * Note: All FlowNode with NodeFlags.Start become a NodelessFlowNodeGroup even if they have a node.
     */
    export interface NodelessFlowNodeGroup extends FlowNodeGroupBase {
        kind: FlowNodeGroupKind.Nodeless;
        ordinal: number;
        flow: FlowNode;
        antecedentGroups: Set<FlowNodeGroup>;
    };
    export interface PlainNodefulFlowNodeGroup extends FlowNodeGroupBase {
        kind: FlowNodeGroupKind.PlainNodeful;
        ordinal: number;
        maximal: FlowNode & {node: Node};
        maximalIdx: number,
        //group?: Set<FlowNode>;
        // indices into flowNodeWithNodesSorted
        idxb: number,
        idxe: number,
        //disclude: number[],
        ifPair?: IfPairFlowNodeGoup;
        antecedentGroups: Set<FlowNodeGroup>;
    };

    /**
     * The true and false IfBranchFlowNodeGroup-s are seperate from IfPairFlowNodeGoup because
     * the precedents of true and false differ from each other, yet they share the same antecedents.
     */
    export interface IfBranchFlowNodeGroup extends FlowNodeGroupBase {
        kind: FlowNodeGroupKind.IfBranch;
        true: boolean;
        flow: FlowNode & {node: Node}; // flow.node is a maximal node of all the nodes in IfPairOfGroups
        ifPair: IfPairFlowNodeGoup;
    };
    export interface IfPairFlowNodeGoup extends FlowNodeGroupBase {
        kind: FlowNodeGroupKind.IfPair;
        ordinal: number;
        true: IfBranchFlowNodeGroup;
        false: IfBranchFlowNodeGroup;
        maximalNode: Node; // the node shared by both true and false flows
        idxb: number;
        idxe: number; // doesn't include the maximals
        antecedentGroups: Set<FlowNodeGroup>;
    };

    // export interface FlowNodeGroupWithAntecedentGroups {
    //     kind: FlowNodeGroupKind.IfPair | FlowNodeGroupKind.PlainNodeful | FlowNodeGroupKind.Nodeless
    //     antecedentGroups: Set<FlowNodeGroup>;
    // }

    export type NodefulFlowNodeGroup = PlainNodefulFlowNodeGroup | IfPairFlowNodeGoup | IfBranchFlowNodeGroup;
    export type FlowNodeGroup = NodelessFlowNodeGroup | NodefulFlowNodeGroup;
    export type FlowNodeGroupWithAntecedentGroups = IfPairFlowNodeGoup | PlainNodefulFlowNodeGroup | NodelessFlowNodeGroup;
    export interface GroupedFlowNodes {
        flowNodeWithNodesSorted: FlowNode[];
        groups: NodefulFlowNodeGroup[];
        nodelessGroups: NodelessFlowNodeGroup[];
        arrIfPairOfGroups: IfPairFlowNodeGoup[];
        flowNodeToGroupMap: ESMap<FlowNode, FlowNodeGroup>;
        nodeToFlowGroupMap: ESMap<Node, NodefulFlowNodeGroup>;
        sourceFile: SourceFile;
        dbgCreationTimeMs?: bigint;
        allFlowNodes?: AllFlowNodes;
    };
    interface FlowWithNA extends FlowNodeBase {
        node: Node;
        antecedent?: FlowNode;
        antecedents?: FlowNode[];
    };


    export function isNodelessFlowNodeGroup(x: FlowNodeGroup): x is NodelessFlowNodeGroup {
        return x.kind===FlowNodeGroupKind.Nodeless;
    }
    export function isPlainNodefulFlowNodeGroup(x: FlowNodeGroup): x is PlainNodefulFlowNodeGroup {
        return x.kind===FlowNodeGroupKind.PlainNodeful;
    }
    export function isIfBranchFlowNodeGroup(x: FlowNodeGroup): x is IfBranchFlowNodeGroup {
        return x.kind===FlowNodeGroupKind.IfBranch;
    }
    export function isIfPairFlowNodeGroup(x: FlowNodeGroup): x is IfPairFlowNodeGoup {
        return x.kind===FlowNodeGroupKind.IfPair;
    }
    export function isNodefulFlowNodeGroup(x: FlowNodeGroup): x is NodefulFlowNodeGroup {
        return !isNodelessFlowNodeGroup(x);
    }

    export function getFlowGroupMaximalNode(group: NodefulFlowNodeGroup): Node {
        if (isPlainNodefulFlowNodeGroup(group)) return group.maximal.node;
        else if (isIfBranchFlowNodeGroup(group)) return group.flow.node;
        else if (isIfPairFlowNodeGroup(group)) return group.maximalNode;
        Debug.assert(!isNodelessFlowNodeGroup(group));
        Debug.fail();
    }
    function hasOwnAntecedents(x: FlowNodeGroup): x is FlowNodeGroupWithAntecedentGroups {
        return !!(x as FlowNodeGroupWithAntecedentGroups).antecedentGroups;
    }

    export function getAntecedentGroups(group: FlowNodeGroup): Readonly<Set<FlowNodeGroup>>{
        if (hasOwnAntecedents(group)) return group.antecedentGroups;
        else if (isIfBranchFlowNodeGroup(group)){
            return group.ifPair.antecedentGroups;
        }
        Debug.fail();
    }
    export function getOrdinal(group: FlowNodeGroup): number{
        if (hasOwnAntecedents(group)) return group.ordinal;
        else if (isIfBranchFlowNodeGroup(group)){
            return group.ifPair.ordinal;
        }
        Debug.fail();
    }

    /**
     * OBSOLETE - all FlowNodes are pushed into allFlowNodes array during bind, much easier.
     * Collect all flow nodes in a sourceFile.
     * "flowNodes" is all the flow nodes.
     * "endFlowNodes" are all the flow node which are the antecedent of no other flow node
     * @param sourceFile
     * @param getFlowNodeId
     * @returns {
     *  flowNodes,
     *  endFlowNodes
     * }
     */
    // export function findFlowNodes(
    //     sourceFile: SourceFile,
    //     getFlowNodeId: ((n: FlowNode) => number)
    //     ): AllFlowNodes {
    //     const endFlowNodes: FlowNode[]=[];
    //     const flowNodes: FlowNode[]=[];
    //     // endFlowNodes is at least not always easy to find, might not even exist in any container?
    //     const setv = new Set<FlowNode>();
    //     const visitorEfn = (n: Node) => {
    //         //if ((n as any).endFlowNode) endFlowNodes.push((n as any).endFlowNode);
    //         if ((n as any).flowNode){
    //             const fn = (n as any).flowNode as FlowNode;
    //             if (!setv.has(fn) /*&& !isFlowStart(fn)*/){
    //                 flowNodes.push(fn);
    //                 setv.add(fn);
    //             }
    //         }
    //         if ((n as any).endFlowNode){
    //             const fn = (n as any).endFlowNode as FlowNode;
    //             if (!setv.has(fn) /*&& !isFlowStart(fn)*/){
    //                 flowNodes.push(fn);
    //                 setv.add(fn);
    //             }
    //         }
    //         forEachChild(n, visitorEfn);
    //     };
    //     /**
    //      * Collect all the flow nodes accessible via some node.
    //      */
    //     visitorEfn(sourceFile);
    //     /**
    //      * Collect all the flow nodes accessible via antecedents
    //      */
    //     const setAnte = new Set<FlowNode>();
    //     const addAntesToSet = (f: FlowNode & {antecedent?: FlowNode, antecedents?: FlowNode[]}) => {
    //         if (f.antecedent) {
    //             if (!setv.has(f.antecedent) && !setAnte.has(f.antecedent)) setAnte.add(f.antecedent);
    //         }
    //         if (f.antecedents) {
    //             f.antecedents.forEach((a: FlowNode)=>{
    //                 if (!setv.has(a) && !setAnte.has(a)) setAnte.add(a);
    //             });
    //         }
    //     };
    //     flowNodes.forEach(f=>addAntesToSet(f));
    //     let change = true;
    //     while (change) {
    //         const size = setAnte.size;
    //         setAnte.forEach(a=>addAntesToSet(a));
    //         change = setAnte.size!==size;
    //     }
    //     // @ts-expect-error 2769
    //     flowNodes.push(...Array.from(setAnte.keys()));
    //     setv.clear();
    //     const visitMark=(f: FlowNode) => {
    //         if (setv.has(f)) return;
    //         setv.add(f);
    //         if ((f as any).antecedent) {
    //             const a: FlowNode = (f as any).antecedent;
    //             getFlowNodeId(a);
    //             visitMark(a);
    //         }
    //         else if ((f as any).antecedents) {
    //             (f as any).antecedents.forEach((a: FlowNode)=>{
    //                 getFlowNodeId(a);
    //                 visitMark(a);
    //             });
    //         }
    //     };
    //     flowNodes.forEach(f=>{
    //         if (!setAnte.has(f)) {
    //             (f as any).isEndFlowNode = true; // NG!!
    //             getFlowNodeId(f);
    //             endFlowNodes.push(f);
    //             visitMark(f);
    //         }
    //     });
    //     return {flowNodes,endFlowNodes};
    // }

    function calculateGroupAntecedents(
        grouped: GroupedFlowNodes
    ): void{
        const mapFlowToGroup = grouped.flowNodeToGroupMap;// new Map<FlowNode|FlowWithNA, FlowNodeGroup>();

        // The nodefuls
        function perGroup(group: NodefulFlowNodeGroup){
            const setAnte= new Set<FlowNode>();
            if (isPlainNodefulFlowNodeGroup(group) || isIfPairFlowNodeGroup(group)) {
                const sliced = grouped.flowNodeWithNodesSorted.slice(group.idxb,group.idxe);
                const memberSet = new Set<FlowNode>(sliced);
                if (isPlainNodefulFlowNodeGroup(group)) memberSet.add(group.maximal);
                else if (isIfPairFlowNodeGroup(group)){
                    memberSet.add(group.true.flow);
                    memberSet.add(group.false.flow);
                }
                sliced.forEach((fn: FlowNode&FlowWithNA)=>{
                    mapFlowToGroup.set(fn,group);
                    if (fn.antecedent) {
                        if (!memberSet.has(fn.antecedent)) setAnte.add(fn.antecedent);
                    }
                    else if (fn.antecedents) {
                        fn.antecedents.forEach(a=>{
                            if (!memberSet.has(a)) setAnte.add(a);
                        });
                    }
                });
            }
            else if (isIfBranchFlowNodeGroup(group)){
                mapFlowToGroup.set(group.flow, group);
                // no antecedents
            }
            else Debug.assert(false);
            return setAnte;
        }
        const tmp = grouped.groups.map(g=>{
            return {
                group:g,
                setAnte: perGroup(g)
            };
        });

        // The nodeless
        grouped.nodelessGroups.forEach(ng=>{
            mapFlowToGroup.set(ng.flow,ng);
        });

        // The nodefuls
        tmp.forEach(t=>{
            if (isIfBranchFlowNodeGroup(t.group)) return;
            t.setAnte.forEach(af=>{
                const ga = mapFlowToGroup.get(af);
                Debug.assert(ga);
                Debug.assert(!isIfBranchFlowNodeGroup(t.group));
                t.group.antecedentGroups.add(ga);
            });
        });

        // The nodeless
        grouped.nodelessGroups.forEach((ng)=>{
            if ((ng.flow as FlowWithNA).antecedent) {
                const ga = mapFlowToGroup.get((ng.flow as FlowWithNA).antecedent!);
                Debug.assert(ga);
                ng.antecedentGroups.add(ga);
            }
            else if ((ng.flow as FlowWithNA).antecedents){
                (ng.flow as FlowWithNA).antecedents!.forEach(a=>{
                    const ga = mapFlowToGroup.get(a);
                    Debug.assert(ga);
                    ng.antecedentGroups.add(ga);
                });
            }
        });
    }

    function ensureOrdinality(grouped: GroupedFlowNodes): void {
        let change = true;
        while (change){
            change = false;
            grouped.groups.forEach(g=>{
                const gto = getOrdinal(g);
                let gt = gto;
                getAntecedentGroups(g).forEach(ag=>{
                    const lt = getOrdinal(ag);
                    if (gt<=lt){
                        gt = lt+1;
                    }
                });
                if (gt!==gto){
                    change = true;
                    if (hasOwnAntecedents(g)) g.ordinal = gt;
                    else g.ifPair.ordinal = gt;
                }
            });
        }
    }

    export function groupFlowNodes(allFlowNodes: AllFlowNodes, sourceFile: SourceFile): GroupedFlowNodes {
        const flowNodeWithNodes: (FlowWithNA & FlowNode)[]=[];
        const flowNodeWithoutNodes: FlowNode[]=[];
        allFlowNodes.flowNodes.forEach(fn=>{
            if (isFlowWithNode(fn) && !isFlowStart(fn)) flowNodeWithNodes.push(fn);
            else flowNodeWithoutNodes.push(fn);
        });
        // const flowNodeWithNodes = allFlowNodes.flowNodes.filter(fn=>isFlowWithNode(fn) && !isFlowStart(fn)) as (FlowWithNA & FlowNode)[];
        const aref = flowNodeWithNodes.map((_v,i)=>i);
        const compare = (ai: number,bi: number) => {
            if (flowNodeWithNodes[ai].node.pos < flowNodeWithNodes[bi].node.pos) return -1;
            else if (flowNodeWithNodes[ai].node.pos === flowNodeWithNodes[bi].node.pos){
                if (flowNodeWithNodes[ai].node.end < flowNodeWithNodes[bi].node.end) return -1;
                else if (flowNodeWithNodes[ai].node.end === flowNodeWithNodes[bi].node.end) {
                    if ((flowNodeWithNodes[ai].flags & FlowFlags.FalseCondition) && (flowNodeWithNodes[bi].flags & FlowFlags.TrueCondition)) return -1;
                    else if ((flowNodeWithNodes[ai].flags & FlowFlags.TrueCondition) && (flowNodeWithNodes[bi].flags & FlowFlags.FalseCondition)) return 1;
                    return 0;
                }
                else return 1;
            }
            else return 1;
        };
        aref.sort(compare);
        const flowNodeWithNodesSorted = aref.map(idx=>flowNodeWithNodes[idx]);
        const arrIfPairOfGroups: IfPairFlowNodeGoup[]=[];
        const createIfGroups = (idxb: number,idxe: number): IfPairFlowNodeGoup => {
            const idxTrue = idxe-1;
            const idxFalse = idxe-2;
            const maximalNode = flowNodeWithNodesSorted[idxFalse].node;
            const ordinal = maximalNode.pos;
            const groupTrue: Partial<IfBranchFlowNodeGroup> = {
                kind: FlowNodeGroupKind.IfBranch,
                true: true,
                flow: flowNodeWithNodesSorted[idxTrue],
            };
            const groupFalse: Partial<IfBranchFlowNodeGroup> = {
                kind: FlowNodeGroupKind.IfBranch,
                true: false,
                flow: flowNodeWithNodesSorted[idxFalse],
            };
            const ifPair: IfPairFlowNodeGoup = {
                kind: FlowNodeGroupKind.IfPair,
                ordinal,
                true:groupTrue as IfBranchFlowNodeGroup,
                false:groupFalse as IfBranchFlowNodeGroup,
                maximalNode,
                idxb,
                idxe,
                antecedentGroups: new Set<FlowNodeGroup>()
            };
            groupTrue.ifPair = ifPair;
            groupFalse.ifPair = ifPair;
            return ifPair;
        };

        /**
         * iterate flowNodeWithNodesSorted, making FlowNodeGroups
         */
        const groups: NodefulFlowNodeGroup[] = [];
        let idxb = 0;
        let {pos:curpos,end:curend} = flowNodeWithNodesSorted.length ? flowNodeWithNodesSorted[0].node : {pos:-1,end:-1};
        let maximalIdx = 0;
        let maximalLength = curend-curpos;
        for (let fi=1;fi<flowNodeWithNodesSorted.length;fi++){
            const {pos,end} = flowNodeWithNodesSorted[fi].node;
            if (pos> curpos && pos>=curend) {
                const maximal = flowNodeWithNodesSorted[maximalIdx];
                if (maximal.node.parent && isIfStatement(maximal.node.parent) && maximal.node.parent.expression===maximal.node){
                    const ifPair = createIfGroups(idxb,fi);
                    arrIfPairOfGroups.push(ifPair);
                    groups.push(ifPair);
                    groups.push(ifPair.false);
                    groups.push(ifPair.true);
                }
                else {
                    const group: PlainNodefulFlowNodeGroup = {
                        kind: FlowNodeGroupKind.PlainNodeful,
                        ordinal: maximal.node.pos,
                        idxb, idxe:fi,
                        maximalIdx,
                        //disclude:[],
                        maximal,
                        antecedentGroups: new Set<FlowNodeGroup>()
                    };
                    groups.push(group);
                }
                idxb=fi;
                curpos=pos;
                curend=end;
                maximalIdx = fi;
                maximalLength = curend-curpos;
            }
            else {
                if (end-pos >= maximalLength){
                    maximalIdx = fi;
                    maximalLength = end-pos;
                }
                if (end>curend) {
                    curend = end;
                }
            }
        }
        if (flowNodeWithNodesSorted.length){
            const maximal = flowNodeWithNodesSorted[maximalIdx] as FlowNode & FlowWithNA;
            if (maximal.node.parent && isIfStatement(maximal.node.parent) && maximal.node.parent.expression===maximal.node){
                const ifPair = createIfGroups(idxb,flowNodeWithNodesSorted.length);
                arrIfPairOfGroups.push(ifPair);
                groups.push(ifPair);
                groups.push(ifPair.false);
                groups.push(ifPair.true);
            }
            else {
                const group: PlainNodefulFlowNodeGroup = {
                    kind: FlowNodeGroupKind.PlainNodeful,
                    ordinal: maximal.node.pos,
                    idxb, idxe:flowNodeWithNodesSorted.length,
                    maximalIdx,
                    maximal,
                    antecedentGroups: new Set<FlowNodeGroup>()
                };
                groups.push(group);
            }
        }

        const nodeToFlowGroupMap: ESMap<Node, NodefulFlowNodeGroup> = new Map<Node, NodefulFlowNodeGroup>();
        groups.forEach(fg=>{
            if (isPlainNodefulFlowNodeGroup(fg)){
                flowNodeWithNodesSorted.slice(fg.idxb, fg.idxe).forEach(fn=>nodeToFlowGroupMap.set(fn.node,fg));
            }
            else if (isIfPairFlowNodeGroup(fg)){
                flowNodeWithNodesSorted.slice(fg.idxb, fg.idxe).forEach(fn=>nodeToFlowGroupMap.set(fn.node,fg));
            }
            /**
             * IfBranchFlowNodeGroup are not registered here because serve only as antecedents of external groups
             */
        });

        const nodelessGroups = flowNodeWithoutNodes.map((fn: FlowNode): NodelessFlowNodeGroup => {
            return {
                kind:FlowNodeGroupKind.Nodeless,
                ordinal: -1,
                flow:fn,
                antecedentGroups: new Set<FlowNodeGroup>()
            };
        });

        const grouped: GroupedFlowNodes = {
            flowNodeWithNodesSorted: flowNodeWithNodesSorted as FlowNode[],
            groups,
            nodelessGroups,
            flowNodeToGroupMap: new Map<FlowNode, PlainNodefulFlowNodeGroup>(),
            nodeToFlowGroupMap,
            arrIfPairOfGroups,
            sourceFile,
            allFlowNodes
        };
        calculateGroupAntecedents(grouped);
        ensureOrdinality(grouped);
        return grouped;
    }

    // @ts-expect-error
    export function groupFlowNodesFromSourceFile(sourceFile: SourceFile, getFlowNodeId: ((n: FlowNode) => number)): GroupedFlowNodes {
        //const allFlowNodes = findFlowNodes(sourceFile, getFlowNodeId);
        Debug.assert(sourceFile.allFlowNodes);
        const groupedFlowNodes = groupFlowNodes({flowNodes:sourceFile.allFlowNodes}, sourceFile);
        return groupedFlowNodes;
    }

    export function isFlowStart(fn: FlowNode | undefined): fn is FlowStart {
        return !!fn && !!(fn.flags & FlowFlags.Start);
    }
    export function isFlowLabel(fn: FlowNode | undefined): fn is FlowLabel {
        return !!fn &&  !!(fn.flags & FlowFlags.Label);
    }
    export function isFlowBranch(fn: FlowNode | undefined): fn is FlowLabel {
        return !!fn && !!(fn.flags & FlowFlags.BranchLabel);
    }
    export function isFlowAssignment(fn: FlowNode | undefined): fn is FlowAssignment {
        return !!fn &&  !!(fn.flags & FlowFlags.Assignment);
    }
    export function isFlowCall(fn: FlowNode | undefined): fn is FlowCall {
        return !!fn &&  !!(fn.flags & FlowFlags.Call);
    }
    export function isFlowCondition(fn: FlowNode | undefined): fn is FlowCondition {
        return !!fn &&  !!(fn.flags & FlowFlags.Condition);
    }
    export function isFlowSwitchClause(fn: FlowNode | undefined): fn is FlowSwitchClause{
        return !!fn &&  !!(fn.flags & FlowFlags.SwitchClause);
    }
    export function isFlowArrayMutation(fn: FlowNode | undefined): fn is FlowArrayMutation {
        return !!fn &&  !!(fn.flags & FlowFlags.ArrayMutation);
    }
    export function isFlowReduceLabel(fn: FlowNode | undefined): fn is FlowReduceLabel {
        return !!fn &&  !!(fn.flags & FlowFlags.ReduceLabel);
    }
    export function isFlowExpressionStatement(fn: FlowNode): fn is FlowExpressionStatement {
        return !!fn &&  !!(fn.flags & FlowFlags.ExpressionStatement);
    }
    export function isFlowJoin(fn: FlowNode): fn is FlowJoin {
        return !!fn &&  !!(fn.flags & FlowFlags.Join);
    }
    export function isFlowWithNode(fn: FlowNode | undefined): fn is FlowNode & {node: Node} {
        return !!fn &&  !!(fn as any).node;
    }
    export function isFlowConditionBoolean(fn: FlowCondition): boolean {
        return !!(fn.flags & (FlowFlags.TrueCondition | FlowFlags.FalseCondition));
    }
    export function getFlowConditionBoolean(fn: FlowCondition): boolean {
        return !!(fn.flags & FlowFlags.TrueCondition) ? true : !!(fn.flags & FlowFlags.FalseCondition) ? false : (()=> {
            Debug.assert(false, "getFlowConditionBoolean neither true nor false, qualify with isFlowConditionBoolean");
            return true;
        })();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    export function dbgFlowNodeGroupToString(
        flowNodeGroup: FlowNodeGroup,
        getFlowNodeId: (fn: FlowNode) => number,
        dbgFlowToString: (flowNode: FlowNode) => string,
        dbgNodeToString: (node: Node) => string
    ): string {
        let str = "";
        if (isPlainNodefulFlowNodeGroup(flowNodeGroup)){
            str += `[Plain] maximal[fg:${getFlowNodeId(flowNodeGroup.maximal)}]: ${dbgFlowToString(flowNodeGroup.maximal)}`;
        }
        else if (isIfPairFlowNodeGroup(flowNodeGroup)){
            str += `[IfPair] maximalNode[fg:${dbgNodeToString(flowNodeGroup.maximalNode)}], true:${getFlowNodeId(flowNodeGroup.true.flow)}, false:${getFlowNodeId(flowNodeGroup.false.flow)}`;
        }
        else if (isIfBranchFlowNodeGroup(flowNodeGroup)){
            str += `[IfBranch] flow[true: ${flowNodeGroup.true}, fg:${dbgFlowToString(flowNodeGroup.flow)}]`;
        }
        else if (isNodelessFlowNodeGroup(flowNodeGroup)) {
            str += `[Nodeless] flow[fg:${getFlowNodeId(flowNodeGroup.flow)}]: ${dbgFlowToString(flowNodeGroup.flow)}`;
        }
        return str;
    };

    export function dbgWriteGroupedFlowNode(
        groupedFlowNodes: GroupedFlowNodes,
        writeLine: (s: string) => void,
        getFlowNodeId: (fn: FlowNode) => number,
        dbgFlowToString: (flowNode: FlowNode) => string,
        dbgNodeToString: (node: Node) => string,
    ){
        // const flowNodeGroupToShortString = (flowNodeGroup: FlowNodeGroup): string => {
        //     let str = "";
        //     if (flowNodeGroup.kind===FlowNodeGroupKind.Nodeful){
        //         str += `maximal[fg:${getFlowNodeId(flowNodeGroup.maximal)}]: ${dbgFlowToString(flowNodeGroup.maximal)}`;
        //     }
        //     else {
        //         str += `flow[fg:${getFlowNodeId(flowNodeGroup.flow)}]: ${dbgFlowToString(flowNodeGroup.flow)}`;
        //     }
        //     return str;
        // };
        const flowNodeGroupToShortString = (flowNodeGroup: FlowNodeGroup): string => {
            return dbgFlowNodeGroupToString(flowNodeGroup, getFlowNodeId, dbgFlowToString, dbgNodeToString);
        };

        const flowNodeGroupToStrings = (flowNodeGroup: FlowNodeGroup): string[] => {
            const stringsout: string[]=[];
            const str = dbgFlowNodeGroupToString(flowNodeGroup, getFlowNodeId, dbgFlowToString, dbgNodeToString);
            // if (isPlainNodefulFlowNodeGroup(flowNodeGroup)){
            //     str = `[Plain] [idxb=${flowNodeGroup.idxb},idxe=${flowNodeGroup.idxe}] `;
            //     str += `, maximal[fg:${getFlowNodeId(flowNodeGroup.maximal)}]: ${dbgFlowToString(flowNodeGroup.maximal)}`;
            //     {
            //         Debug.assert(isFlowWithNode(flowNodeGroup.maximal));
            //         str += `, node: ${dbgNodeToString(flowNodeGroup.maximal.node)}`;
            //     }
            // }
            // else if (isNodelessFlowNodeGroup(flowNodeGroup)){
            //     str += `[Nodeless] `+flowNodeGroupToShortString(flowNodeGroup);
            // }
            // else if (isIfPairFlowNodeGroup(flowNodeGroup)){
            //     str = `[Plain] [idxb=${flowNodeGroup.idxb},idxe=${flowNodeGroup.idxe}], maximalNode: ${dbgNodeToString(flowNodeGroup.maximalNode)} `;
            //     str += `, true:[fg:${getFlowNodeId(flowNodeGroup.true.flow)}], false:[fg:${getFlowNodeId(flowNodeGroup.false.flow)}]`;
            // }
            // else if (isIfPairFlowNodeGroup(flowNodeGroup)){
            //     str = `[Plain] [idxb=${flowNodeGroup.idxb},idxe=${flowNodeGroup.idxe}], maximalNode: ${dbgNodeToString(flowNodeGroup.maximalNode)} `;
            //     str += `, true:[fg:${getFlowNodeId(flowNodeGroup.true.flow)}], false:[fg:${getFlowNodeId(flowNodeGroup.false.flow)}]`;
            // }
            stringsout.push(str);
            if (!isIfBranchFlowNodeGroup(flowNodeGroup)){
                stringsout.push(`  antecedentGroups:`);
                flowNodeGroup.antecedentGroups.forEach(group=>{
                    stringsout.push("    "+flowNodeGroupToShortString(group));
                });
            }
            return stringsout;
        };
        if (groupedFlowNodes.dbgCreationTimeMs!==undefined){
            writeLine(`dbgCreationTimeMs: ${groupedFlowNodes.dbgCreationTimeMs}`);
        }
        writeLine("groups:");
        groupedFlowNodes.groups.forEach(fng=>{
            flowNodeGroupToStrings(fng).forEach(s=>writeLine("  "+s));
                if (isPlainNodefulFlowNodeGroup(fng) || isIfPairFlowNodeGroup(fng)){
                    writeLine("    "+"internal flowNodes:");
                    for (let idx = fng.idxb; idx < fng.idxe; idx++){
                        const fn = groupedFlowNodes.flowNodeWithNodesSorted[idx];
                        if (isPlainNodefulFlowNodeGroup(fng) && fn === fng.maximal) continue;
                        if (isIfPairFlowNodeGroup(fng) && (fn === fng.true.flow || fn === fng.false.flow)) continue;
                        Debug.assert(isFlowWithNode(fn));
                        writeLine(`      [${idx}]: flow: ${dbgFlowToString(fn)}, node: ${dbgNodeToString(fn.node)}`);
                    }
                }
                });
        writeLine("arrIfPairOfGroups:");
        groupedFlowNodes.arrIfPairOfGroups.forEach(p=>{
            writeLine(`  node: ${dbgNodeToString(p.maximalNode)}`);
            writeLine(`    true: ${dbgFlowToString(p.true.flow)}`);
            writeLine(`    false: ${dbgFlowToString(p.false.flow)}`);
        });

        writeLine("nodelessGroups:");
        groupedFlowNodes.nodelessGroups.forEach(fng=>{
            flowNodeGroupToStrings(fng).forEach(s=>writeLine("  "+s));
        });

        writeLine("flowNodeWithNodesSorted:");
        groupedFlowNodes.flowNodeWithNodesSorted.forEach((fn,idx)=>{
            Debug.assert(isFlowWithNode(fn));
            writeLine(`[${idx}]: flow: ${dbgFlowToString(fn)}, node: ${dbgNodeToString(fn.node)}`);
        });
        if (groupedFlowNodes.allFlowNodes){
            const allFlowNodes = groupedFlowNodes.allFlowNodes;
            writeLine("allFlowNodes.flowNode:");
            allFlowNodes.flowNodes.forEach(fn=>{
                const hasNode = isFlowWithNode(fn);
                let str = hasNode ? "* " : "  ";
                str += `flow: ${dbgFlowToString(fn)}`;
                if (hasNode) str += `, node: ${dbgNodeToString(fn.node)}`;
                writeLine(str);
            });
            writeLine("allFlowNodes.endFlowNode:");
            // allFlowNodes.endFlowNodes.forEach(fn=>{
            //     const hasNode = isFlowWithNode(fn);
            //     let str = hasNode ? "* " : "  ";
            //     str += `flow: ${dbgFlowToString(fn)}`;
            //     if (hasNode) str += `, node: ${dbgNodeToString(fn.node)}`;
            //     writeLine(str);
            // });
        }
    }

}

