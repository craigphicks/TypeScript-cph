namespace ts {

    const checker = undefined as any as TypeChecker; // TODO: intialize;
    // const createRefTypesType = undefined as any as RefTypesTypeModule["createRefTypesType"] &
    // {
    //     getRefTypesTypeUndefined: () => RefTypesType;
    // }
    const refTypesTypeModule = undefined as any as RefTypesTypeModule &
    {
        getRefTypesTypeUndefined: () => RefTypesType;
    };

    type PropertyKeyType = string;
    const essymbolFloughObjectTypeInstance = Symbol("floughObjectTypeInstance");
    export type FloughObjectTypeInstance = & {
        objectTypeInstanceId: number; // keeps same instance on cloning (for narrowing), but not on merging (unless all merged share same id, this is not yet implemented)
        tsObjectType: ObjectType;
        keyToType: ESMap<PropertyKeyType,RefTypesType>; // instantiated and filled as needed
        [essymbolFloughObjectTypeInstance]: true
    };
    export function isFloughObjectTypeInstance(x: any): x is FloughObjectTypeInstance {
        return !!x?.[essymbolFloughObjectTypeInstance];
    }
    let nextFloughObjectTypeInstanceId = 1;
    export function createFloughObjectTypeInstance(
        tsObjectType: Readonly<ObjectType>,
        arg1?: Readonly<[PropertyKeyType,RefTypesType][]> | Readonly<ESMap<PropertyKeyType,RefTypesType>>,
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
    }
    const essymbolFloughLogicalObject = Symbol("floughLogicalObject");
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
    type FloughLogicalObject = FloughLogicalObjectPlain | FloughLogicalObjectUnion | FloughLogicalObjectIntersection | FloughLogicalObjectDifference;
    export interface FloughLogicalObjectIF {
        //[essymbolFloughLogicalObject]: true;
        //kind: FloughLogicalObjectKind;
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

    export function differenceOfFloughLogicalObject(a: FloughLogicalObjectIF, b: FloughLogicalObjectIF): FloughLogicalObject {
        assertCastType<FloughLogicalObject>(a);
        assertCastType<FloughLogicalObject>(b);
        return {
            kind: FloughLogicalObjectKind.difference,
            items: [a,b],
            [essymbolFloughLogicalObject]: true
        };
    }


    type LogicalObjectVisitor<ResultType,StateType> = & {
        onPlain: (logicalObject: Readonly<FloughLogicalObjectPlain>) => ResultType;
        onUnion: (logicalObject: Readonly<FloughLogicalObjectUnion>, result: ResultType, state: StateType) => StateType;
        onIntersection: (logicalObject: Readonly<FloughLogicalObjectIntersection>, result: ResultType, state: StateType) => StateType;
        onDifference?: (logicalObject: Readonly<FloughLogicalObjectDifference>, result: ResultType, state: StateType) => StateType;
        onItemsInitializeState: () => StateType;
        onItemsFinished: (state: StateType | undefined) => ResultType;
    };
    function logicalObjecVisit<ArgType, ResultType,StateType>(
        logicalObjectTop: Readonly<FloughLogicalObject>,
        createVisitor: (arg?: ArgType | undefined) => LogicalObjectVisitor<ResultType,StateType>,
        arg?: ArgType,
    ): ResultType {
        const visitor = createVisitor(arg);
        const stackItemsIndexIdx = 1;
        const stackStateIdx = 2;
        const stack: [logicalObject: Readonly<FloughLogicalObject>, itemsIndex: number, state: StateType | undefined][]
            = [[logicalObjectTop, 0, undefined]];
        let result: ResultType | undefined;
        while (stack.length!==0) {
            const [logicalObject,itemsIndex,state] = stack[stack.length - 1];
            if (logicalObject.kind===FloughLogicalObjectKind.plain){
                    stack.pop();
                    result = visitor.onPlain(logicalObject);
                    continue;
            }
            else {
                if (itemsIndex===logicalObject.items.length){
                    stack.pop();
                }
                else if (itemsIndex===0) {
                    stack[stack.length-1][stackStateIdx] = visitor.onItemsInitializeState();
                    stack[stack.length-1][stackItemsIndexIdx]++;
                    stack.push([logicalObject.items[itemsIndex],0,undefined]);
                }
                else {
                    switch (logicalObject.kind) {
                        case FloughLogicalObjectKind.union:
                            stack[stack.length-1][stackStateIdx] = visitor.onUnion(logicalObject, result!, state!);
                            break;
                        case FloughLogicalObjectKind.intersection:
                            stack[stack.length-1][stackStateIdx] = visitor.onIntersection(logicalObject, result!, state!);
                            break;
                        case FloughLogicalObjectKind.difference:
                            stack[stack.length-1][stackStateIdx] = visitor.onDifference ? visitor.onDifference(logicalObject, result!, state!) : Debug.fail("onDifference not implemented");
                            break;

                    }
                    if (itemsIndex===logicalObject.items.length) {
                        result = visitor.onItemsFinished(state);
                    }
                    else {
                        stack.push([logicalObject.items[itemsIndex],itemsIndex+1,undefined]);
                    }

                }
                continue;
            }
        }
        return result!;
    }


    /**
     * This is a test function - we really want to get keys and types together, which it a bit more complicated.
     * The resulting set of keys are the zero order result, meaning there is no correlation between the keys - just one set of all keys.
     * @param logicalObjectTop
     * TODO: These are only the keys that have been loaded into the logical object, not all keys of the type. Get all keys of the type.
     */
    export function logicalObjectGetKeysZeroOrder(
        logicalObjectTop: Readonly<FloughLogicalObject>,
    ): Set<PropertyKeyType> {
        type Result = & {iter: Iterator<PropertyKeyType>, setof: Set<PropertyKeyType> | undefined};
        type State = Set<PropertyKeyType>;
        function createLogicalObjectVisitorForGetKeysZeroOrder():
        LogicalObjectVisitor<Result, State>{
            return {
                onPlain: (logicalObject: Readonly<FloughLogicalObjectPlain>) => {
                    const result: Result = { iter: logicalObject.item.keyToType.keys(), setof: undefined };
                    return result;
                },
                onUnion(_logicalObject: Readonly<FloughLogicalObjectUnion>, result: Result, state: State) {
                    for (let it=result.iter.next();!it.done; it=result.iter.next()) {
                        state.add(it.value);
                    }
                    return state;
                },
                onIntersection(_logicalObject: Readonly<FloughLogicalObjectIntersection>, result: Result, state: State) {
                    const setOfKeys = new Set<PropertyKeyType>();
                    for (let it=result.iter.next();!it.done; it=result.iter.next()) {
                        if (state.has(it.value)) setOfKeys.add(it.value);
                    }
                    return setOfKeys;
                },
                onItemsInitializeState: () => new Set<PropertyKeyType>(),
                onItemsFinished: (state: State | undefined) => {
                    return { iter: state!.keys(), setof: state };
                }
            };
        }
        const visitor = createLogicalObjectVisitorForGetKeysZeroOrder();
        const result = logicalObjecVisit(logicalObjectTop, () => visitor);
        return result.setof!;
    }

    /**
     * For teh given key "lookupkey", return an array of all object instances with property "lookupkey" and the corresponding type.
     * It's not so simple because the object instances are in a tree, and the lookupkey may be in a union or intersection.
     * However, the object instances are wanted so we can go back and trim the tree.
     * The idea is that this replaces the old code action, in "floughByPropertyAccessExpression", where
     * ```
     * forEachRefTypesTypeTsType(prePassing.type, t => {
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
     * In the new code, is we will be calling forEachRefTypesTypeObject, with iterates over its floughLogicalObjectTypeInstance-s. (or will there be just one?).
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
     * - an unresolved intersection type of FloughtObjectTypesInstance-s.  This is probably not acceptable but is a TODO: to solve with working tests.
     *
     * @param logicalObjectTop
     * @param lookupkey
     * @returns
     */
    export function logicalObjectForEachTypeOfProperyLookup(
        logicalObjectTop: Readonly<FloughLogicalObject>, lookupkey: PropertyKeyType,
    ): ESMap<Readonly<FloughObjectTypeInstance>, Readonly<RefTypesType>> {
        // type Result = { objectInstance: Readonly<FloughLogicalObjectTypeInstance>, type: Readonly<RefTypesType> }[];
        // type State = { objectInstance: Readonly<FloughLogicalObjectTypeInstance>, type: Readonly<RefTypesType> }[];
        type Result = ESMap<Readonly<FloughObjectTypeInstance>, Readonly<RefTypesType>>;
        type State = Result;
        function newMap(x?: {objectTypeInstance: Readonly<FloughObjectTypeInstance>, type: RefTypesType}){
            const map = new Map<Readonly<FloughObjectTypeInstance>, RefTypesType>();
            if (x) map.set(x.objectTypeInstance,x.type);
            return map;
        }
        function createLogicalObjectVisitorForForEachTypeOfProperyLookup(lookupkey: PropertyKeyType):
            LogicalObjectVisitor<Result, State>{
            return {
                onPlain: (logicalObject: Readonly<FloughLogicalObjectPlain>) => {
                    let type = logicalObject.item.keyToType.get(lookupkey);
                    if (!type) {
                        // check if the key is in the base object, if so get the type from there
                        const tsObjectType = logicalObject.item.tsObjectType;
                        const tsPropertyType = checker.getTypeOfPropertyOfType(tsObjectType, lookupkey);
                        type = tsPropertyType ? refTypesTypeModule.createRefTypesType(tsPropertyType) : refTypesTypeModule.getRefTypesTypeUndefined();
                        if (!tsPropertyType) {
                            // TODO: maybe if undefined is not allowed in the base object, this should return never.
                            type = refTypesTypeModule.getRefTypesTypeUndefined();
                        }
                    }
                    return newMap({ objectTypeInstance:logicalObject.item, type });
                },
                onUnion(_logicalObject: Readonly<FloughLogicalObjectUnion>, result: Result, state: State) {
                    // This does nothing because we do not want to widen the individual object instances in the union.
                    // Note that any indivual object instances might have been narrowed in "onPlain" if the lookupkey was not found.
                    result.forEach((type, objectInstance) => {
                        if (!state.get(objectInstance)) state.set(objectInstance, type);
                    });
                    return state;
                },
                onIntersection(_logicalObject: Readonly<FloughLogicalObjectIntersection>, result: Result, state: State) {
                    /**
                     * This does NOT compute the type intersections over all keys.  It only computes the type intersection for the given key.
                     */
                    const iter = result.entries();
                    const first = iter.next();
                    Debug.assert(!first.done);
                    let isecttype = first.value[1];
                    if (!refTypesTypeModule.isNeverType(isecttype)) {
                        for (let it = iter.next(); !it.done; it = iter.next()) {
                            isecttype = refTypesTypeModule.intersectionOfRefTypesType(isecttype, it.value[1]);
                            if (refTypesTypeModule.isNeverType(isecttype)) break;
                        }
                    }
                    result.forEach((_type, objectInstance) => {
                        state.set(objectInstance, isecttype);
                    });
                    return state;
                },
                onItemsInitializeState: () => newMap(),
                onItemsFinished: (state: State | undefined) => {
                    return state ?? newMap();
                }
            };
        } // end of createLogicalObjectVisitorForForEachTypeOfProperyLookup
        const visitor = createLogicalObjectVisitorForForEachTypeOfProperyLookup(lookupkey);
        const result = logicalObjecVisit(logicalObjectTop, () => visitor);
        return result;
    } // end of logicalObjectForEachTypeOfProperyLookup

}