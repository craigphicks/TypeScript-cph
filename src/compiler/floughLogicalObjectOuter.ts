import {
    Debug,
    Expression,
    IntersectionType,
    ObjectType,
    Type,
    TypeChecker,
    UnionType,
} from "./_namespaces/ts";

const checker = undefined as any as TypeChecker; // TODO: intialize;
export function initFloughLogicalObjectOuter(checkerIn: TypeChecker) {
    (checker as any) = checkerIn;
}

export type DiscriminantFn = (type: Readonly<FloughType>) => FloughType | true | undefined; // true means type doesn't change, undefined means type becomes never, else become FloughType
const essymbolfloughLogicalObjectOuter = Symbol("floughLogicalObjectIF");
export interface FloughLogicalObjectIF {
    [essymbolfloughLogicalObjectOuter]: true;
}

let nextLogicalObjectOuterId = 1;
interface FloughLogicalObjectOuter {
    inner: FloughLogicalObjectInnerIF;
    effectiveDeclaredTsType?: Type; // should be stripped of primitive types, and only have object and operator types.
    id: number;
    readonly?: boolean;
    [essymbolfloughLogicalObjectOuter]: true;
}

export interface FloughLogicalObjectModule {
    modifyFloughLogicalObjectEffectiveDeclaredType(logicalObject: FloughLogicalObjectIF, edType: Type): void;
    createFloughLogicalObjectPlain(tstype: ObjectType): FloughLogicalObjectIF;
    createFloughLogicalObjectTsunion(unionType: Readonly<UnionType>, items: Readonly<FloughLogicalObjectIF[]>): FloughLogicalObjectIF;
    createFloughLogicalObjectTsintersection(intersectionType: Readonly<IntersectionType>, items: Readonly<FloughLogicalObjectIF[]>): FloughLogicalObjectIF;
    createFloughLogicalObject(tsType: Readonly<Type>): FloughLogicalObjectIF | undefined;
    createFloughLogicalObjectWithVariations(origTsType: Readonly<ObjectType>, newTsType: Readonly<ObjectType>): FloughLogicalObjectIF | undefined;
    unionOfFloughLogicalObject(a: Readonly<FloughLogicalObjectIF>, b: Readonly<FloughLogicalObjectIF>): FloughLogicalObjectIF;
    unionOfFloughLogicalObjects(arr: Readonly<FloughLogicalObjectIF[]>): FloughLogicalObjectIF;
    // intersectionOfFloughLogicalObject(a: Readonly<FloughLogicalObjectIF>, b: Readonly<FloughLogicalObjectIF>): FloughLogicalObjectIF | undefined;

