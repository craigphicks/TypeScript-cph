namespace ts {

    //export type PropertyKeyType = IntrinsicType | LiteralType; // IntrinsicType is numberType/stringType, TemplateLiteral also possible, but not yet supported.
    export type DiscriminantFn = (type: Readonly<FloughType>) => FloughType | true | undefined; // true means type doesn't change, undefined means type becomes never, else become FloughType
    export interface FloughLogicalObjectIF {};


    type Variations = ESMap<LiteralType,FloughType>;
    interface FloughLogicalObjectOuter {
        inner: FloughLogicalObjectInnerIF;
        effectiveDeclaredType?: Type; // should be stripped of primitive types, and only have object and operator types.
        variations?: Variations;
    };

    // const {
    //     //modifyFloughLogicalObjectEffectiveDeclaredType,
    //     // createFloughLogicalObjectPlain,
    //     // createFloughLogicalObjectTsunion,
    //     // createFloughLogicalObjectTsintersection,
    //     // createFloughLogicalObject,
    //     // unionOfFloughLogicalObject,
    //     // intersectionOfFloughLogicalObject,
    //     //intersectionOfFloughLogicalObjects,
    //     differenceOfFloughLogicalObject,
    //     //intersectionAndSimplifyLogicalObjects,
    //     logicalObjectForEachTypeOfPropertyLookup,
    //     getEffectiveDeclaredTsTypeFromLogicalObject,
    //     dbgLogicalObjectToStrings,
    // } = floughLogicalObjectInnerModule;


    export interface FloughLogicalObjectModule {
        modifyFloughLogicalObjectEffectiveDeclaredType(logicalObject: FloughLogicalObjectIF, edType: Type): void;
        createFloughLogicalObjectPlain(tstype: ObjectType): FloughLogicalObjectIF;
        createFloughLogicalObjectTsunion(unionType: Readonly<UnionType>, items: Readonly<FloughLogicalObjectIF[]>): FloughLogicalObjectIF;
        createFloughLogicalObjectTsintersection(intersectionType: Readonly<IntersectionType>, items: Readonly<FloughLogicalObjectIF[]>): FloughLogicalObjectIF;
        createFloughLogicalObject(tsType: Readonly<Type>): FloughLogicalObjectIF | undefined;
        unionOfFloughLogicalObject(a: Readonly<FloughLogicalObjectIF>, b: Readonly<FloughLogicalObjectIF>): FloughLogicalObjectIF;
        intersectionOfFloughLogicalObject(a: Readonly<FloughLogicalObjectIF>, b: Readonly<FloughLogicalObjectIF>): FloughLogicalObjectIF | undefined;

        differenceOfFloughLogicalObject(minuend: Readonly<FloughLogicalObjectIF>, subtrahend: Readonly<FloughLogicalObjectIF>): FloughLogicalObjectIF;
        intersectionAndSimplifyLogicalObjects(logicalObject: Readonly<FloughLogicalObjectIF>, logicalObjectConstraint: Readonly<FloughLogicalObjectIF>): FloughLogicalObjectIF | undefined;
        logicalObjectForEachTypeOfPropertyLookup(
            logicalObject: Readonly<FloughLogicalObjectIF>,
            lookupkey: Readonly<FloughType>,
            lookupItemsIn?: LogicalObjectForEachTypeOfPropertyLookupItem[],
            discriminantFn?: DiscriminantFn): [FloughLogicalObjectIF, FloughType] | undefined;
        getEffectiveDeclaredTsTypeFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectIF>): Type;
        dbgLogicalObjectToStrings(logicalObjectTop: FloughLogicalObjectIF): string[];
    };

    export const floughLogicalObjectModule: FloughLogicalObjectModule = {
        modifyFloughLogicalObjectEffectiveDeclaredType,
        createFloughLogicalObjectPlain,
        createFloughLogicalObjectTsunion,
        createFloughLogicalObjectTsintersection,
        createFloughLogicalObject,
        unionOfFloughLogicalObject,
        intersectionOfFloughLogicalObject,
        differenceOfFloughLogicalObject,
        intersectionAndSimplifyLogicalObjects,
        logicalObjectForEachTypeOfPropertyLookup,
        getEffectiveDeclaredTsTypeFromLogicalObject,
        dbgLogicalObjectToStrings,
    };

    function getEffectiveDeclaredTsTypeFromLogicalObject(logicalObjectTop: Readonly<FloughLogicalObjectOuter>): Type {
        return logicalObjectTop.effectiveDeclaredType || floughLogicalObjectInnerModule.getTsTypeFromLogicalObject(logicalObjectTop.inner);
    }


    function modifyFloughLogicalObjectEffectiveDeclaredType(logicalObject: FloughLogicalObjectOuter, edType: Readonly<Type>): void {
        logicalObject.effectiveDeclaredType = edType;
    };
    function createFloughLogicalObjectPlain(tstype: ObjectType): FloughLogicalObjectOuter {
        return {
            inner: floughLogicalObjectInnerModule.createFloughLogicalObjectPlain(tstype),
            //effectiveDeclaredType: tstype,
        };
    }
    function createFloughLogicalObjectTsunion(unionType: Readonly<UnionType>, items: Readonly<FloughLogicalObjectIF[]>): FloughLogicalObjectOuter {
        return { inner: floughLogicalObjectInnerModule.createFloughLogicalObjectTsunion(unionType, items) };
    }
    function createFloughLogicalObjectTsintersection(intersectionType: Readonly<IntersectionType>, items: Readonly<FloughLogicalObjectIF[]>): FloughLogicalObjectOuter {
        return { inner: floughLogicalObjectInnerModule.createFloughLogicalObjectTsintersection(intersectionType, items) };
    }
    function createFloughLogicalObject(tsType: Type): FloughLogicalObjectIF | undefined {
        return { inner: floughLogicalObjectInnerModule.createFloughLogicalObject(tsType) };
    }
    function intersectionAndSimplifyLogicalObjects(logicalObject: Readonly<FloughLogicalObjectOuter>, logicalObjectConstraint: Readonly<FloughLogicalObjectOuter>): FloughLogicalObjectOuter | undefined {
        const inner = floughLogicalObjectInnerModule.intersectionWithLogicalObjectConstraint(logicalObject.inner, logicalObjectConstraint);
        if (inner === undefined) return undefined;
        // TODO: do the keys
        /***
         * Intersection: intersection of the insides, then union of the outside variation keys, intersection of their properties - any never intersection results in a total never result. Then evaluate each key - any never evalution results in a never result.
         * Union: Eval each variation key over the other union operand to get new value.  Then union of insides + union of outside variations.
         */
        return { ...logicalObject, inner };
    }
    function unionOfFloughLogicalObject(a: Readonly<FloughLogicalObjectOuter>, b: Readonly<FloughLogicalObjectOuter>): FloughLogicalObjectOuter{
        const ret: FloughLogicalObjectOuter = {
            inner: floughLogicalObjectInnerModule.unionOfFloughLogicalObject(a.inner, b.inner)
        };
        if (a.effectiveDeclaredType && a.effectiveDeclaredType===b.effectiveDeclaredType) ret.effectiveDeclaredType = a.effectiveDeclaredType;
        // TODO: The variations, and possibly the effective declared type.
        return ret;
    }

    function intersectionOfFloughLogicalObject(logicalObject: Readonly<FloughLogicalObjectOuter>, logicalObjectConstraint: Readonly<FloughLogicalObjectOuter>): FloughLogicalObjectIF | undefined {
        const inner = floughLogicalObjectInnerModule.intersectionWithLogicalObjectConstraint(logicalObject.inner, logicalObjectConstraint.inner);
        if (inner === undefined) return undefined;
        const ret: FloughLogicalObjectOuter = {
            inner
        };
        if (logicalObject.effectiveDeclaredType) ret.effectiveDeclaredType = logicalObject.effectiveDeclaredType;
        // TODO: The variations, and possibly the effective declared type.
        return ret;
    }
    function differenceOfFloughLogicalObject(minuend: Readonly<FloughLogicalObjectOuter>, subtrahend: Readonly<FloughLogicalObjectOuter>): FloughLogicalObjectOuter {
        const inner = floughLogicalObjectInnerModule.differenceOfFloughLogicalObject(minuend.inner, subtrahend.inner);
        const ret: FloughLogicalObjectOuter = {
            inner
        };
        if (minuend.effectiveDeclaredType) ret.effectiveDeclaredType = minuend.effectiveDeclaredType;
        // TODO: The variations, and possibly the effective declared type.
        return ret;
    }
    export type LogicalObjectForEachTypeOfPropertyLookupItem = & {
        logicalObject: FloughLogicalObjectIF, // undefined if not input logicalObject was trimmed to nothing
        //keys?: LiteralType[] | undefined, // undefined if not input logicalObject was trimmed to nothing or if no literal keys were found
        type: FloughType // will be never if logicalItem is undefined, and visa versa.
    };
    function logicalObjectForEachTypeOfPropertyLookup(
        logicalObject: Readonly<FloughLogicalObjectOuter>,
        lookupkey: FloughType,
        lookupItemsIn?: LogicalObjectForEachTypeOfPropertyLookupItem[],
        discriminantFn?: DiscriminantFn): [FloughLogicalObjectOuter, FloughType] | undefined {

        //const x = !!(discriminantFn || lookupItemsIn);
        const lookupItemsInner: LogicalObjectInnerForEachTypeOfPropertyLookupItem[] | undefined = (discriminantFn || lookupItemsIn) ? [] : undefined;
        // const lookupItems: LogicalObjectInnerForEachTypeOfPropertyLookupItem[] = (!!(discriminantFn || lookupItemsIn)) ? [] : undefined;
        const [logicalObjectInner, type] = floughLogicalObjectInnerModule.logicalObjectForEachTypeOfPropertyLookup(logicalObject.inner, lookupkey, lookupItemsInner, discriminantFn);

        if (logicalObjectInner === undefined) return undefined;
        if (!discriminantFn) {
            Debug.assert(type);
            return [logicalObject, type];
        }
        Debug.assert(lookupItemsInner);
        // eslint-disable-next-line prefer-const
        let { effectiveDeclaredType, variations } = logicalObject;

        /**
         * Do stuff with lookupItemsInner, extract the variations,
         */
        //const variations: FloughLogicalObjectOuter[] = [];
        if (lookupItemsInner.length){
            if (!variations) variations = new Map<LiteralType,FloughType>();
            for (const lookupItem of lookupItemsInner){
                if (lookupItem.isNarrowed && lookupItem.keys) {
                    for (const key of lookupItem.keys){
                        const got = variations.get(key);
                        if (!got) variations.set(key,lookupItem.type);
                        else variations.set(key,floughTypeModule.intersectionWithFloughTypeMutate(lookupItem.type, got));
                    }
                }
            }
            if (variations.size===0) variations = undefined;
        }
        return type ? [
            { inner: logicalObjectInner, effectiveDeclaredType, variations },
            type
        ] : undefined;
    }

    function dbgLogicalObjectToStrings(logicalObjectTop: Readonly<FloughLogicalObjectOuter>): string[] {
        const as: string[] = [];
        const { inner, effectiveDeclaredType, variations } = logicalObjectTop;
        if (effectiveDeclaredType) as.push(`effectiveDeclaredType: ${dbgsModule.dbgTypeToString(effectiveDeclaredType)}`);
        else as.push(`effectiveDeclaredType: <undef>`);
        if (variations) {
            as.push(`variations:`);
            variations.forEach((value,key)=>{
                as.push(`  ${key}: ${dbgsModule.dbgFloughTypeToString(value)}`);
            });
            floughLogicalObjectInnerModule.dbgLogicalObjectToStrings(inner).forEach(s=>as.push(`inner: ${s}`));
        }
        return as;
    }



    // interface FloughLogicalObjectOuter {
    //     effectiveDeclaredType?: Type; // should be stripped of primitive types, and only have object and operator types.
    //     inner: FloughLogicalObjectInnerIF;
    //     /**
    //      * Generally, the operations are performed on inner and then narrowed by narrow, because an interscetion operation might have created a property narrower than in narrowed on inner.
    //      * In some cases can checker narrowed first.
    //      */
    //     narrowed?: ESMap<PropertyKeyType,FloughType>;
    // };

    //function _modifyFloughLogicalObjectEffectiveDeclaredType



}