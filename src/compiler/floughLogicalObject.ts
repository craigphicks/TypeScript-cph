
namespace ts {

    /**
     * FlowLogicalObjectIF
     * Types have a hierachy:
     * - 1. FloughType
     * - 2.1 Special Exclusive Types: Any, Unknown.  Do not occur in cobinations with other types.
     * - 2.2 Non Objects: string, number, literals, etc.  Do occur in combinations with each other and with objects.
     * - 2.2. Objects: object, array, etc.  Do occur in combinations with each other and with non-objects.
     *
     * Objects may be tree structured with set-union, set-intersection, set-difference operations, with Plain objects as leafs.
     * Non-objects are never included in this tree structure, but are always raised to the top level.
     * The FloughLogicalObjectIF is the interface for the tree structure, passed to functions exported from floughLogicalObject in FloughLogicalObjecModule.
     *
     * Kinds of operation on and/or resulting in FloughLogicalObjectIF:
     *
     * creation -
     * - 1. creation from a TypeScript type (e.g., a literal object type is converted to a FloughLogicalObjectIF with a single Plain object leaf)
     * - 2. creation from two (or more) FloughLogicalObjectIF
     * - 2.1. set-union, confluence of flow paths
     * - 2.2. set-intersection, set-difference: narrowing of a flow path, e.g., matching function overloads, ===.
     * - 3. During assignment casting a rhs FloughLogicalObjectIF to a lhs declared type.
     * - 4 Prop/Elt Access with lookupkey and criteria: narrow and/or split the FloughLogicalObjectIF, e.g., if (obj.prop1.prop2) ...
     * reading - property access, indexing, etc.
     * writing - assignment, property assignment, (can this modify inplace, or does it always need to create a new FloughLogicalObjectIF?)
     */

    const enableReSectionSubsetOfTsUnionAndIntersection = true;


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

    type PropertyKeyType = string | number | IntrinsicType | LiteralType; // IntrinsicType is numberType/stringType, TemplateLiteral also possible, but not yet supported.
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
    function createFloughObjectTypeInstance(
        tsObjectType: Readonly<ObjectType>,
        arg1?: Readonly<[PropertyKeyType,FloughType][]> | Readonly<ESMap<PropertyKeyType,FloughType>>,
        objectTypeInstanceId: number = nextFloughObjectTypeInstanceId++):
        FloughObjectTypeInstance {
        const map = new Map(arg1);
        return { tsObjectType, keyToType: map, objectTypeInstanceId, [essymbolFloughObjectTypeInstance]: true };
    }
    // type InstanceUpdate = {
    //     instance: FloughObjectTypeInstance;
    //     key: PropertyKeyType;
    //     type: FloughType;
    // };

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
    interface FloughLogicalObjectBase {
        kind: FloughLogicalObjectKind.union | FloughLogicalObjectKind.intersection | FloughLogicalObjectKind.difference;
        tsType?: ObjectType | IntersectionType | UnionType;
        [essymbolFloughLogicalObject]: true;
    }
    interface FloughLogicalTsObjectBase {
        kind: FloughLogicalObjectKind.tsunion | FloughLogicalObjectKind.tsintersection | FloughLogicalObjectKind.plain;
        tsType: ObjectType | IntersectionType | UnionType;
        [essymbolFloughLogicalObject]: true;
    }

    type FloughLogicalObjectUnion = FloughLogicalObjectBase & {
        kind: FloughLogicalObjectKind.union;
        items: FloughLogicalObject[];
    };
    type FloughLogicalObjectIntersection = FloughLogicalObjectBase & {
        kind: FloughLogicalObjectKind.intersection;
        items: FloughLogicalObject[];
    };
    type FloughLogicalObjectDifference= FloughLogicalObjectBase & {
        kind: FloughLogicalObjectKind.difference;
        items: [FloughLogicalObject,FloughLogicalObject];
    };

    type FloughLogicalObjectPlain = FloughLogicalTsObjectBase & {
        kind: FloughLogicalObjectKind.plain;
        item: FloughObjectTypeInstance;
    };
    /**
     * Although FloughLogicalObjectTsintersection is a leaf node, it is not a FloughLogicalObjectPlain and it has member "items" because
     * TS may include non-objects in intersections (even though result is never), but these are always raised to the top level in FloughType.
     * TODO: `items: FloughLogicalObjectPlain[]`
     */
    type FloughLogicalObjectTsintersection = FloughLogicalTsObjectBase & {
        kind: FloughLogicalObjectKind.tsintersection;
        items: FloughLogicalObject[];
    };
    type FloughLogicalObjectTsunion = FloughLogicalTsObjectBase & {
        kind: FloughLogicalObjectKind.tsunion;
        items: FloughLogicalObject[];
    };

