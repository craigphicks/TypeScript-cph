
namespace ts {

    const checker = undefined as any as TypeChecker; // TODO: intialize;
    const dbgs = undefined as any as Dbgs;
    const mrNarrow = undefined as any as MrNarrow;
    export function initFloughLogicalObject(checkerIn: TypeChecker, dbgsIn: Dbgs, mrNarrowIn: MrNarrow) {
        (checker as any) = checkerIn;
        //(refTypesTypeModule as any) = refTypesTypeModuleIn;
        (dbgs as any) = dbgsIn;
        (mrNarrow as any) = mrNarrowIn;
    }
//    const floughTypeModule = floughTypeModule;

    type PropertyKeyType = string;
    const essymbolFloughObjectTypeInstance = Symbol("floughObjectTypeInstance");
    export type FloughObjectTypeInstance = & {
        objectTypeInstanceId: number; // keeps same instance on cloning (for narrowing), but not on merging (unless all merged share same id, this is not yet implemented)
        tsObjectType: ObjectType;
        keyToType: ESMap<PropertyKeyType,FloughType>; // instantiated and filled as needed
        [essymbolFloughObjectTypeInstance]: true
    };
    export function isFloughObjectTypeInstance(x: any): x is FloughObjectTypeInstance {
        return !!x?.[essymbolFloughObjectTypeInstance];
    }
    let nextFloughObjectTypeInstanceId = 1;
    export function createFloughObjectTypeInstance(
        tsObjectType: Readonly<ObjectType>,
        arg1?: Readonly<[PropertyKeyType,FloughType][]> | Readonly<ESMap<PropertyKeyType,FloughType>>,
        objectTypeInstanceId: number = nextFloughObjectTypeInstanceId++):
        FloughObjectTypeInstance {
        const map = new Map(arg1);
        return { tsObjectType, keyToType: map, objectTypeInstanceId, [essymbolFloughObjectTypeInstance]: true };
    }
    export function cloneFloughObjectTypeInstance(fobj: Readonly<FloughObjectTypeInstance>): FloughObjectTypeInstance {
        return createFloughObjectTypeInstance(fobj.tsObjectType, fobj.keyToType, fobj.objectTypeInstanceId);
    }
    export enum FloughLogicalObjectKind {
        plain="plain",
        union="union",
        intersection="intersection",
        difference="difference",
        tsintersection="tsintersection", // not a set-logic operation, but a TypeScript specific defined operation
        tsunion="tsunion", // Although originating from a TypeScript specific defined operation, will behave like a set-union, but has a reference to the original TypeScript union
    }
    const essymbolFloughLogicalObject = Symbol("floughLogicalObject");
    /**
     * The FloughLogicalObjectPlain item member is a FloughObjectTypeInstance and not a FloughType because
     * as the top level floughLogicalObject is created within a FloughType, the non-object types are ALWAYS raised to the top level
     * so they are immediately avalable within the encosing FloughType.
     */
    type FloughLogicalObjectPlain = & {
        kind: FloughLogicalObjectKind.plain;
        item: FloughObjectTypeInstance;
        [essymbolFloughLogicalObject]: true;
    };
    type FloughLogicalObjectUnion = & {
        kind: FloughLogicalObjectKind.union;
        items: FloughLogicalObject[];
        [essymbolFloughLogicalObject]: true;
    };
    type FloughLogicalObjectIntersection = & {
        kind: FloughLogicalObjectKind.intersection;
        items: FloughLogicalObject[];
        [essymbolFloughLogicalObject]: true;
    };
    type FloughLogicalObjectDifference= & {
        kind: FloughLogicalObjectKind.difference;
        items: [FloughLogicalObject,FloughLogicalObject];
        [essymbolFloughLogicalObject]: true;
    };
    type FloughLogicalObjectTsintersection = & {
        kind: FloughLogicalObjectKind.tsintersection;
        items: FloughLogicalObject[];
        tsType: IntersectionType;
        [essymbolFloughLogicalObject]: true;
    };
    type FloughLogicalObjectTsunion = & {
        kind: FloughLogicalObjectKind.tsunion;
        items: FloughLogicalObject[];
        tsType: UnionType;
        [essymbolFloughLogicalObject]: true;
    };

