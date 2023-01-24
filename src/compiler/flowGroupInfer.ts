namespace ts {

    let dbgs: Dbgs | undefined;
    export enum GroupForFlowKind {
        none="none",
        plain="plain",
        ifexpr="ifexpr"
    };
    export interface GroupForFlow {
        kind: GroupForFlowKind,
        maximalIdx: number,
        idxb: number,
        idxe: number,
        precOrdContainerIdx: number,
        groupIdx: number,
        anteLabels?: {
            postIf?: FlowLabel;
            then?: FlowLabel;
            else?: FlowLabel;
            arrBlock?: FlowLabel[];
            arrPostBlock?: FlowLabel[];
        },
        //branchMerger?: boolean; // kill?
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
    }

    export interface SourceFileMrState {
        sourceFile: SourceFile;
        groupsForFlow: GroupsForFlow,
        mrState: MrState;
        mrNarrow: MrNarrow;
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
            tmpExprNodeToTypeMap: Readonly<ESMap<Node,Type>>;
            expr: Expression
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
        const mrNarrow = sourceFileMrState.mrNarrow;
        const firstAnteGroup = (()=>{
            const setOfAnteGroups =groupsForFlow.groupToAnteGroupMap.get(groupForFlow);
            if (setOfAnteGroups && setOfAnteGroups.size===1) return setOfAnteGroups.keys().next().value;
            return undefined;
        })();
        const anteLabels: GroupForFlow["anteLabels"] | undefined = groupForFlow.anteLabels;
        const maximalNode = groupsForFlow.posOrderedNodes[groupForFlow.maximalIdx];
        if (getMyDebug()){
            consoleGroup(`resolveGroupForFlow[in]: ${dbgs?.dbgNodeToString(maximalNode)}, groupIndex:${groupForFlow.groupIdx}, kind:${groupForFlow.kind}, maximalNode.parent.kind:${Debug.formatSyntaxKind(maximalNode.parent.kind)}`);
            consoleLog(`resolveGroupForFlow[dbg:] currentBranchesMap[before]:`);
            dbgCurrentBranchesMap(sourceFileMrState).forEach(s=>consoleLog(`resolveGroupForFlow[dbg:] currentBranchesMap[before]:  ${s}`));
            consoleLog(`resolveGroupForFlow[dbg:] endof currentBranchesMap[before]:`);
            if (!anteLabels) consoleLog(`resolveGroupForFlow[dbg:] anteLabels: undefined`);
            else {
                consoleLog(`resolveGroupForFlow[dbg:] anteLabels: {`);
                consoleLog(`resolveGroupForFlow[dbg:]   then : ${dbgs!.dbgFlowToString(anteLabels.then)}`);
                consoleLog(`resolveGroupForFlow[dbg:]   else: ${dbgs!.dbgFlowToString(anteLabels.else)}`);
                consoleLog(`resolveGroupForFlow[dbg:]   postIf: ${dbgs!.dbgFlowToString(anteLabels.postIf)}`);
                anteLabels.arrBlock?.forEach((block,i)=>{
                    consoleLog(`resolveGroupForFlow[dbg:]   block[${i}]: ${dbgs!.dbgFlowToString(block)}`);
                });
                anteLabels.arrPostBlock?.forEach((block,i)=>{
                    consoleLog(`resolveGroupForFlow[dbg:]   postBlock[${i}]: ${dbgs!.dbgFlowToString(block)}`);
                });
                consoleLog(`resolveGroupForFlow[dbg:] }`);
            }
        }
        function mergeInfoRefTypesSymtab(source: Readonly<RefTypesSymtab>, target: RefTypesSymtab): void {
            source.forEach((x,symbol)=>{
                const got = target.get(symbol);
                if (got) mrNarrow.mergeToRefTypesType({ source:x.leaf.type, target:got.leaf.type });
                else target.set(symbol, x);
            });
        }

        // ensure that we don't attemp to delete the same item from mrState.forFlow.currentBranchesMap more than once,
        // whcih can happen without this guard, e.g., in the situation of an empty "this" or "else" branch with a "postIf"
        const setOfKeysToDeleteFromCurrentBranchesMap: Set<GroupForFlow> = new Set<GroupForFlow>();
        const doOnePostIf = (fnpi: Readonly<FlowLabel>, symtab: RefTypesSymtab): ConstraintItem => {
            consoleGroup(`doOnePostIf[in] fnpi: ${dbgs?.dbgFlowToString(fnpi,/**/ true)}`);
            Debug.assert(fnpi.branchKind===BranchKind.postIf);
            Debug.assert(fnpi.antecedents!.length===2);
            const postIfConstraints = fnpi.antecedents!.map(antefn=>{
                Debug.assert(!isFlowStart(antefn));
                if (isFlowBranch(antefn) && antefn.branchKind===BranchKind.postIf){
                    return doOnePostIf(antefn,symtab);
                }
                else {
                    let thenelse: FlowLabel | undefined;
                    while (!isFlowWithNode(antefn)){
                        Debug.assert(isFlowLabel(antefn));
                        if (antefn.branchKind===BranchKind.then||antefn.branchKind===BranchKind.else){
                            thenelse = antefn;
                        }
                        Debug.assert(antefn.antecedents && antefn.antecedents.length===1);
                        antefn = antefn.antecedents[0];
                    }
                    const anteg = groupsForFlow.nodeToGroupMap.get(antefn.node)!;
                    const cbe = mrState.forFlow.currentBranchesMap.get(anteg)!;
                    // mrState.forFlow.currentBranchesMap.delete(anteg);
                    // mrState.forFlow.dbgCurrentBranchesMapWasDeleted.set(anteg,true);
                    setOfKeysToDeleteFromCurrentBranchesMap.add(anteg);
                    if (cbe.kind===CurrentBranchesElementKind.tf){
                        Debug.assert(thenelse);
                        if (thenelse.branchKind===BranchKind.then) {
                            if (!cbe.truthy) return undefined;
                            mergeInfoRefTypesSymtab(cbe.truthy.refTypesTableReturn.symtab, symtab);
                            return cbe.truthy.refTypesTableReturn.constraintItem;
                        }
                        else if (thenelse.branchKind===BranchKind.else) {
                            if (!cbe.falsy) return undefined;
                            mergeInfoRefTypesSymtab(cbe.falsy.refTypesTableReturn.symtab, symtab);
                            return cbe.falsy.refTypesTableReturn.constraintItem;
                        }
                        else Debug.fail("unexpected");
                    }
                    else {
                        mergeInfoRefTypesSymtab(cbe.item.refTypesTableReturn.symtab, symtab);
                        return cbe.item.refTypesTableReturn.constraintItem;
                    }
                }
            });
            Debug.assert(fnpi.originatingExpression);
            consoleLog(`doOnePostIf[dbg] fnpi.originatingExpression: ${dbgs?.dbgNodeToString(fnpi.originatingExpression)})`);
            const origGroup = groupsForFlow.nodeToGroupMap.get(fnpi.originatingExpression);
            Debug.assert(origGroup);
            const origCbe = mrState.forFlow.currentBranchesMap.get(origGroup);
            Debug.assert(origCbe);
            Debug.assert(origCbe.kind===CurrentBranchesElementKind.tf);
            setOfKeysToDeleteFromCurrentBranchesMap.add(origGroup);
            consoleLog(`doOnePostIf[out] fnpi: ${dbgs?.dbgFlowToString(fnpi)}`);
            consoleGroupEnd();
            if (postIfConstraints[0]===origCbe.truthy?.refTypesTableReturn.constraintItem && postIfConstraints[1]===origCbe.falsy?.refTypesTableReturn.constraintItem){
                return origCbe.originalConstraintIn;
            }
            else {
                if (postIfConstraints[0] && postIfConstraints[1]) {
                    if (useConstraintsV2()) return orConstraintsV2(postIfConstraints as ConstraintItem[]);
                    else return createFlowConstraintNodeOr({ constraints: postIfConstraints as ConstraintItem[] });
                }
                else if (postIfConstraints[0]) return postIfConstraints[0];
                else if (postIfConstraints[1]) return postIfConstraints[1];
                else return createFlowConstraintAlways();
            }
        };

        const getAnteConstraintItemAndSymtab = (): {constraintItem: ConstraintItem, symtab: RefTypesSymtab}=>{
            if (anteLabels){
                // "then" and "else" must come after "postIf" because "postIf" may lead to "then" or "else" anyway.
                if (anteLabels.postIf){
                    const symtabOut = mrNarrow.createRefTypesSymtab();
                    const constraintItem = doOnePostIf(anteLabels.postIf, symtabOut);
                    return { constraintItem, symtab:symtabOut };
                }
                if (anteLabels.then){
                    Debug.assert(firstAnteGroup);
                    const cbe = mrState.forFlow.currentBranchesMap.get(firstAnteGroup);
                    Debug.assert(cbe && cbe.kind===CurrentBranchesElementKind.tf && cbe.truthy);
                    const {constraintItem,symtab}=cbe.truthy.refTypesTableReturn;
                    return { constraintItem,symtab };
                }
                if (anteLabels.else){
                    Debug.assert(firstAnteGroup);
                    const cbe = mrState.forFlow.currentBranchesMap.get(firstAnteGroup);
                    Debug.assert(cbe && cbe.kind===CurrentBranchesElementKind.tf && cbe.falsy);
                    const {constraintItem,symtab}=cbe.falsy.refTypesTableReturn;
                    return { constraintItem,symtab };
                }
            }
            if (firstAnteGroup){
                const cbe = mrState.forFlow.currentBranchesMap.get(firstAnteGroup);
                Debug.assert(cbe && cbe.kind===CurrentBranchesElementKind.plain);
                const {constraintItem,symtab}=cbe.item.refTypesTableReturn;
                setOfKeysToDeleteFromCurrentBranchesMap.add(firstAnteGroup);
                return { constraintItem,symtab };
            }
            else {
                const anteGroups = groupsForFlow.groupToAnteGroupMap.get(groupForFlow);
                Debug.assert(!anteGroups || !anteGroups.size);
                return { constraintItem: createFlowConstraintAlways(), symtab: mrNarrow.createRefTypesSymtab() };
            }
        };
        // eslint-disable-next-line prefer-const
        let {constraintItem:constraintItemArg , symtab:refTypesSymtabArg} = getAnteConstraintItemAndSymtab();
        /**
         * Delete all the no-longer-needed CurrentBranchElements.  Note that unentangled lower scoped const variables will be
         * implicitly deleted with these deletions of their containing ConstraintItem-s.
         */
        setOfKeysToDeleteFromCurrentBranchesMap.forEach(gff=>mrState.forFlow.currentBranchesMap.delete(gff));
        /**
         * If it is a block start then add in all the new local variables: TODO - no longer necessary with unmodified constraints and evalCover
         */
        if (anteLabels?.arrBlock){
            anteLabels?.arrBlock.forEach(block=>{
                block.originatingExpression?.locals?.forEach((symbol)=>{
                    const type = mrNarrow.createRefTypesType(mrNarrow.checker.getTypeOfSymbol(symbol));
                    const isconst = mrNarrow.checker.isConstVariable(symbol);
                    refTypesSymtabArg.set(symbol, { leaf: mrNarrow.createRefTypesTableLeaf(symbol, isconst, type) });
                });
            });
        }
        else if (anteLabels?.arrPostBlock){
            /**
             * Delete locally scoped variables from the symtab.
             */
            const localsSet = new Set<Symbol>();
            anteLabels?.arrPostBlock.forEach(block=>{
                const locals = block.originatingExpression?.locals;
                if (locals){
                    for (let iter = locals.values(), item = iter.next(); !item.done; item=iter.next()){
                        localsSet.add(item.value);
                    };
                    locals.forEach((symbol)=>Debug.assert(refTypesSymtabArg.has(symbol)));
                    locals.forEach((symbol)=>refTypesSymtabArg.delete(symbol));
                }
            });
            /**
             * Originally: clear the deleted variables from the constraint
             * Update: (See comments on removeSomeVariablesFromConstraint) - in cases of inner returns or jumps
             * lexically lower scoped variables may be acting
             * as hidden variables that are entangled with higher scoped variables. Therefore those lower
             * scoped variables cannot be removed.
             * As a consequence, there may be no need for post block processing at all.
             */
            // if (localsSet.size) {
            //     if (getMyDebug()){
            //         mrNarrow.dbgConstraintItem(constraintItemArg).forEach(s=>{
            //             consoleLog(`resolveGroupForFlow[dbg:] constraintItemArg[before removal]: ${s}`);
            //         });
            //     }
            //     constraintItemArg = removeSomeVariablesFromConstraint(constraintItemArg,localsSet,mrNarrow);
            //     if (getMyDebug()){
            //         mrNarrow.dbgConstraintItem(constraintItemArg).forEach(s=>{
            //             consoleLog(`resolveGroupForFlow[dbg:] constraintItemArg[after removal]: ${s}`);
            //         });
            //     }
            // }
        }
        const boolsplit = groupForFlow.kind===GroupForFlowKind.ifexpr;  //maximalNode.parent.kind===SyntaxKind.IfStatement;
        const crit: InferCrit = !boolsplit ? { kind: InferCritKind.none } : { kind: InferCritKind.truthy, alsoFailing: true };
        const inferStatus: InferStatus = {
            inCondition: !!boolsplit,
            currentReplayableItem: undefined,
            replayables: sourceFileMrState.mrState.replayableItems,
            declaredTypes: sourceFileMrState.mrState.declaredTypes,
            groupNodeToTypeMap: new Map<Node,Type>(),
            getTypeOfExpressionShallowRecursion(expr: Expression): Type {
                mrState.dataForGetTypeOfExpressionShallowRecursive = { expr, tmpExprNodeToTypeMap: this.groupNodeToTypeMap };
                let tstype: Type;
                try {
                   tstype = mrState.checker.getTypeOfExpression(expr);
                   return tstype;
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
            dbgCurrentBranchesMap(sourceFileMrState).forEach(s=>consoleLog(`resolveGroupForFlow[dbg:] currentBranchesMap[after]:  ${s}`));
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

        if (sourceFileMrState.mrState.dataForGetTypeOfExpressionShallowRecursive){
            if (getMyDebug()){
                consoleLog(`getTypeByMrNarrowAux[dbg]: getTypeOfExpressionShallowRecursive: ${dbgs!.dbgNodeToString(expr)}`);
                let p = expr;
                while (p!==sourceFileMrState.mrState.dataForGetTypeOfExpressionShallowRecursive.expr && p.kind!==SyntaxKind.SourceFile) p=p.parent;
                Debug.assert(p===sourceFileMrState.mrState.dataForGetTypeOfExpressionShallowRecursive.expr, "unexpected");
            }
            const tstype = sourceFileMrState.mrState.dataForGetTypeOfExpressionShallowRecursive.tmpExprNodeToTypeMap.get(expr);
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
