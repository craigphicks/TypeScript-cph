namespace ts {

    const checker = undefined as any as TypeChecker; // TODO: intialize;
    const dbgs = undefined as any as Dbgs;
    const mrNarrow = undefined as any as MrNarrow;
    export function initFlowLogicalObject(checkerIn: TypeChecker, dbgsIn: Dbgs, mrNarrowIn: MrNarrow) {
        (checker as any) = checkerIn;
        //(refTypesTypeModule as any) = refTypesTypeModuleIn;
        (dbgs as any) = dbgsIn;
        (mrNarrow as any) = mrNarrowIn;
    }
    const refTypesTypeModule = floughTypeModule;

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
        onUnion: (logicalObject: Readonly<FloughLogicalObjectUnion>, result: ResultType, state: StateType, itemsIndex: number) => [StateType | undefined,ResultType | undefined];
        onIntersection: (logicalObject: Readonly<FloughLogicalObjectIntersection>, result: ResultType, state: StateType, itemsIndex: number) => [StateType | undefined,ResultType | undefined];
        onDifference?: (logicalObject: Readonly<FloughLogicalObjectDifference>, result: ResultType, state: StateType, itemsIndex: number) => [StateType | undefined,ResultType | undefined];
        onTsunion?: (logicalObject: Readonly<FloughLogicalObjectTsunion>, result: ResultType, state: StateType, itemsIndex: number) => [StateType | undefined,ResultType | undefined];
        onTsintersection?: (logicalObject: Readonly<FloughLogicalObjectTsintersection>, result: ResultType, state: StateType, itemsIndex: number) => [StateType | undefined,ResultType | undefined];

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
            = [[logicalObjectTop, 0, undefined]];
        let result: ResultType | undefined = initialResult;
        while (stack.length!==0) {
            const [logicalObject,itemsIndex,state] = stack[stack.length - 1];
            if (logicalObject.kind===FloughLogicalObjectKind.plain){
                    stack.pop();
                    result = visitor.onPlain(logicalObject);
                    continue;
            }
            else {
                if (logicalObject.items.length=0){
                    stack.pop(); // result carries
                }
                else if (itemsIndex===0) {
                    //stack[stack.length-1][stackStateIdx] = visitor.onItemsInitializeState();
                    stack[stack.length-1][stackItemsIndexIdx]++;
                    stack.push([logicalObject.items[0],0,undefined]);
                    result = undefined;
                }
                else {
                    Debug.assert(result);
                    switch (logicalObject.kind) {
                        case FloughLogicalObjectKind.union:
                            ([stack[stack.length-1][stackStateIdx],result] = visitor.onUnion(logicalObject, result, state!, itemsIndex-1));
                            break;
                        case FloughLogicalObjectKind.intersection:
                            ([stack[stack.length-1][stackStateIdx],result] = visitor.onIntersection(logicalObject, result, state!, itemsIndex-1));
                            break;
                        case FloughLogicalObjectKind.difference:
                            ([stack[stack.length-1][stackStateIdx],result]
                                = visitor.onDifference ? visitor.onDifference(logicalObject, result, state!, itemsIndex-1) : Debug.fail("onDifference not implemented"));
                            break;
                        case FloughLogicalObjectKind.tsunion:
                            ([stack[stack.length-1][stackStateIdx],result] = visitor.onTsunion ? visitor.onTsunion(logicalObject, result, state!, itemsIndex-1) : Debug.fail("onTsunion not implemented"));
                            break;
                        case FloughLogicalObjectKind.tsintersection:
                            ([stack[stack.length-1][stackStateIdx],result] = visitor.onTsintersection ? visitor.onTsintersection(logicalObject, result, state!, itemsIndex-1) : Debug.fail("onTsintersection not implemented"));
                            break;

                    }
                    if (itemsIndex===logicalObject.items.length || result!==undefined) {
                        Debug.assert(result);
                    }
                    else {
                        stack.push([logicalObject.items[itemsIndex],itemsIndex+1,undefined]);
                    }

                }
                continue;
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
    export function logicalObjectGetKeysZeroOrder(
        logicalObjectTop: Readonly<FloughLogicalObject>,
    ): Set<PropertyKeyType> {
        type Result = & {iter: Iterator<PropertyKeyType>, setof: Set<PropertyKeyType> | undefined};
        type State = Set<PropertyKeyType>;
        function createLogicalObjectVisitorForGetKeysZeroOrder():
        LogicalObjectVisitor<Result, State>{
            return {
                onPlain: (logicalObject: Readonly<FloughLogicalObjectPlain>) => {
                    // TODO: add ALL the keys
                    const result: Result = { iter: logicalObject.item.keyToType.keys(), setof: undefined };
                    return result;
                },
                onUnion(_logicalObject: Readonly<FloughLogicalObjectUnion>, result: Result, state: State | undefined, itemsIndex: number) {
                    if (itemsIndex===0) {
                        state = new Set<PropertyKeyType>();
                    }
                    for (let it=result.iter.next();!it.done; it=result.iter.next()) {
                        state!.add(it.value);
                    }
                    if (itemsIndex===_logicalObject.items.length-1) return [undefined, { iter: state!.keys(), setof: state! }];
                    return [state,undefined];
                },
                onIntersection(_logicalObject: Readonly<FloughLogicalObjectIntersection>, result: Result, stateIn: State | undefined, itemsIndex: number) {
                    const stateOut = new Set<PropertyKeyType>();
                    if (itemsIndex===0) {
                        for (let it=result.iter.next();!it.done; it=result.iter.next()) {
                            stateOut.add(it.value);
                        }
                    }
                    else {
                        Debug.assert(stateIn);
                        for (let it=result.iter.next();!it.done; it=result.iter.next()) {
                            if (stateIn.has(it.value)) stateOut.add(it.value);
                        }
                    }
                    if (itemsIndex===_logicalObject.items.length-1) return [undefined, { iter: stateOut.keys(), setof: stateOut }];
                    else return [stateOut,undefined];
                },
            };
        }
        const visitor = createLogicalObjectVisitorForGetKeysZeroOrder();
        const dfltSet = new Set<PropertyKeyType>();
        const result = logicalObjecVisit(logicalObjectTop, () => visitor, { iter: dfltSet.keys(), setof: dfltSet });
        return result.setof!;
    }

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
    export function logicalObjectForEachTypeOfProperyLookup(
        logicalObjectTop: Readonly<FloughLogicalObjectIF>, lookupkey: PropertyKeyType, _crit?: InferCrit
    ): LogicalObjectForEachTypeOfProperyLookupReturnType {
        assertCastType<FloughLogicalObject>(logicalObjectTop);
        // type ObjToTypeMap = ESMap<Readonly<FloughObjectTypeInstance>, Readonly<FloughType>>;
        // type Result = { objectInstance: Readonly<FloughLogicalObjectTypeInstance>, type: Readonly<FloughType> }[];
        // type State = { objectInstance: Readonly<FloughLogicalObjectTypeInstance>, type: Readonly<FloughType> }[];
        type Result = LogicalObjectForEachTypeOfProperyLookupReturnType;
        type State = & { objToType: ObjToTypeMap; type: Readonly<FloughType>/*, setOfObj?: Set<Readonly<FloughObjectTypeInstance>>*/ };
        function newMap(x?: [objectTypeInstance: Readonly<FloughObjectTypeInstance>, type: FloughType]){
            const map = new Map<Readonly<FloughObjectTypeInstance>, FloughType>(x?[x]:[]);
            return map;
        }
        function createLogicalObjectVisitorForForEachTypeOfProperyLookup(lookupkey: PropertyKeyType):
            LogicalObjectVisitor<Result, State>{
            return {
                onPlain: (logicalObject: Readonly<FloughLogicalObjectPlain>) => {
                    if (checker.isArrayOrTupleType(logicalObject.item.tsObjectType)) {
                        if (lookupkey === "length") {
                            return { objToType: newMap([logicalObject.item, refTypesTypeModule.getNumberType()]), type: refTypesTypeModule.getNumberType() };
                        }
                        if (checker.isArrayType(logicalObject.item.tsObjectType)){
                            // by convention, the instance of an array kill keep the instance type value (if it exists) as element 0.
                            let type = logicalObject.item.keyToType.get("0");
                            if (type) return { objToType: newMap([logicalObject.item, type]), type };
                            const tsElementType = checker.getElementTypeOfArrayType(logicalObject.item.tsObjectType);
                            type = tsElementType ? refTypesTypeModule.createFloughType(tsElementType) : refTypesTypeModule.getUndefinedType();
                            return { objToType: newMap([logicalObject.item, type]), type };
                        }
                        else { // tuple
                            const n = parseInt(lookupkey);
                            if (isNaN(n)) return { objToType:newMap() , type: refTypesTypeModule.getUndefinedType() }; // propably should never happen
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
                            if (tsPropertyType) type = refTypesTypeModule.createFloughType(tsPropertyType);
                            else {
                                type = refTypesTypeModule.getUndefinedType();
                            }
                        }
                        return { objToType:newMap([logicalObject.item, type]) , type };
                    }
                },
                onUnion(_logicalObject: Readonly<FloughLogicalObjectUnion>, result: Result, state: State | undefined, itemsIndex: number) {
                    if (itemsIndex===0) state = result;
                    else {
                        Debug.assert(state);
                        // eslint-disable-next-line prefer-const
                        let {objToType, type} = result;
                        objToType.forEach((t, objectInstance) => {
                            if (!objToType.get(objectInstance)) state!.objToType.set(objectInstance, t);
                            // TODO: this could be an in-place merge of t into type, not requiring a new type
                            type = refTypesTypeModule.unionOfFloughType([t,type]);
                        });
                        state.type = type;
                    }
                    if (itemsIndex === _logicalObject.items.length-1) return [undefined, state];
                    return [state, undefined];
                },
                onIntersection(_logicalObject: Readonly<FloughLogicalObjectIntersection>, result: Result, state: State | undefined, itemsIndex: number) {
                    /**
                     * Even if the intersection is empty, we still want to return the object instances to type map, so that they can be trimmed.
                     * TODO:ing: Therefore need "type" in the state - compute the intersection FloughType - if that becomes never type,
                     * we can stop computing intersections but the object instances mappings are still needed (for trimming) - but can we get by
                     * without making those mappings by assuming that empty mappings are mapping to never type? We can try that later,
                     * but for add all object mappings.  Worth noting that the same objects may be get mapped to a non-never type later in a union.
                     *
                     * The intersection type is incrementally computed for each itemsIndex, but the type is not set to the map until the last itemsIndex.
                     */
                    if (itemsIndex===0) {
                        state = result;
                        // state.setOfObj = new Set<Readonly<FloughObjectTypeInstance>>();
                        // result.
                    }
                    else {
                        Debug.assert(state);
                        // eslint-disable-next-line prefer-const
                        let {objToType, type} = result;
                        objToType.forEach((t, objectInstance) => {
                            if (!objToType.get(objectInstance)) state!.objToType.set(objectInstance, t);
                            // TODO: this could be an in-place merge of t into type, not requiring a new type
                            type = refTypesTypeModule.intersectionOfFloughType(t,type);
                        });
                        state.type = type;
                        // result.forEach((_type, objectInstance) => {
                        //     state.set(objectInstance, isecttype);
                        // });
                    }
                    if (itemsIndex === _logicalObject.items.length - 1) {
                        /**
                         * The intersection type is incrementally computed for each itemsIndex, but the type is not set to the map until the last itemsIndex.
                         * Now that the type is set, we can set the type for all the object instances.
                         */
                        state.objToType.forEach((_t, objectInstance) => state!.objToType.set(objectInstance, state!.type));
                        return [undefined, state];
                    }
                    return [state, undefined];
                },
                onDifference(_logicalObject: Readonly<FloughLogicalObjectDifference>, result: Result, state: State | undefined, itemsIndex: number) {
                    Debug.assert(_logicalObject.items.length === 2);
                    if (itemsIndex===0) {
                        state = result;
                        return [state,undefined];
                    }
                    else {
                        Debug.assert(state);
                        // eslint-disable-next-line prefer-const
                        let {objToType, type} = result;
                        objToType.forEach((t, objectInstance) => {
                            if (!objToType.get(objectInstance)) state!.objToType.set(objectInstance, t);
                            type = refTypesTypeModule.differenceOfFloughType(type,t); // type - t
                        });
                        state.objToType.forEach((_t, objectInstance) => state!.objToType.set(objectInstance, type));
                        state.type = type;
                        return [undefined, state];
                    }
                }
            };
        } // end of createLogicalObjectVisitorForForEachTypeOfProperyLookup
        const visitor = createLogicalObjectVisitorForForEachTypeOfProperyLookup(lookupkey);
        const result = logicalObjecVisit(logicalObjectTop, () => visitor, { objToType: newMap(), type: refTypesTypeModule.createFloughTypeNever() });
        return result;
    } // end of logicalObjectForEachTypeOfProperyLookup

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