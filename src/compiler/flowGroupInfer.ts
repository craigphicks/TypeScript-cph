namespace ts {

    let dbgs: Dbgs | undefined;
    export enum GroupForFlowKind {
        none="none",
        plain="plain",
        ifexpr="ifexpr",
        loop="loop",
    };
    export enum FlowGroupLabelKind {
        none="none",
        ref="ref",
        then="then",
        else="else",
        postIf="postIf",
        loop="loop",
        loopThen="loopThen",
        postLoop="postLoop",
        start="start",
        block="block",
        postBlock="postBlock",
    };
    export interface FlowGroupLabelBase {
        kind: FlowGroupLabelKind,
    };
    export type FlowGroupLabelNone = & {
        // originally for empty then or else in postIf
        kind: FlowGroupLabelKind.none;
    };
    export type FlowGroupLabelRef = & {
        kind: FlowGroupLabelKind.ref;
        groupIdx: number;
    };
    export type FlowGroupLabelStart = & {
        kind: FlowGroupLabelKind.start;
    };
    export type FlowGroupLabelBlock = & {
        kind: FlowGroupLabelKind.block;
        ante: FlowGroupLabel;
        originatingBlock: Node;
    };
    export type FlowGroupLabelPostBlock = & {
        kind: FlowGroupLabelKind.postBlock;
        ante: FlowGroupLabel;
        originatingBlock: Node;
    };
    export type FlowGroupLabelThen = & {
        kind: FlowGroupLabelKind.then;
        ifGroupIdx: number;
    };
    export type FlowGroupLabelElse = & {
        kind: FlowGroupLabelKind.else;
        ifGroupIdx: number;
    };
    export type FlowGroupLabelPostIf = & {
        kind: FlowGroupLabelKind.postIf;
        // Sometimes, but not always, arrAnte[0] is FlowGroupLabelThen, and arrAnte[1] is FlowGroupLabelElse.
        // That happens when the then and else join together at postif, but that doesn't always happen. e.g., control diverges.
        arrAnte: (FlowGroupLabelRef | FlowGroupLabelThen | FlowGroupLabelPostIf | FlowGroupLabelNone)[];
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
    | FlowGroupLabelStart | FlowGroupLabelBlock | FlowGroupLabelPostBlock
    | FlowGroupLabelNone
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
        sc: RefTypesSymtabConstraintItem
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
        truthy: CurrentBranchesItem;
        falsy: CurrentBranchesItem;
        originalConstraintIn: ConstraintItem;
        done?: boolean;
        truthyDone?: boolean;
        falsyDone?: boolean;
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

    interface CurrentBranchesMap {
        set(group: GroupForFlow, cbe: CurrentBranchElement): this;
        get(group: GroupForFlow): CurrentBranchElement | undefined;
        delete(group: GroupForFlow, thenElse?: Set<"then" | "else"> | undefined): void;
        clear(): void;
        has(group: GroupForFlow): boolean;
        forEach(f: (cbe: CurrentBranchElement, g: GroupForFlow) => void): void;
        readonly size: number;
    }
    let nextCurrentBranchesMapCId = 0;
    export class CurrentBranchesMapC implements CurrentBranchesMap {
        id: number;
        data: ESMap< Readonly<GroupForFlow>, CurrentBranchElement >;
        constructor(){
            this.id = nextCurrentBranchesMapCId++;
            this.data = new Map< Readonly<GroupForFlow>, CurrentBranchElement >();
        }
        set(group: GroupForFlow, cbe: CurrentBranchElement): this {
            return (this.data.set(group, cbe),this);
        }
        get(group: GroupForFlow): CurrentBranchElement | undefined {
            return this.data.get(group);
        }
        delete(group: GroupForFlow, thenElseSet?: Set<"then" | "else"> | undefined): void {
        //delete(group: GroupForFlow, thenElse?: "then" | "else"): void {
            if (getMyDebug()){
                let strset = "[";
                if (!thenElseSet) strset = "<undefined>";
                else {
                    thenElseSet.forEach(x=>strset+=`${x},`);
                    strset+="]";
                }
                const str1 = `CurrentBranchesMapC[${this.id}].delete(groupIdx:${group.groupIdx},${strset}),  size before delete:${this.data.size}`;
                consoleLog(str1);
            }
            if (!thenElseSet){
                Debug.assert(this.data.delete(group));
                return;
            }
            Debug.assert(group.kind===GroupForFlowKind.ifexpr || group.kind===GroupForFlowKind.loop);
            const cbe = this.data.get(group);
            Debug.assert(cbe && cbe.kind===CurrentBranchesElementKind.tf);
            Debug.assert(cbe);
            if (thenElseSet.has("then")){
                cbe.truthyDone = true;
            }
            else if (thenElseSet.has("else")){
                cbe.falsyDone = true;
            }
            if (cbe.truthyDone && cbe.falsyDone){
                Debug.assert(this.data.delete(group));
            }
        }
        has(group: GroupForFlow): boolean { return this.data.has(group); }
        clear(): void {
            if (getMyDebug()){
                consoleLog(`CurrentBranchesMapC[${this.id}].clear(), size before clear:${this.data.size}`);
            }
            this.data.clear();
        }
        forEach(f: (cbe: CurrentBranchElement, g: GroupForFlow) => void): void {
            this.data.forEach(f);
        }
        get size(){ return this.data.size; }
    }

    export interface ForFlow {
        heap: Heap; // heap sorted indices into SourceFileMrState.groupsForFlow.orderedGroups
        currentBranchesMap: CurrentBranchesMap;
        dbgCurrentBranchesMapWasDeleted?: ESMap< Readonly<GroupForFlow>, boolean >;
        groupToNodeToType?: ESMap< Readonly<GroupForFlow>, NodeToTypeMap >;
    }
    interface ProcessLoopState {
        group: GroupForFlow;
        loopCountWithoutFinals: number;
        invocations: number;
        loopUnionGroupToNodeToType: ESMap<GroupForFlow, NodeToTypeMap>;
        loopUnionCurrentBranchesMap: ESMap<GroupForFlow, CurrentBranchElement>;
    }
    export interface MrState {
        checker: TypeChecker;
        replayableItems: ESMap< Symbol, ReplayableItem >;
        declaredTypes: ESMap<Symbol,RefTypesTableLeaf>;
        forFlowTop: ForFlow;
        recursionLevel: number;
        dataForGetTypeOfExpressionShallowRecursive?: {
            sc: Readonly<RefTypesSymtabConstraintItem>,
            tmpExprNodeToTypeMap: Readonly<ESMap<Node,Type>>;
            expr: Expression | Node
        } | undefined;
        loopGroupToProcessLoopStateMap: ESMap<GroupForFlow,ProcessLoopState>;
        currentLoopDepth: number;
        currentLoopsInLoopScope: Set<GroupForFlow>;
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

    function createForFlow(groupsForFlow: GroupsForFlow) {
        return {
            heap: createHeap(groupsForFlow), // TODO: This call to createHeap might be too expensive to do for every loop, and it is unnecessary, use prototype.
            currentBranchesMap: new CurrentBranchesMapC(), //new Map<Readonly<GroupForFlow>, CurrentBranchElement>(),
            groupToNodeToType: new Map<GroupForFlow, NodeToTypeMap>(),
            dbgCurrentBranchesMapWasDeleted: new Map< GroupForFlow,boolean >(), // TODO: kill
        };
    }

    export function createSourceFileMrState(sourceFile: SourceFile, checker: TypeChecker, compilerOptions: CompilerOptions): SourceFileMrState {
        if (compilerOptions.mrNarrowConstraintsEnable===undefined) compilerOptions.mrNarrowConstraintsEnable = false;
        if (compilerOptions.enableTSDevExpectString===undefined) compilerOptions.enableTSDevExpectString = false;
        const t0 = process.hrtime.bigint();
        const groupsForFlow = makeGroupsForFlow(sourceFile, checker);
        if (getMyDebug()){
            // just to set up the ids for debugging
            sourceFile.allFlowNodes?.forEach(fn=>checker.getFlowNodeId(fn));
        }
        const t1 = process.hrtime.bigint() - t0;
        groupsForFlow.dbgCreationTimeMs = t1/BigInt(1000000);
        dbgs = createDbgs(checker);
        const mrState: MrState = {
            checker,
            replayableItems: new Map<Symbol, ReplayableItem>(),
            declaredTypes: new Map<Symbol, RefTypesTableLeaf>(),
            recursionLevel: 0,
            forFlowTop: createForFlow(groupsForFlow),
            loopGroupToProcessLoopStateMap: new Map<GroupForFlow,ProcessLoopState>(),
            currentLoopDepth: 0,
            currentLoopsInLoopScope: new Set<GroupForFlow>(),
        };
        const refTypesTypeModule = createRefTypesTypeModule(checker);
        const mrNarrow = createMrNarrow(checker, mrState, refTypesTypeModule, compilerOptions);
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
                if (!groupsForFlow.groupToAnteGroupMap.has(g)) return;
                let setAnteg: Set<GroupForFlow> | undefined;
                if (options){
                    setAnteg = new Set<GroupForFlow>();
                    const tmp = groupsForFlow.groupToAnteGroupMap.get(g);
                    tmp!.forEach(anteg=>{
                        if (anteg.groupIdx>=options.minGroupIdxToAdd) setAnteg!.add(anteg);
                    });
                }
                // if (g.kind===GroupForFlowKind.loop){
                //     // if !options then only loop external dependencies should be added.  Those are exactly the groups with indices smaller than group.groupIndex,
                //     // eotherwise the opposite
                //     setAnteg = new Set<GroupForFlow>();
                //     const tmp = groupsForFlow.groupToAnteGroupMap.get(g);
                //     tmp?.forEach(anteg=>{
                //         if (anteg.groupIdx < g.groupIdx) {
                //             if (!options) setAnteg?.add(anteg);
                //         }
                //         else {
                //             if (options) setAnteg?.add(anteg);
                //         }
                //     });
                // }
                else {
                    setAnteg = groupsForFlow.groupToAnteGroupMap.get(g);
                }
                setAnteg!.forEach(anteg=>{
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

    // function copyOfGroupToNodeToTypeMap(source: Readonly<ESMap<GroupForFlow,NodeToTypeMap>>): ESMap<GroupForFlow,NodeToTypeMap> {
    //     const tmp = new Map<GroupForFlow,NodeToTypeMap>();
    //     source.forEach((map,g)=>{
    //         tmp.set(g, new Map<Node,Type>(map));
    //     });
    //     return tmp;
    // }

    // function copyCurrentBranchesItem(cbi: CurrentBranchesItem, mrNarrow: MrNarrow): CurrentBranchesItem {
    //     let { symtab,constraintItem } = cbi.sc;
    //     ({ symtab,constraintItem } = copySymtabConstraints({
    //         symtab,constraintItem,
    //     }, mrNarrow));
    //     return {
    //         sc: {
    //             symtab, constraintItem
    //         }
    //     };
    // }
    // function copyCurrentBranchElement(cbe: CurrentBranchElement, mrNarrow: MrNarrow): CurrentBranchElement {
    //     if (cbe.kind===CurrentBranchesElementKind.plain){
    //         return { ...cbe, item: copyCurrentBranchesItem(cbe.item,mrNarrow) };
    //     }
    //     else {
    //         return {
    //             ...cbe,
    //             truthy: copyCurrentBranchesItem(cbe.truthy,mrNarrow),
    //             falsy: copyCurrentBranchesItem(cbe.truthy,mrNarrow),
    //         };
    //     }
    // }

    function createProcessLoopState(group: GroupForFlow): ProcessLoopState {
        return {
            group,
            invocations:0, loopCountWithoutFinals:0,
            loopUnionGroupToNodeToType: new Map<GroupForFlow, NodeToTypeMap>(),
            loopUnionCurrentBranchesMap: new Map<GroupForFlow, CurrentBranchElement>()
        };
    }
    // function copyProcessLoopState(loopState: ProcessLoopState, mrNarrow: MrNarrow): ProcessLoopState {
    //     const loopUnionGroupToNodeToType = copyOfGroupToNodeToTypeMap(loopState.loopUnionGroupToNodeToType);
    //     const loopUnionCurrentBranchesMap = new Map<GroupForFlow, CurrentBranchElement>();
    //     loopState.loopUnionCurrentBranchesMap.forEach((cbe,g)=>{
    //         loopUnionCurrentBranchesMap.set(g,copyCurrentBranchElement(cbe,mrNarrow));
    //     });
    //     return {
    //         ...loopState,
    //         loopUnionGroupToNodeToType,
    //         loopUnionCurrentBranchesMap
    //     };
    // }
    /**
     *
     * @param groupToNodeToTypeMap
     * @param loopUnionGroupToNodeToType
     * @param checker
     * @returns true is there is change, false if no change
     */
    function upDateLoopUnionGroupToNodeToTypeV2(
        groupToNodeToTypeMap: Readonly<ESMap<GroupForFlow,NodeToTypeMap>>,
        loopUnionGroupToNodeToType: ESMap<GroupForFlow,NodeToTypeMap>,
        checker: Readonly<TypeChecker>
    ): boolean {
        let hadChange = false;
        groupToNodeToTypeMap.forEach((map,g)=>{
            const unionmap = loopUnionGroupToNodeToType.get(g);
            if (!unionmap) {
                loopUnionGroupToNodeToType.set(g,map); // map is safe to use.
                hadChange=true;
                return;
            }
            map.forEach((type,node)=>{
                let uniontype = unionmap.get(node);
                if (!uniontype) {
                    unionmap.set(node,type);
                    hadChange=true;
                    return;
                }
                if (checker.isTypeRelatedTo(type,uniontype,checker.getRelations().subtypeRelation)){
                    // union getUnionType([type,uniontype]) would be the same as uniontype
                    return;
                }
                hadChange = true;
                uniontype = checker.getUnionType([type,uniontype],UnionReduction.Literal);
                unionmap.set(node, uniontype);
            });
        });
        return hadChange;
    };
    function upDateLoopUnionCurrentBranchesMap(
        currentBranchesMap: Readonly<CurrentBranchesMap>,
        loopUnionCurrentBranchesMap: ESMap<GroupForFlow,CurrentBranchElement>,
        mrNarrow: MrNarrow,
    ): void {
        function updatedCurrentBranchesItem(cbi: Readonly<CurrentBranchesItem>, unioncbi: Readonly<CurrentBranchesItem>): CurrentBranchesItem {
            const sc1: RefTypesSymtabConstraintItem  = {
                symtab: cbi.sc.symtab,
                constraintItem: cbi.sc.constraintItem
            };
            const scu: RefTypesSymtabConstraintItem  = {
                symtab: unioncbi.sc.symtab,
                constraintItem: unioncbi.sc.constraintItem
            };
            const {symtab,constraintItem} = orSymtabConstraints([sc1,scu],mrNarrow);
            return {
                sc: {
                    symtab, constraintItem
                }
            };
        }

        currentBranchesMap.forEach((cbe,g)=>{
            const unioncbe = loopUnionCurrentBranchesMap.get(g);
            if (!unioncbe) {
                loopUnionCurrentBranchesMap.set(g,cbe);
                return;
            }
            if (cbe.kind===CurrentBranchesElementKind.plain){
                Debug.assert(unioncbe.kind===CurrentBranchesElementKind.plain);
                unioncbe.item = updatedCurrentBranchesItem(cbe.item,unioncbe.item);
            }
            else if (cbe.kind===CurrentBranchesElementKind.tf){
                Debug.assert(unioncbe.kind===CurrentBranchesElementKind.tf);
                unioncbe.truthy = updatedCurrentBranchesItem(cbe.truthy,unioncbe.truthy);
                unioncbe.falsy = updatedCurrentBranchesItem(cbe.falsy,unioncbe.falsy);
            }
        });
    }
    function updateProcessLoopState(forFlow: Readonly<ForFlow>, loopState: ProcessLoopState, mrNarrow: MrNarrow): boolean {
        const hadChange = upDateLoopUnionGroupToNodeToTypeV2(forFlow.groupToNodeToType!, loopState.loopUnionGroupToNodeToType, mrNarrow.checker);
        upDateLoopUnionCurrentBranchesMap(forFlow.currentBranchesMap, loopState.loopUnionCurrentBranchesMap, mrNarrow);
        return hadChange;
    }
    // function isProcessLoopStateConverged(loopState: Readonly<ProcessLoopState>, lastLoopState: Readonly<ProcessLoopState>, checker: Readonly<TypeChecker>): boolean {
    //     const loopUnionGroupToNodeToType = loopState.loopUnionGroupToNodeToType;
    //     const lastLoopUnionGroupToNodeToType = lastLoopState.loopUnionGroupToNodeToType;
    //     let notconverged = false;
    //     for (let iter0 = loopUnionGroupToNodeToType.entries(), it0=iter0.next(); !notconverged && !it0.done; it0=iter0.next()){
    //         const [gff,map] = it0.value;
    //         const maplast = lastLoopUnionGroupToNodeToType.get(gff);
    //         if (!maplast) {
    //             notconverged = true;
    //             break;
    //         };
    //         for (let iter1 = map.entries(), it1=iter1.next(); !it1.done; it1=iter1.next()){
    //             const [node,type]=it1.value;
    //             const typelast = maplast.get(node);
    //             if (!typelast || !checker.isTypeRelatedTo(typelast,type, checker.getRelations().identityRelation)) {
    //                 notconverged = true;
    //                 break;
    //             }
    //         }
    //     }
    //     return !notconverged;
    // }

    // function checkDevExpectString(node: Node, devExpectString: string, sourceFile: SourceFile): {expected: string | undefined, pass?: boolean} {
    //     const arrCommentRange = getLeadingCommentRangesOfNode(node, sourceFile);
    //     let cr: CommentRange | undefined;
    //     if (arrCommentRange) cr = arrCommentRange[arrCommentRange.length-1];
    //     if (cr) {
    //         const comment = sourceFile.text.slice(cr.pos, cr.end);
    //         const matches = /@ts-dev-expect-string "(.+?)"/.exec(comment);
    //         if (matches && matches.length>=2){
    //             return { expected: matches[1], pass:devExpectString===matches[1] };
    //         }
    //     }
    //     return { expected: undefined };
    // }
    function getDevExpectString(node: Node, sourceFile: SourceFile): string | undefined {
        const arrCommentRange = getLeadingCommentRangesOfNode(node, sourceFile);
        let cr: CommentRange | undefined;
        if (arrCommentRange) cr = arrCommentRange[arrCommentRange.length-1];
        if (cr) {
            const comment = sourceFile.text.slice(cr.pos, cr.end);
            const matches = /@ts-dev-expect-string "(.+?)"/.exec(comment);
            if (matches && matches.length>=2){
                return matches[1];
            }
        }
        return undefined;
    }


    // @ ts-expect-error
    function processLoop(loopGroup: GroupForFlow, sourceFileMrState: SourceFileMrState, forFlowParent: ForFlow): number {
        const dbgLevel=1;
        if (sourceFileMrState.mrState.currentLoopDepth===0) Debug.assert(sourceFileMrState.mrState.currentLoopsInLoopScope.size===0);
        sourceFileMrState.mrState.currentLoopsInLoopScope.add(loopGroup);
        sourceFileMrState.mrState.currentLoopDepth++;
        if (getMyDebug(dbgLevel)){
            consoleGroup(`processLoop[in] loopGroup.groupIdx:${loopGroup.groupIdx}, currentLoopDepth:${sourceFileMrState.mrState.currentLoopDepth}`);
        }
        Debug.assert(loopGroup.kind===GroupForFlowKind.loop);
        const anteGroupLabel: FlowGroupLabel = loopGroup.anteGroupLabels[0];
        Debug.assert(anteGroupLabel.kind===FlowGroupLabelKind.loop);
        const mrNarrow = sourceFileMrState.mrNarrow;

        const setOfKeysToDeleteFromCurrentBranchesMap = new Map<GroupForFlow,Set<"then" | "else"> | undefined>();
        // Cached for susequent iterations
        const cachedSCForLoopPre = doFlowGroupLabel(anteGroupLabel.antePrevious, setOfKeysToDeleteFromCurrentBranchesMap, sourceFileMrState, forFlowParent);
        let cachedSCForLoopContinue: RefTypesSymtabConstraintItem[] = [];
        setOfKeysToDeleteFromCurrentBranchesMap.forEach((set, gff)=>forFlowParent.currentBranchesMap.delete(gff, set));
        const inferStatus: InferStatus = createInferStatus(loopGroup, sourceFileMrState);
        /**
         * Using the global loop state rather local loop state potentially reduces resolution but also potentially reduces computation time.
         * At loop depth 0, there is no difference.
         * TODO: We might want to allow local loopState up to a given value for sourceFileMrState.mrState.currentLoopDepth
         */
        const useGlobalLoopState = sourceFileMrState.mrState.currentLoopDepth > 0;

        const loopState = (()=>{
            if (useGlobalLoopState){
                let got = sourceFileMrState.mrState.loopGroupToProcessLoopStateMap.get(loopGroup);
                if (!got) {
                    got = createProcessLoopState(loopGroup);
                    sourceFileMrState.mrState.loopGroupToProcessLoopStateMap.set(loopGroup,got);
                }
                return got;
            }
            else{
                return createProcessLoopState(loopGroup);
            }
        })();

        loopState.invocations++;
        let loopCount = 0;
        let forFlowFinal: ForFlow;
        //let forFlowLast: ForFlow;
        // let lastLoopState: ProcessLoopState;
        //let loopExitedBecauseConverged = false; always true now
        let maxGroupIdxProcessed = loopGroup.groupIdx;
        do {
            // single pass of loop.
            const forFlow: ForFlow = {
                heap: createHeap(sourceFileMrState.groupsForFlow), // TODO: This call to createHeap might be too expensive to do for every loop, and it is unnecessary, use prototype.
                currentBranchesMap: new CurrentBranchesMapC(), //new Map<Readonly<GroupForFlow>, CurrentBranchElement>(),
                groupToNodeToType: new Map<GroupForFlow, NodeToTypeMap>(),
            };
            updateHeapWithGroupForFlow(loopGroup, sourceFileMrState, forFlow, { minGroupIdxToAdd:loopGroup.groupIdx });
            forFlow.heap._heapset.forEach(gi=>{
                if (gi>maxGroupIdxProcessed) maxGroupIdxProcessed = gi;
            });

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
            if (getMyDebug(dbgLevel)){
                consoleLog(`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, do the condition of the loop, loopCount:${loopCount}`);
            }
            resolveGroupForFlow(loopGroup, inferStatus, sourceFileMrState, forFlow, { cachedSCForLoop, loopGroupIdx:loopGroup.groupIdx });
            if (getMyDebug(dbgLevel)){
                consoleLog(`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, did the condition of the loop, loopCount:${loopCount}`);
            }

            // if the loop condition is always false then break
            const cbe = forFlow.currentBranchesMap.get(loopGroup);
            Debug.assert(cbe?.kind===CurrentBranchesElementKind.tf);
            // do the rest of the loop
            if (getMyDebug(dbgLevel)){
                consoleLog(`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, do the rest of the loop, loopCount:${loopCount}`);
            }
            resolveHeap(sourceFileMrState,forFlow);
            if (getMyDebug(dbgLevel)){
                consoleLog(`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, did the rest of the loop, loopCount:${loopCount}`);
            }

            setOfKeysToDeleteFromCurrentBranchesMap.clear();
            cachedSCForLoopContinue = anteGroupLabel.arrAnteContinue.map(fglab=>{
                return doFlowGroupLabel(fglab, setOfKeysToDeleteFromCurrentBranchesMap, sourceFileMrState, forFlow);
            });
            setOfKeysToDeleteFromCurrentBranchesMap.forEach((set,gff)=>forFlow.currentBranchesMap.delete(gff,set));
            // if the nodeToType maps have converged, then break
            if (getMyDebug(dbgLevel)){
                dbgGroupToNodeToTypeMap(forFlow.groupToNodeToType!).forEach(s=>{
                    consoleLog(`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, g2n2tmap loopCount=${loopCount}: ${s}`);
                });
            }

            //lastLoopState = copyProcessLoopState(localLoopState,mrNarrow);
            const converged = !updateProcessLoopState(forFlow,loopState,mrNarrow);
            //const converged = isProcessLoopStateConverged(localLoopState,lastLoopState,mrNarrow.checker);
            //Debug.assert(converged===!hadChange); // TODO: kill copyProcessLoopState and isProcessLoopStateConverged
            if (converged) {
                // if (mrNarrow.compilerOptions.enableTSDevExpectString){
                //     devExpectString = `loop finished due to type map converged, loopCount=${loopCount}`;
                // }
                if (getMyDebug(dbgLevel)){
                    consoleLog(`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, loop finished due to type map converged, loopCount=${loopCount}`);
                }
                forFlowFinal = forFlow;
                //loopExitedBecauseConverged = true;
                break;
            }
            loopState.loopCountWithoutFinals++;
            //forFlowLast = forFlow;
        } while (++loopCount);
        // if (mrNarrow.compilerOptions.enableTSDevExpectString){
        //     const node = sourceFileMrState.groupsForFlow.posOrderedNodes[loopGroup.maximalIdx];
        //     const {expected,pass} = checkDevExpectString(node.parent, devExpectString, sourceFileMrState.sourceFile);
        //     if (expected!==undefined){
        //         if (!pass) Debug.fail(`@ts-dev-expect-string "${expected}" !== actual "${devExpectString}"`);
        //         if (getMyDebug()){
        //             consoleLog(`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, @ts-dev-expect-string "${expected}" passed`);
        //         }
        //     }
        // }
        Debug.assert(forFlowFinal!);

        // maybe the lhs should always be globalLoopState ?
        loopState.loopUnionGroupToNodeToType.forEach((nodeToTypeMap,g)=>{
            Debug.assert(forFlowParent.groupToNodeToType!.has(g)===false);
            forFlowParent.groupToNodeToType!.set(g,nodeToTypeMap);
        });
        Debug.assert(forFlowParent.currentBranchesMap.has(loopGroup)===false);
        Debug.assert(loopState.loopUnionCurrentBranchesMap.has(loopGroup)===true);
        loopState.loopUnionCurrentBranchesMap.forEach((cbe,g)=>{
            forFlowParent.currentBranchesMap.set(g, cbe);
        });
        if (mrNarrow.compilerOptions.enableTSDevExpectString && sourceFileMrState.mrState.currentLoopDepth===1){
            sourceFileMrState.mrState.currentLoopsInLoopScope.forEach(loopg=>{
                const node = sourceFileMrState.groupsForFlow.posOrderedNodes[loopg.maximalIdx];
                const expected = getDevExpectString(node.parent, sourceFileMrState.sourceFile);
                if (expected===undefined) return;
                const lstate: ProcessLoopState = sourceFileMrState.mrState.loopGroupToProcessLoopStateMap.get(loopg)!;
                const actual = `loopCount:${lstate.loopCountWithoutFinals}, invocations:${lstate.invocations}`;
                if (actual!==expected){
                    Debug.fail(`@ts-dev-expect-string expected:"${expected}" !== actual:"${actual}" ; node:${dbgs!.dbgNodeToString(node)}`);
                }
            });
        }
        if (getMyDebug(dbgLevel)){
            dbgCurrentBranchesMap(loopState.loopUnionCurrentBranchesMap, sourceFileMrState).forEach(s=>consoleLog(`processLoop[dbg] loopUnionCurrentBranchesMap: ${s}`));
            //dbgForFlow(sourceFileMrState, forFlowFinal).forEach(s=>consoleLog(`processLoop[dbg] branches: ${s}`));
            dbgGroupToNodeToTypeMap(loopState.loopUnionGroupToNodeToType).forEach(s=>consoleLog(`processLoop[dbg] loopUnionGroupToNodeToType: ${s}`));
            consoleLog(`processLoop[out] loopGroup.groupIdx:${loopGroup.groupIdx}, currentLoopDepth:${sourceFileMrState.mrState.currentLoopDepth}, maxGroupIdxProcessed:${maxGroupIdxProcessed}`);
            consoleGroupEnd();
        }
        sourceFileMrState.mrState.currentLoopDepth--;
        if (sourceFileMrState.mrState.currentLoopDepth===0) sourceFileMrState.mrState.currentLoopsInLoopScope.clear();
        return maxGroupIdxProcessed;
    }


    /**
     * Resolve the groups in the heap, which are in order of increasing dependence.
     * @param sourceFileMrState
     */
    function resolveHeap(sourceFileMrState: SourceFileMrState, forFlow: ForFlow): void {
        const groupsForFlow = sourceFileMrState.groupsForFlow;
        const heap = forFlow.heap;

        let loopMaxProcessedGroupIdx = -1;
        while (!heap.isEmpty()){
            const groupIdx = heap.remove();
            if (groupIdx<=loopMaxProcessedGroupIdx) continue; // this group was already done inside loop
            const groupForFlow = groupsForFlow.orderedGroups[groupIdx];
            if (groupForFlow.kind===GroupForFlowKind.loop){
                loopMaxProcessedGroupIdx = processLoop(groupForFlow,sourceFileMrState,forFlow);
                continue;
            }
            const inferStatus: InferStatus = createInferStatus(groupForFlow, sourceFileMrState);
            resolveGroupForFlow(groupForFlow, inferStatus, sourceFileMrState, forFlow);
        } // while (!heap.isEmpty())
    }


    function doFlowGroupLabel(fglabIn: FlowGroupLabel, setOfKeysToDeleteFromCurrentBranchesMap: ESMap<GroupForFlow,Set<"then" | "else"> | undefined>, sourceFileMrState: SourceFileMrState, forFlow: ForFlow): RefTypesSymtabConstraintItem {
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
                    setOfKeysToDeleteFromCurrentBranchesMap.set(anteg,undefined);
                    return {
                        symtab: cbe.item.sc.symtab,
                        constraintItem: cbe.item.sc.constraintItem,
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
                case FlowGroupLabelKind.block:
                    return doFlowGroupLabelAux(fglab.ante);
                case FlowGroupLabelKind.postBlock:{
                    return doPostBlock(fglab);
                }
                case FlowGroupLabelKind.none:
                    return { symtab:mrNarrow.createRefTypesSymtab(), constraintItem:createFlowConstraintNever() };
                case FlowGroupLabelKind.start:
                    return { symtab:mrNarrow.createRefTypesSymtab(), constraintItem:createFlowConstraintAlways() };
                default:
                    // @ts-expect-error
                    Debug.fail("not yet implemented: "+fglab.kind);

            }
        }
        function doThenElse(groupIdx: number, truthy: boolean): RefTypesSymtabConstraintItem {
            const anteg = groupsForFlow.orderedGroups[groupIdx];
            const cbe = forFlow.currentBranchesMap.get(anteg);
            Debug.assert(cbe);
            // cbe.kind===CurrentBranchesElementKind.tf does not always hold.
            // For example, is case of `x; if (maybe()) break;` the target of the break will reference `x` because `maybe()` is not in the flow train.  C.f. _caxnc-whileLoop-33
            let symtab: RefTypesSymtab;
            let constraintItem: ConstraintItem;

            if (cbe.kind===CurrentBranchesElementKind.tf) {
                if (truthy){
                    const got = setOfKeysToDeleteFromCurrentBranchesMap.get(anteg);
                    if (!got) setOfKeysToDeleteFromCurrentBranchesMap.set(anteg, new Set<"else" | "then">(["then"]));
                    else got.add("then");
                    ({constraintItem,symtab}=cbe.truthy.sc);
                }
                else {
                    const got = setOfKeysToDeleteFromCurrentBranchesMap.get(anteg);
                    if (!got) setOfKeysToDeleteFromCurrentBranchesMap.set(anteg, new Set<"else" | "then">(["else"]));
                    else got.add("else");
                    ({constraintItem,symtab}=cbe.falsy.sc);
                }
            }
            else {
                Debug.fail("unexpected");
                // ({constraintItem,symtab}=cbe.item.sc);
                // setOfKeysToDeleteFromCurrentBranchesMap.set(anteg, undefined);
            }
            return { constraintItem,symtab };
        };
        function doPostLoop(loopGroupIdx: number): RefTypesSymtabConstraintItem {
            const loopGroup = groupsForFlow.orderedGroups[loopGroupIdx];
            const cbe = forFlow.currentBranchesMap.get(loopGroup);
            Debug.assert(cbe && cbe.kind===CurrentBranchesElementKind.tf);
            const {constraintItem,symtab}=cbe.falsy.sc;
            return { constraintItem,symtab };
        }
        function doPostBlock(fglab: FlowGroupLabelPostBlock): RefTypesSymtabConstraintItem {
            const sc = doFlowGroupLabelAux(fglab.ante);
            // remove the going-out-of-scope symbols from thre symbol table.
            const localSymbolSet = new Set<Symbol>();
            fglab.originatingBlock.locals?.forEach((symbol)=>localSymbolSet.add(symbol));
            const newsymtab = mrNarrow.createRefTypesSymtab();
            sc.symtab.forEach((entry,symbol)=>{
                if (!localSymbolSet.has(symbol)) newsymtab.set(symbol,entry);
            });
            return { symtab:newsymtab, constraintItem:sc.constraintItem };
        }
        function doOneFlowGroupLabelPostIf(fglab: FlowGroupLabelPostIf): RefTypesSymtabConstraintItem {
            const arrsc = fglab.arrAnte.map(ante=>doFlowGroupLabelAux(ante));
            if (mrNarrow.compilerOptions.mrNarrowConstraintsEnable){
                const origGroup = groupsForFlow.orderedGroups[fglab.originatingGroupIdx];
                const origCbe = forFlow.currentBranchesMap.get(origGroup)!;
                Debug.assert(origCbe.kind===CurrentBranchesElementKind.tf);
                if (arrsc.length===2 &&
                    arrsc[0].constraintItem===origCbe.truthy.sc.constraintItem &&
                    arrsc[1].constraintItem===origCbe.falsy.sc.constraintItem){
                    return {
                        symtab: orSymtabs(arrsc.map(x=>x.symtab), mrNarrow),
                        constraintItem: origCbe.originalConstraintIn
                    };
                }
            }
            return orSymtabConstraints(arrsc, mrNarrow);
        };
    }

    function resolveGroupForFlow(groupForFlow: Readonly<GroupForFlow>, inferStatus: InferStatus, sourceFileMrState: SourceFileMrState, forFlow: ForFlow,
        options?: {cachedSCForLoop: RefTypesSymtabConstraintItem, loopGroupIdx: number}): void {
        const groupsForFlow = sourceFileMrState.groupsForFlow;
        const mrNarrow = sourceFileMrState.mrNarrow;
        const maximalNode = groupsForFlow.posOrderedNodes[groupForFlow.maximalIdx];
        if (getMyDebug()){
            consoleGroup(`resolveGroupForFlow[in]: ${dbgs?.dbgNodeToString(maximalNode)}, `
            +`groupIndex:${groupForFlow.groupIdx}, kind:${groupForFlow.kind}, `
            +`maximalNode.parent.kind:${Debug.formatSyntaxKind(maximalNode.parent.kind)}, `
            );
            consoleLog(`resolveGroupForFlow[dbg:] currentBranchesMap[before]:`);
            dbgForFlow(sourceFileMrState, forFlow).forEach(s=>consoleLog(`resolveGroupForFlow[dbg:] currentBranchesMap[before]: ${s}`));
            consoleLog(`resolveGroupForFlow[dbg:] endof currentBranchesMap[before]:`);
        }
        const setOfKeysToDeleteFromCurrentBranchesMap = new Map<GroupForFlow, Set<"then" | "else"> | undefined>();
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

                setOfKeysToDeleteFromCurrentBranchesMap.set(prevAnteGroup,undefined);

                const cbe = forFlow.currentBranchesMap.get(prevAnteGroup);
                if (!(cbe && cbe.kind===CurrentBranchesElementKind.plain)){
                    // @ts-ignore
                    Debug.assert(cbe && cbe.kind===CurrentBranchesElementKind.plain);
                }
                const {constraintItem,symtab}=cbe.item.sc;
                sc = { constraintItem,symtab };
            }
            if (!sc){
                sc = { symtab: mrNarrow.createRefTypesSymtab(), constraintItem: createFlowConstraintAlways() };
            }
            return sc;
        };

        const {constraintItem:constraintItemArg , symtab:refTypesSymtabArg} = getAnteConstraintItemAndSymtab();
        if (getMyDebug()){
            consoleLog(`resolveGroupForFlow[dbg] result of getAnteConstraintItemAndSymtab():`);
            mrNarrow.dbgRefTypesSymtabToStrings(refTypesSymtabArg).forEach(s=>{
                consoleLog(`resolveGroupForFlow[dbg] symtab: ${s}`);
            });
            mrNarrow.dbgConstraintItem(constraintItemArg).forEach(s=>{
                consoleLog(`resolveGroupForFlow[dbg] constraintItem: ${s}`);
            });
            consoleLog(`resolveGroupForFlow[dbg] end of result of getAnteConstraintItemAndSymtab():`);
        }
        /**
         * Delete all the no-longer-needed CurrentBranchElements.  Note that unentangled lower scoped const variables will be
         * implicitly deleted with these deletions of their containing ConstraintItem-s.
         */
        setOfKeysToDeleteFromCurrentBranchesMap.forEach((set,gff)=>forFlow.currentBranchesMap.delete(gff,set));

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
                    sc: { ...retval.inferRefRtnType.failing! }
                    //byNode: retval.byNode,
                },
                truthy: {
                    sc: { ...retval.inferRefRtnType.passing }
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
                    sc: { ...retval.inferRefRtnType.passing }
                    //byNode: retval.byNode,
                }
            };
            forFlow.currentBranchesMap.set(groupForFlow, cbe);
        }

        if (getMyDebug()){
            consoleLog(`resolveGroupForFlow[dbg:] currentBranchesMap[after]:`);
            dbgForFlow(sourceFileMrState, forFlow).forEach(s=>consoleLog(`resolveGroupForFlow[dbg:] currentBranchesMap[after]: ${s}`));
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
    function dbgCurrentBranchesItem(cbi: CurrentBranchesItem, mrNarrow: MrNarrow): string[]{
        const astr: string[] = [];
        //astr.push(`nodeToTypeMap:`);
        astr.push(...mrNarrow.dbgRefTypesSymtabToStrings(cbi.sc.symtab).map(s => `symtab:         ${s}`));
        astr.push(...mrNarrow.dbgConstraintItem(cbi.sc.constraintItem).map(s  => `constraintItem: ${s}`));
        return astr;
    };

    function dbgCurrentBranchesMap(currentBranchesMap: CurrentBranchesMap, sourceFileMrState: SourceFileMrState): string[]{
        const astr: string[] = [];
        currentBranchesMap.forEach((cbe,g)=>{
            const maximalNode = sourceFileMrState.groupsForFlow.posOrderedNodes[g.maximalIdx];
            astr.push(`[${dbgs?.dbgNodeToString(maximalNode)}]:`);
            astr.push(`  groupIdx:${g.groupIdx}`);
            astr.push(`  cbe.kind:${cbe.kind}`);
            if (cbe.kind===CurrentBranchesElementKind.plain){
                astr.push(...dbgCurrentBranchesItem(cbe.item, sourceFileMrState.mrNarrow).map(s => "    "+s));
            }
            else if (cbe.kind===CurrentBranchesElementKind.tf){
                if (cbe.truthy){
                    astr.push("    true:");
                    astr.push(...dbgCurrentBranchesItem(cbe.truthy, sourceFileMrState.mrNarrow).map(s => "      "+s));
                }
                if (cbe.falsy){
                    astr.push("    false:");
                    astr.push(...dbgCurrentBranchesItem(cbe.falsy, sourceFileMrState.mrNarrow).map(s => "      "+s));
                }
            }
        });
        return astr;
    }

    /* @ ts-ignore */
    function dbgForFlow(sourceFileMrState: SourceFileMrState, forFlow: ForFlow): string[]{
        //const groupsForFlow = sourceFileMrState.groupsForFlow;
        //const cbm = forFlow.currentBranchesMap;
        const astr: string[] = [];
        astr.push(`forFlow.currentBranchesMap.size:${forFlow.currentBranchesMap.size}`);
        dbgCurrentBranchesMap(forFlow.currentBranchesMap, sourceFileMrState).forEach(s=>astr.push(`forFlow.currentBranchesMap: ${s}`));
        forFlow.groupToNodeToType?.forEach((map, g)=>{
            astr.push(...dbgNodeToTypeMap(map).map(s => `groupIdx:${g.groupIdx}: ${s}`));
        });
        return astr;
    }
}
