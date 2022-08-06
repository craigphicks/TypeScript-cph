namespace ts {

    let dbgs: Dbgs | undefined;
    //let myDebug: boolean | undefined;

    export enum GroupForFlowKind {
        none=0,
        plain=1,
        ifexpr=2
    };
    export interface GroupForFlow {
        kind: GroupForFlowKind,
        maximalIdx: number,
        idxb: number,
        idxe: number,
        precOrdContainerIdx: number,
        groupIdx: number,
        branchMerger?: boolean; // kill?
        trueref?: boolean;
        falseref?: boolean;
        //noncondref?: boolean;
    };

    export interface ContainerItem { node: Node, precOrderIdx: number };
    export interface GroupsForFlow {
        orderedGroups: GroupForFlow[],
        precOrderContainerItems: ContainerItem[];
        posOrderedNodes: Node[];
        groupToSetOfFlowMap: ESMap< GroupForFlow, Set<FlowNode> >;
        groupToAnteGroupMap: ESMap< GroupForFlow, Set<GroupForFlow> >; // used in updateHeap... but could use flow instead.
        nodeToGroupMap: ESMap< Node, GroupForFlow >;
        dbgFlowToOriginatingGroupIdx: ESMap<FlowNode, number>;
    }

    export interface SourceFileMrState {
        sourceFile: SourceFile;
        groupedFlowNodes: GroupedFlowNodes;
        groupsForFlow: GroupsForFlow,
        mrState: MrState;
        mrNarrow: MrNarrow;
    };

    // interface AccState {
    //     dummy: void;
    // }
    // interface StackItem {
    //     group: FlowNodeGroup;
    //     //refTypes?: RefTypes;
    //     depStackItems: StackItem[];  // the referenced items are "safe" from garbage collection even if stack is popped.
    // }
    interface CurrentBranchesItem {
        refTypesTableReturn: RefTypesTableReturn;
        byNode: NodeToTypeMap;
        done?: boolean
    };


    enum CurrentBranchesElementKind {
        none=0,
        plain=1,
        ifexpr=2
    };
    interface CurrentBranchElementPlain {
        kind: CurrentBranchesElementKind.plain;
        item: CurrentBranchesItem;
    };
    interface CurrentBranchElementIfExpr {
        kind: CurrentBranchesElementKind.ifexpr;
        true?: CurrentBranchesItem;
        false?: CurrentBranchesItem;
    };
    type CurrentBranchElement = CurrentBranchElementPlain | CurrentBranchElementIfExpr;

    // export interface Heaper<T = number> {
    //     heapSortInPlace(h: T[], size: number): void;
    //     heapInsert(h: T[], s: T): void;
    //     heapRemove(h: T[]): T;
    //     heapSize(h: T[]): number;
    //     heapIsEmpty(h: T[]): boolean;
    //     heapPeek(h: T[]): T;
    // };
    export interface Heap {
        _heap: number[];
        _heapset: Set<number>;
        has(n: number): boolean;
        peek(): number;
        isEmpty(): boolean;
        insert(n: number): void;
        remove(): number;
        createSortedCopy(): number[]; // for debug
    };

    export interface MrState {
        //flowNodeGroupToStateMap: ESMap <FlowNodeGroup, AccState>;
        //stack?: FlowNodeGroup[];
        //groupToStackIdx: ESMap<FlowNodeGroup, number>;
//        stack?: StackItem[];
        checker: TypeChecker;
//        currentBranchesMap: ESMap<FlowNodeGroup, CurrentBranchesItem >;
//        groupToNodeToType?: ESMap< FlowNodeGroup, NodeToTypeMap>;
        //symbolToNodeToTypeMap: ESMap< Symbol, NodeToTypeMap>;
        replayableItems: ESMap< Symbol, ReplayableItem >;
        // aliasableAssignmentsCache: ESMap<Symbol, AliasAssignableState>; // not sure it makes sense anymore
        // aliasInlineLevel: number;
        forFlow: {
            heap: Heap; // heap sorted indices into SourceFileMrState.groupsForFlow.orderedGroups
            currentBranchesMap: ESMap< Readonly<GroupForFlow>, CurrentBranchElement >;
            groupToNodeToType?: ESMap< Readonly<GroupForFlow>, NodeToTypeMap >;
        };
    };

    function createHeap(groupsForFlow: GroupsForFlow): Heap {
        const _heap: number[] = [NaN];
        const _heapset = new Set<number>();
        function has(n: number){
            return !!_heapset.has(n);
        }
        function peek(){
            Debug.assert(_heap.length>1);
            return _heap[1];
        }
        function isEmpty(){
            Debug.assert(_heap.length);
            return _heap.length===1;
        }
        const heaper = defineOneIndexingHeaper(
            NaN,
            (i: number,o: number) => groupsForFlow.orderedGroups[i].groupIdx < groupsForFlow.orderedGroups[o].groupIdx,
            (i: number,o: number) => groupsForFlow.orderedGroups[i].groupIdx > groupsForFlow.orderedGroups[o].groupIdx,
        );
        function insert(n: number){
            Debug.assert(!_heapset.has(n));
            _heapset.add(n);
            heaper.heapInsert(_heap, n);
        }
        function remove(){
            Debug.assert(_heap.length>1);
            _heapset.delete(peek());
            return heaper.heapRemove(_heap);
        }
        // for debug
        function createSortedCopy(): number[] {
            const heapcopy = [..._heap];
            heaper.heapSortInPlace(heapcopy, heaper.heapSize(_heap));
            return heapcopy;
        }
        return {
            _heap,
            _heapset,
            has,
            peek,
            isEmpty,
            insert,
            remove,
            createSortedCopy,
        };
    }

    export function createSourceFileInferState(sourceFile: SourceFile, checker: TypeChecker): SourceFileMrState {
        const t0 = process.hrtime.bigint();
        const groupedFlowNodes = groupFlowNodesFromSourceFile(sourceFile);
        const t1 = process.hrtime.bigint() - t0;
        groupedFlowNodes.dbgCreationTimeMs = t1/BigInt(1000000);

        const groupsForFlow = makeGroupsForFlow(sourceFile);

        dbgs = createDbgs(checker);
        //myDebug = getMyDebug();

        const heap = createHeap(groupsForFlow);
        // const heaper = defineOneIndexingHeaper(
        //     0,
        //     (i: number,o: number) => groupsForFlow.orderedGroups[heap[i]].groupIdx < groupsForFlow.orderedGroups[heap[o]].groupIdx,
        //     (i: number,o: number) => groupsForFlow.orderedGroups[heap[i]].groupIdx > groupsForFlow.orderedGroups[heap[o]].groupIdx,
        // );
        // const heapset = new Set<number>();
        const mrState: MrState = {
            //flowNodeGroupToStateMap: new Map <FlowNodeGroup, AccState>(),
            checker,
            //groupToStackIdx: new Map <FlowNodeGroup, number>(),
            //currentBranchesMap: new Map<FlowNodeGroup, CurrentBranchesItem>(),
            //symbolToNodeToTypeMap: new Map<Symbol,NodeToTypeMap>(),
            replayableItems: new Map<Symbol, ReplayableItem>(),
            forFlow: {
                heap,
                currentBranchesMap: new Map< GroupForFlow, CurrentBranchElement >(),
                groupToNodeToType: new Map< GroupForFlow, NodeToTypeMap >(),
            }
        };

        return {
            sourceFile,
            groupedFlowNodes,
            groupsForFlow,
            mrState,
            mrNarrow: createMrNarrow(checker, mrState)
        };
    }

    // function isGroupCached(mrState: MrState, group: FlowNodeGroup){
    //     if (isIfPairFlowNodeGroup(group)){
    //         const tc = mrState.currentBranchesMap.get(group.true);
    //         const fc = mrState.currentBranchesMap.get(group.false);
    //         Debug.assert((!!tc)===(!!fc));
    //         return !!tc;
    //     }
    //     return !!mrState.currentBranchesMap.get(group);
    // }


    // function resolveNodefulGroupUsingState(item: StackItem, _stackIdx: number, sourceFileMrState: SourceFileMrState){
    //     const group = item.group;
    //     if (getMyDebug()) consoleGroup(`resolveNodefulGroupUsingState[in] group: ${dbgs?.dbgFlowNodeGroupToString(group)}`);
    //     Debug.assert(isNodefulFlowNodeGroup(group));
    //     Debug.assert(item.depStackItems.length<=1); // for a nodeful group;
    //     const antecedents = getAntecedentGroups(group);
    //     const currentBranchesItems: CurrentBranchesItem[]=[];
    //     if (getMyDebug())consoleGroup(`resolveNodefulGroupUsingState[dbg]: antecedents:`);
    //     antecedents.forEach(a=>{
    //         if (getMyDebug()) consoleLog(`resolveNodefulGroupUsingState[dbg]: ${dbgs?.dbgFlowNodeGroupToString(a)}`);
    //         const cbi = sourceFileMrState.mrState.currentBranchesMap.get(a);
    //         Debug.assert(!cbi?.done);
    //         //if (cbi?.done) consoleLog(`cbi.done=true, ${dbgs?.dbgFlowNodeGroupToString(a)}`);
    //         if (cbi) currentBranchesItems.push(cbi);
    //         if (getMyDebug()) {
    //             if (!cbi) {
    //                 if (getMyDebug()) consoleLog(`!cbi`);
    //             }
    //             else {
    //                 if (getMyDebug()) consoleLog(`resolveNodefulGroupUsingState[dbg]: cbi.done: ${cbi?.done}, cbi.refTypesTableReturn:`);
    //                 const astr = sourceFileMrState.mrNarrow.dbgRefTypesTableToStrings(cbi.refTypesTableReturn);
    //                 if (getMyDebug()) {
    //                     astr?.forEach(s=>{
    //                         consoleLog(`resolveNodefulGroupUsingState[dbg]: ${s}`);
    //                     });
    //                 }
    //             }
    //         }
    //     });
    //     if (getMyDebug()) {
    //         consoleLog(`resolveNodefulGroupUsingState[dbg]: antecedents end:`);
    //         consoleGroupEnd();
    //     }
    //     Debug.assert(currentBranchesItems.length<=1);
    //     let refTypesSymtab: RefTypesSymtab;
    //     if (currentBranchesItems.length) refTypesSymtab = currentBranchesItems[0].refTypesTableReturn.symtab;
    //     else refTypesSymtab = sourceFileMrState.mrNarrow.createRefTypesSymtab();
    //     const ifPair = isIfPairFlowNodeGroup(group) ? group : undefined;
    //     const condExpr: Expression = getFlowGroupMaximalNode(group) as Expression;
    //     const crit: InferCrit = !ifPair ? { kind: InferCritKind.none } : { kind: InferCritKind.truthy, alsoFailing: true };
    //     const inferStatus: InferStatus = {
    //         inCondition: !!ifPair,
    //         replayItemStack: [],
    //         replayables: sourceFileMrState.mrState.replayableItems
    //     };
    //     const retval: MrNarrowTypesReturn = sourceFileMrState.mrNarrow.mrNarrowTypes({ refTypesSymtab, condExpr , crit, qdotfallout: undefined, inferStatus });
    //     if (ifPair){
    //         sourceFileMrState.mrState.currentBranchesMap.set(ifPair.true, { refTypesTableReturn: retval.inferRefRtnType.passing, byNode: retval.byNode });
    //         sourceFileMrState.mrState.currentBranchesMap.set(ifPair.false, { refTypesTableReturn: retval.inferRefRtnType.failing!, byNode: retval.byNode });
    //     }
    //     else {
    //         sourceFileMrState.mrState.currentBranchesMap.set(group, { refTypesTableReturn: retval.inferRefRtnType.passing, byNode: retval.byNode });
    //     }
    //     if (currentBranchesItems.length) currentBranchesItems[0].done=true;
    //     if (!sourceFileMrState.mrState.groupToNodeToType) sourceFileMrState.mrState.groupToNodeToType = new Map<FlowNodeGroup, NodeToTypeMap>();
    //     sourceFileMrState.mrState.groupToNodeToType.set(group, retval.byNode);
    //     if (getMyDebug()) {
    //         consoleLog(`resolveNodefulGroupUsingState[out] group: ${dbgs?.dbgFlowNodeGroupToString(group)}`);
    //         consoleGroupEnd();
    //     }
    // }

    /**
     *
     * @param group
     * @param sourceFileMrState
     */
    export function updateHeapWithGroupForFlow(group: Readonly<GroupForFlow>, sourceFileMrState: SourceFileMrState): void {
        Debug.assert(sourceFileMrState.mrState.forFlow.heap.isEmpty());
        // @ ts-expect-error
        const mrState = sourceFileMrState.mrState;
        // @ ts-expect-error
        const groupsForFlow = sourceFileMrState.groupsForFlow;
        if (getMyDebug()) {
            const maximalNode = groupsForFlow.posOrderedNodes[group.maximalIdx];
            consoleGroup(`updateHeapWithGroupForFlow[in]: group: {maximalNode: ${dbgs?.dbgNodeToString(maximalNode)}}`);
        }
        /**
         * Currently requiring heap to be empty - so a simple sort could be used instead.
         * However, if heap were were to be added to on the fly, while resolving, heap will be useful.
         */
        // @ ts-expect-error
        const acc = new Set<GroupForFlow>();
        let tmpacc0 = new Set<GroupForFlow>();
        let change = true;
        if (!mrState.forFlow.currentBranchesMap.get(group)){
            tmpacc0.add(group);
            acc.add(group);
        }
        while (change){
            change = false;
            let tmpacc1 = new Set<GroupForFlow>();
            tmpacc0.forEach(g=>{
                const setAnteg = groupsForFlow.groupToAnteGroupMap.get(g);
                if (!setAnteg) return;
                setAnteg.forEach(anteg=>{
                    if (!mrState.forFlow.currentBranchesMap.get(anteg)){
                        tmpacc1.add(anteg);
                        acc.add(anteg);
                        change = true;
                    }
                });
            });
            [tmpacc0, tmpacc1] = [tmpacc1, tmpacc0];
            tmpacc1.clear();
        }
        acc.forEach(g=>{
            mrState.forFlow.heap.insert(g.groupIdx);
        });
        if (getMyDebug()) {
            const sortedHeap1Idx = mrState.forFlow.heap.createSortedCopy();
            for (let idx = 1; idx< sortedHeap1Idx.length; idx++) {
                const nidx = sortedHeap1Idx[idx];
                const group = groupsForFlow.orderedGroups[nidx];
                const maxnode = groupsForFlow.posOrderedNodes[group.maximalIdx];
                const str = `updateHeapWithGroupForFlow[dbg] heap[${idx}=>${nidx}] ${dbgs?.dbgNodeToString(maxnode)}`;
                consoleLog("  "+str);
            }
            const maximalNode = groupsForFlow.posOrderedNodes[group.maximalIdx];
            consoleLog(`updateHeapWithGroupForFlow[out]: group: {maximalNode: ${dbgs?.dbgNodeToString(maximalNode)}}`);
            consoleGroupEnd();
        }
    }

    /**
     *
     * @param sourceFileMrState
     */
    function resolveHeap(sourceFileMrState: SourceFileMrState): void {
        const mrState = sourceFileMrState.mrState;
        const groupsForFlow = sourceFileMrState.groupsForFlow;
        const heap = mrState.forFlow.heap;
        while (!heap.isEmpty()){
            const groupIdx = heap.remove();
            // @ ts-expect-error
            const groupForFlow = groupsForFlow.orderedGroups[groupIdx];
            let debugCheck = true;
            debugCheck = true;
            if (debugCheck) {
                const setOfAnteGroups =groupsForFlow.groupToAnteGroupMap.get(groupForFlow);
                if (groupForFlow.branchMerger) Debug.assert(setOfAnteGroups);
                if (setOfAnteGroups){
                    setOfAnteGroups.forEach(ag=>{
                        Debug.assert(!heap.has(ag.groupIdx));
                        //const cbe = mrState.forFlow.currentBranchesMap.get(ag);
                    });
                }
            }
            resolveGroupForFlow(groupForFlow, sourceFileMrState);
        }
    }

    function resolveGroupForFlow(groupForFlow: Readonly<GroupForFlow>, sourceFileMrState: SourceFileMrState): void {
        const groupsForFlow = sourceFileMrState.groupsForFlow;
        const mrState = sourceFileMrState.mrState;
        //const setOfAnteGroups =groupsForFlow.groupToAnteGroupMap.get(groupForFlow)!;
        const setOfFlow =groupsForFlow.groupToSetOfFlowMap.get(groupForFlow);
        const maximalNode = groupsForFlow.posOrderedNodes[groupForFlow.maximalIdx];
        if (getMyDebug()){
            consoleGroup(`resolveGroupForFlow[in]: ${dbgs?.dbgNodeToString(maximalNode)}, trueref: ${groupForFlow.trueref}, falseref: ${groupForFlow.trueref}`);
            consoleLog(`resolveGroupForFlow[dbg:] currentBranchesMap[before]:`);
            dbgCurrentBranchesMap(sourceFileMrState).forEach(s=>consoleLog(`  ${s}`));
            consoleLog(`resolveGroupForFlow[dbg:] endof currentBranchesMap[before]:`);
        }

        //let rttr: RefTypesTableReturn;
        //let byNode: NodeToTypeMap;
        let refTypesSymtab: RefTypesSymtab | undefined;

        if (setOfFlow){
            //let setOfAnteGroups = new Set<GroupForFlow>();
            let hadBranch = false;
            let hadNonBranch = false;
            const arrRttrBranch: RefTypesTableReturn[] = [];
            setOfFlow.forEach(fn=>{
                // other than Start flows, there should be only one flow
                Debug.assert(!hadBranch);
                Debug.assert(!hadNonBranch);
                if (isFlowStart(fn)) return;
                if (isFlowBranch(fn)){
                    hadBranch = true;
                    fn.antecedents?.forEach(antefn=>{
                        if (isFlowStart(antefn)) return;
                        if (isFlowBranch(antefn)) Debug.fail();
                        if (!isFlowWithNode(antefn)) Debug.fail();
                        const anteg = groupsForFlow.nodeToGroupMap.get(antefn.node);
                        Debug.assert(anteg);
                        // if (setOfAnteGroups.has(anteg)) return;
                        // setOfAnteGroups.add(anteg);
                        const cbe = mrState.forFlow.currentBranchesMap.get(anteg);
                        Debug.assert(cbe);
                        if (isFlowCondition(antefn)){
                            Debug.assert(cbe.kind===CurrentBranchesElementKind.ifexpr);
                            if (antefn.flags & FlowFlags.TrueCondition){
                                Debug.assert(cbe.true);
                                arrRttrBranch.push(cbe.true.refTypesTableReturn);
                            }
                            else if (antefn.flags & FlowFlags.FalseCondition){
                                Debug.assert(cbe.false);
                                arrRttrBranch.push(cbe.false.refTypesTableReturn);
                            }
                            else Debug.fail();
                        }
                        else {
                            Debug.assert(cbe.kind===CurrentBranchesElementKind.plain);
                            arrRttrBranch.push(cbe.item.refTypesTableReturn);
                        }
                    });
                }
                else {
                    hadNonBranch = true;
                    if (!isFlowWithNode(fn)) Debug.fail();
                    const anteg = groupsForFlow.nodeToGroupMap.get(fn.node);
                    Debug.assert(anteg);
                    const cbe = mrState.forFlow.currentBranchesMap.get(anteg);
                    Debug.assert(cbe);
                    if (isFlowCondition(fn)){
                        if (cbe.kind!==CurrentBranchesElementKind.ifexpr) {
                            Debug.fail();
                        }
                        if (fn.flags & FlowFlags.TrueCondition){
                            Debug.assert(cbe.true);
                            refTypesSymtab = cbe.true.refTypesTableReturn.symtab;
                            //arrRttrBranch.push(cbe.true.refTypesTableReturn);
                        }
                        else if (fn.flags & FlowFlags.FalseCondition){
                            Debug.assert(cbe.false);
                            refTypesSymtab = cbe.false.refTypesTableReturn.symtab;
                            //arrRttrBranch.push(cbe.false.refTypesTableReturn);
                        }
                        else Debug.fail();
                    }
                    else {
                        // sourceFileMrState.mrNarrow.mergeArrRefTypesTableReturnToRefTypesTableReturn(
                        //     undefined, undefined,
                        Debug.assert(cbe.kind===CurrentBranchesElementKind.plain);
                        refTypesSymtab = cbe.item.refTypesTableReturn.symtab;
                        //arrRttrBranch.push(cbe.item.refTypesTableReturn);
                    }
                }
            });
            if (hadBranch) {
                refTypesSymtab = sourceFileMrState.mrNarrow.mergeArrRefTypesTableReturnToRefTypesTableReturn(/*symbol*/ undefined, /* isconst */ undefined, arrRttrBranch).symtab;
            }
        }
        if (!refTypesSymtab) refTypesSymtab = sourceFileMrState.mrNarrow.createRefTypesSymtab();

        const ifExpr = (groupForFlow.falseref || groupForFlow.trueref);
        const crit: InferCrit = !ifExpr ? { kind: InferCritKind.none } : { kind: InferCritKind.truthy, alsoFailing: true };
        const inferStatus: InferStatus = {
            inCondition: !!ifExpr,
            replayItemStack: [],
            replayables: sourceFileMrState.mrState.replayableItems
        };
        const retval: MrNarrowTypesReturn = sourceFileMrState.mrNarrow.mrNarrowTypes({ refTypesSymtab, condExpr:maximalNode, crit, qdotfallout: undefined, inferStatus });

        if (ifExpr){
            const cbe: CurrentBranchElementIfExpr = {
                kind: CurrentBranchesElementKind.ifexpr,
                false: { refTypesTableReturn: retval.inferRefRtnType.failing!, byNode: retval.byNode },
                true: { refTypesTableReturn: retval.inferRefRtnType.passing, byNode: retval.byNode }
            };
            sourceFileMrState.mrState.forFlow.currentBranchesMap.set(groupForFlow, cbe);
        }
        else {
            const cbe: CurrentBranchElementPlain = {
                kind: CurrentBranchesElementKind.plain,
                item: { refTypesTableReturn: retval.inferRefRtnType.passing, byNode: retval.byNode }
            };
            sourceFileMrState.mrState.forFlow.currentBranchesMap.set(groupForFlow, cbe);
        }
        //if (currentBranchesItems.length) currentBranchesItems[0].done=true;
        if (!sourceFileMrState.mrState.forFlow.groupToNodeToType) sourceFileMrState.mrState.forFlow.groupToNodeToType = new Map<GroupForFlow, NodeToTypeMap>();
        sourceFileMrState.mrState.forFlow.groupToNodeToType.set(groupForFlow, retval.byNode);
        if (getMyDebug()){
            consoleLog(`resolveGroupForFlow[dbg:] currentBranchesMap[after]:`);
            dbgCurrentBranchesMap(sourceFileMrState).forEach(s=>consoleLog(`  ${s}`));
            consoleLog(`resolveGroupForFlow[dbg:] endof currentBranchesMap[after]:`);
            consoleLog(`resolveGroupForFlow[out]: ${dbgs?.dbgNodeToString(maximalNode)}`);
            consoleGroupEnd();
        }
    }


    // consoleLog(`currentBranchesMap:`);
    // mrState.forFlow.currentBranchesMap.forEach((cbe,g)=>{
    //     const maximalNode = groupsForFlow.posOrderedNodes[g.maximalIdx];
    //     consoleLog(`[${dbgs?.dbgNodeToString(maximalNode)}]:`);
    //     if (cbe.kind===CurrentBranchesElementKind.plain){
    //         cbe.item.byNode;
    //         cbe.item.refTypesTableReturn;
    //     }

    // });


    // function createDependencyStack(group: Readonly<FlowNodeGroup>, _sourceFileMrState: SourceFileMrState): void {
    //     const mrState = _sourceFileMrState.mrState;
    //     if (getMyDebug()) consoleGroup(`createDependencyStack[in] group: ${dbgs?.dbgFlowNodeGroupToString(group)}`);
    //     const acc = new Set<FlowNodeGroup>();
    //     let change = true;
    //     if (!isGroupCached(mrState, group)) {
    //         acc.add(group);
    //         getAntecedentGroups(group).forEach(a=>{
    //             if (!isGroupCached(mrState, a) && !acc.has(a)){
    //                 change = true;
    //                 acc.add(a);
    //             }
    //         });
    //     }
    //     while (change) {
    //         change = false;
    //         acc.forEach(g=>{
    //             getAntecedentGroups(g).forEach(a=>{
    //                 if (!isGroupCached(mrState, a) && !acc.has(a)){
    //                     change = true;
    //                     acc.add(a);
    //                 }
    //             });
    //         });
    //     }
    //     /**
    //      * acc will tend to be in descending order, so sorting in descending order is probably less work.
    //      */
    //     // @ts-expect-error 2679
    //     const depGroups: FlowNodeGroup[]= Array.from(acc.keys());
    //     //const idxrefs: number[]=Array(depGroups.length).map((_,i)=>i);
    //     const compare = (xr: FlowNodeGroup, yr: FlowNodeGroup) => {
    //         const ix = getOrdinal(xr);
    //         const iy = getOrdinal(yr);
    //         return iy-ix;
    //     };
    //     depGroups.sort(compare);
    //     /**
    //      * Working the stack with pop, descending order is preferred.
    //      */
    //     //const stack = idxrefs.map(i=>depGroups[i]);
    //     const groupToStackIdx = new Map<FlowNodeGroup, number>(depGroups.map((g,i)=>[g,i]));
    //     const stack: StackItem[] = depGroups.map((group)=>({
    //         depStackItems: [], group
    //     }));
    //     stack.forEach(si=>{
    //         getAntecedentGroups(si.group).forEach(a=>{
    //             const idx = groupToStackIdx.get(a);
    //             // Debug.assert(idx!==undefined);
    //             if (idx!==undefined) si.depStackItems.push(stack[idx]);
    //         });
    //     });
    //     mrState.stack = stack;
    //     mrState.groupToStackIdx = groupToStackIdx;
    //     if (getMyDebug()){
    //         consoleLogStack(mrState);
    //         consoleLog(`createDependencyStack[out] group: ${dbgs?.dbgFlowNodeGroupToString(group)}`);
    //         consoleGroupEnd();
    //     }
    // }

    // export function resolveDependencyStack(_sourceFileMrState: SourceFileMrState): void{
    //     if (getMyDebug()) consoleGroup("resolveDependencyStack[in]");
    //     resolveDependencyStack_aux(_sourceFileMrState);
    //     if (getMyDebug()) {
    //         consoleLog("resolveDependencyStack[out]");
    //         consoleGroupEnd();
    //     }
    // }


    // export function resolveDependencyStack_aux(_sourceFileMrState: SourceFileMrState): void{
    //     const stack = _sourceFileMrState.mrState.stack;
    //     Debug.assert(stack);
    //     while (stack.length){
    //         const item = stack.pop()!;
    //         if (isNodelessFlowNodeGroup(item.group)){
    //             if (item.group.flow.flags & FlowFlags.Start) continue;
    //             if (item.group.flow.flags & FlowFlags.BranchLabel){
    //                 // @ts-ignore-error 2769
    //                 const antecedentGroups: FlowNodeGroup[] = Array.from(item.group.antecedentGroups.keys());
    //                 const arrRtr = antecedentGroups.filter(a => {
    //                     if (isNodelessFlowNodeGroup(a)){
    //                         if (isFlowStart(a.flow)) return;
    //                         Debug.fail();
    //                     }
    //                     else {
    //                         return a;
    //                     }
    //                 }).map(a=>{
    //                     const cbi = _sourceFileMrState.mrState.currentBranchesMap.get(a);
    //                     Debug.assert(cbi);
    //                     Debug.assert(!cbi.done);
    //                     Debug.assert(cbi.refTypesTableReturn);
    //                     return cbi.refTypesTableReturn;
    //                 });
    //                 _sourceFileMrState.mrState.currentBranchesMap.set(item.group, {
    //                     refTypesTableReturn: _sourceFileMrState.mrNarrow.mergeArrRefTypesTableReturnToRefTypesTableReturn(/*symbol*/ undefined, /* isconst */ undefined, arrRtr),
    //                     byNode: new Map<Node,Type>() // no need?
    //                 });
    //                 continue;
    //             }
    //             // branches, loops, functions, switch, etc, go here.
    //             Debug.fail(Debug.formatFlowFlags(item.group.flow.flags));
    //         }
    //         else if (isNodefulFlowNodeGroup(item.group)) {
    //             resolveNodefulGroupUsingState(item, stack.length, _sourceFileMrState);
    //         }
    //     }
    // }

    export function getTypeByMrNarrow(reference: Node, sourceFileMrState: SourceFileMrState): Type {
        if (getMyDebug()) consoleGroup(`getTypeByMrNarrow[in] expr: ${dbgs?.dbgNodeToString(reference)}`);
        //let type: Type;
        // let useGroupForFlow = true;
        // useGroupForFlow = true;
        // if (useGroupForFlow)
        const type = getTypeByMrNarrowAux(reference, sourceFileMrState);
        //else type = getTypeByMrNarrow_aux(reference, sourceFileMrState);
        if (getMyDebug()){
            consoleLog(`getTypeByMrNarrow[out] expr: ${dbgs?.dbgNodeToString(reference)} -> ${dbgs?.dbgTypeToString(type)}`);
            consoleGroupEnd();
        }
        return type;
    }

    // export function getTypeByMrNarrow_aux(expr: Node, sourceFileMrState: SourceFileMrState): Type {

    //     const grouped = sourceFileMrState.groupedFlowNodes;
    //     Debug.assert(grouped);
    //     //const nodeGroup = grouped.groupedNodes.nodeToOwnNodeGroupMap.get(reference);
    //     const flowGroup = (()=>{
    //         let parent = expr;
    //         let fg = grouped.nodeToFlowGroupMap.get(expr);
    //         if (fg) return fg;
    //         while (!fg && parent && parent.kind!==SyntaxKind.SourceFile && !(fg=grouped.nodeToFlowGroupMap.get(parent))) parent = parent.parent;
    //         return fg;
    //     })();

    //     if (!flowGroup){
    //         if (getMyDebug()){
    //             consoleLog(`getTypeByMrNarrow[dbg]: reference: ${dbgs!.dbgNodeToString(expr)}, does not have flowGroup`);
    //             //return sourceFileMrState.mrState.checker.getErrorType();
    //             Debug.fail();
    //         }
    //     }
    //     else {
    //         if (getMyDebug()){
    //             consoleLog(`getTypeByMrNarrow[dbg]: reference: ${dbgs!.dbgNodeToString(expr)}, flowGroup: ${dbgs!.dbgFlowNodeGroupToString(flowGroup)}`);
    //             const fToFG2 = grouped.flowNodeToGroupMap.get(expr.flowNode!);
    //             const str2 = `grouped.flowNodeToGroupMap.get(reference.flowNode): ${dbgs!.dbgFlowNodeGroupToString(fToFG2)}`;
    //             consoleLog("getTypeByMrNarrow[dbg]: "+str2);
    //             const nToFG2 = (expr.flowNode as any)?.node ? grouped.nodeToFlowGroupMap.get((expr.flowNode as any).node) : undefined;
    //             const str3 = `grouped.nodeToFlowGroupMap.get(reference.flowNode.node): ${dbgs!.dbgFlowNodeGroupToString(nToFG2)}`;
    //             consoleLog("getTypeByMrNarrow[dbg]: "+str3);
    //         }
    //         // getTypeByMrNarrow(reference, sourceFileInferState)
    //         createDependencyStack(flowGroup, sourceFileMrState);
    //         resolveDependencyStack(sourceFileMrState);
    //     }
    //     return sourceFileMrState.mrState.groupToNodeToType?.get(flowGroup!)?.get(expr) ?? sourceFileMrState.mrState.checker.getErrorType();
    // }

    export function getTypeByMrNarrowAux(expr: Node, sourceFileMrState: SourceFileMrState): Type {

        const groupsForFlow = sourceFileMrState.groupsForFlow;
        const groupForFlow = (()=>{
            let parent = expr;
            let fg = groupsForFlow.nodeToGroupMap.get(expr);
            if (fg) return fg;
            while (!fg && parent && parent.kind!==SyntaxKind.SourceFile && !(fg=groupsForFlow.nodeToGroupMap.get(parent))) parent = parent.parent;
            return fg;
        })();
        if (!groupForFlow){
            if (getMyDebug()){
                consoleLog(`getTypeByMrNarrowAux[dbg]: reference: ${dbgs!.dbgNodeToString(expr)}, does not have flowGroup`);
                //return sourceFileMrState.mrState.checker.getErrorType();
            }
            Debug.fail();
        }
        if (getMyDebug()){
            const maxnode = sourceFileMrState.groupsForFlow.posOrderedNodes[groupForFlow.maximalIdx];
            consoleLog(`getTypeByMrNarrowAux[dbg]: reference: ${dbgs!.dbgNodeToString(expr)}, maximalNode: ${dbgs!.dbgNodeToString(maxnode)}`);
        }
        updateHeapWithGroupForFlow(groupForFlow,sourceFileMrState);
        resolveHeap(sourceFileMrState);
        return sourceFileMrState.mrState.forFlow.groupToNodeToType?.get(groupForFlow)?.get(expr) ?? sourceFileMrState.mrState.checker.getErrorType();

    }


    // function consoleLogStack(mrState: MrState){
    //     if (getMyDebug()) consoleGroup("mrState.stack:");
    //     if (!mrState.stack) {
    //         if (getMyDebug()) consoleLog("stack empty");
    //         return;
    //     }
    //     for (let i = mrState.stack.length-1; i>= 0; i--){
    //         if (getMyDebug()) consoleLog(`[#${i}]: ${dbgs!.dbgFlowNodeGroupToString(mrState.stack[i].group)}`);
    //         const str = ` deps: ` + mrState.stack[i].depStackItems.map(si=>mrState.groupToStackIdx.get(si.group)!).map(i=>`${i}, `).join();
    //         if (getMyDebug()) consoleLog(str);
    //     }
    //     if (getMyDebug()) consoleGroupEnd();
    // }


    function dbgCurrentBranchesMap(sourceFileMrState: SourceFileMrState): string[]{
        const groupsForFlow = sourceFileMrState.groupsForFlow;
        const mrState = sourceFileMrState.mrState;
        const cbm = mrState.forFlow.currentBranchesMap;
        const astr: string[] = [];
        const doNodeToTypeMap = (m: Readonly<NodeToTypeMap>): string[]=>{
            const astr: string[] = [];
            m.forEach((t,n)=>{
                astr.push(`[node:${dbgs?.dbgNodeToString(n)}] -> type:${dbgs?.dbgTypeToString(t)}`);
            });
            return astr;
        };
        const doItem = (cbi: CurrentBranchesItem): string[]=>{
            const astr: string[] = [];
            astr.push(`nodeToTypeMap:`);
            astr.push(...doNodeToTypeMap(cbi.byNode).map(s => "  "+s));
            astr.push(`refTypesTableReturn:`);
            astr.push(...sourceFileMrState.mrNarrow.dbgRefTypesTableToStrings(cbi.refTypesTableReturn).map(s => "  "+s));
            return astr;
        };
        cbm.forEach((cbe,g)=>{
            const maximalNode = groupsForFlow.posOrderedNodes[g.maximalIdx];
            astr.push(`[${dbgs?.dbgNodeToString(maximalNode)}]:`);
            astr.push(`  cbe.kind:${cbe.kind}`);
            if (cbe.kind===CurrentBranchesElementKind.plain){
                astr.push(...doItem(cbe.item).map(s => "    "+s));
            }
            else if (cbe.kind===CurrentBranchesElementKind.ifexpr){
                if (cbe.true){
                    astr.push("    true:");
                    astr.push(...doItem(cbe.true).map(s => "      "+s));
                }
                if (cbe.false){
                    astr.push("    false:");
                    astr.push(...doItem(cbe.false).map(s => "      "+s));
                }
            }
        });
        return astr;
    }
}
