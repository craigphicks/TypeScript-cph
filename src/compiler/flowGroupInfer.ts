namespace ts {

    let dbgs: Dbgs | undefined;
    //let myDebug: boolean | undefined;

    export interface SourceFileMrState {
        sourceFile: SourceFile;
        groupedFlowNodes: GroupedFlowNodes;
        mrState: MrState;
        mrNarrow: MrNarrow;
    };

    // interface AccState {
    //     dummy: void;
    // }
    export interface StackItem {
        group: FlowNodeGroup;
        //refTypes?: RefTypes;
        depStackItems: StackItem[];  // the referenced items are "safe" from garbage collection even if stack is popped.
    }
    interface CurrentBranchesItem {
        /* refTypesRtn: RefTypesRtn, */
        refTypesTableReturn: RefTypesTableReturn;
        byNode: NodeToTypeMap;
        done?: boolean
    };

    export interface MrState {
        //flowNodeGroupToStateMap: ESMap <FlowNodeGroup, AccState>;
        //stack?: FlowNodeGroup[];
        groupToStackIdx: ESMap<FlowNodeGroup, number>;
        stack?: StackItem[];
        checker: TypeChecker;
        currentBranchesMap: ESMap<FlowNodeGroup, CurrentBranchesItem >;
        groupToNodeToType?: ESMap< FlowNodeGroup, NodeToTypeMap>;
        symbolToNodeToTypeMap: ESMap< Symbol, NodeToTypeMap>;
        // aliasableAssignmentsCache: ESMap<Symbol, AliasAssignableState>; // not sure it makes sense anymore
        // aliasInlineLevel: number;
    };
    export function createSourceFileInferState(sourceFile: SourceFile, checker: TypeChecker): SourceFileMrState {
        const t0 = process.hrtime.bigint();
        const groupedFlowNodes = groupFlowNodesFromSourceFile(sourceFile);
        const t1 = process.hrtime.bigint() - t0;
        groupedFlowNodes.dbgCreationTimeMs = t1/BigInt(1000000);

        dbgs = createDbgs(checker);
        //myDebug = getMyDebug();

        const mrState: MrState = {
            //flowNodeGroupToStateMap: new Map <FlowNodeGroup, AccState>(),
            checker,
            groupToStackIdx: new Map <FlowNodeGroup, number>(),
            currentBranchesMap: new Map<FlowNodeGroup, CurrentBranchesItem>(),
            symbolToNodeToTypeMap: new Map<Symbol,NodeToTypeMap>()
        };

        return {
            sourceFile,
            groupedFlowNodes,
            mrState,
            mrNarrow: createMrNarrow(checker, mrState)
        };
    }

    export function isGroupCached(mrState: MrState, group: FlowNodeGroup){
        if (isIfPairFlowNodeGroup(group)){
            const tc = mrState.currentBranchesMap.get(group.true);
            const fc = mrState.currentBranchesMap.get(group.false);
            Debug.assert((!!tc)===(!!fc));
            return !!tc;
        }
        return !!mrState.currentBranchesMap.get(group);
        // const stackIdx = mrState.groupToStackIdx.get(group);
        // return (stackIdx!==undefined && mrState.stack && stackIdx < mrState.stack.length && mrState.stack[stackIdx].refTypes);
    }


    function resolveNodefulGroupUsingState(item: StackItem, _stackIdx: number, sourceFileMrState: SourceFileMrState){
        const group = item.group;
        consoleGroup(`resolveNodefulGroupUsingState[in] group: ${dbgs?.dbgFlowNodeGroupToString(group)}`);
        Debug.assert(isNodefulFlowNodeGroup(group));
        Debug.assert(item.depStackItems.length<=1); // for a nodeful group;
        const antecedents = getAntecedentGroups(group);
        const currentBranchesItems: CurrentBranchesItem[]=[];
        consoleGroup(`resolveNodefulGroupUsingState[dbg]: antecedents:`);
        antecedents.forEach(a=>{
            consoleLog(`resolveNodefulGroupUsingState[dbg]: ${dbgs?.dbgFlowNodeGroupToString(a)}`);
            const cbi = sourceFileMrState.mrState.currentBranchesMap.get(a);
            Debug.assert(!cbi?.done);
            //if (cbi?.done) consoleLog(`cbi.done=true, ${dbgs?.dbgFlowNodeGroupToString(a)}`);
            if (cbi) currentBranchesItems.push(cbi);
            if (getMyDebug()) {
                if (!cbi) consoleLog(`!cbi`);
                else {
                    consoleLog(`resolveNodefulGroupUsingState[dbg]: cbi.done: ${cbi?.done}, cbi.refTypesTableReturn:`);
                    const astr = sourceFileMrState.mrNarrow.dbgRefTypesTableToStrings(cbi.refTypesTableReturn);
                    astr?.forEach(s=>{
                        consoleLog(`resolveNodefulGroupUsingState[dbg]:  ${s}`);
                    });
                }
            }
        });
        consoleLog(`resolveNodefulGroupUsingState[dbg]: antecedents end:`);
        consoleGroupEnd();
        Debug.assert(currentBranchesItems.length<=1);
        let refTypesSymtab: RefTypesSymtab;
        if (currentBranchesItems.length) refTypesSymtab = currentBranchesItems[0].refTypesTableReturn.symtab;
        else refTypesSymtab = sourceFileMrState.mrNarrow.createRefTypesSymtab();
        const ifPair = isIfPairFlowNodeGroup(group) ? group : undefined;
        const condExpr: Expression = getFlowGroupMaximalNode(group) as Expression;
        let replayData: ReplayData | false = false;
        let replayExpr: Expression | undefined;
        if (ifPair && isIdentifier(condExpr)) {
            const identSymbol = sourceFileMrState.mrState.checker.getResolvedSymbol(condExpr);
            const byNode = identSymbol && sourceFileMrState.mrState.symbolToNodeToTypeMap.get(identSymbol);
            if (byNode) {
                replayExpr = (()=>{
                    if (identSymbol.valueDeclaration && isVariableDeclaration(identSymbol.valueDeclaration)) return identSymbol.valueDeclaration.initializer;
                    Debug.assert(false);
                })();
                if (replayExpr) replayData = { byNode };
            }
            if (getMyDebug()){
                Debug.assert(identSymbol);
                if (replayData && replayExpr) consoleLog(`resolveNodefulGroupUsingState[dbg]: replayData available ${dbgs?.dbgNodeToString(condExpr)} -> ${dbgs?.dbgNodeToString(replayExpr)}`);
                else consoleLog(`resolveNodefulGroupUsingState[dbg]: replayData not available`);
            }
        }
        const crit: InferCrit = !ifPair ? { kind: InferCritKind.none } : { kind: InferCritKind.truthy, alsoFailing: true };
        const qdotfallout: RefTypesTableReturn[]=[];
        const retval: MrNarrowTypesReturn = sourceFileMrState.mrNarrow.mrNarrowTypes({ refTypesSymtab, condExpr: replayExpr??condExpr, crit, qdotfallout, replayData });
        if (ifPair){
            sourceFileMrState.mrState.currentBranchesMap.set(ifPair.true, { refTypesTableReturn: retval.inferRefRtnType.passing, byNode: retval.byNode });
            sourceFileMrState.mrState.currentBranchesMap.set(ifPair.false, { refTypesTableReturn: retval.inferRefRtnType.failing!, byNode: retval.byNode });
        }
        else {
            if (retval.saveByNodeForReplay) {
                Debug.assert(retval.inferRefRtnType.passing.symbol);
                sourceFileMrState.mrState.symbolToNodeToTypeMap.set(retval.inferRefRtnType.passing.symbol, retval.byNode);
            }
            sourceFileMrState.mrState.currentBranchesMap.set(group, { refTypesTableReturn: retval.inferRefRtnType.passing, byNode: retval.byNode });
        }
        if (currentBranchesItems.length) currentBranchesItems[0].done=true;
        if (!sourceFileMrState.mrState.groupToNodeToType) sourceFileMrState.mrState.groupToNodeToType = new Map<FlowNodeGroup, NodeToTypeMap>();
        sourceFileMrState.mrState.groupToNodeToType.set(group, retval.byNode);
        consoleLog(`resolveNodefulGroupUsingState[out] group: ${dbgs?.dbgFlowNodeGroupToString(group)}`);
        consoleGroupEnd();
    }


    /**
     *
     * @param group
     * @param mrState
     * @returns an array in reverse order of resolution
     */
    export function createDependencyStack(group: Readonly<FlowNodeGroup>, _sourceFileMrState: SourceFileMrState): void {
        const mrState = _sourceFileMrState.mrState;
        consoleGroup(`createDependencyStack[in] group: ${dbgs?.dbgFlowNodeGroupToString(group)}`);
        const acc = new Set<FlowNodeGroup>();
        let change = true;
        if (!isGroupCached(mrState, group)) {
            acc.add(group);
            getAntecedentGroups(group).forEach(a=>{
                if (!isGroupCached(mrState, a) && !acc.has(a)){
                    change = true;
                    acc.add(a);
                }
            });
        }
        while (change) {
            change = false;
            acc.forEach(g=>{
                getAntecedentGroups(g).forEach(a=>{
                    if (!isGroupCached(mrState, a) && !acc.has(a)){
                        change = true;
                        acc.add(a);
                    }
                });
            });
        }
        /**
         * acc will tend to be in descending order, so sorting in descending order is probably less work.
         */
        // @ts-expect-error 2679
        const depGroups: FlowNodeGroup[]= Array.from(acc.keys());
        //const idxrefs: number[]=Array(depGroups.length).map((_,i)=>i);
        const compare = (xr: FlowNodeGroup, yr: FlowNodeGroup) => {
            const ix = getOrdinal(xr);
            const iy = getOrdinal(yr);
            return iy-ix;
        };
        depGroups.sort(compare);
        /**
         * Working the stack with pop, descending order is preferred.
         */
        //const stack = idxrefs.map(i=>depGroups[i]);
        const groupToStackIdx = new Map<FlowNodeGroup, number>(depGroups.map((g,i)=>[g,i]));
        const stack: StackItem[] = depGroups.map((group)=>({
            depStackItems: [], group
        }));
        stack.forEach(si=>{
            getAntecedentGroups(si.group).forEach(a=>{
                const idx = groupToStackIdx.get(a);
                // Debug.assert(idx!==undefined);
                if (idx!==undefined) si.depStackItems.push(stack[idx]);
            });
        });
        mrState.stack = stack;
        mrState.groupToStackIdx = groupToStackIdx;
        consoleLogStack(mrState);
        consoleLog(`createDependencyStack[out] group: ${dbgs?.dbgFlowNodeGroupToString(group)}`);
        consoleGroupEnd();
    }

    export function resolveDependencyStack(_sourceFileMrState: SourceFileMrState): void{
        consoleGroup("resolveDependencyStack[in]");
        resolveDependencyStack_aux(_sourceFileMrState);
        consoleLog("resolveDependencyStack[out]");
        consoleGroupEnd();
    }
    export function resolveDependencyStack_aux(_sourceFileMrState: SourceFileMrState): void{
        const stack = _sourceFileMrState.mrState.stack;
        Debug.assert(stack);
        while (stack.length){
            const item = stack.pop()!;
            if (isNodelessFlowNodeGroup(item.group)){
                if (item.group.flow.flags & FlowFlags.Start) continue;
                if (item.group.flow.flags & FlowFlags.BranchLabel){
                    // @ts-ignore-error 2769
                    const antecedentGroups: FlowNodeGroup[] = Array.from(item.group.antecedentGroups.keys());
                    const arrRtr = antecedentGroups.filter(a => {
                        if (isNodelessFlowNodeGroup(a)){
                            if (isFlowStart(a.flow)) return;
                            Debug.fail();
                        }
                        else {
                            return a;
                        }
                    }).map(a=>{
                        const cbi = _sourceFileMrState.mrState.currentBranchesMap.get(a);
                        Debug.assert(cbi);
                        Debug.assert(!cbi.done);
                        Debug.assert(cbi.refTypesTableReturn);
                        return cbi.refTypesTableReturn;
                    });
                    _sourceFileMrState.mrState.currentBranchesMap.set(item.group, {
                        refTypesTableReturn: _sourceFileMrState.mrNarrow.mergeArrRefTypesTableReturnToRefTypesTableReturn(/*symbol*/ undefined, /* isconst */ undefined, arrRtr),
                        byNode: new Map<Node,Type>() // no need?
                    });
                    continue;
                }
                // branches, loops, functions, switch, etc, go here.
                Debug.fail(Debug.formatFlowFlags(item.group.flow.flags));
            }
            else if (isNodefulFlowNodeGroup(item.group)) {
                resolveNodefulGroupUsingState(item, stack.length, _sourceFileMrState);
            }
        }
    }

    export function getTypeByMrNarrow(reference: Node, sourceFileMrState: SourceFileMrState): Type {
        consoleGroup(`getTypeByMrNarrow[in] expr: ${dbgs?.dbgNodeToString(reference)}`);
        const type = getTypeByMrNarrow_aux(reference, sourceFileMrState);
        consoleLog(`getTypeByMrNarrow[out] expr: ${dbgs?.dbgNodeToString(reference)} -> ${dbgs?.dbgFlowTypeToString(type)}`);
        consoleGroupEnd();
        return type;
    }
    export function getTypeByMrNarrow_aux(expr: Node, sourceFileMrState: SourceFileMrState): Type {

        const grouped = sourceFileMrState.groupedFlowNodes;
        Debug.assert(grouped);
        //const nodeGroup = grouped.groupedNodes.nodeToOwnNodeGroupMap.get(reference);
        const flowGroup = (()=>{
            let parent = expr;
            let fg = grouped.nodeToFlowGroupMap.get(expr);
            if (fg) return fg;
            while (!fg && parent && parent.kind!==SyntaxKind.SourceFile && !(fg=grouped.nodeToFlowGroupMap.get(parent))) parent = parent.parent;
            return fg;
        })();

        if (!flowGroup){
            if (getMyDebug()){
                consoleLog(`getTypeByMrNarrow[dbg]: reference: ${dbgs!.dbgNodeToString(expr)}, does not have flowGroup`);
                //return sourceFileMrState.mrState.checker.getErrorType();
                Debug.fail();
            }
        }
        else {
            if (getMyDebug()){
                consoleLog(`getTypeByMrNarrow[dbg]: reference: ${dbgs!.dbgNodeToString(expr)}, flowGroup: ${dbgs!.dbgFlowNodeGroupToString(flowGroup)}`);
                const fToFG2 = grouped.flowNodeToGroupMap.get(expr.flowNode!);
                const str2 = `grouped.flowNodeToGroupMap.get(reference.flowNode): ${dbgs!.dbgFlowNodeGroupToString(fToFG2)}`;
                consoleLog("getTypeByMrNarrow[dbg]: "+str2);
                const nToFG2 = (expr.flowNode as any)?.node ? grouped.nodeToFlowGroupMap.get((expr.flowNode as any).node) : undefined;
                const str3 = `grouped.nodeToFlowGroupMap.get(reference.flowNode.node): ${dbgs!.dbgFlowNodeGroupToString(nToFG2)}`;
                consoleLog("getTypeByMrNarrow[dbg]: "+str3);
            }
            // getTypeByMrNarrow(reference, sourceFileInferState)
            createDependencyStack(flowGroup, sourceFileMrState);
            resolveDependencyStack(sourceFileMrState);
        }
        return sourceFileMrState.mrState.groupToNodeToType?.get(flowGroup!)?.get(expr) ?? sourceFileMrState.mrState.checker.getErrorType();
    }



    // @ts-ignore-error
    function consoleLogStack(mrState: MrState){
        consoleGroup("mrState.stack:");
        if (!mrState.stack) {
            consoleLog("stack empty");
            return;
        }
        for (let i = mrState.stack.length-1; i>= 0; i--){
            consoleLog(`[#${i}]: ${dbgs!.dbgFlowNodeGroupToString(mrState.stack[i].group)}`);
            const str = `  deps: ` + mrState.stack[i].depStackItems.map(si=>mrState.groupToStackIdx.get(si.group)!).map(i=>`${i}, `).join();
            consoleLog(str);
        }
        consoleGroupEnd();
    }


}