    type FloughLogicalObject = FloughLogicalObjectPlain | FloughLogicalObjectUnion | FloughLogicalObjectIntersection | FloughLogicalObjectDifference | FloughLogicalObjectTsintersection | FloughLogicalObjectTsunion;
    export interface FloughLogicalObjectIF {
        //[essymbolFloughLogicalObject]: true;
        //kind: FloughLogicalObjectKind;
    }
    // @ts-expect-error
    function isFloughLogicalObjectPlain(x: FloughLogicalObject): x is FloughLogicalObjectPlain {
        return x.kind===FloughLogicalObjectKind.plain;
    }
    // @ts-expect-error
    function isFloughLogicalObjectUnion(x: FloughLogicalObject): x is FloughLogicalObjectUnion {
        return x.kind===FloughLogicalObjectKind.union;
    }
    // @ts-expect-error
    function isFloughLogicalObjectIntersection(x: FloughLogicalObject): x is FloughLogicalObjectIntersection {
        return x.kind===FloughLogicalObjectKind.intersection;
    }
    // @ts-expect-error
    function isFloughLogicalObjectDifference(x: FloughLogicalObject): x is FloughLogicalObjectDifference {
        return x.kind===FloughLogicalObjectKind.difference;
    }

    export function isFloughLogicalObject(x: any): x is FloughLogicalObject {
        return !!x?.[essymbolFloughLogicalObject];
    }

    export function createFloughLogicalObjectPlain(tstype: ObjectType){
        return {
            kind: FloughLogicalObjectKind.plain,
            item: createFloughObjectTypeInstance(tstype),
            [essymbolFloughLogicalObject]: true
        };
    }
    export function createFloughLogicalObjectTsunion(unionType: Readonly<UnionType>, items: Readonly<FloughLogicalObjectIF[]>): FloughLogicalObjectTsunion {
        assertCastType<FloughLogicalObject[]>(items);
        return {
            kind: FloughLogicalObjectKind.tsunion,
            items,
            tsType: unionType,
            [essymbolFloughLogicalObject]: true
        };
    }
    export function createFloughLogicalObjectTsintersection(intersectionType: Readonly<IntersectionType>, items: Readonly<FloughLogicalObjectIF[]>): FloughLogicalObjectTsintersection {
        assertCastType<FloughLogicalObject[]>(items);
        return {
            kind: FloughLogicalObjectKind.tsintersection,
            items,
            tsType: intersectionType,
            [essymbolFloughLogicalObject]: true
        };
    }
    export function unionOfFloughLogicalObject(a: FloughLogicalObjectIF, b: FloughLogicalObjectIF): FloughLogicalObject {
        assertCastType<FloughLogicalObject>(a);
        assertCastType<FloughLogicalObject>(b);
        const items: FloughLogicalObject[] = [];
        if (a.kind===FloughLogicalObjectKind.union) items.push(...a.items);
        else items.push(a);
        if (b.kind===FloughLogicalObjectKind.union) items.push(...b.items);
        else items.push(b);
        return {
            kind: FloughLogicalObjectKind.union,
            items,
            [essymbolFloughLogicalObject]: true
        };
    }

    export function intersectionOfFloughLogicalObject(a: FloughLogicalObjectIF, b: FloughLogicalObjectIF): FloughLogicalObject {
        assertCastType<FloughLogicalObject>(a);
        assertCastType<FloughLogicalObject>(b);
        const items: FloughLogicalObject[] = [];
        if (a.kind===FloughLogicalObjectKind.intersection) items.push(...a.items);
        else items.push(a);
        if (b.kind===FloughLogicalObjectKind.intersection) items.push(...b.items);
        else items.push(b);
        return {
            kind: FloughLogicalObjectKind.intersection,
            items,
            [essymbolFloughLogicalObject]: true
        };
    }

