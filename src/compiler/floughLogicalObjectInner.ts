
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

    // export type FloughLogicalObjectVariations = ESMap<LiteralType,FloughType>;
    // type Variations = FloughLogicalObjectVariations;
    type Variations = ESMap<LiteralType,FloughType>;


    export type LogicalObjectInnerForEachTypeOfPropertyLookupItem = & {
        logicalObject: FloughLogicalObjectInner | undefined, // undefined <=> logically trimmed
        key: LiteralType | undefined, // undefined <=> lookupkey not a unique literal key ()
        type: FloughType // neverType <=> logicalObject was trimmed
        //isNarrowed?: boolean  // true <=> logicalObject was NOT trimmed && type was narrowed but is not neverType // TODO: kill this?
    };

    export interface FloughLogicalObjectInnerModule {
        //isFloughObjectTypeInstance(x: any): x is FloughObjectTypeInstance;
        //cloneFloughObjectTypeInstance(fobj: Readonly<FloughObjectTypeInstance>): FloughObjectTypeInstance;
        //modifyFloughLogicalObjectEffectiveDeclaredType(logicalObject: FloughLogicalObjectInnerIF, edType: Type): FloughLogicalObjectInnerIF;
        createFloughLogicalObjectPlain(tstype: ObjectType): FloughLogicalObjectPlain;
        createFloughLogicalObjectTsunion(unionType: Readonly<UnionType>, items: Readonly<FloughLogicalObjectInnerIF[]>): FloughLogicalObjectTsunion;
        createFloughLogicalObjectTsintersection(intersectionType: Readonly<IntersectionType>, items: Readonly<FloughLogicalObjectInnerIF[]>): FloughLogicalObjectTsintersection;
        createFloughLogicalObject(tsType: Type): FloughLogicalObjectInnerIF;
        unionOfFloughLogicalObject(a: FloughLogicalObjectInnerIF, b: FloughLogicalObjectInnerIF): FloughLogicalObjectInner;
        intersectionOfFloughLogicalObject(a: FloughLogicalObjectInnerIF, b: FloughLogicalObjectInnerIF): FloughLogicalObjectInner;
        intersectionOfFloughLogicalObjects(...arrobj: FloughLogicalObjectInnerIF[]): FloughLogicalObjectInner;
        differenceOfFloughLogicalObject(minuend: FloughLogicalObjectInnerIF, subtrahend: FloughLogicalObjectInnerIF): FloughLogicalObjectInner;
        intersectionWithLogicalObjectConstraint(logicalObjectTop: Readonly<FloughLogicalObjectInnerIF>, logicalObjectConstraint: Readonly<FloughLogicalObjectInnerIF>): FloughLogicalObjectInnerIF | undefined;
        //    intersectionAndSimplifyLogicalObjects(arrlogobj: FloughLogicalObjectInnerIF[]): FloughLogicalObjectInnerIF | undefined;
        logicalObjectForEachTypeOfPropertyLookup(logicalObject: Readonly<FloughLogicalObjectInnerIF>, lookupkey: Readonly<FloughType>,
            lookupItemTable?: LogicalObjectInnerForEachTypeOfPropertyLookupItem[], discriminantFn?: DiscriminantFn): LogicalObjectInnerForEachTypeOfPropertyLookupItem;
        // getEffectiveDeclaredTsTypeSetFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectIF>): Set<Type>;
        getTsTypeFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectInnerIF>): Type;
        dbgLogicalObjectToStrings(logicalObjectTop: FloughLogicalObjectInnerIF): string[];
    };
    export const floughLogicalObjectInnerModule: FloughLogicalObjectInnerModule = {
        //modifyFloughLogicalObjectEffectiveDeclaredType,
        createFloughLogicalObjectPlain,
        createFloughLogicalObjectTsunion,
        createFloughLogicalObjectTsintersection,
        createFloughLogicalObject,
        unionOfFloughLogicalObject,
        intersectionOfFloughLogicalObject,
        intersectionOfFloughLogicalObjects,
        differenceOfFloughLogicalObject,
        intersectionWithLogicalObjectConstraint,
        //intersectionAndSimplifyLogicalObjects,
        logicalObjectForEachTypeOfPropertyLookup,
        getTsTypeFromLogicalObject,
        dbgLogicalObjectToStrings,
    };


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


    const essymbolFloughObjectTypeInstance = Symbol("floughObjectTypeInstance");
    type FloughObjectTypeInstance = & {
        objectTypeInstanceId: number; // keeps same instance on cloning (for narrowing), but not on merging (unless all merged share same id, this is not yet implemented)
        tsObjectType: ObjectType;
        [essymbolFloughObjectTypeInstance]: true
    };
    // function isFloughObjectTypeInstance(x: any): x is FloughObjectTypeInstance {
    //     return !!x?.[essymbolFloughObjectTypeInstance];
    // }
    let nextFloughObjectTypeInstanceId = 1;
    function createFloughObjectTypeInstance(
        tsObjectType: Readonly<ObjectType>,
        objectTypeInstanceId: number = nextFloughObjectTypeInstanceId++):
        FloughObjectTypeInstance {
        return { tsObjectType, objectTypeInstanceId, [essymbolFloughObjectTypeInstance]: true };
    }

    // function cloneFloughObjectTypeInstance(fobj: Readonly<FloughObjectTypeInstance>): FloughObjectTypeInstance {
    //     return createFloughObjectTypeInstance(fobj.tsObjectType, fobj.keyToType, fobj.objectTypeInstanceId);
    // }
    enum FloughLogicalObjectKind {
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
        //tsType?: ObjectType | IntersectionType | UnionType;
        [essymbolFloughLogicalObject]: true;
    }
    interface FloughLogicalTsObjectBase {
        kind: FloughLogicalObjectKind.tsunion | FloughLogicalObjectKind.tsintersection | FloughLogicalObjectKind.plain;
        tsType: ObjectType | IntersectionType | UnionType;
        [essymbolFloughLogicalObject]: true;
    }

    type FloughLogicalObjectUnion = FloughLogicalObjectBase & {
        kind: FloughLogicalObjectKind.union;
        items: FloughLogicalObjectInner[];
    };
    type FloughLogicalObjectIntersection = FloughLogicalObjectBase & {
        kind: FloughLogicalObjectKind.intersection;
        items: FloughLogicalObjectInner[];
    };
    type FloughLogicalObjectDifference= FloughLogicalObjectBase & {
        kind: FloughLogicalObjectKind.difference;
        items: [FloughLogicalObjectInner,FloughLogicalObjectInner];
    };

    type FloughLogicalObjectPlain = FloughLogicalTsObjectBase & {
        kind: FloughLogicalObjectKind.plain;
        item: FloughObjectTypeInstance;
        variations?: Variations;
    };
    /**
     * Although FloughLogicalObjectTsintersection is a leaf node, it is not a FloughLogicalObjectPlain and it has member "items" because
     * TS may include non-objects in intersections (even though result is never), but these are always raised to the top level in FloughType.
     * TODO: `items: FloughLogicalObjectPlain[]`
     */
    type FloughLogicalObjectTsintersection = FloughLogicalTsObjectBase & {
        kind: FloughLogicalObjectKind.tsintersection;
        items: FloughLogicalObjectInner[];
        variations?: Variations;
    };
    type FloughLogicalObjectTsunion = FloughLogicalTsObjectBase & {
        kind: FloughLogicalObjectKind.tsunion;
        items: FloughLogicalObjectInner[];
    };

    type FloughLogicalTsObject = FloughLogicalObjectTsintersection | FloughLogicalObjectTsunion | FloughLogicalObjectPlain ;

    type FloughLogicalObjectInner = FloughLogicalObjectUnion | FloughLogicalObjectIntersection | FloughLogicalObjectDifference | FloughLogicalTsObject;

    /**
     * The FloughLogicalObjectIF is the handle for arguments and return values used in exported functions of this module.
     */
    export interface FloughLogicalObjectInnerIF {[essymbolFloughLogicalObject]: true;}

    // function modifyFloughLogicalObjectEffectiveDeclaredType(logicalObject: FloughLogicalObjectInnerIF, edType: Type): FloughLogicalObjectInnerIF {
    //     assertCastType<FloughLogicalObjectInner>(logicalObject);
    //     if (!(edType.flags & (TypeFlags.Union | TypeFlags.Intersection | TypeFlags.Object))) {
    //         /**
    //          * Cannot change the effective declared type so there should be a mistmatch between the effective declared type and the logical object type.
    //          * (If not a mismatch then some case is not yet implemented.)
    //          * Hopefully the checker software will detect the type mismatch and report it.
    //          */
    //         return logicalObject;
    //     }
    //     logicalObject.tsType = edType as UnionType | IntersectionType | ObjectType;
    //     return logicalObject;
    // }

    // export function isFloughLogicalObject(x: any): x is FloughLogicalObject {
    //     return !!x?.[essymbolFloughLogicalObject];
    // }

    //arg1?: Readonly<[PropertyKeyType,FloughType][]> | Readonly<ESMap<PropertyKeyType,FloughType>>,
    function createFloughLogicalObjectPlain(tstype: ObjectType): FloughLogicalObjectPlain{
        return {
            kind: FloughLogicalObjectKind.plain,
            tsType: tstype,
            item: createFloughObjectTypeInstance(tstype),
            [essymbolFloughLogicalObject]: true
        };
    }
    function createFloughLogicalObjectUnion(items: FloughLogicalObjectInner[]): FloughLogicalObjectUnion {
        return {
            kind: FloughLogicalObjectKind.union,
            items,
            [essymbolFloughLogicalObject]: true
        };
    }
    function createFloughLogicalObjectTsunion(unionType: Readonly<UnionType>, items: Readonly<FloughLogicalObjectInnerIF[]>): FloughLogicalObjectTsunion {
        assertCastType<FloughLogicalObjectInner[]>(items);
        return {
            kind: FloughLogicalObjectKind.tsunion,
            items,
            tsType: unionType,
            [essymbolFloughLogicalObject]: true
        };
    }
    function createFloughLogicalObjectTsintersection(intersectionType: Readonly<IntersectionType>, items: Readonly<FloughLogicalObjectInnerIF[]>): FloughLogicalObjectTsintersection {
        assertCastType<FloughLogicalObjectInner[]>(items);
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
    function createFloughLogicalObject(tsType: Type): FloughLogicalObjectInnerIF{
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
            if (items.length===0) Debug.fail("unepxected");
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
            if (items.length===0) Debug.fail("unepxected");
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
            Debug.fail("unexpected");
            //return undefined;
        }
    }


    function unionOfFloughLogicalObject(a: FloughLogicalObjectInnerIF, b: FloughLogicalObjectInnerIF): FloughLogicalObjectInner {
        assertCastType<FloughLogicalObjectInner>(a);
        assertCastType<FloughLogicalObjectInner>(b);
        const items: FloughLogicalObjectInner[] = [];
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

    function intersectionOfFloughLogicalObject(a: FloughLogicalObjectInnerIF, b: FloughLogicalObjectInnerIF): FloughLogicalObjectInner {
        assertCastType<FloughLogicalObjectInner>(a);
        assertCastType<FloughLogicalObjectInner>(b);
        const items: FloughLogicalObjectInner[] = [];
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
    function intersectionOfFloughLogicalObjects(...arrobj: FloughLogicalObjectInnerIF[]): FloughLogicalObjectInner {
        assertCastType<FloughLogicalObjectInner[]>(arrobj);
        const items: FloughLogicalObjectInner[] = [];
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

    function differenceOfFloughLogicalObject(minuend: FloughLogicalObjectInnerIF, subtrahend: FloughLogicalObjectInnerIF): FloughLogicalObjectInner {
        assertCastType<FloughLogicalObjectInner>(minuend);
        assertCastType<FloughLogicalObjectInner>(subtrahend);
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
    // function intersectionAndSimplifyLogicalObjects(arrlogobj: FloughLogicalObjectInnerIF[]): FloughLogicalObjectInnerIF | undefined{
    //     assertCastType<FloughLogicalObjectInner[]>(arrlogobj);
    //     const logobj = intersectionOfFloughLogicalObjects(...arrlogobj);
    //     return logobj;
    //     //return createFloughLogicalObject(getEffectiveDeclaredTsTypeFromLogicalObject(logobj));
    // }

    function intersectionWithLogicalObjectConstraint(logicalObjectTop: Readonly<FloughLogicalObjectInner>, logicalObjectConstraint: Readonly<FloughLogicalObjectInner>): FloughLogicalObjectInner | undefined {

        function intersectionWithTsTypeOrTsType(logicalObject: Readonly<FloughLogicalObjectInner>, tsTypeConstraint: Type): FloughLogicalObjectInner | undefined {
            //assertCastType<FloughLogicalObjectInner>(logicalObject);
            if (logicalObject.kind===FloughLogicalObjectKind.plain) {
                // TODO: This might recurse into property types, or maybe subtypesRelation will not do that, whereas assignableRelation would.  Not clear.
                if (checker.isTypeRelatedTo(logicalObject.item.tsObjectType, tsTypeConstraint, checker.getRelations().subtypeRelation)) {
                    // if the logicalObject is a plain object, and it is a subtype of the tsType, then we can just return the logicalObject
                    return logicalObject;
                }
                else return undefined;
            }
            else if (logicalObject.kind===FloughLogicalObjectKind.tsunion || logicalObject.kind===FloughLogicalObjectKind.union) {

                const items = logicalObject.items.map(x=>intersectionWithTsTypeOrTsType(x, tsTypeConstraint)).filter(x=>!!x) as FloughLogicalObjectInner[];
                if (items.length===0) return undefined;
                else if (items.length===1) return items[0];
                else {
                    if (items.length===logicalObject.items.length && items.every((x,i)=>x===logicalObject.items[i])) return logicalObject;
                    else {
                        // if some types are filtered out, new logicalObject is created
                        return createFloughLogicalObjectUnion(items);
                    }
                }
            }
            else if (logicalObject.kind===FloughLogicalObjectKind.tsintersection) {
                // ts-intersection type is an integral type than cannot be simplified.  Like a plain object.
                if (checker.isTypeRelatedTo(logicalObject.tsType, tsTypeConstraint, checker.getRelations().subtypeRelation)) {
                    return logicalObject;
                }
                else return undefined;
            }
            else if (logicalObject.kind===FloughLogicalObjectKind.intersection) {
                Debug.fail("unexpected logicalObject.kind===FloughLogicalObjectKind.intersection, should be resolving immediately");
            }
            else if (logicalObject.kind===FloughLogicalObjectKind.difference) {
                Debug.fail("unexpected logicalObject.kind===FloughLogicalObjectKind.difference, should be resolving immediately");
            }
            //return createFloughLogicalObject(getEffectiveDeclaredTsTypeFromLogicalObject(logobj));
        }
        const logicalObj1 = intersectionWithTsTypeOrTsType(logicalObjectTop,getTsTypeFromLogicalObject(logicalObjectConstraint));
        if (!logicalObj1) return undefined;
        const logicalObj2 = intersectionWithTsTypeOrTsType(logicalObjectConstraint,getTsTypeFromLogicalObject(logicalObj1));
        return logicalObj2;
    }


    type LogicalObjectVisitor<ResultType,StateType, VTorRtnType = [StateType | undefined,ResultType | undefined, FloughLogicalObjectInner | undefined]> = & {
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
        logicalObjectTop: Readonly<FloughLogicalObjectInner>,
        createVisitor: (arg?: ArgType | undefined) => LogicalObjectVisitor<ResultType,StateType>,
        initialResult: ResultType,
        arg?: ArgType,
    ): ResultType {
        const visitor = createVisitor(arg);
        const stackItemsIndexIdx = 1;
        const stackStateIdx = 2;
        const stack: [logicalObject: Readonly<FloughLogicalObjectInner>, itemsIndex: number, state: StateType | undefined][]
            = [[logicalObjectTop, -1, undefined]];
        let result: ResultType | undefined = initialResult;
        let logicalObjectToPush: FloughLogicalObjectInner | undefined;
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

    function logicalObjectForEachTypeOfPropertyLookup(logicalObjectTop: Readonly<FloughLogicalObjectInner>, lookupkey: FloughType,
        lookupItemTable?: LogicalObjectInnerForEachTypeOfPropertyLookupItem[] | undefined, discriminantFn?: DiscriminantFn): LogicalObjectInnerForEachTypeOfPropertyLookupItem {

        type PropertyItem = LogicalObjectInnerForEachTypeOfPropertyLookupItem;

        Debug.assert(!floughTypeModule.isNeverType(lookupkey));

        function worker(logicalObject: FloughLogicalObjectInner): PropertyItem {
            if (logicalObject.kind === FloughLogicalObjectKind.plain) {


                const helper = (at: Type[], aftype: FloughType[], akeyType: LiteralType[]): PropertyItem => {
                    assertCastType<Readonly<FloughLogicalObjectPlain>>(logicalObject);
                    let type = aftype.length===0 ? floughTypeModule.createNeverType()
                    : aftype.length===1 ? aftype[0]
                    : floughTypeModule.unionOfRefTypesType(aftype);
                    for (const t of at) type = floughTypeModule.unionWithTsTypeMutate(t, type);

                    if (!discriminantFn){
                        const item: PropertyItem = { logicalObject, key: undefined, type };
                        if (lookupItemTable){
                            lookupItemTable.push(item);
                        }
                        return item;
                    }

                    const key = akeyType.length===1 ? akeyType[0] : undefined;
                    const dtype = discriminantFn(type);
                    let item: PropertyItem;
                    if (!dtype) {
                        // logicalObject will be pruned, no point in setting variation
                        item = { logicalObject: undefined, key, type: floughTypeModule.createNeverType() };
                    }
                    else{
                        if (dtype!==true) {
                            if (key) {
                                /**
                                 * Crucial: logical object must be re-shelled, because it's variation has diverged.
                                 * The parent of logical object will detect that it has changed and will re-shell itself.
                                 */
                                const variations: Variations = new Map(logicalObject.variations);
                                variations.set(key, dtype);
                                (logicalObject = { ...logicalObject, variations });
                            }
                            type = dtype;
                        }
                        item = { logicalObject, key, type: dtype===true ? type : dtype };
                    }
                    if (lookupItemTable){
                        lookupItemTable.push(item);
                    }
                    return item;
                };


                const objType = logicalObject.item.tsObjectType;
                if (checker.isArrayOrTupleType(objType)) {
                    if (checker.isArrayType(objType)) {
                        /**
                         * An array type cannot be narrowed because actual index is not tracked.
                         * Still, the base type can be tracked so that gets put in the table.
                         */
                        const elemType = checker.getElementTypeOfArrayType(objType);
                        Debug.assert(elemType); // When is this undefined?

                        const item: PropertyItem = { logicalObject, key: undefined, type: elemType };
                        if (lookupItemTable) {
                            lookupItemTable.push(item);
                        }
                        return item;
                    }
                    else {
                        const objType = logicalObject.item.tsObjectType;
                        assertCastType<TupleTypeReference>(objType);
                        const akeyType = floughTypeModule.getLiteralNumberTypes(lookupkey);
                        const akey = akeyType?.map(lt => lt.value) as number[];
                        const tupleElements = checker.getTypeArguments(objType);
                        const elementFlags = objType.target.elementFlags;
                        const hasRest = (elementFlags[elementFlags.length-1] & ElementFlags.Rest);
                        if (!akey || akey.length === 0) {
                            /**
                             * There are no keys because either:
                             * (a) the key type was generic number type, or
                             *     -> return the union of the tuple element types
                             * (b) the key type was the wrong type, not a number type
                             *     -> return undefinedType rather than neverType because that will behave better for the user (less cascading errors, ... maybe)
                             *
                             */
                            if (!floughTypeModule.hasNumberType(lookupkey)) {
                                const type = floughTypeModule.createUndefinedType();
                                const item: PropertyItem = { logicalObject, key: undefined, type };
                                // The key type was not a number type, the checker may produce an error, but we treat it here as an undefined type.
                                if (lookupItemTable) {
                                    lookupItemTable.push(item);
                                }
                                return item;
                            }
                            /**
                             * Undefined is included in the union because number includes invalid tuple indices.
                             */
                            const tstype = checker.getUnionType([...tupleElements, checker.getUndefinedType()]);
                            const type = floughTypeModule.createFromTsType(tstype);
                            const item: PropertyItem = { logicalObject, key: undefined, type };
                            if (lookupItemTable) {
                                lookupItemTable.push(item);
                            }
                            return item;
                        }
                        else {
                            Debug.assert(akeyType && akeyType.length === akey.length);
                            const at: Type[] = [];
                            const aftype: FloughType[] = [];
                            let addUndefined = false;
                            // eslint-disable-next-line @typescript-eslint/prefer-for-of
                            for (let i=0; i<akey.length; i++) {
                            // for (const k of akey) {
                                let ft;
                                if (ft = logicalObject.variations?.get(akeyType[i])){
                                    aftype.push(ft);
                                    continue;
                                }
                                const k=akey[i];
                                let t: Type | undefined;
                                let undef: boolean | undefined;
                                if (k < tupleElements.length) {
                                    t = tupleElements[k];
                                    undef = !!(elementFlags[k] & (ElementFlags.Optional|ElementFlags.Rest));
                                    // at.push(tupleElements[k]);
                                    // addUndefined ||= !!(elementFlags[k] & (ElementFlags.Optional|ElementFlags.Rest));
                                }
                                else if (hasRest) {
                                    t = tupleElements[tupleElements.length-1];
                                    undef = !!(elementFlags[elementFlags.length-1] & (ElementFlags.Optional|ElementFlags.Rest));
                                    // at.push(tupleElements[tupleElements.length-1]);
                                    // addUndefined = true;
                                }
                                else undef = true;
                                if (t) at.push(t);
                                addUndefined ||= undef;
                            }
                            if (addUndefined) at.push(checker.getUndefinedType());
                            return helper(at, aftype, akeyType);
                        }
                    }
                    Debug.fail("unexpected");
                }
                else {
                    const objType = logicalObject.item.tsObjectType;
                    const akeyType = floughTypeModule.getLiteralStringTypes(lookupkey);
                    const akey = akeyType?.map(x=>x.value);
                    if (!akey || akey.length === 0) {
                        if (!floughTypeModule.hasStringType(lookupkey)) {
                            const type = floughTypeModule.createUndefinedType();
                            const item: PropertyItem = { logicalObject, key: undefined, type };
                            // The key type was not a string type, the checker may produce an error, but we treat it here as an undefined type.
                            if (lookupItemTable) {
                                lookupItemTable.push(item);
                            }
                            return item;
                        }
                        else {
                            // Do the same thing for the union of ALL keys - assuming this an checker error, but we treat it here as an undefined type.
                            // TODO: look up the string index type and return that.
                            const type = floughTypeModule.createUndefinedType();
                            const item: PropertyItem = { logicalObject, key: undefined, type };
                            // The key type was not a string type, the checker may produce an error, but we treat it here as an undefined type.
                            if (lookupItemTable) {
                                lookupItemTable.push(item);
                            }
                            return item;
                        }
                    }
                    else {
                        const at: Type[] = [];
                        const aftype: FloughType[] = [];
                        {
                            let addUndefined = false;
                            // eslint-disable-next-line @typescript-eslint/prefer-for-of
                            for (let i=0; i<akey.length; i++) {
                                let ft;
                                if (ft = logicalObject.variations?.get(akeyType![i])){
                                    aftype.push(ft);
                                    continue;
                                }
                                const keystring = akey[i];
                                const propSymbol = checker.getPropertyOfType(objType,keystring as string);
                                let undef = false;
                                let propType: Type = checker.getUndefinedType();
                                if (propSymbol) {
                                    propType = checker.getTypeOfSymbol(propSymbol);
                                    undef = !!(propSymbol.flags & SymbolFlags.Optional);
                                    //at.push(propType);
                                }
                                else addUndefined = true;
                                // let got;
                                // if (got = variations?.get(akeyType![i])) {
                                //     if (!propType) propType = checker.getNeverType();
                                //     if (undef) propType = checker.getUnionType([propType, checker.getUndefinedType()]);
                                //     let tmpType = floughTypeModule.createFromTsType(propType);
                                //     //if (undef && !floughTypeModule.hasUndefined(got)) undef = false;
                                //     tmpType = floughTypeModule.intersectionWithFloughTypeMutate(got, tmpType);
                                //     propType = floughTypeModule.getTypeFromRefTypesType(tmpType);
                                //     undef = false; // is already in t, if present.
                                // }
                                at.push(propType);
                                addUndefined ||= undef;
                            }
                            if (addUndefined) at.push(checker.getUndefinedType());
                        }
                        return helper(at, aftype, akeyType!);
                    }
                }
            }
            else if (logicalObject.kind === FloughLogicalObjectKind.tsintersection) {
                debugger;
                Debug.fail("not yet implemented");
            }
            else if (logicalObject.kind === FloughLogicalObjectKind.tsunion || logicalObject.kind === FloughLogicalObjectKind.union) {
                const propItems = logicalObject.items.map(worker);
                if (extraAsserts) Debug.assert(propItems.every(x=>x.key===propItems[0].key));
                const key = propItems[0].key;
                const type = propItems.length===1 ? propItems[0].type : floughTypeModule.unionOfRefTypesType(propItems.map(x=>x.type));
                const item: PropertyItem = { logicalObject, key, type };
                if (lookupItemTable) lookupItemTable.push(item);
                return item;
            }
            else {
                Debug.fail("unexpected");
            }
        } // end of worker
        return worker(logicalObjectTop);
    } // end of logicalObjectForEachTypeOfPropertyLookupInternal


    function getTsTypeSetFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectInnerIF>): Set<Type> {
        assertCastType<Readonly<FloughLogicalObjectInner>>(logicalObjectTop);
        type Result = Set<Type>;
        type State = Set<Type>;
        type OnReturnType = [state:State | undefined, result:Result | undefined, push:FloughLogicalObjectInner | undefined];
        function createLogicalObjectVisitorForGetTsTypeFromLogicalObject(): LogicalObjectVisitor<Result, State>{
            function onUnion(logicalObject: Readonly<FloughLogicalObjectUnion | FloughLogicalObjectTsunion>, result: Result | undefined, state: State | undefined, itemsIndex: number): OnReturnType {
                //if (logicalObject.tsType) return [undefined, new Set<Type>([logicalObject.tsType]), undefined];
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
                    //if (logicalObject.tsType) return [undefined, new Set<Type>([logicalObject.tsType]), undefined];
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
                    //if (logicalObject.tsType) return [undefined, new Set<Type>([logicalObject.tsType]), undefined];
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

    function getTsTypeFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectInnerIF>): Type {
        assertCastType<FloughLogicalObjectInner>(logicalObjectTop);
        const at: Type[] = [];
        const typeSet = getTsTypeSetFromLogicalObject(logicalObjectTop);
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

    function dbgLogicalObjectToStrings(logicalObjectTop: FloughLogicalObjectInnerIF): string[] {
        const as: string[] = [];
        assertCastType<FloughLogicalObjectInner>(logicalObjectTop);
        let indent = 0;

        function dbgLogicalObjectToStringsAux(logicalObject: FloughLogicalObjectInner){
            const pad = " ".repeat(indent);
            indent+=4;
            const lenin = as.length;
            as. push("kind: "+logicalObject.kind);
            if (logicalObject.kind === "plain") {
                as.push(`  logicalObject.item.objectTypeInstanceId: ${logicalObject.item.objectTypeInstanceId}`);
                as.push("  logicalObject.item.tsObjectType: "+dbgs.dbgTypeToString(logicalObject.item.tsObjectType));
            }
            if (logicalObject.kind === "tsintersection" || logicalObject.kind === "tsunion") {
                as.push("  logicalObject.tsType: "+dbgs.dbgTypeToString(logicalObject.tsType));
            }
            if (logicalObject.kind === "plain" || logicalObject.kind === "tsintersection") {
                if (logicalObject.variations) {
                    logicalObject.variations.forEach((value,key)=>{
                        as.push(`  variation:  key:${dbgsModule.dbgTypeToString(key)}], value:${dbgsModule.dbgFloughTypeToString(value)}`);
                    });
                }
            }
            if (logicalObject.kind !== "plain"){
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
