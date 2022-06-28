
namespace ts {
    type AllFlowNodes = & {
        flowNodes: FlowNode[];
        endFlowNodes: FlowNode[];
    };
    type FlowNodeGroup = & {
        maximal: FlowNode;
        nodeless?: boolean;
        group?: Set<FlowNode>;
        antecedentGroups: Set<FlowNodeGroup>;
    };
    type GroupedFlowNodes = & {
        groups: FlowNodeGroup[];
        endGroups: FlowNodeGroup[];
        flowNodeToGroupMap: ESMap<FlowNode, FlowNodeGroup>;
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
                if (!setv.has(fn) && !isFlowStart(fn)){
                    flowNodes.push(fn);
                    setv.add(fn);
                }
            }
            if ((n as any).endFlowNode){
                const fn = (n as any).endFlowNode as FlowNode;
                if (!setv.has(fn) && !isFlowStart(fn)){
                    flowNodes.push(fn);
                    setv.add(fn);
                }
            }
            forEachChild(n, visitorEfn);
        };
        visitorEfn(sourceFile);
        const setAnte = new Set<FlowNode>();
        //const setNotAnte = new Set<FlowNode>();
        // some flow nodes are not referenced by any node
        const addAntesToSet = (f: FlowNode) => {
            if ((f as any).antecedent) {
                if (!setAnte.has((f as any).antecedent)) setAnte.add((f as any).antecedent);
            }
            if ((f as any).antecedents) {
                (f as any).antecedents.forEach((a: FlowNode)=>{
                    if (!setAnte.has(a)) setAnte.add(a);
                });
            }
        };
        flowNodes.forEach(f=>addAntesToSet(f));
        // get antecedents of antecedents until no change
        let change = true;
        while (change) {
            const size = setAnte.size;
            setAnte.forEach(a=>addAntesToSet(a));
            change = setAnte.size!==size;
        }
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
    function groupFlowNodes(allflowNodes: AllFlowNodes): GroupedFlowNodes {
        type TempGroup = & {group: FlowNodeGroup; fnAntesOuter: Set<FlowNode> };
        type FlowNodeA = FlowNode & {
            antecedent?: FlowNodeA;
            antecedents?: FlowNodeA[];
        };
        //type FlowNodeWithNode = FlowNode & { node: Node};

        const flowNodeToTempGroupMap = new Map<FlowNode,TempGroup>();
        const pendingOuter = new Set<FlowNode>();
        //const endFlowNodesSet = new Set<FlowNode>();
        allflowNodes.endFlowNodes.forEach((efn)=>{
            pendingOuter.add(efn);
        });
        const createTempGroup = (fnm: FlowNodeA): TempGroup => {
            if (!isFlowWithNode(fnm)){
                const tg: TempGroup =  {
                    group: {
                        maximal: fnm,
                        antecedentGroups: new Set<FlowNodeGroup>()
                    },
                    fnAntesOuter: new Set<FlowNode>(fnm.antecedent? [fnm.antecedent] : fnm.antecedents? fnm.antecedents : [])
                };
                tg.fnAntesOuter.forEach(fn=>{
                    pendingOuter.add(fn);
                });
                flowNodeToTempGroupMap.set(fnm,tg);
                return tg;
            }
            // assume the first visited flowNode in a group is always the maximal
            const pendingInner= new Set<FlowNode>([fnm]);
            const fnAntesOuter= new Set<FlowNode>();
            const innerGroup = new Set<FlowNode>();
            const tmpGroup: TempGroup = {
                group: {
                    maximal: fnm,
                    antecedentGroups: new Set<FlowNodeGroup>(),
                    group: innerGroup
                },
                fnAntesOuter
            };
            const doFlowAntes = (flowNodes: FlowNode[]) => {
                flowNodes.forEach(fn=>{
                    if (!isFlowWithNode(fn)) pendingOuter.add(fn);
                    else if (fn.node.pos>=fnm.node.pos && fn.node.end <= fnm.node.end){
                        pendingInner.add(fn);
                    }
                    else {
                        fnAntesOuter.add(fn);
                        pendingOuter.add(fn);
                    }
                });
            };
            while(pendingInner.size){
                const fn = pendingInner.keys().next().value as FlowNodeA;
                pendingInner.delete(fn);
                innerGroup.add(fn);
                flowNodeToTempGroupMap.set(fn, tmpGroup);
                if (fn.antecedent) doFlowAntes([fn.antecedent]);
                else if (fn.antecedents) doFlowAntes(fn.antecedents);
            }
            return tmpGroup;
        };
        const tempGroups: TempGroup[]=[];
        while(pendingOuter.size){
            const fnm = pendingOuter.keys().next().value as FlowNodeA;
            pendingOuter.delete(fnm);
            tempGroups.push(createTempGroup(fnm));
        }
        /**
         * TempGroup -> FlowNodeGroup by converting fnAnterOuter to antecedentGroups using flowNodeToGroupMap
         */
        const groups = tempGroups.map(tg=>{
            const ags = tg.group.antecedentGroups;
            tg.fnAntesOuter.forEach(antecedentFlowNode=>{
                const antecedentFlowGroup = flowNodeToTempGroupMap.get(antecedentFlowNode);
                if (!antecedentFlowGroup){
                    Debug.assert(antecedentFlowGroup);
                }
                ags.add(antecedentFlowGroup.group);
            });
            return tg.group;
        });
        const flowNodeToGroupMap = new Map<FlowNode, FlowNodeGroup>();
        flowNodeToTempGroupMap.forEach((val,fn)=>flowNodeToGroupMap.set(fn,val.group));
        //const endGroupsSet = new Set<>
        const endGroups = allflowNodes.endFlowNodes.map(fn=>flowNodeToGroupMap.get(fn)!);
        return {groups,endGroups,flowNodeToGroupMap};
    }
    export function groupFlowNodesFromSourceFile(sourceFile: SourceFile, getFlowNodeId: ((n: FlowNode) => number)): GroupedFlowNodes {
        const allFlowNodes = findFlowNodes(sourceFile, getFlowNodeId);
        const groupedFlowNodes = groupFlowNodes(allFlowNodes);
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
        writeLine: (s: string) => void,
        getFlowNodeId: (fn: FlowNode) => number,
        dbgFlowToString: (flowNode: FlowNode) => string,
        dbgNodeToString: (node: Node) => string,
    ){
        const flowNodeGroupToString = (flowNodeGroup: FlowNodeGroup): string => {
            let str = `maximal[fg:${getFlowNodeId(flowNodeGroup.maximal)}]: ${dbgFlowToString(flowNodeGroup.maximal)}`;
            if (flowNodeGroup.nodeless) str += `, nodeless:true`;
            else {
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
        };
        const setVisited = new Set<FlowNodeGroup>();
        writeLine("endGroups:");
        groupedFlowNodes.endGroups.forEach(fng=>{
            setVisited.add(fng);
            writeLine("  "+flowNodeGroupToString(fng));
        });
        writeLine("groups:");
        groupedFlowNodes.groups.forEach(fng=>{
            if (setVisited.has(fng)) return;
            writeLine("  "+flowNodeGroupToString(fng));
        });
    }

}

