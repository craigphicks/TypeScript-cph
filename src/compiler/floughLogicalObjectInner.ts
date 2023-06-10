
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
        createFloughLogicalObjectPlain(tstype: ObjectType): FloughLogicalObjectPlain;
        createFloughLogicalObjectTsunion(unionType: Readonly<UnionType>, items: Readonly<FloughLogicalObjectInnerIF[]>): FloughLogicalObjectTsunion;
        createFloughLogicalObjectTsintersection(intersectionType: Readonly<IntersectionType>, items: Readonly<FloughLogicalObjectInnerIF[]>): FloughLogicalObjectTsintersection;
        createFloughLogicalObject(tsType: Type): FloughLogicalObjectInnerIF;
        unionOfFloughLogicalObject(a: FloughLogicalObjectInnerIF, b: FloughLogicalObjectInnerIF): FloughLogicalObjectInner;
        intersectionOfFloughLogicalObject(a: FloughLogicalObjectInnerIF, b: FloughLogicalObjectInnerIF): FloughLogicalObjectInner;
        intersectionOfFloughLogicalObjects(...arrobj: FloughLogicalObjectInnerIF[]): FloughLogicalObjectInner;
        differenceOfFloughLogicalObject(minuend: FloughLogicalObjectInnerIF, subtrahend: FloughLogicalObjectInnerIF): FloughLogicalObjectInner;
        intersectionWithLogicalObjectConstraint(logicalObjectTop: Readonly<FloughLogicalObjectInnerIF>, logicalObjectConstraint: Readonly<FloughLogicalObjectInnerIF>): FloughLogicalObjectInnerIF | undefined;
        getTsTypeFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectInnerIF>): Type;
        logicalObjectAccess(
            roots: Readonly<FloughType[]>,
            akey: Readonly<FloughType[]>,
        ): LogicalObjectAccessReturn;
        getTypesFromLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>): Readonly<FloughType[]>;
        logicalObjectModify(
            types: Readonly<(FloughType | undefined)[]>,
            state: LogicalObjectAccessReturn,
        ): { rootLogicalObject: FloughLogicalObjectInner, type: Readonly<FloughType> }[];
        getTsTypesInChainOfLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, idx: number): Type[][];
        dbgLogicalObjectToStrings(logicalObjectTop: FloughLogicalObjectInnerIF): string[];
    };
    export const floughLogicalObjectInnerModule: FloughLogicalObjectInnerModule = {
        createFloughLogicalObjectPlain,
        createFloughLogicalObjectTsunion,
        createFloughLogicalObjectTsintersection,
        createFloughLogicalObject,
        unionOfFloughLogicalObject,
        intersectionOfFloughLogicalObject,
        intersectionOfFloughLogicalObjects,
        differenceOfFloughLogicalObject,
        intersectionWithLogicalObjectConstraint,
        getTsTypeFromLogicalObject,
        logicalObjectAccess,
        getTypesFromLogicalObjectAccessReturn,
        logicalObjectModify,
        getTsTypesInChainOfLogicalObjectAccessReturn,
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


    function unionOfFloughLogicalObject(a: Readonly<FloughLogicalObjectInner>, b: Readonly<FloughLogicalObjectInner>): FloughLogicalObjectInner {
        // assertCastType<FloughLogicalObjectInner>(a);
        // assertCastType<FloughLogicalObjectInner>(b);
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
    function unionOfFloughLogicalObjects(arr: Readonly<FloughLogicalObjectInner[]>): FloughLogicalObjectInner {
        Debug.assert(arr.length);
        if (arr.length===1) return arr[0];
        return arr.reduce((accum,curr)=>unionOfFloughLogicalObject(accum,curr),arr[0]);
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
            Debug.assert(logicalObject);
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

    // function logicalObjectDuplicateBaseAndJoinTypeInner(
    //     logicalObjectTop: Readonly<FloughLogicalObjectInner>,
    //     key: LiteralTypeNumber | LiteralTypeString,
    //     lookupItemTable: Readonly<LogicalObjectInnerForEachTypeOfPropertyLookupItem[]>):
    // FloughLogicalObjectInner {
    //     //type LookupItem = LogicalObjectInnerForEachTypeOfPropertyLookupItem;
    //     function worker(logicalObject: Readonly<FloughLogicalObjectInner>): FloughLogicalObjectInner {
    //         const lookupItem = lookupItemTable.find(x=>x.logicalObject===logicalObject);
    //         if (!lookupItem?.key) return logicalObject;

    //         if (logicalObject.kind==="plain"){
    //             if (checker.isArrayOrTupleType(logicalObject.tsType)){
    //                 if (extraAsserts){
    //                     Debug.assert(isLiteralTypeNumber(key));
    //                     Debug.assert(checker.isTupleType(logicalObject.tsType));
    //                 }
    //                 const variations: Variations = logicalObject.variations ? new Map(logicalObject.variations) : new Map();
    //                 variations.set(key, lookupItem.type);
    //                 // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    //                 return <FloughLogicalObjectPlain>{ ...logicalObject, variations, id: nextLogicalObjectInnerId++ };
    //             }
    //             else {
    //                 Debug.fail("not yet implemented");
    //             }
    //         }
    //         else if (logicalObject.kind==="union" || logicalObject.kind==="tsunion"){
    //             let change = false;
    //             const items = logicalObject.items.map(x=>{
    //                 const y = worker(x);
    //                 if (x!==y) change = true;
    //                 return y;
    //             });
    //             if (!change) return logicalObject;
    //             return { ...logicalObject, items, id: nextLogicalObjectInnerId++ };
    //         }
    //         else if (logicalObject.kind==="intersection" || logicalObject.kind==="tsintersection"|| logicalObject.kind==="difference"){
    //             Debug.fail("not yet implemented");
    //         }
    //         else {
    //             Debug.fail("not yet implemented");
    //         }
    //     }
    //     return worker(logicalObjectTop);
    // }


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

    function replaceTypeAtKey(logicalObject: Readonly<FloughLogicalObjectBasic>, key: LiteralType, modifiedType: Readonly<FloughType>): FloughLogicalObjectBasic {
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
    function replaceLogicalObjectOfTypeAtKey(logicalObjectBasic: Readonly<FloughLogicalObjectBasic>, key: LiteralType, newLogicalObjectAtKey: Readonly<FloughLogicalObjectInner>): FloughLogicalObjectBasic {
        if (logicalObjectBasic.kind!=="plain"){
            Debug.fail("unexpected logicalObject.kind!=='plain'");
        }
        const variations = logicalObjectBasic.variations ? new Map(logicalObjectBasic.variations) : new Map();
        const outer = floughLogicalObjectModule.createFloughLogicalObjectFromInner(newLogicalObjectAtKey,/*edType*/ undefined);
        variations.set(key, floughTypeModule.createTypeFromLogicalObject(outer));
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        return <FloughLogicalObjectPlain>{ ...logicalObjectBasic, variations, id: nextLogicalObjectInnerId++ };
    }

    function getTypeOverIndicesFromBase(logicalObjectBaseIn: Readonly<FloughLogicalObjectInner>, keysType: FloughType): { type: FloughType } {
        if (logicalObjectBaseIn.kind!=="plain"){
            Debug.fail("unexpected logicalObject.kind!=='plain'");
        }
        const accessKeys = floughTypeModule.getAccessKeysMutable(keysType);

        // const alitnum = floughTypeModule.getLiteralNumberTypes(keysType);
        // const alitnumset =
        // const alitstr = floughTypeModule.getLiteralStringTypes(keysType);
        // const hasnum = floughTypeModule.hasNumberType(keysType);
        // const hasstr = floughTypeModule.hasStringType(keysType);
        const aft: FloughType[]=[];
        let variations: Variations | undefined;
        if (variations=logicalObjectBaseIn.variations){
            variations.forEach((v,k)=>{
                if (k.flags & TypeFlags.Number){
                    if (accessKeys.number) {
                        if (accessKeys.number===true) aft.push(v);
                        else {
                            assertCastType<LiteralTypeNumber>(k);
                            if (accessKeys.number.has(k)){
                                aft.push(v);
                                accessKeys.number.delete(k);
                            }
                        }
                    }
                }
                else if (k.flags & TypeFlags.String){
                    if (accessKeys.string) {
                        if (accessKeys.string===true) aft.push(v);
                        else {
                            assertCastType<LiteralTypeString>(k);
                            if (accessKeys.string.has(k)){
                                aft.push(v);
                                accessKeys.string.delete(k);
                            }
                        }
                    }
                }
            });
        }
        const atstypes: Type[]=[];
        let undef = false;
        const baseType = logicalObjectBaseIn.tsType as ObjectType;
        if (checker.isArrayOrTupleType(baseType)){
            if (accessKeys.number) {
                if (checker.isTupleType(baseType)){
                    //const index = key.value as number;
                    assertCastType<TupleTypeReference>(baseType);
                    const tupleElements = checker.getTypeArguments(baseType);
                    const elementFlags = baseType.target.elementFlags;
                    const hasRest = !!(elementFlags[elementFlags.length-1] & ElementFlags.Rest);
                    //let undef = false;
                    //let atstype: Type[]=[];
                    if (accessKeys.number===true){
                        atstypes.push(...tupleElements);
                        // under what circumstances, if ever, should undefined be added here?
                    }
                    else {
                        accessKeys.number.forEach(klitnum=>{
                            const index = klitnum.value as number;

                            if (index<tupleElements.length) {
                                atstypes.push(tupleElements[index]);
                                undef ||= !!(elementFlags[index] & (ElementFlags.Optional | ElementFlags.Rest));
                            }
                            else if (hasRest) {
                                atstypes.push(tupleElements[tupleElements.length-1]);
                                undef = true;
                            }
                            else undef = true;
                        });
                    }
                }
                else {
                    const elementType = checker.getElementTypeOfArrayType(baseType); // apparently the result may be undefined;
                    Debug.assert(elementType);
                    atstypes.push(elementType);
                }
            } // accessKeys.number
        }
        else { // ought to be object
            if (accessKeys.string){
                Debug.fail("not yet implemented; object type");
            }
        }

        if (atstypes || undef){
            if (undef) atstypes.push(checker.getUndefinedType());
            aft.push(floughTypeModule.createFromTsTypes(atstypes));
        }
        switch (aft.length){
            case 0: return { type: floughTypeModule.createNeverType() };
            case 1: return { type: aft[0] };
            default: return { type: floughTypeModule.unionOfRefTypesType(aft) };
        }
        Debug.fail("");
    }

    function getTypeAtIndexFromBase(logicalObjectBaseIn: Readonly<FloughLogicalObjectInner>, key: LiteralType): { literalKey?: LiteralType | undefined, type: FloughType } {
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
                const tstype = checker.getElementTypeOfArrayType(baseType) ?? checker.getAnyType(); // apparently the result may be undefined;
                return { type: floughTypeModule.createFromTsType(tstype) };
                //Debug.fail("not yet implemented; array type");
            }
        }
        else {
            Debug.fail("not yet implemented; non-array/tuple object type");
        }
    } // end of getTypeAtIndexFromBase

    function replaceOrFilterLogicalObjects1(
        logicalObjectIn: Readonly<FloughLogicalObjectInner>,
        tstype: Readonly<Type>,
        newlogicalObjectBasic: Readonly<FloughLogicalObjectBasic>
    ): FloughLogicalObjectInner | undefined {
        function replaceOrFilter(logicalObject: Readonly<FloughLogicalObjectInner>): FloughLogicalObjectInner | undefined{
            Debug.assert(logicalObject);
            if (logicalObject.kind==="plain"){
                // replace or filter - not present in map means it should be filtered
                if (logicalObject.tsType===tstype) {
                    return newlogicalObjectBasic;
                }
                return logicalObject;
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
    function replaceOrFilterLogicalObjectsM(
        logicalObjectIn: Readonly<FloughLogicalObjectInner>,
        map: Readonly<ESMap<Type,number>>,
        arrNewlogicalObjectBasic: Readonly<FloughLogicalObjectBasic[]>
    ): FloughLogicalObjectInner | undefined {
        function replaceOrFilter(logicalObject: Readonly<FloughLogicalObjectInner>): FloughLogicalObjectInner | undefined{
            if (logicalObject.kind==="plain"){
                // replace or filter - not present in map means it should be filtered
                if (map.has(logicalObject.tsType)) {
                    return arrNewlogicalObjectBasic[map.get(logicalObject.tsType)!];
                }
                return logicalObject;
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

    // function getTypeFromAssumedBaseLogicalObject(logicalObject: Readonly<FloughLogicalObjectInner>): Type {
    //     if (logicalObject.kind!=="plain"){
    //         Debug.fail("unexpected logicalObject.kind!=='plain'");
    //     }
    //     return logicalObject.tsType;
    // }

    // function identicalBaseTypes(logicalObject1: Readonly<FloughLogicalObjectInner>, logicalObject2: Readonly<FloughLogicalObjectInner>): boolean {
    //     if (logicalObject1.kind!==FloughLogicalObjectKind.plain || logicalObject2.kind!==FloughLogicalObjectKind.plain){
    //         Debug.fail("unexpected logicalObject.kind!=='plain'");
    //     }

    //     if (logicalObject1===logicalObject2 || logicalObject1.tsType===logicalObject2.tsType) return true; // this could be true depending on variations.
    //     return false;
    // }

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
        remainingNonObjType: FloughType;
        //reverseMap: { inIdx: number, idxInIn: number }[][]; //
    };

    function collateByBaseType(typesIn: Readonly<FloughType[]>): Collated {
        // const baseLogicalObjects: FloughLogicalObjectInnerIF[] = [];
        // const nonObjTypes: FloughType[]=[];
        //type Value = & { rootIdx: number, idxInRoot: number, logicalObject: FloughLogicalObjectPlain };
        const map = new Map<Type,FloughLogicalObjectBasic[]>();
        //const remap = new Map<FloughLogicalObjectBasic,FloughLogicalObjectBasic>();
        //const arrmap2: (ESMap<Type,FloughLogicalObjectBasic> | undefined)[]=[];
        const mapTsTypeToLogicalObjectsInIdx = new Map<Type,number[]>();
        const nonObjType: FloughType = floughTypeModule.createNeverType(); //
        const logicalObjectsIn: FloughLogicalObjectInner[] = [];
        typesIn.forEach((root, _iroot)=>{
            const {logicalObject:logicalObjectOuterIF,remaining} = floughTypeModule.splitLogicalObject(root);
            floughTypeModule.unionWithFloughTypeMutate(remaining, nonObjType);
            if (logicalObjectOuterIF) {
                const logicalObject = floughLogicalObjectModule.getInnerIF(logicalObjectOuterIF) as FloughLogicalObjectInner;
                logicalObjectsIn.push(logicalObject);
                if (_iroot===0) {
                    const map2 = getBaseLogicalObjects(logicalObject);
                    map2.forEach((logobj,tsType)=>{
                        mapTsTypeToLogicalObjectsInIdx.set(tsType,[_iroot]);
                        map.set(tsType, [logobj]);
                    });
                }
                else {
                    const map2 = getBaseLogicalObjects(logicalObject);
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
        const collated: Collated = {
            logicalObjectsIn,
            logicalObjectsPlainOut: [],
            mapTsTypeToLogicalObjectPlainOutIdx: new Map(),
            mapTsTypeToLogicalObjectsInIdx,
            remainingNonObjType: nonObjType,
        };
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
        roots: Readonly<FloughType[]>;
        collated: Readonly<Collated[]>;
        aLiterals: (LiteralType | undefined)[];
        finalTypes: Readonly<LiteralKeyAndType[]>;
    };
    function logicalObjectAccess(
        roots: Readonly<FloughType[]>,
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
        for (let i=0, ie=akey.length; i!==ie; i++){
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
                    nextKeyAndType.push({ type: getTypeOverIndicesFromBase(collated0.logicalObjectsPlainOut[j], akey[i]) as FloughType });
                }
            }
            if (i<akey.length-1){
                collated0 = collateByBaseType(nextKeyAndType.map(x=>x.type).filter(x=>x!==undefined) as FloughLogicalObjectInner[]);
                collated0.arrLiteralKeyIn = nextKeyAndType.map(x=>x.literalKey);
                acollated.push(collated0);
            }
            else {
                finalLiteralKeyAndType = nextKeyAndType;
            }
        }
        return { roots, collated: acollated, aLiterals, finalTypes: finalLiteralKeyAndType! };
    }
    function getTypesFromLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>): Readonly<FloughType[]> {
        return loar.finalTypes.map(x=>x.type);
    }
    function getTsTypesInChainOfLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>): Type[][] {
        const results: Type[][] = loar.collated.map(collated=>{
            const result: Type[] = [];//[collated.remainingNonObjType];
            if (!floughTypeModule.isNeverType(collated.remainingNonObjType)){
                floughTypeModule.getTsTypesFromFloughType(collated.remainingNonObjType).forEach(x=>result.push(x));
            }
            collated.logicalObjectsPlainOut.forEach(x=>{
                result.push(x.tsType);
            });
            return result;
        });
        return results;
    }

    function logicalObjectModify(
        modTypesIn: Readonly<(FloughType | undefined)[]>,
        state: LogicalObjectAccessReturn,
    ): { rootLogicalObject: FloughLogicalObjectInner, type: Readonly<FloughType> }[] {

        const results: { rootLogicalObject: FloughLogicalObjectInner, type: Readonly<FloughType> }[] = [];

        let defaultRoot: FloughLogicalObjectInner | undefined;
        function calcDefaultRoot(): FloughLogicalObjectInner {
            if (defaultRoot) return defaultRoot;
            Debug.assert(state.collated[0].logicalObjectsPlainOut.length!==0);
            if (state.collated[0].logicalObjectsPlainOut.length===1){
                return (defaultRoot = state.collated[0].logicalObjectsPlainOut[0]);
            }
            return (defaultRoot=unionOfFloughLogicalObjects(state.collated[0].logicalObjectsPlainOut));
        }

        Debug.assert(modTypesIn.length===state.finalTypes.length);
        Debug.assert(state.collated[state.collated.length-1].logicalObjectsPlainOut.length ===state.finalTypes.length);
        Debug.assert(state.collated.length===state.aLiterals.length);
        for (let modTypeIdx = 0; modTypeIdx<modTypesIn.length; modTypeIdx++){
            // check presence of keys all the way down
            if (state.finalTypes[modTypeIdx].literalKey===undefined) {
                results.push({ rootLogicalObject: calcDefaultRoot(), type: state.finalTypes[modTypeIdx].type });
                continue;
            }
            if (!modTypesIn[modTypeIdx]) continue;
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
                    results.push({ rootLogicalObject: calcDefaultRoot(), type: modTypesIn[modTypeIdx]! });
                    continue;
                }
            }
            /**
             * Enforce a unique rootlet by creating a creating new pathlets from the final modified type back to the root.
             *
             */
            {
                let coll = state.collated[state.collated.length-1];
                let arrChildLogicalObjectBasicIndxs: number[];
                const arrNewLogicalObjectIn: FloughLogicalObjectInner[]=[];
                {
                    // First layer is irregular
                    const oldLogicObjectBasic = coll.logicalObjectsPlainOut[modTypeIdx];
                    const newLogicalObjectBasic: (FloughLogicalObjectBasic | undefined) = modTypesIn[modTypeIdx] ? replaceTypeAtKey(
                        coll.logicalObjectsPlainOut[modTypeIdx],
                        state.finalTypes[modTypeIdx].literalKey!, modTypesIn[modTypeIdx]!) : undefined;
                    if (!newLogicalObjectBasic) {
                        continue;
                    }
                    if (state.collated.length===1) {
                        results.push({ rootLogicalObject: newLogicalObjectBasic, type: modTypesIn[modTypeIdx]! });
                        continue;
                    }
                    //let arrNewLogicalObjectIn: FloughLogicalObjectInner[];
                    arrChildLogicalObjectBasicIndxs = coll.mapTsTypeToLogicalObjectsInIdx.get(oldLogicObjectBasic.tsType)!;
                    arrChildLogicalObjectBasicIndxs.forEach(inIndx=>{
                        const x = replaceOrFilterLogicalObjects1(
                            coll.logicalObjectsIn[inIndx],
                            oldLogicObjectBasic.tsType,
                            newLogicalObjectBasic
                        ) as FloughLogicalObjectInner;
                        arrNewLogicalObjectIn[inIndx] = x;
                    });
                }


                // let coll = state.collated[state.collated.length-1];
                // let newchildlogobj: FloughLogicalObjectPlain = replaceTypeAtKey(coll.logicalObjectsPlainOut[modTypeIdx], childklits[modTypeIdx], childtypes[modTypeIdx]);
                for (let lev = state.collated.length-2; lev>=0; lev--){
                    const childcoll = state.collated[lev+1];
                    coll = state.collated[lev];
                    const arrNewLogicalObjectBasic: FloughLogicalObjectBasic[] = [];
                    arrChildLogicalObjectBasicIndxs.forEach(basicIdx=>{
                        arrNewLogicalObjectBasic[basicIdx] = replaceLogicalObjectOfTypeAtKey(
                            coll.logicalObjectsPlainOut[basicIdx],
                            childcoll.arrLiteralKeyIn![basicIdx]!,
                            arrNewLogicalObjectIn[basicIdx]);
                    });
                    if (lev===0) {
                        const arr: FloughLogicalObjectBasic[] = [];
                        arrChildLogicalObjectBasicIndxs.forEach(basicIdx=>arr.push(arrNewLogicalObjectBasic[basicIdx]));
                        results.push({ rootLogicalObject: unionOfFloughLogicalObjects(arr), type: modTypesIn[modTypeIdx]! });
                        break;
                    }
                    const nextChildLogicalObjectBasicIndxs = new Set<number>();
                    arrChildLogicalObjectBasicIndxs.forEach(basicIdx=>{
                        coll.mapTsTypeToLogicalObjectsInIdx.get(coll.logicalObjectsPlainOut[basicIdx].tsType)!.forEach(x=>nextChildLogicalObjectBasicIndxs.add(x));
                    });
                    arrChildLogicalObjectBasicIndxs = [];
                    nextChildLogicalObjectBasicIndxs.forEach(x=>arrChildLogicalObjectBasicIndxs.push(x));

                    arrChildLogicalObjectBasicIndxs.forEach(inIndx=>{
                        const x = replaceOrFilterLogicalObjectsM(
                            coll.logicalObjectsIn[inIndx],
                            coll.mapTsTypeToLogicalObjectPlainOutIdx,
                            arrNewLogicalObjectBasic
                        ) as FloughLogicalObjectInner;
                        arrNewLogicalObjectIn[inIndx] = x;
                    });

                }
            }
        }
        return results;

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
