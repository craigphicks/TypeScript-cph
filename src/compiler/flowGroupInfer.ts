namespace ts {

    export const extraAsserts = true; // not suitable for release or timing tests.
    const hardCodeEnableTSDevExpectStringFalse = false; // gated with extraAsserts

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
        //precOrdContainerIdx: number,
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
        //refTypesTypeModule: RefTypesTypeModule;
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
        //originalConstraintIn: ConstraintItem;
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
    // @ ts-expect-error
    export type InvolvedSymbolTypeCacheOut = & {
        symtab?: ESMap<Symbol,RefTypesType>
        constraintItem: ConstraintItem;
    };
    export type InvolvedSymbolTypeCache = & {
        in: {
            identifierMap?: ESMap<Symbol,RefTypesType>;
            propertyAccessMap?: ESMap<Symbol,RefTypesType>;
            constraintItem: ConstraintItem;
        },
        out?: InvolvedSymbolTypeCacheOut;
        outTruthy?: InvolvedSymbolTypeCacheOut;
        outFalsy?: InvolvedSymbolTypeCacheOut;
    };

    export interface ForFlow {
        heap: Heap; // heap sorted indices into SourceFileMrState.groupsForFlow.orderedGroups
        currentBranchesMap: CurrentBranchesMap;
        groupToNodeToType?: ESMap<GroupForFlow,NodeToTypeMap >;
        loopState?: ProcessLoopState; // only present in loops
    }
    export interface ProcessLoopState {
        loopGroup: GroupForFlow;
        loopCountWithoutFinals: number;
        invocations: number;
        groupToInvolvedSymbolTypeCache: WeakMap<GroupForFlow,InvolvedSymbolTypeCache>;
        //symbolsReadNotAssigned?: Set<Symbol>;
        symbolsAssigned?: Set<Symbol>;
        symbolsAssignedRange?: WeakMap<Symbol,RefTypesType>;
        scForLoop0?: RefTypesSymtabConstraintItem;
    }
    export type SymbolFlowInfo = & {
        passCount: number;
        // initializedInAssignment?: boolean;  -- not used
        isconst: boolean;
        replayableItem?: ReplayableItem;
        typeNodeTsType?: Type;
        initializerType?: RefTypesType;
        effectiveDeclaredTsType: Type; // <actual declared type> || <widened initial type>
        effectiveDeclaredType?: RefTypesType; // = floughTypeModule.createRefTypesType(effectiveDeclaredTsType), createWhenNeeded
    };
    export type SymbolFlowInfoMap = WeakMap<Symbol,SymbolFlowInfo | undefined>;
    export interface MrState {
        checker: TypeChecker;
        replayableItems: WeakMap< Symbol, ReplayableItem >;
        //declaredTypes: ESMap<Symbol,RefTypesType>;
        forFlowTop: ForFlow;
        recursionLevel: number;
        dataForGetTypeOfExpressionShallowRecursive?: {
            sc: Readonly<RefTypesSymtabConstraintItem>,
            tmpExprNodeToTypeMap: Readonly<ESMap<Node,Type>>;
            expr: Expression | Node,
            returnErrorTypeOnFail: boolean | undefined
        } | undefined;
        currentLoopDepth: number;
        currentLoopsInLoopScope: Set<GroupForFlow>;
        loopGroupToProcessLoopStateMap?: WeakMap<GroupForFlow,ProcessLoopState>;
        symbolFlowInfoMap: SymbolFlowInfoMap;
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
            heap: createHeap(groupsForFlow),
            currentBranchesMap: new CurrentBranchesMapC(), //new Map<Readonly<GroupForFlow>, CurrentBranchElement>(),
            groupToNodeToType: new Map<GroupForFlow, NodeToTypeMap>(),
        };
    }

    // @ts-ignore
    function breakpoint(){
        debugger;
    }
    export function createSourceFileMrState(sourceFile: SourceFile, checker: TypeChecker, compilerOptions: CompilerOptions): SourceFileMrState {
        //if (getMyDebug()) breakpoint();;
        if (compilerOptions.floughConstraintsEnable===undefined) compilerOptions.floughConstraintsEnable = false;
        if (compilerOptions.enableTSDevExpectString===undefined) compilerOptions.enableTSDevExpectString = false;
        if (compilerOptions.floughDoNotWidenInitalizedFlowType===undefined) compilerOptions.floughDoNotWidenInitalizedFlowType = false;
        if (hardCodeEnableTSDevExpectStringFalse){
            compilerOptions.enableTSDevExpectString = false;
        }
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
            replayableItems: new WeakMap<Symbol, ReplayableItem>(),
            recursionLevel: 0,
            forFlowTop: createForFlow(groupsForFlow),
            currentLoopDepth: 0,
            currentLoopsInLoopScope: new Set<GroupForFlow>(),
            symbolFlowInfoMap: new WeakMap<Symbol,SymbolFlowInfo | undefined>()
        };
        //const refTypesTypeModule = floughTypeModule.createRefTypesTypeModule(checker);
        const mrNarrow = createMrNarrow(checker, sourceFile, mrState, /*refTypesTypeModule, */ compilerOptions);
        initializeFlowGroupRefTypesSymtabModule(mrNarrow);
        initFlowGroupInferApplyCrit(checker, mrNarrow);
        initFloughTypeModule(checker,compilerOptions);
        initFloughLogicalObjectOuter(checker);
        initFloughLogicalObjectInner(checker,dbgs,mrNarrow);
        return {
            sourceFile,
            groupsForFlow,
            mrState,
            mrNarrow,
            //refTypesTypeModule
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
    // @ts-ignore
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
        const minGroupIdxToAdd = options?.minGroupIdxToAdd;
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

    function createInferStatus(groupForFlow: GroupForFlow, sourceFileMrState: SourceFileMrState, accumBranches: false): InferStatus {
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
            groupNodeToTypeMap,
            accumBranches,
            getTypeOfExpressionShallowRecursion(sc: RefTypesSymtabConstraintItem, expr: Expression, returnErrorTypeOnFail?: boolean): Type {
                return this.callCheckerFunctionWithShallowRecursion(expr, sc, returnErrorTypeOnFail??false, mrState.checker.getTypeOfExpression, expr);
            },
            callCheckerFunctionWithShallowRecursion<FN extends TypeCheckerFn>(expr: Expression, sc: RefTypesSymtabConstraintItem, returnErrorTypeOnFail: boolean, checkerFn: FN, ...args: Parameters<FN>): ReturnType<FN>{
                mrState.dataForGetTypeOfExpressionShallowRecursive = { expr, sc, tmpExprNodeToTypeMap: this.groupNodeToTypeMap, returnErrorTypeOnFail };
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

    function createProcessLoopState(loopGroup: Readonly<GroupForFlow>, _setOfLoopDeps: Readonly<Set<GroupForFlow>>): ProcessLoopState {
        return {
            loopGroup,
            invocations:0, loopCountWithoutFinals:0,
            groupToInvolvedSymbolTypeCache: new WeakMap<GroupForFlow,InvolvedSymbolTypeCache>()
        };
    }

    export function getDevDebugger(node: Node, sourceFile: SourceFile): boolean{
        const num = Number(process.env.myDebug);
        if (isNaN(num) || num===0) return false;
        let stmnt = node;
        let hasStatement = false;
        while (stmnt.kind !== SyntaxKind.SourceFile){
            // if (isStatement(stmnt)){ // not what it looks like
            //     break;
            // }
            if (stmnt.kind >= SyntaxKind.FirstStatement && stmnt.kind <= SyntaxKind.LastStatement){
                hasStatement = true;
                break;
            }
            stmnt = stmnt.parent;
        }
        if (!hasStatement) return false;
        const arrCommentRange = getLeadingCommentRangesOfNode(stmnt, sourceFile);
        let cr: CommentRange | undefined;
        if (arrCommentRange) cr = arrCommentRange[arrCommentRange.length-1];
        if (cr) {
            const comment = sourceFile.text.slice(cr.pos, cr.end);
            const matches = /@ts-dev-debugger/.exec(comment);
            if (matches){
                return true;
            }
        }
        return false;
    }


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


    function processLoopOuter(loopGroup: GroupForFlow, sourceFileMrState: SourceFileMrState, forFlowParent: ForFlow): void {
        sourceFileMrState.mrState.currentLoopsInLoopScope.add(loopGroup);
        sourceFileMrState.mrState.currentLoopDepth++;
        let maxGroupIdxProcessed: number;
        const setOfLoopDeps = getGroupDependencies(loopGroup,sourceFileMrState, /*forFlow*/ undefined, { minGroupIdxToAdd: loopGroup.groupIdx });
        {
            maxGroupIdxProcessed = loopGroup.groupIdx;
            setOfLoopDeps.forEach(g=>maxGroupIdxProcessed=Math.max(maxGroupIdxProcessed, g.groupIdx));
        }

        if (sourceFileMrState.mrState.currentLoopDepth===1) {
            Debug.assert(sourceFileMrState.mrState.currentLoopsInLoopScope.size===1);
            Debug.assert(!sourceFileMrState.mrState.loopGroupToProcessLoopStateMap);
            sourceFileMrState.mrState.loopGroupToProcessLoopStateMap = new WeakMap<GroupForFlow,ProcessLoopState>();
            processLoop(loopGroup, sourceFileMrState, forFlowParent, setOfLoopDeps, maxGroupIdxProcessed);

            // before calling the loop the second time, we must know the "symbolsReadNotAssigned".

            updateHeapWithGroupForFlowV2(setOfLoopDeps,forFlowParent.heap);
            Debug.assert(forFlowParent.heap.peek()===loopGroup.groupIdx);
            forFlowParent.heap.remove();
            processLoop(loopGroup, sourceFileMrState, forFlowParent, setOfLoopDeps, maxGroupIdxProcessed);
            delete sourceFileMrState.mrState.loopGroupToProcessLoopStateMap;
        }
        else {
            Debug.assert(sourceFileMrState.mrState.loopGroupToProcessLoopStateMap);
            processLoop(loopGroup, sourceFileMrState, forFlowParent, setOfLoopDeps, maxGroupIdxProcessed);
        }
        sourceFileMrState.mrState.currentLoopDepth--;
        if (sourceFileMrState.mrState.currentLoopDepth===0) sourceFileMrState.mrState.currentLoopsInLoopScope.clear();
    }

    function processLoop(loopGroup: GroupForFlow, sourceFileMrState: SourceFileMrState, forFlowParent: ForFlow,
        setOfLoopDeps: Readonly<Set<GroupForFlow>>, maxGroupIdxProcessed: number): void {
        const dbgLevel=1;
        if (getMyDebug(dbgLevel)){
            consoleGroup(`processLoop[in] loopGroup.groupIdx:${loopGroup.groupIdx}, currentLoopDepth:${sourceFileMrState.mrState.currentLoopDepth}`);
        }
        Debug.assert(loopGroup.kind===GroupForFlowKind.loop);
        const anteGroupLabel: FlowGroupLabel = loopGroup.anteGroupLabels[0];
        Debug.assert(anteGroupLabel.kind===FlowGroupLabelKind.loop);
        //const mrNarrow = sourceFileMrState.mrNarrow;

        const setOfKeysToDeleteFromCurrentBranchesMap = new Map<GroupForFlow,Set<"then" | "else"> | undefined>();

        /**
         * When the outer loopGroup is complete, the loopState of each inner loopGroup-s should also become unreferenced.
         * Therefore the loopGroupToProcessLoopStateMap exists in the outer loop scope.
         *
         */

        const loopGroupToProcessLoopStateMap = sourceFileMrState.mrState.loopGroupToProcessLoopStateMap!;
        const loopState = (()=>{
            let got = loopGroupToProcessLoopStateMap.get(loopGroup);
            if (!got) {
                got = createProcessLoopState(loopGroup,setOfLoopDeps);
                loopGroupToProcessLoopStateMap.set(loopGroup,got);
            }
            return got;
        })();

        let loopCount = 0;
        let forFlowFinal: ForFlow;

        if (loopState.invocations>=1){
            setOfLoopDeps.forEach(gff=>{
                if (forFlowParent.currentBranchesMap.has(gff)) forFlowParent.currentBranchesMap.delete(gff);
                if (forFlowParent.groupToNodeToType!.has(gff)) forFlowParent.groupToNodeToType!.delete(gff);
            });
        }
        const forFlow: ForFlow = {
            currentBranchesMap: forFlowParent.currentBranchesMap,
            heap: forFlowParent.heap,
            groupToNodeToType: forFlowParent.groupToNodeToType!,
            loopState,
            //loopGroupToProcessLoopStateMap
        };

        if (getMyDebug(dbgLevel)){
            consoleLog(`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, do the condition of the loop, loopCount:${loopCount}, loopState.invocations:${loopState.invocations}`);
        }
        //let cachedSubloopSCForLoopConditionIn: RefTypesSymtabConstraintItem;
        let outerSCForLoopConditionIn: RefTypesSymtabConstraintItem;
        {
            const inferStatus: InferStatus = createInferStatus(loopGroup, sourceFileMrState, /*accumBranches*/ false);
            // Caching of scForLoop0 is only required for the outermost, depth===1, loop
            if (sourceFileMrState.mrState.currentLoopDepth===1){
                if (loopState.invocations===0){
                    Debug.assert(!loopState.scForLoop0);
                    outerSCForLoopConditionIn = doFlowGroupLabel(anteGroupLabel.antePrevious, setOfKeysToDeleteFromCurrentBranchesMap, sourceFileMrState, forFlow);
                    setOfKeysToDeleteFromCurrentBranchesMap.forEach((set, gff)=>forFlow.currentBranchesMap.delete(gff, set));
                    setOfKeysToDeleteFromCurrentBranchesMap.clear();
                    loopState.scForLoop0 = outerSCForLoopConditionIn;
                }
                else {
                    Debug.assert(loopState.scForLoop0);
                    outerSCForLoopConditionIn = loopState.scForLoop0;
                    // delete loopState.scForLoop0;
                }
            }
            else {
                Debug.assert(!loopState.scForLoop0);
                outerSCForLoopConditionIn = doFlowGroupLabel(anteGroupLabel.antePrevious, setOfKeysToDeleteFromCurrentBranchesMap, sourceFileMrState, forFlow);
                setOfKeysToDeleteFromCurrentBranchesMap.forEach((set, gff)=>forFlow.currentBranchesMap.delete(gff, set));
                setOfKeysToDeleteFromCurrentBranchesMap.clear();
            }
            // cachedSubloopSCForLoopConditionIn = {
            //     symtab: createSubloopRefTypesSymtab(outerSCForLoopConditionIn.symtab, loopState, loopGroup),
            //     constraintItem: outerSCForLoopConditionIn.constraintItem
            // };
            const subloopSCForLoopConditionIn = createSubLoopRefTypesSymtabConstraint(outerSCForLoopConditionIn, loopState, loopGroup);

            resolveGroupForFlow(loopGroup, inferStatus, sourceFileMrState, forFlow,
                { loopGroupIdx:loopGroup.groupIdx,cachedSCForLoop: subloopSCForLoopConditionIn });
        }
        if (getMyDebug(dbgLevel)){
            consoleLog(`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, did the condition of the loop, loopCount:${loopCount}, loopState.invocations:${loopState.invocations}`);
        }
        do {
            const cbe = forFlow.currentBranchesMap.get(loopGroup);
            Debug.assert(cbe?.kind===CurrentBranchesElementKind.tf);
            // do the rest of the loop
            if (getMyDebug(dbgLevel)){
                consoleLog(`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, do the rest of the loop, loopCount:${loopCount}, loopState.invocations:${loopState.invocations}`);
            }
            resolveHeap(sourceFileMrState,forFlow, /*accumBranches*/ false, maxGroupIdxProcessed);
            if (getMyDebug(dbgLevel)){
                consoleLog(`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, did the rest of the loop, loopCount:${loopCount}, loopState.invocations:${loopState.invocations}`);
            }

            setOfKeysToDeleteFromCurrentBranchesMap.clear();
            let arrSCForLoopContinue: RefTypesSymtabConstraintItem[] = [];
            arrSCForLoopContinue = anteGroupLabel.arrAnteContinue.map(fglab=>{
                return doFlowGroupLabel(fglab, setOfKeysToDeleteFromCurrentBranchesMap, sourceFileMrState, forFlow);
            });
            setOfKeysToDeleteFromCurrentBranchesMap.forEach((set,gff)=>forFlow.currentBranchesMap.delete(gff,set));
            setOfKeysToDeleteFromCurrentBranchesMap.clear();

            if (true) {
                const scForConditionContinue = orSymtabConstraints(arrSCForLoopContinue/*, mrNarrow*/);
                if (loopState.invocations===0){
                    loopState.symbolsAssignedRange = scForConditionContinue.symtab
                        ? getSymbolsAssignedRange(scForConditionContinue.symtab) : undefined;
                }
                const scForConditionUnionOfInAndContinue: RefTypesSymtabConstraintItem = isRefTypesSymtabConstraintItemNever(scForConditionContinue)
                    ? createSubLoopRefTypesSymtabConstraint(outerSCForLoopConditionIn, loopState, loopGroup)
                    : { symtab: modifiedInnerSymtabUsingOuterForFinalCondition(scForConditionContinue.symtab!), constraintItem: scForConditionContinue.constraintItem };

                if (loopState.invocations===1){
                    loopState.symbolsAssignedRange = undefined;
                }
                    // const subloopSCForLoopConditionIn = createSubLoopRefTypesSymtabConstraint(outerSCForLoopConditionIn, loopState, loopGroup);
                // const scForConditionUnionOfInAndContinue = orSymtabConstraints([subloopSCForLoopConditionIn, ...arrSCForLoopContinue], mrNarrow);
                // at this point, can we set loopState.symbolsAssignedRange
                if (getMyDebug(dbgLevel)){
                    consoleLog(`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, do the final condition of the loop, loopCount:${loopCount}, loopState.invocations:${loopState.invocations}`);
                }
                forFlow.currentBranchesMap.delete(loopGroup);

                // The groupToNodeToType map must be replaced by the second call to resolveGroupForFlow(loopGroup,...)
                if (forFlowParent.currentBranchesMap.has(loopGroup)) forFlowParent.currentBranchesMap.delete(loopGroup); // This is not required because it will be overwritten anyway.
                if (forFlowParent.groupToNodeToType!.has(loopGroup)) forFlowParent.groupToNodeToType!.delete(loopGroup);

                const inferStatus: InferStatus = createInferStatus(loopGroup, sourceFileMrState, /*accumBranches*/ false);
                    resolveGroupForFlow(loopGroup, inferStatus, sourceFileMrState, forFlow, { cachedSCForLoop: scForConditionUnionOfInAndContinue, loopGroupIdx:loopGroup.groupIdx });

                if (getMyDebug(dbgLevel)){
                    consoleLog(`processLoop[dbg] loopGroup.groupIdx:${loopGroup.groupIdx}, did the final condition of the loop, loopCount:${loopCount}, loopState.invocations:${loopState.invocations}`);
                }
            }

            const converged = true;
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

        // if (mrNarrow.compilerOptions.enableTSDevExpectString && sourceFileMrState.mrState.currentLoopDepth===1){
        //     sourceFileMrState.mrState.currentLoopsInLoopScope.forEach(loopg=>{
        //         const node = sourceFileMrState.groupsForFlow.posOrderedNodes[loopg.maximalIdx];
        //         const expected = getDevExpectString(node.parent, sourceFileMrState.sourceFile);
        //         if (expected===undefined) return;
        //         const lstate: ProcessLoopState = loopGroupToProcessLoopStateMap.get(loopg)!;
        //         const actual = `loopCount:${lstate.loopCountWithoutFinals}, invocations:${lstate.invocations}`;
        //         if (actual!==expected){
        //             Debug.fail(`@ts-dev-expect-string expected:"${expected}" !== actual:"${actual}" ; node:${dbgs!.dbgNodeToString(node)}`);
        //         }
        //     });
        // }
        /**
         *
         */
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
        loopState.invocations++;
    }


    /**
     * Resolve the groups in the heap, which are in order of increasing dependence.
     * @param sourceFileMrState
     */
    function resolveHeap(sourceFileMrState: SourceFileMrState, forFlow: ForFlow, withinLoop: false, maxGroupIdxToResolve?: number): void {
        const groupsForFlow = sourceFileMrState.groupsForFlow;
        const heap = forFlow.heap;
        while (!heap.isEmpty()){
            if (maxGroupIdxToResolve!==undefined && heap.peek()>maxGroupIdxToResolve) break;
            const groupIdx = heap.remove();
            const groupForFlow = groupsForFlow.orderedGroups[groupIdx];
            if (groupForFlow.kind===GroupForFlowKind.loop){
                processLoopOuter(groupForFlow,sourceFileMrState,forFlow);
                continue;
            }
            const inferStatus: InferStatus = createInferStatus(groupForFlow, sourceFileMrState, withinLoop);
            resolveGroupForFlow(groupForFlow, inferStatus, sourceFileMrState, forFlow);
        } // while (!heap.isEmpty())
    }


    function doFlowGroupLabel(fglabIn: FlowGroupLabel, setOfKeysToDeleteFromCurrentBranchesMap: ESMap<GroupForFlow,Set<"then" | "else"> | undefined>, sourceFileMrState: SourceFileMrState, forFlow: ForFlow): RefTypesSymtabConstraintItem {
        const {groupsForFlow,mrNarrow} = sourceFileMrState;
        return doFlowGroupLabelAux(fglabIn);

        function getLoopLocals(loopGroup: Readonly<GroupForFlow>): Readonly<SymbolTable> | undefined {
            const loopGroupMaximalNode = sourceFileMrState.groupsForFlow.posOrderedNodes[loopGroup.maximalIdx];
            const locals: SymbolTable | undefined = ((loopGroupMaximalNode.parent as IterationStatement).statement as Block).locals;
            return locals?.size ? locals : undefined;
        }

        function filterSymtabBySymbolTable(symtab: Readonly<RefTypesSymtab>, locals: Readonly<SymbolTable>, dbgCaller: string): RefTypesSymtab {
            let newsymtab: RefTypesSymtab | undefined;
            locals.forEach(s=>{
                if (getMyDebug() && symtab.has(s)){
                    consoleLog(`${dbgCaller}: descoping symbol ${mrNarrow.dbgSymbolToStringSimple(s)}`);
                }
                if (!newsymtab){
                    if (symtab.has(s)) {
                        (newsymtab = copyRefTypesSymtab(symtab)).delete(s);
                    }
                }
                else newsymtab.delete(s);
            });
            return newsymtab ?? symtab;
        }

        function doFlowGroupLabelAux(fglab: FlowGroupLabel): RefTypesSymtabConstraintItem {
            switch (fglab.kind){
                case FlowGroupLabelKind.ref:{
                    const anteg = groupsForFlow.orderedGroups[fglab.groupIdx];
                    const cbe = forFlow.currentBranchesMap.get(anteg);
                    Debug.assert(!cbe || cbe.kind===CurrentBranchesElementKind.plain);
                    if (!cbe || !((cbe as CurrentBranchElementPlain).item.sc as RefTypesSymtabConstraintItemNotNever).symtab){
                        // This may happen if continues after a loop are not yet fulfilled.
                        return { constraintItem: createFlowConstraintNever() };
                    }
                    assertCastType<CurrentBranchElementPlain>(cbe);
                    Debug.assert(cbe.kind===CurrentBranchesElementKind.plain);
                    setOfKeysToDeleteFromCurrentBranchesMap.set(anteg,undefined);
                    const ret: Partial<RefTypesSymtabConstraintItemNotNever> = { constraintItem: cbe.item.sc.constraintItem as ConstraintItemNotNever };
                    if ((cbe.item.sc as RefTypesSymtabConstraintItemNotNever).symtab) ret.symtab = (cbe.item.sc as RefTypesSymtabConstraintItemNotNever).symtab;
                    return ret as RefTypesSymtabConstraintItem;
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
                    return orSymtabConstraints([sc0, ...asc]/*, mrNarrow*/);
                }
                case FlowGroupLabelKind.loopThen:
                    return doThenElse(fglab.loopGroupIdx, /*truthy*/ true);
                case FlowGroupLabelKind.postLoop:{
                    // let sc0 = doPostLoop(fglab.loopGroupIdx);
                    let sc0: RefTypesSymtabConstraintItem | undefined = doThenElse(fglab.loopGroupIdx,/**/ false);
                    if (isRefTypesSymtabConstraintItemNever(sc0)) sc0 = undefined;
                    let asc: RefTypesSymtabConstraintItemNotNever[]
                        = fglab.arrAnteBreak.map(x=>doFlowGroupLabelAux(x)).filter(sc=>!isRefTypesSymtabConstraintItemNever(sc)) as RefTypesSymtabConstraintItemNotNever[];

                    const locals = getLoopLocals(sourceFileMrState.groupsForFlow.orderedGroups[fglab.loopGroupIdx]);
                    if (locals){
                        if (sc0) sc0 = { symtab: filterSymtabBySymbolTable(sc0.symtab!,locals, "postLoop-main"), constraintItem:sc0.constraintItem };
                        asc = asc.map(sc=>({ symtab: filterSymtabBySymbolTable(sc.symtab,locals, "postLoop-break"), constraintItem: sc.constraintItem }));
                    }
                    if (sc0) asc.push(sc0 as RefTypesSymtabConstraintItemNotNever);

                    // if (!doProxySymtabSqueezing) return orSymtabConstraints([sc0, ...asc], mrNarrow);
                    if (asc.length===0) return { constraintItem: createFlowConstraintNever() };
                    const oredsc = orSymtabConstraints(asc/*, mrNarrow*/);
                    return createSuperloopRefTypesSymtabConstraintItem(oredsc);
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
            if (true){
                if (!cbe) return { constraintItem: createFlowConstraintNever() };
            }
            else {
                // Perhaps this could imply that the path was untraversed because it was never
                Debug.assert(cbe);
            }
            if (cbe.kind===CurrentBranchesElementKind.tf) {
                if (truthy){
                    const got = setOfKeysToDeleteFromCurrentBranchesMap.get(anteg);
                    if (!got) setOfKeysToDeleteFromCurrentBranchesMap.set(anteg, new Set<"else" | "then">(["then"]));
                    else got.add("then");
                    return cbe.truthy.sc;
                }
                else {
                    const got = setOfKeysToDeleteFromCurrentBranchesMap.get(anteg);
                    if (!got) setOfKeysToDeleteFromCurrentBranchesMap.set(anteg, new Set<"else" | "then">(["else"]));
                    else got.add("else");
                    return cbe.falsy.sc;
                }
            }
            else {
                Debug.fail("unexpected");
            }
        };
        // function doPostLoop(loopGroupIdx: number): RefTypesSymtabConstraintItem {
        //     const loopGroup = groupsForFlow.orderedGroups[loopGroupIdx];
        //     // if (loopGroup.postLoopGroupIdx!==undefined){
        //     //     const postLoopGroup = groupsForFlow.orderedGroups[loopGroup.postLoopGroupIdx];
        //     // }
        //     const cbe = forFlow.currentBranchesMap.get(loopGroup);
        //     Debug.assert(cbe && cbe.kind===CurrentBranchesElementKind.tf);
        //     const {constraintItem,symtab}=cbe.falsy.sc;
        //     return { constraintItem,symtab };
        // }
        function doPostBlock(fglab: FlowGroupLabelPostBlock): RefTypesSymtabConstraintItem {
            const sc = doFlowGroupLabelAux(fglab.ante);
            if (isRefTypesSymtabConstraintItemNever(sc)) return sc;
            if (fglab.originatingBlock.locals?.size){
                sc.symtab = filterSymtabBySymbolTable(sc.symtab!,fglab.originatingBlock.locals, "postBlock");
            }
            return sc;
            // remove the going-out-of-scope symbols from thre symbol table.
            // const newsymtab = copyRefTypesSymtab(sc.symtab);
            // fglab.originatingBlock.locals?.forEach((symbol)=>{
            //     if (getMyDebug()){
            //         consoleLog(`doPostBlock: descoping symbol ${mrNarrow.dbgSymbolToStringSimple(symbol)}`);
            //     }
            //     newsymtab.delete(symbol);
            // });
            // return { symtab:newsymtab, constraintItem:sc.constraintItem };
        }
        function doOneFlowGroupLabelPostIf(fglab: FlowGroupLabelPostIf): RefTypesSymtabConstraintItem {
            const arrsc = fglab.arrAnte.map(ante=>doFlowGroupLabelAux(ante));
            // if (mrNarrow.compilerOptions.mrNarrowConstraintsEnable){
            //     const origGroup = groupsForFlow.orderedGroups[fglab.originatingGroupIdx];
            //     const origCbe = forFlow.currentBranchesMap.get(origGroup)!;
            //     Debug.assert(origCbe.kind===CurrentBranchesElementKind.tf);
            //     if (arrsc.length===2 &&
            //         arrsc[0].constraintItem===origCbe.truthy.sc.constraintItem &&
            //         arrsc[1].constraintItem===origCbe.falsy.sc.constraintItem){
            //         return {
            //             symtab: orSymtabs(arrsc.map(x=>x.symtab), mrNarrow),
            //             constraintItem: origCbe.originalConstraintIn
            //         };
            //     }
            // }
            return orSymtabConstraints(arrsc/*, mrNarrow*/);
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
                return sc;
            }
            if (groupForFlow.previousAnteGroupIdx!==undefined){
                Debug.assert(!sc);  // when previousAnteGroupIdx is present, anteGroupLabels.length must have been zero
                const prevAnteGroup = groupsForFlow.orderedGroups[groupForFlow.previousAnteGroupIdx];

                setOfKeysToDeleteFromCurrentBranchesMap.set(prevAnteGroup,undefined);

                const cbe = forFlow.currentBranchesMap.get(prevAnteGroup);
                if (!(cbe && cbe.kind===CurrentBranchesElementKind.plain)){
                    Debug.fail("unexpected");
                }
                return { ...cbe.item.sc };
                // const {constraintItem,symtab}=cbe.item.sc;
                // sc = { constraintItem,symtab };
            }
            return { symtab:createRefTypesSymtab(), constraintItem: createFlowConstraintAlways() };
        };

        //const {constraintItem:constraintItemArg , symtab:refTypesSymtabArg} = getAnteConstraintItemAndSymtab();
        const anteSCArg = getAnteConstraintItemAndSymtab();
        // const constraintItemArg = anteSCArg.constraintItem;
        // const refTypesSymtabArg: RefTypesSymtab | undefined = (anteSCArg as RefTypesSymtabConstraintItemNotNever).symtab;
        /**
         * Delete all the no-longer-needed CurrentBranchElements.  Note that unentangled lower scoped const variables will be
         * implicitly deleted with these deletions of their containing ConstraintItem-s.
         */
        setOfKeysToDeleteFromCurrentBranchesMap.forEach((set,gff)=>forFlow.currentBranchesMap.delete(gff,set));
        if (getMyDebug()){
            consoleLog(`resolveGroupForFlow[dbg] result of getAnteConstraintItemAndSymtab():`);
            if (!isRefTypesSymtabConstraintItemNever(anteSCArg)){
                mrNarrow.dbgRefTypesSymtabToStrings(anteSCArg.symtab!).forEach(s=>{
                    consoleLog(`resolveGroupForFlow[dbg] symtab: ${s}`);
                });
            }
            mrNarrow.dbgConstraintItem(anteSCArg.constraintItem).forEach(s=>{
                consoleLog(`resolveGroupForFlow[dbg] constraintItem: ${s}`);
            });
            consoleLog(`resolveGroupForFlow[dbg] end of result of getAnteConstraintItemAndSymtab():`);
        }

        const crit: InferCrit = !inferStatus.inCondition ? { kind: InferCritKind.none } : { kind: InferCritKind.truthy, alsoFailing: true };
        Debug.assert(forFlow.groupToNodeToType);

        let scpassing: RefTypesSymtabConstraintItem;
        let scfailing: RefTypesSymtabConstraintItem | undefined;

        inferStatus.isInLoop = !!forFlow.loopState;
        if (getDevDebugger(maximalNode,sourceFileMrState.sourceFile)){
            debugger;
        }
        const mntr = sourceFileMrState.mrNarrow.flough({
            sci: anteSCArg,
            expr:maximalNode, crit, qdotfallout: undefined, inferStatus });

        if (getMyDebug()) {
            consoleLog(`resolveGroupForFlow[after flough]${dbgs?.dbgNodeToString(maximalNode)}`);
            // mntr.unmerged.forEach((rttr,i)=>{
            //     mrNarrow.dbgRefTypesTableToStrings(rttr).forEach(s=>consoleLog(`---- resolveGroupForFlow[post flough]: mntr.unmerged[${i}]: ${s}`));
            // });
        }

        if (!inferStatus.inCondition){
            scpassing = applyCritNoneUnion(mntr,inferStatus.groupNodeToTypeMap).sci;
        }
        else {
            const critret = applyCrit(mntr,{ kind:InferCritKind.truthy, alsoFailing:true },inferStatus.groupNodeToTypeMap);
            scpassing = critret.passing.sci;
            scfailing = critret.failing!.sci;
        }
        if (inferStatus.inCondition){
            const cbe: CurrentBranchElementTF = {
                kind: CurrentBranchesElementKind.tf,
                gff: groupForFlow,
                falsy: {
                    sc: { symtab: scfailing!.symtab, constraintItem: scfailing!.constraintItem }
                },
                truthy: {
                    sc: { symtab: scpassing.symtab, constraintItem: scpassing.constraintItem }
                },
            };
            if (!inferStatus.accumBranches){
                Debug.assert(!forFlow.currentBranchesMap.has(groupForFlow));
                forFlow.currentBranchesMap.set(groupForFlow, cbe);
            }
            else {
                Debug.fail("unexpected");
            }
        }
        else {
            const cbe: CurrentBranchElementPlain = {
                kind: CurrentBranchesElementKind.plain,
                gff: groupForFlow,
                item: {
                    sc: { symtab:scpassing.symtab, constraintItem:scpassing.constraintItem }
                }
            };
            if (!inferStatus.accumBranches){
                Debug.assert(!forFlow.currentBranchesMap.has(groupForFlow));
                forFlow.currentBranchesMap.set(groupForFlow, cbe);
            }
        }

        if (getMyDebug()){
            consoleLog(`resolveGroupForFlow[dbg:] currentBranchesMap[after]:`);
            dbgForFlow(sourceFileMrState, forFlow).forEach(s=>consoleLog(`resolveGroupForFlow[dbg:] currentBranchesMap[after]: ${s}`));
            consoleLog(`resolveGroupForFlow[dbg:] endof currentBranchesMap[after]:`);
            dbgNodeToTypeMap(inferStatus.groupNodeToTypeMap).forEach(str=>{
                consoleLog(`resolveGroupForFlow[dbg] groupNodeToTypeMap: ${str}`);
            });
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
            /**
             * It turns out that the upper "checkeExpression" software will try to do minor flow analsis outside of the scope
             * of mrState.dataForGetTypeOfExpressionShallowRecursive.expr, so the original design doesn't work.
             * However the queries should be answerable below with groupNodeToTypeMap, so we need to fall through to that,
             * and only fail if that doesn't work.
             */
            if (getMyDebug()){
                consoleLog(`getTypeByMrNarrowAux[dbg]: getTypeOfExpressionShallowRecursive: ${dbgs!.dbgNodeToString(expr)}`);
                // let p = expr;
                // while (p!==mrState.dataForGetTypeOfExpressionShallowRecursive.expr && p.kind!==SyntaxKind.SourceFile) p=p.parent;
                // Debug.assert(p===mrState.dataForGetTypeOfExpressionShallowRecursive.expr, "unexpected");
            }
            const tstype = mrState.dataForGetTypeOfExpressionShallowRecursive.tmpExprNodeToTypeMap.get(expr);
            //Debug.assert(tstype);
            if (tstype) return tstype;
            consoleLog(`getTypeByMrNarrowAux[dbg]: getTypeOfExpressionShallowRecursive step 1 failed, trying groupsForFlow.nodeToGroupMap`);
        }

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
            // TODO: This is almost certainly never taken.
            Debug.fail("unexpected");
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

        if (mrState.dataForGetTypeOfExpressionShallowRecursive?.returnErrorTypeOnFail){
            if (getMyDebug()){
                consoleLog(`getTypeByMrNarrowAux[dbg]: getTypeOfExpressionShallowRecursive step 2 failed, returnErrorTypeOnFail`);
            }
            return sourceFileMrState.mrState.checker.getErrorType();
        }

        Debug.assert(sourceFileMrState.mrState.recursionLevel===0,"expected sourceFileMrState.mrState.recursionLevel===0");
        sourceFileMrState.mrState.recursionLevel++;
        updateHeapWithGroupForFlow(groupForFlow,sourceFileMrState, sourceFileMrState.mrState.forFlowTop);
        resolveHeap(sourceFileMrState, sourceFileMrState.mrState.forFlowTop, /*withinLoop*/ false);
        sourceFileMrState.mrState.recursionLevel--;
        return sourceFileMrState.mrState.forFlowTop.groupToNodeToType?.get(groupForFlow)?.get(expr) ?? sourceFileMrState.mrState.checker.getNeverType();

    }
    function dbgNodeToTypeMap(map: Readonly<NodeToTypeMap>): string[] {
        const astr: string[] = [];
        map.forEach((t,n)=>{
            astr.push(`[node:${dbgs?.dbgNodeToString(n)}] -> type:${dbgs?.dbgTypeToString(t)}`);
        });
        return astr;
    }
    function dbgCurrentBranchesItem(cbi: CurrentBranchesItem, mrNarrow: MrNarrow): string[]{
        const astr: string[] = [];
        //astr.push(`nodeToTypeMap:`);
        if (!cbi.sc.symtab) astr.push("symtab: <undef>");
        else astr.push(...mrNarrow.dbgRefTypesSymtabToStrings(cbi.sc.symtab).map(s => `symtab:         ${s}`));
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
                    astr.push("    true:" + (cbe.truthyDone? "[deleted]" : ""));
                    astr.push(...dbgCurrentBranchesItem(cbe.truthy, sourceFileMrState.mrNarrow).map(s => "      "+s));
                }
                if (cbe.falsy){
                    astr.push("    false:" + (cbe.falsyDone? "[deleted]" : ""));
                    astr.push(...dbgCurrentBranchesItem(cbe.falsy, sourceFileMrState.mrNarrow).map(s => "      "+s));
                }
            }
        });
        return astr;
    }

    /* @ ts-ignore */
    function dbgForFlow(sourceFileMrState: SourceFileMrState, forFlow: ForFlow): string[]{
        const astr: string[] = [];
        astr.push(`forFlow.currentBranchesMap.size:${forFlow.currentBranchesMap.size}`);
        dbgCurrentBranchesMap(forFlow.currentBranchesMap, sourceFileMrState).forEach(s=>astr.push(`forFlow.currentBranchesMap: ${s}`));
        forFlow.groupToNodeToType?.forEach((map, g)=>{
            astr.push(...dbgNodeToTypeMap(map).map(s => `groupIdx:${g.groupIdx}: ${s}`));
        });
        return astr;
    }
}
