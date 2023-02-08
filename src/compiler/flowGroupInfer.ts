namespace ts {

    let dbgs: Dbgs | undefined;
    export enum GroupForFlowKind {
        none="none",
        plain="plain",
        ifexpr="ifexpr",
        loop="loop",
    };
    export enum FlowGroupLabelKind {
        // none="none",
        ref="ref",
        // trueCond="trueCond",
        // falseCond="falseCond",
        then="then",
        else="else",
        postIf="postIf",
        // continue="continue",
        loop="loop",
        loopThen="loopThen",
        postLoop="postLoop",
        // currently no block scopes processed - c.f.  binder.ts, const labelBlockScopes = false;

        // block="block",
        // postBlock="postBlock",
    };
    export interface FlowGroupLabelBase {
        kind: FlowGroupLabelKind,
    };
    ///////////////////////////////////////////
    /////////////////////////////////////////// not necessary?
    // export type FlowGroupLabelTrueCond = & {
    //     kind: FlowGroupLabelKind.trueCond;
    //     groupIdx: number;
    // };
    // /////////////////////////////////////////// not necessary?
    // export type FlowGroupLabelFalseCond = & {
    //     kind: FlowGroupLabelKind.falseCond;
    //     groupIdx: number;
    // };
    ///////////////////////////////////////////
    ///////////////////////////////////////////
    export type FlowGroupLabelRef = & {
        kind: FlowGroupLabelKind.ref;
        groupIdx: number;
    };
    // export type FlowGroupLabelBlock = & {
    //     kind: FlowGroupLabelKind.block;
    //     ante: FlowGroupLabel;
    //     originatingGroupIdx: number;
    // };
    // export type FlowGroupLabelPostBlock = & {
    //     kind: FlowGroupLabelKind.postBlock;
    //     ante: FlowGroupLabel;
    //     originatingGroupIdx: number;
    // };
    export type FlowGroupLabelThen = & {
        kind: FlowGroupLabelKind.then;
        //ante?: FlowGroupLabelTrueCond; // do we ever need this redirection
        ifGroupIdx: number;
    };
    export type FlowGroupLabelElse = & {
        kind: FlowGroupLabelKind.else;
        ifGroupIdx: number;
    };
    export type FlowGroupLabelPostIf = & {
        kind: FlowGroupLabelKind.postIf;
        anteThen: FlowGroupLabelRef | FlowGroupLabelThen | FlowGroupLabelPostIf;
        anteElse: FlowGroupLabelRef | FlowGroupLabelElse | FlowGroupLabelPostIf;
        originatingGroupIdx: number;
    };
    export type FlowGroupLabelLoop = & {
        kind: FlowGroupLabelKind.loop;
        loopElseGroupIdx?: number; // needed for loopGroup stack processing in resolveHeap
        antePrevious: FlowGroupLabel;
        arrAnteContinue: FlowGroupLabel[];
    };
    export type FlowGroupLabelLoopThen = & {
        kind: FlowGroupLabelKind.loopThen;
        loopGroupIdx: number;
    };
    export type FlowGroupLabelLoopElse = & {
        kind: FlowGroupLabelKind.postLoop;
        loopGroupIdx: number;
        arrAnteBreak: FlowGroupLabel[];
    };

    export type FlowGroupLabel = FlowGroupLabelRef | FlowGroupLabelThen | FlowGroupLabelElse | FlowGroupLabelPostIf
    | FlowGroupLabelLoop | FlowGroupLabelLoopThen | FlowGroupLabelLoopElse
    // | FlowGroupLabelBlock | FlowGroupLabelPostBlock
    ;

    export interface GroupForFlow {
        kind: GroupForFlowKind,
        maximalIdx: number,
        idxb: number,
        idxe: number,
        precOrdContainerIdx: number, // used to determine GroupForFlow order.
        groupIdx: number,
        previousAnteGroupIdx?: number; // the previous statement
        anteGroupLabels: FlowGroupLabel[];
        dbgSetOfUnhandledFlow?: Set<FlowLabel>;
        //referencingGroupIdxs: number[];
    };

    export interface ContainerItem { node: Node, precOrderIdx: number };
    export interface GroupsForFlow {
        orderedGroups: GroupForFlow[],
        precOrderContainerItems: ContainerItem[];
        posOrderedNodes: Node[];
        groupToAnteGroupMap: ESMap< GroupForFlow, Set<GroupForFlow> >; // used in updateHeap
        nodeToGroupMap: ESMap< Node, GroupForFlow >;
        dbgFlowToOriginatingGroupIdx?: ESMap<FlowNode, number>;
        dbgCreationTimeMs?: bigint;
    }

    export interface SourceFileMrState {
        sourceFile: SourceFile;
        groupsForFlow: GroupsForFlow,
        mrState: MrState;
        mrNarrow: MrNarrow;
        refTypesTypeModule: RefTypesTypeModule;
    };
    interface CurrentBranchesItem {
        refTypesTableReturn: RefTypesTableReturnNoSymbol;
        //byNode: NodeToTypeMap;
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
        truthy: CurrentBranchesItem;
        falsy: CurrentBranchesItem;
        originalConstraintIn: ConstraintItem;
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

    export interface ForFlow {
        heap: Heap; // heap sorted indices into SourceFileMrState.groupsForFlow.orderedGroups
        currentBranchesMap: ESMap< Readonly<GroupForFlow>, CurrentBranchElement >;
        dbgCurrentBranchesMapWasDeleted?: ESMap< Readonly<GroupForFlow>, boolean >;
        groupToNodeToType?: ESMap< Readonly<GroupForFlow>, NodeToTypeMap >;
    }
    export interface MrState {
        checker: TypeChecker;
        replayableItems: ESMap< Symbol, ReplayableItem >;
        declaredTypes: ESMap<Symbol,RefTypesTableLeaf>;
        forFlowTop: ForFlow;
        // {
        //     heap: Heap; // heap sorted indices into SourceFileMrState.groupsForFlow.orderedGroups
        //     currentBranchesMap: ESMap< Readonly<GroupForFlow>, CurrentBranchElement >;
        //     dbgCurrentBranchesMapWasDeleted: ESMap< Readonly<GroupForFlow>, boolean >;
        //     groupToNodeToType?: ESMap< Readonly<GroupForFlow>, NodeToTypeMap >;
        // };
        recursionLevel: number;
        dataForGetTypeOfExpressionShallowRecursive?: {
            sc: Readonly<RefTypesSymtabConstraintItem>,
            tmpExprNodeToTypeMap: Readonly<ESMap<Node,Type>>;
            expr: Expression | Node
        } | undefined;
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

    export function createSourceFileMrState(sourceFile: SourceFile, checker: TypeChecker): SourceFileMrState {
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
            declaredTypes: new Map<Symbol, RefTypesTableLeaf>(),
            recursionLevel: 0,
            forFlowTop: {
                heap,
                currentBranchesMap: new Map< GroupForFlow, CurrentBranchElement >(),
                dbgCurrentBranchesMapWasDeleted: new Map< GroupForFlow,boolean >(),
                groupToNodeToType: new Map< GroupForFlow, NodeToTypeMap >(),
            }
        };
        const refTypesTypeModule = createRefTypesTypeModule(checker);
        const mrNarrow = createMrNarrow(checker, mrState, refTypesTypeModule);
        return {
            sourceFile,
            groupsForFlow,
            mrState,
            mrNarrow,
            refTypesTypeModule
        };
    }


    /**
     * Ensures that the heap has all the recursively necessary antecendent groups either already have forFlow.currentBranchesMap(group) set,
     * or else inserts them into the heap.
     * @param group
     * @param sourceFileMrState
     */
    export function updateHeapWithGroupForFlow(group: Readonly<GroupForFlow>, sourceFileMrState: SourceFileMrState, forFlow: ForFlow, options?: {minGroupIdxToAdd: number}): void {
        // Debug.assert(sourceFileMrState.mrState.forFlow.heap.isEmpty()); no longer true with loop processing
        const minGroupIdxToAdd = options?.minGroupIdxToAdd;
        // @ ts-expect-error
        const groupsForFlow = sourceFileMrState.groupsForFlow;
        if (getMyDebug()) {
            const maximalNode = groupsForFlow.posOrderedNodes[group.maximalIdx];
            consoleGroup(`updateHeapWithGroupForFlow[in]: group: {groupIdx: ${group.groupIdx}, maximalNode: ${dbgs?.dbgNodeToString(maximalNode)}}. minGroupIdxToAdd: ${minGroupIdxToAdd}`);
        }
        /**
         * Currently requiring heap to be empty - so a simple sort could be used instead.
         * However, if heap were were to be added to on the fly, while resolving, heap will be useful.
         */
        const acc = new Set<GroupForFlow>();
        let tmpacc0 = new Set<GroupForFlow>();
        let change = true;
        if (!forFlow.currentBranchesMap.get(group)){
            tmpacc0.add(group);
            acc.add(group);
        }
        while (change){
            change = false;
            let tmpacc1 = new Set<GroupForFlow>();
            tmpacc0.forEach(g=>{
                let setAnteg: Set<GroupForFlow> | undefined;
                // if g.kind is loop (or iife?) only the loop external anteGroup is added
                if (g.kind===GroupForFlowKind.loop){
                    // if !options then only loop external dependencies should be added.  Those are exactly the groups with indices smaller than group.groupIndex,
                    // eotherwise the opposite
                    setAnteg = new Set<GroupForFlow>();
                    const tmp = groupsForFlow.groupToAnteGroupMap.get(g);
                    tmp?.forEach(anteg=>{
                        if (anteg.groupIdx < g.groupIdx) {
                            if (!options) setAnteg?.add(anteg);
                        }
                        else {
                            if (options) setAnteg?.add(anteg);
                        }
                    });
                }
                else {
                    setAnteg = groupsForFlow.groupToAnteGroupMap.get(g);
                }
                if (!setAnteg) return;
                setAnteg.forEach(anteg=>{
                    if (minGroupIdxToAdd!==undefined && anteg.groupIdx < minGroupIdxToAdd) return;
                    const has = forFlow.heap.has(anteg.groupIdx);
                    const cbe = forFlow.currentBranchesMap.get(anteg);
                    // cbe may exist and be in use when the corresponding group index is already removed from the heap, but not visa versa
                    Debug.assert(!has || has && cbe);
                    if (!cbe){
                        Debug.assert(!forFlow.dbgCurrentBranchesMapWasDeleted?.has(anteg));  // TODO: kill dbgCurrentBranchesMapWasDeleted, not used
                        if (!tmpacc1.has(anteg) && !acc.has(anteg)){
                            tmpacc1.add(anteg);
                            acc.add(anteg);
                            change = true;
                        }
                    }
                });
            });
            [tmpacc0, tmpacc1] = [tmpacc1, tmpacc0];
            tmpacc1.clear();
        }
        acc.forEach(g=>{
            forFlow.heap.insert(g.groupIdx);
        });
        if (getMyDebug()) {
            const sortedHeap1Idx = forFlow.heap.createSortedCopy();
            for (let idx = sortedHeap1Idx.length-1; idx!==0; idx--) {
                const nidx = sortedHeap1Idx[idx];
                const group = groupsForFlow.orderedGroups[nidx];
                const maxnode = groupsForFlow.posOrderedNodes[group.maximalIdx];
                const str = `updateHeapWithGroupForFlow[dbg] heap[${sortedHeap1Idx.length-idx}=>${nidx}] ${dbgs?.dbgNodeToString(maxnode)}`;
                consoleLog("  "+str);
            }
            const maximalNode = groupsForFlow.posOrderedNodes[group.maximalIdx];
            consoleLog(`updateHeapWithGroupForFlow[out]: group: {maximalNode: ${dbgs?.dbgNodeToString(maximalNode)}}`);
            consoleGroupEnd();
        }
    }

    function createInferStatus(groupForFlow: GroupForFlow, sourceFileMrState: SourceFileMrState): InferStatus {
        const mrState = sourceFileMrState.mrState;
        return {
            inCondition: groupForFlow.kind===GroupForFlowKind.ifexpr || groupForFlow.kind===GroupForFlowKind.loop,
            currentReplayableItem: undefined,
            replayables: sourceFileMrState.mrState.replayableItems,
            declaredTypes: sourceFileMrState.mrState.declaredTypes,
            groupNodeToTypeMap: new Map<Node,Type>(),
            getTypeOfExpressionShallowRecursion(sc: RefTypesSymtabConstraintItem, expr: Expression): Type {
                return this.callCheckerFunctionWithShallowRecursion(sc, mrState.checker.getTypeOfExpression, expr);
            },
            callCheckerFunctionWithShallowRecursion<FN extends TypeCheckerFn>(sc: RefTypesSymtabConstraintItem, checkerFn: FN, ...args: Parameters<FN>): ReturnType<FN>{
                mrState.dataForGetTypeOfExpressionShallowRecursive = { expr:args[0], sc, tmpExprNodeToTypeMap: this.groupNodeToTypeMap };
                try {
                   const ret: ReturnType<FN> = checkerFn.call(mrState.checker, ...args);
                   return ret;
                }
                finally {
                    delete mrState.dataForGetTypeOfExpressionShallowRecursive;
                }
            }
        };
    }

    function copyOfGroupToNodeToTypeMap(source: Readonly<ESMap<GroupForFlow,NodeToTypeMap>>): ESMap<GroupForFlow,NodeToTypeMap> {
        const tmp = new Map<GroupForFlow,NodeToTypeMap>();
        source.forEach((map,g)=>{
            tmp.set(g, new Map<Node,Type>(map));
        });
        return tmp;
    }

    // @ ts-expect-error
    function processLoop(loopGroup: GroupForFlow, sourceFileMrState: SourceFileMrState, forFlowParent: ForFlow) {
        if (getMyDebug()){
            consoleGroup(`processLoop[in] loopGroup.groupIdx:${loopGroup.groupIdx}`);
        }
        Debug.assert(loopGroup.kind===GroupForFlowKind.loop);
        const anteGroupLabel: FlowGroupLabel = loopGroup.anteGroupLabels[0];
        Debug.assert(anteGroupLabel.kind===FlowGroupLabelKind.loop);
        const mrNarrow = sourceFileMrState.mrNarrow;

        //const mrState = sourceFileMrState.mrState;
        // const groupsForFlow = sourceFileMrState.groupsForFlow;
        // const heap = mrState.forFlow.heap;
        const forFlow: ForFlow = {
            heap: createHeap(sourceFileMrState.groupsForFlow), // TODO: This call to createHeap might be too expensive to do for every loop, and it is unnecessary, use prototype.
            currentBranchesMap: new Map<Readonly<GroupForFlow>, CurrentBranchElement>(),
            groupToNodeToType: new Map<GroupForFlow, NodeToTypeMap>(),
        };
        const setOfKeysToDeleteFromCurrentBranchesMap = new Set<GroupForFlow>();
        // Cached for susequent iterations
        const cachedSCForLoopPre = doFlowGroupLabel(anteGroupLabel.antePrevious, setOfKeysToDeleteFromCurrentBranchesMap, sourceFileMrState, forFlowParent);
        let cachedSCForLoopContinue: RefTypesSymtabConstraintItem[] = [];
        setOfKeysToDeleteFromCurrentBranchesMap.forEach(gff=>forFlowParent.currentBranchesMap.delete(gff));

        const checker = sourceFileMrState.mrState.checker;

        const inferStatus: InferStatus = createInferStatus(loopGroup, sourceFileMrState);
        const loopUnionGroupToNodeToType = new Map<GroupForFlow, NodeToTypeMap>();
        const upDateLoopUnionGroupToNodeToType = (groupToNodeToTypeMap: Readonly<ESMap<GroupForFlow,NodeToTypeMap>>): void => {
            groupToNodeToTypeMap.forEach((map,g)=>{
                const unionmap = loopUnionGroupToNodeToType.get(g);
                if (!unionmap) {
                    loopUnionGroupToNodeToType.set(g,map); // map is safe to use.
                    return;
                }
                map.forEach((type,node)=>{
                    let uniontype = unionmap.get(node);
                    if (!uniontype) {
                        unionmap.set(node,type);
                        return;
                    }
                    uniontype = checker.getUnionType([type,uniontype],UnionReduction.Literal);
                    unionmap.set(node, uniontype);
                });
            });
        };
        let lastLoopUnionGroupToNodeToType: ESMap<GroupForFlow,NodeToTypeMap>;
        let loopCount = 0;
        do {
            // single pass of loop.
            forFlow.currentBranchesMap.clear();
            forFlow.groupToNodeToType!.clear();
            updateHeapWithGroupForFlow(loopGroup, sourceFileMrState, forFlow, { minGroupIdxToAdd:loopGroup.groupIdx });

            Debug.assert(forFlow.heap.peek()===loopGroup.groupIdx);
            forFlow.heap.remove();
            let cachedSCForLoop: RefTypesSymtabConstraintItem;
            if (loopCount===0){
                cachedSCForLoop = cachedSCForLoopPre;
            }
            else {
                cachedSCForLoop = orSymtabConstraints(cachedSCForLoopContinue, mrNarrow);
            }
            // do the condition part of the loop
            resolveGroupForFlow(loopGroup, inferStatus, sourceFileMrState, forFlow, { cachedSCForLoop, loopGroupIdx:loopGroup.groupIdx });

            // if the loop condition is always false then break
            const cbe = forFlow.currentBranchesMap.get(loopGroup);
            Debug.assert(cbe?.kind===CurrentBranchesElementKind.tf);
            if (mrNarrow.isNeverType(cbe.truthy.refTypesTableReturn.type)||isNeverConstraint(cbe.truthy.refTypesTableReturn.constraintItem)) {
                if (getMyDebug()){
                    consoleLog(`processLoop[dbg] loop finished due to truthy never, loopCount=${loopCount}`);
                }
                break;
            }

            // do the rest of the loop
            resolveHeap(sourceFileMrState,forFlow);

            setOfKeysToDeleteFromCurrentBranchesMap.clear();
            cachedSCForLoopContinue = anteGroupLabel.arrAnteContinue.map(fglab=>{
                return doFlowGroupLabel(fglab, setOfKeysToDeleteFromCurrentBranchesMap, sourceFileMrState, forFlow);
            });
            setOfKeysToDeleteFromCurrentBranchesMap.forEach(gff=>forFlowParent.currentBranchesMap.delete(gff));
            // if the nodeToType maps have converged, then break
            // For dev - assume loopCount===1 means converged

            if (getMyDebug()){
                dbgGroupToNodeToTypeMap(forFlow.groupToNodeToType!).forEach(s=>{
                    consoleLog(`processLoop[dbg] g2n2tmap loopCount=${loopCount}: ${s}`);
                });
            }


            lastLoopUnionGroupToNodeToType = copyOfGroupToNodeToTypeMap(loopUnionGroupToNodeToType);
            // merge new in loopUnionGroupToNodeToType
            // Note: forFlow.groupToNodeToType is disposable at this point.
            upDateLoopUnionGroupToNodeToType(forFlow.groupToNodeToType!);
            // forFlow.groupToNodeToType!.forEach((map,g)=>{
            //     const unionmap = loopUnionGroupToNodeToType.get(g);
            //     if (!unionmap) {
            //         loopUnionGroupToNodeToType.set(g,map); // map is safe to use.
            //         return;
            //     }
            //     map.forEach((type,node)=>{
            //         let uniontype = unionmap.get(node);
            //         if (!uniontype) {
            //             unionmap.set(node,type);
            //             return;
            //         }
            //         uniontype = checker.getUnionType([type,uniontype],UnionReduction.Literal);
            //         unionmap.set(node, uniontype);
            //     });
            // });

            let notconverged = false;
            for (let iter0 = loopUnionGroupToNodeToType.entries(), it0=iter0.next(); !notconverged && !it0.done; it0=iter0.next()){
                const [gff,map] = it0.value;
                const maplast = lastLoopUnionGroupToNodeToType.get(gff);
                if (!maplast) {
                    notconverged = true;
                    break;
                };
                for (let iter1 = map.entries(), it1=iter1.next(); !it1.done; it1=iter1.next()){
                    const [node,type]=it1.value;
                    const typelast = maplast.get(node);
                    if (!typelast || !checker.isTypeRelatedTo(typelast,type, checker.getRelations().identityRelation)) {
                        notconverged = true;
                        break;
                    }
                }
            }
            if (!notconverged){
                if (getMyDebug()){
                    consoleLog(`processLoop[dbg] loop finished due to type map converged, loopCount=${loopCount}`);
                }
                break;
            }

            // forFlow.groupToNodeToType!.every((map,g)=>{
            //     const maplast = lastGroupToNodeToTypeMap.get(g);
            //     if (!maplast) return false;
            //     return map.every((type,node)=>{
            //         const lastType = maplast.get(node);
            //         return lastType && checker.isTypeRelatedTo(lastType,type, checker.getRelations().identityRelation);
            //     });
            // });
            // if (loopCount===1) break; // temporary
        } while (++loopCount);

        upDateLoopUnionGroupToNodeToType(forFlow.groupToNodeToType!);
        // merge nodeToType maps into forFlowParent, copy cbe of loop group to forFlowParent.
        loopUnionGroupToNodeToType.forEach((nodeToTypeMap,g)=>{
            Debug.assert(forFlowParent.groupToNodeToType!.has(g)===false);
            forFlowParent.groupToNodeToType!.set(g,nodeToTypeMap);
        });
        Debug.assert(forFlowParent.currentBranchesMap.has(loopGroup)===false);
        Debug.assert(forFlow.currentBranchesMap.has(loopGroup)===true);
        forFlowParent.currentBranchesMap.set(loopGroup, forFlow.currentBranchesMap.get(loopGroup)!);
        if (getMyDebug()){
            dbgCurrentBranchesMap(sourceFileMrState, forFlow).forEach(s=>consoleLog(`processLoop[dbg] branches: ${s}`));
            dbgGroupToNodeToTypeMap(loopUnionGroupToNodeToType).forEach(s=>consoleLog(`processLoop[dbg] loopUnionGroupToNodeToType: ${s}`));
            consoleLog(`processLoop[out] loopGroup.groupIdx:${loopGroup.groupIdx}`);
            consoleGroupEnd();
        }
    }


    /**
     * Resolve the groups in the heap, which are in order of increasing dependence.
     * @param sourceFileMrState
     */
    function resolveHeap(sourceFileMrState: SourceFileMrState, forFlow: ForFlow): void {
        const groupsForFlow = sourceFileMrState.groupsForFlow;
        const heap = forFlow.heap;

        while (!heap.isEmpty()){
            const groupIdx = heap.remove();
            // @ ts-expect-error
            const groupForFlow = groupsForFlow.orderedGroups[groupIdx];
            if (groupForFlow.kind===GroupForFlowKind.loop){
                processLoop(groupForFlow,sourceFileMrState,forFlow);
                continue;
            }
            const inferStatus: InferStatus = createInferStatus(groupForFlow, sourceFileMrState);
            resolveGroupForFlow(groupForFlow, inferStatus, sourceFileMrState, forFlow);
        } // while (!heap.isEmpty())
    }


    function doFlowGroupLabel(fglabIn: FlowGroupLabel, setOfKeysToDeleteFromCurrentBranchesMap: Set<GroupForFlow>, sourceFileMrState: SourceFileMrState, forFlow: ForFlow): RefTypesSymtabConstraintItem {
        const {groupsForFlow,mrNarrow} = sourceFileMrState;
        return doFlowGroupLabelAux(fglabIn);

        function doFlowGroupLabelAux(fglab: FlowGroupLabel): RefTypesSymtabConstraintItem {
            switch (fglab.kind){
                case FlowGroupLabelKind.ref:{
                    const anteg = groupsForFlow.orderedGroups[fglab.groupIdx];
                    const cbe = forFlow.currentBranchesMap.get(anteg);
                    if (!cbe){
                        // This may happen if continues after a loop are not yet fulfilled.
                        return { symtab: mrNarrow.createRefTypesSymtab(), constraintItem: createFlowConstraintNever() };
                    }
                    Debug.assert(cbe.kind===CurrentBranchesElementKind.plain);
                    setOfKeysToDeleteFromCurrentBranchesMap.add(anteg);
                    return {
                        symtab: cbe.item.refTypesTableReturn.symtab,
                        constraintItem: cbe.item.refTypesTableReturn.constraintItem,
                    };
                }
                case FlowGroupLabelKind.then:
                    return doThenElse(fglab.ifGroupIdx, /*truthy*/ true);
                case FlowGroupLabelKind.else:
                    return doThenElse(fglab.ifGroupIdx, /*truthy*/ false);
                case FlowGroupLabelKind.postIf:
                    return doOneFlowGroupLabelPostIf(fglab);
                case FlowGroupLabelKind.loop:{
                    const sc0 = doFlowGroupLabelAux(fglab.antePrevious);
                    // const asc = activeLoopState?.groupIdx===groupForFlow.groupIdx ? [] as RefTypesSymtabConstraintItem[]
                    // : fglab.arrAnteContinue.map(x=>doFlowGroupLabel(x));
                    const asc = fglab.arrAnteContinue.map(x=>doFlowGroupLabelAux(x));
                    return orSymtabConstraints([sc0, ...asc], mrNarrow);
                }
                case FlowGroupLabelKind.loopThen:
                    return doThenElse(fglab.loopGroupIdx, /*truthy*/ true);
                case FlowGroupLabelKind.postLoop:{
                    const sc0 = doPostLoop(fglab.loopGroupIdx);
                    const asc = fglab.arrAnteBreak.map(x=>doFlowGroupLabelAux(x));
                    return orSymtabConstraints([sc0, ...asc], mrNarrow);
                }
                default:
                    // @ts-expect-error
                    Debug.fail("not yet implemented: "+fglab.kind);

            }
        }
        function doThenElse(groupIdx: number, truthy: boolean): RefTypesSymtabConstraintItem {
            //const {groupsForFlow,mrState} = sourceFileMrState;
            const anteg = groupsForFlow.orderedGroups[groupIdx];
            const cbe = forFlow.currentBranchesMap.get(anteg);
            Debug.assert(cbe && cbe.kind===CurrentBranchesElementKind.tf);
            const {constraintItem,symtab}=(truthy?cbe.truthy:cbe.falsy).refTypesTableReturn;
            return { constraintItem,symtab };
        };
        function doPostLoop(loopGroupIdx: number): RefTypesSymtabConstraintItem {
            const loopGroup = groupsForFlow.orderedGroups[loopGroupIdx];
            const cbe = forFlow.currentBranchesMap.get(loopGroup);

            setOfKeysToDeleteFromCurrentBranchesMap.add(loopGroup);

            Debug.assert(cbe && cbe.kind===CurrentBranchesElementKind.tf);
            const {constraintItem,symtab}=cbe.falsy.refTypesTableReturn;
            return { constraintItem,symtab };
        }
        function doOneFlowGroupLabelPostIf(fglab: FlowGroupLabelPostIf): RefTypesSymtabConstraintItem {
            const thenSymtabConstraint = doFlowGroupLabelAux(fglab.anteThen);
            const elseSymtabConstraint = doFlowGroupLabelAux(fglab.anteElse);
            const origGroup = groupsForFlow.orderedGroups[fglab.originatingGroupIdx];

            setOfKeysToDeleteFromCurrentBranchesMap.add(origGroup);

            const origCbe = forFlow.currentBranchesMap.get(origGroup)!;
            Debug.assert(origCbe.kind===CurrentBranchesElementKind.tf);
            if (thenSymtabConstraint.constraintItem===origCbe.truthy.refTypesTableReturn.constraintItem
                && elseSymtabConstraint.constraintItem===origCbe.falsy.refTypesTableReturn.constraintItem){
                return {
                    symtab: orSymtabs([ thenSymtabConstraint.symtab, elseSymtabConstraint.symtab ], mrNarrow),
                    constraintItem: origCbe.originalConstraintIn
                };
            }
            else return orSymtabConstraints([ thenSymtabConstraint, elseSymtabConstraint ], mrNarrow);
        };
    }

    function resolveGroupForFlow(groupForFlow: Readonly<GroupForFlow>, inferStatus: InferStatus, sourceFileMrState: SourceFileMrState, forFlow: ForFlow,
        options?: {cachedSCForLoop: RefTypesSymtabConstraintItem, loopGroupIdx: number}): void {
        const groupsForFlow = sourceFileMrState.groupsForFlow;
//        const mrState = sourceFileMrState.mrState;
        const mrNarrow = sourceFileMrState.mrNarrow;
        const maximalNode = groupsForFlow.posOrderedNodes[groupForFlow.maximalIdx];
        if (getMyDebug()){
            consoleGroup(`resolveGroupForFlow[in]: ${dbgs?.dbgNodeToString(maximalNode)}, `
            +`groupIndex:${groupForFlow.groupIdx}, kind:${groupForFlow.kind}, `
            +`maximalNode.parent.kind:${Debug.formatSyntaxKind(maximalNode.parent.kind)}, `
            //+`activeLoopState:${dbgActiveLoopState(activeLoopState)}`
            );
            consoleLog(`resolveGroupForFlow[dbg:] currentBranchesMap[before]:`);
            dbgCurrentBranchesMap(sourceFileMrState, forFlow).forEach(s=>consoleLog(`resolveGroupForFlow[dbg:] currentBranchesMap[before]: ${s}`));
            consoleLog(`resolveGroupForFlow[dbg:] endof currentBranchesMap[before]:`);
        }
        const setOfKeysToDeleteFromCurrentBranchesMap: Set<GroupForFlow> = new Set<GroupForFlow>();
        const getAnteConstraintItemAndSymtab = (): RefTypesSymtabConstraintItem => {
            let sc: RefTypesSymtabConstraintItem | undefined;
            if (groupForFlow.anteGroupLabels.length){
                Debug.assert(groupForFlow.anteGroupLabels.length===1);
                if (options && options.loopGroupIdx === groupForFlow.groupIdx){
                    sc = options.cachedSCForLoop;
                }
                else {
                    const flowGroupLabel = groupForFlow.anteGroupLabels[0];
                    sc = doFlowGroupLabel(flowGroupLabel, setOfKeysToDeleteFromCurrentBranchesMap, sourceFileMrState, forFlow);
                }
            }
            if (groupForFlow.previousAnteGroupIdx!==undefined){
                Debug.assert(!sc);  // when previousAnteGroupIdx is present, anteGroupLabels.length must have been zero
                const prevAnteGroup = groupsForFlow.orderedGroups[groupForFlow.previousAnteGroupIdx];

                setOfKeysToDeleteFromCurrentBranchesMap.add(prevAnteGroup);

                const cbe = forFlow.currentBranchesMap.get(prevAnteGroup);
                if (!(cbe && cbe.kind===CurrentBranchesElementKind.plain)){
                    // @ts-ignore
                    Debug.assert(cbe && cbe.kind===CurrentBranchesElementKind.plain);
                }
                const {constraintItem,symtab}=cbe.item.refTypesTableReturn;
                sc = { constraintItem,symtab };
            }
            if (!sc){
                sc = { symtab: mrNarrow.createRefTypesSymtab(), constraintItem: createFlowConstraintAlways() };
            }
            return sc;
        };

        const {constraintItem:constraintItemArg , symtab:refTypesSymtabArg} = getAnteConstraintItemAndSymtab();
        /**
         * Delete all the no-longer-needed CurrentBranchElements.  Note that unentangled lower scoped const variables will be
         * implicitly deleted with these deletions of their containing ConstraintItem-s.
         */
        setOfKeysToDeleteFromCurrentBranchesMap.forEach(gff=>forFlow.currentBranchesMap.delete(gff));

        const crit: InferCrit = !inferStatus.inCondition ? { kind: InferCritKind.none } : { kind: InferCritKind.truthy, alsoFailing: true };
        if (!forFlow.groupToNodeToType) forFlow.groupToNodeToType = new Map<GroupForFlow, NodeToTypeMap>();
        forFlow.groupToNodeToType.set(groupForFlow, inferStatus.groupNodeToTypeMap); // not this is an assign not a merge even if hte map is already set (loop)

        const retval = sourceFileMrState.mrNarrow.mrNarrowTypes({
            refTypesSymtab: refTypesSymtabArg, expr:maximalNode, crit, qdotfallout: undefined, inferStatus, constraintItem: constraintItemArg });

        if (inferStatus.inCondition){
            const cbe: CurrentBranchElementTF = {
                kind: CurrentBranchesElementKind.tf,
                gff: groupForFlow,
                falsy: {
                    refTypesTableReturn: retval.inferRefRtnType.failing!,
                    //byNode: retval.byNode,
                },
                truthy: {
                    refTypesTableReturn: retval.inferRefRtnType.passing,
                    //byNode: retval.byNode,
                },
                originalConstraintIn: constraintItemArg
            };
            forFlow.currentBranchesMap.set(groupForFlow, cbe);
        }
        else {
            const cbe: CurrentBranchElementPlain = {
                kind: CurrentBranchesElementKind.plain,
                gff: groupForFlow,
                item: {
                    refTypesTableReturn: retval.inferRefRtnType.passing,
                    //byNode: retval.byNode,
                }
            };
            forFlow.currentBranchesMap.set(groupForFlow, cbe);
        }

        if (getMyDebug()){
            consoleLog(`resolveGroupForFlow[dbg:] currentBranchesMap[after]:`);
            dbgCurrentBranchesMap(sourceFileMrState, forFlow).forEach(s=>consoleLog(`resolveGroupForFlow[dbg:] currentBranchesMap[after]: ${s}`));
            consoleLog(`resolveGroupForFlow[dbg:] endof currentBranchesMap[after]:`);
            consoleLog(`resolveGroupForFlow[out]: ${dbgs?.dbgNodeToString(maximalNode)}, `);
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

        const { mrState, /* refTypesTypeModule */ } = sourceFileMrState;

        if (mrState.dataForGetTypeOfExpressionShallowRecursive){
            if (getMyDebug()){
                consoleLog(`getTypeByMrNarrowAux[dbg]: getTypeOfExpressionShallowRecursive: ${dbgs!.dbgNodeToString(expr)}`);
                let p = expr;
                while (p!==mrState.dataForGetTypeOfExpressionShallowRecursive.expr && p.kind!==SyntaxKind.SourceFile) p=p.parent;
                Debug.assert(p===mrState.dataForGetTypeOfExpressionShallowRecursive.expr, "unexpected");
            }
            // if (expr.kind===SyntaxKind.Identifier){
            //     const {symtab, constraintItem} = mrState.dataForGetTypeOfExpressionShallowRecursive.sc;
            //     const symbol = sourceFileMrState.mrState.checker.getResolvedSymbol(expr as Identifier);
            //     {
            //         const got = symtab.get(symbol);
            //         if (got) return refTypesTypeModule.getTypeFromRefTypesType(got.leaf.type);
            //     }
            //     if (constraintItem.symbolsInvolved?.has(symbol)){
            //         const getDeclaredType = (symbol: Symbol) => mrState.declaredTypes.get(symbol)!.type;
            //         evalCoverForOneSymbol(symbol,constraintItem, getDeclaredType, sourceFileMrState.mrNarrow);
            //     }
            // }
            const tstype = mrState.dataForGetTypeOfExpressionShallowRecursive.tmpExprNodeToTypeMap.get(expr);
            Debug.assert(tstype);
            return tstype;
        }

        try {
            Debug.assert(sourceFileMrState.mrState.recursionLevel===0,"expected sourceFileMrState.mrState.recursionLevel===0");
            sourceFileMrState.mrState.recursionLevel++;

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
            /**
             * If the type for expr is already in groupToNodeToType?.get(groupForFlow)?.get(expr) then return that.
             * It is likely to be a recursive call via checker.getTypeOfExpression(...), e.g. from "case SyntaxKind.ArrayLiteralExpression"
             */
            const cachedType = sourceFileMrState.mrState.forFlowTop.groupToNodeToType?.get(groupForFlow)?.get(expr);
            if (cachedType) {
                if (getMyDebug()) consoleLog(`getTypeByMrNarrowAux[dbg]: cache hit`);
                return cachedType;
            }
            /**
             * There is a potentional anomoly here because sourceFileMrState.mrState.forFlowTop is passed to a group which may be somewhere inside a loop.
             * However, normally resolve heap will not (*is not expected to) be called on an group in a loop - those should all be cache hits.
             */
            updateHeapWithGroupForFlow(groupForFlow,sourceFileMrState, sourceFileMrState.mrState.forFlowTop);
            resolveHeap(sourceFileMrState, sourceFileMrState.mrState.forFlowTop);
            return sourceFileMrState.mrState.forFlowTop.groupToNodeToType?.get(groupForFlow)?.get(expr) ?? sourceFileMrState.mrState.checker.getNeverType();
        }
        finally {
            sourceFileMrState.mrState.recursionLevel--;
        }

    }
    function dbgNodeToTypeMap(map: Readonly<NodeToTypeMap>): string[] {
        const astr: string[] = [];
        map.forEach((t,n)=>{
            astr.push(`[node:${dbgs?.dbgNodeToString(n)}] -> type:${dbgs?.dbgTypeToString(t)}`);
        });
        return astr;
    }
    function dbgGroupToNodeToTypeMap(mmap: Readonly<ESMap<GroupForFlow,NodeToTypeMap>>): string[] {
        const as: string[] = [];
        mmap.forEach((map,g)=>{
            dbgNodeToTypeMap(map).forEach(s=>as.push(`[groupIdx:${g.groupIdx}]: ${s}`));
        });
        return as;
    }

    /* @ ts-ignore */
    function dbgCurrentBranchesMap(sourceFileMrState: SourceFileMrState, forFlow: ForFlow): string[]{
        const groupsForFlow = sourceFileMrState.groupsForFlow;
        //const mrState = sourceFileMrState.mrState;
        const cbm = forFlow.currentBranchesMap;
        const astr: string[] = [];
        // const doNodeToTypeMap = (m: Readonly<NodeToTypeMap>): string[]=>{
        //     const astr: string[] = [];
        //     m.forEach((t,n)=>{
        //         astr.push(`[node:${dbgs?.dbgNodeToString(n)}] -> type:${dbgs?.dbgTypeToString(t)}`);
        //     });
        //     return astr;
        // };
        const doItem = (cbi: CurrentBranchesItem): string[]=>{
            const astr: string[] = [];
            astr.push(`nodeToTypeMap:`);
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
            const byNode = forFlow.groupToNodeToType?.get(g)!;
            if (byNode) astr.push(...dbgNodeToTypeMap(byNode).map(s => "  "+s));
        });
        return astr;
    }
}