    // differenceOfFloughLogicalObject(minuend: Readonly<FloughLogicalObjectIF>, subtrahend: Readonly<FloughLogicalObjectIF>): FloughLogicalObjectIF;
    // intersectionAndSimplifyLogicalObjects(logicalObject: Readonly<FloughLogicalObjectIF>, logicalObjectConstraint: Readonly<FloughLogicalObjectIF>): FloughLogicalObjectIF | undefined;
    // logicalObjectForEachTypeOfPropertyLookup(
    //     logicalObject: Readonly<FloughLogicalObjectIF>,
    //     lookupkey: Readonly<FloughType>,
    //     lookupItemsIn?: LogicalObjectForEachTypeOfPropertyLookupItem[],
    // ): void;
    getEffectiveDeclaredTsTypeFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectIF>, forNodeToTypeMap?: boolean): Type;
    getTsTypeFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectIF>, forNodeToTypeMap?: boolean): Type;
    // setEffectiveDeclaredTsType(logicalObjectTop: Readonly<FloughLogicalObjectIF>, edType: Readonly<Type>): void;
    createCloneWithEffectiveDeclaredTsType(logicalObjectTop: Readonly<FloughLogicalObjectIF>, edType: Readonly<Type>): FloughLogicalObjectIF;
    identicalLogicalObjects(a: Readonly<FloughLogicalObjectIF>, b: Readonly<FloughLogicalObjectIF>): boolean;
    // replaceTypeAtKey(logicalObject: Readonly<FloughLogicalObjectIF>, key: LiteralType, modifiedType: Readonly<FloughType>): FloughLogicalObjectIF;
    // replaceLogicalObjectsOfTypeAtKey(logicalObject: Readonly<FloughLogicalObjectIF>, key: LiteralType, oldToNewLogicalObjectMap: Readonly<OldToNewLogicalObjectMap>): { logicalObject: FloughLogicalObjectIF, type: FloughType } | undefined;
    getInnerIF(logicalObject: Readonly<FloughLogicalObjectIF>): Readonly<FloughLogicalObjectInnerIF>;
    createFloughLogicalObjectFromInner(inner: Readonly<FloughLogicalObjectInnerIF>, edType: Type | undefined): FloughLogicalObjectIF;
    // getTypeFromAssumedBaseLogicalObject(logicalObject: Readonly<FloughLogicalObjectIF>): Type;
    logicalObjectAccess(
        rootsWithSymbols: Readonly<RefTypesTableReturn[]>,
        roots: Readonly<FloughType[]>,
        akey: Readonly<FloughType[]>,
        aexpression: Readonly<Expression[]>,
    ): LogicalObjectAccessReturn;
    getFinalTypesFromLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, includeQDotUndefined: boolean): Readonly<FloughType[]>;
    getFinalTypeFromLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, includeQDotUndefined: boolean): Readonly<FloughType>;
    assignFinalTypeToLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, type: Readonly<FloughType>): { newRootType: FloughType; };
    getRootTypeAtLevelFromFromLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, level: number): { newRootType: FloughType; };
    logicalObjectModify(
        types: Readonly<(FloughType | undefined)[]> | undefined,
        state: LogicalObjectAccessReturn,
        arrCallUndefinedAllowed?: Readonly<boolean[]>,
    ): LogicalObjectModifyReturnType;
    resolveInKeyword(logicalObject: FloughLogicalObjectIF, accessKeys: ObjectUsableAccessKeys): ResolveInKeywordReturnType;
    dbgLogicalObjectToStrings(logicalObjectTop: FloughLogicalObjectIF): string[];
}

export type LogicalObjectModifyReturnType = {
    rootLogicalObject: FloughLogicalObjectIF | undefined;
    rootNonObj: FloughType | undefined;
    sci: RefTypesSymtabConstraintItem;
    // type: Readonly<FloughType>
};

