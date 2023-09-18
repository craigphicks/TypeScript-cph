
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

    //const enableReSectionSubsetOfTsUnionAndIntersection = true;

    // export type FloughLogicalObjectVariations = ESMap<LiteralType,FloughType>;
    // type Variations = FloughLogicalObjectVariations;
    /**
     * TODO: LiteralType should be projected to plain string or symbol, but not a number,
     * to prevent duplicate keys.
     */

    const checker = undefined as any as TypeChecker; // TODO: intialize;
    const dbgs = undefined as any as Dbgs;
    const mrNarrow = undefined as any as MrNarrow;

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
        createFloughLogicalObjectWithVariations(origTsType: Readonly<ObjectType>,newTsType: Readonly<ObjectType>): FloughLogicalObjectInnerIF | undefined;

        unionOfFloughLogicalObject(a: FloughLogicalObjectInnerIF, b: FloughLogicalObjectInnerIF): FloughLogicalObjectInner;
        // intersectionOfFloughLogicalObject(a: FloughLogicalObjectInnerIF, b: FloughLogicalObjectInnerIF): FloughLogicalObjectInner;
        // intersectionOfFloughLogicalObjects(...arrobj: FloughLogicalObjectInnerIF[]): FloughLogicalObjectInner;
        //differenceOfFloughLogicalObject(minuend: FloughLogicalObjectInnerIF, subtrahend: FloughLogicalObjectInnerIF): FloughLogicalObjectInner;
        // intersectionWithLogicalObjectConstraint(logicalObjectTop: Readonly<FloughLogicalObjectInnerIF>, logicalObjectConstraint: Readonly<FloughLogicalObjectInnerIF>): FloughLogicalObjectInnerIF | undefined;
        getTsTypeFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectInnerIF>, forNodeToTypeMap?: boolean): Type;
        logicalObjectAccess(
            rootsWithSymbols: Readonly<RefTypesTableReturn[]>,
            roots: Readonly<FloughType[]>,
            akey: Readonly<FloughType[]>,
            aexpression: Readonly<Expression[]>,
        ): LogicalObjectAccessReturn;
        getFinalTypesFromLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, includeQDotUndefined: boolean): Readonly<FloughType[]>;
        assignFinalTypeToLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, type: Readonly<FloughType>): {
            rootLogicalObject: FloughLogicalObjectInnerIF, rootNobj: FloughType
        };
        getRootAtLevelFromLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, level: number): {
            rootLogicalObject: Readonly<FloughLogicalObjectInner> | undefined, rootNobj: Readonly<FloughType>
        };
        logicalObjectModify(
            types: Readonly<(FloughType | undefined)[]> | undefined,
            state: LogicalObjectAccessReturn,
            arrCallUndefinedAllowed?: Readonly<boolean[]>,
        ): LogicalObjectModifyInnerReturnType;
        // getTsTypesInChainOfLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>): Type[][];
        getTsTypesOfBaseLogicalObjects(logicalObjectTop: Readonly<FloughLogicalObjectInnerIF>): Set<Type>;
        getTsTypeOfBasicLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectInnerIF>): Type;
        //unionOfFloughLogicalObjectWithTypeMerging(arr: Readonly<FloughLogicalObjectInnerIF>[]): FloughLogicalObjectInnerIF;
        inheritReadonlyFromEffectiveDeclaredTsTypeModify(logicalObjectTop: FloughLogicalObjectInnerIF, edType: Readonly<Type>): FloughLogicalObjectInnerIF;
        resolveInKeyword(logicalObject: FloughLogicalObjectInnerIF, accessKeys: ObjectUsableAccessKeys): ResolveInKeywordReturnType;
        dbgLogicalObjectToStrings(logicalObjectTop: FloughLogicalObjectInnerIF): string[];
        dbgLogicalObjectAccessResult(loar: Readonly<LogicalObjectAccessReturn>): string[];
    }
    export const floughLogicalObjectInnerModule: FloughLogicalObjectInnerModule = {
        createFloughLogicalObjectPlain,
        createFloughLogicalObjectTsunion,
        createFloughLogicalObjectTsintersection,
        createFloughLogicalObject,
        createFloughLogicalObjectWithVariations,
        unionOfFloughLogicalObject,
        // intersectionOfFloughLogicalObject,
        // intersectionOfFloughLogicalObjects,
        //differenceOfFloughLogicalObject,
        // intersectionWithLogicalObjectConstraint,
        getTsTypeFromLogicalObject,
        logicalObjectAccess,
        getRootAtLevelFromLogicalObjectAccessReturn,
        getFinalTypesFromLogicalObjectAccessReturn,
        assignFinalTypeToLogicalObjectAccessReturn,
        logicalObjectModify,
        // getTsTypesInChainOfLogicalObjectAccessReturn,
        getTsTypesOfBaseLogicalObjects,
        getTsTypeOfBasicLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectInnerIF>): Type {
            assertCastType<FloughLogicalObjectBasic>(logicalObjectTop);
            if (logicalObjectTop.kind!==FloughLogicalObjectKind.plain) Debug.assert(false, "unexpected or not yet implemented: ",()=>logicalObjectTop.kind);
            return logicalObjectTop.tsType;
        },
        inheritReadonlyFromEffectiveDeclaredTsTypeModify,
        resolveInKeyword,
        dbgLogicalObjectToStrings,
        dbgLogicalObjectAccessResult
    };

    type Variations = ESMap<string,FloughType>;
    type HasKeyItem = & {yes: boolean, no: boolean};
    type HasKeys = ESMap<string,HasKeyItem>;

    //type LiteralTypeNumber = LiteralType & {value: number};
    //type LiteralTypeString = LiteralType & {value: string};

    // function isLiteralTypeNumber(x: LiteralType): x is LiteralTypeNumber {
    //     return x.value !== undefined && typeof x.value === "number";
    // }
    // // @ ts-expect-error
    // function isLiteralTypeString(x: LiteralType): x is LiteralTypeString {
    //     return x.value !== undefined && typeof x.value === "string";
    // }

    // function literalTypeToStringKey(x: LiteralType): string {
    //     //Debug.assert(x.value !== undefined);
    //     if (typeof x.value === "string") return x.value;
    //     else if (typeof x.value === "number") return x.value.toString();
    //     else Debug.fail("unexpected");
    // }

    /**
     *
     * @param x
     * @returns number | typeof NaN
     * Note: Nan is a number, added to union as a comment
     */
    // function literalTypeToNumberKey(x: LiteralType): number | typeof NaN {
    //     //Debug.assert(x.value !== undefined);
    //     if (typeof x.value === "string") return Number(x.value);
    //     else if (typeof x.value === "number") return x.value;
    //     else Debug.fail("unexpected");
    // }


    export function initFloughLogicalObjectInner(checkerIn: TypeChecker, dbgsIn: Dbgs, mrNarrowIn: MrNarrow) {
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
        haskeys?: HasKeys;
    };
    /**
     * TODO: FloughLogicalObjectBasic will include FloughLogicalObjectTsintersection
     */
    type FloughLogicalObjectBasic = FloughLogicalObjectPlain;

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

    // function isKeyPresent(logobj: Readonly<FloughLogicalObjectPlain>, key: string){
    //     if (checker.isArrayOrTupleType(logobj.tsType)){
    //         Debug.assert(false, "not yet implemented");
    //     }
    //     else {
    //         if (logobj.variations) return logobj.variations.has(key as LiteralType);
    //         else return false;
    //     }
    // }

    /**
     * The FloughLogicalObjectIF is the handle for arguments and return values used in exported functions of this module.
     */
    export interface FloughLogicalObjectInnerIF {[essymbolFloughLogicalObject]: true;}
    let nextLogicalObjectInnerId = 1;

    function createFloughLogicalObjectPlain(tstype: ObjectType): FloughLogicalObjectPlain{
        if (extraAsserts){
            if (!isFakeTsObjectType(tstype)){
                if (!(tstype.flags & TypeFlags.Object) || tstype.flags & TypeFlags.Enum || tstype.flags & TypeFlags.UnionOrIntersection) Debug.fail("unexpected");
            }
        }
        return {
            kind: FloughLogicalObjectKind.plain,
            tsType: tstype,
            id: nextLogicalObjectInnerId++,
            // item: createFloughObjectTypeInstance(tstype),
            [essymbolFloughLogicalObject]: true
        };
    }
    function cloneFloughLogicalObjectPlain(logobj: Readonly<FloughLogicalObjectPlain>): FloughLogicalObjectPlain{
        const x = createFloughLogicalObjectPlain(logobj.tsType);
        if (logobj.haskeys) x.haskeys = new Map(logobj.haskeys);
        x.variations = new Map(logobj.variations);
        return x;
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
            else if (/*enableReSectionSubsetOfTsUnionAndIntersection && */items.length !== (tsType as UnionType).types.length) {
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
            else if (/*enableReSectionSubsetOfTsUnionAndIntersection &&*/ items.length !== (tsType as UnionType).types.length) {
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

    // function unionOfFloughLogicalObjectWithReductionPlainIntoUnion(a: Readonly<FloughLogicalObjectInner>, b: Readonly<FloughLogicalObjectUnion>): FloughLogicalObjectInner {

    // }


    function unionOfFloughLogicalObjectWithTypeMerging(arr: (Readonly<FloughLogicalObjectInner> | undefined)[]): FloughLogicalObjectInner | undefined{
        const map = new Map<Type,FloughLogicalObjectBasic[]>();
        arr.forEach(o=>{
            if (o===undefined) return;
            if (o.kind===FloughLogicalObjectKind.plain){
                const got = map.get(o.tsType);
                if (!got) map.set(o.tsType,[o]);
                else got.push(o);
            }
            else if (o.kind===FloughLogicalObjectKind.union||o.kind===FloughLogicalObjectKind.tsunion){
                o.items.forEach(ob=>{
                    Debug.assert(ob.kind===FloughLogicalObjectKind.plain);
                    const got = map.get(ob.tsType);
                    if (!got) map.set(ob.tsType,[ob]);
                    else got.push(ob);
                });
            }
            else {
                Debug.assert(false,"unionOfFloughLogicalObjectWithTypeMerging",()=>`: unexpected kind: ${o.kind}`);
            }
        });
        const items: FloughLogicalObjectBasic[]=[];
        map.forEach(a=>{
            items.push(unionOfSameBaseTypesWithVariationsV2(a));
        });
        if (items.length===0) return undefined;
        if (items.length===1) return items[0];
        return {
            kind: FloughLogicalObjectKind.union,
            items,
            id: nextLogicalObjectInnerId++,
            [essymbolFloughLogicalObject]: true
        };
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
        return arr.reduce((accum,curr)=>unionOfFloughLogicalObject(accum,curr)/*,arr[0]*/);
    }

    type LogicalObjectVisitor<ResultType,StateType, VTorRtnType = [StateType | undefined,ResultType | undefined, FloughLogicalObjectInner | undefined]> = & {
        onPlain: (logicalObject: Readonly<FloughLogicalObjectPlain>) => ResultType;
        onUnion: (logicalObject: Readonly<FloughLogicalObjectUnion>, result: ResultType | undefined, state: StateType | undefined, itemsIndex: number) => VTorRtnType;
        onIntersection: (logicalObject: Readonly<FloughLogicalObjectIntersection>, result: ResultType | undefined, state: StateType | undefined, itemsIndex: number) => VTorRtnType;
        onDifference?: (logicalObject: Readonly<FloughLogicalObjectDifference>, result: ResultType | undefined, state: StateType | undefined, itemsIndex: number) => VTorRtnType;
        onTsunion?: (logicalObject: Readonly<FloughLogicalObjectTsunion>, result: ResultType | undefined, state: StateType | undefined, itemsIndex: number) => VTorRtnType;
        onTsintersection?: (logicalObject: Readonly<FloughLogicalObjectTsintersection>, result: ResultType | undefined, state: StateType | undefined, itemsIndex: number) => VTorRtnType;

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

    function createFloughLogicalObjectWithVariations(origTsType: Readonly<ObjectType>,newTsType: Readonly<ObjectType>): FloughLogicalObjectInner {
        const logobj = createFloughLogicalObjectPlain(origTsType);
        const variations: Variations = new Map<string,FloughType>();
        checker.getPropertiesOfType(newTsType).forEach(symbol=>{
            const ptstype = checker.getTypeOfSymbol(symbol);
            variations.set(symbol.escapedName.toString(),floughTypeModule.createFromTsType(ptstype));
        });
        logobj.variations = variations;
        return logobj;
    }

    function getTsTypeSetFromLogicalObjectForNodeMap(logicalObjectTop: Readonly<FloughLogicalObjectInner>): Set<Type> {
        /**
         *
         * @param logobj
         * @returns
         * if logobj.kind===plain then return true if logobj.tsType is itself returned, otherwise false
         * else return true if helper returned true for every item in logobj.items, otherwise false
         */
        function helper(logobj: Readonly<FloughLogicalObjectInner>, settstype: Set<Type>): boolean {
            if (logobj.kind===FloughLogicalObjectKind.plain) {
                // TODO: somehow work in haskey and variations
                settstype.add(logobj.tsType);
                return true;
            }
            else if (logobj.kind===FloughLogicalObjectKind.union){
                //const subset = new Set<Type>();
                logobj.items.forEach(item=>helper(item, settstype));
                return true;
            }
            else if (logobj.kind===FloughLogicalObjectKind.tsunion){
                const subset = new Set<Type>();
                const noChangeFromTsType = logobj.items.every(item=>helper(item, subset));
                if (noChangeFromTsType) {
                    settstype.add(logobj.tsType);
                    return true;
                }
                else {
                    subset.forEach(t=>settstype.add(t));
                    return false;
                }
            }
            else {
                Debug.assert(false, "unexpected: ", ()=>logobj.kind);
            }
        }
        const setOfTsTypes = new Set<Type>();
        helper(logicalObjectTop, setOfTsTypes);
        return setOfTsTypes;
    } // getTsTypeSetFromLogicalObjectForNodeMap

    // @ts-ignore
    function getTsTypeSetFromLogicalObjectV2(logicalObjectTop: Readonly<FloughLogicalObjectInner>): Set<Type> {
        const setOfTsTypes = new Set<Type>();
        function helper(logobj: Readonly<FloughLogicalObjectInner>): void {
            if (logobj.kind===FloughLogicalObjectKind.plain) {
                // TODO: somehow work in haskey and variations
                setOfTsTypes.add(logobj.tsType);
            }
            else if (logobj.kind===FloughLogicalObjectKind.union || logobj.kind===FloughLogicalObjectKind.tsunion){
                logobj.items.forEach(helper);
            }
        }
        helper(logicalObjectTop);
        return setOfTsTypes;
    }
    function getTsTypeSetFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectInner>, forNodeMap?: boolean): Set<Type> {
        const useV2 = true;
        if (!useV2) return getTsTypeSetFromLogicalObjectV1(logicalObjectTop);
        else {
            if (forNodeMap) return getTsTypeSetFromLogicalObjectForNodeMap(logicalObjectTop);
            else return getTsTypeSetFromLogicalObjectV2(logicalObjectTop);
        }
    }

    function getTsTypeSetFromLogicalObjectV1(logicalObjectTop: Readonly<FloughLogicalObjectInnerIF>): Set<Type> {
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
                onIntersection(_logicalObject: Readonly<FloughLogicalObjectIntersection>, _result: Result | undefined, _state: State | undefined, _itemsIndex: number): OnReturnType {
                    //if (logicalObject.tsType) return [undefined, new Set<Type>([logicalObject.tsType]), undefined];
                    //const test = true;
                    //if (test)
                    Debug.fail("test");
                    // if (itemsIndex===-1) return [new Set<Type>(), undefined, logicalObject.items[0]];
                    // Debug.assert(state && result);
                    // if (itemsIndex===0) {
                    //     Debug.assert(state.size===0);
                    //     state = result;
                    // }
                    // else {
                    //     const [smaller,larger] = state.size<result.size ? [state,result] : [result,state];
                    //     smaller.forEach(t =>{
                    //         if (!larger.has(t)) smaller.delete(t);
                    //     });
                    //     state = smaller;
                    // }
                    // /**
                    //  * If state.size===0, then the intersection is empty, so we can stop.
                    //  */
                    // if (itemsIndex === logicalObject.items.length-1 || state.size===0) return [undefined,state,undefined];
                    // return [state,undefined, logicalObject.items[itemsIndex+1]];
                },
                // @ts-expect-error
                onDifference(logicalObject: Readonly<FloughLogicalObjectDifference>, result: Result | undefined, state: State | undefined, itemsIndex: number): OnReturnType {
                    //const test = true;
                    Debug.fail("test");
                    // Debug.assert(logicalObject.items.length === 2);
                    // if (itemsIndex===-1) return [new Set<Type>(), undefined, logicalObject.items[0]];
                    // Debug.assert(state && result);
                    // if (itemsIndex===0) {
                    //     Debug.assert(state.size===0);
                    //     state = result;
                    //     return [state,undefined, logicalObject.items[itemsIndex+1]];
                    // }
                    // else {
                    //     // TODO: compute the difference; subtract the types of the subtrahend (result )from types of the the minuend (state[0])
                    //     result.forEach(t => state!.delete(t));
                    //     return [undefined,state, undefined];
                    // }
                },
                onTsunion(logicalObject: Readonly<FloughLogicalObjectTsunion>, _result: Result | undefined, _state: State | undefined, _itemsIndex: number) {
                    //Debug.fail("test"); in use
                    return [undefined, new Set<Type>([logicalObject.tsType]), undefined];

                },
                onTsintersection(_logicalObject: Readonly<FloughLogicalObjectTsintersection>, _result: Result | undefined, _state: State | undefined, _itemsIndex: number) {
                    Debug.fail("test");
                    /**
                     * ts intersection is a single type, not a union of types, and it should contain any unions beneath it.
                     */
                    //return [undefined, new Set<Type>([logicalObject.tsType]), undefined];
                },
            };
        }
        const visitor = createLogicalObjectVisitorForGetTsTypeFromLogicalObject();
        const result = logicalObjecVisit(logicalObjectTop, () => visitor, new Set<Type>());
        return result;
    }


    function getTsTypeFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectInnerIF>, forNodeToTypeMap?: boolean): Type {
        assertCastType<FloughLogicalObjectInner>(logicalObjectTop);
        const at: Type[] = [];
        const typeSet = getTsTypeSetFromLogicalObject(logicalObjectTop, forNodeToTypeMap);
        typeSet.forEach(t => at.push(t));
        // if (!enableReSectionSubsetOfTsUnionAndIntersection){
        //     if (logicalObjectTop.kind === "tsunion"){
        //         if (logicalObjectTop.items.length===at.length){
        //             // the types in the original tsType map 1-1 to those in the type set, so return the input.
        //             if ((logicalObjectTop.tsType as UnionType).types.every(t => typeSet.has(t))) return logicalObjectTop.tsType;
        //         }
        //     }
        // }
        if (at.length===0) return checker.getNeverType();
        if (at.length===1) return at[0];
        const ut = checker.getUnionType(at);
        return ut;
    }

    // @ ts-expect-error
    function forEachLogicalObjectBasic(topIn: FloughLogicalObjectInner, f: (bobj: FloughLogicalObjectBasic) => void): FloughLogicalObjectInner {
        function worker(lobj: FloughLogicalObjectInner): void {
            if (lobj.kind===FloughLogicalObjectKind.plain){
                f(lobj);
            }
            else if (lobj.kind===FloughLogicalObjectKind.union || lobj.kind===FloughLogicalObjectKind.tsunion){
                lobj.items.forEach(worker);
            }
            else {
                Debug.assert(false, "not yet implemented: ", ()=>lobj.kind);
            }
        }
        worker(topIn);
        return topIn;
    }


    /**
     * Modify "logicalObjectTop" so that it inherits readonly attributes from edType, and returns the modified "logicalObjectTop".
     * Note1: When "logicalObjectTop" is a uhion of object types, some which are readonly and some not, matching the inheritance properly
     * would require testing for subtype relations. In order not to have to test for subtype relations, this implementation takes short cuts:
     * - If any "edType" union member is a readonly tuple, all union members of "logicalObjectTop" which tuples are set to readonly.
     * - Suppose a (possibly intermediate) path "x.y[n].z"
     * checks if some union member of "logicalObjectTop" is readonly, and iff that is true, then sets all items of logicalObjectTop to be readonly versions of themselves.
     * Note2: Curently returns original "logicalObjectTop" possibly with different tstypes, but might want to return new object instead.
     * @param logicalObjectTop
     * @param edType
     * @returns
     * // C.f. https://www.typescriptlang.org/play?#code/FAGwpgLgBA9gRgKwIxQFxSgbygJzAQwBMYA7EATygA91tz0SBXAWzjBwF8OoBeLGzPSRcA3MHjJe-VINQAmUVAD0SqAHkA0uMRIAdFSmyFI5aoDC+EiRjR8AZzsBLAOYkoEGFADkVL1DYAxviMdmBQjtCOdlD4uASEALSkFFAADjgwqewQ5LrayPq6lHxyJirqWqCQsIgADGgY2DRYcUTJlPRQTKzsXIYCQqL59XyYA-KK5ZrD+ob0xqYVM1RFUqWLFlY2MQ4ubh7e5H6BwaHhkdGxeERJZJTpmdm5wC-l9lABpHbQABbv1lAwAAzIFgALQUhpDKpGoIMEQOx5cAQxByBotZp0BgsNicbijcbCbjvT4kb5iCRogkyeaTVTTSmzUa0sr0rSMlbFKDrKaVZGwgDM6KatCgnW6uL61Nkwh2Hy+0A4FMQQultKViwZKqZWBZG0s1lsu1c7k8PmOYNOYQi4UurUS7ShjxwOTyEgFhS5PLZLyAA
     * Notes: TS-v5.5 behavior
     * let obj1: { readonly x: { y: number}} = {x:{y:1}};
     *
     * obj1 = {x:{y:2}}; // OK
     * obj1.x = {y:2}; // Cannot assign to 'x' because it is a read-only property.
     * obj1.x.y = 2; // OK
     *
     * let obj0: { x: { readonly y: number}} = {x:{y:1}};
     * obj0 = {x:{y:2}}; // OK
     * obj0.x = {y:2}; // OK
     * obj0.x.y = 2; // Cannot assign to 'y' because it is a read-only property.
     *
     *
     * // as const has no effect on prop objects.
     * let obj2: { x: { y: number}} = {x:{y:1}} as const;
     * obj2 = {x:{y:2}}; // OK
     * obj2.x = {y:2}; // OK
     * obj2.x.y = 2; // OK
     *
     * let obj3: { x: { y: number}} = {x:{y:1} as const };
     * obj3 = {x:{y:2}}; // OK
     * obj3.x = {y:2}; // Cannot assign to 'x' because it is a read-only property.
     * obj3.x.y = 2; // OK
     *
     *
     */
    function inheritReadonlyFromEffectiveDeclaredTsTypeModify(
        logicalObjectTop: FloughLogicalObjectInner,
        edType: Readonly<Type>):
    FloughLogicalObjectInner {
        let roTuple = false;
        let roArray = false;

        //const items: FloughLogicalObjectBasic[] | undefined;
        checker.forEachType(edType, edt=>{
            if (extraAsserts){
                Debug.assert(!(edt.flags & TypeFlags.Intersection), "not yet implemented: edt.flags & TypeFlags.Intersection");
                Debug.assert(!(edt.flags & TypeFlags.Union), "unexpected: edt.flags & TypeFlags.Union");
            }
            if (!(edt.flags & TypeFlags.Object)) return;
            if (checker.isArrayOrTupleType(edType)){
                if (checker.isTupleType(edType)) {
                    //checker.createReaonlyTupleTypeFromTupleType()
                    roTuple ||= (edType.target as TupleType).readonly;
                }
                else {
                    roArray ||= checker.isReadonlyArrayType(edType);
                }
            }
            else {
                // continue
            }
        });
        if (roTuple||roArray){
            forEachLogicalObjectBasic(logicalObjectTop,(obj: FloughLogicalObjectBasic)=>{
                if (obj.kind===FloughLogicalObjectKind.plain){
                    if (checker.isArrayOrTupleType(obj.tsType)){
                        if (checker.isTupleType(obj.tsType)){
                            if (roTuple) {
                                const roTsType = checker.createReaonlyTupleTypeFromTupleType(obj.tsType as TupleTypeReference);
                                // TODO: overwrite the old or create a new inner with new tsType
                                obj.tsType = roTsType;
                            }
                        }
                        else { // ArrayType
                            if (roArray) {
                                const roTsType = checker.createArrayType(checker.getElementTypeOfArrayType(obj.tsType)??checker.getUndefinedType(),/*readonly*/ true);
                                Debug.assert(checker.isReadonlyArrayType(roTsType));
                                assertCastType<TypeReference>(roTsType);
                                obj.tsType = roTsType;
                            }
                        }
                    }
                }
            });
        }

        // if (checker.isTupleType(edType) && (((edType as TypeReference).target) as TupleType).readonly) {
        //     // The rhs could be a union of TupleTypes
        //     // Debug.assert(logicalObjectTop.kind===FloughLogicalObjectKind.plain);
        //     // Debug.assert(checker.isTupleType(logicalObjectTop.tsType));

        //     ((logicalObjectTop.tsType as TypeReference).target as TupleType).readonly = true;
        // }
        return logicalObjectTop;
    }



    // function replaceTypeAtKey(logicalObject: Readonly<FloughLogicalObjectBasic>, key: LiteralType, modifiedType: Readonly<FloughType>): FloughLogicalObjectBasic {
    //     if (logicalObject.kind!=="plain"){
    //         Debug.fail("unexpected logicalObject.kind!=='plain'");
    //     }
    //     // if (extraAsserts){
    //     //     const {logicalObject:modLogicalObjectOuter,remaining:_modRemaining} = floughTypeModule.splitLogicalObject(modifiedType);
    //     //     let modLogicalObject: FloughLogicalObjectInner | undefined;
    //     //     if (modLogicalObjectOuter){
    //     //         modLogicalObject = floughLogicalObjectModule.getInnerIF(modLogicalObjectOuter) as FloughLogicalObjectInner;
    //     //         if (hasNonObjectType(modLogicalObject)) Debug.fail("hasNonObjectType");
    //     //     }
    //     // }
    //     const variations = logicalObject.variations ? new Map(logicalObject.variations) : new Map<LiteralType,FloughType>();
    //     variations.set(key, modifiedType);
    //     // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    //     return <FloughLogicalObjectPlain>{ ...logicalObject, variations, id: nextLogicalObjectInnerId++ };
    // }

    /**
     * "logicalObjectBasic[key]" effectively references a floughType containing a logical object.
     * By way of a variation, set it to reference a new floughType containing "newLogicalObjectAtKey" as its logical object,
     * and "newNobjType" as it's nobj.
     *
     * @param logicalObjectBasic
     * @param key
     * @param newLogicalObjectAtKey
     * @returns
     */
    // function replaceLogicalObjectOfTypeAtKey(
    //     logicalObjectBasic: Readonly<FloughLogicalObjectBasic>,
    //     key: LiteralType,
    //     newLogicalObjectAtKey: Readonly<FloughLogicalObjectInner> | undefined,
    //     newNobjType: Readonly<FloughType> | undefined,
    //     expr: PropertyAccessExpression | ElementAccessExpression,
    //     finalTypeContainsUndefined: boolean,
    // ): FloughLogicalObjectBasic {
    //     if (logicalObjectBasic.kind!=="plain"){
    //         Debug.fail("unexpected logicalObject.kind!=='plain'");
    //     }
    //     // if (extraAsserts){
    //     //     const {logicalObject:modLogicalObjectOuter,remaining:_modRemaining} = floughTypeModule.splitLogicalObject(newLogicalObjectAtKey);
    //     //     let modLogicalObject: FloughLogicalObjectInner | undefined;
    //     //     if (modLogicalObjectOuter){
    //     //         modLogicalObject = floughLogicalObjectModule.getInnerIF(modLogicalObjectOuter) as FloughLogicalObjectInner;
    //     //         if (hasNonObjectType(modLogicalObject)) Debug.fail("hasNonObjectType");
    //     //     }
    //     // }
    //     let nobjTypeToAdd: FloughType | undefined;
    //     if (newNobjType && finalTypeContainsUndefined && (expr as PropertyAccessExpression)?.questionDotToken){
    //         nobjTypeToAdd=floughTypeModule.intersectionWithUndefinedNull(newNobjType);
    //     }
    //     const variations = logicalObjectBasic.variations ? new Map(logicalObjectBasic.variations) : new Map();
    //     const outer = newLogicalObjectAtKey ? floughLogicalObjectModule.createFloughLogicalObjectFromInner(newLogicalObjectAtKey,/*edType*/ undefined) : undefined;
    //     const newType = floughTypeModule.createTypeFromLogicalObject(outer, nobjTypeToAdd);

    //     // const newType = newNobjType ? (floughTypeModule.setLogicalObjectMutate(outer,newNobjType),floughTypeModule.cloneRefTypesType(newNobjType)) : floughTypeModule.createTypeFromLogicalObject(outer);
    //     variations.set(key, newType);
    //     // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    //     return <FloughLogicalObjectPlain>{ ...logicalObjectBasic, variations, id: nextLogicalObjectInnerId++ };
    // }

    // type AccessKeys = ReturnType<typeof floughTypeModule["getAccessKeysMutable"]>;
    // type ObjectUsableKeys = & {
    //     genericNumber: boolean;
    //     genericString: boolean;
    //     stringSet: Set<string>;
    // };
    // function convertAccessKeysToUsableKeys(accessKeys: AccessKeys): ObjectUsableKeys {
    //     const genericNumber = accessKeys.number===true;
    //     const genericString = accessKeys.string===true;
    //     const stringSet = new Set<string>();
    //     if (accessKeys.number && accessKeys.number!==true) {
    //         accessKeys.number.forEach(k=>stringSet.add(k.value.toString()));
    //     }
    //     if (accessKeys.string && accessKeys.string!==true) {
    //         accessKeys.string.forEach(k=>stringSet.add(k.value));
    //     }
    //     // const strings: string[]=[];
    //     // stringSet.forEach(s=>strings.push(s));
    //     return { genericNumber, genericString, stringSet };
    // }

    function getTypeOverIndicesFromBase(logicalObjectBaseIn: Readonly<FloughLogicalObjectInner>, keysType: FloughType): { type: FloughType } {
        if (logicalObjectBaseIn.kind!=="plain"){
            Debug.fail("unexpected logicalObject.kind!=='plain'");
        }
        if (isFakeTsObjectType(((logicalObjectBaseIn as FloughLogicalObjectBasic).tsType))){
            return { type: floughTypeModule.createNeverType() };
        }
        // get a copy of the string and number keys
        const keys = floughTypeModule.getObjectUsableAccessKeys(keysType);

        // const alitnum = floughTypeModule.getLiteralNumberTypes(keysType);
        // const alitnumset =
        // const alitstr = floughTypeModule.getLiteralStringTypes(keysType);
        // const hasnum = floughTypeModule.hasNumberType(keysType);
        // const hasstr = floughTypeModule.hasStringType(keysType);
        const aft: FloughType[]=[];
        {
            let variations: Variations | undefined;
            if (variations=logicalObjectBaseIn.variations){
                variations.forEach((v,k)=>{
                    {
                        //assertCastType<LiteralTypeNumber>(k);
                        if (keys.stringSet.has(k)){
                            aft.push(v);
                            keys.stringSet.delete(k);
                        }
                    }
                    if (keys.genericString) {
                        aft.push(floughTypeModule.cloneType(v));
                        return;
                    }
                    if (keys.genericNumber) {
                        if (Number.isSafeInteger(Number.parseInt(k))) aft.push(floughTypeModule.cloneType(v));
                        return;
                    }
                });
            }
        }
        const atstypes: Type[]=[];
        let undef = false;
        const baseType = logicalObjectBaseIn.tsType as ObjectType;
        if (checker.isArrayOrTupleType(baseType)){
            //if (accessKeys.number) {
                if (checker.isTupleType(baseType)){
                    //const index = key.value as number;
                    assertCastType<TupleTypeReference>(baseType);
                    const tupleElements = checker.getTypeArguments(baseType);
                    const elementFlags = baseType.target.elementFlags;
                    const hasRest = !!(elementFlags[elementFlags.length-1] & ElementFlags.Rest);
                    //let undef = false;
                    //let atstype: Type[]=[];
                    if (keys.genericNumber===true){
                        atstypes.push(...tupleElements);
                        // under what circumstances, if ever, should undefined be added here?
                    }
                    else {
                        keys.stringSet.forEach(numstr=>{
                            const index = Number.parseInt(numstr);
                            if (!Number.isSafeInteger(index)) return; // just ignored
                            // const index = klitnum.value as number;

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
            //} // accessKeys.number
        }
        else { // ought to be object
            Debug.fail("unexpected; should not be trying to get union of types over all indices of an object type");
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

    function getTypeAtIndexFromBase(logicalObjectBaseIn: Readonly<FloughLogicalObjectInner>, key: string): { literalKey?: string | undefined, type: Readonly<FloughType> | undefined } {
        if (isFakeTsObjectType(((logicalObjectBaseIn as FloughLogicalObjectBasic).tsType))){
            return { literalKey:key, type: floughTypeModule.createNeverType() };
        }
        let typeContainsUndefined: ((type: Readonly<Type>) => boolean) | undefined;
        if (extraAsserts) {
            typeContainsUndefined = (type: Readonly<Type>): boolean => {
                return !!(((type.flags & TypeFlags.Union) && (type as UnionType).types.some(x=>!!(x.flags & TypeFlags.Undefined)))
                || (type.flags & TypeFlags.Undefined));
            };
        }
        if (logicalObjectBaseIn.kind!=="plain"){
            Debug.fail("unexpected logicalObject.kind!=='plain'");
        }
        {
            const type = logicalObjectBaseIn.variations?.get(key);
            if (type) return { literalKey: key, type: floughTypeModule.cloneType(type) };
        }
        const baseType = logicalObjectBaseIn.tsType;
        if (checker.isArrayOrTupleType(baseType)){
            if (checker.isTupleType(baseType)){
                // if (!isLiteralTypeNumber(key)) {
                //     return { type: floughTypeModule.createUndefinedType() };
                // }
                // const index = key.value as number;
                let index = Number.parseInt(key);
                index = Number.isSafeInteger(index) ? index : NaN;
                assertCastType<TupleTypeReference>(baseType);
                const tupleElements = checker.getTypeArguments(baseType);
                const elementFlags = baseType.target.elementFlags;
                const hasRest = !!(elementFlags[elementFlags.length-1] & ElementFlags.Rest);
                let undef = false;
                let tstype: Type;
                if (isNaN(index)) {
                    tstype = checker.getUnknownType();
                }
                else if (index<tupleElements.length) {
                    tstype = tupleElements[index];
                    undef = !!(elementFlags[index] & (ElementFlags.Optional | ElementFlags.Rest));
                    if (extraAsserts) {
                        if (undef) Debug.assert(typeContainsUndefined!(tstype), "tuple type does not include undefined");
                    }
                }
                else if (hasRest) {
                    tstype = tupleElements[tupleElements.length-1];
                    undef = true;
                    if (extraAsserts) {
                        if (undef) Debug.assert(typeContainsUndefined!(tstype), "tuple type does not include undefined");
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
            // if (!isLiteralTypeString(key)) {
            //     return { type: floughTypeModule.createUndefinedType() };
            // }
            // assertCastType<ObjectType>(baseType);
            // const keystr = key.value as string;
            const keystr = key;
            const propSymbol = checker.getPropertyOfType(/*logicalObjectBaseIn.tsType*/ baseType, keystr);
            if (!propSymbol){
                return { type: undefined, literalKey: key };
            }
            Debug.assert(propSymbol);
            // TODO: ? case enum type
            const tstype = checker.getTypeOfSymbol(propSymbol);
            if (extraAsserts) Debug.assert(tstype!==checker.getErrorType());
            return { type: floughTypeModule.createFromTsType(tstype), literalKey: key };
        }
    } // end of getTypeAtIndexFromBase

    // function replaceOrFilterLogicalObjects1(
    //     logicalObjectIn: Readonly<FloughLogicalObjectInner>,
    //     tstype: Readonly<Type>,
    //     newlogicalObjectBasic: Readonly<FloughLogicalObjectBasic> | undefined
    // ): FloughLogicalObjectInner | undefined {
    //     function replaceOrFilter(logicalObject: Readonly<FloughLogicalObjectInner>): FloughLogicalObjectInner | undefined{
    //         Debug.assert(logicalObject);
    //         if (logicalObject.kind==="plain"){
    //             // replace or filter - not present in map means it should be filtered
    //             if (logicalObject.tsType===tstype) {
    //                 return newlogicalObjectBasic;
    //             }
    //             return logicalObject;
    //         }
    //         else if (logicalObject.kind==="union" || logicalObject.kind==="tsunion"){
    //             let change = false;
    //             const items = logicalObject.items.map(x=>{
    //                 const y = replaceOrFilter(x);
    //                 if (x!==y) change = true;
    //                 return y;
    //             }).filter(x=>x!==undefined) as FloughLogicalObjectInner[];
    //             if (!change) return logicalObject;
    //             if (items.length===0) return undefined;
    //             if (logicalObject.kind==="union" && items.length===1) return items[0]; // tsunion is preserved for its original tstype (unless empty)
    //             return { ...logicalObject, items, id: nextLogicalObjectInnerId++ };
    //         }
    //         else if (logicalObject.kind==="intersection" || logicalObject.kind==="tsintersection"|| logicalObject.kind==="difference"){
    //             Debug.fail("not yet implemented");
    //         }
    //         else {
    //             Debug.fail("not yet implemented");
    //         }
    //     }
    //     return replaceOrFilter(logicalObjectIn);
    // }


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

    function getBaseLogicalObjects(logicalObjectTop: Readonly<FloughLogicalObjectInner>): ESMap<Type, FloughLogicalObjectBasic> {
        const result = new Map<Type,FloughLogicalObjectBasic>();
        function worker(logicalObject: Readonly<FloughLogicalObjectInner>): void {
            if (logicalObject.kind === FloughLogicalObjectKind.plain) {
                if (extraAsserts) Debug.assert(!result.has(logicalObject.tsType));
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
    function getTsTypesOfBaseLogicalObjects(logicalObjectTop: Readonly<FloughLogicalObjectInner>): Set<Type> {
        const result = new Set<Type>();
        function worker(logicalObject: Readonly<FloughLogicalObjectInner>): void {
            if (logicalObject.kind === FloughLogicalObjectKind.plain) {
                result.add(logicalObject.tsType);
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

    function unionOfSameBaseTypesWithVariationsV2(arr: Readonly<FloughLogicalObjectBasic[]>): FloughLogicalObjectBasic {
        //assertCastType<Readonly<FloughLogicalObjectPlain[]>>(arr);
        if (arr.length===0) Debug.fail("unexpected arr.length===0");
        if (extraAsserts){
            for (const logicalObject of arr){
                //const logicalObject = iban.logicalObjectBasic;
                if (logicalObject.kind!=="plain"){
                    Debug.fail("unexpected logicalObject.kind!=='plain'");
                }
                if (logicalObject.tsType!==arr[0].tsType) Debug.fail("unexpected !logicalObject.variations");
            }
        }
        if (arr.length===1) return arr[0];
        //const nobjType = floughTypeModule.unionOfRefTypesType(arr.map(x=>x.nobjType).filter(x=>x) as FloughType[]);
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0; i<arr.length; i++){
            // If there is any type without any variations, then that is the result.
            // TODO: consider arr[i].haskey
            if (arr[i].variations===undefined) return arr[i];
        }
        const isect: Variations = new Map(); //arr[0].variations!;
        const useUnionNotIsect = true; //(()=>{return true})();
        if (useUnionNotIsect){
            // For each variation key
            // - if that key is not present in any variations, remove it from final variations.
            // - else take the union of the variation types
            arr[0].variations?.forEach((v,k)=>{
                if (extraAsserts) Debug.assert(!floughTypeModule.isNeverType(v));
                isect.set(k,floughTypeModule.cloneType(v));
            });
            isect.forEach((v,k)=>{
                let deleteKey = false;
                for (let i=1; i<arr.length; i++){
                    const got = arr[i].variations!.get(k);
                    if (got===undefined) {
                        deleteKey  = true;
                        break;
                    }
                    floughTypeModule.unionWithFloughTypeMutate(got, v);
                }
                if (deleteKey) isect.delete(k);
                else {
                    // TODO - could check if v is the same as tstype.k, and if so remove k from isect.
                    isect.set(k, v);
                }
            });
        }
        else {
            for (let i=1; isect.size!==0 && i<arr.length; i++){
                const vari = arr[i].variations!;
                for (let iter=isect.entries(), next=iter.next(); !next.done; next=iter.next()){
                    const got = vari.get(next.value[0]);
                    if (got===undefined) {
                        isect.delete(next.value[0]);
                    }
                    else {
                        let type = floughTypeModule.cloneRefTypesType(next.value[1]);
                        type = floughTypeModule.intersectionWithFloughTypeSpecial(got, type);
                        if (floughTypeModule.isNeverType(type)) isect.delete(next.value[0]);
                        else isect.set(next.value[0], type);
                    }
                }
            }
        }
        const ret: FloughLogicalObjectPlain = {
            kind: FloughLogicalObjectKind.plain,
            id: nextLogicalObjectInnerId++,
            tsType: arr[0].tsType,
            [essymbolFloughLogicalObject]: true
        };
        if (isect.size!==0) ret.variations = isect;
        return ret;
    }

    // function unionOfSameBaseTypesWithVariations(arr: Readonly<IndexingBasic[]>): { logicalObjectBasic: FloughLogicalObjectPlain } {
    //     //assertCastType<Readonly<FloughLogicalObjectPlain[]>>(arr);
    //     if (arr.length===0) Debug.fail("unexpected arr.length===0");
    //     if (extraAsserts){
    //         for (const iban of arr){
    //             const logicalObject = iban.logicalObjectBasic;
    //             if (logicalObject.kind!=="plain"){
    //                 Debug.fail("unexpected logicalObject.kind!=='plain'");
    //             }
    //             if (logicalObject.tsType!==arr[0].logicalObjectBasic.tsType) Debug.fail("unexpected !logicalObject.variations");
    //         }
    //     }
    //     if (arr.length===1) return { logicalObjectBasic: arr[0].logicalObjectBasic };
    //     //const nobjType = floughTypeModule.unionOfRefTypesType(arr.map(x=>x.nobjType).filter(x=>x) as FloughType[]);
    //     // eslint-disable-next-line @typescript-eslint/prefer-for-of
    //     for (let i=0; i<arr.length; i++){
    //         if (arr[i].logicalObjectBasic.variations===undefined) return { logicalObjectBasic: arr[i].logicalObjectBasic };
    //     }
    //     const isect: Variations = arr[0].logicalObjectBasic.variations!;
    //     for (let i=1; isect.size!==0 && i<arr.length; i++){
    //         const vari = arr[i].logicalObjectBasic.variations!;
    //         for (let iter=isect.entries(), next=iter.next(); !next.done; next=iter.next()){
    //             const got = vari.get(next.value[0]);
    //             if (got===undefined) {
    //                 isect.delete(next.value[0]);
    //             }
    //             else {
    //                 const type = floughTypeModule.cloneRefTypesType(next.value[1]);
    //                 floughTypeModule.intersectionWithFloughTypeMutate(got, type);
    //                 if (floughTypeModule.isNeverType(type)) isect.delete(next.value[0]);
    //                 else isect.set(next.value[0], type);
    //             }
    //         }
    //     }
    //     const ret: FloughLogicalObjectPlain = {
    //         kind: FloughLogicalObjectKind.plain,
    //         id: nextLogicalObjectInnerId++,
    //         tsType: arr[0].logicalObjectBasic.tsType,
    //         [essymbolFloughLogicalObject]: true
    //     };
    //     if (isect.size!==0) ret.variations = isect;
    //     return { logicalObjectBasic: ret };
    // }

    type Collated = & {
        arrLiteralKeyIn?: (string | undefined)[]; // TODO: kill??
        logicalObjectsIn: Readonly<(FloughLogicalObjectInner | undefined)[]>; // each may be union of obj, but no nobj types
        nobjTypesIn: Readonly<(FloughType | undefined)[]>; // nobj, same length as logicalObjectsIn
        logicalObjectsPlainOut: Readonly<FloughLogicalObjectPlain>[]; // each of the unique plain obj over union of logicalObjectsIn
        carriedQdotUndefinedsOut: boolean[]; // same length as logicalObjectsPlainOut, always all false for first level collated[0]
        //nobjTypeOut: Readonly<FloughType | undefined>[]; // TODO: KILL this
        mapTsTypeToLogicalObjectPlainOutIdx: ESMap<Type,number>; // length=logicalObjectsPlainOut.length
        mapTsTypeToLogicalObjectsInIdx: ESMap<Type,number[]>; // length=logicalObjectsPlainOut.length
        //remainingNonObjType: FloughType;
        //reverseMap: { inIdx: number, idxInIn: number }[][]; //
    };
    export type LiteralKeyAndType = & { literalKey?: string | undefined, type: FloughType };
    export type LogicalObjectAccessReturn = & {
        rootsWithSymbols: Readonly<RefTypesTableReturn[]>;
        roots: Readonly<FloughType[]>;
        collated: Readonly<Collated[]>;
        aLiterals: (string | undefined)[];
        finalTypes: Readonly<LiteralKeyAndType[]>;
        //finalQdotUndefineds: (boolean | undefined)[]; // use collated[last].carriedQdotUndefinedsOut instead <------ !!!!
        aexpression: Readonly<(PropertyAccessExpression | ElementAccessExpression)[]>;
        //hasFinalQdotUndefined: boolean;
    };
    export const logicalObjectAccessModule = {
        /**
         *
         * @param loar
         * @param finalIdx
         * @returns
         */
        getFinalCarriedQdotUndefined(loar: Readonly<LogicalObjectAccessReturn>, finalIdx: number): boolean {
            const lastColl = loar.collated[loar.collated.length-1];
            return lastColl.carriedQdotUndefinedsOut[finalIdx];
        },
        getSymbol(loar: Readonly<LogicalObjectAccessReturn>): Symbol | undefined{
            if (extraAsserts){
                // loar.rootsWithSymbols.forEach((x,i)=>{
                //     if (x.symbol!==loar.rootsWithSymbols[0].symbol) Debug.fail("unexpected:",()=>i);

                // });
                Debug.assert(loar.rootsWithSymbols.every(x=>x.symbol===loar.rootsWithSymbols[0].symbol), "unexpected");
            }
            return loar.rootsWithSymbols[0].symbol;
        },
        getSymbolData(loar: Readonly<LogicalObjectAccessReturn>): { symbol: Symbol | undefined, isconst: boolean | undefined }{
            if (extraAsserts){
                Debug.assert(loar.rootsWithSymbols.every(x=>x.symbol===loar.rootsWithSymbols[0].symbol), "unexpected");
            }
            const { symbol, isconst } = loar.rootsWithSymbols[0];
            return { symbol, isconst };
        },
        getFinalTypesLength(loar: Readonly<LogicalObjectAccessReturn>): number { return loar.finalTypes.length; },
        getFinalType(loar: Readonly<LogicalObjectAccessReturn>, idx: number, includeCarriedQDotUndefined: boolean): FloughType {
            if (includeCarriedQDotUndefined && !floughTypeModule.hasUndefinedType(loar.finalTypes[idx].type) && this.getFinalCarriedQdotUndefined(loar,idx)) {
                const type = floughTypeModule.cloneType(loar.finalTypes[idx].type);
                floughTypeModule.addUndefinedTypeMutate(type);
                return type;
            }
            return loar.finalTypes[idx].type;
        },
        modifyOne(loar: Readonly<LogicalObjectAccessReturn>, idx: number, finalType: Readonly<FloughType>, callUndefinedAllowed?: boolean): RefTypesTableReturn {
            // if (extraAsserts){
            //     Debug.assert(!floughTypeModule.isNeverType(finalType), "unexpected, type never input to modifyOne");
            // }
            const arr: (FloughType | undefined)[] = new Array(loar.finalTypes.length);
            arr.fill(/*value*/ undefined);
            if (!floughTypeModule.isNeverType(finalType)) arr[idx] = finalType;
            let arrCallUndefinedAllowed: undefined | boolean[];
            if (callUndefinedAllowed!==undefined) {
                arrCallUndefinedAllowed = new Array(loar.finalTypes.length);
                arrCallUndefinedAllowed.fill(/*value*/ false);
                arrCallUndefinedAllowed[idx] = callUndefinedAllowed;
            }
            const {rootLogicalObject,rootNonObj, sci} = floughLogicalObjectModule.logicalObjectModify(arr, loar, arrCallUndefinedAllowed);
            const type = floughTypeModule.createTypeFromLogicalObject(rootLogicalObject, rootNonObj);
            return { ...this.getSymbolData(loar), type, sci };
        }
    };
    //export type LogicalObjectAccessModule = typeof logicalObjectAccessModule;
    // export function logicalObjectAccessReturnGetFinalCarriedQdotUndefined(loar: Readonly<LogicalObjectAccessReturn>, finalIdx: number): boolean {
    //     const lastColl = loar.collated[loar.collated.length-1];
    //     return lastColl.carriedQdotUndefinedsOut[finalIdx];
    // }
    // export function logicalObjectAccessReturnGetSymbol(loar: Readonly<LogicalObjectAccessReturn>, finalIdx: number): boolean {

    function removeDupicateLogicalObjectBasicTypes(logicalObject: Readonly<FloughLogicalObjectInner>): FloughLogicalObjectInner {
        const map = new Map<Type,FloughLogicalObjectBasic[]>();
        let hasDuplicates = false;
        forEachLogicalObjectBasic(logicalObject, (logicalObjectBasic)=>{
            const arr = map.get(logicalObjectBasic.tsType);
            if (arr===undefined) map.set(logicalObjectBasic.tsType, [logicalObjectBasic]);
            else {
                hasDuplicates = true;
                arr.push(logicalObjectBasic);
            }
        });
        //const mapTypeToBasic = new Map<Type,FloughLogicalObjectBasic>();
        if (!hasDuplicates){
            return logicalObject;
        }
        const items: FloughLogicalObjectBasic[] = [];
        map.forEach((arr, /*_tstype*/)=>{
            if (arr.length===1){
                items.push(arr[0]);
            }
            else {
                const logicalObjectBasic = unionOfSameBaseTypesWithVariationsV2(arr);
                items.push(logicalObjectBasic);
            }
        });
        if (items.length===1) return items[0];
        return {
            kind: FloughLogicalObjectKind.union,
            items,
            id: nextLogicalObjectInnerId++,
            [essymbolFloughLogicalObject]: true
        };
    }

    // const fakeTsObjectTypeCarryFalse = { _: "carryFalse" } as any as ObjectType;
    // const fakeTsObjectTypeCarryTrue = { _: "carryTrue" } as any as ObjectType;
    // const fakeLogicalObjectCarryFalse = createFloughLogicalObjectPlain(fakeTsObjectTypeCarryFalse);
    // const fakeLogicalObjectCarryTrue = createFloughLogicalObjectPlain(fakeTsObjectTypeCarryTrue);

    type FakeObjectType = ObjectType & {symbolFakeObjectType: true};
    const symbolFakeObjectType = Symbol("fakeObjectType");
    function createFakeTsObjectType(): FakeObjectType {
        return { ...{ _: "fake" }, [symbolFakeObjectType]:undefined } as any as FakeObjectType;
    }
    function isFakeTsObjectType(tstype: ObjectType): tstype is FakeObjectType {
        // eslint-disable-next-line no-in-operator
        return symbolFakeObjectType in tstype;
    }

    /***
     *
     */
    function collateByBaseType(typesIn: Readonly<FloughType[]>, expr: Expression, prevArrCarryQdotUndefined?: (boolean | undefined)[]): Collated {
        type IndexingBasic = & { logicalObjectBasic: FloughLogicalObjectBasic, carryQdotUndefined: boolean };

        const qdot = (expr as AccessExpression)?.questionDotToken;
        // const baseLogicalObjects: FloughLogicalObjectInnerIF[] = [];
        // const nonObjTypes: FloughType[]=[];
        //type Value = & { rootIdx: number, idxInRoot: number, logicalObject: FloughLogicalObjectPlain };
        const map = new Map<Type,IndexingBasic[]>();
        //const remap = new Map<FloughLogicalObjectBasic,FloughLogicalObjectBasic>();
        //const arrmap2: (ESMap<Type,FloughLogicalObjectBasic> | undefined)[]=[];
        const mapTsTypeToLogicalObjectsInIdx = new Map<Type,number[]>();
        //const nonObjType: FloughType = floughTypeModule.createNeverType(); //
        const logicalObjectsIn: (FloughLogicalObjectInner | undefined)[] = [];
        const nobjTypesIn: (FloughType | undefined)[]=[];
        typesIn.forEach((root, _iroot)=>{
            const {logicalObject:logicalObjectOuterIF,remaining} = floughTypeModule.splitLogicalObject(root);
            nobjTypesIn.push(remaining);
            let carryQdotUndefined = false;
            if ((remaining && qdot && floughTypeModule.hasUndefinedOrNullType(remaining) === true) || prevArrCarryQdotUndefined?.[_iroot]){
                carryQdotUndefined = true;
            }
            if (logicalObjectOuterIF) {
                let logicalObject = floughLogicalObjectModule.getInnerIF(logicalObjectOuterIF) as FloughLogicalObjectInner;
                logicalObject = removeDupicateLogicalObjectBasicTypes(logicalObject);
                logicalObjectsIn.push(logicalObject);
                if (_iroot===0) {
                    const map2 = getBaseLogicalObjects(logicalObject);
                    map2.forEach((logobj,tsType)=>{
                        mapTsTypeToLogicalObjectsInIdx.set(tsType,[_iroot]);
                        map.set(tsType, [{ logicalObjectBasic: logobj, carryQdotUndefined }]);
                    });
                }
                else {
                    const map2 = getBaseLogicalObjects(logicalObject);
                    map2.forEach((logobj,tsType)=>{
                        const entry: IndexingBasic = { logicalObjectBasic: logobj, carryQdotUndefined };
                        const got = map.get(logobj.tsType);
                        if (!got) map.set(logobj.tsType, [entry]);
                        else got.push(entry);
                        const got2 = mapTsTypeToLogicalObjectsInIdx.get(tsType);
                        if (!got2) mapTsTypeToLogicalObjectsInIdx.set(tsType, [_iroot]);
                        else got2.push(_iroot);
                    });
                }
            }
            else {
                const tsType = createFakeTsObjectType();
                const logobj = createFloughLogicalObjectPlain(tsType);
                logicalObjectsIn.push(undefined);
                map.set(logobj.tsType, [{ logicalObjectBasic: logobj, carryQdotUndefined }]);
                mapTsTypeToLogicalObjectsInIdx.set(tsType, [_iroot]);
            }
        });
        const collated: Collated = {
            logicalObjectsIn,
            logicalObjectsPlainOut: [],
            nobjTypesIn,
            //nobjTypeOut: [],
            mapTsTypeToLogicalObjectPlainOutIdx: new Map(),
            mapTsTypeToLogicalObjectsInIdx,
            carriedQdotUndefinedsOut: [],
            //remainingNonObjType: nonObjType,
        };
        map.forEach((value,_key)=>{
            if (value.length===1) {
                collated.mapTsTypeToLogicalObjectPlainOutIdx.set(value[0].logicalObjectBasic.tsType, collated.logicalObjectsPlainOut.length);
                collated.logicalObjectsPlainOut.push(value[0].logicalObjectBasic);
                collated.carriedQdotUndefinedsOut.push(value[0].carryQdotUndefined);
                //collated.nobjTypeOut.push(value[0].nobjType);
            }
            else {
                collated.mapTsTypeToLogicalObjectPlainOutIdx.set(value[0].logicalObjectBasic.tsType, collated.logicalObjectsPlainOut.length);
                const u = unionOfSameBaseTypesWithVariationsV2(value.map(x=>x.logicalObjectBasic)); // TODO: change value to array of logical object
                collated.logicalObjectsPlainOut.push(u);
                collated.carriedQdotUndefinedsOut.push(value.some(x=>x.carryQdotUndefined));
                //collated.nobjTypeOut.push(u.nobjType);
            }
        });
        return collated;
    }


    function logicalObjectAccess(
        rootsWithSymbols: Readonly<RefTypesTableReturn[]>,
        roots: Readonly<FloughType[]>,
        akeyType: Readonly<FloughType[]>,
        aexpression: Readonly<(PropertyAccessExpression | ElementAccessExpression)[]>,
        // groupNodeToTypeMap: ESMap<Node,Type>,
    ): LogicalObjectAccessReturn {
        function getLiteralKey(kt: Readonly<FloughType>): string | undefined {
            //const accessKeys = floughTypeModule.getAccessKeysMutable(kt);
            const keys = floughTypeModule.getObjectUsableAccessKeys(kt);
            if (keys.stringSet.size===1) {
                return keys.stringSet.values().next().value as string;
            }
            return undefined;
        }

        let collated0 = collateByBaseType(roots, aexpression[0]);
        const acollated: Collated[] = [collated0];
        const astringkeys: (string | undefined)[] = [];
        let finalLiteralKeyAndType: { literalKey?: string | undefined, type: FloughType }[];
        //const aqdot: boolean[] = aexpression.map(e=>!!(e as PropertyAccessExpression).questionDotToken);
        // Temporary test - does not examine each type for null/undefined
        // @ ts-expect-error
        //let hasFinalQdotUndefined = false; //aqdot.some(b=>b);
        //const finalCarriedQdotUndefineds: (boolean | undefined)[] = [];

        for (let i=0, ie=akeyType.length; i!==ie; i++){
            const nextKey = getLiteralKey(akeyType[i]);
            astringkeys.push(nextKey);
            //const nextTypes: FloughType[] = [];
            // TODO: or note: literalKey value is identical for all members of nextKeyAndType array. That is redundant.
            const nextKeyAndType: { literalKey?: string | undefined, type: FloughType | undefined }[] = [];
            // for (let j=0, je=collated0.nobjTypesIn.length; j!==je; j++){
            //     let type;
            //     if ((type=collated0.nobjTypesIn[j]) && floughTypeModule.hasUndefinedOrNullType(type)){
            //         hasFinalQdotUndefined = true;
            //         // Note: Should the undefined type be removed from collated0.nobjTypesIn[j]?
            //         // - No.  It's removed in modify if and only if the propagated undefined is accepted by the criteria.
            //     }
            // }
            if (nextKey){
                for (let j=0, je=collated0.logicalObjectsPlainOut.length; j!==je; j++){
                    const { type, literalKey } = getTypeAtIndexFromBase(collated0.logicalObjectsPlainOut[j], nextKey);
                    // if (aexpression[i].questionDotToken && floughTypeModule.hasUndefinedOrNullType(type)){
                    //     addUndefinedToFinal = true;
                    // }
                    nextKeyAndType.push({ type, literalKey });
                }
            }
            else {
                for (let j=0, je=collated0.logicalObjectsPlainOut.length; j!==je; j++){
                    const type = getTypeOverIndicesFromBase(collated0.logicalObjectsPlainOut[j], akeyType[i]);
                    // if (aexpression[i].questionDotToken && floughTypeModule.hasUndefinedOrNullType(type)){
                    //     addUndefinedToFinal = true;
                    // }
                    nextKeyAndType.push({ type });
                }
            }
            if (i<akeyType.length-1){
                collated0 = collateByBaseType(nextKeyAndType.map(x=>x.type??floughTypeModule.createUndefinedType()) as FloughLogicalObjectInner[], aexpression[i+1]);
                collated0.arrLiteralKeyIn = nextKeyAndType.map(x=>x.literalKey);
                acollated.push(collated0);
            }
            else {
                // Note: hasFinalQdotUndefined is now included within getFinalTypesFromLogicalObjectAccessReturn()
                finalLiteralKeyAndType = nextKeyAndType.map(x=>{
                    //if (hasFinalQdotUndefined && x.type) floughTypeModule.addUndefinedTypeMutate(x.type);
                    //Debug.assert(x.type!==undefined); // TODO: why would it be undefined?
                    //if (isFakeTsObjectType(x.type)) return { type:floughTypeModule.createNeverType(), iteralKey:x.literalKey };
                    return { type:x.type??floughTypeModule.createUndefinedType(), literalKey:x.literalKey };
                });
                // finalCarriedQdotUndefineds would just be an exact copy, no need.
                //finalCarriedQdotUndefineds = acollated[akey.length-1].carriedQdotUndefinedOut;
            }
        }
        return { rootsWithSymbols, roots, collated: acollated, aLiterals: astringkeys, finalTypes: finalLiteralKeyAndType!, aexpression };
    }
    function getFinalTypesFromLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, includeQDotUndefined: boolean): Readonly<FloughType[]> {
        if (includeQDotUndefined){
            const finalCarriedQdotUndefineds = loar.collated[loar.collated.length-1].carriedQdotUndefinedsOut;
            return loar.finalTypes.map((x,idx)=>{
                const type = floughTypeModule.cloneRefTypesType(x.type);
                if (finalCarriedQdotUndefineds[idx]) floughTypeModule.addUndefinedTypeMutate(type);
                return type;
            });
        }
        return loar.finalTypes.map(x=>x.type);
    }
    /**
     * Modifies loar by calling logicalObjectModify as though all final types are "type" and are target criteria result.
     * This is done because logicalObjectModify will handle the making new logical objects objects and setting `variations` properly.
     * TODO: This could be problematic with regards to propagation of undefined with qdots,
     * because it will allow undefined to be removed from intermediate types in the access chain, but it shouldn't.
     * That can be fixed by removing any `undefined` from the final types before calling `logicalObjectModify`,
     * and then adding adding it back in to the final type afterwards.
     * @param loar
     * @param type
     * @returns
     */
    function assignFinalTypeToLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, type: Readonly<FloughType>): {
        rootLogicalObject: FloughLogicalObjectInner, rootNobj: FloughType
    }{
        const aft: FloughType[] = Array(loar.finalTypes.length).fill(type);
        const x = logicalObjectModify(aft,loar);
        // const x: {
        //     rootLogicalObject: FloughLogicalObjectInner | undefined;
        //     rootNonObj: FloughType | undefined;
        //     type: Readonly<FloughType>;
        // }[]
        // const rootLogicalObject =
        // const rootNobj = floughTypeModule.unionOfRefTypesType(x.map(y=>y.rootNonObj).filter(y=>y) as FloughType[]);
        Debug.assert(x.rootLogicalObject);
        return { rootLogicalObject:x.rootLogicalObject ,rootNobj:x.rootNonObj??floughTypeModule.getNeverType() };
    }
    function getRootAtLevelFromLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, level: number): {rootLogicalObject: Readonly<FloughLogicalObjectInner> | undefined, rootNobj: Readonly<FloughType> } {
        const arrNonNullLogicalObjects = loar.collated[level].logicalObjectsPlainOut.filter(x=>x && !isFakeTsObjectType(x.tsType)) as FloughLogicalObjectInner[];
        const rootLogicalObject = arrNonNullLogicalObjects.length ?
            unionOfFloughLogicalObjects((arrNonNullLogicalObjects))
            : undefined;
        // eslint-disable-next-line prefer-const
        let rootNobj = floughTypeModule.unionOfRefTypesType(loar.collated[level].nobjTypesIn.filter(y=>y) as FloughType[]);
        // if (loar.aexpression[level].questionDotToken && floughTypeModule.hasUndefinedOrNullType(rootNobj)){
        //     rootNobj = floughTypeModule.cloneRefTypesType(rootNobj);
        //     floughTypeModule.removeUndefinedNullMutate(rootNobj);
        // }

        return { rootLogicalObject,rootNobj };
    }

    // function getTsTypesInChainOfLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>): Type[][] {
    //     const results: Type[][] = loar.collated.map(collated=>{
    //         const result: Type[] = [];//[collated.remainingNonObjType];
    //         collated.nobjTypesIn.forEach(x=>{
    //             if (x) floughTypeModule.getTsTypesFromFloughType(x).forEach(x=>result.push(x));
    //         });
    //         collated.logicalObjectsPlainOut.forEach(x=>{
    //             checker.forEachType(x.tsType, t=>{
    //                 if (extraAsserts){
    //                     Debug.assert((t.flags & TypeFlags.Object));
    //                 }
    //                 result.push(t);
    //             });
    //         });
    //         return result;
    //     });
    //     return results;
    // }


    /**
     *
     * @param map
     * @param arrNewlogicalObjectBasic
     * @returns
     */
    function replaceOrFilterLogicalObjectsM(
        logicalObjectIn: Readonly<FloughLogicalObjectInner>,
        map: Readonly<ESMap<Type,number>>,
        arrNewlogicalObjectBasic: Readonly<(FloughLogicalObjectBasic | undefined)[]>
    ): FloughLogicalObjectInner | undefined {
        function replaceOrFilter(logicalObject: Readonly<FloughLogicalObjectInner>): FloughLogicalObjectInner | undefined{
            if (logicalObject.kind==="plain"){
                if (extraAsserts){
                    Debug.assert(map.has(logicalObject.tsType));
                }
                return arrNewlogicalObjectBasic[map.get(logicalObject.tsType)!];
                // replace or filter - not present in map means it should be filtered
                // if (map.has(logicalObject.tsType)) {
                //     return arrNewlogicalObjectBasic[map.get(logicalObject.tsType)!];
                // }
                // return logicalObject; // TODO: this be undefined? Or mark as filtered.
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




    export type LogicalObjectModifyInnerReturnType = & {
        rootLogicalObject: FloughLogicalObjectInner | undefined,
        rootNonObj: FloughType | undefined;
        //type: Readonly<FloughType>;
        sci: Readonly<RefTypesSymtabConstraintItem>
    };
    /**
     * function logicalObjectModify
     * @param modTypesIn
     * @param state
     * @param arrCallUndefinedAllowed
     * @param arrQdotUndefined - same length as modTypesIn
     *  - if true, then return the branches that procuded a final qdot undefined for the corresponding index
     * @returns
     */
    function logicalObjectModify(
        modTypesIn: Readonly<(FloughType | undefined)[]>,
        state: LogicalObjectAccessReturn, // same length as modTypesIn
        arrCallUndefinedAllowed?: Readonly<boolean[]> | undefined, // same length as modTypesIn
        //arrQdotUndefined?: Readonly<(boolean | undefined)[]> | undefined
    ): LogicalObjectModifyInnerReturnType {
        if (extraAsserts) Debug.assert(state.finalTypes.length===modTypesIn.length);
        /**
         * TODO: Optimize this function expecting only one of modTypesIn to be non-undefined.
         * Originally this function was intended to allow modTypesIn to have multiple non-undefined values,
         * but now it is only called via logicalObjectAccessModule.modifyOne() which calls this function with only has a single non-undefined value.
         */

        const doLog = true;
        if (getMyDebug()){
            if (doLog){
                consoleGroup(`logicalObjectModify[in]`);
                modTypesIn.forEach((mt,idx)=>{
                    const st = state.finalTypes[idx].type;
                    if (mt){
                        floughTypeModule.dbgFloughTypeToStrings(mt).forEach(s=>{
                            consoleLog(`logicalObjectModify[in] modTypesIn[${idx}]: ${s}`);
                        });
                    }
                    else consoleLog(`logicalObjectModify[in] modTypesIn[${idx}]: <undef>`);
                    floughTypeModule.dbgFloughTypeToStrings(st).forEach(s=>{
                        consoleLog(`logicalObjectModify[in] state.finalTypes[${idx}]: ${s}`);
                    });
                    if (arrCallUndefinedAllowed){
                        consoleLog(`logicalObjectModify[in] arrCallUndefinedAllowed[${idx}]: ${arrCallUndefinedAllowed[idx]}`);
                    }
                });
            }
        }

        function unionOfNonObj(anonobj: Readonly<(FloughType | undefined)[]>) {
            return anonobj.reduce((accum,curr)=>{
                if (!curr) return accum;
                if (!accum) return floughTypeModule.cloneType(curr);
                else return floughTypeModule.unionWithFloughTypeMutate(curr,accum);
            });
        }
        // function calcNonObjWithQdot(nonObj: Readonly<FloughType> | undefined, level: number, finalTypeHasUndefined: boolean): FloughType | undefined{
        //     if (nonObj && state.aexpression[level].questionDotToken && !finalTypeHasUndefined){
        //         const r = floughTypeModule.cloneType(nonObj);
        //         floughTypeModule.removeUndefinedNullMutate(r);
        //         return r;
        //     }
        //     return nonObj;
        // }

        let defaultRoot: { rootLogicalObject: FloughLogicalObjectInner, rootNonObj: FloughType | undefined, sci: RefTypesSymtabConstraintItem } | undefined;
        function calcDefaultRoot(): { rootLogicalObject: FloughLogicalObjectInner | undefined, rootNonObj: FloughType | undefined, sci: RefTypesSymtabConstraintItem } {
            if (defaultRoot) return defaultRoot;
            Debug.assert(state.collated[0].logicalObjectsPlainOut.length!==0);
            // if (state.collated[0].logicalObjectsPlainOut.length===1){
            //     return (defaultRoot = state.collated[0].logicalObjectsPlainOut[0]);
            // }
            const rootLogicalObject = unionOfFloughLogicalObjects(state.collated[0].logicalObjectsPlainOut.filter(x=>!isFakeTsObjectType(x.tsType)) as FloughLogicalObjectInner[]);
            const sci = orSymtabConstraints(state.rootsWithSymbols.map(x=>x.sci));
            return defaultRoot = {
                rootLogicalObject,
                rootNonObj: unionOfNonObj(state.collated[0].nobjTypesIn),
                sci
            };
        }
        const results: ReturnType<typeof logicalObjectModify>[] = [];
        // const preResults: { modTypeIdx: number, collated0InIndices: number[] }[] = [];

        Debug.assert(modTypesIn.length===state.finalTypes.length);
        Debug.assert(state.collated[state.collated.length-1].logicalObjectsPlainOut.length ===state.finalTypes.length);
        Debug.assert(state.collated.length===state.aLiterals.length);
        for (let modTypeIdx = 0; modTypeIdx<modTypesIn.length; modTypeIdx++){
            // check presence of keys all the way down
            if (state.finalTypes[modTypeIdx].literalKey===undefined) {
                results.push({ ...calcDefaultRoot()/*, type: state.finalTypes[modTypeIdx].type*/ });
                continue;
            }
            // if (!modTypesIn[modTypeIdx]) continue;
            // if (floughTypeModule.isNeverType(modTypesIn[modTypeIdx]!)) continue;
            const finalModOrCallResultTypeHasUndefined = arrCallUndefinedAllowed ?
                arrCallUndefinedAllowed[modTypeIdx] : (modTypesIn[modTypeIdx] && floughTypeModule.hasUndefinedType(modTypesIn[modTypeIdx]!));
            //const finalModTypeHasUndefined = floughTypeModule.hasUndefinedType(modTypesIn[modTypeIdx]!);
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
                    results.push({ ...calcDefaultRoot(), /*type: modTypesIn[modTypeIdx]??floughTypeModule.getNeverType()*/ });
                    continue;
                }
            }

            /**
             * Enforce a unique rootlet by creating a creating new pathlets from the final modified type back to the root.
             *
             */

            const doOneLevel = (level: number, indicesIn: readonly number[], typesIn: Readonly<(FloughType | undefined)[]>): {
                nextIndices: number[],
                nextTypesIn: (FloughType | undefined)[],
            } => {
                const coll = state.collated[level];
                const arrNewLogicalObjectBasic: (FloughLogicalObjectBasic | undefined)[] = Array(coll.logicalObjectsPlainOut.length);
                arrNewLogicalObjectBasic.fill(/**/ undefined);
                const nextIndicesSet = new Set<number>();
                for (const idx of indicesIn){
                    const oldLogicalObjectBasic = coll.logicalObjectsPlainOut[idx];
                    coll.mapTsTypeToLogicalObjectsInIdx.get(oldLogicalObjectBasic.tsType)!.forEach(x=>nextIndicesSet.add(x));
                    const key = state.aLiterals[level];
                    // const key = coll.arrLiteralKeyIn?.[idx];
                    Debug.assert(key);
                    //let newLogicalObjectBasic: FloughLogicalObjectBasic | undefined;
                    if (!typesIn[idx] || floughTypeModule.isNeverType(typesIn[idx]!)){
                        continue;
                    }
                    /**
                     * If oldLogicalObjectBasic is a fake, it is not even an object,
                     * it cannot have keys, and therefore the key value cannot be set.
                     * That should be detected as an error by error detection code (not here).
                     * Note the the index has been added to nextIndicesSet, so it will be processed.
                     */
                    if (isFakeTsObjectType(oldLogicalObjectBasic.tsType)) {
                        continue;
                    }
                    const variations = new Map<string,FloughType>(oldLogicalObjectBasic.variations);
                    variations.set(key,typesIn[idx]!);
                    //const key = childcoll.arrLiteralKeyIn![basicIdx]!;
                    // const { logicalObject, nonObj } = typesIn[idx] ? floughTypeModule.splitLogicalObject(typesIn[idx]!) : { logicalObject: undefined, nonObj: undefined };
                    arrNewLogicalObjectBasic[idx] = { ...oldLogicalObjectBasic, variations, id: nextLogicalObjectInnerId++ }; // TODO: createLogicalObjectBasic
                }
                const nextIndices: number[] = [];
                nextIndicesSet.forEach(x=>nextIndices.push(x));
                //const arrNewLogicalObjectIn: (FloughLogicalObjectInner | undefined)[] = Array(coll.logicalObjectsIn.length);
                const arrNextTypesIn: (FloughType | undefined)[] = Array(coll.logicalObjectsIn.length);
                for (const idx of nextIndices){
                    // IWOZERE
                    let inner: FloughLogicalObjectInner | undefined;
                    if (coll.logicalObjectsIn[idx]) {
                        inner = replaceOrFilterLogicalObjectsM(
                            coll.logicalObjectsIn[idx]!,
                            coll.mapTsTypeToLogicalObjectPlainOutIdx,
                            arrNewLogicalObjectBasic
                        );
                    }
                    let nobjType: FloughType | undefined;
                    if (coll.nobjTypesIn[idx] && finalModOrCallResultTypeHasUndefined && (state.aexpression[level] as AccessExpression)?.questionDotToken){
                        // intermediate objects are cleared of all nobj types expect null or undefined
                        nobjType=floughTypeModule.intersectionWithUndefinedNull(coll.nobjTypesIn[idx]!);
                    }
                    if (inner || nobjType){
                        const outer = inner ? floughLogicalObjectModule.createFloughLogicalObjectFromInner(inner,/*edType*/ undefined) : undefined;
                        arrNextTypesIn[idx] = floughTypeModule.createTypeFromLogicalObject(outer,nobjType);
                    }
                }
                return { nextIndices, nextTypesIn: arrNextTypesIn };
            };

            let nextIndices: readonly number[] = [modTypeIdx];
            let nextTypesIn: readonly (FloughType | undefined)[] = modTypesIn;
            for (let lev = state.collated.length-1; lev>=0; lev--){
                ({nextIndices,nextTypesIn} = doOneLevel(lev,nextIndices,nextTypesIn));
            }
            {
                const ut = floughTypeModule.unionOfRefTypesType(nextTypesIn.filter(x=>!!x) as FloughType[]);
                const { logicalObject: rootLogicalObjectOuter, remaining: rootNonObj } = floughTypeModule.splitLogicalObject(ut);
                const rootLogicalObject = rootLogicalObjectOuter ? floughLogicalObjectModule.getInnerIF(rootLogicalObjectOuter) as FloughLogicalObjectInner: undefined;
                const arrsci = nextIndices.filter(idx=>{
                    if (extraAsserts) Debug.assert(!nextTypesIn[idx] || !floughTypeModule.isNeverType(nextTypesIn[idx]!));
                    return nextTypesIn[idx];
                }).map(idx=>state.rootsWithSymbols[idx].sci);
                const sci = arrsci.length ? orSymtabConstraints(arrsci) : createRefTypesSymtabConstraintItemNever();
                results.push({ rootLogicalObject, rootNonObj, /*type: modTypesIn[modTypeIdx]??floughTypeModule.getNeverType(),*/ sci });
            }


        }  //for (let modTypeIdx = 0; modTypeIdx<modTypesIn.length; modTypeIdx++)

        const ret: LogicalObjectModifyInnerReturnType = {
            // Note: type is actually the final type, not the type of the root.
            //type: floughTypeModule.unionOfRefTypesType(results.map(x=>x.type)),
            rootNonObj: floughTypeModule.unionOfRefTypesType(results.map(x=>x.rootNonObj).filter(x=>x) as FloughType[]),
            rootLogicalObject: unionOfFloughLogicalObjectWithTypeMerging(results.map(x=>x.rootLogicalObject)),
            sci: orSymtabConstraints(results.map(x=>x.sci)),
        };

        if (getMyDebug()){
            if (doLog){
                results.forEach((r,ridx)=>{
                    const hstr = `logicalObjectModify[out] [${ridx}] `;
                    // if (r.type) floughTypeModule.dbgFloughTypeToStrings(r.type).forEach(s=>consoleLog(`${hstr} type: ${s}`));
                    // else consoleLog(`${hstr} type: <undef>`);
                    if (r.rootNonObj) floughTypeModule.dbgFloughTypeToStrings(r.rootNonObj).forEach(s=>consoleLog(`${hstr} rootNonObj: ${s}`));
                    else consoleLog(`${hstr} rootNonObj: <undef>`);
                    if (r.rootLogicalObject) dbgLogicalObjectToStrings(r.rootLogicalObject).forEach(s=>consoleLog(`${hstr} rootLogicalObject: ${s}`));
                    else consoleLog(`${hstr} rootLogicalObject: <undef>`);
                    dbgRefTypesSymtabConstrinatItemToStrings(r.sci).forEach(s=>consoleLog(`${hstr} sci: ${s}`));
                });
                {
                    consoleLog("logicalObjectModify[out] --- unionized");
                    const hstr = `logicalObjectModify[out] [union]`;
                    const r = ret;
                    // if (r.type) floughTypeModule.dbgFloughTypeToStrings(r.type).forEach(s=>consoleLog(`${hstr} type: ${s}`));
                    // else consoleLog(`${hstr} type: <undef>`);
                    if (r.rootNonObj) floughTypeModule.dbgFloughTypeToStrings(r.rootNonObj).forEach(s=>consoleLog(`${hstr} rootNonObj: ${s}`));
                    else consoleLog(`${hstr} rootNonObj: <undef>`);
                    if (r.rootLogicalObject) dbgLogicalObjectToStrings(r.rootLogicalObject).forEach(s=>consoleLog(`${hstr} rootLogicalObject: ${s}`));
                    else consoleLog(`${hstr} rootLogicalObject: <undef>`);
                    dbgRefTypesSymtabConstrinatItemToStrings(r.sci).forEach(s=>consoleLog(`${hstr} sci: ${s}`));
                }
                consoleGroupEnd();
            }
        }
        return ret;
        //return results;
    } // logicalObjectModify

    export type ResolveInKeywordReturnType = & {
        passing?: [string,FloughLogicalObjectIF][];
        failing?: [string,FloughLogicalObjectIF][];
        bothing?: FloughLogicalObjectIF;
    };
    function resolveInKeyword(_logicalObjectIn: Readonly<FloughLogicalObjectInner>, accessKeys: ObjectUsableAccessKeys): ResolveInKeywordReturnType {
        Debug.assert(!accessKeys.genericString, "accessKeys.genericString unexpected, should have been handled upstairs");
        const passing = new Map<string,FloughLogicalObjectBasic[]>();
        const failing = new Map<string,FloughLogicalObjectBasic[]>();
        const bothing: FloughLogicalObjectPlain[]=[];
        function put(map: ESMap<string,FloughLogicalObjectBasic[]>, key: string, logobj: Readonly<FloughLogicalObjectPlain>): void {
            const arr = map.get(key);
            if (arr) {
                Debug.fail("unexpected");
                //arr.push(logobj);
            }
            else map.set(key,[logobj]);
        }
        function doTupleWithKey(logobj: Readonly<FloughLogicalObjectPlain>, _key: string): void {
            if (extraAsserts) Debug.assert(checker.isTupleType(logobj.tsType));
            Debug.fail("not yet implemented");
        }
        function doObjectWithKey(logobj: Readonly<FloughLogicalObjectPlain>, key: string): void {
            if (extraAsserts) Debug.assert(!checker.isArrayOrTupleType(logobj.tsType));
            const propSymbol = checker.getPropertyOfType(logobj.tsType,key);
            if (!propSymbol) {
                put(failing,key,logobj);
                return;
            }
            const isOptional = propSymbol.flags & SymbolFlags.Optional;
            if (!isOptional){
                put(passing,key,logobj);
                return;
            }
            // @ts-ignore-error
            let hasKeys: HasKeys | undefined;
            let hasKeyItem: HasKeyItem | undefined;
            if (hasKeyItem = (hasKeys=logobj.haskeys)?.get(key)){
                const {yes,no} = hasKeyItem;
                if (extraAsserts) Debug.assert(yes||no, "unexpected");
                if (yes && no){
                    // one case split into two
                    const y = cloneFloughLogicalObjectPlain(logobj);
                    y.haskeys!.set(key, { yes:true,no:false });
                    put(passing,key,y);

                    const n = cloneFloughLogicalObjectPlain(logobj);
                    n.haskeys!.set(key, { yes:false,no:true });
                    if (true){
                        n.variations?.delete(key);
                    }
                    put(failing,key,y);
                }
                if (hasKeyItem.no) {
                    put(failing,key,logobj);
                }
                if (hasKeyItem.yes) {
                    put(passing,key,logobj);
                }
                return;
            }
            else {
                const y = cloneFloughLogicalObjectPlain(logobj);
                (y.haskeys = new Map<string,HasKeyItem>()).set(key, { yes:true,no:false });
                put(passing,key,y);

                const n = cloneFloughLogicalObjectPlain(logobj);
                (n.haskeys = new Map<string,HasKeyItem>()).set(key, { yes:false,no:true });
                if (true){
                    n.variations?.delete(key);
                }
                put(failing,key,n);
            }
        }

        function helper(logobj: Readonly<FloughLogicalObjectInner>){
            if (logobj.kind===FloughLogicalObjectKind.plain){
                if (checker.isArrayType(logobj.tsType)){
                    if (accessKeys.genericNumber || accessKeys.numberSubset){
                        bothing.push(logobj);
                    }
                }
                else if (checker.isTupleType(logobj.tsType)){
                    if (accessKeys.genericNumber){
                        bothing.push(logobj);
                    }
                    else {
                        accessKeys.numberSubset?.forEach(key=>{
                            doTupleWithKey(logobj,key);
                        });
                    }
                }
                else {
                    accessKeys.stringSet?.forEach(key=>{
                        doObjectWithKey(logobj,key);
                    });
                }
            }
            else if (logobj.kind===FloughLogicalObjectKind.union || logobj.kind===FloughLogicalObjectKind.tsunion){
                logobj.items.forEach(item=>helper(item));
            }
            else {
                Debug.fail("not yet implemented: ", () => logobj.kind);
            }
        }
        helper(_logicalObjectIn);
        if (extraAsserts) {
            passing.forEach((value,_key)=>{
                const s = new Set<FloughLogicalObjectPlain>(value);
                Debug.assert(s.size===value.length, "unexpected duplicates");
            });
            failing.forEach((value,_key)=>{
                const s = new Set<FloughLogicalObjectPlain>(value);
                Debug.assert(s.size===value.length, "unexpected duplicates");
            });
            const sb = new Set<FloughLogicalObjectPlain>(bothing);
            Debug.assert(sb.size===bothing.length, "unexpected duplicates");
        }
        const ret: ResolveInKeywordReturnType = { };
        function convert(x: Readonly<ESMap<string,FloughLogicalObjectBasic[]>>) {
            const r: [string,FloughLogicalObjectIF][] = [];
            x.forEach((value,key)=>{
                r.push([
                    key,
                    floughLogicalObjectModule.createFloughLogicalObjectFromInner(
                        createFloughLogicalObjectUnion(value) as FloughLogicalObjectInnerIF, /*edType*/ undefined)
                ]);
            });
            return r;
        }
        if (passing.size) ret.passing = convert(passing);
        if (failing.size) ret.failing = convert(failing);
        if (bothing.length) {
            ret.bothing = floughLogicalObjectModule.createFloughLogicalObjectFromInner(
                createFloughLogicalObjectUnion(bothing), /*edType*/ undefined);
        }
        return ret;
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
                        floughTypeModule.dbgFloughTypeToStrings(value).forEach(s=>{
                            as.push(`  variation:  key:${key}], value:${s}`);
                        });
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

    function dbgLogicalObjectAccessResult(loar: Readonly<LogicalObjectAccessReturn>): string[] {
        const astr: string[] = [];
        let str = "aLiterals:";
        loar.aLiterals.forEach(x=>{
            str += x ? x : "<undef>";
        });
        astr.push(str);
        loar.finalTypes.forEach((x,idx)=>{
            astr.push(`finalTypes[${idx}] literalKey: ${x.literalKey? x.literalKey : "<undef>"}`);
            floughTypeModule.dbgFloughTypeToStrings(x.type).forEach(s=>astr.push(`finalTypes[${idx}] type:${s}`));
        });
        loar.roots.forEach((x,idx)=>{
            floughTypeModule.dbgFloughTypeToStrings(x).forEach(s=>astr.push(`roots[${idx}] type:${s}`));
        });
        loar.rootsWithSymbols.forEach((x,idx)=>{
            mrNarrow.dbgRefTypesTableToStrings(x).forEach(s=>astr.push(`rootsWithSymbols[${idx}] sci:${s}`));
            // floughTypeModule.dbgFloughTypeToStrings(x.type).forEach(s=>astr.push(`rootsWithSymbols[${idx}] type:${s} `));
            // const s = dbgs.dbgSymbolToStringSimple(x.symbol);
            // astr.push(`rootsWithSymbols[${idx}] symbol:${s} `);
        });
        loar.collated.forEach((c,idx0)=>{
            c.mapTsTypeToLogicalObjectPlainOutIdx.forEach((idx,type)=>{
                astr.push(`collated[${idx0}].mapTsTypeToLogicalObjectPlainOutIdx: ${isFakeTsObjectType(type as ObjectType)?"<faketype>" : `type.id:${type.id}`}->${idx}`);
            });
            c.mapTsTypeToLogicalObjectsInIdx.forEach((idx,type)=>{
                astr.push(`collated[${idx0}].mapTsTypeToLogicalObjectsInIdx: ${type.id}->${idx}`);
            });
            if (c.nobjTypesIn.length!==c.logicalObjectsIn.length){
                Debug.assert(false, `c.nobjTypesIn.length!==c.logicalObjectsIn.length, `, ()=>`${c.nobjTypesIn.length}!==${c.logicalObjectsIn.length}`);
            }
            Debug.assert(c.nobjTypesIn.length===c.logicalObjectsIn.length);
            for (let idx1=0; idx1<c.nobjTypesIn.length; idx1++){
                if (!c.nobjTypesIn[idx1]) astr.push(`collated[${idx0}].nobjTypeIn[${idx1}]: <undef>`);
                else floughTypeModule.dbgFloughTypeToStrings(c.nobjTypesIn[idx1]!).forEach(s=>astr.push(`collated[${idx0}].nobjTypeOut[${idx1}]: ${s}`));
                if (c.logicalObjectsIn[idx1]) dbgLogicalObjectToStrings(c.logicalObjectsIn[idx1]!).forEach(s=>astr.push(`collated[${idx0}].logicalObjectsIn[${idx1}]: ${s}`));
                else astr.push(`collated[${idx0}].logicalObjectsIn[${idx1}]: <undef>`);
            }
            c.logicalObjectsPlainOut.forEach((x,idx1)=>{
                if (isFakeTsObjectType(x.tsType)) {
                    astr.push(`collated[${idx0}].logicalObjectsPlainOut[${idx1}]: <fake>`);
                }
                else dbgLogicalObjectToStrings(x).forEach(s=>astr.push(`collated[${idx0}].logicalObjectsPlainOut[${idx1}]: ${s}`));
                astr.push(`collated[${idx0}].carriedQdotUndefinedsOut[${idx1}]: ${c.carriedQdotUndefinedsOut[idx1]}`);
            });
        });
        loar.aexpression.forEach((expr,idx)=>{
            astr.push(`aexpression[${idx}]: ${Debug.formatSyntaxKind(expr.kind)}, <hasqdot>:${!!(expr as PropertyAccessExpression).questionDotToken}`);
        });
        return astr;
    }


}