    type FloughLogicalTsObject = FloughLogicalObjectTsintersection | FloughLogicalObjectTsunion | FloughLogicalObjectPlain ;

    type FloughLogicalObject = FloughLogicalObjectUnion | FloughLogicalObjectIntersection | FloughLogicalObjectDifference | FloughLogicalTsObject;

    /**
     * The FloughLogicalObjectIF is the handle for arguments and return values used in exported functions of this module.
     */
    export interface FloughLogicalObjectIF {}

    export function modifyFloughLogicalObjectEffectiveDeclaredType(logicalObject: FloughLogicalObjectIF, edType: Type): FloughLogicalObjectIF {
        assertCastType<FloughLogicalObject>(logicalObject);
        if (!(edType.flags & (TypeFlags.Union | TypeFlags.Intersection | TypeFlags.Object))) {
            /**
             * Cannot change the effective declared type so there should be a mistmatch between the effective declared type and the logical object type.
             * (If not a mismatch then some case is not yet implemented.)
             * Hopefully the checker software will detect the type mismatch and report it.
             */
            return logicalObject;
        }
        logicalObject.tsType = edType as UnionType | IntersectionType | ObjectType;
        return logicalObject;
        // //assertCastType<FloughLogicalObject>(xDeclared);
        // if (!isFloughLogicalObjectPlain(logicalObject)) Debug.fail("unexpected (or not yet implemented?)[x]");
        // //if (!isFloughLogicalObjectPlain(xDeclared)) Debug.fail("unexpected (or not yet implemented?)[xDeclared]");
        // // if the exclusive categories of type do not match then we cannot map the types, but the checker software should detect the type mismatch and report it
        // if (logicalObject.item.tsObjectType===edType) return logicalObject;
        // if (checker.isArrayOrTupleType(logicalObject.item.tsObjectType)!==checker.isArrayOrTupleType(edType)) return logicalObject;
        // // Exception: declared is array, but instance is tuple, then we can force map the tuple down to the array
        // //if (checker.isArrayType(x.item.tsObjectType)!==checker.isArrayType(xDeclared.item.tsObjectType)) return x;
        // if (checker.isArrayOrTupleType(edType)) {
        //     if (checker.isArrayType(edType)){
        //         if (checker.isTupleType(edType)){
        //             Debug.fail("not yet implemented: tuple->array mapping");
        //         }
        //         else {
        //             // both arrays
        //             const etx = checker.getElementTypeOfArrayType(logicalObject.item.tsObjectType);
        //             const etxDeclared = checker.getElementTypeOfArrayType(edType);
        //             if (etx===etxDeclared) return createFloughLogicalObjectPlain(edType);
        //             const eltFloughType = floughTypeModule.createRefTypesType(etx);
        //             const ret = createFloughLogicalObjectPlain(edType, new Map([[0,eltFloughType]]));
        //             return ret;
        //         }
        //     }
        //     else { // declared is tuple
        //         // Mismatched types: cannot set declaredType of Array to Tuple
        //         if (checker.isArrayType(logicalObject.item.tsObjectType)){
        //             return logicalObject; // hope the checker software will detect the type mismatch and report it
        //         }
        //         // both tuples
        //         // x.item.keyToType; // if exists, use it. otherwise, use the resolvedTypeArguments
        //         // x.item.tsObjectType.resolvedTypeArguments;
        //         if (logicalObject.item.keyToType) return createFloughLogicalObjectPlain(edType, logicalObject.item.keyToType);
        //         else {
        //             const args = (logicalObject.item.tsObjectType as TupleTypeReference)
        //                 .resolvedTypeArguments?.map((x,i)=>[i,floughTypeModule.createRefTypesType(x)] as [number,FloughType]);
        //             return createFloughLogicalObjectPlain(edType, args?new Map(args):undefined);
        //         }
        //     }
        // }
        // if (edType.flags & TypeFlags.Object) {
        //     return createFloughLogicalObjectPlain(edType as ObjectType, logicalObject.item.keyToType);
        // }
        // /**
        //  * Cannot change the effective declared type so there should be a mistmatch between the effective declared type and the logical object type.
        //  * (If not a mismatch then some case is not yet implemented.)
        //  * Hopefully the checker software will detect the type mismatch and report it.
        //  */
        // return logicalObject;
    }

