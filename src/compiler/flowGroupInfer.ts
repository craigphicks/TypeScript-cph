namespace ts {

    let dbgs: Dbgs | undefined;

    export interface SourceFileMrState {
        sourceFile: SourceFile;
        groupedFlowNodes: GroupedFlowNodes;
        mrState: MrState;
    };

    interface AccState {
        dummy: void;
    }
    export interface MrState {
        flowNodeGroupToStateMap: ESMap <FlowNodeGroup, AccState>;
        stack?: FlowNodeGroup[];
        checker: TypeChecker;
        //aliasableAssignmentsCache: ESMap<Symbol, AliasAssignableState>; // not sure it makes sense anymore
        //aliasInlineLevel: number;
    }

    // @ts-ignore-error
    function consoleLogStack(is: MrState){
        consoleGroup("mrState.stack:");
        if (!is.stack) {
            consoleLog("stack empty");
            return;
        }
        for (let i = is.stack.length-1; i>= 0; i--){
            consoleLog(`[#${i}]: ${dbgs!.dbgFlowNodeGroupToString(is.stack[i])}`);
        }
        consoleGroupEnd();
    }

    export function createSourceFileInferState(sourceFile: SourceFile, checker: TypeChecker): SourceFileMrState {
        const t0 = process.hrtime.bigint();
        const groupedFlowNodes = groupFlowNodesFromSourceFile(sourceFile);
        const t1 = process.hrtime.bigint() - t0;
        groupedFlowNodes.dbgCreationTimeMs = t1/BigInt(1000000);

        dbgs = createDbgs(checker);

        return {
            sourceFile,
            groupedFlowNodes,
            mrState: {
                flowNodeGroupToStateMap: new Map <FlowNodeGroup, AccState>(),
                checker
            }
        };
    }

    export function isGroupCached(mrState: MrState, group: FlowNodeGroup){
        return mrState.flowNodeGroupToStateMap.has(group);
    }


    function resolveNodefulGroupUsingStates(_group: NodefulFlowNodeGroup, _groupStates: MrState){
        // resolve and update groupStates
        // if (group.maximal.flags & FlowFlags.Assignment){
        //     const parent = group.maximal.
        //     if ()
        // }
    }


    /**
     *
     * @param group
     * @param mrState
     * @returns an array in reverse order of resolution
     */
    export function createDependencyStack(group: Readonly<FlowNodeGroup>, mrState: MrState): void {
        consoleGroup(`createDependencyStack[in] group: ${dbgs?.dbgFlowNodeGroupToString(group)}`);
        const acc = new Set<FlowNodeGroup>([group]);
        getAntecedentGroups(group).forEach(a=>{
            if (!isGroupCached(mrState, a) && !acc.has(a)){
                change = true;
                acc.add(a);
            }
        });
        let change = true;
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
        mrState.stack = depGroups;
        consoleLogStack(mrState);
        consoleGroupEnd();
    }

    export function resolveDependencyStack(stack: FlowNodeGroup[], groupStates: MrState){
        while (stack.length){
            const group = stack.pop()!;
            if (isNodelessFlowNodeGroup(group)){
                // branches, loops, functions, switch, etc, go here.
            }
            else if (isNodefulFlowNodeGroup(group)){
                resolveNodefulGroupUsingStates(group, groupStates);
            }
        }
    }

}
