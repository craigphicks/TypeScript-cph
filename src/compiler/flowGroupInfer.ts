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
        arrControlExit?: FlowGroupLabel[]; // In fact this member is not required as long as the control exits groups are inserted into setOfAnteGroups in flowNodeGrouping
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
        precOrdContainerIdx: number,
        groupIdx: number,
        previousAnteGroupIdx?: number; // the previous statement, sometimes
        anteGroupLabels: FlowGroupLabel[];
        dbgSetOfUnhandledFlow?: Set<FlowLabel>;
        postLoopGroupIdx?: number; // only present for a loop control group - required for processLoop updateHeap
        arrPreLoopGroupsIdx?: number[]; // only present for a postLoop group - required for processLoop updateHeap
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
        //dbgCurrentBranchesMapWasDeleted?: ESMap< Readonly<GroupForFlow>, boolean >;
        groupToNodeToType?: ESMap<GroupForFlow,NodeToTypeMap >;
    }
    interface ProcessLoopState {
        group: GroupForFlow;
        loopCountWithoutFinals: number;
        invocations: number;
        // loopUnionGroupToNodeToType: ESMap<GroupForFlow, NodeToTypeMap>;
        // loopUnionCurrentBranchesMap: ESMap<GroupForFlow, CurrentBranchElement>;
    }
    export type SymbolFlowInfo = & {
        passCount: number;
        isconst: boolean;
        replayableItem?: ReplayableItem;
        typeNodeTsType?: Type;
        initializerType?: RefTypesType;
        effectiveDeclaredTsType: Type; // <actual declared type> || <widened initial type>
        //effectiveDeclaredType?: RefTypesType; // ~ actualDeclaredTsType
    };
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
        symbolFlowInfoMap: WeakMap<Symbol,SymbolFlowInfo | undefined>;
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
            symbolFlowInfoMap: new WeakMap<Symbol,SymbolFlowInfo | undefined>()
        };
        const refTypesTypeModule = createRefTypesTypeModule(checker);
        const mrNarrow = createMrNarrow(checker, sourceFile, mrState, refTypesTypeModule, compilerOptions);
        return {
            sourceFile,
            groupsForFlow,
            mrState,
            mrNarrow,
            refTypesTypeModule
        };
    }
    function getGroupDependencies(group: Readonly<GroupForFlow>,
        sourceFileMrState: SourceFileMrState, forFlow: Readonly<ForFlow> | undefined, options?: {minGroupIdxToAdd: number}):
    Set<GroupForFlow> {
        const minGroupIdxToAdd = options?.minGroupIdxToAdd;
        const groupsForFlow = sourceFileMrState.groupsForFlow;
        const acc = new Set<GroupForFlow>();
        let tmpacc0 = new Set<GroupForFlow>();
        let change = true;
        if (!forFlow || !forFlow.currentBranchesMap.get(group)){
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
                else {
                    setAnteg = groupsForFlow.groupToAnteGroupMap.get(g);
                }
                setAnteg!.forEach(anteg=>{
                    if (minGroupIdxToAdd!==undefined && anteg.groupIdx < minGroupIdxToAdd) return;
                    let gatedByCbe = false;
                    if (forFlow){
                        const has = forFlow.heap.has(anteg.groupIdx);
                        const cbe = forFlow.currentBranchesMap.get(anteg);
                        // cbe may exist and be in use when the corresponding group index is already removed from the heap, but not visa versa
                        Debug.assert(!has || has && cbe);
                        gatedByCbe = !!cbe;
                    }
                    if (!gatedByCbe){
                        //Debug.assert(!forFlow.dbgCurrentBranchesMapWasDeleted?.has(anteg));  // TODO: kill dbgCurrentBranchesMapWasDeleted, not used
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
        return acc;
    }
    function updateHeapWithGroupForFlowV2(groups: Readonly<Set<GroupForFlow>>, heap: Heap, returnSortedGroupIdxs?: boolean): number[] | undefined {
        if (getMyDebug()) {
            const gidx: number[]=[];
            groups.forEach(g=>gidx.push(g.groupIdx));
            consoleGroup(`updateHeapWithGroupForFlow[in]: group idxs:[`+gidx.map(idx=>`${idx}`).join(",")+"]");
        }
        groups.forEach(g=>{
            heap.insert(g.groupIdx);
        });
        if (getMyDebug()) {
            const sortedHeap1Idx = heap.createSortedCopy();
            let str = `updateHeapWithGroupForFlow[in]: heap group idxs:[`;
            for (let idx = sortedHeap1Idx.length-1; idx!==0; idx--) {
                str += `${sortedHeap1Idx[idx]},`;
            }
            consoleLog(str+"]");
            consoleGroupEnd();
        }
        if (returnSortedGroupIdxs){
            const sorted = heap.createSortedCopy().slice(1).reverse();
            return sorted;
        }
        return;
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
                        //Debug.assert(!forFlow.dbgCurrentBranchesMapWasDeleted?.has(anteg));  // TODO: kill dbgCurrentBranchesMapWasDeleted, not used
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

    function createInferStatus(groupForFlow: GroupForFlow, sourceFileMrState: SourceFileMrState, withinLoop: boolean): InferStatus {
        const mrState = sourceFileMrState.mrState;
        Debug.assert(sourceFileMrState.mrState.forFlowTop.groupToNodeToType);
        let groupNodeToTypeMap = mrState.forFlowTop.groupToNodeToType!.get(groupForFlow);
        if (!groupNodeToTypeMap) {
            groupNodeToTypeMap = new Map<Node,Type>();
            mrState.forFlowTop.groupToNodeToType!.set(groupForFlow,groupNodeToTypeMap);
        }
        return {
            inCondition: groupForFlow.kind===GroupForFlowKind.ifexpr || groupForFlow.kind===GroupForFlowKind.loop,
            currentReplayableItem: undefined,
            replayables: sourceFileMrState.mrState.replayableItems,
            declaredTypes: sourceFileMrState.mrState.declaredTypes,
            groupNodeToTypeMap,
            //accumNodeTypes: false, //withinLoop,
            accumBranches: withinLoop,
            getTypeOfExpressionShallowRecursion(sc: RefTypesSymtabConstraintItem, expr: Expression): Type {
                return this.callCheckerFunctionWithShallowRecursion(expr, sc, mrState.checker.getTypeOfExpression, expr);
            },
            callCheckerFunctionWithShallowRecursion<FN extends TypeCheckerFn>(expr: Expression, sc: RefTypesSymtabConstraintItem, checkerFn: FN, ...args: Parameters<FN>): ReturnType<FN>{
                mrState.dataForGetTypeOfExpressionShallowRecursive = { expr, sc, tmpExprNodeToTypeMap: this.groupNodeToTypeMap };
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

    function createCopyOfGroupToNodeToTypeMap(source: Readonly<ESMap<GroupForFlow,NodeToTypeMap>>, groups: Readonly<Set<GroupForFlow>>): ESMap<GroupForFlow,NodeToTypeMap> {
        const tmp = new Map<GroupForFlow,NodeToTypeMap>();
        groups.forEach(g=>{
            const gotmap = source.get(g);
            if (gotmap) tmp.set(g, new Map<Node,Type>(gotmap));
        });
        return tmp;
    }

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
            // loopUnionGroupToNodeToType: new Map<GroupForFlow, NodeToTypeMap>(),
            // loopUnionCurrentBranchesMap: new Map<GroupForFlow, CurrentBranchElement>()
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
    // function upDateLoopUnionGroupToNodeToTypeV2(
    //     groupToNodeToTypeMap: Readonly<ESMap<GroupForFlow,NodeToTypeMap>>,
    //     loopUnionGroupToNodeToType: ESMap<GroupForFlow,NodeToTypeMap>,
    //     checker: Readonly<TypeChecker>
    // ): boolean {
    //     let hadChange = false;
    //     groupToNodeToTypeMap.forEach((map,g)=>{
    //         const unionmap = loopUnionGroupToNodeToType.get(g);
    //         if (!unionmap) {
    //             loopUnionGroupToNodeToType.set(g,map); // map is safe to use.
    //             hadChange=true;
    //             return;
    //         }
    //         map.forEach((type,node)=>{
    //             let uniontype = unionmap.get(node);
    //             if (!uniontype) {
    //                 unionmap.set(node,type);
    //                 hadChange=true;
    //                 return;
    //             }
    //             if (checker.isTypeRelatedTo(type,uniontype,checker.getRelations().subtypeRelation)){
    //                 // union getUnionType([type,uniontype]) would be the same as uniontype
    //                 return;
    //             }
    //             hadChange = true;
    //             uniontype = checker.getUnionType([type,uniontype],UnionReduction.Literal);
    //             unionmap.set(node, uniontype);
    //         });
    //     });
    //     return hadChange;
    // };


    // @ ts-expect-error
    function updatedCurrentBranchesItem(cbi: Readonly<CurrentBranchesItem>, unioncbi: Readonly<CurrentBranchesItem>, mrNarrow: MrNarrow): CurrentBranchesItem {
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


    // function upDateLoopUnionCurrentBranchesMap(
    //     currentBranchesMap: Readonly<CurrentBranchesMap>,
    //     loopUnionCurrentBranchesMap: ESMap<GroupForFlow,CurrentBranchElement>,
    //     mrNarrow: MrNarrow,
    // ): void {
    //     function updatedCurrentBranchesItem(cbi: Readonly<CurrentBranchesItem>, unioncbi: Readonly<CurrentBranchesItem>): CurrentBranchesItem {
    //         const sc1: RefTypesSymtabConstraintItem  = {
    //             symtab: cbi.sc.symtab,
    //             constraintItem: cbi.sc.constraintItem
    //         };
    //         const scu: RefTypesSymtabConstraintItem  = {
    //             symtab: unioncbi.sc.symtab,
    //             constraintItem: unioncbi.sc.constraintItem
    //         };
    //         const {symtab,constraintItem} = orSymtabConstraints([sc1,scu],mrNarrow);
    //         return {
    //             sc: {
    //                 symtab, constraintItem
    //             }
    //         };
    //     }
    //     currentBranchesMap.forEach((cbe,g)=>{
    //         const unioncbe = loopUnionCurrentBranchesMap.get(g);
    //         if (!unioncbe) {
    //             loopUnionCurrentBranchesMap.set(g,cbe);
    //             return;
    //         }
    //         if (cbe.kind===CurrentBranchesElementKind.plain){
    //             Debug.assert(unioncbe.kind===CurrentBranchesElementKind.plain);
    //             unioncbe.item = updatedCurrentBranchesItem(cbe.item,unioncbe.item);
    //         }
    //         else if (cbe.kind===CurrentBranchesElementKind.tf){
    //             Debug.assert(unioncbe.kind===CurrentBranchesElementKind.tf);
    //             unioncbe.truthy = updatedCurrentBranchesItem(cbe.truthy,unioncbe.truthy);
    //             unioncbe.falsy = updatedCurrentBranchesItem(cbe.falsy,unioncbe.falsy);
    //         }
    //     });
    // }
    // function updateProcessLoopState(forFlow: Readonly<ForFlow>, loopState: ProcessLoopState, mrNarrow: MrNarrow): boolean {
    //     const hadChange = upDateLoopUnionGroupToNodeToTypeV2(forFlow.groupToNodeToType!, loopState.loopUnionGroupToNodeToType, mrNarrow.checker);
    //     upDateLoopUnionCurrentBranchesMap(forFlow.currentBranchesMap, loopState.loopUnionCurrentBranchesMap, mrNarrow);
    //     return hadChange;
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
    export function getDevExpectString(node: Node, sourceFile: SourceFile): string | undefined {
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
    export function getDevExpectStrings(node: Node, sourceFile: SourceFile): string[] | undefined {
        const arrCommentRange = getLeadingCommentRangesOfNode(node, sourceFile);
        const arrstr: string[]=[];
        if (!arrCommentRange) return undefined;
        arrCommentRange.forEach(cr=>{
            const comment = sourceFile.text.slice(cr.pos, cr.end);
            const matches = /@ts-dev-expect-string "(.+?)"/.exec(comment);
            if (matches && matches.length>=2){
                arrstr.push(matches[1]);
            }
        });
        return arrstr.length ? arrstr : undefined;
    }

    function isGroupToNodeToMapConverged(
        groups: Readonly<Set<GroupForFlow>>,
        prior: Readonly<ESMap<GroupForFlow,NodeToTypeMap>>,
        post: Readonly<ESMap<GroupForFlow,NodeToTypeMap>>,
        checker: Readonly<TypeChecker>
    ): boolean {
        groups.forEach(g=>{
            if (!post.has(g)) Debug.fail("unexpected");
        });
        let priorMissingSome = false;
        groups.forEach(g=>{
            if (priorMissingSome) return;
            if (!prior.has(g)) priorMissingSome=true;
        });
        if (priorMissingSome) return false;

        let hadChange = false;
        groups.forEach((g)=>{
            const postmap = post.get(g);
            const priormap = prior.get(g);
            Debug.assert(priormap&&postmap);
            priormap.forEach((_type,node)=>Debug.assert(postmap.has(node)));
            postmap.forEach((postType,node)=>{
                const priorType = priormap.get(node)!;
                Debug.assert(priorType);
                if (checker.isTypeRelatedTo(postType,priorType,checker.getRelations().subtypeRelation)){
                    return;
                }
                hadChange = true;
            });
        });
        return !hadChange;
    };

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

        let maxGroupIdxProcessed: number;
        const setOfLoopDeps = getGroupDependencies(loopGroup,sourceFileMrState, /*forFlow*/ undefined, { minGroupIdxToAdd: loopGroup.groupIdx });
        {
            maxGroupIdxProcessed = loopGroup.groupIdx;
            setOfLoopDeps.forEach(g=>maxGroupIdxProcessed=Math.max(maxGroupIdxProcessed, g.groupIdx));
        }
        //maxGroupIdxProcessed

        let copyOfGroupToNodeToTypeMap = createCopyOfGroupToNodeToTypeMap(forFlowParent.groupToNodeToType!, setOfLoopDeps);


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

        // loopGroup.groupIdx was already removed from the heap from inisde resolveHeap before calling processLoop
        // Debug.assert(forFlowParent.heap.peek()===loopGroup.groupIdx);
        // forFlowParent.heap.remove();

        // Cached for susequent iterations
        let cachedSCForLoopContinue: RefTypesSymtabConstraintItem[] = [];
        let withinLoop = loopState.invocations>1 || loopCount>0;
        // Currently forFlow is exactly a shallow copy of forFlowParent.
        const forFlow: ForFlow = {
            currentBranchesMap: forFlowParent.currentBranchesMap, // might want a empty copy of this
            heap: forFlowParent.heap, // createHeap(sourceFileMrState.groupsForFlow), // local heap for loop
            groupToNodeToType: forFlowParent.groupToNodeToType!
        };

        //let cachedSCForLoop0: RefTypesSymtabConstraintItem;
        if (getMyDebug(dbgLevel)){
            consoleLog(`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, do the condition of the loop, loopCount:${loopCount}, loopState.invocations:${loopState.invocations}, withinLoop:${withinLoop}`);
        }
        {
            const inferStatus: InferStatus = createInferStatus(loopGroup, sourceFileMrState, withinLoop);
            const cachedSCForLoop0 = doFlowGroupLabel(anteGroupLabel.antePrevious, setOfKeysToDeleteFromCurrentBranchesMap, sourceFileMrState, forFlow);
            setOfKeysToDeleteFromCurrentBranchesMap.forEach((set, gff)=>forFlow.currentBranchesMap.delete(gff, set));
            resolveGroupForFlow(loopGroup, inferStatus, sourceFileMrState, forFlow, { loopGroupIdx:loopGroup.groupIdx,cachedSCForLoop: cachedSCForLoop0 });
        }
        if (getMyDebug(dbgLevel)){
            consoleLog(`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, did the condition of the loop, loopCount:${loopCount}, loopState.invocations:${loopState.invocations}, withinLoop:${withinLoop}`);
        }



        //let forFlowLast: ForFlow;
        // let lastLoopState: ProcessLoopState;
        //let loopExitedBecauseConverged = false; always true now
        do {
            withinLoop = loopState.invocations>1 || loopCount>0;
            // single pass of loop.
            // const forFlow: ForFlow = {
            //     currentBranchesMap: forFlowParent.currentBranchesMap, // might want a empty copy of this
            //     heap: forFlowParent.heap,
            //     groupToNodeToType: forFlowParent.groupToNodeToType!
            // };
            // const forFlow: ForFlow = {
            //     heap: createHeap(sourceFileMrState.groupsForFlow), // TODO: This call to createHeap might be too expensive to do for every loop, and it is unnecessary, use prototype.
            //     currentBranchesMap: new CurrentBranchesMapC(), //new Map<Readonly<GroupForFlow>, CurrentBranchElement>(),
            //     groupToNodeToType: new Map<GroupForFlow, NodeToTypeMap>(),
            // };
            // updateHeapWithGroupForFlow(loopGroup, sourceFileMrState, forFlow, { minGroupIdxToAdd:loopGroup.groupIdx });
            // forFlow.heap._heapset.forEach(gi=>{
            //     if (gi>maxGroupIdxProcessed) maxGroupIdxProcessed = gi;
            // });

            // let cachedSCForLoop: RefTypesSymtabConstraintItem;
            if (loopCount===0){
                // initial call to control done outside loop
            }
            else {
                copyOfGroupToNodeToTypeMap = createCopyOfGroupToNodeToTypeMap(forFlow.groupToNodeToType!, setOfLoopDeps);

                updateHeapWithGroupForFlowV2(setOfLoopDeps,forFlow.heap);
                // const cachedSCForLoop = orSymtabConstraints([ cachedSCForLoop0, ...cachedSCForLoopContinue ], mrNarrow);
                const cachedSCForLoop = orSymtabConstraints(cachedSCForLoopContinue, mrNarrow);
                if (getMyDebug(dbgLevel)){
                    consoleLog(`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, do the condition of the loop, loopCount:${loopCount}, loopState.invocations:${loopState.invocations}, withinLoop:${withinLoop}`);
                }
                Debug.assert(forFlow.heap.peek()===loopGroup.groupIdx);
                forFlow.heap.remove();
                const inferStatus: InferStatus = createInferStatus(loopGroup, sourceFileMrState, withinLoop);
                    resolveGroupForFlow(loopGroup, inferStatus, sourceFileMrState, forFlow, { cachedSCForLoop, loopGroupIdx:loopGroup.groupIdx });
                if (getMyDebug(dbgLevel)){
                    consoleLog(`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, did the condition of the loop, loopCount:${loopCount}, loopState.invocations:${loopState.invocations}, withinLoop:${withinLoop}`);
                }
            }
            // do the condition part of the loop

            // if the loop condition is always false then break
            const cbe = forFlow.currentBranchesMap.get(loopGroup);
            Debug.assert(cbe?.kind===CurrentBranchesElementKind.tf);
            // do the rest of the loop
            if (getMyDebug(dbgLevel)){
                consoleLog(`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, do the rest of the loop, loopCount:${loopCount}, loopState.invocations:${loopState.invocations}, withinLoop:${withinLoop}`);
            }
            resolveHeap(sourceFileMrState,forFlow, withinLoop, maxGroupIdxProcessed);
            if (getMyDebug(dbgLevel)){
                consoleLog(`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, did the rest of the loop, loopCount:${loopCount}, loopState.invocations:${loopState.invocations}, withinLoop:${withinLoop}`);
            }

            setOfKeysToDeleteFromCurrentBranchesMap.clear();
            cachedSCForLoopContinue = anteGroupLabel.arrAnteContinue.map(fglab=>{
                return doFlowGroupLabel(fglab, setOfKeysToDeleteFromCurrentBranchesMap, sourceFileMrState, forFlow);
            });
            setOfKeysToDeleteFromCurrentBranchesMap.forEach((set,gff)=>forFlow.currentBranchesMap.delete(gff,set));
            // TODO: Convergence could be done more cheaply by setting flags at a deeper level during nodeToType updates.
            const converged = isGroupToNodeToMapConverged(setOfLoopDeps,copyOfGroupToNodeToTypeMap,forFlow.groupToNodeToType!, mrNarrow.checker);
            if (converged) {
                if (getMyDebug(dbgLevel)){
                    consoleLog(`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, loop converged, loopCount=${loopCount}, loopState.invocations:${loopState.invocations}`);
                }
                forFlowFinal = forFlow;
                break;
            }
            if (getMyDebug(dbgLevel)){
                setOfLoopDeps.forEach(g=>{
                    const cbe = forFlow.currentBranchesMap.get(g); // some will have been deleted already, only those referenced externally should be present
                    if (cbe) {
                        dbgCurrentBranchElement(cbe, sourceFileMrState).forEach(s=>consoleLog(`processLoop[dbg lc:${loopCount}] li:${loopGroup.groupIdx}, gi:${g.groupIdx}]: ${s}`));
                    }
                    const nodeToTypeMap = forFlow.groupToNodeToType!.get(g);
                    if (nodeToTypeMap) {
                        dbgNodeToTypeMap(nodeToTypeMap).forEach(s=>consoleLog(`processLoop[dbg lc:${loopCount}] li:${loopGroup.groupIdx}, gi:${g.groupIdx}]: ${s}`));
                    }
                });
            }

            loopState.loopCountWithoutFinals++;
        } while (++loopCount);
        Debug.assert(forFlowFinal!);

        // maybe the lhs should always be globalLoopState ?
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
            setOfLoopDeps.forEach(g=>{
                const cbe = forFlowFinal.currentBranchesMap.get(g); // some will have been deleted already, only those referenced externally should be present
                if (cbe) {
                    dbgCurrentBranchElement(cbe, sourceFileMrState).forEach(s=>consoleLog(`processLoop[dbg out] loopIdx:${loopGroup.groupIdx}, gIdx:${g.groupIdx}: ${s}`));
                }
                dbgNodeToTypeMap(forFlowFinal.groupToNodeToType!.get(g)!).forEach(s=>consoleLog(`processLoop[dbg out] loopIdx:${loopGroup.groupIdx}, gIdx:${g.groupIdx}: ${s}`));
            });
            consoleLog(`processLoop[out] loopGroup.groupIdx:${loopGroup.groupIdx}, currentLoopDepth:${sourceFileMrState.mrState.currentLoopDepth}, maxGroupIdxProcessed:${maxGroupIdxProcessed}, loopState.invocations:${loopState.invocations}`);
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
    function resolveHeap(sourceFileMrState: SourceFileMrState, forFlow: ForFlow, withinLoop: boolean, maxGroupIdxToResolve?: number): void {
        const groupsForFlow = sourceFileMrState.groupsForFlow;
        const heap = forFlow.heap;

        //let loopMaxProcessedGroupIdx = -1;
        while (!heap.isEmpty()){
            if (maxGroupIdxToResolve!==undefined && heap.peek()>maxGroupIdxToResolve) break;
            const groupIdx = heap.remove();
//            if (groupIdx<=loopMaxProcessedGroupIdx) continue; // this group was already done inside loop
            const groupForFlow = groupsForFlow.orderedGroups[groupIdx];
            if (groupForFlow.kind===GroupForFlowKind.loop){
                /*loopMaxProcessedGroupIdx = */ processLoop(groupForFlow,sourceFileMrState,forFlow);
                continue;
            }
            const inferStatus: InferStatus = createInferStatus(groupForFlow, sourceFileMrState, withinLoop);
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
        Debug.assert(forFlow.groupToNodeToType);
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
            if (!inferStatus.accumBranches){
                Debug.assert(!forFlow.currentBranchesMap.has(groupForFlow));
                forFlow.currentBranchesMap.set(groupForFlow, cbe);
            }
            else {
                const unioncbe = forFlow.currentBranchesMap.get(groupForFlow);
                if (!unioncbe) forFlow.currentBranchesMap.set(groupForFlow, cbe);
                else {
                    Debug.assert(unioncbe.kind===CurrentBranchesElementKind.tf);
                    unioncbe.truthy = updatedCurrentBranchesItem(cbe.truthy,unioncbe.truthy,mrNarrow);
                    unioncbe.falsy = updatedCurrentBranchesItem(cbe.falsy,unioncbe.falsy,mrNarrow);
                }
            }
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
            if (!inferStatus.accumBranches){
                Debug.assert(!forFlow.currentBranchesMap.has(groupForFlow));
                forFlow.currentBranchesMap.set(groupForFlow, cbe);
            }
            else {
                const unioncbe = forFlow.currentBranchesMap.get(groupForFlow);
                if (!unioncbe) forFlow.currentBranchesMap.set(groupForFlow, cbe);
                else {
                    Debug.assert(unioncbe.kind===CurrentBranchesElementKind.plain);
                    unioncbe.item = updatedCurrentBranchesItem(cbe.item,unioncbe.item,mrNarrow);
                }
            }
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
            resolveHeap(sourceFileMrState, sourceFileMrState.mrState.forFlowTop, /*withinLoop*/ false);
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
    // function dbgGroupToNodeToTypeMap(mmap: Readonly<ESMap<GroupForFlow,NodeToTypeMap>>): string[] {
    //     const as: string[] = [];
    //     mmap.forEach((map,g)=>{
    //         dbgNodeToTypeMap(map).forEach(s=>as.push(`[groupIdx:${g.groupIdx}]: ${s}`));
    //     });
    //     return as;
    // }
    function dbgCurrentBranchesItem(cbi: CurrentBranchesItem, mrNarrow: MrNarrow): string[]{
        const astr: string[] = [];
        //astr.push(`nodeToTypeMap:`);
        astr.push(...mrNarrow.dbgRefTypesSymtabToStrings(cbi.sc.symtab).map(s => `symtab:         ${s}`));
        astr.push(...mrNarrow.dbgConstraintItem(cbi.sc.constraintItem).map(s  => `constraintItem: ${s}`));
        return astr;
    };
    function dbgCurrentBranchElement(cbe: CurrentBranchElement, sourceFileMrState: SourceFileMrState): string[]{
        const g = cbe.gff;
        const astr: string[] = [];
        const maximalNode = sourceFileMrState.groupsForFlow.posOrderedNodes[g.maximalIdx];
        astr.push(`groupIdx:${g.groupIdx}, cbe.kind:${cbe.kind}, node:[${dbgs?.dbgNodeToString(maximalNode)}]`);
        if (cbe.kind===CurrentBranchesElementKind.plain){
            astr.push(...dbgCurrentBranchesItem(cbe.item, sourceFileMrState.mrNarrow).map(s => "  "+s));
        }
        else if (cbe.kind===CurrentBranchesElementKind.tf){
            if (cbe.truthy){
                astr.push("  true:");
                astr.push(...dbgCurrentBranchesItem(cbe.truthy, sourceFileMrState.mrNarrow).map(s => "      "+s));
            }
            if (cbe.falsy){
                astr.push("  false:");
                astr.push(...dbgCurrentBranchesItem(cbe.falsy, sourceFileMrState.mrNarrow).map(s => "      "+s));
            }
        }
        return astr;
    }

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