    // export function isFloughLogicalObject(x: any): x is FloughLogicalObject {
    //     return !!x?.[essymbolFloughLogicalObject];
    // }

    //arg1?: Readonly<[PropertyKeyType,FloughType][]> | Readonly<ESMap<PropertyKeyType,FloughType>>,
    export function createFloughLogicalObjectPlain(tstype: ObjectType, arg1?: Readonly<ESMap<PropertyKeyType,FloughType>>): FloughLogicalObjectPlain{
        return {
            kind: FloughLogicalObjectKind.plain,
            tsType: tstype,
            item: createFloughObjectTypeInstance(tstype, arg1),
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
    /**
     *
     * @param tsType Only UnionType | IntersectionType | ObjectType return a FloughLogicalObject.
     *     In case of UnionType | IntersectionType, if the type.types contains an elemtent not UnionType | IntersectionType | ObjectTYpe, it is ignored (effectively never).
     * @returns
     * Recurively filters out all non-(UnionType | IntersectionType | ObjectType) elements from each type.types array recursively
     * Return undefined if all types are filtered out.
     * Otherwise, return the type tree converted to a FloughLogicalObject tree.
     * NOTE: Types of object properties/elements are not converted here.
     */
    export function createFloughLogicalObject(tsType: Type): FloughLogicalObjectIF | undefined{
        //assertCastType<FloughLogicalObject>(logicalObject);
        //createFloughLogicalObject(getTsTypeFromLogicalObject(logicalObject));
        function filterAndMapItems(items: Type[]): FloughLogicalTsObject[] {
            //let objectItems: Type[] = items.filter(x=>x.flags & (TypeFlags.Object | TypeFlags.Union | TypeFlags.Intersection));
            return items.filter(x=>x.flags & (TypeFlags.Object | TypeFlags.Union | TypeFlags.Intersection))
                .map(x=>createFloughLogicalObject(x as UnionType | IntersectionType | ObjectType) as undefined | FloughLogicalTsObject)
                .filter(x=>!!x) as FloughLogicalTsObject[];
        }
        if (tsType.flags & TypeFlags.Union) {
            const items = filterAndMapItems((tsType as UnionType).types);
            if (items.length===0) return undefined;
            else if (items.length===1) return items[0];
            else if (enableReSectionSubsetOfTsUnionAndIntersection && items.length !== (tsType as UnionType).types.length) {
                // if some types are filtered out, then we need to resection the types
                const aType = items.map(x=>x.tsType);
                tsType = checker.getUnionType(aType);
            }
            return createFloughLogicalObjectTsunion(tsType as UnionType, items);
        }
        else if (tsType.flags & TypeFlags.Intersection) {
            const items = filterAndMapItems((tsType as UnionType).types);
            if (items.length===0) return undefined;
            else if (items.length===1) return items[0];
            else if (enableReSectionSubsetOfTsUnionAndIntersection && items.length !== (tsType as UnionType).types.length) {
                // if some types are filtered out, then we need to resection the types
                const aType = items.map(x=>x.tsType);
                tsType = checker.getIntersectionType(aType);
            }
            return createFloughLogicalObjectTsintersection(tsType as IntersectionType, items);
        }
        else if (tsType.flags & TypeFlags.Object) {
            return createFloughLogicalObjectPlain(tsType as ObjectType);
        }
        else {
            return undefined;
        }
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
    export function intersectionOfFloughLogicalObjects(...arrobj: FloughLogicalObjectIF[]): FloughLogicalObject {
        assertCastType<FloughLogicalObject[]>(arrobj);
        const items: FloughLogicalObject[] = [];
        for (const a of arrobj) {
            if (a.kind===FloughLogicalObjectKind.intersection) items.push(...a.items);
            else items.push(a);
        }
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

    /**
     *
     * @param arrlogobj This wont work.
     * @returns
     */
    export function intersectionAndSimplifyLogicalObjects(arrlogobj: FloughLogicalObjectIF[]): FloughLogicalObjectIF | undefined{
        assertCastType<FloughLogicalObject[]>(arrlogobj);
        const logobj = intersectionOfFloughLogicalObjects(...arrlogobj);
        return logobj;
        //return createFloughLogicalObject(getEffectiveDeclaredTsTypeFromLogicalObject(logobj));
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

    /**
     * type DiscriminantF:
     * returns true if the type is to be included in the result, or false if it is to be excluded, or a FloughType if it is to be replaced by that type.
     */
    export type DiscriminantFn = (type: Readonly<FloughType>) => FloughType | boolean;
    // export type DiscriminantResultPart = & { arrBaseAndPropertyType: [base:FloughType,property:FloughType][], type: FloughType };
    // export type DiscriminantResult = & { passing: DiscriminantResultPart, failing?: DiscriminantResultPart };

    export function logicalObjectForEachTypeOfPropertyLookup(
        logicalObjectTop: Readonly<FloughLogicalObjectIF>, lookupkey: PropertyKeyType,
    ): { arrBaseAndPropertyType: [base:FloughType,property:FloughType][], type: FloughType } {
        const { objToType, type } = logicalObjectForEachTypeOfPropertyLookupInternal(logicalObjectTop,lookupkey);
        const ret = { arrBaseAndPropertyType: [] as [base:FloughType,property:FloughType][], type: floughTypeModule.createNeverType() };

        objToType.forEach((pt,oi)=>{
            const logicalObject: FloughLogicalTsObject = {
                kind: FloughLogicalObjectKind.plain,
                tsType: oi.tsObjectType,
                item: oi,
                [essymbolFloughLogicalObject]: true
            };
            const base = floughTypeModuleForFloughLogicalObject.createFloughTypeFromLogicalObject(logicalObject);
            ret.arrBaseAndPropertyType.push([base,pt]);
        });
        ret.type = type;
        return ret;
    }

    type ObjToTypeMap = ESMap<Readonly<FloughObjectTypeInstance>, Readonly<FloughType>>;
    type LogicalObjectForEachTypeOfProperyLookupReturnType = & { objToType: ObjToTypeMap; type: Readonly<FloughType> };
    function logicalObjectForEachTypeOfPropertyLookupInternal(
        logicalObjectTop: Readonly<FloughLogicalObjectIF>, lookupkey: PropertyKeyType, discriminantFn?: DiscriminantFn
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
        /**
         *
         * @param lookupkey So far only handles literal keys, not computed keys or generic keys
         * @returns
         */
        function createLogicalObjectVisitorForForEachTypeOfPropertyLookup(lookupkey: PropertyKeyType):
            LogicalObjectVisitor<Result, State>{
            function onPlain(logicalObject: Readonly<FloughLogicalObjectPlain>): Result {
                if (checker.isArrayOrTupleType(logicalObject.item.tsObjectType)) {
                    if (lookupkey === "length") {
                        return { objToType: newMap([logicalObject.item, floughTypeModule.createNumberType()]), type: floughTypeModule.createNumberType() };
                    }
                    if (checker.isArrayType(logicalObject.item.tsObjectType)){
                        // by convention, the instance of an array kill keep the instance type value (if it exists) as element 0.
                        let type = logicalObject.item.keyToType.get(0);
                        if (!type) type = floughTypeModule.createRefTypesType(checker.getElementTypeOfArrayType(logicalObject.item.tsObjectType));
                        if (discriminantFn){
                            const ret = discriminantFn(type);
                            if (ret === false) return createEmptyState();
                            if (ret !== true) type = ret;
                            // else type stay the same
                        }
                        if (type) return { objToType: newMap([logicalObject.item, type]), type };
                        // const tsElementType = checker.getElementTypeOfArrayType(logicalObject.item.tsObjectType);
                        // type = tsElementType ? floughTypeModule.createFromTsType(tsElementType) : Debug.fail("not yet implemented (any type?)");
                        return { objToType: newMap([logicalObject.item, type]), type };
                    }
                    else { // tuple
                        let n: number;
                        if (typeof lookupkey === "string") {
                            // might not need/want this
                            n = parseInt(lookupkey);
                            Debug.assert(!isNaN(n), "unexpected key for tuple: ", ()=>lookupkey);
                        }
                        else if (typeof lookupkey === "number") n = lookupkey;
                        else if ((lookupkey as Type).flags & TypeFlags.NumberLiteral) n = (lookupkey as NumberLiteralType).value;
                        else {
                            Debug.assert(false, "not yet implemented key for tuple: ", ()=>dbgsModule.dbgTypeToString(lookupkey as Type));
                        }

                        assertCastType<TupleTypeReference>(logicalObject.item.tsObjectType);
                        // TODO: rest element
                        if (logicalObject.item.keyToType.has(n)) {
                            const type = logicalObject.item.keyToType.get(n);
                            if (type) return { objToType: newMap([logicalObject.item, type]), type };
                        }
                        if (logicalObject.item.tsObjectType.resolvedTypeArguments) {
                            const tsTupleTypes = logicalObject.item.tsObjectType.resolvedTypeArguments;
                            const type = (n < tsTupleTypes.length) ? floughTypeModule.createFromTsType(tsTupleTypes[n]) : undefined;
                            if (type) return { objToType: newMap([logicalObject.item, type]), type };
                        }
                        {
                            const type = floughTypeModule.createUndefinedType();
                            return { objToType: newMap([logicalObject.item, type]), type };
                        }
                    }
                }
                else {
                    Debug.assert(typeof lookupkey === "string", "unexpected non string key for object: ");
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
                            type = floughTypeModule.createUndefinedType();
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
                        result.objToType.forEach((t1, objectInstance) => {
                            assertCastType<State>(state);
                            const t2 = state.objToType.get(objectInstance);
                            if (!t2) state.objToType.set(objectInstance, t1);
                            // else {
                            //     t1 = floughTypeModule.intersectionWithFloughTypeMutate(t1,t2);
                            //     state.objToType.set(objectInstance, t1);
                            //     Debug.fail("does this really happen?");
                            // }
                        });
                        state.type = floughTypeModule.intersectionWithFloughTypeMutate(result.type,state.type);
                    }
                }
                if (itemsIndex === logicalObject.items.length - 1) {
                    /**
                     * The intersection type is incrementally computed for each itemsIndex, but the type is not set to the map until the last itemsIndex.
                     * Now that the type is set, we can set the type for all the object instances.
                     */
                    state.objToType.forEach((_t, objectInstance) => {
                        assertCastType<State>(state);
                        //const finalType = floughTypeModule.intersectionWithFloughTypeMutate(t,state.type);
                        state.objToType.set(objectInstance, state.type);
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
                        const diffType = floughTypeModule.differenceWithFloughTypeMutate(result.type,_t);
                        state.objToType.set(objectInstance, diffType);
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
                 * A ts-intersection type has internal respesentation of the properties of the intersection type, and we can access those instead of calling union.
                 * The ts-intersection property types are the intersection of property types of the intersection component types, not the union of the property types.
                 * When such an intersection of property types is never, the whole intersection type is never, so the difference with union is consequential.
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
        const visitor = createLogicalObjectVisitorForForEachTypeOfPropertyLookup(lookupkey);
        const result = logicalObjecVisit(logicalObjectTop, () => visitor, { objToType: newMap(), type: floughTypeModule.createNeverType() });
        return result;
    } // end of logicalObjectForEachTypeOfProperyLookup

    export function getEffectiveDeclaredTsTypeSetFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectIF>): Set<Type> {
        assertCastType<Readonly<FloughLogicalObject>>(logicalObjectTop);
        type Result = Set<Type>;
        type State = Set<Type>;
        type OnReturnType = [state:State | undefined, result:Result | undefined, push:FloughLogicalObject | undefined];
        function createLogicalObjectVisitorForGetTsTypeFromLogicalObject(): LogicalObjectVisitor<Result, State>{
            function onUnion(logicalObject: Readonly<FloughLogicalObjectUnion | FloughLogicalObjectTsunion>, result: Result | undefined, state: State | undefined, itemsIndex: number): OnReturnType {
                if (logicalObject.tsType) return [undefined, new Set<Type>([logicalObject.tsType]), undefined];
                if (itemsIndex===-1) return [new Set<Type>(), undefined, logicalObject.items[0]];
                Debug.assert(state && result);
                result.forEach(t => state.add(t));
                if (itemsIndex === logicalObject.items.length-1) return [undefined,state,undefined];
                return [state,undefined, logicalObject.items[itemsIndex+1]];
            }
            return {
                onPlain(logicalObject: Readonly<FloughLogicalObjectPlain>) {
                    return new Set<Type>([logicalObject.tsType]);
                },
                onUnion,
                onIntersection(logicalObject: Readonly<FloughLogicalObjectIntersection>, result: Result | undefined, state: State | undefined, itemsIndex: number): OnReturnType {
                    if (logicalObject.tsType) return [undefined, new Set<Type>([logicalObject.tsType]), undefined];
                    if (itemsIndex===-1) return [new Set<Type>(), undefined, logicalObject.items[0]];
                    Debug.assert(state && result);
                    if (itemsIndex===0) {
                        Debug.assert(state.size===0);
                        state = result;
                    }
                    else {
                        const [smaller,larger] = state.size<result.size ? [state,result] : [result,state];
                        smaller.forEach(t =>{
                            if (!larger.has(t)) smaller.delete(t);
                        });
                        state = smaller;
                    }
                    /**
                     * If state.size===0, then the intersection is empty, so we can stop.
                     */
                    if (itemsIndex === logicalObject.items.length-1 || state.size===0) return [undefined,state,undefined];
                    return [state,undefined, logicalObject.items[itemsIndex+1]];
                },
                onDifference(logicalObject: Readonly<FloughLogicalObjectDifference>, result: Result | undefined, state: State | undefined, itemsIndex: number): OnReturnType {
                    if (logicalObject.tsType) return [undefined, new Set<Type>([logicalObject.tsType]), undefined];
                    Debug.assert(logicalObject.items.length === 2);
                    if (itemsIndex===-1) return [new Set<Type>(), undefined, logicalObject.items[0]];
                    Debug.assert(state && result);
                    if (itemsIndex===0) {
                        Debug.assert(state.size===0);
                        state = result;
                        return [state,undefined, logicalObject.items[itemsIndex+1]];
                    }
                    else {
                        // TODO: compute the difference; subtract the types of the subtrahend (result )from types of the the minuend (state[0])
                        result.forEach(t => state!.delete(t));
                        return [undefined,state, undefined];
                    }
                },
                onTsunion(logicalObject: Readonly<FloughLogicalObjectTsunion>, _result: Result | undefined, _state: State | undefined, _itemsIndex: number) {
                    return [undefined, new Set<Type>([logicalObject.tsType]), undefined];
                    //return onUnion(logicalObject, result,state,itemsIndex);

                },
                onTsintersection(logicalObject: Readonly<FloughLogicalObjectTsintersection>, _result: Result | undefined, _state: State | undefined, _itemsIndex: number) {
                    /**
                     * ts intersection is a single type, not a union of types, and it should contain any unions beneath it.
                     */
                    return [undefined, new Set<Type>([logicalObject.tsType]), undefined];
                },
            };
        }
        const visitor = createLogicalObjectVisitorForGetTsTypeFromLogicalObject();
        const result = logicalObjecVisit(logicalObjectTop, () => visitor, new Set<Type>());
        return result;
    }

    export function getEffectiveDeclaredTsTypeFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectIF>): Type {
        assertCastType<FloughLogicalObject>(logicalObjectTop);
        const at: Type[] = [];
        const typeSet = getEffectiveDeclaredTsTypeSetFromLogicalObject(logicalObjectTop);
        typeSet.forEach(t => at.push(t));
        if (!enableReSectionSubsetOfTsUnionAndIntersection){
            if (logicalObjectTop.kind === "tsunion"){
                if (logicalObjectTop.items.length===at.length){
                    // the types in the original tsType map 1-1 to those in the type set, so return the input.
                    if ((logicalObjectTop.tsType as UnionType).types.every(t => typeSet.has(t))) return logicalObjectTop.tsType;
                }
            }
        }
        if (at.length===0) return checker.getNeverType();
        if (at.length===1) return at[0];
        const ut = checker.getUnionType(at);
        return ut;
    }
    // export function getEffectiveDeclaredTsTypesFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectIF>): Type[] {
    //     const at: Type[] = [];
    //     getEffectiveDeclaredTsTypeSetFromLogicalObject(logicalObjectTop).forEach(t => at.push(t));
    //     return at;
    // }

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
            indent-=4;
        }
        dbgLogicalObjectToStringsAux(logicalObjectTop);
        return as;
    }


}