    export function differenceOfFloughLogicalObject(minuend: FloughLogicalObjectIF, subtrahend: FloughLogicalObjectIF): FloughLogicalObject {
        assertCastType<FloughLogicalObject>(minuend);
        assertCastType<FloughLogicalObject>(subtrahend);
        return {
            kind: FloughLogicalObjectKind.difference,
            items: [minuend,subtrahend],
            [essymbolFloughLogicalObject]: true
        };
    }


    type LogicalObjectVisitor<ResultType,StateType, VTorRtnType = [StateType | undefined,ResultType | undefined, FloughLogicalObject | undefined]> = & {
        onPlain: (logicalObject: Readonly<FloughLogicalObjectPlain>) => ResultType;
        onUnion: (logicalObject: Readonly<FloughLogicalObjectUnion>, result: ResultType | undefined, state: StateType | undefined, itemsIndex: number) => VTorRtnType;
        onIntersection: (logicalObject: Readonly<FloughLogicalObjectIntersection>, result: ResultType | undefined, state: StateType | undefined, itemsIndex: number) => VTorRtnType;
        onDifference?: (logicalObject: Readonly<FloughLogicalObjectDifference>, result: ResultType | undefined, state: StateType | undefined, itemsIndex: number) => VTorRtnType;
        onTsunion?: (logicalObject: Readonly<FloughLogicalObjectTsunion>, result: ResultType | undefined, state: StateType | undefined, itemsIndex: number) => VTorRtnType;
        onTsintersection?: (logicalObject: Readonly<FloughLogicalObjectTsintersection>, result: ResultType | undefined, state: StateType | undefined, itemsIndex: number) => VTorRtnType;

        // onItemsInitializeState: () => StateType;
        // onItemsFinished: (state: StateType | undefined) => ResultType;
    };
    function logicalObjecVisit<ArgType, ResultType,StateType>(
        logicalObjectTop: Readonly<FloughLogicalObject>,
        createVisitor: (arg?: ArgType | undefined) => LogicalObjectVisitor<ResultType,StateType>,
        initialResult: ResultType,
        arg?: ArgType,
    ): ResultType {
        const visitor = createVisitor(arg);
        const stackItemsIndexIdx = 1;
        const stackStateIdx = 2;
        const stack: [logicalObject: Readonly<FloughLogicalObject>, itemsIndex: number, state: StateType | undefined][]
            = [[logicalObjectTop, -1, undefined]];
        let result: ResultType | undefined = initialResult;
        let logicalObjectToPush: FloughLogicalObject | undefined;
        while (stack.length!==0) {
            const [logicalObject,itemsIndex,state] = stack[stack.length - 1];
            if (logicalObject.kind===FloughLogicalObjectKind.plain){
                    stack.pop();
                    result = visitor.onPlain(logicalObject);
                    continue;
            }
            else {
                    Debug.assert(itemsIndex===-1||result);
                    Debug.assert(itemsIndex===-1||state);
                    switch (logicalObject.kind) {
                        case FloughLogicalObjectKind.union:
                            ([stack[stack.length-1][stackStateIdx],result, logicalObjectToPush] = visitor.onUnion(logicalObject, result, state, itemsIndex));
                            break;
                        case FloughLogicalObjectKind.intersection:
                            ([stack[stack.length-1][stackStateIdx],result, logicalObjectToPush] = visitor.onIntersection(logicalObject, result, state, itemsIndex));
                            break;
                        case FloughLogicalObjectKind.difference:
                            ([stack[stack.length-1][stackStateIdx],result, logicalObjectToPush]
                                = visitor.onDifference ? visitor.onDifference(logicalObject, result, state, itemsIndex) : Debug.fail("onDifference not implemented"));
                            break;
                        case FloughLogicalObjectKind.tsunion:
                            ([stack[stack.length-1][stackStateIdx],result, logicalObjectToPush] = visitor.onTsunion ? visitor.onTsunion(logicalObject, result, state, itemsIndex) : Debug.fail("onTsunion not implemented"));
                            break;
                        case FloughLogicalObjectKind.tsintersection:
                            ([stack[stack.length-1][stackStateIdx],result, logicalObjectToPush] = visitor.onTsintersection ? visitor.onTsintersection(logicalObject, result, state, itemsIndex) : Debug.fail("onTsintersection not implemented"));
                            break;

                    }
                    if (result) {
                        Debug.assert(!logicalObjectToPush);
                        stack.pop();
                    }
                    else if (logicalObjectToPush){
                        stack[stack.length-1][stackItemsIndexIdx]++;
                        stack.push([logicalObjectToPush,-1,undefined]);
                    }
                    else Debug.fail("unexpected");
            }
        }
        Debug.assert(result);
        return result;
    }


