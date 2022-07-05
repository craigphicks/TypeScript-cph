namespace ts {

    let dbgs: Dbgs | undefined;

    export interface SourceFileInferState {
        sourceFile: SourceFile;
        groupedFlowNodes: GroupedFlowNodes;
        inferState: InferState;
    };

    interface AccState {
        dummy: void;
    }
    export interface InferState {
        flowNodeGroupToStateMap: ESMap <FlowNodeGroup, AccState>;
        stack?: FlowNodeGroup[];
        checker: TypeChecker
    }

    // @ts-ignore-error
    function consoleLogStack(is: InferState){
        consoleGroup("inferState.stack:");
        if (!is.stack) {
            consoleLog("stack empty");
            return;
        }
        for (let i = is.stack.length-1; i>= 0; i--){
            consoleLog(`[#${i}]: ${dbgs!.dbgFlowNodeGroupToString(is.stack[i])}`);
        }
        consoleGroupEnd();
    }

    export function createSourceFileInferState(sourceFile: SourceFile, checker: TypeChecker): SourceFileInferState {
        const t0 = process.hrtime.bigint();
        const groupedFlowNodes = groupFlowNodesFromSourceFile(sourceFile);
        const t1 = process.hrtime.bigint() - t0;
        groupedFlowNodes.dbgCreationTimeMs = t1/BigInt(1000000);

        dbgs = createDbgs(checker);

        return {
            sourceFile,
            groupedFlowNodes,
            inferState: {
                flowNodeGroupToStateMap: new Map <FlowNodeGroup, AccState>(),
                checker
            }
        };
    }

    export function isGroupCached(inferState: InferState, group: FlowNodeGroup){
        return inferState.flowNodeGroupToStateMap.has(group);
    }


    function resolveNodefulGroupUsingStates(_group: NodefulFlowNodeGroup, _groupStates: InferState){
        // resolve and update groupStates
    }


    /**
     *
     * @param group
     * @param inferState
     * @returns an array in reverse order of resolution
     */
    export function createDependencyStack(group: Readonly<FlowNodeGroup>, inferState: InferState): void {
        consoleGroup(`createDependencyStack[in] group: ${dbgs?.dbgFlowNodeGroupToString(group)}`);
        const acc = new Set<FlowNodeGroup>([group]);
        getAntecedentGroups(group).forEach(a=>{
            if (!isGroupCached(inferState, a) && !acc.has(a)){
                change = true;
                acc.add(a);
            }
        });
        let change = true;
        while (change) {
            change = false;
            acc.forEach(g=>{
                getAntecedentGroups(g).forEach(a=>{
                    if (!isGroupCached(inferState, a) && !acc.has(a)){
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
        inferState.stack = depGroups;
        consoleLogStack(inferState);
        consoleGroupEnd();
    }

    export function resolveDependencyStack(stack: FlowNodeGroup[], groupStates: InferState){
        while (stack.length){
            const group = stack.pop()!;
            if (isNodelessFlowNodeGroup(group)){
                // loops, functions, switch, etc, go here.
            }
            else if (isNodefulFlowNodeGroup(group)){
                resolveNodefulGroupUsingStates(group, groupStates);
            }
        }
    }

}
