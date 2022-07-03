namespace ts {
    interface FlowGroupStates {
        dummy: number;
    }
    function isGroupCached(_groupStates: FlowGroupStates, _group: FlowNodeGroup){
        return false;
    }

    export interface FlowNodeSmack {

    }

    function resolveNodefulGroupUsingStates(_group: NodefulFlowNodeGroup, _groupStates: FlowGroupStates){
        // resolve and update groupStates
    }


    /**
     *
     * @param group
     * @param groupStates
     * @returns an array in reverse order of resolution
     */
    export function createDependencyStack(group: Readonly<FlowNodeGroupWithAntecedentGroups>, groupStates: Readonly<FlowGroupStates>): FlowNodeGroup[] {
        const acc = new Set<FlowNodeGroup>([group]);
        group.antecedentGroups.forEach(g => {
            if (!isGroupCached(groupStates, g)) acc.add(g);
        });
        let change = true;
        while (change) {
            change = false;
            acc.forEach(g=>{
                getAntecedentGroups(g).forEach(a=>{
                    if (!isGroupCached(groupStates, a) && !acc.has(a)){
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
        const idxrefs: number[]=Array(depGroups.length).map((_,i)=>i);
        const compare = (xr: number, yr: number) => {
            const ix = getOrdinal(depGroups[xr]);
            const iy = getOrdinal(depGroups[yr]);
            return iy-ix;
        };
        idxrefs.sort(compare);
        /**
         * Working the stack with pop, descending order is preferred.
         */
        const stack = idxrefs.map(i=>depGroups[i]);
        return stack;
    }

    export function resolveDependencyStack(stack: FlowNodeGroup[], groupStates: FlowGroupStates){
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
