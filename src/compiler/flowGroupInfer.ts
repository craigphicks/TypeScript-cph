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
        // loop="loop",
        // postLoop="postLoop",
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
    // export type FlowGroupLabelLoop = & {
    //     kind: FlowGroupLabelKind.loop;
    //     anteLoopEnd: FlowGroupLabel;
    // };
    // export type FlowGroupLabelPostLoop = & {
    //     kind: FlowGroupLabelKind.postLoop;
    //     loopGroupIdx: number;
    // };

    export type FlowGroupLabel = FlowGroupLabelRef | FlowGroupLabelThen | FlowGroupLabelElse | FlowGroupLabelPostIf
    // | FlowGroupLabelLoop | FlowGroupLabelPostLoop
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
        //referencingGroupIdxs: number[];
    };

    export interface ContainerItem { node: Node, precOrderIdx: number };
    export interface GroupsForFlow {
        orderedGroups: GroupForFlow[],
        precOrderContainerItems: ContainerItem[];
        posOrderedNodes: Node[];
        groupToAnteGroupMap: ESMap< GroupForFlow, Set<GroupForFlow> >; // used in updateHeap
        nodeToGroupMap: ESMap< Node, GroupForFlow >;
        dbgFlowToOriginatingGroupIdx?: ESMap<FlowNode, number>; // kill?
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

    export interface MrState {
        checker: TypeChecker;
        replayableItems: ESMap< Symbol, ReplayableItem >;
        declaredTypes: ESMap<Symbol,RefTypesTableLeaf>;
        forFlow: {
            heap: Heap; // heap sorted indices into SourceFileMrState.groupsForFlow.orderedGroups
            currentBranchesMap: ESMap< Readonly<GroupForFlow>, CurrentBranchElement >;
            dbgCurrentBranchesMapWasDeleted: ESMap< Readonly<GroupForFlow>, boolean >;
            groupToNodeToType?: ESMap< Readonly<GroupForFlow>, NodeToTypeMap >;
        };
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

    export function createSourceFileInferState(sourceFile: SourceFile, checker: TypeChecker): SourceFileMrState {
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
            forFlow: {
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
                    if (!cbe){
                        Debug.assert(!mrState.forFlow.dbgCurrentBranchesMapWasDeleted.has(anteg));
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
                if (setOfAnteGroups){
                    setOfAnteGroups.forEach((ag)=>{
                        if (false) {//(!(groupForFlow.anteLabels?.loop)) {
                            Debug.assert(!heap.has(ag.groupIdx));
                            const cbe = mrState.forFlow.currentBranchesMap.get(ag);
                            Debug.assert(cbe);
                        }
                    });
                }
            }
            resolveGroupForFlow(groupForFlow, sourceFileMrState);
        }
    }

    function resolveGroupForFlow(groupForFlow: Readonly<GroupForFlow>, sourceFileMrState: SourceFileMrState): void {
        const groupsForFlow = sourceFileMrState.groupsForFlow;
        const mrState = sourceFileMrState.mrState;
        const mrNarrow = sourceFileMrState.mrNarrow;
        const maximalNode = groupsForFlow.posOrderedNodes[groupForFlow.maximalIdx];
        if (getMyDebug()){
            consoleGroup(`resolveGroupForFlow[in]: ${dbgs?.dbgNodeToString(maximalNode)}, groupIndex:${groupForFlow.groupIdx}, kind:${groupForFlow.kind}, maximalNode.parent.kind:${Debug.formatSyntaxKind(maximalNode.parent.kind)}`);
            consoleLog(`resolveGroupForFlow[dbg:] currentBranchesMap[before]:`);
            dbgCurrentBranchesMap(sourceFileMrState).forEach(s=>consoleLog(`resolveGroupForFlow[dbg:] currentBranchesMap[before]: ${s}`));
            consoleLog(`resolveGroupForFlow[dbg:] endof currentBranchesMap[before]:`);
        }
        const setOfKeysToDeleteFromCurrentBranchesMap: Set<GroupForFlow> = new Set<GroupForFlow>();
        const doOneFlowGroupLabelPostIf = (fglab: FlowGroupLabelPostIf): RefTypesSymtabConstraintItem => {
            const helper = (x: FlowGroupLabelRef | FlowGroupLabelThen | FlowGroupLabelElse | FlowGroupLabelPostIf): RefTypesSymtabConstraintItem => {
                if (x.kind===FlowGroupLabelKind.ref){
                    const anteg = groupsForFlow.orderedGroups[x.groupIdx];
                    const cbe = mrState.forFlow.currentBranchesMap.get(anteg)!;
                    Debug.assert(cbe.kind===CurrentBranchesElementKind.plain);
                    const { symtab, constraintItem } = cbe.item.refTypesTableReturn;
                    return { symtab, constraintItem };
                }
                else if (x.kind===FlowGroupLabelKind.then || x.kind===FlowGroupLabelKind.else){
                    const anteg = groupsForFlow.orderedGroups[x.ifGroupIdx];
                    const cbe = mrState.forFlow.currentBranchesMap.get(anteg)!;
                    Debug.assert(cbe.kind===CurrentBranchesElementKind.tf);
                    const { symtab, constraintItem } = x.kind===FlowGroupLabelKind.then ? cbe.truthy.refTypesTableReturn : cbe.falsy.refTypesTableReturn;
                    return { symtab, constraintItem };
                }
                else if (x.kind===FlowGroupLabelKind.postIf){
                    return doOneFlowGroupLabelPostIf(x);
                }
                else Debug.fail("unexpected");
            };
            const thenSymtabConstraint = helper(fglab.anteThen);
            const elseSymtabConstraint = helper(fglab.anteElse);
            const origGroup = groupsForFlow.orderedGroups[fglab.originatingGroupIdx];

            setOfKeysToDeleteFromCurrentBranchesMap.add(origGroup);

            const origCbe = mrState.forFlow.currentBranchesMap.get(origGroup)!;
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
        const getAnteConstraintItemAndSymtabV2 = (): RefTypesSymtabConstraintItem => {
            let sc: RefTypesSymtabConstraintItem | undefined;
            if (groupForFlow.anteGroupLabels.length){
                Debug.assert(groupForFlow.anteGroupLabels.length===1);
                const flowGroupLabel = groupForFlow.anteGroupLabels[0];
                if (flowGroupLabel.kind===FlowGroupLabelKind.postIf){
                    sc = doOneFlowGroupLabelPostIf(flowGroupLabel);
                }
                else if (flowGroupLabel.kind===FlowGroupLabelKind.then){
                    const anteg = groupsForFlow.orderedGroups[flowGroupLabel.ifGroupIdx];
                    const cbe = mrState.forFlow.currentBranchesMap.get(anteg);
                    Debug.assert(cbe && cbe.kind===CurrentBranchesElementKind.tf && cbe.truthy);
                    const {constraintItem,symtab}=cbe.truthy.refTypesTableReturn;
                    sc = { constraintItem,symtab };
                }
                else if (flowGroupLabel.kind===FlowGroupLabelKind.else){
                    const anteg = groupsForFlow.orderedGroups[flowGroupLabel.ifGroupIdx];
                    const cbe = mrState.forFlow.currentBranchesMap.get(anteg);
                    Debug.assert(cbe && cbe.kind===CurrentBranchesElementKind.tf && cbe.falsy);
                    const {constraintItem,symtab}=cbe.falsy.refTypesTableReturn;
                    sc = { constraintItem,symtab };
                }
                else {
                    Debug.fail("not yet implemented");
                }
            }
            if (groupForFlow.previousAnteGroupIdx!==undefined){
                Debug.assert(!sc);
                const prevAnteGroup = groupsForFlow.orderedGroups[groupForFlow.previousAnteGroupIdx];

                setOfKeysToDeleteFromCurrentBranchesMap.add(prevAnteGroup);

                const cbe = mrState.forFlow.currentBranchesMap.get(prevAnteGroup);
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

        // eslint-disable-next-line prefer-const
        let {constraintItem:constraintItemArg , symtab:refTypesSymtabArg} = getAnteConstraintItemAndSymtabV2();
        /**
         * Delete all the no-longer-needed CurrentBranchElements.  Note that unentangled lower scoped const variables will be
         * implicitly deleted with these deletions of their containing ConstraintItem-s.
         */
        setOfKeysToDeleteFromCurrentBranchesMap.forEach(gff=>mrState.forFlow.currentBranchesMap.delete(gff));
        const boolsplit = groupForFlow.kind===GroupForFlowKind.ifexpr;  //maximalNode.parent.kind===SyntaxKind.IfStatement;
        const crit: InferCrit = !boolsplit ? { kind: InferCritKind.none } : { kind: InferCritKind.truthy, alsoFailing: true };
        const inferStatus: InferStatus = {
            inCondition: !!boolsplit,
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
        /**
         * groupNodeToTypeMap may be set before calling checker.getTypeOfExpression(...) from beneath mrNarrowTypes, which will require those types in
         * groupNodeToTypeMap.
         */
        if (!sourceFileMrState.mrState.forFlow.groupToNodeToType) sourceFileMrState.mrState.forFlow.groupToNodeToType = new Map<GroupForFlow, NodeToTypeMap>();
        sourceFileMrState.mrState.forFlow.groupToNodeToType.set(groupForFlow, inferStatus.groupNodeToTypeMap);

        const retval = sourceFileMrState.mrNarrow.mrNarrowTypes({
            refTypesSymtab: refTypesSymtabArg, expr:maximalNode, crit, qdotfallout: undefined, inferStatus, constraintItem: constraintItemArg });

        if (boolsplit){
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
            sourceFileMrState.mrState.forFlow.currentBranchesMap.set(groupForFlow, cbe);
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
            sourceFileMrState.mrState.forFlow.currentBranchesMap.set(groupForFlow, cbe);
        }

        if (getMyDebug()){
            consoleLog(`resolveGroupForFlow[dbg:] currentBranchesMap[after]:`);
            dbgCurrentBranchesMap(sourceFileMrState).forEach(s=>consoleLog(`resolveGroupForFlow[dbg:] currentBranchesMap[after]: ${s}`));
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
            const cachedType = sourceFileMrState.mrState.forFlow.groupToNodeToType?.get(groupForFlow)?.get(expr);
            if (cachedType) {
                if (getMyDebug()) consoleLog(`getTypeByMrNarrowAux[dbg]: cache hit`);
                return cachedType;
            }
            updateHeapWithGroupForFlow(groupForFlow,sourceFileMrState);
            resolveHeap(sourceFileMrState);
            return sourceFileMrState.mrState.forFlow.groupToNodeToType?.get(groupForFlow)?.get(expr) ?? sourceFileMrState.mrState.checker.getNeverType();
        }
        finally {
            sourceFileMrState.mrState.recursionLevel--;
        }

    }

    /* @ ts-ignore */
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
            const byNode = sourceFileMrState.mrState.forFlow.groupToNodeToType?.get(g)!;
            if (byNode) astr.push(...doNodeToTypeMap(byNode).map(s => "  "+s));
        });
        return astr;
    }
}
