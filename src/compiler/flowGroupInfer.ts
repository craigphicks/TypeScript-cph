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
        //groupToFlowLabels: ESMap<GroupForFlow, Set<FlowLabel>>
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
        //done?: boolean
    };
    interface CurrentBranchElementTF {
        kind: CurrentBranchesElementKind.tf;
        gff: GroupForFlow;
        truthy?: CurrentBranchesItem; // TODO: should not be optional
        falsy?: CurrentBranchesItem; // TODO: should not be optional
        originalConstraintIn: ConstraintItem | undefined;
        done?: boolean
    };
    type CurrentBranchElement = CurrentBranchElementPlain | CurrentBranchElementTF;
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
            dbgCurrentBranchesMapWasDeleted: ESMap< Readonly<GroupForFlow>, boolean >;
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

        const heap = createHeap(groupsForFlow);
        const mrState: MrState = {
            checker,
            replayableItems: new Map<Symbol, ReplayableItem>(),
            forFlow: {
                heap,
                currentBranchesMap: new Map< GroupForFlow, CurrentBranchElement >(),
                dbgCurrentBranchesMapWasDeleted: new Map< GroupForFlow,boolean >(),
                groupToNodeToType: new Map< GroupForFlow, NodeToTypeMap >(),
            }
        };

        const mrNarrow = createMrNarrow(checker, mrState);
        return {
            sourceFile,
            groupsForFlow,
            mrState,
            mrNarrow
        };
    }


    /**
     * Ensures that the heap has all the recursively necessary antecendent groups either already have forFlow.currentBranchesMap(group) set,
     * or else inserts them into the heap.
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
                    const cbe = mrState.forFlow.currentBranchesMap.get(anteg);
                    //if (cbe) Debug.assert(!cbe.done);
                    if (!cbe){
                        Debug.assert(!mrState.forFlow.dbgCurrentBranchesMapWasDeleted.has(anteg));
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
     * Resolve the groups in the heap, which are in order of increasing dependence.
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
                //if (groupForFlow.branchMerger) Debug.assert(setOfAnteGroups);
                if (setOfAnteGroups){
                    setOfAnteGroups.forEach(ag=>{
                        Debug.assert(!heap.has(ag.groupIdx));
                        const cbe = mrState.forFlow.currentBranchesMap.get(ag);
                        Debug.assert(cbe);
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
            consoleGroup(`resolveGroupForFlow[in]: ${dbgs?.dbgNodeToString(maximalNode)}, groupIndex:${groupForFlow.groupIdx}, trueref: ${groupForFlow.trueref}, falseref: ${groupForFlow.trueref}`);
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

        let refTypesSymtabArg: RefTypesSymtab | undefined;
        let constraintItemArg: ConstraintItem | undefined;
        if (setOfFlow){
            //const dbgDoNotCancelPostIfs = false;
            const constraints: ConstraintItem[] = [];
            const symtabs: RefTypesSymtab[] = [];
            let hadBranch = false;
            let hadNonBranch = false;
            const alreadyDidAnteg = new Set<GroupForFlow>();
            setOfFlow?.forEach(fn=>{
                const doNonBranch = (flownb: FlowNode, precedentBranchKind?: BranchKind | undefined): {symtab: RefTypesSymtab, constraintItem: ConstraintItem | undefined } | undefined => {
                    if (!isFlowWithNode(flownb)) Debug.fail();
                    const anteg = groupsForFlow.nodeToGroupMap.get(flownb.node);
                    Debug.assert(anteg);
                    if (alreadyDidAnteg.has(anteg)) return undefined;
                    else alreadyDidAnteg.add(anteg);
                    const cbe = mrState.forFlow.currentBranchesMap.get(anteg);
                    Debug.assert(cbe);
                    if (precedentBranchKind===BranchKind.then){
                        Debug.assert(cbe.kind===CurrentBranchesElementKind.tf && cbe.truthy);
                        const {symtab, constraintItem} = cbe.truthy.refTypesTableReturn;
                        return { symtab, constraintItem };
                    }
                    if (precedentBranchKind===BranchKind.else){
                        Debug.assert(cbe.kind===CurrentBranchesElementKind.tf && cbe.falsy);
                        const {symtab, constraintItem} = cbe.falsy.refTypesTableReturn;
                        return { symtab, constraintItem };
                    }
                    Debug.assert(cbe.kind===CurrentBranchesElementKind.plain);
                    // in the case of cbe.kind===CurrentBranchesElementKind.tf, the cbe is removed from currentBranchesMap during postIf processing.
                    //Debug.assert(!cbe.done);
                    //cbe.done=true;
                    mrState.forFlow.currentBranchesMap.delete(anteg);
                    mrState.forFlow.dbgCurrentBranchesMapWasDeleted.set(anteg, true);
                    const {symtab, constraintItem} = cbe.item.refTypesTableReturn;
                    return { symtab, constraintItem };
                };
                if (isFlowStart(fn)) return;
                if (isFlowWithNode(fn)){
                    Debug.assert(!hadNonBranch);
                    Debug.assert(!hadBranch);
                    hadNonBranch=true;
                    const r = doNonBranch(fn);
                    if (r) {
                        const {symtab,constraintItem} = r;
                        if (symtab.size) symtabs.push(symtab);
                        if (constraintItem) constraints.push(constraintItem);
                    }
                    return;
                }
                if (isFlowBranch(fn)){
                    const doOneFlat = (antefn: Readonly<FlowNode>, precedentBranchKind: BranchKind | undefined): ConstraintItem[] | undefined => {
                        if (isFlowStart(antefn)) return [];
                        if (isFlowBranch(antefn)) {
                            // if (!dbgDoNotCancelPostIfs){
                            Debug.assert(antefn.branchKind!==BranchKind.postIf);
                            // }
                            if (!antefn.antecedents) return [];
                            return antefn.antecedents.flatMap(antefn2=>{
                                return doOneFlat(antefn2, antefn.branchKind)??[];
                            });
                        }
                        const r = doNonBranch(antefn, precedentBranchKind);
                        if (r) {
                            const {symtab,constraintItem} = r;
                            if (symtab.size) symtabs.push(symtab);
                            return constraintItem ? [constraintItem] : [];
                        }
                        else return undefined;
                    };
                    Debug.assert(!hadNonBranch);
                    Debug.assert(!hadBranch);
                    hadBranch = true;
                    if (/* !dbgDoNotCancelPostIfs && */ fn.branchKind===BranchKind.postIf){
                        // doPostIf - structured constraintItem
                        const doOnePostIf = (fnpi: Readonly<FlowLabel>): ConstraintItem | undefined => {
                            Debug.assert(fnpi.branchKind===BranchKind.postIf);
                            Debug.assert(fnpi.antecedents!.length===2);
                            const postIfConstraints = fnpi.antecedents!.map(antefn=>{
                                Debug.assert(!isFlowStart(antefn));
                                if (isFlowBranch(antefn) && antefn.branchKind===BranchKind.postIf){
                                    return doOnePostIf(antefn);
                                }
                                else {
                                    const tmpConstraints = doOneFlat(antefn,BranchKind.postIf);
                                    Debug.assert(tmpConstraints);
                                    if (tmpConstraints.length===0) return undefined;
                                    else if (tmpConstraints.length===1) return tmpConstraints[0];
                                    Debug.fail();
                                }
                            });
                            Debug.assert(fnpi.originatingConditionExpression);
                            const origGroup = groupsForFlow.nodeToGroupMap.get(fnpi.originatingConditionExpression);
                            Debug.assert(origGroup);
                            const origCbe = mrState.forFlow.currentBranchesMap.get(origGroup);
                            Debug.assert(origCbe);
                            Debug.assert(origCbe.kind===CurrentBranchesElementKind.tf);
                            //Debug.assert(!origCbe.done);
                            //origCbe.done=true; // mrState.forFlow.currentBranchesMap.delete(origGroup);
                            mrState.forFlow.currentBranchesMap.delete(origGroup);
                            mrState.forFlow.dbgCurrentBranchesMapWasDeleted.set(origGroup, true);

                            if (postIfConstraints[0]===origCbe.truthy?.refTypesTableReturn.constraintItem && postIfConstraints[1]===origCbe.falsy?.refTypesTableReturn.constraintItem){
                                return origCbe.originalConstraintIn;
                            }
                            else {
                                if (postIfConstraints[0] && postIfConstraints[1]) {
                                    return createFlowConstraintNodeOr({ constraints: postIfConstraints as ConstraintItem[] });
                                }
                                else if (postIfConstraints[0]) return postIfConstraints[0];
                                else if (postIfConstraints[1]) return postIfConstraints[1];
                                else return undefined;
                            }
                        };
                        const constraint = doOnePostIf(fn);
                        if (constraint) constraints.push(constraint);
                        return;
                    }
                    else if (fn.antecedents) {
                        constraints.push(...fn.antecedents.flatMap(antefn=>doOneFlat(antefn, fn.branchKind)??[]));
                        return;
                    }
                    return;
                }
                Debug.fail();
            });
            if (symtabs.length===0) refTypesSymtabArg = sourceFileMrState.mrNarrow.createRefTypesSymtab();
            else if (symtabs.length===1) refTypesSymtabArg = symtabs[0];
            else refTypesSymtabArg = sourceFileMrState.mrNarrow.mergeArrRefTypesSymtab(symtabs);
            if (constraints.length===1) constraintItemArg = constraints[0];
            else if (constraints.length) constraintItemArg = createFlowConstraintNodeOr({ constraints });
        }
        else {
            refTypesSymtabArg = sourceFileMrState.mrNarrow.createRefTypesSymtab();
        }
        const boolsplit = (groupForFlow.falseref || groupForFlow.trueref);
        const crit: InferCrit = !boolsplit ? { kind: InferCritKind.none } : { kind: InferCritKind.truthy, alsoFailing: true };
        const inferStatus: InferStatus = {
            inCondition: !!boolsplit,
            replayItemStack: [],
            replayables: sourceFileMrState.mrState.replayableItems
        };
        const retval = sourceFileMrState.mrNarrow.mrNarrowTypes({
            refTypesSymtab: refTypesSymtabArg, expr:maximalNode, crit, qdotfallout: undefined, inferStatus, constraintItem: constraintItemArg });
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
                },
                originalConstraintIn: constraintItemArg
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

        // mapCbe.forEach((bk,cbe)=>{
        //     if (cbe.kind===CurrentBranchesElementKind.plain){
        //         Debug.assert();
        //     }
        //     if (!bk || bk===BranchKind.postIf){
        //         sourceFileMrState.mrState.forFlow.currentBranchesMap.delete(cbe.gff);
        //     }
        //     else if (bk===BranchKind.then){
        //         //sourceFileMrState.mrState.forFlow.currentBranchesMap.delete(cbe.gff);


        //     }
        //     //sourceFileMrState.mrState.forFlow.currentBranchesMap.delete(cbe.gff);
        // });

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
        const type = getTypeByMrNarrowAux(reference, sourceFileMrState);
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
            // eslint-disable-next-line no-double-space
            //astr.push(`  cbe.done:${cbe.done??false}`);
            //if (cbe.done) return;
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
