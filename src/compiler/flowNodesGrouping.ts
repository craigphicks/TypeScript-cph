
namespace ts {
    interface AllFlowNodes  {
        flowNodes: FlowNode[];
        endFlowNodes: FlowNode[];
    };

    enum FlowNodeGroupKind {
        Nodeless="Nodeless",
        Nodeful="Nodeful"
    };
    /**
     * All FlowNode with NodeFlags.Start become a NodelessFlowNodeGroup even if they have a node.
     */
    interface NodelessFlowNodeGroup {
        kind: FlowNodeGroupKind.Nodeless;
        flow: FlowNode;
        antecedentGroups: Set<FlowNodeGroup>;
    };
    interface NodefulFlowNodeGroup {
        kind: FlowNodeGroupKind.Nodeful;
        maximal: FlowNode;
        maximalIdx: number,
        //group?: Set<FlowNode>;
        // indices into flowNodeWithNodesSorted
        idxb: number,
        idxe: number,
        disclude: number[],
        ifPair?: IfPairOfGroups;
        antecedentGroups: Set<FlowNodeGroup>;
    };

    type FlowNodeGroup = NodelessFlowNodeGroup | NodefulFlowNodeGroup;

    interface IfPairOfGroups {
        true: NodefulFlowNodeGroup,
        false: NodefulFlowNodeGroup,
    };
    interface GroupedFlowNodes {
        flowNodeWithNodesSorted: FlowNode[];
        groups: NodefulFlowNodeGroup[];
        nodelessGroups: NodelessFlowNodeGroup[];
        arrIfPairOfGroups: IfPairOfGroups[];
        flowNodeToGroupMap: ESMap<FlowNode, FlowNodeGroup>;
    };
    interface FlowWithNA extends FlowNodeBase {
        node: Node;
        antecedent?: FlowNode;
        antecedents?: FlowNode[];
    };