export const floughLogicalObjectModule: FloughLogicalObjectModule = {
    modifyFloughLogicalObjectEffectiveDeclaredType,
    createFloughLogicalObjectPlain,
    createFloughLogicalObjectTsunion,
    createFloughLogicalObjectTsintersection,
    createFloughLogicalObject,
    createFloughLogicalObjectWithVariations(origTsType: Readonly<ObjectType>, newTsType: Readonly<ObjectType>): FloughLogicalObjectIF | undefined {
        const inner = floughLogicalObjectInnerModule.createFloughLogicalObjectWithVariations(origTsType, newTsType);
        if (!inner) return undefined;
        return createFloughLogicalObjectFromInner(inner);
    },
    unionOfFloughLogicalObject,
    unionOfFloughLogicalObjects,
    getEffectiveDeclaredTsTypeFromLogicalObject,
    getTsTypeFromLogicalObject,
    createCloneWithEffectiveDeclaredTsType(logicalObjectTop: Readonly<FloughLogicalObjectIF>, edType: Readonly<Type>): FloughLogicalObjectIF {
        assertCastType<FloughLogicalObjectOuter>(logicalObjectTop);
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const maybeReadOnlyInner = floughLogicalObjectInnerModule.inheritReadonlyFromEffectiveDeclaredTsTypeModify(logicalObjectTop.inner, edType);
        return ({
            effectiveDeclaredTsType: edType,
            inner: maybeReadOnlyInner, // logicalObjectTop.inner,
            id: nextLogicalObjectOuterId++,
            [essymbolfloughLogicalObjectOuter]: true,
        }) as FloughLogicalObjectOuter;
    },
    identicalLogicalObjects,
    getInnerIF(logicalObject: Readonly<FloughLogicalObjectIF>) {
        return (logicalObject as FloughLogicalObjectOuter).inner;
    },
    createFloughLogicalObjectFromInner,
    logicalObjectAccess(
        rootsWithSymbols: Readonly<RefTypesTableReturn[]>,
        roots: Readonly<FloughType[]>,
        akey: Readonly<FloughType[]>,
        aexpression: Readonly<Expression[]>,
    ): LogicalObjectAccessReturn {
        return floughLogicalObjectInnerModule.logicalObjectAccess(rootsWithSymbols, roots, akey, aexpression);
    },
    getFinalTypesFromLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, includeQDotUndefined: boolean): Readonly<FloughType[]> {
        return floughLogicalObjectInnerModule.getFinalTypesFromLogicalObjectAccessReturn(loar, includeQDotUndefined);
    },
    getFinalTypeFromLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, includeQDotUndefined: boolean): Readonly<FloughType> {
        const types = floughLogicalObjectInnerModule.getFinalTypesFromLogicalObjectAccessReturn(loar, includeQDotUndefined);
        return floughTypeModule.unionOfRefTypesType(types);
    },
    assignFinalTypeToLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, type: Readonly<FloughType>): { newRootType: FloughType; } {
        const { rootLogicalObject: inner, rootNobj } = floughLogicalObjectInnerModule.assignFinalTypeToLogicalObjectAccessReturn(loar, type);
        Debug.assert(inner);
        const outer: FloughLogicalObjectOuter = {
            inner,
            id: nextLogicalObjectOuterId++,
            [essymbolfloughLogicalObjectOuter]: true,
        };
        const newRootType = floughTypeModule.createTypeFromLogicalObject(outer, rootNobj);
        return { newRootType };
    },
    getRootTypeAtLevelFromFromLogicalObjectAccessReturn(loar: Readonly<LogicalObjectAccessReturn>, level: number): { newRootType: FloughType; } {
        const { rootLogicalObject: inner, rootNobj } = floughLogicalObjectInnerModule.getRootAtLevelFromLogicalObjectAccessReturn(loar, level);
        if (!inner) return { newRootType: rootNobj };
        const outer: FloughLogicalObjectOuter = {
            inner,
            id: nextLogicalObjectOuterId++,
            [essymbolfloughLogicalObjectOuter]: true,
        };
        const newRootType = floughTypeModule.createTypeFromLogicalObject(outer, rootNobj);
        return { newRootType };
    },
    logicalObjectModify(
        types: Readonly<(FloughType | undefined)[]> | undefined,
        state: LogicalObjectAccessReturn,
        arrCallUndefinedAllowed?: Readonly<boolean[]>,
    ): LogicalObjectModifyReturnType {
        const x = floughLogicalObjectInnerModule.logicalObjectModify(types, state, arrCallUndefinedAllowed);
        const outer = x.rootLogicalObject ? createFloughLogicalObjectFromInner(x.rootLogicalObject, /* edType */ undefined) : undefined;
        return { rootLogicalObject: outer, rootNonObj: x.rootNonObj, sci: x.sci };
        // return x.map(({ rootLogicalObject, rootNonObj, type })=>({
        //     rootLogicalObject: rootLogicalObject ? createFloughLogicalObjectFromInner(rootLogicalObject, /* edType */ undefined) : undefined,
        //         rootNonObj,
        //         type
        // }));
    },
    resolveInKeyword,
    dbgLogicalObjectToStrings,
};

function getEffectiveDeclaredTsTypeFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectOuter>, forNodeToTypeMap?: boolean): Type {
    return logicalObjectTop.effectiveDeclaredTsType || floughLogicalObjectInnerModule.getTsTypeFromLogicalObject(logicalObjectTop.inner, forNodeToTypeMap);
}
function getTsTypeFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectOuter>, forNodeToTypeMap?: boolean): Type {
    return floughLogicalObjectInnerModule.getTsTypeFromLogicalObject(logicalObjectTop.inner, forNodeToTypeMap);
}

function modifyFloughLogicalObjectEffectiveDeclaredType(logicalObject: FloughLogicalObjectOuter, edType: Readonly<Type>): void {
    logicalObject.effectiveDeclaredTsType = edType;
}
function createFloughLogicalObjectPlain(tstype: ObjectType): FloughLogicalObjectOuter {
    return {
        inner: floughLogicalObjectInnerModule.createFloughLogicalObjectPlain(tstype),
        id: nextLogicalObjectOuterId++,
        [essymbolfloughLogicalObjectOuter]: true,
    };
}
function createFloughLogicalObjectTsunion(unionType: Readonly<UnionType>, items: Readonly<FloughLogicalObjectOuter[]>): FloughLogicalObjectOuter {
    return { inner: floughLogicalObjectInnerModule.createFloughLogicalObjectTsunion(unionType, items.map(x => x.inner)), id: nextLogicalObjectOuterId++, [essymbolfloughLogicalObjectOuter]: true };
}
function createFloughLogicalObjectTsintersection(intersectionType: Readonly<IntersectionType>, items: Readonly<FloughLogicalObjectOuter[]>): FloughLogicalObjectOuter {
    return { inner: floughLogicalObjectInnerModule.createFloughLogicalObjectTsintersection(intersectionType, items.map(x => x.inner)), id: nextLogicalObjectOuterId++, [essymbolfloughLogicalObjectOuter]: true };
}
function createFloughLogicalObject(tsType: Type): FloughLogicalObjectOuter {
    return { inner: floughLogicalObjectInnerModule.createFloughLogicalObject(tsType), id: nextLogicalObjectOuterId++, [essymbolfloughLogicalObjectOuter]: true };
}

function unionOfFloughLogicalObject(a: Readonly<FloughLogicalObjectOuter>, b: Readonly<FloughLogicalObjectOuter>): FloughLogicalObjectOuter {
    const ret: FloughLogicalObjectOuter = {
        inner: floughLogicalObjectInnerModule.unionOfFloughLogicalObject(a.inner, b.inner),
        id: nextLogicalObjectOuterId++,
        [essymbolfloughLogicalObjectOuter]: true,
    };
    if (a.effectiveDeclaredTsType && a.effectiveDeclaredTsType === b.effectiveDeclaredTsType) ret.effectiveDeclaredTsType = a.effectiveDeclaredTsType;
    // TODO: The variations, and possibly the effective declared type.
    return ret;
}
function unionOfFloughLogicalObjects(arr: Readonly<FloughLogicalObjectOuter[]>): FloughLogicalObjectOuter {
    Debug.assert(arr.length > 0);
    const ret: FloughLogicalObjectOuter = arr.reduce((accumulator, currentValue) => unionOfFloughLogicalObject(accumulator, currentValue));
    return ret;
}
function identicalLogicalObjects(a: Readonly<FloughLogicalObjectOuter>, b: Readonly<FloughLogicalObjectOuter>): boolean {
    const ident = a === b;
    Debug.assert((a.id === b.id) === ident);
    return ident;
}

function createFloughLogicalObjectFromInner(inner: Readonly<FloughLogicalObjectInnerIF>, edType?: Type | undefined): FloughLogicalObjectOuter {
    return { inner, id: nextLogicalObjectOuterId++, effectiveDeclaredTsType: edType, [essymbolfloughLogicalObjectOuter]: true };
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
    floughLogicalObjectInnerModule.dbgLogicalObjectToStrings(inner).forEach(s => as.push(`inner: ${s}`));
    return as;
}
