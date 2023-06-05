
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

    type LiteralTypeNumber = LiteralType & {value: number};
    type LiteralTypeString = LiteralType & {value: string};
    function isLiteralTypeNumber(x: LiteralType): x is LiteralTypeNumber {
        return x.value !== undefined && typeof x.value === "number";
    }
    // @ts-expect-error
    function isLiteralTypeString(x: LiteralType): x is LiteralTypeString {
        return x.value !== undefined && typeof x.value === "string";
    }


    export type OldToNewLogicalObjectMap = ESMap<FloughLogicalObjectInnerIF,FloughLogicalObjectInnerIF>;

    export type LogicalObjectInnerForEachTypeOfPropertyLookupItem = & {
        logicalObject: FloughLogicalObjectInner,
        key: LiteralType | undefined, // undefined <=> lookupkey not a unique literal key ()
        type: FloughType, // maybe undefined, but should not be never.
        arrLogicalObjectBase: Readonly<FloughLogicalObjectInner>[]
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
            lookupItemTable?: LogicalObjectInnerForEachTypeOfPropertyLookupItem[],
            inCondition?: boolean): void;
        // getEffectiveDeclaredTsTypeSetFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectIF>): Set<Type>;
        getTsTypeFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectInnerIF>): Type;
        logicalObjectDuplicateBaseAndJoinTypeInner(base: FloughLogicalObjectInnerIF, key: LiteralType, type: Readonly<FloughType>): FloughLogicalObjectInnerIF;
        replaceTypeAtKey(logicalObject: Readonly<FloughLogicalObjectInnerIF>, key: LiteralType, modifiedType: Readonly<FloughType>): FloughLogicalObjectInnerIF;
        getTypeAtIndexFromBase(logicalObjectBaseIn: Readonly<FloughLogicalObjectInnerIF>, key: LiteralType): FloughType;
        replaceOrFilterLogicalObjects(logicalObjectIn: Readonly<FloughLogicalObjectInnerIF>, logicalObjectOldToNewMap: Readonly<ESMap<FloughLogicalObjectInnerIF,FloughLogicalObjectInnerIF>>): FloughLogicalObjectInner | undefined;
        getTypeFromAssumedBaseLogicalObject(logicalObject: Readonly<FloughLogicalObjectInnerIF>): Type;
        unionOfSameBaseTypesWithVariations(arr: Readonly<FloughLogicalObjectInnerIF[]>): FloughLogicalObjectInnerIF;
        identicalBaseTypes(logicalObject1: Readonly<FloughLogicalObjectInnerIF>, logicalObject2: Readonly<FloughLogicalObjectInnerIF>): boolean;
        getBaseLogicalObjects(logicalObjectTop: Readonly<FloughLogicalObjectInnerIF>): FloughLogicalObjectInnerIF[];
        logicalObjectAccess(
            roots: Readonly<FloughLogicalObjectInnerIF[]>,
            akey: Readonly<FloughType[]>,
        ): LogicalObjectAccessReturn;
        logicalObjectModify(
            types: Readonly<(FloughType | undefined)[]>,
            state: LogicalObjectAccessReturn,
        ): void;

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
        logicalObjectDuplicateBaseAndJoinTypeInner,
        replaceTypeAtKey,
        getTypeAtIndexFromBase,
        replaceOrFilterLogicalObjects,
        getTypeFromAssumedBaseLogicalObject,
        unionOfSameBaseTypesWithVariations,
        identicalBaseTypes,
        getBaseLogicalObjects,
        logicalObjectAccess,
        logicalObjectModify,
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


    // const essymbolFloughObjectTypeInstance = Symbol("floughObjectTypeInstance");
    // type FloughObjectTypeInstance = & {
    //     objectTypeInstanceId: number;
    //     //tsObjectType: ObjectType;
    //     [essymbolFloughObjectTypeInstance]: true
    // };
    // function isFloughObjectTypeInstance(x: any): x is FloughObjectTypeInstance {
    //     return !!x?.[essymbolFloughObjectTypeInstance];
    // }
    // let nextFloughObjectTypeInstanceId = 1;
    // function createFloughObjectTypeInstance(
    //     tsObjectType: Readonly<ObjectType>,
    //     objectTypeInstanceId: number = nextFloughObjectTypeInstanceId++):
    //     FloughObjectTypeInstance {
    //     return { /*tsObjectType*/, objectTypeInstanceId, [essymbolFloughObjectTypeInstance]: true };
    // }

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
        id: number;
        kind: FloughLogicalObjectKind.union | FloughLogicalObjectKind.intersection | FloughLogicalObjectKind.difference;
        //tsType?: ObjectType | IntersectionType | UnionType;
        [essymbolFloughLogicalObject]: true;
    }
    interface FloughLogicalTsObjectBase {
        id: number;
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
        //item: FloughObjectTypeInstance;
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
    let nextLogicalObjectInnerId = 1;

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
            id: nextLogicalObjectInnerId++,
            // item: createFloughObjectTypeInstance(tstype),
            [essymbolFloughLogicalObject]: true
        };
    }
    function createFloughLogicalObjectUnion(items: FloughLogicalObjectInner[]): FloughLogicalObjectUnion {
        return {
            kind: FloughLogicalObjectKind.union,
            items,
            id: nextLogicalObjectInnerId++,
            [essymbolFloughLogicalObject]: true
        };
    }
    function createFloughLogicalObjectTsunion(unionType: Readonly<UnionType>, items: Readonly<FloughLogicalObjectInnerIF[]>): FloughLogicalObjectTsunion {
        assertCastType<FloughLogicalObjectInner[]>(items);
        return {
            kind: FloughLogicalObjectKind.tsunion,
            items,
            tsType: unionType,
            id: nextLogicalObjectInnerId++,
            [essymbolFloughLogicalObject]: true
        };
    }
    function createFloughLogicalObjectTsintersection(intersectionType: Readonly<IntersectionType>, items: Readonly<FloughLogicalObjectInnerIF[]>): FloughLogicalObjectTsintersection {
        assertCastType<FloughLogicalObjectInner[]>(items);
        return {
            kind: FloughLogicalObjectKind.tsintersection,
            items,
            tsType: intersectionType,
            id: nextLogicalObjectInnerId++,
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
            id: nextLogicalObjectInnerId++,
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
            id: nextLogicalObjectInnerId++,
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
            id: nextLogicalObjectInnerId++,
            [essymbolFloughLogicalObject]: true
        };
    }

    function differenceOfFloughLogicalObject(minuend: FloughLogicalObjectInnerIF, subtrahend: FloughLogicalObjectInnerIF): FloughLogicalObjectInner {
        assertCastType<FloughLogicalObjectInner>(minuend);
        assertCastType<FloughLogicalObjectInner>(subtrahend);
        return {
            kind: FloughLogicalObjectKind.difference,
            items: [minuend,subtrahend],
            id: nextLogicalObjectInnerId++,
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
                if (checker.isTypeRelatedTo(logicalObject.tsType, tsTypeConstraint, checker.getRelations().subtypeRelation)) {
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

    // type TupleContext = & {
    //     readonly tupleElements: Readonly<Type[]>;
    //     readonly elementFlags: Readonly<ElementFlags[]>;
    //     readonly hasRest: boolean;
    // };
    // function getTupleContext(objType: Readonly<ObjectType>): Readonly<TupleContext> {
    //     assertCastType<TupleTypeReference>(objType);
    //     const elementFlags = objType.target.elementFlags;
    //     const hasRest = !!(elementFlags[elementFlags.length-1] & ElementFlags.Rest);
    //     return {
    //         tupleElements: checker.getTypeArguments(objType),
    //         elementFlags,
    //         hasRest,
    //     } as TupleContext;
    // }
    // function getTupleElementType(objType: Readonly<ObjectType>, index: number, refTupleContext?: [TupleContext] | undefined): Type {
    //     const tupleContext = refTupleContext ? (refTupleContext[0] || (refTupleContext[0] = getTupleContext(objType))) : getTupleContext(objType);
    //     let undef = false;
    //     let type: Type;
    //     if (index<tupleContext.tupleElements.length) {
    //         type = tupleContext.tupleElements[index];
    //         undef = !!(tupleContext.elementFlags[index] & (ElementFlags.Optional | ElementFlags.Rest));
    //     }
    //     else if (tupleContext.hasRest) {
    //         type = tupleContext.tupleElements[tupleContext.tupleElements.length-1];
    //         undef = true;
    //     }
    //     else type = checker.getUndefinedType();
    //     // is this necessary or is the undefined type already included in the tuple type?
    //     if (undef) type = checker.getUnionType([type,checker.getUndefinedType()]);
    //     return type;

    //     /**
    //      * TODO: if the type already included undefined, then we could do hte following:
    //      */
    //     // const type = tupleContext.tupleElements[index] ?? (tupleContext.hasRest ? tupleContext.tupleElements[tupleContext.tupleElements.length-1] : undefined);
    // }

    // function getTypeOfTupleAtIndices(objType: Readonly<ObjectType>, variations: Variations | undefined, tt: Readonly<LiteralTypeNumber | LiteralTypeNumber[]>): FloughType {
    //     if (extraAsserts) Debug.assert(checker.isTupleType(objType));
    //     assertCastType<TupleTypeReference>(objType);
    //     const tupleElements = checker.getTypeArguments(objType);
    //     const elementFlags = objType.target.elementFlags;
    //     const hasRest = (elementFlags[elementFlags.length-1] & ElementFlags.Rest);
    //     let undef = false;
    //     const at: Type[]=[];
    //     const aft: FloughType[]=[];
    //     const doone = (klt: LiteralTypeNumber): void =>{
    //         if (variations){
    //             let ft;
    //             if (ft = variations.get(klt)){
    //                 aft.push(ft);
    //                 return;
    //             }
    //         }
    //         const k = klt.value;
    //         if (k < tupleElements.length) {
    //             at.push(tupleElements[k]);
    //             undef ||= !!(elementFlags[k] & (ElementFlags.Optional|ElementFlags.Rest));
    //         }
    //         else if (hasRest) {
    //             at.push(tupleElements[tupleElements.length-1]);
    //             undef ||= !!(elementFlags[elementFlags.length-1] & (ElementFlags.Optional|ElementFlags.Rest));
    //         }
    //         else undef||=true;
    //     };
    //     if (!isArray(tt)) {
    //         doone(tt);
    //     }
    //     else {
    //         tt.forEach(t=>doone(t));
    //     }
    //     let ft = aft.length===0 ? floughTypeModule.getNeverType() : aft.length===1? aft[0] : floughTypeModule.unionOfRefTypesType(aft);
    //     if (undef) at.push(checker.getUndefinedType());
    //     at.forEach(t=>{
    //         ft=floughTypeModule.unionWithTsTypeMutate(t,ft);
    //     });
    //     return ft;
    // }

    function logicalObjectForEachTypeOfPropertyLookup(logicalObjectTop: Readonly<FloughLogicalObjectInner>, lookupkey: FloughType,
        lookupItemTable?: LogicalObjectInnerForEachTypeOfPropertyLookupItem[],
    ): void {

        type PropertyItem = LogicalObjectInnerForEachTypeOfPropertyLookupItem;

        Debug.assert(!floughTypeModule.isNeverType(lookupkey));

        function worker(logicalObject: FloughLogicalObjectInner): void {
            if (logicalObject.kind === FloughLogicalObjectKind.plain) {

                const helper = (at: Type[], aftype: FloughType[], akeyType: LiteralType[]): PropertyItem => {
                    assertCastType<Readonly<FloughLogicalObjectPlain>>(logicalObject);
                    const arrLogicalObjectBase: FloughLogicalObjectInner[] = [];
                    if (aftype.length){
                        for (const ft of aftype) {
                            if (floughTypeModule.isNeverType(ft)) continue;
                            let fo: FloughLogicalObjectIF | undefined;
                            if (fo = floughTypeModule.getLogicalObject(ft)) {
                                arrLogicalObjectBase.push(...getBaseLogicalObjects(floughLogicalObjectModule.getInnerIF(fo) as FloughLogicalObjectInner));
                            }
                        }
                    }
                    for (const t of at) {
                        if (t.flags & TypeFlags.Object) {
                            arrLogicalObjectBase.push(createFloughLogicalObject(t as ObjectType) as FloughLogicalObjectInner);
                        }
                        else {
                            checker.forEachType(t, tb=>{
                                if (tb.flags & TypeFlags.Object) {
                                    arrLogicalObjectBase.push(createFloughLogicalObject(tb as ObjectType) as FloughLogicalObjectInner);
                                }
                            });
                        }
                    }
                    const key = akeyType.length===1 ? akeyType[0] : undefined;
                    let type = aftype.length===0 ? floughTypeModule.createNeverType()
                    : aftype.length===1 ? aftype[0]
                    : floughTypeModule.unionOfRefTypesType(aftype);
                    for (const t of at) type = floughTypeModule.unionWithTsTypeMutate(t, type);

                    const item = { logicalObject, key, type, arrLogicalObjectBase };
                    if (lookupItemTable){
                        lookupItemTable.push(item);
                    }
                    return item;
                };

                const objType = logicalObject.tsType;
                if (checker.isArrayOrTupleType(objType)) {
                    if (checker.isArrayType(objType)) {
                        /**
                         * An array type cannot be narrowed because actual index is not tracked.
                         * Still, the base type can be tracked so that gets put in the table.
                         */
                        const elemType = checker.getElementTypeOfArrayType(objType);
                        Debug.assert(elemType); // When is this undefined?
                        // In this case no arrLogicalObjectBase is added because the array type will currently not be narrowed in modify()
                        const item: PropertyItem = { logicalObject, key: undefined, type: elemType, arrLogicalObjectBase: undefined as any as FloughLogicalObjectInner[] };
                        if (lookupItemTable) {
                            lookupItemTable.push(item);
                        }
                        //return item;
                    }
                    else {
                        const objType = logicalObject.tsType;
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
                                const item: PropertyItem = { logicalObject, key: undefined, type, arrLogicalObjectBase: undefined as any as FloughLogicalObjectInner[] };
                                // The key type was not a number type, the checker may produce an error, but we treat it here as an undefined type.
                                if (lookupItemTable) {
                                    lookupItemTable.push(item);
                                }
                                //return item;
                            }
                            /**
                             * Undefined is included in the union because number includes invalid tuple indices.
                             */
                            const tstype = checker.getUnionType([...tupleElements, checker.getUndefinedType()]);
                            const type = floughTypeModule.createFromTsType(tstype);
                            const item: PropertyItem = { logicalObject, key: undefined, type, arrLogicalObjectBase: undefined as any as FloughLogicalObjectInner[] };
                            if (lookupItemTable) {
                                lookupItemTable.push(item);
                            }
                            //return item;
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
                            helper(at, aftype, akeyType);
                            return;
                        }
                    }
                    Debug.fail("unexpected");
                }
                else {
                    const objType = logicalObject.tsType;
                    const akeyType = floughTypeModule.getLiteralStringTypes(lookupkey);
                    const akey = akeyType?.map(x=>x.value);
                    if (!akey || akey.length === 0) {
                        if (!floughTypeModule.hasStringType(lookupkey)) {
                            const type = floughTypeModule.createUndefinedType();
                            const item: PropertyItem = { logicalObject, key: undefined, type, arrLogicalObjectBase: undefined as any as FloughLogicalObjectInner[] };
                            // The key type was not a string type, the checker may produce an error, but we treat it here as an undefined type.
                            if (lookupItemTable) {
                                lookupItemTable.push(item);
                            }
                            //return item;
                        }
                        else {
                            // Do the same thing for the union of ALL keys - assuming this an checker error, but we treat it here as an undefined type.
                            // TODO: look up the string index type and return that.
                            const type = floughTypeModule.createUndefinedType();
                            const item: PropertyItem = { logicalObject, key: undefined, type, arrLogicalObjectBase: undefined as any as FloughLogicalObjectInner[] };
                            // The key type was not a string type, the checker may produce an error, but we treat it here as an undefined type.
                            if (lookupItemTable) {
                                lookupItemTable.push(item);
                            }
                            //return item;
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
                                }
                                else addUndefined = true;
                                at.push(propType);
                                addUndefined ||= undef;
                            }
                            if (addUndefined) at.push(checker.getUndefinedType());
                        }
                        helper(at, aftype, akeyType!);
                        return;
                    }
                }
            }
            else if (logicalObject.kind === FloughLogicalObjectKind.tsintersection) {
                debugger;
                Debug.fail("not yet implemented");
            }
            else if (logicalObject.kind === FloughLogicalObjectKind.tsunion || logicalObject.kind === FloughLogicalObjectKind.union) {
                // eslint-disable-next-line prefer-const
                // let maybe = true;
                // if (maybe) Debug.fail("not yet implemented");
                logicalObject.items.map(worker);
                logicalObject.items.map(worker);
                // if (extraAsserts) Debug.assert(propItems.every(x=>x.key===propItems[0].key));
                // const key = propItems[0].key;
                // const type = propItems.length===1 ? propItems[0].type : floughTypeModule.unionOfRefTypesType(propItems.map(x=>x.type));
                // const item: PropertyItem = { logicalObject, key, type };
                //if (lookupItemTable) lookupItemTable.push(item);
                //return item;
            }
            else {
                Debug.fail("unexpected");
            }
        } // end of worker
        return worker(logicalObjectTop);
    } // end of logicalObjectForEachTypeOfPropertyLookupOLD


    // @ ts-expect-error
    // function logicalObjectForEachTypeOfPropertyLookupOLD(logicalObjectTop: Readonly<FloughLogicalObjectInner>, lookupkey: FloughType,
    //     lookupItemTable?: LogicalObjectInnerForEachTypeOfPropertyLookupItem[] | undefined,
    //     inCondition?: boolean): LogicalObjectInnerForEachTypeOfPropertyLookupItem {

    //     type PropertyItem = LogicalObjectInnerForEachTypeOfPropertyLookupItem;

    //     Debug.assert(!floughTypeModule.isNeverType(lookupkey));

    //     function worker(logicalObject: FloughLogicalObjectInner): PropertyItem {
    //         if (logicalObject.kind === FloughLogicalObjectKind.plain) {

    //             const helper = (at: Type[], aftype: FloughType[], akeyType: LiteralType[]): PropertyItem => {
    //                 assertCastType<Readonly<FloughLogicalObjectPlain>>(logicalObject);
    //                 const key = akeyType.length===1 ? akeyType[0] : undefined;
    //                 let type = aftype.length===0 ? floughTypeModule.createNeverType()
    //                 : aftype.length===1 ? aftype[0]
    //                 : floughTypeModule.unionOfRefTypesType(aftype);
    //                 for (const t of at) type = floughTypeModule.unionWithTsTypeMutate(t, type);
    //                 // if (!discriminantFn){
    //                 //     const logicalObjectOut = inCondition ?
    //                 //         { ...logicalObject, variations: logicalObject.variations ? new Map(logicalObject.variations) : undefined, id:undefined }
    //                 //         : logicalObject;
    //                 //     const item: PropertyItem = { logicalObject: logicalObjectOut, key, type };
    //                 //     if (lookupItemTable){
    //                 //         lookupItemTable.push(item);
    //                 //     }
    //                 //     return item;
    //                 // }

    //                 //const dtype = true;
    //                 let item: PropertyItem;
    //                 // if (!dtype) {
    //                 //     // logicalObject will be pruned, no point in setting variation
    //                 //     item = { logicalObject: undefined, key, type: floughTypeModule.createNeverType() };
    //                 // }
    //                 // else
    //                 {
    //                     // discriminatFn && !inCondition, seems unlikely but allowed ... more likely to be a coding mistake.
    //                     // Debug.assert(inCondition || !discriminantFn); // TODO: for the moment - if this triggers incorrectly, remove it.
    //                     // eslint-disable-next-line prefer-const -- have to make it mutable to set variations.
    //                     if (inCondition && key){
    //                         const logicalObjectOut: FloughLogicalObjectPlain = {
    //                             ...logicalObject, variations: logicalObject.variations ? new Map(logicalObject.variations) : new Map(), id: nextLogicalObjectInnerId++,
    //                             [essymbolFloughLogicalObject]: true };
    //                         logicalObjectOut.variations!.set(key, type);
    //                         item = { logicalObject: logicalObjectOut, key, type };
    //                     }
    //                     else {
    //                         item = { logicalObject, key, type };
    //                     }
    //                 }
    //                 if (lookupItemTable){
    //                     lookupItemTable.push(item);
    //                 }
    //                 return item;
    //             };


    //             const objType = logicalObject.tsType;
    //             if (checker.isArrayOrTupleType(objType)) {
    //                 if (checker.isArrayType(objType)) {
    //                     /**
    //                      * An array type cannot be narrowed because actual index is not tracked.
    //                      * Still, the base type can be tracked so that gets put in the table.
    //                      */
    //                     const elemType = checker.getElementTypeOfArrayType(objType);
    //                     Debug.assert(elemType); // When is this undefined?

    //                     const item: PropertyItem = { logicalObject, key: undefined, type: elemType };
    //                     if (lookupItemTable) {
    //                         lookupItemTable.push(item);
    //                     }
    //                     return item;
    //                 }
    //                 else {
    //                     const objType = logicalObject.tsType;
    //                     assertCastType<TupleTypeReference>(objType);
    //                     const akeyType = floughTypeModule.getLiteralNumberTypes(lookupkey);
    //                     const akey = akeyType?.map(lt => lt.value) as number[];
    //                     const tupleElements = checker.getTypeArguments(objType);
    //                     const elementFlags = objType.target.elementFlags;
    //                     const hasRest = (elementFlags[elementFlags.length-1] & ElementFlags.Rest);
    //                     if (!akey || akey.length === 0) {
    //                         /**
    //                          * There are no keys because either:
    //                          * (a) the key type was generic number type, or
    //                          *     -> return the union of the tuple element types
    //                          * (b) the key type was the wrong type, not a number type
    //                          *     -> return undefinedType rather than neverType because that will behave better for the user (less cascading errors, ... maybe)
    //                          *
    //                          */
    //                         if (!floughTypeModule.hasNumberType(lookupkey)) {
    //                             const type = floughTypeModule.createUndefinedType();
    //                             const item: PropertyItem = { logicalObject, key: undefined, type };
    //                             // The key type was not a number type, the checker may produce an error, but we treat it here as an undefined type.
    //                             if (lookupItemTable) {
    //                                 lookupItemTable.push(item);
    //                             }
    //                             return item;
    //                         }
    //                         /**
    //                          * Undefined is included in the union because number includes invalid tuple indices.
    //                          */
    //                         const tstype = checker.getUnionType([...tupleElements, checker.getUndefinedType()]);
    //                         const type = floughTypeModule.createFromTsType(tstype);
    //                         const item: PropertyItem = { logicalObject, key: undefined, type };
    //                         if (lookupItemTable) {
    //                             lookupItemTable.push(item);
    //                         }
    //                         return item;
    //                     }
    //                     else {
    //                         Debug.assert(akeyType && akeyType.length === akey.length);
    //                         const at: Type[] = [];
    //                         const aftype: FloughType[] = [];
    //                         let addUndefined = false;
    //                         // eslint-disable-next-line @typescript-eslint/prefer-for-of
    //                         for (let i=0; i<akey.length; i++) {
    //                         // for (const k of akey) {
    //                             let ft;
    //                             if (ft = logicalObject.variations?.get(akeyType[i])){
    //                                 aftype.push(ft);
    //                                 continue;
    //                             }
    //                             const k=akey[i];
    //                             let t: Type | undefined;
    //                             let undef: boolean | undefined;
    //                             if (k < tupleElements.length) {
    //                                 t = tupleElements[k];
    //                                 undef = !!(elementFlags[k] & (ElementFlags.Optional|ElementFlags.Rest));
    //                                 // at.push(tupleElements[k]);
    //                                 // addUndefined ||= !!(elementFlags[k] & (ElementFlags.Optional|ElementFlags.Rest));
    //                             }
    //                             else if (hasRest) {
    //                                 t = tupleElements[tupleElements.length-1];
    //                                 undef = !!(elementFlags[elementFlags.length-1] & (ElementFlags.Optional|ElementFlags.Rest));
    //                                 // at.push(tupleElements[tupleElements.length-1]);
    //                                 // addUndefined = true;
    //                             }
    //                             else undef = true;
    //                             if (t) at.push(t);
    //                             addUndefined ||= undef;
    //                         }
    //                         if (addUndefined) at.push(checker.getUndefinedType());
    //                         return helper(at, aftype, akeyType);
    //                     }
    //                 }
    //                 Debug.fail("unexpected");
    //             }
    //             else {
    //                 const objType = logicalObject.tsType;
    //                 const akeyType = floughTypeModule.getLiteralStringTypes(lookupkey);
    //                 const akey = akeyType?.map(x=>x.value);
    //                 if (!akey || akey.length === 0) {
    //                     if (!floughTypeModule.hasStringType(lookupkey)) {
    //                         const type = floughTypeModule.createUndefinedType();
    //                         const item: PropertyItem = { logicalObject, key: undefined, type };
    //                         // The key type was not a string type, the checker may produce an error, but we treat it here as an undefined type.
    //                         if (lookupItemTable) {
    //                             lookupItemTable.push(item);
    //                         }
    //                         return item;
    //                     }
    //                     else {
    //                         // Do the same thing for the union of ALL keys - assuming this an checker error, but we treat it here as an undefined type.
    //                         // TODO: look up the string index type and return that.
    //                         const type = floughTypeModule.createUndefinedType();
    //                         const item: PropertyItem = { logicalObject, key: undefined, type };
    //                         // The key type was not a string type, the checker may produce an error, but we treat it here as an undefined type.
    //                         if (lookupItemTable) {
    //                             lookupItemTable.push(item);
    //                         }
    //                         return item;
    //                     }
    //                 }
    //                 else {
    //                     const at: Type[] = [];
    //                     const aftype: FloughType[] = [];
    //                     {
    //                         let addUndefined = false;
    //                         // eslint-disable-next-line @typescript-eslint/prefer-for-of
    //                         for (let i=0; i<akey.length; i++) {
    //                             let ft;
    //                             if (ft = logicalObject.variations?.get(akeyType![i])){
    //                                 aftype.push(ft);
    //                                 continue;
    //                             }
    //                             const keystring = akey[i];
    //                             const propSymbol = checker.getPropertyOfType(objType,keystring as string);
    //                             let undef = false;
    //                             let propType: Type = checker.getUndefinedType();
    //                             if (propSymbol) {
    //                                 propType = checker.getTypeOfSymbol(propSymbol);
    //                                 undef = !!(propSymbol.flags & SymbolFlags.Optional);
    //                                 //at.push(propType);
    //                             }
    //                             else addUndefined = true;
    //                             // let got;
    //                             // if (got = variations?.get(akeyType![i])) {
    //                             //     if (!propType) propType = checker.getNeverType();
    //                             //     if (undef) propType = checker.getUnionType([propType, checker.getUndefinedType()]);
    //                             //     let tmpType = floughTypeModule.createFromTsType(propType);
    //                             //     //if (undef && !floughTypeModule.hasUndefined(got)) undef = false;
    //                             //     tmpType = floughTypeModule.intersectionWithFloughTypeMutate(got, tmpType);
    //                             //     propType = floughTypeModule.getTypeFromRefTypesType(tmpType);
    //                             //     undef = false; // is already in t, if present.
    //                             // }
    //                             at.push(propType);
    //                             addUndefined ||= undef;
    //                         }
    //                         if (addUndefined) at.push(checker.getUndefinedType());
    //                     }
    //                     return helper(at, aftype, akeyType!);
    //                 }
    //             }
    //         }
    //         else if (logicalObject.kind === FloughLogicalObjectKind.tsintersection) {
    //             debugger;
    //             Debug.fail("not yet implemented");
    //         }
    //         else if (logicalObject.kind === FloughLogicalObjectKind.tsunion || logicalObject.kind === FloughLogicalObjectKind.union) {
    //             // eslint-disable-next-line prefer-const
    //             let maybe = true;
    //             if (maybe) Debug.fail("not yet implemented");
    //             const propItems = logicalObject.items.map(worker);
    //             if (extraAsserts) Debug.assert(propItems.every(x=>x.key===propItems[0].key));
    //             const key = propItems[0].key;
    //             const type = propItems.length===1 ? propItems[0].type : floughTypeModule.unionOfRefTypesType(propItems.map(x=>x.type));
    //             const item: PropertyItem = { logicalObject, key, type };
    //             if (lookupItemTable) lookupItemTable.push(item);
    //             return item;
    //         }
    //         else {
    //             Debug.fail("unexpected");
    //         }
    //     } // end of worker
    //     return worker(logicalObjectTop);
    // } // end of logicalObjectForEachTypeOfPropertyLookupOLD



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

    function logicalObjectDuplicateBaseAndJoinTypeInner(
        logicalObjectTop: Readonly<FloughLogicalObjectInner>,
        key: LiteralTypeNumber | LiteralTypeString,
        lookupItemTable: Readonly<LogicalObjectInnerForEachTypeOfPropertyLookupItem[]>):
    FloughLogicalObjectInner {
        //type LookupItem = LogicalObjectInnerForEachTypeOfPropertyLookupItem;
        function worker(logicalObject: Readonly<FloughLogicalObjectInner>): FloughLogicalObjectInner {
            const lookupItem = lookupItemTable.find(x=>x.logicalObject===logicalObject);
            if (!lookupItem?.key) return logicalObject;

            if (logicalObject.kind==="plain"){
                if (checker.isArrayOrTupleType(logicalObject.tsType)){
                    if (extraAsserts){
                        Debug.assert(isLiteralTypeNumber(key));
                        Debug.assert(checker.isTupleType(logicalObject.tsType));
                    }
                    const variations: Variations = logicalObject.variations ? new Map(logicalObject.variations) : new Map();
                    variations.set(key, lookupItem.type);
                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                    return <FloughLogicalObjectPlain>{ ...logicalObject, variations, id: nextLogicalObjectInnerId++ };
                }
                else {
                    Debug.fail("not yet implemented");
                }
            }
            else if (logicalObject.kind==="union" || logicalObject.kind==="tsunion"){
                let change = false;
                const items = logicalObject.items.map(x=>{
                    const y = worker(x);
                    if (x!==y) change = true;
                    return y;
                });
                if (!change) return logicalObject;
                return { ...logicalObject, items, id: nextLogicalObjectInnerId++ };
            }
            else if (logicalObject.kind==="intersection" || logicalObject.kind==="tsintersection"|| logicalObject.kind==="difference"){
                Debug.fail("not yet implemented");
            }
            else {
                Debug.fail("not yet implemented");
            }
        }
        return worker(logicalObjectTop);
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

    function replaceTypeAtKey(logicalObject: Readonly<FloughLogicalObjectInner>, key: LiteralType, modifiedType: Readonly<FloughType>): FloughLogicalObjectInner {
        if (logicalObject.kind!=="plain"){
            Debug.fail("unexpected logicalObject.kind!=='plain'");
        }
        const variations = logicalObject.variations ? new Map(logicalObject.variations) : new Map();
        variations.set(key, modifiedType);
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        return <FloughLogicalObjectPlain>{ ...logicalObject, variations, id: nextLogicalObjectInnerId++ };
    }
    // function getVariationTypeAtIndexFromBase(logicalObjectBaseIn: Readonly<FloughLogicalObjectInner>, key: LiteralType): FloughType | undefined {
    //     if (logicalObjectBaseIn.kind!=="plain"){
    //         Debug.fail("unexpected logicalObject.kind!=='plain'");
    //     }
    //     return logicalObjectBaseIn.variations?.get(key);
    // }
    function getTypeAtIndexFromBase(logicalObjectBaseIn: Readonly<FloughLogicalObjectInner>, key: LiteralType): { literalKey?: LiteralType | undefined,  type: FloughType } {
        function typeContainsUndefined(type: Readonly<Type>): boolean {
            return !!(((type.flags & TypeFlags.Union) && (type as UnionType).types.some(x=>!!(x.flags & TypeFlags.Undefined)))
            || (type.flags & TypeFlags.Undefined));
        }
        if (logicalObjectBaseIn.kind!=="plain"){
            Debug.fail("unexpected logicalObject.kind!=='plain'");
        }
        {
            const type = logicalObjectBaseIn.variations?.get(key);
            if (type) return { type };
        }
        const baseType = logicalObjectBaseIn.tsType;
        if (checker.isArrayOrTupleType(baseType)){
            if (checker.isTupleType(baseType)){
                if (!isLiteralTypeNumber(key)) {
                    return { type: floughTypeModule.createUndefinedType() };
                }
                const index = key.value as number;
                assertCastType<TupleTypeReference>(baseType);
                const tupleElements = checker.getTypeArguments(baseType);
                const elementFlags = baseType.target.elementFlags;
                const hasRest = !!(elementFlags[elementFlags.length-1] & ElementFlags.Rest);
                let undef = false;
                let tstype: Type;
                if (index<tupleElements.length) {
                    tstype = tupleElements[index];
                    undef = !!(elementFlags[index] & (ElementFlags.Optional | ElementFlags.Rest));
                    if (extraAsserts) {
                        if (undef) Debug.assert(typeContainsUndefined(tstype), "tuple type does not include undefined");
                    }
                }
                else if (hasRest) {
                    tstype = tupleElements[tupleElements.length-1];
                    undef = true;
                    if (extraAsserts) {
                        if (undef) Debug.assert(typeContainsUndefined(tstype), "tuple type does not include undefined");
                    }
                }
                else tstype = checker.getUndefinedType();
                // is this necessary or is the undefined type already included in the tuple type?
                //if (undef) tstype = checker.getUnionType([tstype,checker.getUndefinedType()]);
                const tstypes = undef ? [tstype,checker.getUndefinedType()] : [tstype];
                return { literalKey: key, type: floughTypeModule.createFromTsTypes(tstypes) };

                /**
                 * TODO: if the type already included undefined (i.e. the above asserts do not fail) , then we could do the following:
                 */
                // const type = tupleElements[index] ?? hasRest ? tupleElements[tupleContext.tupleElements.length-1] : undefined;

            }
            else {
                Debug.fail("not yet implemented; array type");
            }
        }
        else {
            Debug.fail("not yet implemented; non-array/tuple object type");
        }
    } // end of getTypeAtIndexFromBase

    function replaceOrFilterLogicalObjects(logicalObjectIn: Readonly<FloughLogicalObjectInner>, mapTsTypeToLogicalObjectBasic: Readonly<ESMap<Type,FloughLogicalObjectBasic>>): FloughLogicalObjectInner | undefined {
        function replaceOrFilter(logicalObject: Readonly<FloughLogicalObjectInner>): FloughLogicalObjectInner | undefined{
            if (logicalObject.kind==="plain"){
                // replace or filter - not present in map means it should be filtered
                const logicalObjectNew = mapTsTypeToLogicalObjectBasic.get(logicalObject.tsType);
                return logicalObjectNew;
            }
            else if (logicalObject.kind==="union" || logicalObject.kind==="tsunion"){
                let change = false;
                const items = logicalObject.items.map(x=>{
                    const y = replaceOrFilter(x);
                    if (x!==y) change = true;
                    return y;
                }).filter(x=>x!==undefined) as FloughLogicalObjectInner[];
                if (!change) return logicalObject;
                if (items.length===0) return undefined;
                if (logicalObject.kind==="union" && items.length===1) return items[0]; // tsunion is preserved for its original tstype (unless empty)
                return { ...logicalObject, items, id: nextLogicalObjectInnerId++ };
            }
            else if (logicalObject.kind==="intersection" || logicalObject.kind==="tsintersection"|| logicalObject.kind==="difference"){
                Debug.fail("not yet implemented");
            }
            else {
                Debug.fail("not yet implemented");
            }
        }
        return replaceOrFilter(logicalObjectIn);
    }
    function getTypeFromAssumedBaseLogicalObject(logicalObject: Readonly<FloughLogicalObjectInner>): Type {
        if (logicalObject.kind!=="plain"){
            Debug.fail("unexpected logicalObject.kind!=='plain'");
        }
        return logicalObject.tsType;
    }

    function identicalBaseTypes(logicalObject1: Readonly<FloughLogicalObjectInner>, logicalObject2: Readonly<FloughLogicalObjectInner>): boolean {
        if (logicalObject1.kind!==FloughLogicalObjectKind.plain || logicalObject2.kind!==FloughLogicalObjectKind.plain){
            Debug.fail("unexpected logicalObject.kind!=='plain'");
        }

        if (logicalObject1===logicalObject2 || logicalObject1.tsType===logicalObject2.tsType) return true; // this could be true depending on variations.
        return false;
    }

    type FloughLogicalObjectBasic = FloughLogicalObjectPlain;
    function getBaseLogicalObjects(logicalObjectTop: Readonly<FloughLogicalObjectInner>): ESMap<Type, FloughLogicalObjectBasic> {
        const result = new Map<Type,FloughLogicalObjectBasic>();
        function worker(logicalObject: Readonly<FloughLogicalObjectInner>): void {
            if (logicalObject.kind === FloughLogicalObjectKind.plain) {
                result.set(logicalObject.tsType,logicalObject);
            }
            else if (logicalObject.kind === FloughLogicalObjectKind.tsintersection) {
                Debug.fail("not yet implemented");
            }
            else if (logicalObject.kind === FloughLogicalObjectKind.tsunion || logicalObject.kind === FloughLogicalObjectKind.union) {
                logicalObject.items.forEach(worker);
            }
            else {
                Debug.fail("unexpected");
            }
        }
        worker(logicalObjectTop);
        return result;
    }



    function unionOfSameBaseTypesWithVariations(arr: Readonly<FloughLogicalObjectInner[]>): FloughLogicalObjectPlain {
        assertCastType<Readonly<FloughLogicalObjectPlain[]>>(arr);
        if (arr.length===0) Debug.fail("unexpected arr.length===0");
        if (extraAsserts){
            for (const logicalObject of arr){
                if (logicalObject.kind!=="plain"){
                    Debug.fail("unexpected logicalObject.kind!=='plain'");
                }
                if (logicalObject.tsType!==arr[0].tsType) Debug.fail("unexpected !logicalObject.variations");
            }
        }
        if (arr.length===1) return arr[0];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0; i<arr.length; i++){
            if (arr[i].variations===undefined) return arr[i];
        }
        const isect: Variations = arr[0].variations!;
        for (let i=1; isect.size!==0 && i<arr.length; i++){
            const vari = arr[i].variations!;
            for (let iter=isect.entries(), next=iter.next(); !next.done; next=iter.next()){
                const got = vari.get(next.value[0]);
                if (got===undefined) {
                    isect.delete(next.value[0]);
                }
                else {
                    const type = floughTypeModule.cloneRefTypesType(next.value[1]);
                    floughTypeModule.intersectionWithFloughTypeMutate(got, type);
                    if (floughTypeModule.isNeverType(type)) isect.delete(next.value[0]);
                    else isect.set(next.value[0], type);
                }
            }
        }
        const ret: FloughLogicalObjectPlain = { kind: FloughLogicalObjectKind.plain, tsType: arr[0].tsType, id: nextLogicalObjectInnerId++, [essymbolFloughLogicalObject]: true };
        if (isect.size!==0) ret.variations = isect;
        return ret;
    }

    type Collated = & {
        arrLiteralKeyIn?: (LiteralType | undefined)[];
        logicalObjectsIn: Readonly<FloughLogicalObjectInner[]>;
        logicalObjectsPlainOut: Readonly<FloughLogicalObjectPlain>[];
        mapTsTypeToLogicalObjectPlainOutIdx: ESMap<Type,number>;
        mapTsTypeToLogicalObjectsInIdx: ESMap<Type,number[]>;
        //reverseMap: { inIdx: number, idxInIn: number }[][]; //
    };

    function collateByBaseType(logicalObjectsIn: Readonly<FloughLogicalObjectInner[]>): Collated {
        // const baseLogicalObjects: FloughLogicalObjectInnerIF[] = [];
        // const nonObjTypes: FloughType[]=[];
        //type Value = & { rootIdx: number, idxInRoot: number, logicalObject: FloughLogicalObjectPlain };
        const map = new Map<Type,FloughLogicalObjectBasic[]>();
        //const remap = new Map<FloughLogicalObjectBasic,FloughLogicalObjectBasic>();
        //const arrmap2: (ESMap<Type,FloughLogicalObjectBasic> | undefined)[]=[];
        const mapTsTypeToLogicalObjectsInIdx = new Map<Type,number[]>();
        logicalObjectsIn.forEach((root, _iroot)=>{
            const {logicalObject,remaining} = floughTypeModule.splitLogicalObject(root);
            if (logicalObject) {
                if (_iroot===0) { //baseLogicalObjects.push(...getBaseLogicalObjects(root));
                    //const map2 = (arrmap2[_iroot] = getBaseLogicalObjects(root));
                    const map2 = getBaseLogicalObjects(root);
                    map2.forEach((logobj,tsType)=>{
                        mapTsTypeToLogicalObjectsInIdx.set(tsType,[_iroot]);
                        map.set(tsType, [logobj]);
                    });
                }
                else {
                    const map2 = getBaseLogicalObjects(root);
                    map2.forEach((logobj,tsType)=>{
                        const got = map.get(logobj.tsType);
                        if (!got) map.set(logobj.tsType, [logobj]);
                        else got.push(logobj);
                        const got2 = mapTsTypeToLogicalObjectsInIdx.get(tsType);
                        if (!got2) mapTsTypeToLogicalObjectsInIdx.set(tsType, [_iroot]);
                        else got2.push(_iroot);
                    });
                }
            }
        });
        const collated: Collated = { logicalObjectsIn, logicalObjectsPlainOut: [], mapTsTypeToLogicalObjectPlainOutIdx: new Map(), mapTsTypeToLogicalObjectsInIdx };
        map.forEach((value,_key)=>{
            if (value.length===1) {
                collated.mapTsTypeToLogicalObjectPlainOutIdx.set(value[0].tsType, collated.logicalObjectsPlainOut.length);
                //collated.mapPlainOutIdxToInIdx.set(collated.logicalObjectsPlainOut.length, value[0].id);
                collated.logicalObjectsPlainOut.push(value[0]);
                //collated.reverseMap.push([{ inIdx:value[0].rootIdx, idxInIn:value[0].idxInRoot }]);
            }
            else {
                //const logicalObjects = value.map(x=>x.logicalObject);
                collated.mapTsTypeToLogicalObjectPlainOutIdx.set(value[0].tsType, collated.logicalObjectsPlainOut.length);
                const logicalObjectU = unionOfSameBaseTypesWithVariations(value);
                collated.logicalObjectsPlainOut.push(logicalObjectU);
                //collated.reverseMap.push(value.map(x=>({ inIdx:x.rootIdx, idxInIn:x.idxInRoot })));
            }
        });
        return collated;
    }


    export type LiteralKeyAndType = & { literalKey?: LiteralType | undefined, type: FloughType };
    export type LogicalObjectAccessReturn = & {
        roots: Readonly<FloughLogicalObjectInner[]>;
        collated: Readonly<Collated[]>;
        aLiterals: (LiteralType | undefined)[];
        finalTypes: Readonly<LiteralKeyAndType[]>;
    };
    function logicalObjectAccess(
        roots: Readonly<FloughLogicalObjectInner[]>,
        akey: Readonly<FloughType[]>,
        // aexpression: Readonly<Expression[]>,
        // groupNodeToTypeMap: ESMap<Node,Type>,
    ): LogicalObjectAccessReturn {
        function getLiteralKey(kt: Readonly<FloughType>): LiteralType | undefined {
            let aklits = floughTypeModule.getLiteralNumberTypes(kt);
            if (!aklits) aklits = floughTypeModule.getLiteralStringTypes(kt);
            if (aklits?.length===1) return aklits[0];
            return undefined;
        }

        let collated0 = collateByBaseType(roots);
        const acollated: Collated[] = [collated0];
        const aLiterals: (LiteralType | undefined)[] = [];
        let finalLiteralKeyAndType: { literalKey?: LiteralType | undefined, type: FloughType }[];
        for (let i=0, ie=akey.length-1; i!==ie; i++){
            const nextKey = getLiteralKey(akey[i]);
            aLiterals.push(nextKey);
            //const nextTypes: FloughType[] = [];
            const nextKeyAndType: { literalKey?: LiteralType | undefined, type: FloughType }[] = [];
            if (nextKey){
                for (let j=0, je=collated0.logicalObjectsPlainOut.length; j!==je; j++){
                    nextKeyAndType.push(getTypeAtIndexFromBase(collated0.logicalObjectsPlainOut[j], nextKey));
                }
            }
            else {
                for (let j=0, je=collated0.logicalObjectsPlainOut.length; j!==je; j++){
                    nextKeyAndType.push({ type: getTypeOverIndicesFromBase(collated0.logicalObjectsPlainOut[j]) as FloughType });
                }
            }
            if (i<akey.length-1){
                collated0 = collateByBaseType(nextKeyAndType.map(x=>floughTypeModule.splitLogicalObject(x.type).logicalObject).filter(x=>x!==undefined) as FloughLogicalObjectInner[]);
                collated0.arrLiteralKeyIn = nextKeyAndType.map(x=>x.literalKey);
                acollated.push(collated0);
            }
            else {
                finalLiteralKeyAndType = nextKeyAndType;
            }
        }
        return { roots, collated: acollated, aLiterals, finalTypes: finalLiteralKeyAndType! };
    }

    function logicalObjectModify(
        modTypesIn: Readonly<(FloughType | undefined)[]>,
        state: LogicalObjectAccessReturn,
    ): { rootLogicalObject: FloughLogicalObjectBasic, type: Readonly<FloughType> }[] {

        const results: { rootLogicalObject: FloughLogicalObjectInner, type: Readonly<FloughType> }[] = [];

        let defaultRoot: FloughLogicalObjectInner | undefined;
        function calcDefaultRoot(): FloughLogicalObjectInner {
            return defaultRoot ?? (defaultRoot=state.roots.length===1 ? state.roots[0] : floughLogicalObjectInnerModule.unionOfFloughLogicalObjects(state.roots) as FloughLogicalObjectInner);
        }

        Debug.assert(modTypesIn.length===state.finalTypes.length);
        Debug.assert(state.collated[state.collated.length-1].logicalObjectsPlainOut.length ===state.finalTypes.length);
        Debug.assert(state.collated.length===state.aLiterals.length-1);
        for (let modTypeIdx = 0; modTypeIdx<modTypesIn.length; modTypeIdx++){
            // check presence of keys all the way down
            if (state.finalTypes[modTypeIdx].literalKey===undefined) {
                results.push({ rootLogicalObject: calcDefaultRoot(), type: state.finalTypes[modTypeIdx].type });
                continue;
        }
            /**
             * Check that all paths to the root have a single key at each level.
             */
            {
                let childidxs: number[] = [modTypeIdx];
                let ok = true;
                checkkey:
                for (let lev = state.collated.length-1; ok && lev>=1; lev--){
                    const nextchildidxs = new Set<number>();
                    const coll = state.collated[lev];
                    Debug.assert(coll.arrLiteralKeyIn);
                    const arrlogicalObjectBasic = coll.logicalObjectsPlainOut;
                    //let parentindxs: number[];
                    for (const childidx of childidxs){
                        const parentindxs = coll.mapTsTypeToLogicalObjectsInIdx.get(arrlogicalObjectBasic[childidx].tsType)!;
                        for (const parentidx of parentindxs){
                            if (!coll.arrLiteralKeyIn[parentidx]) {
                                ok = false;
                                break checkkey;
                            }
                            nextchildidxs.add(parentidx);
                        };
                    }
                    childidxs = [];
                    nextchildidxs.forEach(x=>childidxs.push(x));
                }
                if (!ok) {
                    // TODO: output original root, and modified type
                    results.push({ rootLogicalObject: calcDefaultRoot(), type: state.finalTypes[modTypeIdx].type });
                    continue;
                }
            }
            /**
             * Enforce a unique rootlet by creating a creating new pathlets from the final modified type back to the root.
             *
             */
            {
                // First layer is irregular
                let coll = state.collated[state.collated.length-1];
                const oldLogicObjectBasic = coll.logicalObjectsPlainOut[modTypeIdx];
                const newLogicalObjectBasic: (FloughLogicalObjectBasic | undefined) = modTypesIn[modTypeIdx] ? replaceTypeAtKey(
                    coll.logicalObjectsPlainOut[modTypeIdx],
                    state.finalTypes[modTypeIdx].literalKey!, modTypesIn[modTypeIdx]!) as FloughLogicalObjectPlain : undefined;
                if (!newLogicalObjectBasic) {
                    continue;
                }
                if (state.collated.length===1) {
                    results.push({ rootLogicalObject: newLogicalObjectBasic, type: state.finalTypes[modTypeIdx].type });
                    continue;
                }
                let arrChildLogicalObjectBasicIndxs: number[] = coll.mapTsTypeToLogicalObjectsInIdx.get(oldLogicObjectBasic.tsType)!;
                let arrNewLogicalObjectIn: FloughLogicalObjectInner[];

                arrChildLogicalObjectBasicIndxs.forEach(inIndx=>{
                    const x = replaceOrFilterLogicalObjects(
                        coll.logicalObjectsIn[inIndx],
                        new Map<Type,FloughLogicalObjectBasic>([[oldLogicObjectBasic.tsType,newLogicalObjectBasic]])
                    ) as FloughLogicalObjectInner;
                    arrNewLogicalObjectIn[inIndx] = x;
                });


                // let coll = state.collated[state.collated.length-1];
                // let newchildlogobj: FloughLogicalObjectPlain = replaceTypeAtKey(coll.logicalObjectsPlainOut[modTypeIdx], childklits[modTypeIdx], childtypes[modTypeIdx]);
                for (let lev = state.collated.length-2; lev>=0; lev--){
                    const childcoll = state.collated[lev+1];
                    coll = state.collated[lev];
                    const arrNewLogicalObjectBasic: FloughLogicalObjectBasic[] = [];
                    arrChildLogicalObjectBasicIndxs.forEach(basicIdx=>{
                        arrNewLogicalObjectBasic[basicIdx] = replaceLogicalObjectOfTypeAtKey(
                            coll.logicalObjectsPlainOut[basicIdx],
                            childcoll.arrLiteralKeyIn![basicIdx],
                            arrNewLogicalObjectIn[basicIdx]) as FloughLogicalObjectBasic;
                    });
                    if (lev===0) {
                        const arr: FloughLogicalObjectBasic[] = [];
                        arrChildLogicalObjectBasicIndxs.forEach(basicIdx=>arr.push(arrNewLogicalObjectBasic[basicIdx]));
                        results.push({ rootLogicalObject: unionOfFloughLogicalObjects(arr) as FloughLogicalObjectInner, type: state.finalTypes[modTypeIdx].type });
                        break;
                    }
                    const nextChildLogicalObjectBasicIndxs = new Set<number>();
                    arrChildLogicalObjectBasicIndxs.forEach(basicIdx=>{
                        coll.mapTsTypeToLogicalObjectsInIdx.get(coll.logicalObjectsPlainOut[basicIdx].tsType)!.forEach(x=>nextChildLogicalObjectBasicIndxs.add(x));
                    });
                    arrChildLogicalObjectBasicIndxs = [];
                    nextChildLogicalObjectBasicIndxs.forEach(x=>arrChildLogicalObjectBasicIndxs.push(x));

                    arrChildLogicalObjectBasicIndxs.forEach(inIndx=>{
                    const x = replaceOrFilterLogicalObjects(
                        coll.logicalObjectsIn[inIndx],
                        new Map<Type,FloughLogicalObjectBasic>([[oldLogicObjectBasic.tsType,newLogicalObjectBasic]])
                    ) as FloughLogicalObjectInner;
                    arrNewLogicalObjectIn[inIndx] = x;
                });

                }
            }


        }

    }


    function dbgLogicalObjectToStrings(logicalObjectTop: FloughLogicalObjectInnerIF): string[] {
        const as: string[] = [];
        assertCastType<FloughLogicalObjectInner>(logicalObjectTop);
        let indent = 0;

        function dbgLogicalObjectToStringsAux(logicalObject: FloughLogicalObjectInner){
            const pad = " ".repeat(indent);
            indent+=4;
            const lenin = as.length;
            Debug.assert(logicalObject.id);
            as.push(pad+`id: ${logicalObject.id}`);
            as.push("  kind: "+logicalObject.kind);
            if (logicalObject.kind === "plain") {
                // as.push(` logicalObject.item.objectTypeInstanceId: ${logicalObject.item.objectTypeInstanceId}`);
                as.push("  logicalObject.tsType: "+dbgs.dbgTypeToString(logicalObject.tsType));
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