    /**
     * This is a test function - we really want to get keys and types together, which it a bit more complicated.
     * The resulting set of keys are the zero order result, meaning there is no correlation between the keys - just one set of all keys.
     * @param logicalObjectTop
     * TODO: These are only the keys that have been loaded into the logical object, not all keys of the type. Get all keys of the type.
     */
    // export function logicalObjectGetKeysZeroOrder(
    //     logicalObjectTop: Readonly<FloughLogicalObject>,
    // ): Set<PropertyKeyType> {
    //     type Result = & {iter: Iterator<PropertyKeyType>, setof: Set<PropertyKeyType> | undefined};
    //     type State = Set<PropertyKeyType>;
    //     function createLogicalObjectVisitorForGetKeysZeroOrder():
    //     LogicalObjectVisitor<Result, State>{
    //         return {
    //             onPlain: (logicalObject: Readonly<FloughLogicalObjectPlain>) => {
    //                 // TODO: add ALL the keys
    //                 const result: Result = { iter: logicalObject.item.keyToType.keys(), setof: undefined };
    //                 return result;
    //             },
    //             onUnion(_logicalObject: Readonly<FloughLogicalObjectUnion>, result: Result, state: State | undefined, itemsIndex: number) {
    //                 if (itemsIndex===0) {
    //                     state = new Set<PropertyKeyType>();
    //                 }
    //                 for (let it=result.iter.next();!it.done; it=result.iter.next()) {
    //                     state!.add(it.value);
    //                 }
    //                 if (itemsIndex===_logicalObject.items.length-1) return [undefined, { iter: state!.keys(), setof: state! }];
    //                 return [state,undefined];
    //             },
    //             onIntersection(_logicalObject: Readonly<FloughLogicalObjectIntersection>, result: Result, stateIn: State | undefined, itemsIndex: number) {
    //                 const stateOut = new Set<PropertyKeyType>();
    //                 if (itemsIndex===0) {
    //                     for (let it=result.iter.next();!it.done; it=result.iter.next()) {
    //                         stateOut.add(it.value);
    //                     }
    //                 }
    //                 else {
    //                     Debug.assert(stateIn);
    //                     for (let it=result.iter.next();!it.done; it=result.iter.next()) {
    //                         if (stateIn.has(it.value)) stateOut.add(it.value);
    //                     }
    //                 }
    //                 if (itemsIndex===_logicalObject.items.length-1) return [undefined, { iter: stateOut.keys(), setof: stateOut }];
    //                 else return [stateOut,undefined];
    //             },
    //         };
    //     }
    //     const visitor = createLogicalObjectVisitorForGetKeysZeroOrder();
    //     const dfltSet = new Set<PropertyKeyType>();
    //     const result = logicalObjecVisit(logicalObjectTop, () => visitor, { iter: dfltSet.keys(), setof: dfltSet });
    //     return result.setof!;
    // }

