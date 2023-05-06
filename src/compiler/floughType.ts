namespace ts {

    export interface FloughType {};

    // leave the names the same in RefTypesType while changing the names in FloughTypeIF
    export interface FloughTypeModule {
        /**
         * Interface copied from RefTypesTypeModule
         */

        createRefTypesType(tstype?: Readonly<Type> | Readonly<Type[]>): FloughType ;
        cloneRefTypesType(t: Readonly<FloughType>): FloughType;
        addTypeToRefTypesType({source,target}: { source: Readonly<Type>, target: FloughType}): FloughType ;
        mergeToRefTypesType({source,target}: { source: Readonly<FloughType>, target: FloughType}): void ; // DEPRECATED
        unionOfRefTypesType(types: Readonly<FloughType[]>): FloughType ;
        intersectionOfRefTypesType(...args: Readonly<FloughType>[]): FloughType ;
        isASubsetOfB(a: Readonly<FloughType>, b: Readonly<FloughType>): boolean;
        subtractFromType(subtrahend: Readonly<FloughType>, minuend: Readonly<FloughType>, /* errorOnMissing = false */): FloughType ;
        getTypeFromRefTypesType(type: Readonly<FloughType>): Type ;
        isNeverType(type: Readonly<FloughType>): boolean ;
        isAnyType(type: Readonly<FloughType>): boolean ;
        isUnknownType(type: Readonly<FloughType>): boolean ;
        forEachRefTypesTypeType<F extends (t: Type) => any>(type: Readonly<FloughType>, f: F): void ;
        equalRefTypesTypes(a: Readonly<FloughType>, b: Readonly<FloughType>): boolean;
        addTsTypeNonUnionToRefTypesTypeMutate(tstype: Type, type: FloughType): FloughType;
        partitionForEqualityCompare(a: Readonly<FloughType>, b: Readonly<FloughType>): PartitionForEqualityCompareItem[];
        // end of interface copied from RefTypesTypeModule

        /**
         * Prefered interface for FloughType
         * @param ft
         */
        createFromTsType(tstype: Readonly<Type>): FloughType;
        unionWithTsTypeMutate(tstype: Readonly<Type>, ft: FloughType): FloughType;
        cloneType(ft: Readonly<FloughType>): FloughType;
        createNeverType(): FloughType;
        //isNeverType(ft: Readonly<FloughType>): boolean; // already defined above
        getNeverType(): Readonly<FloughType>;
        getNumberType(): Readonly<FloughType>;
        getUndefinedType(): Readonly<FloughType>;
        dbgFloughTypeToStrings(type: Readonly<FloughType>): string[];
        intersectionWithFloughTypeMutate(ft1: Readonly<FloughType>, ft2: FloughType): FloughType;
        unionWithFloughTypeMutate(ft1: Readonly<FloughType>, ft2: FloughType): FloughType;
        differenceWithFloughTypeMutate(subtrahend: Readonly<FloughType>, minuend: FloughType): FloughType;
    }




    const floughTypeModuleTmp: Partial<FloughTypeModule> = {
        /**
         * Interface copied from RefTypesTypeModule
         */
        createRefTypesType(tstype?: Readonly<Type> | Readonly<Type[]>): FloughType {
            if (tstype === undefined) return createNeverType();
            if (Array.isArray(tstype)) {
                let ft = createNeverType();
                tstype.forEach((t,_i)=>{
                    ft = unionWithTsTypeMutate(t,ft);
                });
                return ft;
            }
            return createFromTsType(tstype as Type);
        },
        cloneRefTypesType(t: Readonly<FloughType>): FloughType {
            return cloneType(t);
        },
        addTypeToRefTypesType({source,target}: { source: Readonly<Type>, target: FloughType}): FloughType {
            return unionWithTsTypeMutate(source,target);
        },
        mergeToRefTypesType({source:_a,target:_b}: { source: Readonly<FloughType>, target: FloughType}): void {
            Debug.fail("mergeToRefTypesType is deprecated");
        },
        unionOfRefTypesType(types: Readonly<FloughType[]>): FloughType {
            let ft = createNeverType();
            types.forEach((t,_i)=>{
                ft = unionWithFloughTypeMutate(t,ft);
            });
            return ft;
        },
        intersectionOfRefTypesType(...args: Readonly<FloughType>[]): FloughType {
            if (args.length === 0) return createNeverType();
            let ft = args[0];
            args.slice(1).forEach((t,_i)=>{
                ft = intersectionWithFloughTypeMutate(t,ft);
            });
            return ft;
        }
        // isASubsetOfB(a: Readonly<FloughType>, b: Readonly<FloughType>): boolean {
        //     return ;
        // },
        // end of interface copied from RefTypesTypeModule
    } as FloughTypeModule;

    export const floughTypeModule = floughTypeModuleTmp as FloughTypeModule;

    const checker = 0 as any as TypeChecker;
    export function initFloughTypeModule(checkerIn: TypeChecker): void {
        (checker as any) = checkerIn;
    }

    // type FloughTypeNonObj = & {
    //     any?: true;
    //     unknown?: true;
    //     string?: true | Set<LiteralType>;
    //     number?: true | Set<LiteralType>;
    //     bigint?: true | Set<LiteralType>;
    //     null?: true;
    //     undefined?: true;
    //     boolTrue?: true;
    //     boolFalse?: true;
    //     symbol?: true;
    //     uniqueSymbol?: true;
    //     void?: true;
    // };


    type FloughTypei = & {
        any?: true;
        unknown?: true;
        string?: true | Set<LiteralType>;
        number?: true | Set<LiteralType>;
        bigint?: true | Set<LiteralType>;
        null?: true;
        undefined?: true;
        boolTrue?: true;
        boolFalse?: true;
        symbol?: true;
        uniqueSymbol?: true;
        void?: true;
        logicalObject?: FloughLogicalObjectIF;
    };

    // @ts-expect-error
    function castFloughType(ft: FloughType): asserts ft is FloughTypei {}


    function createNeverType(): FloughTypei {
        return {};
    }
    function cloneType(ft: Readonly<FloughTypei>): FloughTypei {
        const ft1 = { ...ft };
        if (ft1.string && ft1.string !== true) ft1.string = new Set(ft1.string);
        if (ft1.number && ft1.number !== true) ft1.number = new Set(ft1.number);
        if (ft1.bigint && ft1.bigint !== true) ft1.bigint = new Set(ft1.bigint);
        return ft1;
    }
    function isNeverType(ft: Readonly<FloughTypei>): boolean {
        let empty = true;
        for (const _key in ft) {
            empty = false;
            break;
        }
        return empty;
    }

    function createFromTsType(tstype: Readonly<Type>): FloughTypei {
        return unionWithTsTypeMutate(tstype, createNeverType());
    }
    function unionWithTsTypeMutate(tstype: Readonly<Type>, ft: FloughTypei): FloughTypei {
        if (ft.any) return ft;
        if (tstype.flags & TypeFlags.Any) {
            return { any:true };
        }
        if (ft.unknown) return ft;
        if (tstype.flags & TypeFlags.Unknown) {
            ft.unknown = true;
            return { unknown: true };
        }
        function doUnionOne(t: Type) {
            if (t.flags & TypeFlags.Never) return;
            if (t.flags & TypeFlags.StringLike) {
                if (t.flags & TypeFlags.String){
                    ft.string = true;
                    return;
                }
                if (t.flags & TypeFlags.StringLiteral){
                    if (!ft.string || ft.string===true) {
                        ft.string = new Set<LiteralType>();
                    }
                    ft.string.add(t as LiteralType);
                    return;
                }
                Debug.fail("not yet implemented: ",()=>Debug.formatTypeFlags(t.flags));
            }
            if (t.flags & TypeFlags.NumberLike) {
                if (t.flags & TypeFlags.Number){
                    ft.number = true;
                    return;
                }
                if (t.flags & TypeFlags.NumberLiteral){
                    if (!ft.number || ft.number===true) {
                        ft.number = new Set<LiteralType>();
                    }
                    ft.number.add(t as LiteralType);
                    return;
                }
                Debug.fail("not yet implemented: ",()=>Debug.formatTypeFlags(t.flags));
            }
            if (t.flags & TypeFlags.BigIntLike) {
                if (t.flags & TypeFlags.BigInt){
                    ft.bigint = true;
                    return;
                }
                if (t.flags & TypeFlags.BigIntLiteral){
                    if (!ft.bigint || ft.bigint===true) {
                        ft.bigint = new Set<LiteralType>();
                    }
                    ft.bigint.add(t as LiteralType);
                    return;
                }
                Debug.fail("not yet implemented: ",()=>Debug.formatTypeFlags(t.flags));
            }
            if (t.flags & TypeFlags.BooleanLike) {
                if (t.flags & TypeFlags.BooleanLiteral){
                    if ((t as LiteralType).value){
                        ft.boolTrue = true;
                    }
                    else {
                        ft.boolFalse = true;
                    }
                    return;
                }
                Debug.fail("not yet implemented: ",()=>Debug.formatTypeFlags(t.flags));
            }
            if (t.flags & TypeFlags.ESSymbol) {
                ft.symbol = true;
                return;
            }
            if (t.flags & TypeFlags.UniqueESSymbol) {
                ft.uniqueSymbol = true;
                return;
            }
            if (t.flags & TypeFlags.Void) {
                ft.void = true;
                return;
            }
            if (t.flags & TypeFlags.Undefined) {
                ft.undefined = true;
                return;
            }
            if (t.flags & TypeFlags.Null) {
                ft.null = true;
                return;
            }
            if (t.flags & TypeFlags.Object) {
                if (!ft.logicalObject) {
                    ft.logicalObject = createFloughLogicalObjectPlain(t as ObjectType);
                }
                else{
                    ft.logicalObject = unionOfFloughLogicalObject(ft.logicalObject, createFloughLogicalObjectPlain(t as ObjectType));
                }
                return;
            }
            if (t.flags & TypeFlags.Union) {
                // TODO: might want to consider using t.origin if it exists, because it is possibly a more time & space efficient representation
                assertCastType<UnionType>(t);
                const arrlogobj: FloughLogicalObjectIF[] = [];
                t.types.forEach(tsub => {
                    if ((tsub.flags & TypeFlags.Object)) arrlogobj.push(createFloughLogicalObjectPlain(tsub as ObjectType));
                    else if (tsub.flags & (TypeFlags.Union|TypeFlags.Intersection)) {
                        const {logicalObject:logicalObjectSub, ...ftsub}  = createFromTsType(tsub);
                        ft = unionWithFloughTypeNonObjMutate(ftsub, ft);
                        if (logicalObjectSub) arrlogobj.push(logicalObjectSub);
                    }
                    else doUnionOne(tsub);
                });
                if (arrlogobj.length!==0) {
                    const logobj = createFloughLogicalObjectTsunion(t,arrlogobj);
                    if (!ft.logicalObject) {
                        ft.logicalObject = logobj;
                    }
                    else {
                        ft.logicalObject = unionOfFloughLogicalObject(ft.logicalObject, logobj);
                    }
                }
                return;
            }
            if (t.flags & TypeFlags.Intersection) {
                assertCastType<IntersectionType>(t);
                // TODO: might want to consider using t.origin if it exists, because it is possibly a more time & space efficient representation
                /**
                 * first calulcate the typescript-intersection type, then union that result with the current flough-type
                 */
                const arrlogobj: FloughLogicalObjectIF[] = [];
                Debug.assert(t.types.length!==0);
                let iftNonObj: FloughTypei | undefined;
                t.types.forEach(tsub => {
                    if ((tsub.flags & TypeFlags.Object)) arrlogobj.push(createFloughLogicalObjectPlain(tsub as ObjectType));
                    else if (tsub.flags & (TypeFlags.Union|TypeFlags.Intersection)) {
                        const {logicalObject:logicalObjectSub, ...ftsub}  = createFromTsType(tsub);
                        if (!iftNonObj) iftNonObj = ftsub;
                        else iftNonObj = intersectionWithFloughTypeNonObjMutate(ftsub, iftNonObj);
                        if (logicalObjectSub) arrlogobj.push(logicalObjectSub);
                    }
                    else {
                        const ftsub = createFromTsType(tsub);
                        if (!iftNonObj) iftNonObj = ftsub;
                        else iftNonObj = intersectionWithFloughTypeNonObjMutate(ftsub, iftNonObj);
                    }
                });
                if (arrlogobj.length!==0) {
                    const logobj = createFloughLogicalObjectTsintersection(t,arrlogobj);
                    if (!ft.logicalObject) {
                        ft.logicalObject = logobj;
                    }
                    else {
                        ft.logicalObject = unionOfFloughLogicalObject(ft.logicalObject, logobj);
                    }
                }
                return;
            }
            Debug.fail("not yet implemented: ",()=>Debug.formatTypeFlags(tstype.flags));
        }
        doUnionOne(tstype);
        return ft;
    }
    /**
     * create the union of two flough-types, where neither has an object type
     * @param ft0
     * @param ft1
     * @returns
     */
    function unionWithFloughTypeNonObjMutate(ft0: Readonly<FloughTypei>, ft1: FloughTypei): FloughTypei {
        return unionWithFloughTypeMutate(ft0, ft1, /**/ true);
    }
    function unionWithFloughTypeMutate(ft0: Readonly<FloughTypei>, ft1: FloughTypei, doNotAllowObjToBePresent?: true): FloughTypei {
        //Debug.assert(!ft0.logicalObject && !ft1.logicalObject);
        if (ft1.any) return ft1;
        if (ft0.any) return { any: true };
        if (ft1.unknown) return ft0;
        if (ft0.unknown) return ft1;
        if (isNeverType(ft0) && isNeverType(ft1)) return {};
        if (ft0.string){
            if (ft1.string===undefined) {
                if (ft0.string===true) ft1.string = true;
                else ft1.string = new Set<LiteralType>(ft0.string);
            }
            else if (ft1.string!==true) {
                if (ft0.string===true) ft1.string = true;
                else {
                    ft0.string.forEach(lit => (ft1.string as Set<LiteralType>).add(lit));
                }
            }
        }
        if (ft0.number){
            if (ft1.number===undefined) {
                if (ft0.number===true) ft1.number = true;
                else ft1.number = new Set<LiteralType>(ft0.number);
            }
            else if (ft1.number!==true) {
                if (ft0.number===true) ft1.number = true;
                else {
                    ft0.number.forEach(lit => (ft1.number as Set<LiteralType>).add(lit));
                }
            }
        }
        if (ft0.bigint){
            if (ft1.bigint===undefined) {
                if (ft0.bigint===true) ft1.bigint = true;
                else ft1.bigint = new Set<LiteralType>(ft0.bigint);
            }
            else if (ft1.bigint!==true) {
                if (ft0.bigint===true) ft1.bigint = true;
                else {
                    ft0.bigint.forEach(lit => (ft1.bigint as Set<LiteralType>).add(lit));
                }
            }
        }
        if (ft0.boolTrue) ft1.boolTrue = true;
        if (ft0.boolFalse) ft1.boolFalse = true;
        if (ft0.null) ft1.null = true;
        if (ft0.void) ft1.void = true;
        if (ft0.undefined) ft1.undefined = true;
        if (ft0.symbol) ft1.symbol = true;
        if (ft0.uniqueSymbol) ft1.uniqueSymbol = true;

        if (doNotAllowObjToBePresent) {
            if (ft0.logicalObject || ft1.logicalObject) Debug.fail("unexpected");
        }
        if (ft0.logicalObject) {
            if (ft1.logicalObject) ft1.logicalObject = unionOfFloughLogicalObject(ft0.logicalObject, ft1.logicalObject);
            else ft1.logicalObject = ft0.logicalObject;
        }
        return ft1;
    }

    function intersectionWithFloughTypeNonObjMutate(ft0: Readonly<FloughTypei>, ft1: FloughTypei): FloughTypei {
        return intersectionWithFloughTypeMutate(ft0, ft1, /**/ true);
    }
    function intersectionWithFloughTypeMutate(ft0: Readonly<FloughTypei>, ft1: FloughTypei, doNotAllowObjToBePresent?: true): FloughTypei {
        if (ft1.any) return ft1;
        if (ft0.any) return { any: true };
        if (ft1.unknown) return ft0;
        if (ft0.unknown) return ft1;
        if (isNeverType(ft0) || isNeverType(ft1)) return {};
        if (ft1.string) {
            if (ft0.string===undefined) delete ft1.string;
            else if (ft0.string!==true) {
                if (ft1.string===true) ft1.string = new Set<LiteralType>(ft0.string);
                else {
                    ft1.string.forEach((v)=>{
                        if (!(ft0.string as Set<LiteralType>).has(v)) (ft1.string as Set<LiteralType>).delete(v);
                    });
                }
            }
        }
        if (ft1.number) {
            if (ft0.number===undefined) delete ft1.number;
            else if (ft0.number!==true) {
                if (ft1.number===true) ft1.number = new Set<LiteralType>(ft0.number);
                else {
                    ft1.number.forEach((v)=>{
                        if (!(ft0.number as Set<LiteralType>).has(v)) (ft1.number as Set<LiteralType>).delete(v);
                    });
                }
            }
        }
        if (ft1.bigint) {
            if (ft0.bigint===undefined) delete ft1.bigint;
            else if (ft0.bigint!==true) {
                if (ft1.bigint===true) ft1.bigint = new Set<LiteralType>(ft0.bigint);
                else {
                    ft1.bigint.forEach((v)=>{
                        if (!(ft0.bigint as Set<LiteralType>).has(v)) (ft1.bigint as Set<LiteralType>).delete(v);
                    });
                }
            }
        }
        if (ft1.boolTrue) {
            if (ft0.boolTrue===undefined) delete ft1.boolTrue;
        }
        if (ft1.boolFalse) {
            if (ft0.boolFalse===undefined) delete ft1.boolFalse;
        }
        if (ft1.symbol) {
            if (ft0.symbol===undefined) delete ft1.symbol;
        }
        if (ft1.uniqueSymbol) {
            if (ft0.uniqueSymbol===undefined) delete ft1.uniqueSymbol;
        }
        if (ft1.null) {
            if (ft0.null===undefined) delete ft1.null;
        }
        if (ft1.void) {
            if (ft0.null===undefined) delete ft1.void;
        }
        if (ft1.undefined) {
            if (ft0.undefined===undefined) delete ft1.undefined;
        }
        if (doNotAllowObjToBePresent) {
            if (ft0.logicalObject || ft1.logicalObject) Debug.fail("unexpected");
        }
        if (ft1.logicalObject) {
            if (!ft0.logicalObject) delete ft1.logicalObject;
            else ft1.logicalObject = intersectionOfFloughLogicalObject(ft0.logicalObject, ft1.logicalObject);
        }
        return ft1;
    }

    /**
     * `subtrahend` is subtracted from `minuend`, possibly mutating input minuend.  The resulting minuend is returned, which may be different from the input minuend.
     * The input minuend should not be used after this function is called.
     * The input subtrahend and output minuend are mutually exclusive, with exceptions as follows
     * - string/number/bigint literals cannot be subtracted from string/number/bigint, because there is no represention for the not-literal case.
     *
     *
     * @param subtrahend
     * @param minuend
     * @returns
     */
    // @ts-expect-error
    function differenceWithFloughTypeMutate(subtrahend: Readonly<FloughTypei>, minuend: FloughTypei, doNotAllowObjToBePresent?: true): FloughTypei {
        if (minuend.any) return minuend;
        if (subtrahend.any) return {};
        if (subtrahend.unknown) return {};
        if (minuend.unknown) return minuend;
        if (isNeverType(subtrahend)) return minuend;
        if (isNeverType(minuend)) return {};
        if (subtrahend.string && minuend.string) {
            if (subtrahend.string===true) delete minuend.string;
            else if (minuend.string!==true){
                subtrahend.string.forEach((v)=>{
                    (minuend.string as Set<LiteralType>).delete(v);
                });
            }
        }
        if (subtrahend.number && minuend.number) {
            if (subtrahend.number===true) delete minuend.number;
            else if (minuend.number!==true){
                subtrahend.number.forEach((v)=>{
                    (minuend.number as Set<LiteralType>).delete(v);
                });
            }
        }
        if (subtrahend.bigint && minuend.bigint) {
            if (subtrahend.bigint===true) delete minuend.bigint;
            else if (minuend.bigint!==true){
                subtrahend.bigint.forEach((v)=>{
                    (minuend.bigint as Set<LiteralType>).delete(v);
                });
            }
        }
        if (subtrahend.boolFalse && minuend.boolFalse) {
            delete minuend.boolFalse;
        }
        if (subtrahend.boolTrue && minuend.boolTrue) {
            delete minuend.boolTrue;
        }
        if (subtrahend.symbol && minuend.symbol) {
            delete minuend.symbol;
        }
        if (subtrahend.uniqueSymbol && minuend.uniqueSymbol) {
            delete minuend.uniqueSymbol;
        }
        if (subtrahend.null && minuend.null) {
            delete minuend.null;
        }
        if (subtrahend.undefined && minuend.undefined) {
            delete minuend.undefined;
        }
        if (subtrahend.void && minuend.void) {
            delete minuend.void;
        }
        if (doNotAllowObjToBePresent) {
            if (subtrahend.logicalObject || minuend.logicalObject) Debug.fail("unexpected");
        }
        if (subtrahend.logicalObject && minuend.logicalObject) {
            minuend.logicalObject = differenceOfFloughLogicalObject(subtrahend.logicalObject, minuend.logicalObject);
        }
        return minuend;
    }
    // The non-object versions are only required for the specicial Typescript type-operators `&` and `|`, therefore `difference...NonObj` not required.
    // function differenceWithFloughTypeNonObjMutate(subtrahend: Readonly<FloughTypei>, minuend: FloughTypei): FloughTypei {
    //     differenceWithFloughTypeMutate(subtrahend, minuend, /**/ true);
    // }


}
