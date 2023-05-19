namespace ts {

    //export type PropertyKeyType = IntrinsicType | LiteralType; // IntrinsicType is numberType/stringType, TemplateLiteral also possible, but not yet supported.
    export type DiscriminantFn = (type: Readonly<FloughType>) => FloughType | true | undefined; // true means type doesn't change, undefined means type becomes never, else become FloughType
    const essymbolfloughLogicalObjectOuter = Symbol("floughLogicalObjectIF");
    export interface FloughLogicalObjectIF {[essymbolfloughLogicalObjectOuter]?: void};


    type Variations = ESMap<LiteralType,FloughType>;
    interface FloughLogicalObjectOuter {
        inner: FloughLogicalObjectInnerIF;
        effectiveDeclaredTsType?: Type; // should be stripped of primitive types, and only have object and operator types.
        variations?: Variations;
        [essymbolfloughLogicalObjectOuter]?: void
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
        return logicalObjectTop.effectiveDeclaredTsType || floughLogicalObjectInnerModule.getTsTypeFromLogicalObject(logicalObjectTop.inner);
    }


    function modifyFloughLogicalObjectEffectiveDeclaredType(logicalObject: FloughLogicalObjectOuter, edType: Readonly<Type>): void {
        logicalObject.effectiveDeclaredTsType = edType;
    };
    function createFloughLogicalObjectPlain(tstype: ObjectType): FloughLogicalObjectOuter {
        return {
            inner: floughLogicalObjectInnerModule.createFloughLogicalObjectPlain(tstype),
            //effectiveDeclaredType: tstype,
        };
    }
    function createFloughLogicalObjectTsunion(unionType: Readonly<UnionType>, items: Readonly<FloughLogicalObjectOuter[]>): FloughLogicalObjectOuter {
        return { inner: floughLogicalObjectInnerModule.createFloughLogicalObjectTsunion(unionType, items.map(x=>x.inner)) };
    }
    function createFloughLogicalObjectTsintersection(intersectionType: Readonly<IntersectionType>, items: Readonly<FloughLogicalObjectOuter[]>): FloughLogicalObjectOuter {
        return { inner: floughLogicalObjectInnerModule.createFloughLogicalObjectTsintersection(intersectionType, items.map(x=>x.inner)) };
    }
    function createFloughLogicalObject(tsType: Type): FloughLogicalObjectOuter {
        return { inner: floughLogicalObjectInnerModule.createFloughLogicalObject(tsType) };
    }
    function intersectionAndSimplifyLogicalObjects(logicalObject: Readonly<FloughLogicalObjectOuter>, logicalObjectConstraint: Readonly<FloughLogicalObjectOuter>): FloughLogicalObjectOuter | undefined {
        const inner = floughLogicalObjectInnerModule.intersectionWithLogicalObjectConstraint(logicalObject.inner, logicalObjectConstraint.inner);
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
        if (a.effectiveDeclaredTsType && a.effectiveDeclaredTsType===b.effectiveDeclaredTsType) ret.effectiveDeclaredTsType = a.effectiveDeclaredTsType;
        // TODO: The variations, and possibly the effective declared type.
        return ret;
    }

    function intersectionOfFloughLogicalObject(logicalObject: Readonly<FloughLogicalObjectOuter>, logicalObjectConstraint: Readonly<FloughLogicalObjectOuter>): FloughLogicalObjectIF | undefined {
        const inner = floughLogicalObjectInnerModule.intersectionWithLogicalObjectConstraint(logicalObject.inner, logicalObjectConstraint.inner);
        if (inner === undefined) return undefined;
        const ret: FloughLogicalObjectOuter = {
            inner
        };
        if (logicalObject.effectiveDeclaredTsType) ret.effectiveDeclaredTsType = logicalObject.effectiveDeclaredTsType;
        // TODO: The variations, and possibly the effective declared type.
        return ret;
    }
    function differenceOfFloughLogicalObject(minuend: Readonly<FloughLogicalObjectOuter>, subtrahend: Readonly<FloughLogicalObjectOuter>): FloughLogicalObjectOuter {
        const inner = floughLogicalObjectInnerModule.differenceOfFloughLogicalObject(minuend.inner, subtrahend.inner);
        const ret: FloughLogicalObjectOuter = {
            inner
        };
        if (minuend.effectiveDeclaredTsType) ret.effectiveDeclaredTsType = minuend.effectiveDeclaredTsType;
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
        const { logicalObject:logicalObjectInner, key, type } = floughLogicalObjectInnerModule.logicalObjectForEachTypeOfPropertyLookup(logicalObject.inner, lookupkey, lookupItemsInner, discriminantFn);

        if (logicalObjectInner === undefined) {
            Debug.assert(floughTypeModule.isNeverType(type));
            return undefined;
        }
        if (!discriminantFn) {
            Debug.assert(logicalObjectInner);
            Debug.assert(!floughTypeModule.isNeverType(type));
            return [logicalObject, type];
        }
        Debug.assert(lookupItemsInner);
        // eslint-disable-next-line prefer-const
        let { effectiveDeclaredTsType: effectiveDeclaredType, variations } = logicalObject;

        /**
         * By setting the key->type in the variations,
         * we patching the logicalObject with an override for a specific key, while allowing the other keys to ramain the same.
         * Therefore a cloneLogicalObject() function is not required.
         * This is especially important when the property for the key is an object which **has been** trimmed.
         * Note "has been" and not "wiil be" - because the object chains are flow-processed from the from the end of the chain to the start.
         * E.g. a.b.c is processed as c then b then a.
         * We only do this for unique keys, because if the key is not unique, it could require too many variations to be created (exponential growth with chain length).
         * The key patch, along with the shallow below, is enough.
         * Note also that, when a discrimant is passed, the return shallow-cloned and patched logicalObject must be associated with a symbol
         * - if it has no symbol, there is no way to reference it.
         * ```
         * if (createMyObject(random()).kind==="a") {
         *     // oops, no way to reference the object created by createMyObject() - it has no symbol.
         * }
         * ```
         */
        if (key){
            if (!variations) variations = new Map<LiteralType,FloughType>();
            const got = variations.get(key);
            if (!got) variations.set(key, type);
            else variations.set(key,floughTypeModule.intersectionWithFloughTypeMutate(type, floughTypeModule.cloneType(got)));
        }
        return type ? [
            { inner: logicalObjectInner, effectiveDeclaredTsType: effectiveDeclaredType, variations },
            type
        ] : undefined;
    }

    function dbgLogicalObjectToStrings(logicalObjectTop: Readonly<FloughLogicalObjectOuter>): string[] {
        const as: string[] = [];
        const { inner, effectiveDeclaredTsType: effectiveDeclaredType, variations } = logicalObjectTop;
        if (effectiveDeclaredType) as.push(`effectiveDeclaredType: ${dbgsModule.dbgTypeToString(effectiveDeclaredType)}`);
        else as.push(`effectiveDeclaredType: <undef>`);
        if (variations) {
            variations.forEach((value,key)=>{
                as.push(`variation:  key:${dbgsModule.dbgTypeToString(key)}], value:${dbgsModule.dbgFloughTypeToString(value)}`);
            });
        }
        floughLogicalObjectInnerModule.dbgLogicalObjectToStrings(inner).forEach(s=>as.push(`inner: ${s}`));
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