    /**
     * For the given key "lookupkey", return an map of all object instances with property "lookupkey" and the corresponding type.
     * It's not so simple because the object instances are in a tree, and the lookupkey may be in a union or intersection.
     * However, the object instances are wanted so we can go back and trim the tree.
     * The idea is that this replaces the old code action, in "floughByPropertyAccessExpression", where
     * ```
     * forEachFloughTypeTsType(prePassing.type, t => {
     *   ...
     *   const propSymbol = checker.getPropertyOfType(t, keystr);
     *   if (propSymbol)
     *            const {type, sc:propSC} = andSymbolTypeIntoSymtabConstraint(
     *                {symbol:propSymbol, type:symbolFlowInfo.effectiveDeclaredType!, isconst: symbolFlowInfo.isconst, sc,
     *                getDeclaredType, mrNarrow });
     *            arrRttr.push({
     *                symbol: propSymbol,
     *                isconst: symbolFlowInfo.isconst,
     *                type, //symbolFlowInfo.effectiveDeclaredType!,
     *                sci: propSC
     *            });
     *    else
     *           arrRttr.push({symbol: undefined, type: checker.getUndefinedType(), sci: sc});
     * ```
     * In the above code, t corresponds to the type of the object instance, and keystr corresponds to the lookupkey.
     * In the new code, is we will be calling forEachFloughTypeObject, with iterates over its floughLogicalObjectTypeInstance-s. (or will there be just one?).
     * When there are no intersections, it is simply a matter of adding each {baseObjectInstance, type} to the result array, so they are kept separate.
     * Then, if a criteria is applied the result array, the corresponding object instances can be narrowed.  The criteria is applied to the type, which is updated in the object instance,
     * and if the results type is never, the object instance is removed from the tree.
     * When there are intersections of {baseObjectInstance1, type1}, {baseObjectInstance2, type2}, the result is
     * {baseObjectInstance1, intersect(type1,type2)} and {baseObjectInstance2, intersect(type1,type2)} - both of which are added to the result array, since they are mutually constraining.
     *
     * It is possible that the result array will contain the same object more than once.  Therfore, it using Map<objectInstance, type>.
     *
     * Note that as a result of intersection constraining, some of the property types returned in the may be
     * - undefined type even if that is not an allowed type for the property (might change this to never type)
     * - never type (alway allowed, it is a flow description not really a type)
     * - an unresolved intersection type of FloughtObjectTypesInstance-s. It is not always nevessary to know immediately whether the interseciton is truly emptpy or not.
     *   It is not necceary to know immediately if the intersection is empty, because the intersection may be resolved later.
     *
     * Arrays and tuples are treated as objects with numeric keys.
     *
     * Notes:
     * The stack implementation is not really necessary for speed or maximum depth (the depth of the tree is limited by the nummber of operators applied to the type.)
     * So a recusrive implementation would be fine.  However, the stack implementation might be more general, and useful in other places.
     * A recusrive implementation could be done with callback functions.
     * @param logicalObjectTop  - the logical object to search
     * @param lookupkey - the property key to look up
     * @param _crit - the criteria to apply to the type (TODO: not implemented yet, it's a significant optimization)
     * @returns
     */

