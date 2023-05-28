namespace ts {




    export interface FloughAccessModule {
        logicalObjectAccess(roots: Readonly<FloughLogicalObjectIF[]>, akey: FloughType[]): Readonly<FloughAccessResult>;
        logicalObjectModify(accessResult: Readonly<FloughAccessResult>, modifedTypes: (Readonly<FloughType> | true | undefined)[]): {rootLogicalObject: FloughLogicalObjectIF, type: FloughType}[];
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

    function logicalObjectAccess(roots: Readonly<FloughLogicalObjectIF[]>, akey: FloughType[]): Readonly<FloughAccessResult> {

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

            //const rootBaseLogicalObjects: FloughLogicalObjectIF[] = [];
            roots.forEach((root, _iroot)=>{
                const lookupItems2: LogicalObjectForEachTypeOfPropertyLookupItem[]=[];
                floughLogicalObjectModule.logicalObjectForEachTypeOfPropertyLookup(root, akey[0], lookupItems2);
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let i=0;i<lookupItems.length;i++){
                    const existingIndex = lookupItems.findIndex((item2)=>floughLogicalObjectModule.identicalLogicalObjects(item2.logicalObject,lookupItems[i].logicalObject));
                    if (existingIndex===-1){
                        lookupItems.push(lookupItems[i]);
                    }
                }
            });
            return state;
        }
        stack.push(init());

        let idxInStack = 0;
        while (true) {

            // if (idxInStack===akey.length){
            //     Debug.fail("iwozere");
            // }
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
            {
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
                    // "===" should suffice, but just in case
                    const existingIndex = nextstate.links.findIndex((link)=>floughLogicalObjectModule.identicalLogicalObjects(link.item.logicalObject,lookupItems[i].logicalObject));
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
        const root = floughLogicalObjectModule.unionOfFloughLogicalObjects(stack[0].links.map((link)=>link.item.logicalObject));

        return {
            types: stack[stack.length-1].links.map((link)=>link.item.type),
            [essymbolAccessState]: {
                stack,
                root,
                akey,
            }
        };
    } // floughAccess


    type OldToNewLogicalObjectMap = ESMap<FloughLogicalObjectInnerIF,FloughLogicalObjectInnerIF>;
    function createLogicalObjectMap() {
        return new Map<FloughLogicalObjectInnerIF,FloughLogicalObjectInnerIF>();
    }
    function setMap(map: OldToNewLogicalObjectMap, oldobj: Readonly<FloughLogicalObjectIF>, newobj: Readonly<FloughLogicalObjectIF>) {
        const oldInner = floughLogicalObjectModule.getInnerIF(oldobj);
        if (map.has(oldInner)) Debug.fail("unexpected");
        map.set(oldInner,floughLogicalObjectModule.getInnerIF(newobj));
    }
    // @ ts-expect-error
    type FloughAccessLogicalObjectModifyResultItem = & {
        rootLogicalObject: FloughLogicalObjectIF, type: FloughType //| Readonly<FloughType>
    };
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
    function logicalObjectModify(accessResult: Readonly<FloughAccessResult>, modifiedTypes: (Readonly<FloughType> | true | undefined)[]): {rootLogicalObject: FloughLogicalObjectIF, type: Readonly<FloughType>}[] {
        type ResultItem = FloughAccessLogicalObjectModifyResultItem;

        const { stack, root } = accessResult[essymbolAccessState];


        // The final layer of access resullt
        const lastLinks = stack[stack.length-1].links;
        {
            if (lastLinks.length!==modifiedTypes.length){
                Debug.fail("programming error, expected links.length!==modifedTypes.length");
            }
        }
        // Each modified final type will end up with its own root logical object
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        const resultItems: ResultItem[]=[];
        for (let i=0;i<lastLinks.length;i++){
            const modifiedType = modifiedTypes[i];
            if (modifiedType===true) {
                resultItems.push({ rootLogicalObject: root, type: lastLinks[i].item.type });
            }
            if (modifiedType===undefined) {
                // do nothing: effectively trimmed
            }
            else {
                // We have to make sure that every link on every possible path to root contains only a single literal key type.  Otherwise, we won't modify the logical object.
                const stackOfParentItemIndices: number[][] = [];
                let ok = true;
                let setOfParentIndices: Set<number> = new Set([i]);
                let nextSetOfParentIndices: Set<number> = new Set();
                for (let stackIndex = stack.length-1;stackIndex>=0;stackIndex--){
                    ok = everyForSet(setOfParentIndices, (parentIndex)=>{
                        if (stack[stackIndex].links[parentIndex].item.key){
                            stack[stackIndex].links[parentIndex].parents.forEach((nextParentIdx)=>{
                                nextSetOfParentIndices.add(nextParentIdx);
                            });
                            return true;
                        }
                        else {
                            return false;
                        }
                    });
                    if (!ok) break;

                    const arrOfParentIndices: number[] = [];//Array.from(setOfParentIndices);
                    setOfParentIndices.forEach((parentIndex)=>arrOfParentIndices.push(parentIndex));
                    stackOfParentItemIndices[stackIndex]=arrOfParentIndices;

                    setOfParentIndices = nextSetOfParentIndices;
                    nextSetOfParentIndices = new Set();
                }
                if (!ok) {
                    // We can't modify the logical object, so just return the original.???
                    resultItems.push({ rootLogicalObject: root, type:modifiedType });
                    continue;
                }
                let logicalObjectMap: OldToNewLogicalObjectMap;
                for (let stackIndex = stack.length-1;stackIndex>=0;stackIndex--){
                    const nextLogicalObjectMap = createLogicalObjectMap();
                    const arrOfParentItemIndices = stackOfParentItemIndices[stackIndex];
                    //const LookupItems: LookupItem[] =
                    arrOfParentItemIndices.forEach((parentItemIndex)=>{
                        const parentItem = stack[stackIndex].links[parentItemIndex].item;
                        // const parentLogicalObject = parentItem.logicalObject;
                        // const parentType = parentItem.type;
                        // const parentKey = parentItem.key;
                        Debug.assert(parentItem.key);
                        if (stackIndex===stack.length-1){
                            const newlogicalObject = floughLogicalObjectModule.replaceTypeAtKey(parentItem.logicalObject, parentItem.key, modifiedType);
                            setMap(nextLogicalObjectMap, parentItem.logicalObject, newlogicalObject); // new could have fewer plain objects than original
                        }
                        else {
                            const x = floughLogicalObjectModule.replaceLogicalObjectsOfTypeAtKey(
                                parentItem.logicalObject, parentItem.key, logicalObjectMap);
                            if (x) {
                                const { logicalObject: newlogicalObject, type: newType } = x;
                                /**
                                 * TRIMMING is enforced as follows:
                                 * newlogicalObject will only have the plain objects that are in the logicalObjectsMap.
                                 * (Note: every key of logicalObjectsMap must be an exist plain objects in the type of parentItem.logicalObject.
                                 */
                                if (stackIndex===0){
                                    // We have reached the root, so we can modify the logical object
                                    // const logicalObject = floughLogicalObjectModule.replaceTypeAtKey(links[i].item.logicalObject, links[i].item.key, modifiedType);
                                    resultItems.push({ rootLogicalObject: newlogicalObject, type: newType });
                                }
                                setMap(nextLogicalObjectMap, parentItem.logicalObject, newlogicalObject);
                            }
                        }
                    });
                    logicalObjectMap = nextLogicalObjectMap;
                } // for (let stackIndex = stack.length-1;stackIndex>=0;stackIndex--)
            }
        }
        return resultItems;
    } // function logicalObjectModify(accessResult: Readonly<FloughAccessResult>, modifiedTypes: (Readonly<FloughType> | true | undefined)[]): {rootLogicalObject: FloughLogicalObjectIF, type: Readonly<FloughType>}[]


}