    /**
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
    export function findFlowNodes(
        sourceFile: SourceFile,
        getFlowNodeId: ((n: FlowNode) => number)
        ): AllFlowNodes {
        const endFlowNodes: FlowNode[]=[];
        const flowNodes: FlowNode[]=[];
        // endFlowNodes is at least not always easy to find, might not even exist in any container?
        const setv = new Set<FlowNode>();
        const visitorEfn = (n: Node) => {
            //if ((n as any).endFlowNode) endFlowNodes.push((n as any).endFlowNode);
            if ((n as any).flowNode){
                const fn = (n as any).flowNode as FlowNode;
                if (!setv.has(fn) /*&& !isFlowStart(fn)*/){
                    flowNodes.push(fn);
                    setv.add(fn);
                }
            }
            if ((n as any).endFlowNode){
                const fn = (n as any).endFlowNode as FlowNode;
                if (!setv.has(fn) /*&& !isFlowStart(fn)*/){
                    flowNodes.push(fn);
                    setv.add(fn);
                }
            }
            forEachChild(n, visitorEfn);
        };
        /**
         * Collect all the flow nodes accessible via some node.
         */
        visitorEfn(sourceFile);
        /**
         * Collect all the flow nodes accessible via antecedents
         */
        const setAnte = new Set<FlowNode>();
        const addAntesToSet = (f: FlowNode & {antecedent?: FlowNode, antecedents?: FlowNode[]}) => {
            if (f.antecedent) {
                if (!setv.has(f.antecedent) && !setAnte.has(f.antecedent)) setAnte.add(f.antecedent);
            }
            if (f.antecedents) {
                f.antecedents.forEach((a: FlowNode)=>{
                    if (!setv.has(a) && !setAnte.has(a)) setAnte.add(a);
                });
            }
        };
        flowNodes.forEach(f=>addAntesToSet(f));
        let change = true;
        while (change) {
            const size = setAnte.size;
            setAnte.forEach(a=>addAntesToSet(a));
            change = setAnte.size!==size;
        }
        // @ts-expect-error 2769
        flowNodes.push(...Array.from(setAnte.keys()));
        setv.clear();
        const visitMark=(f: FlowNode) => {
            if (setv.has(f)) return;
            setv.add(f);
            if ((f as any).antecedent) {
                const a: FlowNode = (f as any).antecedent;
                getFlowNodeId(a);
                visitMark(a);
            }
            else if ((f as any).antecedents) {
                (f as any).antecedents.forEach((a: FlowNode)=>{
                    getFlowNodeId(a);
                    visitMark(a);
                });
            }
        };
        flowNodes.forEach(f=>{
            if (!setAnte.has(f)) {
                (f as any).isEndFlowNode = true; // NG!!
                getFlowNodeId(f);
                endFlowNodes.push(f);
                visitMark(f);
            }
        });
        return {flowNodes,endFlowNodes};
    }

    function calculateGroupAntecedents(
        grouped: GroupedFlowNodes
    ): void{
        const mapFlowToGroup = new Map<FlowNode|FlowWithNA, FlowNodeGroup>();

        // The nodefuls
        function perGroup(group: NodefulFlowNodeGroup){
            const setAnte= new Set<FlowNode>();
            grouped.flowNodeWithNodesSorted.slice(group.idxb,group.idxe).forEach((fn: FlowNode&FlowWithNA,i: number)=>{
                mapFlowToGroup.set(fn,group);
                const idx = group.idxb+i;
                // I believe this guard is unnecessary
                if (group.disclude.length && group.disclude.includes(idx)) return;
                if (fn.antecedent) setAnte.add(fn.antecedent);
                else if (fn.antecedents) fn.antecedents.forEach(a=>setAnte.add(a));
            });
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
            t.setAnte.forEach(af=>{
                const ga = mapFlowToGroup.get(af);
                Debug.assert(ga);
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

    export function groupFlowNodes(allFlowNodes: AllFlowNodes): GroupedFlowNodes {
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
        const arrIfPairOfGroups: IfPairOfGroups[]=[];
        const createIfGroups = (idxb: number,idxe: number): IfPairOfGroups => {
            const idxTrue = idxe-1;
            const idxFalse = idxe-2;
            const groupTrue: NodefulFlowNodeGroup = {
                kind: FlowNodeGroupKind.Nodeful,
                idxb, idxe, // doesn't include the maximal itself.
                maximalIdx: idxTrue,
                maximal: flowNodeWithNodesSorted[idxTrue],
                disclude:[idxFalse],
                antecedentGroups: new Set<NodefulFlowNodeGroup>()
            };
            const groupFalse: NodefulFlowNodeGroup = {
                kind: FlowNodeGroupKind.Nodeful,
                idxb, idxe, // doesn't include the maximal itself.
                maximalIdx: idxFalse,
                maximal: flowNodeWithNodesSorted[idxFalse],
                disclude:[idxTrue],
                antecedentGroups: new Set<NodefulFlowNodeGroup>()
            };
            const ifPair: IfPairOfGroups = {
                true:groupTrue,
                false:groupFalse
            };
            return ifPair;
        };


        const groups: NodefulFlowNodeGroup[] = [];
        let idxb = 0;
        let {pos:curpos,end:curend} = flowNodeWithNodesSorted.length ? flowNodeWithNodesSorted[0].node : {pos:-1,end:-1};
        let maximalIdx = 0;
        let maximalLength = curend-curpos;
        // const ifGroupHandling = (group: FlowNodeGroup, maximal: FlowWithNA, fi: number): void=>{
        //     Debug.assert(maximalIdx-1>=0);
        //     const falseMaximal = flowNodeWithNodesSorted[maximalIdx-1];
        //     if (falseMaximal.node!==maximal.node){
        //         Debug.assert(falseMaximal.node===maximal.node);
        //     }
        //     const falseGroup: FlowNodeGroup = {
        //         idxb, idxe:fi,
        //         maximal: falseMaximal as FlowNode,
        //         maximalIdx: maximalIdx-1,
        //         disclude:[maximalIdx],
        //         antecedentGroups: new Set<FlowNodeGroup>()
        //     };
        //     const ifPairOfGroups: IfPairOfGroups = {
        //         true: group,
        //         false: falseGroup
        //     };
        //     group.disclude.push(maximalIdx-1);
        //     group.ifPairParent = ifPairOfGroups;
        //     falseGroup.ifPairParent = ifPairOfGroups;
        //     arrIfPairOfGroups.push(ifPairOfGroups);
        //     groups.push(falseGroup);
        // };
        for (let fi=1;fi<flowNodeWithNodesSorted.length;fi++){
            const {pos,end} = flowNodeWithNodesSorted[fi].node;
            if (pos> curpos && pos>=curend) {
                const maximal = flowNodeWithNodesSorted[maximalIdx];
                if (maximal.node.parent && isIfStatement(maximal.node.parent) && maximal.node.parent.expression===maximal.node){
                    const ifPair = createIfGroups(idxb,fi);
                    arrIfPairOfGroups.push(ifPair);
                    groups.push(ifPair.false);
                    groups.push(ifPair.true);
                }
                else {
                    const group: NodefulFlowNodeGroup = {
                        kind: FlowNodeGroupKind.Nodeful,
                        idxb, idxe:fi, // doesn't include the maximal itself.
                        maximalIdx,
                        disclude:[],
                        maximal: maximal as FlowNode,
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
                groups.push(ifPair.false);
                groups.push(ifPair.true);
            }
            else {
                const group: NodefulFlowNodeGroup = {
                    kind: FlowNodeGroupKind.Nodeful,
                    idxb, idxe:flowNodeWithNodesSorted.length, // doesn't include the maximal itself.
                    maximalIdx,
                    disclude:[],
                    maximal: maximal as FlowNode,
                    antecedentGroups: new Set<NodefulFlowNodeGroup>()
                };
                groups.push(group);
            }
        }


        const nodelessGroups = flowNodeWithoutNodes.map((fn: FlowNode): NodelessFlowNodeGroup => {
            return {
                kind:FlowNodeGroupKind.Nodeless,
                flow:fn,
                antecedentGroups: new Set<FlowNodeGroup>()
            };
        });

        const grouped: GroupedFlowNodes = {
            flowNodeWithNodesSorted: flowNodeWithNodesSorted as FlowNode[],
            groups,
            nodelessGroups,
            flowNodeToGroupMap: new Map<FlowNode, NodefulFlowNodeGroup>(),
            arrIfPairOfGroups
        };
        calculateGroupAntecedents(grouped);

        return grouped;
    }

    // function groupFlowNodes(allflowNodes: AllFlowNodes): GroupedFlowNodes {
    //     type TempGroup = & {group: FlowNodeGroup; fnAntesOuter: Set<FlowNode> };
    //     type FlowNodeA = FlowNode & {
    //         antecedent?: FlowNodeA;
    //         antecedents?: FlowNodeA[];
    //     };
    //     //type FlowNodeWithNode = FlowNode & { node: Node};

    //     const flowNodeToTempGroupMap = new Map<FlowNode,TempGroup>();
    //     const pendingOuter = new Set<FlowNode>();
    //     //const endFlowNodesSet = new Set<FlowNode>();
    //     allflowNodes.endFlowNodes.forEach((efn)=>{
    //         pendingOuter.add(efn);
    //     });
    //     const createTempGroup = (fnm: FlowNodeA): TempGroup => {
    //         if (!isFlowWithNode(fnm)){
    //             const tg: TempGroup =  {
    //                 group: {
    //                     maximal: fnm,
    //                     nodeless: true,
    //                     antecedentGroups: new Set<FlowNodeGroup>()
    //                 },
    //                 fnAntesOuter: new Set<FlowNode>(fnm.antecedent? [fnm.antecedent] : fnm.antecedents? fnm.antecedents : [])
    //             };
    //             tg.fnAntesOuter.forEach(fn=>{
    //                 pendingOuter.add(fn);
    //             });
    //             flowNodeToTempGroupMap.set(fnm,tg);
    //             return tg;
    //         }
    //         // assume the first visited flowNode in a group is always the maximal
    //         if (!isFlowWithNode(fnm)){
    //             Debug.assert(false);
    //         }

    //         const pendingInner= new Set<FlowNode>([fnm]);
    //         const fnAntesOuter= new Set<FlowNode>();
    //         const innerGroup = new Set<FlowNode>();
    //         const tmpGroup: TempGroup = {
    //             group: {
    //                 maximal: fnm,
    //                 antecedentGroups: new Set<FlowNodeGroup>(),
    //                 group: innerGroup
    //             },
    //             fnAntesOuter
    //         };
    //         const doFlowAntes = (flowNodes: FlowNode[]) => {
    //             flowNodes.forEach(fn=>{
    //                 if (!isFlowWithNode(fn)) pendingOuter.add(fn);
    //                 else if (fn.node.pos>=fnm.node.pos && fn.node.end <= fnm.node.end){
    //                     pendingInner.add(fn);
    //                 }
    //                 else {
    //                     fnAntesOuter.add(fn);
    //                     pendingOuter.add(fn);
    //                 }
    //             });
    //         };
    //         while(pendingInner.size){
    //             const fn = pendingInner.keys().next().value as FlowNodeA;
    //             pendingInner.delete(fn);
    //             innerGroup.add(fn);
    //             flowNodeToTempGroupMap.set(fn, tmpGroup);
    //             if (fn.antecedent) doFlowAntes([fn.antecedent]);
    //             else if (fn.antecedents) doFlowAntes(fn.antecedents);
    //         }

    //         return tmpGroup;
    //     };
    //     const tempGroups: TempGroup[]=[];
    //     while(pendingOuter.size){
    //         const fnm = pendingOuter.keys().next().value as FlowNodeA;
    //         pendingOuter.delete(fnm);
    //         tempGroups.push(createTempGroup(fnm));
    //     }
    //     /**
    //      * TempGroup -> FlowNodeGroup by converting fnAnterOuter to antecedentGroups using flowNodeToGroupMap
    //      */
    //     const groups = tempGroups.map(tg=>{
    //         const ags = tg.group.antecedentGroups;
    //         tg.fnAntesOuter.forEach(antecedentFlowNode=>{
    //             const antecedentFlowGroup = flowNodeToTempGroupMap.get(antecedentFlowNode);
    //             if (!antecedentFlowGroup){
    //                 Debug.assert(antecedentFlowGroup);
    //             }
    //             ags.add(antecedentFlowGroup.group);
    //         });
    //         return tg.group;
    //     });
    //     const flowNodeToGroupMap = new Map<FlowNode, FlowNodeGroup>();
    //     flowNodeToTempGroupMap.forEach((val,fn)=>flowNodeToGroupMap.set(fn,val.group));
    //     //const endGroupsSet = new Set<>
    //     const endGroups = allflowNodes.endFlowNodes.map(fn=>flowNodeToGroupMap.get(fn)!);
    //     return {groups,endGroups,flowNodeToGroupMap};
    // }
    export function groupFlowNodesFromSourceFile(sourceFile: SourceFile, getFlowNodeId: ((n: FlowNode) => number)): {groupedFlowNodes: GroupedFlowNodes,allFlowNodes: AllFlowNodes} {
        const allFlowNodes = findFlowNodes(sourceFile, getFlowNodeId);
        const groupedFlowNodes = groupFlowNodes(allFlowNodes);
        return {groupedFlowNodes,allFlowNodes};
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
    export function dbgWriteGroupedFlowNode(
        groupedFlowNodes: GroupedFlowNodes,
        allFlowNodes: AllFlowNodes,
        writeLine: (s: string) => void,
        getFlowNodeId: (fn: FlowNode) => number,
        dbgFlowToString: (flowNode: FlowNode) => string,
        dbgNodeToString: (node: Node) => string,
    ){
        const flowNodeGroupToShortString = (flowNodeGroup: FlowNodeGroup): string => {
        }

        const flowNodeGroupToString = (flowNodeGroup: FlowNodeGroup): string => {
            if (flowNodeGroup.kind===FlowNodeGroupKind.Nodeful){
                let str = `[idxb=${flowNodeGroup.idxb},idxe=${flowNodeGroup.idxe}] `;
                str += `maximal[fg:${getFlowNodeId(flowNodeGroup.maximal)}]: ${dbgFlowToString(flowNodeGroup.maximal)}`;
                {
                    Debug.assert(isFlowWithNode(flowNodeGroup.maximal));
                    str += `, node: ${dbgNodeToString(flowNodeGroup.maximal.node)}`;
                }
                {
                    str += `, antecedentGroups: `;
                    flowNodeGroup.antecedentGroups.forEach(group=>{
                        str += `, [fg:${getFlowNodeId(group.maximal)}]`;
                    });
                }
                return str;
            }
            else {

            }
        }

        const setVisited = new Set<NodefulFlowNodeGroup>();
        // writeLine("endGroups:");
        // groupedFlowNodes.endGroups.forEach(fng=>{
        //     setVisited.add(fng);
        //     writeLine("  "+flowNodeGroupToString(fng));
        // });
        writeLine("groups:");
        groupedFlowNodes.groups.forEach(fng=>{
            if (setVisited.has(fng)) return;
            writeLine("  "+flowNodeGroupToString(fng));
            for (let idx = fng.idxb; idx < fng.idxe; idx++){
                const fn = groupedFlowNodes.flowNodeWithNodesSorted[idx];
                if (fn === fng.maximal) continue;
                Debug.assert(isFlowWithNode(fn));
                writeLine(`    [${idx}]: flow: ${dbgFlowToString(fn)}, node: ${dbgNodeToString(fn.node)}`);
            }
        });
        writeLine("arrIfPairOfGroups:");
        groupedFlowNodes.arrIfPairOfGroups.forEach(p=>{
            writeLine(`  node: ${dbgNodeToString((p.true.maximal as FlowWithNA).node)}`);
            writeLine(`    true: ${dbgFlowToString(p.true.maximal)}`);
            writeLine(`    false: ${dbgFlowToString(p.false.maximal)}`);
        });
        writeLine("flowNodeWithNodesSorted:");
        groupedFlowNodes.flowNodeWithNodesSorted.forEach((fn,idx)=>{
            Debug.assert(isFlowWithNode(fn));
            writeLine(`[${idx}]: flow: ${dbgFlowToString(fn)}, node: ${dbgNodeToString(fn.node)}`);
        });
        writeLine("allFlowNodes.flowNode:");
        allFlowNodes.flowNodes.forEach(fn=>{
            const hasNode = isFlowWithNode(fn);
            let str = hasNode ? "* " : "  ";
            str += `flow: ${dbgFlowToString(fn)}`;
            if (hasNode) str += `, node: ${dbgNodeToString(fn.node)}`;
            writeLine(str);
        });
        writeLine("allFlowNodes.endFlowNode:");
        allFlowNodes.endFlowNodes.forEach(fn=>{
            const hasNode = isFlowWithNode(fn);
            let str = hasNode ? "* " : "  ";
            str += `flow: ${dbgFlowToString(fn)}`;
            if (hasNode) str += `, node: ${dbgNodeToString(fn.node)}`;
            writeLine(str);
        });
    }

}