    type ObjToTypeMap = ESMap<Readonly<FloughObjectTypeInstance>, Readonly<FloughType>>;
    export type LogicalObjectForEachTypeOfProperyLookupReturnType = & { objToType: ObjToTypeMap; type: Readonly<FloughType> };
    export function logicalObjectForEachTypeOfPropertyLookup(
        logicalObjectTop: Readonly<FloughLogicalObjectIF>, lookupkey: PropertyKeyType, _crit?: InferCrit
    ): LogicalObjectForEachTypeOfProperyLookupReturnType {
        assertCastType<FloughLogicalObject>(logicalObjectTop);
        type Result = LogicalObjectForEachTypeOfProperyLookupReturnType;
        type State = & { objToType: ObjToTypeMap; type: Readonly<FloughType>/*, setOfObj?: Set<Readonly<FloughObjectTypeInstance>>*/ };
        type OnReturnType = [State, undefined, FloughLogicalObject] | [undefined, Result, undefined];
        function newMap(x?: [objectTypeInstance: Readonly<FloughObjectTypeInstance>, type: FloughType]){
            const map = new Map<Readonly<FloughObjectTypeInstance>, FloughType>(x?[x]:[]);
            return map;
        }
        function createEmptyState(): State {
            return { objToType: newMap(), type: floughTypeModule.getNeverType() };
        }
        function createLogicalObjectVisitorForForEachTypeOfProperyLookup(lookupkey: PropertyKeyType):
            LogicalObjectVisitor<Result, State>{
            function onPlain(logicalObject: Readonly<FloughLogicalObjectPlain>): Result {
                if (checker.isArrayOrTupleType(logicalObject.item.tsObjectType)) {
                    if (lookupkey === "length") {
                        return { objToType: newMap([logicalObject.item, floughTypeModule.getNumberType()]), type: floughTypeModule.getNumberType() };
                    }
                    if (checker.isArrayType(logicalObject.item.tsObjectType)){
                        // by convention, the instance of an array kill keep the instance type value (if it exists) as element 0.
                        let type = logicalObject.item.keyToType.get("0");
                        if (type) return { objToType: newMap([logicalObject.item, type]), type };
                        const tsElementType = checker.getElementTypeOfArrayType(logicalObject.item.tsObjectType);
                        type = tsElementType ? floughTypeModule.createFromTsType(tsElementType) : Debug.fail("not yet implemented (any type?)");
                        return { objToType: newMap([logicalObject.item, type]), type };
                    }
                    else { // tuple
                        const n = parseInt(lookupkey);
                        if (isNaN(n)) return { objToType:newMap() , type: floughTypeModule.getUndefinedType() }; // propably should never happen
                        Debug.fail("not yet implemented");
                    }
                }
                else {
                    let type = logicalObject.item.keyToType.get(lookupkey);
                    if (!type) {
                        // check if the key is in the base object, if so get the type from there
                        const tsObjectType = logicalObject.item.tsObjectType;
                        /**
                         * Previously, this was done with
                         * const propSymbol = checker.getPropertyOfType(t, keystr);
                         * if (propSymbol.flags & SymbolFlags.EnumMember)
                         *     treat it as a literal type, not a symbol
                         *     const tstype = enumMemberSymbolToLiteralTsType(propSymbol);
                         * else // treat it as a symbol
                         */
                        const tsPropertyType = checker.getTypeOfPropertyOfType(tsObjectType, lookupkey);
                        // TODO: apply crit
                        if (tsPropertyType) type = floughTypeModule.createFromTsType(tsPropertyType);
                        else {
                            type = floughTypeModule.getUndefinedType();
                        }
                    }
                    return { objToType:newMap([logicalObject.item, type]) , type };
                }
            }
            function onUnion(logicalObject: Readonly<FloughLogicalObjectUnion | FloughLogicalObjectTsunion>, result: Result | undefined, state: State | undefined, itemsIndex: number): OnReturnType {
                if (itemsIndex===-1) return [createEmptyState(), undefined, logicalObject.items[0]];
                else {
                    Debug.assert(state && result);
                    Debug.assert(itemsIndex<logicalObject.items.length);
                    // eslint-disable-next-line prefer-const
                    result.objToType.forEach((t, objectInstance) => {
                        assertCastType<State>(state);
                        if (!state.objToType.get(objectInstance)) state.objToType.set(objectInstance, t);
                        else {
                            // Probably pretty rare, but if the same object instance is in multiple branches of the union, we need to union the types.
                            Debug.fail("does this really happen?");
                            //state.objToType.set(objectInstance, floughTypeModule.unionWithFloughTypeMutate(t,state.objToType.get(objectInstance)!));
                        }
                        state.type = floughTypeModule.unionWithFloughTypeMutate(t,state.type);
                    });
                }
                if (itemsIndex === logicalObject.items.length-1) return [undefined, state, undefined];
                return [state, undefined, logicalObject.items[itemsIndex+1]];
            };
            function onIntersection(logicalObject: Readonly<FloughLogicalObjectIntersection>, result: Result | undefined, state: State | undefined, itemsIndex: number): OnReturnType {
                /**
                 * Even if the intersection is empty, we still want to return the object instances to type map, so that they can be trimmed.
                 * TODO:ing: Therefore need "type" in the state - compute the intersection FloughType - if that becomes never type,
                 * we can stop computing intersections but the object instances mappings are still needed (for trimming) - but can we get by
                 * without making those mappings by assuming that empty mappings are mapping to never type? We can try that later,
                 * but for add all object mappings.  Worth noting that the same objects may be get mapped to a non-never type later in a union.
                 *
                 * The intersection type is incrementally computed for each itemsIndex, but the type is not set to the map until the last itemsIndex.
                 */
                if (itemsIndex===-1) return [createEmptyState(), undefined, logicalObject.items[0]];
                else {
                    Debug.assert(state && result);
                    if (itemsIndex===0) {
                        state = result;
                    }
                    else {
                        result.objToType.forEach((t, objectInstance) => {
                            assertCastType<State>(state);
                            if (!state.objToType.get(objectInstance)) state.objToType.set(objectInstance, t);
                            else {
                                Debug.fail("does this really happen?");
                            }
                        });
                        state.type = floughTypeModule.intersectionWithFloughTypeMutate(result.type,state.type);
                    }
                }
                if (itemsIndex === logicalObject.items.length - 1) {
                    /**
                     * The intersection type is incrementally computed for each itemsIndex, but the type is not set to the map until the last itemsIndex.
                     * Now that the type is set, we can set the type for all the object instances.
                     */
                    state.objToType.forEach((t, objectInstance) => {
                        assertCastType<State>(state);
                        const finalType = floughTypeModule.intersectionWithFloughTypeMutate(t,state.type);
                        state.objToType.set(objectInstance, finalType);
                    });
                    return [undefined, state, undefined];
                }
                return [state, undefined, logicalObject.items[itemsIndex+1]];
            }
            function onDifference(logicalObject: Readonly<FloughLogicalObjectDifference>, result: Result | undefined, state: State | undefined, itemsIndex: number): OnReturnType {
                Debug.assert(logicalObject.items.length === 2);
                if (itemsIndex===-1) {
                    state = result;
                    return [createEmptyState(),undefined,logicalObject.items[0]];
                }
                if (itemsIndex===0) {
                    Debug.assert(state && result);
                    state = result;
                    return [state,undefined,logicalObject.items[1]];
                }
                else {
                    Debug.assert(state && result);
                    // state is minuend, result is subtrahend
                    // const lesserSubtrahend = floughTypeModule.intersectionWithFloughTypeMutate(result.type,state.type);
                    state.objToType.forEach((_t, objectInstance) => {
                        assertCastType<State>(state);
                        const finalType = floughTypeModule.differenceWithFloughTypeMutate(result.type,_t);
                        state.objToType.set(objectInstance, finalType);
                    });
                    state.type = floughTypeModule.differenceWithFloughTypeMutate(result.type,state.type);;
                    return [undefined, state, undefined];
                }
            }
            function onTsunion(logicalObject: Readonly<FloughLogicalObjectTsunion>, result: Result, state: State | undefined, itemsIndex: number): OnReturnType {
                return onUnion(logicalObject,result, state, itemsIndex);
            }
            function onTsintersection(logicalObject: Readonly<FloughLogicalObjectTsintersection>, result: Result, state: State | undefined, itemsIndex: number): OnReturnType {
                /**
                 * This is now a hack to get things running. A tsintersection is a actually a single compound type, not a union of types.
                 */
                return onUnion({
                    ...logicalObject, kind: FloughLogicalObjectKind.union},
                    result, state, itemsIndex
                );
            }
            return {
                onPlain,
                onUnion,
                onIntersection,
                onDifference,
                onTsunion,
                onTsintersection,
            };
        } // end of createLogicalObjectVisitorForForEachTypeOfProperyLookup
        const visitor = createLogicalObjectVisitorForForEachTypeOfProperyLookup(lookupkey);
        const result = logicalObjecVisit(logicalObjectTop, () => visitor, { objToType: newMap(), type: floughTypeModule.createNeverType() });
        return result;
    } // end of logicalObjectForEachTypeOfProperyLookup

