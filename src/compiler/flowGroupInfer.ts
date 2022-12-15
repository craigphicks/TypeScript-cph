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
        dbgCreationTimeMs?: bigint;
        groupToFlowLabels: ESMap<GroupForFlow, Set<FlowLabel>>
    }

    export interface SourceFileMrState {
        sourceFile: SourceFile;
        //groupedFlowNodes: GroupedFlowNodes;
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
        tf=2
    };
    interface CurrentBranchElementPlain {
        kind: CurrentBranchesElementKind.plain;
        gff: GroupForFlow;
        item: CurrentBranchesItem;
    };
    interface CurrentBranchElementTF {
        kind: CurrentBranchesElementKind.tf;
        gff: GroupForFlow;
        truthy?: CurrentBranchesItem;
        falsy?: CurrentBranchesItem;
    };
    type CurrentBranchElement = CurrentBranchElementPlain | CurrentBranchElementTF;

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
        //const t0 = process.hrtime.bigint();
        //const groupedFlowNodes = groupFlowNodesFromSourceFile(sourceFile);
        //const t1 = process.hrtime.bigint() - t0;
        //groupedFlowNodes.dbgCreationTimeMs = t1/BigInt(1000000);

        const t0 = process.hrtime.bigint();
        const groupsForFlow = makeGroupsForFlow(sourceFile, checker);
        if (getMyDebug()){
            // just to set up the ids for debugging
            sourceFile.allFlowNodes?.forEach(fn=>checker.getFlowNodeId(fn));
        }
        const t1 = process.hrtime.bigint() - t0;
        groupsForFlow.dbgCreationTimeMs = t1/BigInt(1000000);

        dbgs = createDbgs(checker);
        //groupedFlowNodes.dbgCreationTimeMs = t1/BigInt(1000000);
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
            //groupedFlowNodes,
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
            if (!setOfFlow) consoleLog(`resolveGroupForFlow[dbg:], setOfFlow: undefined`);
            else {
                consoleLog(`resolveGroupForFlow[dbg:] setOfFlow:{`);
                setOfFlow?.forEach(fn=>{
                    consoleLog(`resolveGroupForFlow[dbg:]   ${dbgs!.dbgFlowToString(fn, /* */ true)},`);
                });
                consoleLog(`resolveGroupForFlow[dbg:] }`);
            }
        }
        // @ts-expect-error
        const setCbi = new Set<{cbi: CurrentBranchesItem, gff: GroupForFlow}>();
        const mapCbe = new Map<CurrentBranchElement, BranchKind | undefined>();
        if (setOfFlow){
            let hadBranch = false;
            let hadNonBranch = false;
            setOfFlow.forEach(fn=>{
                // other than Start flows, there should be only one flow
                Debug.assert(!hadBranch);
                Debug.assert(!hadNonBranch);
                if (isFlowStart(fn)) return;
                if (isFlowBranch(fn)){
                    hadBranch = true;
                    if (getMyDebug()){
                        consoleLog(`resolveGroupForFlow[dbg:] FlowLabel: {branchKind:${fn.branchKind}}`);
                    }
                    fn.antecedents?.forEach(antefn=>{
                        if (isFlowStart(antefn)) return;
                        if (isFlowBranch(antefn)) return; //Debug.fail();
                        if (!isFlowWithNode(antefn)) Debug.fail();
                        const anteg = groupsForFlow.nodeToGroupMap.get(antefn.node);
                        Debug.assert(anteg);
                        const cbe = mrState.forFlow.currentBranchesMap.get(anteg);
                        Debug.assert(cbe);
                        if (!mapCbe.has(cbe)) mapCbe.set(cbe,fn.branchKind);
                        else {
                            const bk = mapCbe.get(cbe);
                            Debug.assert(bk===fn.branchKind);
                        }
                    });
                    return;

                    // const setOfAnteg = new Set<GroupForFlow>();
                    // fn.antecedents?.forEach(antefn=>{
                    //     if (isFlowStart(antefn)) return;
                    //     if (isFlowBranch(antefn)) return; //Debug.fail();
                    //     if (!isFlowWithNode(antefn)) Debug.fail();
                    //     const anteg = groupsForFlow.nodeToGroupMap.get(antefn.node);
                    //     Debug.assert(anteg);
                    //     setOfAnteg.add(anteg);
                    // });
                    // Debug.assert(setOfAnteg.size===1);

                    // fn.antecedents?.forEach(antefn=>{
                    //     if (isFlowStart(antefn)) return;
                    //     if (isFlowBranch(antefn)) return; //Debug.fail();
                    //     if (!isFlowWithNode(antefn)) Debug.fail();
                    //     const anteg = groupsForFlow.nodeToGroupMap.get(antefn.node);
                    //     Debug.assert(anteg);
                    //     // if (setOfAnteGroups.has(anteg)) return;
                    //     // setOfAnteGroups.add(anteg);
                    //     const cbe = mrState.forFlow.currentBranchesMap.get(anteg);
                    //     Debug.assert(cbe);
                    //     if (isFlowCondition(antefn)){
                    //         Debug.assert(cbe.kind===CurrentBranchesElementKind.tf);
                    //         if (antefn.flags & FlowFlags.TrueCondition){
                    //             Debug.assert(cbe.truthy);
                    //             setCbi.add({ cbi:cbe.truthy, gff:anteg });
                    //         }
                    //         else if (antefn.flags & FlowFlags.FalseCondition){
                    //             Debug.assert(cbe.falsy);
                    //             setCbi.add({ cbi:cbe.falsy, gff:anteg });
                    //         }
                    //         else Debug.fail();
                    //     }
                    //     else {
                    //         Debug.assert(cbe.kind===CurrentBranchesElementKind.plain);
                    //         setCbi.add({ cbi:cbe.item,gff:anteg });
                    //     }
                    // });
                }
                else {
                    hadNonBranch = true;
                    if (!isFlowWithNode(fn)) Debug.fail();
                    const anteg = groupsForFlow.nodeToGroupMap.get(fn.node);
                    Debug.assert(anteg);
                    const cbe = mrState.forFlow.currentBranchesMap.get(anteg);
                    Debug.assert(cbe);
                    if (isFlowCondition(fn)){
                        Debug.fail();
                        // if (cbe.kind!==CurrentBranchesElementKind.tf) {
                        //     Debug.fail();
                        // }
                        // if (fn.flags & FlowFlags.TrueCondition){
                        //     Debug.assert(cbe.truthy);
                        //     //Debug.assert(cbe.truthy.arrRefTypesTableReturn.length===1);
                        //     setCbi.add({ cbi:cbe.truthy, gff:anteg });
                        //     //setCbi.add(cbe.truthy);
                        //     //arefTypesSymtab.push(cbe.truthy.arrRefTypesTableReturn[0].symtab);
                        //     //arrRttrBranch.push(cbe.true.refTypesTableReturn);
                        // }
                        // else if (fn.flags & FlowFlags.FalseCondition){
                        //     Debug.assert(cbe.falsy);
                        //     //Debug.assert(cbe.falsy.arrRefTypesTableReturn.length===1);
                        //     setCbi.add({ cbi:cbe.falsy, gff:anteg });
                        //     //setCbi.add(cbe.falsy);
                        //     //arefTypesSymtab.push(...cbe.falsy.arrRefTypesTableReturn.map(rttr=>rttr.symtab));
                        //     //arrRttrBranch.push(cbe.false.refTypesTableReturn);
                        // }
                        // else Debug.fail();
                    }
                    else {
                        Debug.assert(cbe.kind===CurrentBranchesElementKind.plain);
                        if (!mapCbe.has(cbe)) mapCbe.set(cbe, undefined);
                        else if (mapCbe.get(cbe)) Debug.fail();
                        return;
                        //setCbi.add({ cbi:cbe.item, gff: anteg });
                    }
                }
            });
        }

        const boolsplit = (groupForFlow.falseref || groupForFlow.trueref);
        const crit: InferCrit = !boolsplit ? { kind: InferCritKind.none } : { kind: InferCritKind.truthy, alsoFailing: true };
        const inferStatus: InferStatus = {
            inCondition: !!boolsplit,
            replayItemStack: [],
            replayables: sourceFileMrState.mrState.replayableItems
        };

        if (getMyDebug()){
            const as: string[]=["resolveGroupForFlow:mapCbe:["];
            mapCbe.forEach((bk,cbe)=>{
                as.push(`  gff.groupIndex:${cbe.gff.groupIdx}, branchKind:${bk}`);
            });
            // const as: string[]=["resolveGroupForFlow: ante groups:["];
            // setCbi.forEach(x=>{
            //     as.push(`resolveGroupForFlow:   anteg.groupIdx: ${x.gff.groupIdx}`);
            // });
            as.push("resolveGroupForFlow:mapCbe:]");
            as.forEach(s=>consoleLog(s));
        }

        let retval: MrNarrowTypesReturn;
        {
            /**
             * Merge branches - each of ConstraintItem(s), RefTypeSymtab(s)
             */
            let constraintItemMerged: ConstraintItem | undefined;
            let refTypesSymtabMerged: RefTypesSymtab | undefined;
            if (mapCbe.size===1) {
                const [cbe,bk] = mapCbe.entries().next().value as [CurrentBranchElement, BranchKind | undefined];
                if (cbe.kind===CurrentBranchesElementKind.tf){
                    if (bk===BranchKind.then) {
                        ({ constraintItem:constraintItemMerged, symtab:refTypesSymtabMerged } = cbe.truthy!.refTypesTableReturn);
                    }
                    else if (bk===BranchKind.else) {
                        ({ constraintItem:constraintItemMerged, symtab:refTypesSymtabMerged } = cbe.falsy!.refTypesTableReturn);
                    }
                    else Debug.fail();
                }
                else if (cbe.kind===CurrentBranchesElementKind.plain){
                    Debug.assert(bk!==BranchKind.then && bk!==BranchKind.else);
                    ({ constraintItem:constraintItemMerged, symtab:refTypesSymtabMerged } = cbe.item.refTypesTableReturn);
                    if (bk===BranchKind.postIf) Debug.fail("TODO");
                }
                else Debug.fail();
            }
            else if (mapCbe.size) {
                const constraints: ConstraintItem[]=[];
                const symtabs: RefTypesSymtab[] = [];
                mapCbe.forEach((bk,cbe)=>{
                    if (cbe.kind===CurrentBranchesElementKind.tf){
                        if (bk===BranchKind.then) {
                            const { constraintItem, symtab } = cbe.truthy!.refTypesTableReturn;
                            if (constraintItem) constraints.push(constraintItem);
                            if (symtab) symtabs.push(symtab);
                        }
                        else if (bk===BranchKind.else) {
                            const { constraintItem, symtab } = cbe.falsy!.refTypesTableReturn;
                            if (constraintItem) constraints.push(constraintItem);
                            if (symtab) symtabs.push(symtab);
                        }
                        else Debug.fail();
                    }
                    else if (cbe.kind===CurrentBranchesElementKind.plain){
                        Debug.assert(bk!==BranchKind.then && bk!==BranchKind.else);
                        const { constraintItem, symtab } = cbe.item.refTypesTableReturn;
                        if (constraintItem) constraints.push(constraintItem);
                        if (symtab) symtabs.push(symtab);
                        if (bk===BranchKind.postIf) Debug.fail("TODO");
                    }
                    else Debug.fail();
                });
                if (symtabs.length===1) refTypesSymtabMerged = symtabs[0];
                else if (symtabs.length){
                    refTypesSymtabMerged = sourceFileMrState.mrNarrow.mergeArrRefTypesSymtab(symtabs);
                }
                if (constraints.length===1) constraintItemMerged = constraints[0];
                else if (constraints.length) {
                    // Because constraints are comprised of constants only, they can't be affected by overwrites at a lower level,
                    // therefore there should not ever be more than one constraint here.
                    Debug.fail("expecting 0 or 1 constraints only");
                }
            }
            if (!refTypesSymtabMerged) refTypesSymtabMerged = sourceFileMrState.mrNarrow.createRefTypesSymtab();
            // if (setCbi.size===1) constraintItem = (setCbi.keys().next().value as {cbi: CurrentBranchesItem}).cbi.refTypesTableReturn.constraintItem;
            // else if (setCbi.size) {
            //     const constraints: ConstraintItem[]=[];
            //     setCbi.forEach(x=>{
            //         if (x.cbi.refTypesTableReturn.constraintItem) constraints.push(x.cbi.refTypesTableReturn.constraintItem);
            //     });
            //     // Because constraints are comprised of constants only, they can't be affected by overwrites at a lower level,
            //     // therefore there should not ever be more than one constraint here.
            //     if (constraints.length===1) constraintItem = constraints[0];
            //     else if (constraints.length) {
            //         Debug.fail("expecting 0 or 1 constraints only");
            //     }
            // }

            // const arefTypesSymtab: RefTypesSymtab[] = [];
            // setCbi.forEach(x=>{
            //     if (x.cbi.refTypesTableReturn.symtab.size) arefTypesSymtab.push(x.cbi.refTypesTableReturn.symtab);
            // });
            // if (!arefTypesSymtab.length) arefTypesSymtab.push(sourceFileMrState.mrNarrow.createRefTypesSymtab());

            // const refTypesSymtab = arefTypesSymtab.length>1 ? sourceFileMrState.mrNarrow.mergeArrRefTypesSymtab(arefTypesSymtab) : arefTypesSymtab[0];

            retval = sourceFileMrState.mrNarrow.mrNarrowTypes({
                refTypesSymtab: refTypesSymtabMerged!, condExpr:maximalNode, crit, qdotfallout: undefined, inferStatus, constraintItem: constraintItemMerged });
        }
        if (boolsplit){
            const cbe: CurrentBranchElementTF = {
                kind: CurrentBranchesElementKind.tf,
                gff: groupForFlow,
                falsy: {
                    refTypesTableReturn: retval.inferRefRtnType.failing!,
                    byNode: retval.byNode,
                },
                truthy: {
                    refTypesTableReturn: retval.inferRefRtnType.passing,
                    byNode: retval.byNode,
                }
            };
            sourceFileMrState.mrState.forFlow.currentBranchesMap.set(groupForFlow, cbe);
        }
        else {
            const cbe: CurrentBranchElementPlain = {
                kind: CurrentBranchesElementKind.plain,
                gff: groupForFlow,
                item: {
                    refTypesTableReturn: retval.inferRefRtnType.passing,
                    byNode: retval.byNode,
                }
            };
            sourceFileMrState.mrState.forFlow.currentBranchesMap.set(groupForFlow, cbe);
        }
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
            // try to get symbol and defeault type
            switch (expr.kind){
                case SyntaxKind.Identifier:{
                    const getResolvedSymbol = sourceFileMrState.mrState.checker.getResolvedSymbol;
                    const getTypeOfSymbol = sourceFileMrState.mrState.checker.getTypeOfSymbol;
                    const symbol = getResolvedSymbol(expr as Identifier);
                    const tstype = getTypeOfSymbol(symbol);
                    return tstype;
                }
            }
            Debug.fail();
        }
        if (getMyDebug()){
            const maxnode = sourceFileMrState.groupsForFlow.posOrderedNodes[groupForFlow.maximalIdx];
            consoleLog(`getTypeByMrNarrowAux[dbg]: reference: ${dbgs!.dbgNodeToString(expr)}, maximalNode: ${dbgs!.dbgNodeToString(maxnode)}`);
        }
        updateHeapWithGroupForFlow(groupForFlow,sourceFileMrState);
        resolveHeap(sourceFileMrState);
        return sourceFileMrState.mrState.forFlow.groupToNodeToType?.get(groupForFlow)?.get(expr) ?? sourceFileMrState.mrState.checker.getNeverType();
            // sourceFileMrState.mrState.checker.getErrorType();

    }


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
            astr.push(...sourceFileMrState.mrNarrow.dbgRefTypesTableToStrings(cbi.refTypesTableReturn).map(s => `  ${s}`));
            return astr;
        };
        cbm.forEach((cbe,g)=>{
            const maximalNode = groupsForFlow.posOrderedNodes[g.maximalIdx];
            astr.push(`[${dbgs?.dbgNodeToString(maximalNode)}]:`);
            astr.push(`  groupIdx:${g.groupIdx}`);
            astr.push(`  cbe.kind:${cbe.kind}`);
            if (cbe.kind===CurrentBranchesElementKind.plain){
                astr.push(...doItem(cbe.item).map(s => "    "+s));
            }
            else if (cbe.kind===CurrentBranchesElementKind.tf){
                if (cbe.truthy){
                    astr.push("    true:");
                    astr.push(...doItem(cbe.truthy).map(s => "      "+s));
                }
                if (cbe.falsy){
                    astr.push("    false:");
                    astr.push(...doItem(cbe.falsy).map(s => "      "+s));
                }
            }
        });
        return astr;
    }
}
