namespace ts {




    export interface FloughAccessModule {
        logicalObjectAccess(root: Readonly<FloughLogicalObjectIF>, akey: FloughType[]): Readonly<FloughAccessResult>;
        logicalObjectModify(accessResult: Readonly<FloughAccessResult>, modifiedTypes: (FloughType | true | undefined)[]): FloughLogicalObjectIF;
    };
    export const floughAccessModule: FloughAccessModule = {
        logicalObjectAccess,
        logicalObjectModify,
    };

    /**
     * Depth-first search
     */
    const essymbolAccessState = Symbol("essymbolAccessState");



    type LookupItem = LogicalObjectForEachTypeOfPropertyLookupItem;
    // {
    //     logicalObject: FloughLogicalObjectIF;
    //     key?: LiteralType | undefined;
    //     type: FloughType;
    // }

    type Link = & {
        item: LookupItem;
        parents: number[];
    };

    type LevelState = & {
        links: Link[];
        linkIndex: number; // into Links
        //nTypes: FloughType[]; // non-object types
    };

    type AccessState = & {
        stack: LevelState[];
        root: Readonly<FloughLogicalObjectIF>;
        akey: FloughType[];
    };

    export type FloughAccessResult = & {
        types: FloughType[];
        [essymbolAccessState]: AccessState;
    };

    function logicalObjectAccess(root: Readonly<FloughLogicalObjectIF>, akey: FloughType[]): Readonly<FloughAccessResult> {

        const stack: LevelState[] = [];

        function createLevelState(): LevelState {
            return {
                links: [],
                linkIndex: 0,
            };
        }
        function init(): LevelState {
            const state = createLevelState();
            const lookupItems: LogicalObjectForEachTypeOfPropertyLookupItem[]=[];
            floughLogicalObjectModule.logicalObjectForEachTypeOfPropertyLookup(root, akey[0], lookupItems);
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i=0;i<lookupItems.length;i++){
                state.links.push({ item: lookupItems[i], parents: [] });
            }
            return state;
        }
        stack.push(init());

        let idxInStack = 0;
        while (true) {

            if (idxInStack===akey.length){
                Debug.fail("iwozere");
            }
            /**
             * Depth first
             * - first try to go deeper
             * - if not possible, go to next link
             * - if not possible, go to parent
             */
            if (idxInStack<akey.length && idxInStack+1<stack.length && stack[idxInStack+1].linkIndex<stack[idxInStack+1].links.length){
                idxInStack++;
                continue;
            }
            else if (stack[idxInStack].linkIndex<stack[idxInStack].links.length){
                // drop though
            }
            else {
                if (idxInStack===0) break;
                idxInStack--;
                continue;
            }

            const parentState = stack[idxInStack];
            if (parentState.linkIndex===parentState.links.length){
                Debug.fail("iwozere");
            }
            else {
                const parentItem = parentState.links[parentState.linkIndex].item;
                const parentType = parentItem.type;
                const parentTypeLogicalObject = floughTypeModule.getLogicalObject(parentType);
                if (!parentTypeLogicalObject){
                    parentState.linkIndex++;
                    continue;
                }
                const lookupItems: LookupItem[]=[];
                floughLogicalObjectModule.logicalObjectForEachTypeOfPropertyLookup(parentTypeLogicalObject, akey[idxInStack],lookupItems);
                if (lookupItems.length===0){
                    parentState.linkIndex++;
                    continue;
                }
                if (idxInStack===akey.length-1) stack.push(createLevelState());
                const nextstate = stack[idxInStack+1];
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let i=0;i<lookupItems.length;i++){
                    // check if logicalItem is already in nextstate.links
                    const existingIndex = nextstate.links.findIndex((link)=>floughLogicalObjectModule.equalLogicalObjects(link.item.logicalObject,lookupItems[i].logicalObject) as boolean);
                    if (existingIndex===-1){
                        nextstate.links.push({ item: lookupItems[i], parents: [parentState.linkIndex] });
                    }
                    else {
                        nextstate.links[existingIndex].parents.push(parentState.linkIndex);
                    }
                }
                parentState.linkIndex++;
                continue;
            }
        } // while

        // all levels should be complete now
        if (extraAsserts){
            stack.forEach((levelState,idx)=>{
                Debug.assert(levelState.links.length===levelState.linkIndex,"unexpected: ",()=>`level ${idx} is not complete`);
            });
        }


        return {
            types: stack[stack.length-1].links.map((link)=>link.item.type),
            [essymbolAccessState]: {
                stack,
                root,
                akey,
            }
        };
    } // floughAccess


    /**
     *
     * @param accessResult return value of logicalObjectAccess
     * @param modifiedTypes should be same length as accessResult.types
     *   Each the value should be:
     *   - undefined: the type is never, so the branch is not taken
     *   - true: the type is not modied
     *   - FloughType: the type is modified, it is a strict subset of the original type
     * @returns an array of {logicalObject,type} pairs, one for each non-undefined entry in modifiedTypes.
     *
     * @remarks
     * Under the following conditions, the logicalObject of any returned {logicalObject,type} pair will correspond to an object that is a strict subset of the original object.
     * - each link for every path from the end type back to the root has a single literal key type.
     */
    // @ts-expect-error
    function logicalObjectModify(accessResult: Readonly<FloughAccessResult>, modifedTypes: (Readonly<FloughType> | true | undefined)[]): {logicalObject: FloughLogicalObjectIF, type: FloughType}[] {
        //const { stack, root } = accessResult[essymbolAccessState].stack;
        Debug.fail("not yet implemented");
    }


}