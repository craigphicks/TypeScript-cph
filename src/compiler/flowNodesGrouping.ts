namespace ts {
    interface AllFlowNodes {
        flowNodes: FlowNode[];
        //nodesWithFlow: Node[];
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
        groupedNodes: GroupedNodes;
        nodeWithFlowNodeGroups: NodeWithFlowNodeGroups;
    };

    interface NodeGroup {
        // kind: NodeGroupKind;
        maximal: Node;
        maximalIdx: number;
        idxb: number;
        idxe: number;
    };
    interface GroupedNodes {
        nodeGroups: NodeGroup[];
        sortedNodes: Node[];
        sortedStructuralNodes: Node[];
        nodeToOwnNodeGroupMap: ESMap<Node,NodeGroup>;
        nodeFlowToOwnNodeGroupMap: ESMap<FlowNode,NodeGroup>;
        nodeGroupToFlowOutMap: ESMap<NodeGroup, Set<FlowNode>>;
        nodeGroupToFlowInMap: ESMap<NodeGroup, Set<FlowNode>>;
        dbgFlowToOriginatingGroupIdx?: ESMap<FlowNode, number>;
    };





    function isStructural(kind: SyntaxKind): boolean {
        switch (kind){
            case SyntaxKind.FunctionExpression:
            case SyntaxKind.IfStatement:
                    return true;
        }
        return false;
    }

    export function groupNodes(allNodesWithFlow: Readonly<Node[]>): GroupedNodes {
        const aref = allNodesWithFlow.map((_v,i)=>i);
        const compare = (ai: number,bi: number) => {
            if (allNodesWithFlow[ai].pos < allNodesWithFlow[bi].pos) return -1;
            else if (allNodesWithFlow[ai].pos === allNodesWithFlow[bi].pos) return 0;
            else return 1;
        };
        aref.sort(compare);
        const sortedStructural: Node[] = [];
        const sorted = aref.map(idx=>allNodesWithFlow[idx]).filter(n=>{
            if (isStructural(n.kind)) {
                sortedStructural.push(n);
                return false;
            }
            else return true;
        });

        const groups: NodeGroup [] = [];
        let idxb = 0;
        let {pos:curpos,end:curend} = sorted.length ? sorted[0] : { pos:-1,end:-1 };
        let maximalIdx = 0;
        let maximalLength = curend-curpos;
        for (let fi=1;fi<sorted.length;fi++){
            const {pos,end} = sorted[fi];
            if (pos> curpos && pos>=curend) {
                // new group
                const maximal = sorted[maximalIdx];
                groups.push({
                    maximal,
                    maximalIdx, idxb, idxe: fi
                });
                idxb = fi;
                curpos = pos;
                curend = end;
                maximalIdx = fi;
                maximalLength = end - pos;
            }
            else {
                if (end-pos > maximalLength){
                    maximalLength = end-pos;
                    maximalIdx = fi;
                }
                if (end>curend) curend = end;
            }
        }
        {
            const maximal = sorted[maximalIdx];
            groups.push({
                maximal,
                maximalIdx, idxb, idxe: sorted.length
            });
        }

        const nodeToOwnNodeGroupMap = new Map<Node,NodeGroup>();
        const nodeFlowToOwnNodeGroupMap = new Map<FlowNode,NodeGroup>();
        groups.forEach(g => {
            sorted.slice(g.idxb, g.idxe).forEach(n => {
                nodeToOwnNodeGroupMap.set(n,g);
                nodeFlowToOwnNodeGroupMap.set(n.flowNode!, g);
            });
        });

        const nodeGroupToFlowOutMap = new Map<NodeGroup, Set<FlowNode>>();
        const nodeGroupToFlowInMap = new Map<NodeGroup, Set<FlowNode>>();
        groups.forEach(g => {
            const add = (gg: NodeGroup, f: FlowNode, m: ESMap<NodeGroup, (Set<FlowNode> | undefined)>) => {
                const x = m.get(gg);
                if (!x) {
                    m.set(gg, new Set<FlowNode>([f]));
                }
                else x.add(f);
            };
            sorted.slice(g.idxb, g.idxe).forEach(n => {
                if (!(n.flowNode as any).node) add(g, n.flowNode!, nodeGroupToFlowOutMap); // what about antecedents ?
                else {
                    const flowTargetNode: Node = (n.flowNode as any).node;
                    const otherg = nodeToOwnNodeGroupMap.get(flowTargetNode);
                    if (otherg && otherg!==g) add(otherg, n.flowNode!, nodeGroupToFlowInMap);
                }

                // const antef: FlowNode = (n.flowNode as any)!.antecedent;
                // if (antef) {
                //     if (nodeFlowToOwnNodeGroupMap.get(antef) !== g) {
                //         add(g, antef, nodeGroupToFlowOutMap);
                //         const otherg = nodeFlowToOwnNodeGroupMap.get(antef)!;
                //         add(otherg, antef, nodeGroupToFlowInMap);
                //     }
                // }
                // const antesf: FlowNode[] = (n.flowNode as any)!.antecedents;
                // if (antesf) {
                //     antesf.forEach(antef=>{
                //         if (nodeFlowToOwnNodeGroupMap.get(antef) !== g) {
                //             add(g, antef, nodeGroupToFlowOutMap);
                //             const otherg = nodeFlowToOwnNodeGroupMap.get(antef)!;
                //             add(otherg, antef, nodeGroupToFlowInMap);
                //         }
                //     });
                // }
            });
        });


        return {
            sortedStructuralNodes: sortedStructural,
            nodeGroups: groups,
            sortedNodes: sorted,
            nodeToOwnNodeGroupMap,
            nodeFlowToOwnNodeGroupMap,
            nodeGroupToFlowInMap,
            nodeGroupToFlowOutMap
        };
    }



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
        else Debug.fail();
    }
    export function getOrdinal(group: FlowNodeGroup): number{
        if (hasOwnAntecedents(group)) return group.ordinal;
        else if (isIfBranchFlowNodeGroup(group)){
            return group.ifPair.ordinal;
        }
        Debug.fail();
    }


    type FlowWithNA = FlowNode & {node: Node, antecedent?: FlowNode, antecedents: FlowNode[]};

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
                sliced.forEach((fn: FlowNode & FlowWithNA)=>{
                    const addIfExternal = (a: FlowNode) => {
                        if (memberSet.has(a)) return;
                        /**
                         * Checking here is antecedent's antecedent is in-group, which can happen with e.g. Branch.
                         * Do we ever need to check for antecedent's antecedent's antecedent, etc. ?
                         */
                        if ((a as FlowWithNA).antecedent && memberSet.has((a as FlowWithNA).antecedent!)) return;
                        if ((a as FlowWithNA).antecedents && (a as FlowWithNA).antecedents.every(aa=>memberSet.has(aa))) return;
                        setAnte.add(a);
                    };
                    mapFlowToGroup.set(fn,group);
                    if (fn.antecedent) {
                        addIfExternal(fn.antecedent);
                        //if (!memberSet.has(fn.antecedent)) setAnte.add(fn.antecedent);
                    }
                    else if (fn.antecedents) {
                        fn.antecedents.forEach(a=>{
                            addIfExternal(a);
                            //if (!memberSet.has(a)) setAnte.add(a);
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
                (ng.flow as FlowWithNA).antecedents.forEach(a=>{
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
            [grouped.groups, grouped.nodelessGroups].forEach(x=>{
                x.forEach(g=>{
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
            });
        }
    }

    export interface GroupX { maximalIdx: number, idxb: number, idxe: number };
    export interface NodeWithFlowNodeGroups {
        groups: GroupX[];
        orderedNodes: Node[];
        nodeToFlowNodeMap: ESMap< Node, FlowNode >;
    };
    export function groupNodesWithFlowNodes(
        sourceFile: SourceFile,
    ): NodeWithFlowNodeGroups {
        const nToFn = new Map<Node,FlowNode>();
        const setNode = new Set<Node>();
        const setFlowNode = new Set<FlowNode>();
        const visitorEfn = (n: Node) => {
            if ((n as any).flowNode){
                const fn = (n as any).flowNode as FlowNode;
                    //setFn.add(fn);
                    nToFn.set(n,fn);
                    setNode.add(n);
                    setFlowNode.add(fn);
            }
            forEachChild(n, visitorEfn);
        };
        /**
         * Collect all the flow nodes accessible via some node.
         */
        visitorEfn(sourceFile);

        // @ts-expect-error
        const unorderedNodes: Node[]= Array.from(setNode.keys());
        const aref = unorderedNodes.map((_v,i)=>i);
        const compare = (ai: number,bi: number) => {
            if (unorderedNodes[ai].pos < unorderedNodes[bi].pos) return -1;
            else if (unorderedNodes[ai].pos === unorderedNodes[bi].pos){
                if (unorderedNodes[ai].end < unorderedNodes[bi].end) return -1;
                else if (unorderedNodes[ai].end === unorderedNodes[bi].end) {
                    if ((unorderedNodes[ai].flags & FlowFlags.FalseCondition) && (unorderedNodes[bi].flags & FlowFlags.TrueCondition)) return -1;
                    else if ((unorderedNodes[ai].flags & FlowFlags.TrueCondition) && (unorderedNodes[bi].flags & FlowFlags.FalseCondition)) return 1;
                    return 0;
                }
                else return 1;
            }
            else return 1;
        };
        aref.sort(compare);
        const orderedNodes = aref.map(idx=>unorderedNodes[idx]);


        const groups: GroupX[] = [];
        let idxb = 0;
        let {pos:curpos,end:curend} = orderedNodes.length ? orderedNodes[0] : { pos:-1,end:-1 };
        let maximalIdx = 0;
        let maximalLength = curend-curpos;
        for (let fi=1;fi<orderedNodes.length;fi++){
            const {pos,end} = orderedNodes[fi];
            if (pos> curpos && pos>=curend) {
                const group: GroupX = {
                    idxb, idxe:fi,
                    maximalIdx,
                };
                groups.push(group);
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
        if (orderedNodes.length){
            const group: GroupX = {
                idxb, idxe:orderedNodes.length,
                maximalIdx,
            };
            groups.push(group);
        }

        return {
            groups,
            orderedNodes,
            nodeToFlowNodeMap: nToFn
        };
    }

    //interface NodeWithFlow extends Node { flowNode: FlowNode };
    export function makeGroupsForFlow(sourceFile: SourceFile, checker: TypeChecker): GroupsForFlow {

        const flowNodes: FlowNode[] = sourceFile.allFlowNodes ?? [];
        const nodesWithFlow: Node[] = sourceFile.allNodesWithFlowOneSourceFile ?? [];

        interface Container extends Node { nextContainer: Node | undefined };
        const mapContainerToIndex = new Map< Container, number>();
        //const container: Container | undefined = sourceFile as Container;
        for (let container: Container | undefined = sourceFile as Container, i=0; container; container = container.nextContainer as Container | undefined) {
            mapContainerToIndex.set(container, i++);
        }

        const precOrderCI: ContainerItem[] = [];
        for (let container: Container | undefined = sourceFile as Container; container; container = container.nextContainer as Container | undefined) {
            precOrderCI.push({ node: container, precOrderIdx: precOrderCI.length });
        }
        const arefCI = precOrderCI.map((_v,i)=>i);
        const compareCIpos = (a: number,b: number) => {
            return precOrderCI[a].node.pos-precOrderCI[b].node.pos;
        };
        arefCI.sort(compareCIpos);
        const posOrderCI = arefCI.map(idx=>precOrderCI[idx]);

        const findPrecOrdCIIdx = (n: Node) => {
            /**
             * TODO: Optimize with binary search
             */
            let i = 0;
            for (; i<posOrderCI.length && posOrderCI[i].node.pos<=n.pos; i++);
            i--;
            while (i>0 && !(n.end <= posOrderCI[i].node.end)) i--;
            return posOrderCI[i].precOrderIdx;
        };

        const setOfNodes = new Set<Node>();
        nodesWithFlow.forEach((n: Node)=>{
            Debug.assert(isNodeWithFlow(n));
            const fn = n.flowNode;
            if (isFlowStart(fn)) return;
            if (!isStatement(n)) {
                setOfNodes.add(n);
            }
            else if (isReturnStatement(n) && n.expression) setOfNodes.add(n.expression);
        });
        flowNodes.forEach(f=>{
            if (isFlowWithNode(f)) setOfNodes.add(f.node);
        });
        setOfNodes.forEach(n=>{
            if (n.parent.kind===SyntaxKind.BinaryExpression){
                const pk = (n.parent as BinaryExpression).operatorToken.kind;
                if (pk===SyntaxKind.AmpersandAmpersandToken
                || pk===SyntaxKind.AmpersandAmpersandEqualsToken
                || pk===SyntaxKind.BarBarToken
                || pk===SyntaxKind.BarBarEqualsToken){
                    setOfNodes.add(n.parent);
                }
            }
        });
        // @ts-expect-error 2679
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const unorderedNodes = Array.from(setOfNodes.keys()) as Node[];
        const aref = unorderedNodes.map((_v,i)=>i);

        const compare0 = (ai: number,bi: number) => {
            if (unorderedNodes[ai].pos < unorderedNodes[bi].pos) return -1;
            else if (unorderedNodes[ai].pos === unorderedNodes[bi].pos){
                if (unorderedNodes[ai].end < unorderedNodes[bi].end) return -1;
                else if (unorderedNodes[ai].end === unorderedNodes[bi].end) {
                    return 0;
                }
                else return 1;
            }
            else return 1;
        };
        aref.sort(compare0);
        const orderedNodes = aref.map(idx=>unorderedNodes[idx]);

        const groups: GroupForFlow[] = [];
        let idxb = 0;
        let {pos:curpos,end:curend} = orderedNodes.length ? orderedNodes[0] : { pos:-1,end:-1 };
        let maximalIdx = 0;
        let maximalLength = curend-curpos;
        for (let fi=1;fi<orderedNodes.length;fi++){
            const on = orderedNodes[fi];
            const {pos,end} = on;
            if (pos> curpos && pos>=curend) {
                const maximal = orderedNodes[maximalIdx];
                let ifExpr = false;
                if (maximal.parent && isIfStatement(maximal.parent) && maximal.parent.expression===maximal){
                    ifExpr = true;
                }
                const group: GroupForFlow = {
                    kind: ifExpr ? GroupForFlowKind.ifexpr : GroupForFlowKind.plain,
                    idxb, idxe:fi,
                    maximalIdx,
                    precOrdContainerIdx: findPrecOrdCIIdx(orderedNodes[maximalIdx]),
                    groupIdx: -1,
                };
                groups.push(group);
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
        if (orderedNodes.length){
            const precOrdCIIdx = findPrecOrdCIIdx(orderedNodes[maximalIdx]);
            let ifExpr = false;
            const maximal = orderedNodes[maximalIdx];
            if (maximal.parent && isIfStatement(maximal.parent) && maximal.parent.expression===maximal){
                ifExpr = true;
            }
            const group: GroupForFlow = {
                kind: ifExpr ? GroupForFlowKind.ifexpr : GroupForFlowKind.plain,
                idxb, idxe:orderedNodes.length,
                maximalIdx,
                precOrdContainerIdx: precOrdCIIdx,
                groupIdx: -1
            };
            groups.push(group);
        }
        const arefGroups = groups.map((_v,i)=>i);
        /**
         * TODO: This order doesn't capture the need to do some inners first.
         * @param a
         * @param b
         * @returns
         */
        const compareGroups = (a: number, b: number) => {
            return groups[a].precOrdContainerIdx - groups[b].precOrdContainerIdx;
        };
        arefGroups.sort(compareGroups);
        const orderedGroups = arefGroups.map(idx=>groups[idx]);


        /**
         * Create Node to GroupForFlow map
         */
        const nodeToGroupMap = new Map< Node, GroupForFlow >();
        orderedGroups.forEach(g=>{
            for (let idx=g.idxb; idx!==g.idxe; idx++){
                nodeToGroupMap.set(orderedNodes[idx], g);
            }
        });

        /**
         * Set group index and
         * Find the flow linked groups for each group.
         */
        const groupToSetOfFlowMap = new Map< GroupForFlow, Set<FlowNode> >();
        //const ignorableFlowSetTemp = new Set<FlowNode>();
        const flowToOriginatingGroupIdx = new Map<FlowNode, number>();
        orderedGroups.forEach((g,groupIdx)=>{
            g.groupIdx=groupIdx;
            const set = new Set<FlowNode>();
            const {pos: gpos, end: gend} = orderedNodes[g.maximalIdx];
            for (let idx = g.idxb; idx!==g.idxe; idx++){
                const node = orderedNodes[idx];
                if (isNodeWithFlow(node)){
                    const fn = node.flowNode;
                    flowToOriginatingGroupIdx.set(fn, groupIdx);
                    if (isFlowWithNode(fn)){
                        const nodeOfFlow = fn.node;
                        if (nodeOfFlow.pos >= gpos && nodeOfFlow.pos < gend) {
                            //ignorableFlowSetTemp.add(fn);
                            return;  // filter in-group references
                        }
                        set.add(fn); // nodeful flow
                    }
                    else {
                        set.add(fn); // non-nodeful flow
                    }
                }
            }
            if (set.size) groupToSetOfFlowMap.set(g, set);
        });

        /**
         * Mark which groups are referenced by true/false conditions
         */
        {
            flowNodes.forEach(fn=>{
                checker.getFlowNodeId(fn);
            });
        }
        flowNodes.forEach(fn=>{
            /**
             * TODO: Not sure this is correct.
             */
            // if (isFlowWithAntecedent(fn) && isFlowStart(fn.antecedent)) return;
            if (isFlowBranch(fn)){
                const gidxOrig = flowToOriginatingGroupIdx.get(fn) ?? -1;
                getFlowAntecedents(fn).forEach(antefn=>{
                    if (isFlowCondition(antefn)) {
                        const gidxAnte = flowToOriginatingGroupIdx.get(antefn) ?? -1;
                        if (gidxOrig===-1) return;
                        if (gidxOrig>=0 && gidxOrig===gidxAnte) return;
                        const g = nodeToGroupMap.get(antefn.node)!;
                        if (antefn.flags & FlowFlags.FalseCondition) g.falseref=true;
                        if (antefn.flags & FlowFlags.TrueCondition) g.trueref=true;
                    }
                });
                return;
            }
            if (!flowToOriginatingGroupIdx.has(fn)) return;
            //if (ignorableFlowSetTemp.has(fn)) return;
            if (isFlowCondition(fn)) {
                const g = nodeToGroupMap.get(fn.node)!;
                if (flowToOriginatingGroupIdx.get(fn)===g.groupIdx) return;
                //const maximalNode = orderedNodes[g.maximalIdx];
                //if (fn.node.pos >= maximalNode.pos && fn.node.end <= maximalNode.end) return;
                if (fn.flags & FlowFlags.FalseCondition) g.falseref=true;
                if (fn.flags & FlowFlags.TrueCondition) g.trueref=true;
            }
            // else if (isFlowWithNode(fn)) {
            //     const g = nodeToGroupMap.get(fn.node)!;
            //     if (flowToOriginatingGroupIdx.get(fn)===g.groupIdx) return;
            //     g.noncondref = true;
            // }
        });


        const groupToAnteGroupMap = new Map< GroupForFlow, Set<GroupForFlow> >();
        //const groupToFlowLabels = new Map< GroupForFlow, Set<FlowLabel> >();
        orderedGroups.forEach(g=>{
            const setOfGroup = new Set<GroupForFlow>();
            //const setOfFlowLabels = new Set<FlowLabel>();
            const origSetOfFlow = groupToSetOfFlowMap.get(g);
            const filteredSetOfFlow = new Set<FlowNode>();
            if (!origSetOfFlow) return;
            origSetOfFlow.forEach(fn=>{
                if (isFlowStart(fn)) return;
                if (isFlowWithNode(fn)){
                    const groupToAdd = nodeToGroupMap.get(fn.node);
                    if (!groupToAdd){
                        Debug.fail();
                    }
                    if (groupToAdd===g) {
                        Debug.fail();
                    }
                    setOfGroup.add(groupToAdd);
                    filteredSetOfFlow.add(fn);
                }
                else {
                    // flow without node
                    // branches can lead to branches
                    if (isFlowBranch(fn)){
                        const flowLabels: FlowLabel[] = [fn];
                        while (flowLabels.length){
                            const fnlab = flowLabels.pop()!;
                            // setOfFlowLabels.add(fnlab);
                            fnlab.antecedents?.forEach(antefn=>{
                                if (isFlowStart(antefn)) return;
                                if (isFlowWithNode(antefn)){
                                    g.branchMerger = true;
                                    const groupToAdd = nodeToGroupMap.get(antefn.node);
                                    if (!groupToAdd){
                                        Debug.fail();
                                    }
                                    if (groupToAdd===g) {
                                        return; //Debug.fail();
                                    }
                                    setOfGroup.add(groupToAdd);
                                    filteredSetOfFlow.add(fn);
                                }
                                else if (isFlowBranch(antefn)) flowLabels.push(antefn);
                                else Debug.fail();
                            });
                        }
                    }
                    else Debug.fail();
                }
            });
            if (g.branchMerger){
                //Debug.assert(setOfFlow.size===1);
            }
            if (setOfGroup.size) groupToAnteGroupMap.set(g,setOfGroup);
            groupToSetOfFlowMap.set(g, filteredSetOfFlow);

            //f (setOfFlowLabels.size) groupToFlowLabels.set(g,setOfFlowLabels);
        });

        return {
            orderedGroups,
            posOrderedNodes: orderedNodes,
            precOrderContainerItems: precOrderCI,
            groupToSetOfFlowMap,
            groupToAnteGroupMap,
            //groupToFlowLabels,
            nodeToGroupMap,
            dbgFlowToOriginatingGroupIdx: flowToOriginatingGroupIdx
        };

    }




    export function groupFlowNodes(allFlowNodes: { flowNodes: FlowNode[] }, sourceFile: SourceFile): GroupedFlowNodes {
        const flowNodeWithNodes: (FlowWithNA & FlowNode)[]=[];
        const flowNodeWithoutNodes: FlowNode[]=[];
        allFlowNodes.flowNodes.forEach(fn=>{
            if (isFlowWithNode(fn) && !isFlowStart(fn)) flowNodeWithNodes.push(fn as FlowWithNA);
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
        let {pos:curpos,end:curend} = flowNodeWithNodesSorted.length ? flowNodeWithNodesSorted[0].node : { pos:-1,end:-1 };
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
            const maximal = flowNodeWithNodesSorted[maximalIdx];
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
            allFlowNodes,
            groupedNodes: groupNodes(sourceFile.allNodesWithFlowOneSourceFile!),
            nodeWithFlowNodeGroups : groupNodesWithFlowNodes(sourceFile)
        };
        calculateGroupAntecedents(grouped);
        ensureOrdinality(grouped);
        return grouped;
    }

    // @ ts-expect-error
    export function groupFlowNodesFromSourceFile(sourceFile: SourceFile /*, getFlowNodeId: ((n: FlowNode) => number) */): GroupedFlowNodes {
        //const allFlowNodes = findFlowNodes(sourceFile, getFlowNodeId);
        Debug.assert(sourceFile.allFlowNodes);
        const groupedFlowNodes = groupFlowNodes({ flowNodes:sourceFile.allFlowNodes }, sourceFile);
        return groupedFlowNodes;
    }
    interface NodeWithFlow extends Node { flowNode: FlowNode };
    export function isNodeWithFlow(n: Node): n is NodeWithFlow {
        return !!n.flowNode;
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
    interface FlowWithAntecedent extends FlowNodeBase { antecedent: FlowNode };
    /* @ ts-expect-error */
    function isFlowWithAntecedent(fn: FlowNodeBase): fn is FlowWithAntecedent {
        return !!(fn as any).antecedent;
    }
    interface FlowWithAntecedents extends FlowNodeBase { antecedents: FlowNode[] };
    /* @ ts-expect-error */
    function isFlowWithAntecedents(fn: FlowNodeBase): fn is FlowWithAntecedents {
        return !!(fn as any).antecedents;
    }
    export function getFlowAntecedents(fn: FlowNodeBase): FlowNode[] {
        if (isFlowWithAntecedent(fn)) return [fn.antecedent];
        else if (isFlowWithAntecedents(fn)) return fn.antecedents;
        else return [];
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    export function dbgNodeWithFlowNodeGroups(
        nodeWithFlowNodeGroups: NodeWithFlowNodeGroups,
        // getFlowNodeId: (fn: FlowNode) => number,
        // dbgFlowToString: (flowNode: FlowNode) => string,
        dbgNodeToString: (node: Node) => string
    ): string {
        const gs = nodeWithFlowNodeGroups;
        const astr: string[]=[];
        gs.groups.forEach((g,gi)=>{
            const mnode = gs.orderedNodes[g.maximalIdx];
            astr.push(`[${gi}][${g.maximalIdx}]: ${dbgNodeToString(mnode)}`);
            for (let i = g.idxb; i<g.idxe; i++){
                if (i===g.maximalIdx) continue;
                astr.push(`  [${gi}][${i}}]: ${dbgNodeToString(gs.orderedNodes[i])}`);
            }
        });
        return astr.join(sys.newLine);
    }


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
        str += `, getOrdinal: ${getOrdinal(flowNodeGroup)}`;
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
            //     let str = hasNode ? "* " : " ";
            //     str += `flow: ${dbgFlowToString(fn)}`;
            //     if (hasNode) str += `, node: ${dbgNodeToString(fn.node)}`;
            //     writeLine(str);
            // });
        }
        writeLine("groupedFlowNodes.groupedNodes.sortedStructuralNodes (not sorted):");
        groupedFlowNodes.groupedNodes.sortedStructuralNodes.forEach(n=>{
            writeLine(`  ${dbgNodeToString(n)}`);
        });
        writeLine("groupedFlowNodes.groupedNodes.sortedNodes (not sorted):");
        groupedFlowNodes.groupedNodes.sortedNodes.forEach(n=>{
            writeLine(`  ${dbgNodeToString(n)}`);
        });
        // writeLine("groupedNodes.nodeGroups");
        // groupedFlowNodes.groupedNodes.nodeGroups.forEach((ng,i)=>{
        //     writeLine(`[#${i}] ${dbgNodeToString(ng.maximal)}`);
        //     groupedFlowNodes.groupedNodes.sortedNodes.slice(ng.idxb,ng.idxe).forEach((n,j)=>{
        // eslint-disable-next-line no-double-space
        //         writeLine(`  [##${ng.idxb+j}] ${dbgNodeToString(n)}, flow: ${n.flowNode? dbgFlowToString(n.flowNode) : "<undef>"}`);
        //     });
        // eslint-disable-next-line no-double-space
        //     writeLine("  groupedFlowNodes.groupedNodes.nodeGroupToFlowInMap");
        //     groupedFlowNodes.groupedNodes.nodeGroupToFlowInMap.get(ng)?.forEach(f=>{
        //         writeLine(`    flow: ${dbgFlowToString(f)}`);
        //     });
        // eslint-disable-next-line no-double-space
        //     writeLine("  groupedFlowNodes.groupedNodes.nodeGroupToFlowOutMap");
        //     groupedFlowNodes.groupedNodes.nodeGroupToFlowOutMap.get(ng)?.forEach(f=>{
        //         writeLine(`    flow: ${dbgFlowToString(f)}`);
        //     });
        // });
    }

    export function dbgGroupsForFlowToStrings(
        gff: GroupsForFlow,
        checker: TypeChecker,
        // dbgNodeToString: (node: Node) => string,
        // dbgFlowToString: (flowNode: FlowNode) => string,
    ): string[] {
        const dbgs = createDbgs(checker);
        const dbgNodeToString = dbgs.dbgNodeToString;
        const dbgFlowToString = dbgs.dbgFlowToString;
        const astr: string[] = [];
        gff.orderedGroups.forEach((g,i)=>{
            const maxnode = gff.posOrderedNodes[g.maximalIdx];
            //const maxnodecont = gff.precOrderContainerItems[g.precOrdContainerIdx];
            astr.push(`groups[${i}]: {maxnode: ${dbgNodeToString(maxnode)}}, contidx: ${
                g.precOrdContainerIdx
            }, trueref: ${g.trueref??false}, falseref: ${g.falseref??false}`);
            for (let idx = g.idxb; idx!==g.idxe; idx++){
                const node = gff.posOrderedNodes[idx];
                let str = `groups[${i}]:  [${idx}]: ${dbgNodeToString(node)}`;
                if (isNodeWithFlow(node)) str += `, flow: ${dbgFlowToString(node.flowNode)}`;
                astr.push(str);
            }
            const setOfFlow = gff.groupToSetOfFlowMap.get(g);
            astr.push(`groups[${i}]:  setOfFlow.size===${setOfFlow?.size??0}`);
            if (setOfFlow) {
                setOfFlow.forEach(fn=>{
                    astr.push(`groups[${i}]:    flow: ${dbgFlowToString(fn)}`);
                });
            }
            const setOfAnteGroups = gff.groupToAnteGroupMap.get(g);
            astr.push(`groups[${i}]:  setOfAnteGroups.size===${setOfAnteGroups?.size??0}`);
            if (setOfAnteGroups) {
                setOfAnteGroups.forEach(anteg=>{
                    astr.push(`groups[${i}]:    anteGroupIdx: ${anteg.groupIdx}`);
                });
            }
            // const setOfFlowLabels = gff.groupToFlowLabels.get(g);
            // eslint-disable-next-line no-double-space
            // astr.push(`groups[${i}]:  setOfFlowLabels.size===${setOfFlowLabels?.size??0}`);
            // if (setOfFlowLabels) {
            //     setOfFlowLabels.forEach((fn)=>{
            // eslint-disable-next-line no-double-space
            //         astr.push(`  flowLabel: ${dbgFlowToString(fn)}`);
            //     });
            // }
        });
        gff.precOrderContainerItems.forEach((ci,i)=>{
            astr.push(`containerItems[${i}]: node:${dbgNodeToString(ci.node)}`);
        });
        gff.posOrderedNodes.forEach((node,i)=>{
            astr.push(`[${i}]: node:${dbgNodeToString(node)}`);
        });
        return astr;
    }

}

