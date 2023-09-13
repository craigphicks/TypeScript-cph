namespace ts {

    const checker = undefined as any as TypeChecker; // TODO: intialize;
    // const dbgs = undefined as any as Dbgs;
    // const mrNarrow = undefined as any as MrNarrow;
    export function initFloughLogicalObjectOuter(checkerIn: TypeChecker) {
        (checker as any) = checkerIn;
        //(refTypesTypeModule as any) = refTypesTypeModuleIn;
        // (dbgs as any) = dbgsIn;
        // (mrNarrow as any) = mrNarrowIn;
    }


    export type DiscriminantFn = (type: Readonly<FloughType>) => FloughType | true | undefined; // true means type doesn't change, undefined means type becomes never, else become FloughType
    const essymbolfloughLogicalObjectOuter = Symbol("floughLogicalObjectIF");
    export interface FloughLogicalObjectIF {[essymbolfloughLogicalObjectOuter]: true};

    let nextLogicalObjectOuterId = 1;
    interface FloughLogicalObjectOuter {
        inner: FloughLogicalObjectInnerIF;
        effectiveDeclaredTsType?: Type; // should be stripped of primitive types, and only have object and operator types.
        id: number;
        readonly?: boolean;
        [essymbolfloughLogicalObjectOuter]: true
    };

    export interface FloughLogicalObjectModule {
        modifyFloughLogicalObjectEffectiveDeclaredType(logicalObject: FloughLogicalObjectIF, edType: Type): void;
        createFloughLogicalObjectPlain(tstype: ObjectType): FloughLogicalObjectIF;
        createFloughLogicalObjectTsunion(unionType: Readonly<UnionType>, items: Readonly<FloughLogicalObjectIF[]>): FloughLogicalObjectIF;
        createFloughLogicalObjectTsintersection(intersectionType: Readonly<IntersectionType>, items: Readonly<FloughLogicalObjectIF[]>): FloughLogicalObjectIF;
        createFloughLogicalObject(tsType: Readonly<Type>): FloughLogicalObjectIF | undefined;
        unionOfFloughLogicalObject(a: Readonly<FloughLogicalObjectIF>, b: Readonly<FloughLogicalObjectIF>): FloughLogicalObjectIF;
        unionOfFloughLogicalObjects(arr: Readonly<FloughLogicalObjectIF[]>): FloughLogicalObjectIF;
        // intersectionOfFloughLogicalObject(a: Readonly<FloughLogicalObjectIF>, b: Readonly<FloughLogicalObjectIF>): FloughLogicalObjectIF | undefined;

        //differenceOfFloughLogicalObject(minuend: Readonly<FloughLogicalObjectIF>, subtrahend: Readonly<FloughLogicalObjectIF>): FloughLogicalObjectIF;
        // intersectionAndSimplifyLogicalObjects(logicalObject: Readonly<FloughLogicalObjectIF>, logicalObjectConstraint: Readonly<FloughLogicalObjectIF>): FloughLogicalObjectIF | undefined;
        // logicalObjectForEachTypeOfPropertyLookup(
        //     logicalObject: Readonly<FloughLogicalObjectIF>,
        //     lookupkey: Readonly<FloughType>,
        //     lookupItemsIn?: LogicalObjectForEachTypeOfPropertyLookupItem[],
        // ): void;
        getEffectiveDeclaredTsTypeFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectIF>, forNodeToTypeMap?: boolean): Type;
        getTsTypeFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectIF>, forNodeToTypeMap?: boolean): Type;
        //setEffectiveDeclaredTsType(logicalObjectTop: Readonly<FloughLogicalObjectIF>, edType: Readonly<Type>): void;
        createCloneWithEffectiveDeclaredTsType(logicalObjectTop: Readonly<FloughLogicalObjectIF>, edType: Readonly<Type>): FloughLogicalObjectIF;
        identicalLogicalObjects(a: Readonly<FloughLogicalObjectIF>, b: Readonly<FloughLogicalObjectIF>): boolean;
        //replaceTypeAtKey(logicalObject: Readonly<FloughLogicalObjectIF>, key: LiteralType, modifiedType: Readonly<FloughType>): FloughLogicalObjectIF;
        // replaceLogicalObjectsOfTypeAtKey(logicalObject: Readonly<FloughLogicalObjectIF>, key: LiteralType, oldToNewLogicalObjectMap: Readonly<OldToNewLogicalObjectMap>): { logicalObject: FloughLogicalObjectIF, type: FloughType } | undefined;
        getInnerIF(logicalObject: Readonly<FloughLogicalObjectIF>): Readonly<FloughLogicalObjectInnerIF>;
        createFloughLogicalObjectFromInner(inner: Readonly<FloughLogicalObjectInnerIF>, edType: Type | undefined): FloughLogicalObjectIF;
        //getTypeFromAssumedBaseLogicalObject(logicalObject: Readonly<FloughLogicalObjectIF>): Type;
        logicalObjectAccess(
            rootsWithSymbols: Readonly<{ type: FloughType, symbol: Symbol | undefined}[]>,
            roots: Readonly<FloughType[]>,
            akey: Readonly<FloughType[]>,
            aexpression: Readonly<Expression[]>
        ): LogicalObjectAccessReturn;
        getFinalTypesFromLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, includeQDotUndefined: boolean): Readonly<FloughType[]>;
        getFinalTypeFromLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, includeQDotUndefined: boolean): Readonly<FloughType>;
        assignFinalTypeToLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, type: Readonly<FloughType>): { newRootType: FloughType };
        getRootTypeAtLevelFromFromLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, level: number): { newRootType: FloughType }
        logicalObjectModify(
            types: Readonly<(FloughType | undefined)[]> | undefined,
            state: LogicalObjectAccessReturn,
            arrCallUndefinedAllowed?: Readonly<boolean[]>
        ): { rootLogicalObject: FloughLogicalObjectIF | undefined, rootNonObj: FloughType | undefined };
        resolveInKeyword(logicalObject: FloughLogicalObjectIF, accessKeys: ObjectUsableAccessKeys): ResolveInKeywordReturnType;
        dbgLogicalObjectToStrings(logicalObjectTop: FloughLogicalObjectIF): string[];
    };

    export type LogicalObjectModifyReturnType = & {
        rootLogicalObject: FloughLogicalObjectIF | undefined,
        rootNonObj: FloughType | undefined;
        //type: Readonly<FloughType>
    };


    export const floughLogicalObjectModule: FloughLogicalObjectModule = {
        modifyFloughLogicalObjectEffectiveDeclaredType,
        createFloughLogicalObjectPlain,
        createFloughLogicalObjectTsunion,
        createFloughLogicalObjectTsintersection,
        createFloughLogicalObject,
        unionOfFloughLogicalObject,
        unionOfFloughLogicalObjects,
        // intersectionOfFloughLogicalObject,
        //differenceOfFloughLogicalObject,
        // intersectionAndSimplifyLogicalObjects,
        getEffectiveDeclaredTsTypeFromLogicalObject,
        getTsTypeFromLogicalObject,
        createCloneWithEffectiveDeclaredTsType(logicalObjectTop: Readonly<FloughLogicalObjectIF>, edType: Readonly<Type>): FloughLogicalObjectIF {
            assertCastType<FloughLogicalObjectOuter>(logicalObjectTop);
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const maybeReadOnlyInner = floughLogicalObjectInnerModule.inheritReadonlyFromEffectiveDeclaredTsTypeModify(logicalObjectTop.inner, edType);
            return ({
                effectiveDeclaredTsType: edType,
                inner: maybeReadOnlyInner, //logicalObjectTop.inner,
                id: nextLogicalObjectOuterId++,
                [essymbolfloughLogicalObjectOuter]: true,
            }) as FloughLogicalObjectOuter;
        },
        identicalLogicalObjects,
        getInnerIF(logicalObject: Readonly<FloughLogicalObjectIF>){
            return (logicalObject as FloughLogicalObjectOuter).inner;
        },
        createFloughLogicalObjectFromInner,
        logicalObjectAccess(
            rootsWithSymbols: Readonly<{ type: FloughType, symbol: Symbol}[]>,
            roots: Readonly<FloughType[]>,
            akey: Readonly<FloughType[]>,
            aexpression: Readonly<Expression[]>
        ): LogicalObjectAccessReturn {
            return floughLogicalObjectInnerModule.logicalObjectAccess(rootsWithSymbols, roots, akey, aexpression);
        },
        getFinalTypesFromLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, includeQDotUndefined: boolean): Readonly<FloughType[]>{
            return floughLogicalObjectInnerModule.getFinalTypesFromLogicalObjectAccessReturn(loar, includeQDotUndefined);
        },
        getFinalTypeFromLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, includeQDotUndefined: boolean): Readonly<FloughType>{
            const types = floughLogicalObjectInnerModule.getFinalTypesFromLogicalObjectAccessReturn(loar, includeQDotUndefined);
            return floughTypeModule.unionOfRefTypesType(types);
        },
        assignFinalTypeToLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, type: Readonly<FloughType>): { newRootType: FloughType }{
            const {rootLogicalObject:inner,rootNobj} = floughLogicalObjectInnerModule.assignFinalTypeToLogicalObjectAccessReturn(loar,type);
            Debug.assert(inner);
            const outer: FloughLogicalObjectOuter = {
                inner,
                id: nextLogicalObjectOuterId++,
                [essymbolfloughLogicalObjectOuter]: true,
            };
            const newRootType = floughTypeModule.createTypeFromLogicalObject(outer,rootNobj);
            return { newRootType };
        },
        getRootTypeAtLevelFromFromLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, level: number): { newRootType: FloughType }{
            const {rootLogicalObject:inner,rootNobj} = floughLogicalObjectInnerModule.getRootAtLevelFromLogicalObjectAccessReturn(loar,level);
            if (!inner) return { newRootType:rootNobj };
            const outer: FloughLogicalObjectOuter = {
                inner,
                id: nextLogicalObjectOuterId++,
                [essymbolfloughLogicalObjectOuter]: true,
            };
            const newRootType = floughTypeModule.createTypeFromLogicalObject(outer,rootNobj);
            return { newRootType };
        },
        logicalObjectModify(
            types: Readonly<(FloughType | undefined)[]> | undefined,
            state: LogicalObjectAccessReturn,
            arrCallUndefinedAllowed?: Readonly<boolean[]>,
        ): LogicalObjectModifyReturnType {
            const x = floughLogicalObjectInnerModule.logicalObjectModify(types, state, arrCallUndefinedAllowed);
            const outer = x.rootLogicalObject ? createFloughLogicalObjectFromInner(x.rootLogicalObject, /* edType */ undefined) : undefined;
            return { rootLogicalObject:outer, rootNonObj: x.rootNonObj };
            // return x.map(({ rootLogicalObject, rootNonObj, type })=>({
            //     rootLogicalObject: rootLogicalObject ? createFloughLogicalObjectFromInner(rootLogicalObject, /* edType */ undefined) : undefined,
            //         rootNonObj,
            //         type
            // }));
        },
        resolveInKeyword,
        dbgLogicalObjectToStrings,
    };

    // function unionOfFloughLogicalObjectWithTypeMerging(arr: Readonly<FloughLogicalObjectOuter>[]): FloughLogicalObjectOuter {
    //     Debug.assert(arr.length);
    //     const arri = arr.map(ob=>ob.inner);
    //     const inner = floughLogicalObjectInnerModule.unionOfFloughLogicalObjectWithTypeMerging(arri);
    //     //type = checker.unionType() TODO: add union of effectiveDeclaredTsType as new effectiveDeclaredTsType
    //     return {
    //         inner,
    //         id: nextLogicalObjectOuterId++,
    //         [essymbolfloughLogicalObjectOuter]: true,
    //     };
    // }

    function getEffectiveDeclaredTsTypeFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectOuter>, forNodeToTypeMap?: boolean): Type {
        return logicalObjectTop.effectiveDeclaredTsType || floughLogicalObjectInnerModule.getTsTypeFromLogicalObject(logicalObjectTop.inner, forNodeToTypeMap);
    }
    function getTsTypeFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectOuter>, forNodeToTypeMap?: boolean): Type {
        return floughLogicalObjectInnerModule.getTsTypeFromLogicalObject(logicalObjectTop.inner, forNodeToTypeMap);
    }


    function modifyFloughLogicalObjectEffectiveDeclaredType(logicalObject: FloughLogicalObjectOuter, edType: Readonly<Type>): void {
        logicalObject.effectiveDeclaredTsType = edType;
    };
    function createFloughLogicalObjectPlain(tstype: ObjectType): FloughLogicalObjectOuter {
        return {
            inner: floughLogicalObjectInnerModule.createFloughLogicalObjectPlain(tstype),
            id: nextLogicalObjectOuterId++,
            [essymbolfloughLogicalObjectOuter]: true,
        };
    }
    function createFloughLogicalObjectTsunion(unionType: Readonly<UnionType>, items: Readonly<FloughLogicalObjectOuter[]>): FloughLogicalObjectOuter {
        return { inner: floughLogicalObjectInnerModule.createFloughLogicalObjectTsunion(unionType, items.map(x=>x.inner)),
            id: nextLogicalObjectOuterId++,
            [essymbolfloughLogicalObjectOuter]: true,
        };
    }
    function createFloughLogicalObjectTsintersection(intersectionType: Readonly<IntersectionType>, items: Readonly<FloughLogicalObjectOuter[]>): FloughLogicalObjectOuter {
        return { inner: floughLogicalObjectInnerModule.createFloughLogicalObjectTsintersection(intersectionType, items.map(x=>x.inner)),
            id: nextLogicalObjectOuterId++,
            [essymbolfloughLogicalObjectOuter]: true,
        };
    }
    function createFloughLogicalObject(tsType: Type): FloughLogicalObjectOuter {
        return { inner: floughLogicalObjectInnerModule.createFloughLogicalObject(tsType),
            id: nextLogicalObjectOuterId++,
            [essymbolfloughLogicalObjectOuter]: true,
        };
    }
    // function intersectionAndSimplifyLogicalObjects(logicalObject: Readonly<FloughLogicalObjectOuter>, logicalObjectConstraint: Readonly<FloughLogicalObjectOuter>): FloughLogicalObjectOuter | undefined {
    //     const inner = floughLogicalObjectInnerModule.intersectionWithLogicalObjectConstraint(logicalObject.inner, logicalObjectConstraint.inner);
    //     if (inner === undefined) return undefined;
    //     // TODO: do the keys
    //     /***
    //      * Intersection: intersection of the insides, then union of the outside variation keys, intersection of their properties - any never intersection results in a total never result. Then evaluate each key - any never evalution results in a never result.
    //      * Union: Eval each variation key over the other union operand to get new value.  Then union of insides + union of outside variations.
    //      */
    //     return { ...logicalObject, inner, id: nextLogicalObjectOuterId++ };
    // }
    function unionOfFloughLogicalObject(a: Readonly<FloughLogicalObjectOuter>, b: Readonly<FloughLogicalObjectOuter>): FloughLogicalObjectOuter{
        const ret: FloughLogicalObjectOuter = {
            inner: floughLogicalObjectInnerModule.unionOfFloughLogicalObject(a.inner, b.inner),
            id: nextLogicalObjectOuterId++,
            [essymbolfloughLogicalObjectOuter]: true,
        };
        if (a.effectiveDeclaredTsType && a.effectiveDeclaredTsType===b.effectiveDeclaredTsType) ret.effectiveDeclaredTsType = a.effectiveDeclaredTsType;
        // TODO: The variations, and possibly the effective declared type.
        return ret;
    }
    function unionOfFloughLogicalObjects(arr: Readonly<FloughLogicalObjectOuter[]>): FloughLogicalObjectOuter {
        Debug.assert(arr.length>0);
        const ret: FloughLogicalObjectOuter = arr.reduce((accumulator,currentValue)=>unionOfFloughLogicalObject(accumulator,currentValue));
        return ret;
    }
    // function intersectionOfFloughLogicalObject(logicalObject: Readonly<FloughLogicalObjectOuter>, logicalObjectConstraint: Readonly<FloughLogicalObjectOuter>): FloughLogicalObjectIF | undefined {
    //     const maybe = true;
    //     if (maybe) Debug.fail("intersectionOfFloughLogicalObject not expect");
    //     const inner = floughLogicalObjectInnerModule.intersectionWithLogicalObjectConstraint(logicalObject.inner, logicalObjectConstraint.inner);
    //     if (inner === undefined) return undefined;
    //     const ret: FloughLogicalObjectOuter = {
    //         inner, id: nextLogicalObjectOuterId++, [essymbolfloughLogicalObjectOuter]: true,
    //     };
    //     if (logicalObject.effectiveDeclaredTsType) ret.effectiveDeclaredTsType = logicalObject.effectiveDeclaredTsType;
    //     // TODO: The variations, and possibly the effective declared type.
    //     return ret;
    // }

    // function differenceOfFloughLogicalObject(minuend: Readonly<FloughLogicalObjectOuter>, subtrahend: Readonly<FloughLogicalObjectOuter>): FloughLogicalObjectOuter {
    //     const inner = floughLogicalObjectInnerModule.differenceOfFloughLogicalObject(minuend.inner, subtrahend.inner);
    //     const ret: FloughLogicalObjectOuter = {
    //         inner, id: nextLogicalObjectOuterId++,
    //         [essymbolfloughLogicalObjectOuter]: true,
    //     };
    //     if (minuend.effectiveDeclaredTsType) ret.effectiveDeclaredTsType = minuend.effectiveDeclaredTsType;
    //     // TODO: The variations, and possibly the effective declared type.
    //     return ret;
    // }
    // export type LogicalObjectForEachTypeOfPropertyLookupItem = & {
    //     logicalObject: FloughLogicalObjectIF, // undefined if not input logicalObject was trimmed to nothing
    //     key?: LiteralType | undefined, // undefined if not input logicalObject was trimmed to nothing or if no literal keys were found
    //     type: FloughType // will be never if logicalItem is undefined, and visa versa.
    //     arrLogicalObjectBaseOfType: Readonly<FloughLogicalObjectInnerIF>[], // the base logicalObject that was used to create the logicalObject
    // };

    // function logicalObjectDuplicateBaseAndJoinType(base: Readonly<FloughLogicalObjectOuter>, key: LiteralType, type: Readonly<FloughType>): FloughLogicalObjectOuter {
    //     const inner = floughLogicalObjectInnerModule.logicalObjectDuplicateBaseAndJoinTypeInner(base.inner, key, type);
    //     const ret: FloughLogicalObjectOuter = {
    //         inner,
    //         id: nextLogicalObjectOuterId++,
    //         effectiveDeclaredTsType: base.effectiveDeclaredTsType,
    //     };
    //     return ret;
    // }
    function identicalLogicalObjects(a: Readonly<FloughLogicalObjectOuter>, b: Readonly<FloughLogicalObjectOuter>): boolean {
        const ident = a===b;
        Debug.assert((a.id === b.id) === ident);
        return ident;
    }

    // function logicalObjectForEachTypeOfPropertyLookup(
    //     logicalObject: Readonly<FloughLogicalObjectOuter>,
    //     lookupkey: FloughType,
    //     lookupItemsOuter: LogicalObjectForEachTypeOfPropertyLookupItem[],
    //     ): void {
    //     if (getMyDebug()){
    //         consoleGroup(`logicalObjectForEachTypeOfPropertyLookup[in] lookupkey: ${floughTypeModule.dbgFloughTypeToString(lookupkey)}`);
    //         dbgLogicalObjectToStrings(logicalObject).forEach(x=>consoleLog(`[in] logicalObject ${x}`));
    //     }
    //     const lookupItemsInner: LogicalObjectInnerForEachTypeOfPropertyLookupItem[] = [];
    //     floughLogicalObjectInnerModule.logicalObjectForEachTypeOfPropertyLookup(logicalObject.inner, lookupkey, lookupItemsInner);

    //     lookupItemsInner?.forEach(({ logicalObject:inner, key:_key, type, arrLogicalObjectBase })=>{
    //         const logicalObjectOuter: FloughLogicalObjectOuter = {
    //             inner,
    //             // perhaps it should inherit the effectiveDeclaredTsType from the outer logicalObject?
    //             //effectiveDeclaredTsType: inner.kind==="plain" ? inner.tsType : undefined,
    //             effectiveDeclaredTsType: logicalObject.effectiveDeclaredTsType,
    //             id: nextLogicalObjectOuterId++,
    //             //[essymbolfloughLogicalObjectOuter]: void
    //         };
    //         lookupItemsOuter.push({ logicalObject: logicalObjectOuter, key:_key, type, arrLogicalObjectBaseOfType: arrLogicalObjectBase });
    //     });
    //     if (getMyDebug()){
    //         consoleLog(`logicalObjectForEachTypeOfPropertyLookup[out] lookupkey: ${floughTypeModule.dbgFloughTypeToString(lookupkey)}`);
    //         dbgLogicalObjectToStrings(logicalObject).forEach(x=>consoleLog(`[out] logicalObject ${x}`));
    //         consoleLog(`logicalObjectForEachTypeOfPropertyLookup[out] lookupItemsOuter: ${lookupItemsOuter.length}`);
    //         lookupItemsOuter.forEach(({ logicalObject, key, type },idx)=>{
    //             dbgLogicalObjectToStrings(logicalObject as FloughLogicalObjectOuter).forEach(
    //                 s=>consoleLog(`[out, ${idx}] logicalObjectOuter: ${s}`));
    //             consoleLog(`[out, ${idx}] key: ${key?dbgsModule.dbgTypeToString(key):"<undef>"}`);
    //             consoleLog(`[out, ${idx}] type: ${floughTypeModule.dbgFloughTypeToString(type)}`);
    //         });
    //         consoleGroupEnd();
    //     }
    //     return;
    // }


    // function replaceTypeAtKey(logicalObject: Readonly<FloughLogicalObjectOuter>, key: LiteralType, modifiedType: Readonly<FloughType>): FloughLogicalObjectOuter {
    //     const inner = floughLogicalObjectInnerModule.replaceTypeAtKey(logicalObject.inner, key, modifiedType);
    //     return { ...logicalObject, inner, id: nextLogicalObjectOuterId++ };
    // }
    // function replaceLogicalObjectsOfTypeAtKey(logicalObject: Readonly<FloughLogicalObjectOuter>, key: LiteralType, oldToNewLogicalObjectMap: Readonly<OldToNewLogicalObjectMap>): { logicalObject: FloughLogicalObjectOuter, type: FloughType } | undefined {
    //     const type = floughLogicalObjectInnerModule.getTypeAtIndexFromBase(logicalObject.inner, key);
    //     const logicalObjectOfType = floughTypeModule.getLogicalObject(type) as FloughLogicalObjectOuter;
    //     Debug.assert(logicalObjectOfType);
    //     const newLogicalObjectInnerOfType = floughLogicalObjectInnerModule.replaceOrFilterLogicalObjects(logicalObjectOfType.inner, oldToNewLogicalObjectMap);
    //     if (!newLogicalObjectInnerOfType) return undefined;
    //     const newLogicalObjectOfType = { ...logicalObjectOfType, inner: newLogicalObjectInnerOfType, id: nextLogicalObjectOuterId++ };
    //     const newType = floughTypeModule.createTypeFromLogicalObject(newLogicalObjectOfType);
    //     const newLogicalObject = replaceTypeAtKey(logicalObject, key, newType);
    //     return { logicalObject: newLogicalObject, type: newType };
    // }

    function createFloughLogicalObjectFromInner(inner: Readonly<FloughLogicalObjectInnerIF>, edType?: Type | undefined): FloughLogicalObjectOuter {
        return { inner, id: nextLogicalObjectOuterId++, effectiveDeclaredTsType: edType,
            [essymbolfloughLogicalObjectOuter]: true,
        };
    }
    function resolveInKeyword(logicalObject: FloughLogicalObjectOuter, accessKeys: ObjectUsableAccessKeys): ResolveInKeywordReturnType {
        return floughLogicalObjectInnerModule.resolveInKeyword(logicalObject.inner, accessKeys);
    }


    function dbgLogicalObjectToStrings(logicalObjectTop: Readonly<FloughLogicalObjectOuter>): string[] {
        const as: string[] = [];
        if (!logicalObjectTop.id) (logicalObjectTop as FloughLogicalObjectOuter).id = nextLogicalObjectOuterId++;
        const { inner, effectiveDeclaredTsType: effectiveDeclaredType, id } = logicalObjectTop;
        as.push(`logicalObjectOuter:id: ${id}`);
        if (effectiveDeclaredType) as.push(`effectiveDeclaredType: ${dbgsModule.dbgTypeToString(effectiveDeclaredType)}`);
        else as.push(`effectiveDeclaredType: <undef>`);
        floughLogicalObjectInnerModule.dbgLogicalObjectToStrings(inner).forEach(s=>as.push(`inner: ${s}`));
        return as;
    }

}