    export function getTsTypeFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectIF>): Type {
        assertCastType<Readonly<FloughLogicalObject>>(logicalObjectTop);
        type Result = Type;
        type State = Type[];
        type OnReturnType = [State | undefined, Result | undefined, FloughLogicalObject | undefined];
        function createLogicalObjectVisitorForGetTsTypeFromLogicalObject(): LogicalObjectVisitor<Result, State>{
            function onUnion(logicalObject: Readonly<FloughLogicalObjectUnion | FloughLogicalObjectTsunion>, result: Result | undefined, state: State | undefined, itemsIndex: number): OnReturnType {
                if (itemsIndex===-1) return [[], undefined, logicalObject.items[0]];
                Debug.assert(state && result);
                state = [...state, result];
                if (itemsIndex === logicalObject.items.length-1) return [undefined,checker.getUnionType(state),undefined];
                return [state,undefined, logicalObject.items[itemsIndex+1]];
            }
            return {
                onPlain(logicalObject: Readonly<FloughLogicalObjectPlain>) {
                    return logicalObject.item.tsObjectType;
                },
                onUnion,
                onIntersection(logicalObject: Readonly<FloughLogicalObjectIntersection>, result: Result | undefined, state: State | undefined, itemsIndex: number): OnReturnType {
                    if (itemsIndex===-1) return [[], undefined, logicalObject.items[0]];
                    Debug.assert(state && result);
                    state = [...state, result];
                    // Set intersection is the set of shared types, different object-instances can share the same object-type, even if the instances dont have overlapping values.
                    // TODO: For now we pass back the union, instead of the intersection, but we should change this to return the intersection.
                    if (itemsIndex === logicalObject.items.length-1) return [undefined,checker.getUnionType(state),undefined];
                    return [state,undefined, logicalObject.items[itemsIndex+1]];
                },
                onDifference(logicalObject: Readonly<FloughLogicalObjectDifference>, result: Result | undefined, state: State | undefined, itemsIndex: number): OnReturnType {
                    Debug.assert(logicalObject.items.length === 2);
                    if (itemsIndex===-1) return [[], undefined, logicalObject.items[0]];
                    Debug.assert(state && result);
                    if (itemsIndex===0) {
                        state = [result];
                        return [state,undefined, logicalObject.items[1]];
                    }
                    else {
                        // TODO: compute the difference; subtract the types of the subtrahend (result )from types of the the minuend (state[0])
                        Debug.assert(state);
                        return [undefined,state[0], undefined];
                    }
                },
                onTsunion(logicalObject: Readonly<FloughLogicalObjectTsunion>, result: Result | undefined, state: State | undefined, itemsIndex: number) {
                    return onUnion(logicalObject, result,state,itemsIndex);

                },
                onTsintersection(logicalObject: Readonly<FloughLogicalObjectTsintersection>, _result: Result | undefined, _state: State | undefined, _itemsIndex: number) {
                    /**
                     * To get things running just return the orginal tsunion type.
                     * Later we may want to return a union of the types of the items
                     */
                    return [undefined, logicalObject.tsType, undefined];
                },
            };
        }
        const visitor = createLogicalObjectVisitorForGetTsTypeFromLogicalObject();
        const result = logicalObjecVisit(logicalObjectTop, () => visitor, checker.getNeverType());
        return result;
    }

    export function dbgLogicalObjectToStrings(logicalObjectTop: FloughLogicalObjectIF): string[] {
        const as: string[] = [];
        assertCastType<FloughLogicalObject>(logicalObjectTop);
        let indent = 0;

        function dbgLogicalObjectToStringsAux(logicalObject: FloughLogicalObject){
            const pad = " ".repeat(indent);
            indent+=4;
            const lenin = as.length;
            as. push("kind: "+logicalObject.kind);
            if (logicalObject.kind === "plain") {
                as.push(`  logicalObject.item.objectTypeInstanceId: ${logicalObject.item.objectTypeInstanceId}`);
                as.push("  logicalObject.item.tsObjectType: "+dbgs.dbgTypeToString(logicalObject.item.tsObjectType));
                logicalObject.item.keyToType.forEach((t, key) => {
                    floughTypeModule.dbgFloughTypeToStrings(t).forEach(s=>as.push("  "+key + ": " + s));
                });
            }
            else {
                as. push("  #items: "+logicalObject.items.length);
                logicalObject.items.forEach(item=>dbgLogicalObjectToStringsAux(item));
            }
            for (let i=lenin; i<as.length; i++) as[i] = pad + as[i];
            indent-=2;
        }
        dbgLogicalObjectToStringsAux(logicalObjectTop);
        return as;
    }


}
