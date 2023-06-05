namespace ts {


//    const checker = undefined as any as TypeChecker;

    export interface FloughAccessModule {
        logicalObjectAccess(
            roots: Readonly<FloughLogicalObjectIF[]>,
            akey: Readonly<FloughType[]>,
            aexpression: Readonly<Expression[]>,
            groupNodeToTypeMap: ESMap<Node,Type>,
        ): Readonly<FloughAccessResult>;
        logicalObjectModify(accessResult: Readonly<FloughAccessResult>, modifedTypes: (Readonly<FloughType> | true | undefined)[]): {rootLogicalObject: FloughLogicalObjectIF, type: FloughType}[];
        getTsTypesInChain(accessResult: Readonly<FloughAccessResult>, index: number): Type[];
    };
    export const floughAccessModule: FloughAccessModule = {
        logicalObjectAccess,
        logicalObjectModify,
        getTsTypesInChain,
    };

    /**
     * Depth-first search
     */
    const essymbolAccessState = Symbol("essymbolAccessState");
    const essymbolAccessState2 = Symbol("essymbolAccessState2");

    type LookupItem = LogicalObjectForEachTypeOfPropertyLookupItem;
    // {
    //     logicalObject: FloughLogicalObjectIF;
    //     key?: LiteralType | undefined;
    //     type: FloughType;
    // }

    type Link = & {
        item: LookupItem;
        parents: number[];
        parentsLogicalObjectIdxs?: { itemIdx: number, arrLogicalObjectIdx: number }[];
    };

    type LevelState = & {
        links: Link[];
        linkIndex: number; // into Links
        //nonObjType?: FloughType | undefined; // non-object types
    };

    type AccessState = & {
        stack: LevelState[];
        root: Readonly<FloughLogicalObjectIF>;
        akey: Readonly <FloughType[]>;
        nonObjTypeStack: (FloughType | undefined)[];
        logicalObjectAccessReturn: LogicalObjectAccessReturn;
    };

    export type FloughAccessResult = & {
        types: FloughType[];
        [essymbolAccessState]: AccessState;
        [essymbolAccessState2]?: LogicalObjectAccessReturn;
    };

    // function logicalObjectAccess2(
    //     roots: Readonly<FloughLogicalObjectIF[]>,
    //     akey: Readonly<FloughType[]>,
    //     // aexpression: Readonly<Expression[]>,
    //     // groupNodeToTypeMap: ESMap<Node,Type>,
    // ): Readonly<FloughAccessResult> {
    //     if (getMyDebug()) {
    //         consoleGroup("logicalObjectAccess[in]");
    //         consoleLog(`logicalObjectAccess[in] roots.length: ${roots.length}`);
    //         consoleLog(`logicalObjectAccess[in] akey.length: ${akey.length}`);
    //         // consoleLog("logicalObjectAccess[in] aexpression: ", aexpression);
    //         // consoleLog("logicalObjectAccess[in] groupNodeToTypeMap: ", groupNodeToTypeMap);
    //     }
    //     const stack: LevelState[] = [];
    //     const nonObjTypeStack: [...(FloughType | undefined)[]] = Array(akey.length);

    //     function createLevelState(): LevelState {
    //         return {
    //             links: [],
    //             linkIndex: 0,
    //         };
    //     }
    //     function init(): LevelState {
    //         const state = createLevelState();
    //         const lookupItems: LogicalObjectForEachTypeOfPropertyLookupItem[]=[];

    //         const rootBaseLogicalObjects: FloughLogicalObjectInnerIF[] = [];
    //         const nonObjTypes: FloughType[]=[];
    //         roots.forEach((root, _iroot)=>{
    //             const {logicalObject,remaining} = floughTypeModule.splitLogicalObject(root);
    //             if (logicalObject) {
    //                 if (_iroot===0) rootBaseLogicalObjects.push(...floughLogicalObjectInnerModule.getBaseLogicalObjects(floughLogicalObjectModule.getInnerIF(logicalObject)));
    //                 else {
    //                     floughLogicalObjectInnerModule.getBaseLogicalObjects(floughLogicalObjectModule.getInnerIF(logicalObject).forEach((lobi1,lobi1idx)=>{
    //                         const findx = rootBaseLogicalObjects.findIndex((lobi0)=>floughLogicalObjectInnerModule.identicalBaseTypes(
    //                             lobi0,lobi1));
    //                     if (findx===-1) rootBaseLogicalObjects.push(lobi1);

    //                 }


    //             const lookupItems2: LogicalObjectForEachTypeOfPropertyLookupItem[]=[];
    //             floughLogicalObjectModule.logicalObjectForEachTypeOfPropertyLookup(root, akey[0], lookupItems2);
    //             // eslint-disable-next-line @typescript-eslint/prefer-for-of
    //             for (let i=0;i<lookupItems2.length;i++){
    //                 const existingIndex = lookupItems.findIndex((item)=>floughLogicalObjectModule.identicalLogicalObjects(item.logicalObject,lookupItems2[i].logicalObject));
    //                 if (existingIndex===-1){
    //                     lookupItems.push(lookupItems2[i]);
    //                 }
    //             }
    //         });
    //         state.links = lookupItems.map((item)=>({ item, parents: [] }));
    //         return state;
    //     }
    //     stack.push(init());


    // }

    function logicalObjectAccess2(
        roots: Readonly<FloughLogicalObjectIF[]>,
        akey: Readonly<FloughType[]>,
        // aexpression: Readonly<Expression[]>,
        // groupNodeToTypeMap: ESMap<Node,Type>,
    ): Readonly<FloughAccessResult> {
        if (getMyDebug()) {
            consoleGroup("logicalObjectAccess[in]");
            consoleLog(`logicalObjectAccess[in] roots.length: ${roots.length}`);
            consoleLog(`logicalObjectAccess[in] akey.length: ${akey.length}`);
            // consoleLog("logicalObjectAccess[in] aexpression: ", aexpression);
            // consoleLog("logicalObjectAccess[in] groupNodeToTypeMap: ", groupNodeToTypeMap);
        }
        const inners = roots.map(r=>floughLogicalObjectModule.getInnerIF(r));
        const x = floughLogicalObjectInnerModule.logicalObjectAccess(inners,akey);
        const r: FloughAccessResult = {
            types: x.finalTypes as FloughType[],
            [essymbolAccessState]: 0 as any as AccessState,
            [essymbolAccessState2]: x,
        };
        return r;
    }

    function logicalObjectModify(
        types: Readonly<(FloughType | undefined)[]>,
        state: LogicalObjectAccessReturn,
    ): void {
        
    }



    function logicalObjectAccess(
        roots: Readonly<FloughLogicalObjectIF[]>,
        akey: Readonly<FloughType[]>,
        // aexpression: Readonly<Expression[]>,
        // groupNodeToTypeMap: ESMap<Node,Type>,
    ): Readonly<FloughAccessResult> {
        if (getMyDebug()) {
            consoleGroup("logicalObjectAccess[in]");
            consoleLog(`logicalObjectAccess[in] roots.length: ${roots.length}`);
            consoleLog(`logicalObjectAccess[in] akey.length: ${akey.length}`);
            // consoleLog("logicalObjectAccess[in] aexpression: ", aexpression);
            // consoleLog("logicalObjectAccess[in] groupNodeToTypeMap: ", groupNodeToTypeMap);
        }
        const stack: LevelState[] = [];
        const nonObjTypeStack: [...(FloughType | undefined)[]] = Array(akey.length);

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
                for (let i=0;i<lookupItems2.length;i++){
                    const existingIndex = lookupItems.findIndex((item)=>floughLogicalObjectModule.identicalLogicalObjects(item.logicalObject,lookupItems2[i].logicalObject));
                    if (existingIndex===-1){
                        lookupItems.push(lookupItems2[i]);
                    }
                }
            });
            state.links = lookupItems.map((item)=>({ item, parents: [] }));
            return state;
        }
        stack.push(init());

        let idxInStack = 0;
        //const lastChildLevel = akey.length-1;
        const lastParentLevel = akey.length-2; // may be -1
        while (true) {

            // if (idxInStack===akey.length){
            //     Debug.fail("iwozere");
            // }
            /**
             * Depth first
             * - first try to go deeper
             *   Does not descend into
             * - if not possible, go to next link
             * - if not possible, go to parent
             */
            //const nextStackLevelNotYetCreated = (idxInStack+1)===stack.length;
            if (extraAsserts) Debug.assert(idxInStack+1<=stack.length, "unexpected; idxInStack+1<=stack.length not true");
            const nextStackLevelNotYetFullfilled = (idxInStack+1)===stack.length || stack[idxInStack+1].linkIndex<stack[idxInStack+1].links.length;
            //if (idxInStack<=lastParentLevel) {
                if (idxInStack<lastParentLevel && nextStackLevelNotYetFullfilled){
                    idxInStack++;
                    continue;
                }
                if (extraAsserts) Debug.assert(idxInStack<stack.length, "unexpected");
                const thisStackLevelFullfilled = idxInStack===akey.length-1 || stack[idxInStack].linkIndex===stack[idxInStack].links.length;
                if (thisStackLevelFullfilled){
                    if (idxInStack===0) break;
                    idxInStack--;
                    continue;
                }
                // drop through to process at stack[idxInStack].linkIndex
            //}

            const parentState = stack[idxInStack];
            {
                const parentItem = parentState.links[parentState.linkIndex].item;
                const parentType = parentItem.type;
                const { logicalObject: parentTypeLogicalObject, remaining } = floughTypeModule.splitLogicalObject(parentType);

                Debug.assert(idxInStack+1<nonObjTypeStack.length,"unexpected");
                const idxInStackPlus1 = idxInStack+1;
                if (nonObjTypeStack[idxInStackPlus1]) floughTypeModule.unionWithFloughTypeMutate(remaining, nonObjTypeStack[idxInStackPlus1]!);
                else nonObjTypeStack[idxInStackPlus1] = remaining;

                Debug.assert(idxInStack>=0,"unexpected");
                Debug.assert(idxInStack<=stack.length,"unexpected");
                if (idxInStack+1===stack.length) stack.push(createLevelState());
                // const nextstate = stack[idxInStack+1];

                // const nextLogicalObjs: FloughLogicalObjectInnerIF[] = [];
                // parentItem.arrLogicalObjectBaseOfType?.forEach((lob,_lobidx)=>{
                //     const existingIndex = nextLogicalObjs.findIndex((nextlobj)=>floughLogicalObjectInnerModule.identicalBaseTypes(lob,nextlobj));

                // });


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
                Debug.assert(idxInStack>=0,"unexpected");
                Debug.assert(idxInStack<=stack.length,"unexpected");
                if (idxInStack+1===stack.length) stack.push(createLevelState());
                const nextstate = stack[idxInStack+1];


                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let i=0;i<lookupItems.length;i++){
                    // check if logicalItem is already in nextstate.links
                    // "===" should suffice, but just in case
                    Debug.assert(nextstate, "unexpected");
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
            Debug.assert(stack.length===akey.length,"unexpected");
            stack.forEach((levelState,idx)=>{
                if (idx===stack.length-1) Debug.assert(levelState.linkIndex===0,"unexpected");
                else Debug.assert(levelState.links.length===levelState.linkIndex,"unexpected: ",()=>`level ${idx} is not complete`);
            });
        }
        const logicalObjectsForRoot = stack[0].links.map((link)=>link.item.logicalObject);
        Debug.assert(logicalObjectsForRoot.length>0,"unexpected");
        const root = floughLogicalObjectModule.unionOfFloughLogicalObjects(logicalObjectsForRoot);
        if (getMyDebug()) {
            stack.forEach((state,level)=>{
                state.links.forEach((link,idx)=>{
                    const { logicalObject, key, type, arrLogicalObjectBaseOfType: arrLogicalObjectBase } = link.item;
                    const logicalObjectStrs = floughLogicalObjectModule.dbgLogicalObjectToStrings(logicalObject);
                    logicalObjectStrs.forEach((str)=>consoleLog(`logicalObjectAccess[stack,${level},${idx}] ${str}`));
                    consoleLog(`logicalObjectAccess[stack,${level},${idx}] key: ${key?.value ?? "<undef>"}`);
                    consoleLog(`logicalObjectAccess[stack,${level},${idx}] type: ${dbgsModule.dbgFloughTypeToString(type)}`);
                    const logicalObjectOfType = floughTypeModule.getLogicalObject(type);
                    if (!logicalObjectOfType) consoleLog(`logicalObjectAccess[stack,${level},${idx}] type.logicalObject: <undef>`);
                    else {
                        floughLogicalObjectModule.dbgLogicalObjectToStrings(logicalObjectOfType).forEach((str)=>consoleLog(
                            `logicalObjectAccess[stack,${level},${idx}] type.logicalObject: ${str}`));
                    }
                    if (arrLogicalObjectBase){
                        arrLogicalObjectBase.forEach((lob,lobidx)=>{
                            const arrLogicalObjectBaseStrs = floughLogicalObjectInnerModule.dbgLogicalObjectToStrings(lob);
                            arrLogicalObjectBaseStrs.forEach((str)=>consoleLog(`logicalObjectAccess[stack,${level},${idx}] arrLogicalObjectBase[${lobidx}]: ${str}`));
                        });
                    }
                    else {
                        consoleLog(`logicalObjectAccess[stack,${level},${idx}] arrLogicalObjectBase: <undef>`);
                    }
                }); // just to make sure that the links are not empty
            });
            consoleLog("logicalObjectAccess[out]");
            consoleGroupEnd();
        }

        return {
            types: stack[stack.length-1].links.map((link)=>link.item.type),
            [essymbolAccessState]: {
                stack,
                root,
                akey,
                nonObjTypeStack,
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
        if (getMyDebug()) {
            floughLogicalObjectModule.dbgLogicalObjectToStrings(oldobj).forEach((str)=>consoleLog(`setMap[in] oldobj: ${str}`));
            floughLogicalObjectModule.dbgLogicalObjectToStrings(newobj).forEach((str)=>consoleLog(`setMap[in] newobj: ${str}`));
            consoleLog(`setMap[out] map.size: ${map.size}`);
        }
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
        if (getMyDebug()) {
            consoleGroup("logicalObjectModify[in]");
        }
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
            /**
             * Note: modifiedTypes[i]===true means that the type is not modified. At one point I though in that case it should not generate a new object but that is not correct.
             * Because of the trimming that is done, it is still necessary.
             */
            const modifiedType = modifiedTypes[i]===true ? lastLinks[i].item.type : modifiedTypes[i];
            // if (modifiedType===true) {
            //     resultItems.push({ rootLogicalObject: root, type: lastLinks[i].item.type });
            // }
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
                    /**
                     * More than one index could indicates an or of flow paths, which is not supported by this function.
                     * Instead, abort the object narrowing for this lastLink[i] and return the original logical object.
                     */
                    // We can't modify the logical object, so just return the original.???
                    resultItems.push({ rootLogicalObject: root, type:modifiedType });
                    continue;
                }
                let logicalObjectMap: OldToNewLogicalObjectMap | undefined;
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
                            Debug.assert(logicalObjectMap);
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
                Debug.assert(!logicalObjectMap || logicalObjectMap.size <=1,"expected !logicalObjectMap || logicalObjectMap.size <=1", ()=>`logicalObjectMap?.size: ${logicalObjectMap?.size}`);
                logicalObjectMap?.forEach((newLogicalObject,_oldLogicalObject)=>{
                    resultItems.push({
                        rootLogicalObject: floughLogicalObjectModule.createFloughLogicalObjectFromInner(
                            newLogicalObject, floughLogicalObjectModule.getEffectiveDeclaredTsTypeFromLogicalObject(root)),
                        type: modifiedType
                    });
                });
            }
        }
        if (getMyDebug()) {
            consoleLog("logicalObjectModify[out]");
            resultItems.forEach((item,idx)=>{
                floughLogicalObjectModule.dbgLogicalObjectToStrings(item.rootLogicalObject).forEach((str)=>consoleLog(
                    `logicalObjectModify[out,${idx}] ${str}`));
                consoleLog(`logicalObjectModify[out,${idx}] type: ${dbgsModule.dbgFloughTypeToString(item.type)}`);
            });
            consoleGroupEnd();
        }
       return resultItems;
    } // function logicalObjectModify(accessResult: Readonly<FloughAccessResult>, modifiedTypes: (Readonly<FloughType> | true | undefined)[]): {rootLogicalObject: FloughLogicalObjectIF, type: Readonly<FloughType>}[]

    function getTsTypesInChain(accessResult: Readonly<FloughAccessResult>, index: number): Type[] {
        const { stack, nonObjTypeStack } = accessResult[essymbolAccessState];
        const links = stack[index].links;
        const atstype = links.map((link)=>{
            const tstype = floughLogicalObjectModule.getEffectiveDeclaredTsTypeFromLogicalObject(link.item.logicalObject)
                ?? floughLogicalObjectModule.getTypeFromAssumedBaseLogicalObject(link.item.logicalObject);
            return tstype;
        });

        if (nonObjTypeStack[index]) atstype.push(...floughTypeModule.getTsTypesFromFloughType(nonObjTypeStack[index]!));
        return atstype;
    }


}