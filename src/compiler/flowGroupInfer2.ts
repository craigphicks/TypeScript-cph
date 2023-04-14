/* eslint-disable no-double-space */
namespace ts {

    export function isRefTypesTableReturn(x: RefTypesTable): x is RefTypesTableReturn {
        return x.kind===RefTypesTableKind.return;
    }

    export interface MrNarrow {
        mrNarrowTypes({ sci, expr, crit, qdotfallout, inferStatus }: MrNarrowTypesArgs): MrNarrowTypesReturn;
        createRefTypesSymtab(): RefTypesSymtab;
        copyRefTypesSymtab(symtab: Readonly<RefTypesSymtab>): RefTypesSymtab;
        createRefTypesType(type?: Readonly<Type> | Readonly<Type[]>): RefTypesType;
        dbgRefTypesTypeToString(rt: Readonly<RefTypesType>): string;
        dbgRefTypesTableToStrings(t: RefTypesTable): string[],
        dbgRefTypesSymtabToStrings(t: RefTypesSymtab): string[],
        dbgConstraintItem(ci: Readonly<ConstraintItem>): string[];
        dbgSymbolToStringSimple(symbol: Symbol): string,
        dbgNodeToString(node: Node): string;
        equalRefTypesTypes(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): boolean;
        mergeToRefTypesType({source,target}: { source: Readonly<RefTypesType>, target: RefTypesType}): void,
        unionOfRefTypesType(types: Readonly<RefTypesType[]>): RefTypesType,
        createNodeToTypeMap(): NodeToTypeMap,
        mergeIntoNodeToTypeMaps(source: Readonly<NodeToTypeMap>, target: NodeToTypeMap): void,
        unionArrRefTypesSymtab(arr: Readonly<Readonly<RefTypesSymtab>[]>): RefTypesSymtab,
        intersectionOfRefTypesType(...args: Readonly<RefTypesType>[]): RefTypesType,
        isASubsetOfB(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): boolean;
        subtractFromType(subtrahend: Readonly<RefTypesType>, minuend: Readonly<RefTypesType>): RefTypesType;
        isNeverType(t: Readonly<RefTypesType>): boolean,
        isAnyType(t: Readonly<RefTypesType>): boolean,
        isUnknownType(t: Readonly<RefTypesType>): boolean,
        cloneRefTypesType(type: Readonly<RefTypesType>): RefTypesType;
        getEffectiveDeclaredType(symbolFlowInfo: SymbolFlowInfo): RefTypesType;
        getDeclaredType(symbol: Symbol): RefTypesType;
        checker: TypeChecker,
        compilerOptions: CompilerOptions,
        mrState: MrState,
        refTypesTypeModule: RefTypesTypeModule,
    };

    export function createMrNarrow(checker: TypeChecker, sourceFile: Readonly<SourceFile>, _mrState: MrState, refTypesTypeModule: RefTypesTypeModule, compilerOptions: CompilerOptions): MrNarrow {
        const {
            // @ts-ignore-error
            subtypeRelation,
            // @ts-ignore-error
            strictSubtypeRelation,
            assignableRelation,
            // @ts-ignore-error
            comparableRelation,
            // @ts-ignore-error
            identityRelation,
            // @ts-ignore-error
            enumRelation,
        } = checker.getRelations();
        // const neverType = checker.getNeverType();
        const undefinedType = checker.getUndefinedType();
        // const unknownType = checker.getUnknownType();
        const errorType = checker.getErrorType();
        const nullType = checker.getNullType();
        const stringType = checker.getStringType();
        const numberType = checker.getNumberType();
        // const bigintType = checker.getBigIntType();
        //const booleanType = checker.getBooleanType();
        // @ts-ignore
        const anyType = checker.getAnyType();
        const trueType = checker.getTrueType();
        const falseType = checker.getFalseType();
        const typeToString = checker.typeToString;
        const getTypeOfSymbol = checker.getTypeOfSymbol;
        const isArrayType = checker.isArrayType;
        const isArrayOrTupleType = checker.isArrayOrTupleType;
        const getElementTypeOfArrayType = checker.getElementTypeOfArrayType;
        //const getReturnTypeOfSignature = checker.getReturnTypeOfSignature;
        //const isReadonlyProperty = checker.isReadonlyProperty;
        const isConstVariable = checker.isConstVariable;
        // @ ts-ignore-error
        //const isConstantReference = checker.isConstantReference;
        // @ ts-ignore-error
        // const getNodeLinks = checker.getNodeLinks;
        const getUnionType = checker.getUnionType;
        const getResolvedSymbol = checker.getResolvedSymbol; // for Identifiers only
        const getSymbolOfNode = checker.getSymbolOfNode;

        const {
            dbgNodeToString,
            //dbgSignatureToString,
            dbgSymbolToStringSimple,
            dbgTypeToString,
            // @ts-expect-error
            dbgTypeToStringDetail,
        } = createDbgs(checker);

        const {
            getTypeMemberCount,
            //orEachTypeIfUnion, //<F extends ((t: Type) => any)>(type: Type, f: F): void ;
            createRefTypesType,
            cloneRefTypesType,
            addTypeToRefTypesType,
            mergeToRefTypesType,
            unionOfRefTypesType,
            intersectionOfRefTypesType,
            isASubsetOfB,
            subtractFromType,
            getTypeFromRefTypesType,
            isNeverType,
            isAnyType,
            isUnknownType,
            forEachRefTypesTypeType,
            partitionIntoSingularAndNonSingularTypes,
            equalRefTypesTypes,
        } = refTypesTypeModule; //createRefTypesTypeModule(checker);

        const mrNarrow: MrNarrow = {
            // forwarded from flowGroupInferRefTypesType
            createRefTypesType,
            equalRefTypesTypes,
            mergeToRefTypesType,
            unionOfRefTypesType,
            intersectionOfRefTypesType,
            isASubsetOfB,
            subtractFromType,
            isNeverType,
            isAnyType,
            isUnknownType,
            //getLiteralsOfANotInB,
            //applyCritToRefTypesType,

            mrNarrowTypes,
            createRefTypesSymtab,
            copyRefTypesSymtab,
            dbgRefTypesTypeToString,
            dbgRefTypesTableToStrings,
            dbgRefTypesSymtabToStrings,
            dbgConstraintItem,
            dbgSymbolToStringSimple,
            dbgNodeToString,
            //mergeArrRefTypesTableReturnToRefTypesTableReturn,
            createNodeToTypeMap,
            mergeIntoNodeToTypeMaps: mergeIntoMapIntoNodeToTypeMaps,
            unionArrRefTypesSymtab,
            cloneRefTypesType,
            getEffectiveDeclaredType,
            getDeclaredType,
            checker,
            compilerOptions,
            mrState: _mrState,
            refTypesTypeModule,
        };





        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function getEffectiveDeclaredType(symbolFlowInfo: SymbolFlowInfo): RefTypesType {
            return symbolFlowInfo.effectiveDeclaredType ?? (symbolFlowInfo.effectiveDeclaredType=mrNarrow.createRefTypesType(symbolFlowInfo.effectiveDeclaredTsType));
        }
        function getSymbolFlowInfoInitializerOrDeclaredTypeFromSymbolFlowInfo(symbolFlowInfo: SymbolFlowInfo): RefTypesType {
            return symbolFlowInfo.initializerType ??
                symbolFlowInfo.effectiveDeclaredType ??
                    (symbolFlowInfo.effectiveDeclaredType=createRefTypesType(symbolFlowInfo.effectiveDeclaredTsType));
        }

        function getSymbolFlowInfoInitializerOrDeclaredType(symbol: Symbol): RefTypesType {
            if (symbol.flags & SymbolFlags.EnumMember){
                Debug.fail("unexpected");
            }
            const symbolFlowInfo = _mrState.symbolFlowInfoMap.get(symbol);
            Debug.assert(symbolFlowInfo);
            return getSymbolFlowInfoInitializerOrDeclaredTypeFromSymbolFlowInfo(symbolFlowInfo);
        }
        /**
         *
         * @param symbol
         * @returns
         */
        function getDeclaredType(symbol: Symbol): RefTypesType {
            const symbolFlowInfo = _mrState.symbolFlowInfoMap.get(symbol);
            Debug.assert(symbolFlowInfo);
            return getEffectiveDeclaredType(symbolFlowInfo);
            //return getSymbolFlowInfoInitializerOrDeclaredType(symbol);
        }



        // @ ts-ignore
        function enumMemberSymbolToLiteralTsType(symbol: Symbol): Type {
            Debug.assert(symbol.flags & SymbolFlags.EnumMember);
            const litValue = (getTypeOfSymbol(symbol) as LiteralType).value;
            if (typeof litValue==="string") return checker.getStringLiteralType(litValue);
            else if (typeof litValue==="number") return checker.getNumberLiteralType(litValue);
            Debug.fail("unexpected");
        }

        // function createRefTypesSymtab(): RefTypesSymtab {
        //     return new Map<Symbol, RefTypesType>();
        // }

        // function copyRefTypesSymtab(symtab: Readonly<RefTypesSymtab>): RefTypesSymtab {
        //     return new Map<Symbol, RefTypesType>(symtab);
        // }
        /**
         * Should be the most efficient way to get union of symtabs
         * @param arr
         * @returns
         */
        // function unionArrRefTypesSymtab(arr: Readonly<RefTypesSymtab>[]): RefTypesSymtab {
        //     const target = createRefTypesSymtab();
        //     if (arr.length===0) return target;
        //     if (arr.length===1) return arr[0];
        //     const mapSymToType = new Map<Symbol,{set: Set<Type>}>();
        //     arr.forEach(rts=>{
        //         rts.forEach((type,symbol)=>{
        //             let got = mapSymToType.get(symbol);
        //             if (!got) {
        //                 got = { set:new Set<Type>() };
        //                 mapSymToType.set(symbol, got);
        //             }
        //             forEachRefTypesTypeType(type, t=>got!.set.add(t));
        //         });
        //     });
        //     mapSymToType.forEach(({set},symbol)=>{
        //         // const isconst = _mrState.symbolFlowInfoMap.get(symbol)!.isconst;
        //         const atype: Type[]=[];
        //         set.forEach(t=>atype.push(t));
        //         const type = createRefTypesType(atype);
        //         target.set(symbol,type);
        //     });
        //     return target;
        // }

        function dbgRefTypesTypeToString(rt: Readonly<RefTypesType>): string {
            const astr: string[]=[];
            forEachRefTypesTypeType(rt, t=>astr.push(typeToString(t)));
            return astr.join(" | ");
            // return typeToString(getTypeFromRefTypesType(rt));
        }
        function dbgConstraintItem(ci: ConstraintItem): string[] {
            Debug.assert(ci);
            //if (!ci) return ["undefined"];
            const as: string[]=["{"];
            if (!ci.symbolsInvolved) as.push(` symbolsInvoled: <undefined>`);
            else {
                let str = " symbolsInvoled:";
                ci.symbolsInvolved.forEach(s=>str+=`${s.escapedName},`);
                as.push(str);
            }
            as.push(` kind: ${ci.kind},`);
            if (ci.kind===ConstraintItemKind.never){/**/}
            else if (ci.kind===ConstraintItemKind.always){/**/}
            else if (ci.kind===ConstraintItemKind.leaf){
                as.push(`  symbol: ${dbgSymbolToStringSimple(ci.symbol)},`);
                as.push(`  type: ${dbgRefTypesTypeToString(ci.type)},`);
            }
            else {
                as.push(`  node: ${ci.op},`);
                if (ci.op===ConstraintItemNodeOp.not) {
                    as.push(`  constraint:`);
                    dbgConstraintItem(ci.constraint).forEach(s=>as.push("    " + s));
                    as[as.length-1] += ",";
                }
                else {
                    as.push(`  constraints:[`);
                    ci.constraints.forEach(ci1 => {
                        dbgConstraintItem(ci1).forEach(s=>as.push("    " + s));
                    });
                    as.push(`  ],`);
                }
            }
            as.push("},");
            return as;
        }
        function dbgRefTypesTableLeafToString(symbol: Symbol, rtt: RefTypesType): string {
            return `{symbol:${dbgSymbolToStringSimple(symbol)},type:${dbgRefTypesTypeToString(rtt)}}`;
        };
        function dbgRefTypesTableToStrings(rtt: RefTypesTable | undefined): string[] {
            if (!rtt) return ["undefined"];
            const as: string[]=["{"];
            as.push(`  kind: ${rtt.kind},`);
            if ((rtt as any).symbol) as.push(`  symbol: ${dbgSymbolToStringSimple((rtt as any).symbol)},`);
            if ((rtt as any).isconst) as.push(`  isconst: ${(rtt as any).isconst},`);
            if ((rtt as RefTypesTableReturn).isAssign) as.push(`  isAssign: ${(rtt as any).isAssign},`);
            Debug.assert(rtt.type);
            as.push(`  type: ${dbgRefTypesTypeToString(rtt.type)}`);
            if (isRefTypesTableReturn(rtt)){
                if (!rtt.sci.symtab) as.push("  symtab: <undef>");
                else dbgRefTypesSymtabToStrings(rtt.sci.symtab).forEach((str,i)=>as.push(((i===0)?"  symtab: ":"  ")+str));
                if (!rtt.sci.constraintItem){
                    as.push("  constraintItem: undefined");
                }
                else {
                    const ciss = dbgConstraintItem(rtt.sci.constraintItem);
                    as.push("  constraintItem: " + ciss[0]);
                    ciss.slice(1).forEach(s=>as.push("    "+s));
                }
            }
            as.push("}");
            return as;
        }
        // function dbgRefTypesSymtabToStrings(x: RefTypesSymtab): string[] {
        //     const as: string[]=["["];
        //     x.forEach((t,s)=>{
        //         as.push("  "+dbgRefTypesTableLeafToString(s,t));
        //     });
        //     as.push("]");
        //     return as;
        // }

        function createNodeToTypeMap(): NodeToTypeMap {
            return new Map<Node,Type>();
        }
        function mergeIntoMapIntoNodeToTypeMaps(source: Readonly<NodeToTypeMap>, target: NodeToTypeMap): void {
            // if (getMyDebug()){
            //     consoleGroup(`mergeIntoMapIntoNodeToTypeMaps[in]`);
            // }
            source.forEach((t,n)=>{
                // if (getMyDebug()){
                //     consoleLog(`mergeIntoNodeToTypeMaps[dbg] node:${dbgNodeToString(n)}, type:${typeToString(t)}`);
                // }
                const gott = target.get(n);
                if (!gott) target.set(n,t);
                else {
                    const tt = getUnionType([gott,t], UnionReduction.Literal);
                    target.set(n,tt);
                }
            });
            // if (getMyDebug()){
            //     let str = `mergeIntoNodeToTypeMaps[dbg] cum node ids:`;
            //     target.forEach((_type,node)=>{
            //         str += ` node.id:${node.id},`;
            //     });
            //     consoleLog(str);
            //     consoleGroupEnd();
            // }
        }
        // @ts-expect-error
        function mergeOneIntoNodeToTypeMaps(node: Readonly<Node>, type: Type, target: NodeToTypeMap, dontSkip?: boolean): void {
            if (!dontSkip) return;
            // if (getMyDebug()){
            //     consoleGroup(`mergeOneIntoNodeToTypeMaps[in] node:${dbgNodeToString(node)}, type:${typeToString(type)}, dontSkip:${dontSkip}`);
            // }
            const gott = target.get(node);
            if (!gott) target.set(node,type);
            else {
                const tt = getUnionType([gott,type], UnionReduction.Literal);
                target.set(node,tt);
            }
            // if (getMyDebug()){
            //     let str = `mergeOneIntoNodeToTypeMaps[dbg] cum node ids:`;
            //     target.forEach((_type,node)=>{
            //         str += ` node.id:${node.id},`;
            //     });
            //     consoleLog(str);
            //     consoleGroupEnd();
            // }
        }

        // @ts-expect-error
        function typeIsTruthy(tstype: Type): {true: boolean, false: boolean} {
            const tf = checker.getTypeFacts(tstype);
            return { true: !!(tf&TypeFacts.Truthy), false: !!(tf&TypeFacts.Falsy) };
        }
        // @ts-expect-error
        function typeIsNotNullUndef(tstype: Type): {true: boolean, false: boolean} {
            const tf = checker.getTypeFacts(tstype);
            return { true: !!(tf&TypeFacts.NEUndefinedOrNull), false: !!(tf&TypeFacts.EQUndefinedOrNull) };
        }
        // @ts-expect-error
        function typeIsAssignableTo(source: Type, target: Type): boolean {
            return checker.isTypeRelatedTo(source, target, assignableRelation);
        }


        /**
         *
         * @param type
         * @param crit
         * @returns type narrowed by criterion crit
         */
        // @ ts-ignore-error 6133
        function applyCritToRefTypesType<F extends (t: Type, pass: boolean, fail: boolean) => void>(rt: RefTypesType,crit: InferCrit, func: F): void {
            if (crit.kind===InferCritKind.none) {
                forEachRefTypesTypeType(rt, t => {
                    func(t, /* pass */ true, /* fail */ false);
                });
            }
            else if (crit.kind===InferCritKind.truthy) {
                const pfacts = !crit.negate ? TypeFacts.Truthy : TypeFacts.Falsy;
                const ffacts = !crit.negate ? TypeFacts.Falsy : TypeFacts.Truthy;
                forEachRefTypesTypeType(rt, t => {
                    const tf = checker.getTypeFacts(t);
                    func(t, !!(tf&pfacts), !!(tf & ffacts));
                });
            }
            else if (crit.kind===InferCritKind.notnullundef) {
                const pfacts = !crit.negate ? TypeFacts.NEUndefinedOrNull : TypeFacts.EQUndefinedOrNull;
                const ffacts = !crit.negate ? TypeFacts.EQUndefinedOrNull : TypeFacts.NEUndefinedOrNull;
                forEachRefTypesTypeType(rt, t => {
                    const tf = checker.getTypeFacts(t);
                    func(t, !!(tf&pfacts), !!(tf & ffacts));
                });
            }
            else if (crit.kind===InferCritKind.assignable) {
                forEachRefTypesTypeType(rt, source => {
                    let rel = checker.isTypeRelatedTo(source, crit.target, assignableRelation);
                    if (crit.negate) rel = !rel;
                    func(source, rel, !rel);
                });
            }
            // else if (crit.kind===InferCritKind.typeof) {
            //     Debug.fail("unexpected");
            // }
            else {
                // @ts-ignore
                Debug.assert(false, "cannot handle crit.kind ", ()=>crit.kind);
            }
        }

        /**
         *
         * If the value is omitted or is 0, -0, null, false, NaN, undefined, or the empty string (""),
         * return false type. All other values, return true type
         * @param uType
         */
        // @ts-ignore-error
        function convertNonUnionNonIntersectionTypeToBoolean(uType: Type): boolean {
            Debug.assert(!(uType.flags & TypeFlags.UnionOrIntersection));
            if (uType===undefinedType || uType===nullType) return false;
            // There is some ambiguity about boolean literal false
            if (uType.flags & TypeFlags.BooleanLiteral && (uType as IntrinsicType).intrinsicName==="false") return false;
            if (uType===checker.getFalseType()) return false;
            if (uType.flags & TypeFlags.StringLiteral && (uType as StringLiteralType).value==="") return false;
            if (uType.flags & TypeFlags.NumberLiteral && (
                (uType as NumberLiteralType).value===0 ||
                (uType as NumberLiteralType).value===-0 ||
                isNaN((uType as NumberLiteralType).value)
            )){
                return false;
            }
            return true;
        }


        function typeToTypeofStrings(tstype: Type): string[]{
            const flags = tstype.flags;
            if (flags & TypeFlags.UnionOrIntersection) Debug.fail("union or intersection types unexpected here");
            // Never           = 1 << 17,  // Never type
            // Unknown         = 1 << 1,
            if (flags & (TypeFlags.Never)) return []; //Debug.fail("never type unexpected here");
            // Any             = 1 << 0,
            if (flags & (TypeFlags.Any | TypeFlags.Unknown)) return ["undefined","string","number","boolean","bignint","object","function","symbol"];
            // String          = 1 << 2,
            // StringLiteral   = 1 << 7,
            if (flags & (TypeFlags.String | TypeFlags.StringLiteral)) return ["string"];
            // Number          = 1 << 3,
            // NumberLiteral   = 1 << 8,
            if (flags & (TypeFlags.Number | TypeFlags.NumberLiteral)) return ["number"];
            // Boolean         = 1 << 4,
            // BooleanLiteral  = 1 << 9,
            if (flags & (TypeFlags.Boolean | TypeFlags.BooleanLiteral)) return ["boolean"];
            // BigInt          = 1 << 6,
            // BigIntLiteral   = 1 << 11,
            if (flags & (TypeFlags.BigInt | TypeFlags.BigIntLiteral)) return ["bigint"];

            // Enum            = 1 << 5, -- is this always or'ed with number or string???
            // EnumLiteral     = 1 << 10,  // Always combined with StringLiteral, NumberLiteral, or Union

            // ESSymbol        = 1 << 12,  // Type of symbol primitive introduced in ES6
            // UniqueESSymbol  = 1 << 13,  // unique symbol
            if (flags & (TypeFlags.ESSymbol | TypeFlags.UniqueESSymbol)) return ["symbol"];

            // Void            = 1 << 14,
            // Undefined       = 1 << 15,
            if (flags & (TypeFlags.Void | TypeFlags.Undefined)) return ["undefined"];

            // Null            = 1 << 16,
            if (flags & (TypeFlags.Null)) return ["object"];
            // Object          = 1 << 19,  // Object type
            if (flags & (TypeFlags.Object)) {
                if (checker.isArrayType(tstype)||checker.isTupleType(tstype)) return ["object"];
                assertCastType<ObjectType>(tstype);
                if (tstype.callSignatures?.length || tstype.constructSignatures?.length) return ["function"];
                return ["object"];
            }
            Debug.fail(`unexpected tstype.flags: ${Debug.formatTypeFlags(flags)}`);
            // TypeParameter   = 1 << 18,  // Type parameter
            // Union           = 1 << 20,  // Union (T | U)
            // Intersection    = 1 << 21,  // Intersection (T & U)
            // Index           = 1 << 22,  // keyof T
            // IndexedAccess   = 1 << 23,  // T[K]
            // Conditional     = 1 << 24,  // T extends U ? X : Y
            // Substitution    = 1 << 25,  // Type parameter substitution
            // NonPrimitive    = 1 << 26,  // intrinsic object type
            // TemplateLiteral = 1 << 27,  // Template literal type
            // StringMapping   = 1 << 28,  // Uppercase/Lowercase type

        }

        // type TransientExpressionSymbol = Symbol & { expr: Expression, typeofArgSymbol: Symbol, map: WeakMap<Type, RefTypesType> };
        // function createTransientExpressionSymbol(expr: Expression, effectiveDeclaredTsType: Type, typeofArgSymbol: Symbol): TransientExpressionSymbol {
        //     const name = `transientExpressionSymbol`;//(${argSymbol.escapedName})`;
        //     if (getMyDebug()) (name as any) += `, node: ${dbgNodeToString(expr)}`;
        //     const symbol: TransientExpressionSymbol = {
        //         ... checker.createSymbol(0, name as __String),
        //         expr,
        //         typeofArgSymbol,
        //         map: new WeakMap<Type,RefTypesType>()
        //     };
        //     //if (options?.typeofArgSymbol) symbol.typeofArgSymbol = options.typeofArgSymbol;
        //     _mrState.symbolFlowInfoMap.set(symbol,{
        //         effectiveDeclaredTsType,
        //         isconst: true,
        //         passCount: 0,
        //     });
        //     return symbol;
        // }



        function mrNarrowTypesByTypeofExpression({
            sci:{symtab:refTypesSymtabIn,constraintItem:constraintItemIn}, expr, /* crit,*/ qdotfallout: _qdotFalloutIn, inferStatus,
        }: InferRefInnerArgs & {expr: TypeOfExpression}): MrNarrowTypesInnerReturn {
            const mntr = mrNarrowTypes({ sci:{ symtab:refTypesSymtabIn,constraintItem:constraintItemIn }, expr:expr.expression, qdotfallout: undefined, inferStatus, crit:{ kind:InferCritKind.none } });

            if (true || inferStatus.inCondition){
                let symbolAttribsOut: SymbolWithAttributes | undefined;
                const typeofArgSymbol = getSymbolIfUnique(mntr.unmerged)?.symbol;
                if (inferStatus.inCondition) {
                    // if (typeofArgSymbol){
                    //     symbolAttribsOut = {
                    //         symbol: createTransientExpressionSymbol(expr, stringType, typeofArgSymbol),
                    //         isconst: true,
                    //     };
                    // };
                }

                const rhs = applyCritNoneUnion(mntr,inferStatus.groupNodeToTypeMap);
                if (!inferStatus.inCondition || !typeofArgSymbol){
                    const setOfTypeOfStrings = new Set<string>();
                    forEachRefTypesTypeType(rhs.type, t=>{
                        typeToTypeofStrings(t).forEach(str=>{
                            setOfTypeOfStrings.add(str);
                        });
                    });
                    const arrStringLiteralType: StringLiteralType[]=[];
                    setOfTypeOfStrings.forEach(str=>{
                        const typeofString = checker.getStringLiteralType(str);
                        if (extraAsserts) Debug.assert(typeofString.regularType===typeofString);
                        arrStringLiteralType.push(checker.getStringLiteralType(str));
                    });
                    return { unmerged: [{ ...rhs, type: createRefTypesType(arrStringLiteralType) }] };
                }
                else {

                    const arrStringLiteralType: StringLiteralType[]=[];
                    const mapTypeOfStringToTsTypeSet = new Map<LiteralType,Set<Type>>();
                    forEachRefTypesTypeType(rhs.type, t=>{
                        typeToTypeofStrings(t).forEach(str=>{
                            const typeofString = checker.getStringLiteralType(str);
                            arrStringLiteralType.push(typeofString);
                            const accumSet = mapTypeOfStringToTsTypeSet.get(typeofString);
                            if (!accumSet) mapTypeOfStringToTsTypeSet.set(typeofString, new Set<Type>([t]));
                            else accumSet.add(t);
                        });
                    });
                    const map = new Map<LiteralType,RefTypesType>();
                    const f = (set: Set<Type>): RefTypesType => {
                        const a: Type[] = [];
                        set.forEach(t=>a.push(t));
                        return createRefTypesType(a);
                    };
                    mapTypeOfStringToTsTypeSet.forEach((set,lit)=>map.set(lit,f(set)));
                    // mapTypeOfStringToTypes.forEach((setOfTypes,str)=>{
                    //     const typeofString = checker.getStringLiteralType(str);
                    //     if (extraAsserts) Debug.assert(typeofString.regularType===typeofString);
                    //     arrStringLiteralType.push(typeofString);
                    //     const arrTypes: Type[]=[];
                    //     setOfTypes.forEach(t=>arrTypes.push(t));
                    //     (symbolAttribsOut!.symbol as TransientExpressionSymbol).map.set(typeofString,createRefTypesType(arrTypes));
                    // });

                    const ret: MrNarrowTypesInnerReturn = {
                        unmerged: [{
                            ...rhs, ...symbolAttribsOut,
                            type: createRefTypesType(arrStringLiteralType)
                        }],
                        typeof: {
                            argSymbol: typeofArgSymbol,
                            map
                        }
                    };
                    return ret;
                }
            }
            // else {
            //     const typeofArgSymbol = getSymbolIfUnique(mntr.inferRefRtnType.unmerged)?.symbol;
            //     const symbolAttribsOut: SymbolWithAttributes = { symbol: createTransientExpressionSymbol(expr, stringType, typeofArgSymbol? { typeofArgSymbol } : undefined), isconst: true };
            //     if (typeofArgSymbol){
            //         // symbolAttribsOut.symbol.weakM
            //     }

            //     const arrRefTypesTableReturn: RefTypesTableReturn[] = [];
            //     mntr.inferRefRtnType.unmerged.forEach(rttr=>{
            //         const rttrSymbolAttrib = rttr.symbol ? { symbol: rttr.symbol, isconst: rttr.isconst, isAssign:rttr.isAssign } : undefined;
            //         rttr = applyCritNoneToOne(rttr, expr.expression, inferStatus.groupNodeToTypeMap); // writes nodeToToType map for typeof argument node.

            //         const mapTypeOfStringToTypes = new Map<string,Set<Type>>();
            //         forEachRefTypesTypeType(rttr.type, t=>{
            //             const arrTypeOfString = typeToTypeofStrings(t);
            //             arrTypeOfString.forEach(typeOfString=>{
            //                 const got = mapTypeOfStringToTypes.get(typeOfString);
            //                 if (!got) mapTypeOfStringToTypes.set(typeOfString, new Set<Type>([t]));
            //                 else got.add(t);
            //             });
            //         });
            //         mapTypeOfStringToTypes.forEach((setOfTypes,typeOfString)=>{
            //             const arrTypes: Type[]=[];
            //             setOfTypes.forEach(t=>arrTypes.push(t));
            //             let type = createRefTypesType(arrTypes);
            //             let sci = rttr.sci;
            //             //
            //             if (rttrSymbolAttrib){
            //                 ({type,sc:sci} = andSymbolTypeIntoSymtabConstraint({ ...rttrSymbolAttrib, type, sc:rttr.sci, getDeclaredType, mrNarrow }));
            //             }
            //             const typeofType = createRefTypesType(checker.getStringLiteralType(typeOfString));

            //             arrRefTypesTableReturn.push({
            //                 kind: RefTypesTableKind.return,
            //                 ...symbolAttribsOut,
            //                 type: typeofType,
            //                 sci,
            //             });
            //         });
            //     });
            //     return { arrRefTypesTableReturn };
            // }
        }

        function mrNarrowTypesByBinaryExpressionEqualsHelper({
            asym, partitionedType, passType, rttrRight, inferStatus: _inferStatus}:
            Readonly<{
                asym: {symbol: Symbol, declared: RefTypesType}[], partitionedType: RefTypesType, passType: RefTypesType,
                rttrRight: RefTypesTableReturn, inferStatus: InferStatus
            }
            >): RefTypesTableReturnNoSymbol {
            if (getMyDebug()){
                consoleGroup(`mrNarrowTypesByBinaryExpressionEqualsHelper [in]`);
                asym.forEach(({symbol},i)=>consoleLog(
                    `mrNarrowTypesByBinaryExpressionEqualsHelper [in] asym[${i}] {symbol:${dbgSymbolToStringSimple(symbol)}, `));
                asym.forEach((x,i)=>{
                    const str = dbgRefTypesTableLeafToString(x.symbol, x.declared);
                    consoleLog(`mrNarrowTypesByBinaryExpressionEqualsHelper [in] asym[${i}] declared: ${str}`);
                });
                consoleLog(`mrNarrowTypesByBinaryExpressionEqualsHelper [in] partitionedType: ${dbgRefTypesTypeToString(partitionedType)}`);
                consoleLog(`mrNarrowTypesByBinaryExpressionEqualsHelper [in] passType: ${dbgRefTypesTypeToString(passType)}`);
                dbgRefTypesTableToStrings(rttrRight).forEach(s=>consoleLog(`mrNarrowTypesByBinaryExpressionEqualsHelper [in] rttrRight: ${s}`));
            }
            const arrSC0: RefTypesSymtabConstraintItem[] = [];
            forEachRefTypesTypeType(partitionedType,tstype=>{
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                let sc: RefTypesSymtabConstraintItem = { symtab: rttrRight.sci.symtab, constraintItem: rttrRight.sci.constraintItem };
                /* @ts-ignore */
                let _type: RefTypesType;
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let i=0; i<asym.length; i++){
                    //const symbolFlowInfo = _mrState.symbolFlowInfoMap.get(asym[i].symbol);
                    ({type:_type, sc} = andSymbolTypeIntoSymtabConstraint({
                        symbol: asym[i].symbol,
                        isconst: _mrState.symbolFlowInfoMap.get(asym[i].symbol)!.isconst,
                        type: createRefTypesType(tstype),
                        sc,
                        getDeclaredType,
                        mrNarrow,
                    }));
                }
                arrSC0.push(sc);
            });
            const scout = orSymtabConstraints(arrSC0, mrNarrow);
            const rttr: RefTypesTableReturnNoSymbol = {
                kind: RefTypesTableKind.return,
                type: passType,
                sci: {
                    symtab: scout.symtab,
                    constraintItem: scout.constraintItem
                }
            };
            if (getMyDebug()){
                dbgRefTypesTableToStrings(rttr).forEach(s=>{
                    consoleLog(`mrNarrowTypesByBinaryExpressionEqualsHelper [out] rttr: ${s}`);
                });
                consoleGroupEnd();
            }
            return rttr;
        }

        function mrNarrowTypesByBinaryExpressionEqualsEquals({
            sci:{symtab:refTypesSymtabIn,constraintItem:constraintItemIn}, expr:binaryExpression, /* qdotfallout: _qdotFalloutIn, */ inferStatus,
        }: InferRefInnerArgs & {expr: BinaryExpression}): MrNarrowTypesInnerReturn {
            if (getMyDebug()){
                consoleGroup(`mrNarrowTypesByBinaryExpressionEqualsEquals[in] ${dbgNodeToString(binaryExpression)}`);
            }
            let ret: MrNarrowTypesInnerReturn;
            if (true){
                ret = mrNarrowTypesByBinaryExpressionEqualCompare({
                    sci: { symtab:refTypesSymtabIn, constraintItem:constraintItemIn }, expr:binaryExpression, inferStatus
                });
            }
            else {
                ret = mrNarrowTypesByBinaryExpressionEquals_aux({
                    sci:{ symtab:refTypesSymtabIn,constraintItem:constraintItemIn }, expr:binaryExpression, inferStatus, qdotfallout:[] });
            }
            if (getMyDebug()){
                consoleLog(`mrNarrowTypesByBinaryExpressionEqualsEquals[out] ${dbgNodeToString(binaryExpression)}`);
                consoleGroupEnd();
            }
            return ret;
        }

        // @ ts-expect-error
        function mrNarrowTypesByBinaryExpressionEqualCompare({
            expr:binaryExpression, sci:sciIn, inferStatus,
        }: {expr: BinaryExpression, sci: RefTypesSymtabConstraintItem, inferStatus: InferStatus }): MrNarrowTypesInnerReturn {
            const {left:leftExpr,operatorToken,right:rightExpr} = binaryExpression;
            if (getMyDebug()) {
                consoleGroup(`mrNarrowTypesByBinaryExpressionEqualCompare[in] expr:${dbgNodeToString(binaryExpression)}`);
            }
            if (![
                SyntaxKind.EqualsEqualsEqualsToken,
                SyntaxKind.EqualsEqualsToken,
                SyntaxKind.ExclamationEqualsEqualsToken,
                SyntaxKind.ExclamationEqualsToken].includes(operatorToken.kind)){
                Debug.fail("unexpected");
            }
            const negateEq = [
                SyntaxKind.ExclamationEqualsEqualsToken,
                SyntaxKind.ExclamationEqualsToken].includes(operatorToken.kind);
            const nomativeTrueType = createRefTypesType(negateEq ? falseType : trueType);
            const nomativeFalseType = createRefTypesType(negateEq ? trueType : falseType);
            const trueAndFalseType = createRefTypesType([trueType,falseType]);

            const leftMntr = mrNarrowTypes({
                expr:leftExpr, crit:{ kind:InferCritKind.none }, qdotfallout: undefined, inferStatus/*:{ ...inferStatus, inCondition:false }*/,
                sci: sciIn
            });

            //const leftSymbol = getSymbolIfUnique(leftMntr.inferRefRtnType.unmerged);
            //const arrLeftRttr = leftMntr.inferRefRtnType.unmerged.map(rttr=>applyCritNoneToOne(rttr,leftExpr,inferStatus.groupNodeToTypeMap));
            const leftRttrUnion = applyCritNoneUnion(leftMntr,inferStatus.groupNodeToTypeMap);

            const rightMntr = mrNarrowTypes({
                expr:rightExpr, crit:{ kind:InferCritKind.none }, qdotfallout: undefined, inferStatus/*:{ ...inferStatus, inCondition:false }*/,
                sci: leftRttrUnion.sci
            });
            //const rightSymbol = getSymbolIfUnique(rightMntr.inferRefRtnType.unmerged);
            //const arrRightRttr = rightMntr.inferRefRtnType.unmerged.map(rttr=>applyCritNoneToOne(rttr,rightExpr,inferStatus.groupNodeToTypeMap));
            //applyCritNoneUnion(rightMntr,inferStatus.groupNodeToTypeMap);

            const arrRefTypesTableReturn: RefTypesTableReturn[] = [];
            // const createTypeFromTsTypeSet = (tsTypeSet: Readonly<Set<Type>>): RefTypesType => {
            //     if (tsTypeSet.size===1) return createRefTypesType(tsTypeSet.values().next().value!);
            //     const a: Type[] = [];
            //     tsTypeSet.forEach(t=>a.push(t));
            //     return createRefTypesType(a);
            // };
            leftMntr.unmerged.forEach(leftRttr0=>{
                const leftRttr = applyCritNoneToOne(leftRttr0,leftExpr,inferStatus.groupNodeToTypeMap);
                rightMntr.unmerged.forEach(rightRttr0=>{
                    const rightRttr = applyCritNoneToOne(rightRttr0,rightExpr,inferStatus.groupNodeToTypeMap);
                    if (getMyDebug()){
                        consoleLog(`mrNarrowTypesByBinaryExpressionEqualCompare[dbg] leftRttr.type:${dbgRefTypesTypeToString(leftRttr.type)}, rightRttr.type:${dbgRefTypesTypeToString(rightRttr.type)}`);
                    }
                    const aeqcmp = mrNarrow.refTypesTypeModule.partitionForEqualityCompare(leftRttr.type,rightRttr.type);
                    aeqcmp.forEach((ec,_i)=>{
                        const {leftts,rightts,bothts,true:pass,false:fail} = ec;
                        let left: RefTypesType | undefined;
                        let right: RefTypesType | undefined;
                        if (getMyDebug()) {
                            const left = bothts ? createRefTypesType(bothts) : (Debug.assert(leftts), createRefTypesType(leftts));
                            const right = bothts ? createRefTypesType(bothts) : (Debug.assert(rightts), createRefTypesType(rightts));
                            consoleLog(`mrNarrowTypesByBinaryExpressionEqualCompare[dbg] -- before`
                            +`[${_i}][0] left:${dbgRefTypesTypeToString(left)}, right:${dbgRefTypesTypeToString(right)}, pass:${pass},fail:${fail}`);
                        }

                        let sctmp = rightRttr.sci;
                        const tftype = pass ? (fail ? trueAndFalseType : nomativeTrueType) : nomativeFalseType;
                        if (leftRttr0.symbol){
                            left = bothts ? createRefTypesType(bothts) : (Debug.assert(leftts), createRefTypesType(leftts));
                            ({type:left, sc:sctmp } = andSymbolTypeIntoSymtabConstraint({
                                symbol:leftRttr0.symbol,
                                isconst:leftRttr0.isconst,
                                // isAssign: leftRttr0.isAssign, // pure narrowing here so do not set isAssign
                                type: left,
                                sc:sctmp,
                                getDeclaredType,
                                mrNarrow
                            }));
                        }
                        if (leftMntr.typeof){
                            const leftTypeOfArgSymbol = leftMntr.typeof.argSymbol;
                            const typeofArgSubType = bothts ? leftMntr.typeof.map.get(bothts)! : unionOfRefTypesType(leftts!.map(tstype=>leftMntr.typeof!.map.get(tstype)!));
                            ({sc:sctmp } = andSymbolTypeIntoSymtabConstraint({
                                symbol:leftTypeOfArgSymbol,
                                isconst:_mrState.symbolFlowInfoMap.get(leftTypeOfArgSymbol)!.isconst,
                                // isAssign: leftRttr0.isAssign,
                                type: typeofArgSubType,
                                sc:sctmp,
                                getDeclaredType,
                                mrNarrow
                            }));
                        }

                        if (rightRttr0.symbol){
                            right = bothts ? createRefTypesType(bothts) : (Debug.assert(rightts), createRefTypesType(rightts));
                            ({type:right, sc:sctmp } = andSymbolTypeIntoSymtabConstraint({
                                symbol:rightRttr0.symbol,
                                isconst:rightRttr0.isconst,
                                // isAssign: rightRttr0.isAssign,
                                type: right,
                                sc:sctmp,
                                getDeclaredType,
                                mrNarrow
                            }));
                        }
                        if (rightMntr.typeof){
                            const rightTypeOfArgSymbol = rightMntr.typeof.argSymbol;
                            const typeofArgSubType = bothts ? rightMntr.typeof.map.get(bothts)! : unionOfRefTypesType(rightts!.map(tstype=>rightMntr.typeof!.map.get(tstype)!));
                            ({sc:sctmp } = andSymbolTypeIntoSymtabConstraint({
                                symbol:rightTypeOfArgSymbol,
                                isconst:_mrState.symbolFlowInfoMap.get(rightTypeOfArgSymbol)!.isconst,
                                // isAssign: rightRttr0.isAssign,
                                type: typeofArgSubType,
                                sc:sctmp,
                                getDeclaredType,
                                mrNarrow
                            }));
                        }
                        if (getMyDebug()) {
                            const leftx = left ?? bothts ? createRefTypesType(bothts) : (Debug.assert(leftts), createRefTypesType(leftts));
                            const rightx = right ?? bothts ? createRefTypesType(bothts) : (Debug.assert(rightts), createRefTypesType(rightts));
                            consoleLog(`mrNarrowTypesByBinaryExpressionEqualCompare[dbg] `
                            +`[${_i}][0] left:${dbgRefTypesTypeToString(leftx)}, right:${dbgRefTypesTypeToString(rightx)}, pass:${pass},fail:${fail}`);
                        }
                        arrRefTypesTableReturn.push({
                            kind: RefTypesTableKind.return,
                            type: tftype,
                            sci:sctmp
                        });
                    });
                });
            });
            return { unmerged: arrRefTypesTableReturn };
        }

        // @ ts-expect-error
        function mrNarrowTypesByBinaryExpressionEquals_aux({
            sci:{symtab:refTypesSymtabIn,constraintItem:constraintItemIn}, expr:binaryExpression, /* qdotfallout: _qdotFalloutIn, */ inferStatus,
        }: InferRefInnerArgs & {expr: BinaryExpression}): MrNarrowTypesInnerReturn {

            const {left:leftExpr,operatorToken,right:rightExpr} = binaryExpression;
            if (![
                SyntaxKind.EqualsEqualsEqualsToken,
                SyntaxKind.EqualsEqualsToken,
                SyntaxKind.ExclamationEqualsEqualsToken,
                SyntaxKind.ExclamationEqualsToken].includes(operatorToken.kind)){
                Debug.fail("unexpected");
            }
            const negateEq = [
                SyntaxKind.ExclamationEqualsEqualsToken,
                SyntaxKind.ExclamationEqualsToken].includes(operatorToken.kind);
            const nomativeTrueType = negateEq ? falseType : trueType;
            const nomativeFalseType = negateEq ? trueType : falseType;

            if (getMyDebug()){
                consoleLog(`mrNarrowTypesByBinaryExpressionEqualsEquals[dbg] start left mrNarrowTypes`);
            }
            const leftRet = mrNarrowTypes({
                expr:leftExpr, crit:{ kind:InferCritKind.none }, qdotfallout: undefined, inferStatus:{ ...inferStatus, inCondition:true },
                sci: {
                    symtab:refTypesSymtabIn,
                    constraintItem: constraintItemIn
                }
            });
            if (getMyDebug()){
                consoleLog(`mrNarrowTypesByBinaryExpressionEqualsEquals[dbg] end left mrNarrowTypes`);
            }
            const arrRefTypesTableReturn: RefTypesTableReturnNoSymbol[] = [];
            leftRet.unmerged?.forEach((rttrLeftTmp, _leftIdx)=>{
                const { symbol:rttrLeftSymbol, isconst:rttrLeftIsConst } = rttrLeftTmp;
                const rttrLeft = applyCritNone1Union([rttrLeftTmp],leftExpr,inferStatus.groupNodeToTypeMap);
                //let tmpSymtabConstraintLeft: RefTypesSymtabConstraintItem = { symtab:rttrLeft.sci.symtab,constraintItem:rttrLeft.sci.constraintItem };
                // May not need this? - Needed for compilerOptions.mrNarrowConstraintsEnable===false

                // if (rttrLeft.symbol){
                //     tmpSymtabConstraintLeft = andRttrSymbolTypeIntoSymtabConstraint(rttrLeft, inferStatus).sci;
                // }
                if (getMyDebug()){
                    consoleLog(`mrNarrowTypesByBinaryExpressionEqualsEquals[dbg] start right mrNarrowTypes for left#${_leftIdx} `);
                }
                 const rhs1 = mrNarrowTypes({
                    expr:rightExpr, crit:{ kind:InferCritKind.none }, qdotfallout: undefined, inferStatus:{ ...inferStatus, inCondition:true },
                    sci: rttrLeft.sci,
                });
                if (getMyDebug()){
                    consoleLog(`mrNarrowTypesByBinaryExpressionEqualsEquals[dbg] end right mrNarrowTypes for left#${_leftIdx} `);
                }
                rhs1.unmerged?.forEach((rttrRightTmp, _rightIdx)=>{
                    const { symbol:rttrRightSymbol, isconst:rttrRightIsConst } = rttrRightTmp;
                    const rttrRight = applyCritNone1Union([rttrRightTmp],rightExpr,inferStatus.groupNodeToTypeMap);
                    const isect = intersectionOfRefTypesType(rttrLeft.type, rttrRight.type);
                    if (getMyDebug()){
                        consoleLog(`mrNarrowTypesByBinaryExpressionEqualsEquals[dbg] left#${_leftIdx}, right#${_rightIdx}, `
                        +`rttrLeft.type:${dbgRefTypesTypeToString(rttrLeft.type)}, `
                        +`rttrRight.type:${dbgRefTypesTypeToString(rttrRight.type)}, `);
                        consoleLog(`mrNarrowTypesByBinaryExpressionEqualsEquals[dbg] left#${_leftIdx}, right#${_rightIdx}, `
                        +`isect:${dbgRefTypesTypeToString(isect)} `);
                    }
                    const {singular,singularCount,nonSingular,nonSingularCount} = partitionIntoSingularAndNonSingularTypes(isect);
                    if (getMyDebug()){
                        consoleLog(`mrNarrowTypesByBinaryExpressionEqualsEquals[dbg] left#${_leftIdx}, right#${_rightIdx}, `
                        +`singular:${dbgRefTypesTypeToString(singular)}, singularCount:${singularCount}`);
                        consoleLog(`mrNarrowTypesByBinaryExpressionEqualsEquals[dbg] left#${_leftIdx}, right#${_rightIdx}, `
                        +`nonSingular:${dbgRefTypesTypeToString(nonSingular)}, nonSingularCount:${nonSingularCount}`);
                        // consoleLog(`mrNarrowTypesByBinaryExpressionEquals[dbg] left#${_leftIdx}, right#${_rightIdx}, `
                        // +`mismatchLeft:${dbgRefTypesTypeToString(mismatchLeft)}`);
                        // consoleLog(`mrNarrowTypesByBinaryExpressionEquals[dbg] left#${_leftIdx}, right#${_rightIdx}, `
                        // +`mismatchRight:${dbgRefTypesTypeToString(mismatchRight)}`);
                    }

                    const asym: {symbol: Symbol,declared: RefTypesType}[] = [];
                    if (rttrLeftSymbol /* && rttrLeft.isconst && compilerOptions.mrNarrowConstraintsEnable */) {
                        // TODO: should be getEffectiveDeclaredType ?
                        asym.push({ symbol:rttrLeftSymbol, declared: getSymbolFlowInfoInitializerOrDeclaredType(rttrLeftSymbol)! });
                    }
                    if (rttrRightSymbol /* && rttrRight.isconst && compilerOptions.mrNarrowConstraintsEnable */) {
                        // TODO: should be getEffectiveDeclaredType ?
                        asym.push({ symbol:rttrRightSymbol, declared: getSymbolFlowInfoInitializerOrDeclaredType(rttrRightSymbol)! });
                    }
                    if (singularCount){
                        const passRttr = mrNarrowTypesByBinaryExpressionEqualsHelper(
                            { asym, partitionedType: singular, passType: createRefTypesType(nomativeTrueType), rttrRight, inferStatus });
                        arrRefTypesTableReturn.push(passRttr);
                    }
                    if (nonSingularCount){
                        const passRttr = mrNarrowTypesByBinaryExpressionEqualsHelper(
                            { asym, partitionedType: nonSingular, passType: createRefTypesType([trueType,falseType]), rttrRight, inferStatus });
                        arrRefTypesTableReturn.push(passRttr);
                    }

                    /////////////////////////////////////////////////////////////////////////////////////////////////////
                    /////////////////////////////////////////////////////////////////////////////////////////////////////
                    /////////////////////////////////////////////////////////////////////////////////////////////////////
                    // new code for mistaches fix, don't delete
                    if (true){
                    /**
                     * If the complexity is limited, the mismatches can be fully computed.
                     * The total explicit mismatch count would be leftCount*rightCount-(singularCount+nonSingularCount),
                     * which could be too much.
                     * If (singularCount+nonSingularCount)===1, the matched type must be removed from a copy of rttrRight.type,
                     * and symtab modifed regardless of isconst.
                     * Otherwise, do the correlations.
                     */

                        const leftCount = getTypeMemberCount(rttrLeft.type);
                        const rightCount = getTypeMemberCount(rttrRight.type);
                        if ((singularCount+nonSingularCount)===0){
                            // no overlap at all => always false
                            arrRefTypesTableReturn.push({
                                kind:RefTypesTableKind.return,
                                type: createRefTypesType(nomativeFalseType),
                                sci: {
                                    symtab: rttrRight.sci.symtab,
                                    constraintItem: rttrRight.sci.constraintItem
                                }
                            });
                        }
                        else if ((singularCount+nonSingularCount)===1){
                            // overlap type removed completely from both sides  => always false
                            let scTmp: RefTypesSymtabConstraintItem = { symtab: rttrRight.sci.symtab, constraintItem: rttrRight.sci.constraintItem };
                            let scLeftTmp: RefTypesSymtabConstraintItem | undefined;
                            let scRightTmp: RefTypesSymtabConstraintItem | undefined;
                            // @ts-ignore
                            let _unusedType: RefTypesType;
                            const mismatchLeft = subtractFromType(isect,rttrLeft.type);
                            const mismatchRight = subtractFromType(isect,rttrRight.type);
                            const hasSomeMismatch = (!isNeverType(mismatchLeft)||!isNeverType(mismatchRight));
                            if (rttrLeftSymbol){
                                ({type:_unusedType, sc:scLeftTmp } = andSymbolTypeIntoSymtabConstraint({
                                    symbol:rttrLeftSymbol, isconst: rttrLeftIsConst, type: mismatchLeft,
                                    sc: scTmp,
                                    getDeclaredType,
                                    mrNarrow}));
                            }
                            if (rttrRightSymbol){
                                ({type:_unusedType, sc:scRightTmp } = andSymbolTypeIntoSymtabConstraint({
                                    symbol:rttrRightSymbol, isconst: rttrRightIsConst, type: mismatchRight,
                                    sc: scTmp,
                                    getDeclaredType,
                                    mrNarrow}));
                            }
                            if (scLeftTmp && scRightTmp){
                                scTmp = orSymtabConstraints([scLeftTmp, scRightTmp], mrNarrow);
                            }
                            else if (scLeftTmp) scTmp = scLeftTmp;
                            else if (scRightTmp) scTmp = scRightTmp;
                            if (hasSomeMismatch){
                                arrRefTypesTableReturn.push({
                                    kind:RefTypesTableKind.return,
                                    type: createRefTypesType(nomativeFalseType),
                                    sci: scTmp,
                                });
                            }
                        }
                        else {
                            // @ts-expect-error
                            const mismatchExplicitCount = leftCount*rightCount-(singularCount+nonSingularCount);

                            // eslint-disable-next-line prefer-const
                            let doExplicit = compilerOptions.mrNarrowConstraintsEnable;
                            // if (mismatchExplicitCount<=4) doExplicit = true;
                            // else if (leftCount===1 || rightCount===1) doExplicit = true;
                            // else if (mismatchExplicitCount<=(singularCount+nonSingularCount)*2) doExplicit = true;
                            if (!doExplicit) {
                                arrRefTypesTableReturn.push({
                                    kind:RefTypesTableKind.return,
                                    type: createRefTypesType(nomativeFalseType),
                                    sci: rttrRight.sci
                                });
                            }
                            else {
                                let scTmp = rttrRight.sci;
                                let scLeftTmp: RefTypesSymtabConstraintItem | undefined;
                                let scRightTmp: RefTypesSymtabConstraintItem | undefined;
                                    // @ts-ignore
                                let _unusedType: RefTypesType;
                                let hasSomeMismatch = false;
                                forEachRefTypesTypeType(isect, isectTsType=>{
                                    const isectType = createRefTypesType(isectTsType);
                                    const mismatchLeft = subtractFromType(isectType,rttrLeft.type);
                                    const mismatchRight = subtractFromType(isectType,rttrRight.type);
                                    if (!isNeverType(mismatchLeft)||!isNeverType(mismatchRight)) hasSomeMismatch = true;

                                    // And(Or(mismatchLeft,mismatchRight)
                                    if (rttrLeftSymbol){
                                        ({type:_unusedType, sc:scLeftTmp } = andSymbolTypeIntoSymtabConstraint({
                                            symbol:rttrLeftSymbol, isconst: rttrLeftIsConst,
                                            type:mismatchLeft,
                                            sc: scTmp,
                                            getDeclaredType,
                                            mrNarrow}));
                                    }
                                    if (rttrRightSymbol){
                                        ({type:_unusedType, sc:scRightTmp } = andSymbolTypeIntoSymtabConstraint({
                                            symbol:rttrRightSymbol, isconst: rttrRightIsConst,
                                            type: mismatchRight,
                                            sc: scTmp,
                                            getDeclaredType,
                                            mrNarrow}));
                                    }
                                    if (scLeftTmp && scRightTmp){
                                        scTmp = orSymtabConstraints([scLeftTmp, scRightTmp], mrNarrow);
                                    }
                                    else if (scLeftTmp) scTmp = scLeftTmp;
                                    else if (scRightTmp) scTmp = scRightTmp;
                                });
                                if (hasSomeMismatch){
                                    arrRefTypesTableReturn.push({
                                        kind:RefTypesTableKind.return,
                                        type: createRefTypesType(nomativeFalseType),
                                        sci: scTmp,
                                    });
                                }
                            }
                        }
                    }
                    /////////////////////////////////////////////////////////////////////////////////////////////////////
                    /////////////////////////////////////////////////////////////////////////////////////////////////////
                    /////////////////////////////////////////////////////////////////////////////////////////////////////

                }); // rhs1.inferRefRtnType.unmerged?.forEach((rttrRight, _rightIdx)=>
            }); // leftRet.inferRefRtnType.unmerged?.forEach((rttrLeft, _leftIdx)=>{
            return {
                unmerged: arrRefTypesTableReturn
            };
        }

        // function maybeUnionOfTypeOverLoop(symbol: Symbol, isconst: boolean, type: RefTypesType, node: Node, sc: RefTypesSymtabConstraintItem, inferStatus: InferStatus, _dgbString: string):
        // { type: RefTypesType, sc: RefTypesSymtabConstraintItem } {
        //     if (inferStatus.accumNodeTypes && !inferStatus.currentReplayableItem){
        //         Debug.fail("unexpected");
        //         const cumTsType = inferStatus.groupNodeToTypeMap.get(node);
        //         if (cumTsType && checker.getNeverType()!==cumTsType){
        //             type = unionOfRefTypesType([type, createRefTypesType(cumTsType)]);
        //             const getDeclaredType = createGetDeclaredTypeFn(inferStatus);
        //             const {type:typeOut, sc:scOut} = orSymbolTypeIntoSymtabConstraint({ symbol,isconst,type,sc, getDeclaredType, mrNarrow });
        //             return {
        //                 type: typeOut,
        //                 sc: scOut
        //             };
        //         }
        //     }
        //     return { type, sc };
        // }

        function debugDevExpectEffectiveDeclaredType(node: Node, symbolFlowInfo: Readonly<SymbolFlowInfo>): void {
            const arrexpected = getDevExpectStrings(node,sourceFile);
            if (arrexpected) {
                // const actual = `count: ${symbolFlowInfo.passCount}, actualDeclaredTsType: ${typeToString(symbolFlowInfo.effectiveDeclaredTsType)}`;
                const actual = `count: ${symbolFlowInfo.passCount}, effectiveDeclaredTsType: ${typeToString(symbolFlowInfo.effectiveDeclaredTsType)}`;
                const pass = arrexpected.some(expected=>{
                    return actual===expected;
                });
                if (!pass) {
                    Debug.fail(`ts-dev-expect-string: no match for actual: "${actual}"`);
                }
                if (getMyDebug()){
                    consoleLog(`SyntaxKind.VariableDeclaration, passed ts-dev-expect-string "${actual}"`);
                }
            }
        }




        function mrNarrowTypesByBinaryExpresionAssign(args: InferRefInnerArgs): MrNarrowTypesInnerReturn {
            const {left:leftExpr,right:rightExpr} = args.expr as BinaryExpression;
            const {sci:{symtab:refTypesSymtab,constraintItem}} = args;

            const rhs = mrNarrowTypes({
                sci: { symtab:refTypesSymtab, constraintItem },
                crit: { kind:InferCritKind.none },
                expr: rightExpr,
                inferStatus: args.inferStatus,
            });
            const passing = applyCritNoneUnion(rhs,args.inferStatus.groupNodeToTypeMap);
            if (leftExpr.kind===SyntaxKind.Identifier) {
                assertCastType<Identifier>(leftExpr);
                const symbol = getResolvedSymbol(leftExpr);
                let symbolFlowInfo: SymbolFlowInfo | undefined = _mrState.symbolFlowInfoMap.get(symbol);
                if (!symbolFlowInfo){
                    // this must correspond to a declaration without an initializer, or a variable with no type spec at all (default: any).
                    let typeNodeTsType: Type;
                    if ((symbol.valueDeclaration as VariableDeclaration).type){
                        typeNodeTsType = checker.getTypeFromTypeNode((symbol.valueDeclaration as VariableDeclaration).type!);
                    }
                    else {
                        typeNodeTsType = anyType;
                    }
                    const effectiveDeclaredTsType = typeNodeTsType;
                    symbolFlowInfo = {
                        passCount: 0,
                        initializedInAssignment: true,
                        isconst: checker.isConstantReference(leftExpr),
                        effectiveDeclaredTsType,
                        effectiveDeclaredType: createRefTypesType(effectiveDeclaredTsType),
                    };
                    if (typeNodeTsType) symbolFlowInfo.typeNodeTsType = typeNodeTsType;
                    _mrState.symbolFlowInfoMap.set(symbol,symbolFlowInfo);
                }
                else {
                    if (symbolFlowInfo.initializedInAssignment){
                        // then all assignments must contribute to the effectiveDeclaredType

                    }
                    if (extraAsserts && (symbol.valueDeclaration as VariableDeclaration).type){
                        Debug.assert(checker.getTypeFromTypeNode((symbol.valueDeclaration as VariableDeclaration).type!)===symbolFlowInfo.effectiveDeclaredTsType);
                    }
                }
                if (extraAsserts) {
                    debugDevExpectEffectiveDeclaredType(leftExpr.parent,symbolFlowInfo);
                }
                return { unmerged: [{
                    ...passing,
                    symbol, isAssign:true,
                }]};
            }
            else {
                Debug.fail("not yet implemented");
            }
        }


        function mrNarrowTypesByBinaryExpression({
            sci:{symtab:refTypesSymtabIn,constraintItem:constraintItemIn}, expr:binaryExpression, /* crit,*/ qdotfallout: _qdotFalloutIn, inferStatus,
        }: InferRefInnerArgs & {expr: BinaryExpression}): MrNarrowTypesInnerReturn {
            const {left:leftExpr,operatorToken,right:rightExpr} = binaryExpression;
            switch (operatorToken.kind) {
                case SyntaxKind.EqualsToken:
                    return mrNarrowTypesByBinaryExpresionAssign({ sci:{ symtab:refTypesSymtabIn,constraintItem:constraintItemIn }, expr:binaryExpression, /* crit,*/ qdotfallout: _qdotFalloutIn, inferStatus });
                case SyntaxKind.BarBarEqualsToken:
                case SyntaxKind.AmpersandAmpersandEqualsToken:
                case SyntaxKind.QuestionQuestionEqualsToken:
                    Debug.fail("not yet implemented");
                    break;
                case SyntaxKind.ExclamationEqualsToken:
                case SyntaxKind.ExclamationEqualsEqualsToken:
                case SyntaxKind.EqualsEqualsToken:
                case SyntaxKind.EqualsEqualsEqualsToken:{
                    return mrNarrowTypesByBinaryExpressionEqualsEquals(
                        { sci:{ symtab:refTypesSymtabIn,constraintItem:constraintItemIn }, expr:binaryExpression, inferStatus, qdotfallout:[] });
                }
                break;
                case SyntaxKind.InstanceOfKeyword:
                    Debug.fail("not yet implemented");
                    break;
                case SyntaxKind.InKeyword:
                    Debug.fail("not yet implemented");
                    break;
                case SyntaxKind.CommaToken:
                    Debug.fail("not yet implemented");
                    break;
                case SyntaxKind.BarBarToken:
                case SyntaxKind.AmpersandAmpersandToken:{
                    if (getMyDebug()) consoleLog(`case SyntaxKind.(AmpersandAmpersand|BarBar)Token START`);
                    //const {left:leftExpr,right:rightExpr}=binaryExpression;
                    if (getMyDebug()) consoleLog(`case SyntaxKind.(AmpersandAmpersand|BarBar)Token left`);
                    const sciIn = { symtab: refTypesSymtabIn, constraintItem: constraintItemIn };
                    const leftRet0 = mrNarrowTypes({
                        sci: sciIn,
                        crit: { kind:InferCritKind.truthy, alsoFailing:true },
                        expr: leftExpr,
                        inferStatus,
                    });
                    const leftRet = applyCrit(leftRet0,{ kind:InferCritKind.truthy, alsoFailing:true }, inferStatus.groupNodeToTypeMap);


                    const arrRefTypesTableReturn: RefTypesTableReturn[]=[];

                    if (operatorToken.kind===SyntaxKind.AmpersandAmpersandToken){
                        arrRefTypesTableReturn.push(leftRet.failing!);

                        if (getMyDebug()) consoleLog(`case SyntaxKind.AmpersandAmpersandToken right (for left passing)`);
                        const leftTrueRightRet0 = mrNarrowTypes({
                            sci: leftRet.passing.sci,// leftRet.inferRefRtnType.passing.sci,
                            crit: { kind:InferCritKind.truthy, alsoFailing:true },
                            expr: rightExpr,
                            inferStatus,
                        });
                        if (!inferStatus.inCondition){
                            const leftTrueRightRet = applyCrit(leftTrueRightRet0,{ kind:InferCritKind.truthy, alsoFailing:true }, inferStatus.groupNodeToTypeMap);
                            arrRefTypesTableReturn.push(leftTrueRightRet.passing);
                            arrRefTypesTableReturn.push(leftTrueRightRet.failing!);
                        }
                        else {
                            leftTrueRightRet0.unmerged.forEach(rttr=>{
                                const {passing,failing} = applyCrit1ToOne(rttr,{ kind:InferCritKind.truthy, alsoFailing:true },rightExpr,inferStatus.groupNodeToTypeMap);
                                arrRefTypesTableReturn.push(passing);
                                arrRefTypesTableReturn.push(failing!);
                            });
                        }
                    }


                    if (operatorToken.kind===SyntaxKind.BarBarToken){
                        arrRefTypesTableReturn.push(leftRet.passing);

                        if (getMyDebug()) consoleLog(`case SyntaxKind.AmpersandAmpersandToken right (for left failing)`);
                        const leftFalseRightRet0 = mrNarrowTypes({
                            sci: leftRet.failing!.sci,
                            // refTypesSymtab: copyRefTypesSymtab(leftRet.inferRefRtnType.failing!.symtab),
                            crit: { kind:InferCritKind.truthy, alsoFailing:true },
                            expr: rightExpr,
                            inferStatus,
                            // constraintItem: leftRet.inferRefRtnType.failing!.constraintItem
                        });
                        if (!inferStatus.inCondition){
                            const leftFalseRightRet = applyCrit(leftFalseRightRet0,{ kind:InferCritKind.truthy, alsoFailing:true }, inferStatus.groupNodeToTypeMap);
                            arrRefTypesTableReturn.push(leftFalseRightRet.passing);
                            arrRefTypesTableReturn.push(leftFalseRightRet.failing!);
                        }
                        else {
                            leftFalseRightRet0.unmerged.forEach(rttr=>{
                                const {passing,failing} = applyCrit1ToOne(rttr,{ kind:InferCritKind.truthy, alsoFailing:true },rightExpr,inferStatus.groupNodeToTypeMap);
                                arrRefTypesTableReturn.push(passing);
                                arrRefTypesTableReturn.push(failing!);
                            });
                        }
                    }
                    return {
                        unmerged: arrRefTypesTableReturn,
                    };
                }
                    break;
                default:
                    Debug.fail("unexpected");

            }
        }

        // @ ts-expect-error
        function getSigParamType(sig: Readonly<Signature>, idx: number): { type: Type, isRest?: boolean, optional?: boolean, symbol: Symbol } {
            if (idx>=sig.parameters.length-1){
                if (signatureHasRestParameter(sig)){
                    const symbol = sig.parameters.slice(-1)[0];
                    const arrayType = getTypeOfSymbol(symbol);
                    Debug.assert(isArrayType(arrayType));
                    const type = getElementTypeOfArrayType(arrayType)!;
                    return { type, isRest:true, symbol };
                }
            }
            //if (idx>=sig.parameters.length)
            Debug.assert(idx<sig.parameters.length);
            const symbol = sig.parameters[idx];
            const type = getTypeOfSymbol(symbol);
            // determining optional is hard! signatureToString seems to call this line several layers beneath the surface:
            // const isOptional = parameterDeclaration && isOptionalParameter(parameterDeclaration) || getCheckFlags(parameterSymbol) & CheckFlags.OptionalParameter;
            // c.f. checker.ts, function isOptionalParameter(node: ParameterDeclaration | JSDocParameterTag | JSDocPropertyTag) {...}

            let optional = !!(symbol.flags & SymbolFlags.Optional);
            if (!optional) {
                optional = !!(getCheckFlags(symbol) & CheckFlags.OptionalParameter);
            }
            if (!optional && symbol.valueDeclaration){
                Debug.assert(symbol.valueDeclaration.kind===SyntaxKind.Parameter);
                optional = checker.isOptionalParameter(symbol.valueDeclaration as ParameterDeclaration);
            }
            return { type, optional, symbol };
        }
        // @ ts-expect-error
        function isValidSigParamIndex(sig: Readonly<Signature>, idx: number): boolean {
            return signatureHasRestParameter(sig) || idx<sig.parameters.length;
        }


        type TransientCallArgumentSymbol = Symbol & {
            //callExpresionResolvedArg: CallExpressionResolvedArg;
            cargidx: number;
            tupleMember?: {
                indexInTuple: number;
            };
        };
        type CallArgumentSymbol = TransientCallArgumentSymbol | Symbol;
        type CallExpressionResolvedArg = & {
            symbol: CallArgumentSymbol;
            isconst: boolean;
            type: RefTypesType;
            tstype: Type;
            hasSpread?: boolean; // last arg might have it
        };
        /**
         * Process the arguments of a CallExpression.
         * @param args
         */
        function mrNarrowTypesByCallExpressionProcessCallArguments(args: {
            callExpr: Readonly<CallExpression>,
            sc: RefTypesSymtabConstraintItem, inferStatus: InferStatus,
            setOfTransientCallArgumentSymbol: Set<TransientCallArgumentSymbol>
        }): {
            sc: RefTypesSymtabConstraintItem,
            resolvedCallArguments: CallExpressionResolvedArg[]
        }{
            const {callExpr,sc:scIn,inferStatus} = args;
            function createTransientCallArgumentSymbol(idx: number, cargidx: number,tupleMember: TransientCallArgumentSymbol["tupleMember"] | undefined, type: RefTypesType): TransientCallArgumentSymbol {
                let name = `idx:${idx},cargidx:${cargidx}`;
                if (tupleMember) name += `indexInTuple:${tupleMember.indexInTuple}`;
                const symbol: CallArgumentSymbol = { ... checker.createSymbol(0, name as __String), cargidx };
                _mrState.symbolFlowInfoMap.set(symbol,{
                    effectiveDeclaredTsType:getTypeFromRefTypesType(type),
                    isconst: true,
                    passCount: 0,
                });
                args.setOfTransientCallArgumentSymbol.add(symbol);
                return symbol;
            }

            const resolvedCallArguments: CallExpressionResolvedArg[] = [];
            let sctmp: RefTypesSymtabConstraintItem = scIn;
            callExpr.arguments.forEach((carg,cargidx)=>{
                if (carg.kind===SyntaxKind.SpreadElement){
                    const mntr = mrNarrowTypes({
                        sci:sctmp,
                        expr: (carg as SpreadElement).expression,
                        crit: {
                            kind: InferCritKind.none,
                        },
                        qdotfallout:undefined,
                        inferStatus,
                    });
                    const unmerged = mntr.unmerged;
                    let symbolOuter: Symbol | undefined;
                    let isconstOuter: boolean | undefined;
                    {
                        if (unmerged.length===1 || (unmerged.length && unmerged.slice(1).every(rttr=>rttr.symbol===unmerged[0].symbol))){
                            ({symbol:symbolOuter,isconst:isconstOuter} = unmerged[0]);
                        }
                    }
                    const rttr: RefTypesTableReturn = applyCritNoneUnion(mntr,inferStatus.groupNodeToTypeMap);

                    sctmp = rttr.sci; //{ symtab: rttr.symtab, constraintItem: rttr.constraintItem };
                    const tstype1 = getTypeFromRefTypesType(rttr.type);
                    if (checker.isArrayOrTupleType(tstype1)){
                        if (checker.isTupleType(tstype1)){
                            /**
                             * NOTE!: Calling andSymbolTypeIntoSymtabConstraint outside of applyCrit/applyCritNone.
                             */
                            // tstype1 is TypeReference
                            if (tstype1.objectFlags & ObjectFlags.Reference){
                                Debug.assert(tstype1.resolvedTypeArguments);
                                tstype1.resolvedTypeArguments?.forEach((tstype,indexInTuple)=>{
                                    const type = createRefTypesType(tstype);
                                    const symbol: CallArgumentSymbol = createTransientCallArgumentSymbol(cargidx,resolvedCallArguments.length,{ indexInTuple },type);
                                    const isconst = true;
                                    ({sc:sctmp}=andSymbolTypeIntoSymtabConstraint({ symbol,isconst,type,sc:sctmp,mrNarrow,getDeclaredType }));
                                    // sctmp.constraintItem = andSymbolTypeIntoConstraint({ symbol, type, constraintItem:sctmp.constraintItem, getDeclaredType, mrNarrow });
                                    resolvedCallArguments.push({ tstype,type,symbol,isconst });
                                });
                                const tupleSymbol = symbolOuter ?? createTransientCallArgumentSymbol(cargidx, resolvedCallArguments.length,/**/ undefined, rttr.type);
                                ({sc:sctmp}=andSymbolTypeIntoSymtabConstraint({ symbol:tupleSymbol, isconst:true, type:rttr.type,sc:sctmp,mrNarrow,getDeclaredType }));
                                //sctmp.constraintItem = andSymbolTypeIntoConstraint({ symbol:tupleSymbol, type:rttr.type, constraintItem:sctmp.constraintItem, getDeclaredType, mrNarrow });
                            }
                            else {
                                Debug.fail("unexpected");
                            }
                        }
                        else {
                            // should be array type, although that fact isn't used here
                            const type = rttr.type;
                            const tstype = getTypeFromRefTypesType(type);
                            let symbol = symbolOuter;
                            let isconst = isconstOuter;
                            if (!symbol) {
                                isconst = true;
                                symbol = createTransientCallArgumentSymbol(cargidx,resolvedCallArguments.length,/**/ undefined, type);
                            }
                            else Debug.assert(isconst!==undefined);
                            ({sc:sctmp}=andSymbolTypeIntoSymtabConstraint({ symbol,isconst,type,sc:sctmp,mrNarrow,getDeclaredType }));
                            resolvedCallArguments.push({ type,tstype,hasSpread:true, symbol, isconst });
                        }
                    }
                }
                else {
                    const mntr = mrNarrowTypes({
                        sci:sctmp,
                        expr: carg,
                        crit: {
                            kind: InferCritKind.none,
                        },
                        qdotfallout:undefined,
                        inferStatus,
                    });
                    const unmerged = mntr.unmerged;
                    let symbol: Symbol | undefined;
                    let isconst: boolean | undefined;
                    if (unmerged.length===1 || (unmerged.length && unmerged.slice(1).every(rttr=>rttr.symbol===unmerged[0].symbol))){
                        ({symbol,isconst} = unmerged[0]);
                    }
                    const rttr: RefTypesTableReturn = applyCritNoneUnion(mntr,inferStatus.groupNodeToTypeMap);
                    sctmp = rttr.sci;
                    const type = rttr.type;
                    const tstype = getTypeFromRefTypesType(type);
                    if (!symbol) {
                        isconst = true;
                        symbol = createTransientCallArgumentSymbol(cargidx,resolvedCallArguments.length,/**/ undefined, type);
                    }
                    else Debug.assert(isconst!==undefined);
                    ({sc:sctmp}=andSymbolTypeIntoSymtabConstraint({ symbol,isconst,type,sc:sctmp,mrNarrow,getDeclaredType }));
                    resolvedCallArguments.push({ type,tstype,symbol,isconst });
                }
            });
            if (getMyDebug()) {
                const hdr0 = "mrNarrowTypesByCallExpressionProcessCallArguments ";
                consoleLog(hdr0 + `resolvedCallArguments.length: ${resolvedCallArguments.length}`);
                resolvedCallArguments.forEach((ca,idx)=>{
                    let str = hdr0 + `arg[${idx}] tstype: ${typeToString(ca.tstype)}, symbol${dbgSymbolToStringSimple(ca.symbol)}, isconst:${ca.isconst}`;
                    if (ca.hasSpread) str +="hasSpread:true, ";
                    consoleLog(str);
                });
            }
            return { sc:sctmp, resolvedCallArguments };
        }

        function calculateNextLeftovers(leftoverMappings: Readonly<RefTypesType[]>, ci: ConstraintItem, arrSymbols: Readonly<CallArgumentSymbol[]>, getDeclaredType: GetDeclaredTypeFn):
        ConstraintItem | any {
            //const getDeclaredType = (symbol: Symbol) => argsSymbolTable.get(symbol)!;
            const ors: ConstraintItem[] = [];
            leftoverMappings.forEach((type,idx)=>{
                if (isNeverType(type)) return;
                ors.push(andSymbolTypeIntoConstraint({ symbol:arrSymbols[idx],type,constraintItem:ci,getDeclaredType,mrNarrow }));
            });
            const nextci = orConstraints(ors);
            const mapCover = evalCoverPerSymbol(nextci,getDeclaredType,mrNarrow);
            let hasNonNever=false;
            for (let iter = mapCover.values(), it=iter.next(); !it.done; it = iter.next()){
                if (!isNeverType(it.value)) {
                    hasNonNever=true;
                }
            }
            if (!hasNonNever) return createFlowConstraintNever();
            return nextci;
        }

        function mrNarrowTypesByCallExpression({sci:{symtab:symtabIn,constraintItem:constraintItemIn}, expr:callExpr, /* crit,*/ qdotfallout, inferStatus}: InferRefInnerArgs & {expr: CallExpression}): MrNarrowTypesInnerReturn {
            if (getMyDebug()){
                consoleGroup(`mrNarrowTypesByCallExpression[in]`);
            }
            Debug.assert(qdotfallout);
            // First duty is to call the pre-chain, if any.
            const pre = InferRefTypesPreAccess({ sci:{ symtab:symtabIn,constraintItem:constraintItemIn }, expr:callExpr, /*crit,*/ qdotfallout, inferStatus });
            if (pre.kind==="immediateReturn") return pre.retval;
            assertCastType<CallExpression>(callExpr);
            const arrRefTypesTableReturn: RefTypesTableReturnNoSymbol[]=[];
            let sigGroupFailedCount = 0;
            const setOfTransientCallArgumentSymbol = new Set<TransientCallArgumentSymbol>();
            pre.unmergedPassing.forEach((umrttr,rttridx)=>{
                /**
                 * In the case where multiple functions with the same name but different symbols are coincide on this CallExpression
                 * we have to disambiguate the constraints by and-not'ing with all other instances than the one of interest.
                 * .... What needs top be done is to ....
                 */
                const scIsolated: RefTypesSymtabConstraintItem = umrttr.sci; //{ symtab: umrttr.symtab, constraintItem: umrttr.constraintItem };
                pre.unmergedPassing.forEach((umrttr1,_rttridx1)=>{
                    if (!umrttr1.symbol || umrttr1.symbol===umrttr.symbol) return;
                    if (scIsolated.symtab) (scIsolated.symtab =  copyRefTypesSymtab(scIsolated.symtab)).delete(umrttr1.symbol);
                });
                if (getMyDebug()){
                    dbgRefTypesSymtabConstrinatItemToStrings(scIsolated).forEach(s=>consoleLog(`mrNarrowTypesByCallExpression rttridx:${rttridx}, scIsolated: ${s}`));
                }

                const {sc: scResolvedArgs, resolvedCallArguments} = mrNarrowTypesByCallExpressionProcessCallArguments({
                    callExpr, sc:{ symtab:scIsolated.symtab, constraintItem: scIsolated.constraintItem },inferStatus, setOfTransientCallArgumentSymbol });

                const tstype = getTypeFromRefTypesType(umrttr.type);
                const arrsig = checker.getSignaturesOfType(tstype, SignatureKind.Call);
                const arrsigrettype = arrsig.map((sig)=>checker.getReturnTypeOfSignature(sig));
                if (getMyDebug()){
                    arrsig.forEach((sig,sigidx)=>consoleLog(`mrNarrowTypesByCallExpression rttridx:${rttridx} sigidx:${sigidx} ${checker.signatureToString(sig)}`));
                }

                // const makeFakeSymbol = (id: number) => {
                //     return { id } as any as Symbol;
                // };
                // const argsSymbolTable = new Map<Symbol, RefTypesType>();
                // resolvedCallArguments.every((carg,cargidx)=>{
                //     argsSymbolTable.set(makeFakeSymbol(cargidx), carg.type);
                // });
                // let argsConstr: RefTypesSymtabConstraintItem  = { symtab:undefined as any as RefTypesSymtab, constraintItem:createFlowConstraintAlways() };
                // let nextArgsConstr = argsConstr;
                const allMappings: RefTypesType[][]=[];
                const allLeftoverMappings: RefTypesType[][]=[];
                const arrCargSymbols: CallArgumentSymbol[] = resolvedCallArguments.map(x=>x.symbol);
                // const cargsSymbolTable = new Map<FakeSymbol, RefTypesType>(resolvedCallArguments.map((carg,idx)=>{
                //     const fakeSymbol = { id:idx } as any as Symbol;
                //     arrCargSymbols.push(fakeSymbol);
                //     return [fakeSymbol, carg.type];
                // }));
                let finished = false;
                {
                    let cumLeftoverConstraintItem = createFlowConstraintAlways();
                    //let nextConstraint = scResolvedArgs.constraintItem;
                    let nextSC = scResolvedArgs;
                    finished = arrsig.some((sig,sigidx)=>{
                        const oneMapping: RefTypesType[]=[];
                        const oneLeftoverMapping: (RefTypesType)[]=[];
                        //let tmpArgsConstr = nextConstraint;
                        let tmpSC = nextSC;
                        if (getMyDebug()){
                            dbgRefTypesSymtabConstrinatItemToStrings(tmpSC).forEach(s=>consoleLog(`mrNarrowTypesByCallExpression rttridx:${rttridx} sigidx:${sigidx},tmpSC: ${s}`));
                            dbgConstraintItem(cumLeftoverConstraintItem).forEach(s=>consoleLog(`mrNarrowTypesByCallExpression rttridx:${rttridx} sigidx:${sigidx},cumLeftoverConstraintItem: ${s}`));
                        }
                        let pass1 = resolvedCallArguments.every((carg,cargidx)=>{
                            if (!isValidSigParamIndex(sig,cargidx)){
                                return false;
                            }
                            const sparam = getSigParamType(sig,cargidx);
                            if (carg.hasSpread /*final spread only*/ && !sparam.isRest) {
                                return false;
                            }
                            let assignableType = intersectionOfRefTypesType(carg.type, createRefTypesType(sparam.type));
                            if (isNeverType(assignableType)){
                                return false;
                            }
                            ({sc:tmpSC}=andSymbolTypeIntoSymtabConstraint({ symbol:carg.symbol as Symbol,isconst:carg.isconst,type:assignableType,sc: tmpSC,getDeclaredType, mrNarrow }));
                            // if (compilerOptions.mrNarrowConstraintsEnable){
                            //     tmpArgsConstr = andSymbolTypeIntoConstraint({ symbol:carg.symbol as Symbol,type:assignableType, constraintItem:tmpArgsConstr,getDeclaredType,mrNarrow });
                            //     if (isNeverConstraint(tmpArgsConstr)) {
                            //         return false;
                            //     }
                            // }
                            const evaledAssignableType = evalSymbol(carg.symbol,tmpSC, getDeclaredType, mrNarrow);
                            // is this necessary? evalCover is expensive
                            //const evaledAssignableType = evalCoverForOneSymbol(carg.symbol,tmpArgsConstr, getDeclaredType, mrNarrow);
                            if (isNeverType(evaledAssignableType)){
                                return false;
                            }
                            if (!isASubsetOfB(assignableType,evaledAssignableType)){
                                assignableType = evaledAssignableType;
                            }
                            oneMapping.push(assignableType);

                            const notAssignableType = subtractFromType(assignableType, carg.type);
                            // check if the non assignable type is allowed.
                            {
                                const {sc:checkSC} = andSymbolTypeIntoSymtabConstraint({ symbol:carg.symbol, isconst:carg.isconst, type:notAssignableType, sc: nextSC, getDeclaredType, mrNarrow });
                                const evaledNotAssignableType = evalSymbol(carg.symbol,checkSC,getDeclaredType,mrNarrow);
                                oneLeftoverMapping.push(evaledNotAssignableType);
                                // if (!isNeverConstraint(checkSC.constraintItem)){
                                //     const evaledNotAssignableType = evalSymbol(carg.symbol,checkSC,getDeclaredType,mrNarrow);
                                //     if (!isNeverType(evaledNotAssignableType)){
                                //         oneLeftoverMapping.push(evaledNotAssignableType);
                                //     }
                                // }
                            }
                            // const checkConstr = andSymbolTypeIntoConstraint({ symbol:carg.symbol, type:notAssignableType, constraintItem:scResolvedArgs.constraintItem,
                            //     getDeclaredType, mrNarrow });
                            // if (!isNeverConstraint(checkConstr)){
                            //     const evaledNotAssignableType = evalCoverForOneSymbol(carg.symbol,checkConstr, getDeclaredType, mrNarrow);
                            //     if (!isNeverType(evaledNotAssignableType)){
                            //         oneLeftoverMapping.push(evaledNotAssignableType);
                            //     }
                            // }
                            return true;
                        });
                        if (getMyDebug()){
                            let str = "";
                            oneMapping.forEach((t,_i)=>str+=`${dbgRefTypesTypeToString(t)}, `);
                            consoleLog(`mrNarrowTypesByCallExpression rttridx:${rttridx}, sigidx:${sigidx} oneMapping:[${str}]`);
                            str = "";
                            oneLeftoverMapping.forEach((t,_i)=>str+=`${dbgRefTypesTypeToString(t)}, `);
                            consoleLog(`mrNarrowTypesByCallExpression rttridx:${rttridx}, sigidx:${sigidx} oneLeftoverMapping:[${str}]`);
                        }
                        if (pass1 && isValidSigParamIndex(sig, resolvedCallArguments.length)){
                            // if there are leftover sig params the first one must be optional or final spread
                            const sparam = getSigParamType(sig, resolvedCallArguments.length);
                            if (!sparam.optional && !sparam.isRest){
                                pass1 = false;
                            }
                        }
                        if (pass1){
                            // check if mapping lies within the shadow of any pervious mapping, in which case it pass1->false
                            const shadowsPrev = allMappings.some((prevMapping,_prevMappingIdx)=>{
                                if (prevMapping.length<oneMapping.length) return false;
                                const oneshadow = oneMapping.every((onetype,idx)=>{
                                    return isASubsetOfB(onetype,prevMapping[idx]);
                                });
                                return oneshadow;
                            });
                            if (shadowsPrev){
                                pass1 = false;
                            }
                        }
                        let finished1 = false;
                        if (pass1){
                            allMappings.push(oneMapping);

                            arrRefTypesTableReturn.push({
                                kind: RefTypesTableKind.return,
                                type: createRefTypesType(arrsigrettype[sigidx]),
                                sci: tmpSC,
                            });

                            finished1 = oneLeftoverMapping.every(oneNotType=>isNeverType(oneNotType));
                            if (!finished1){
                                Debug.assert(tmpSC.symtab);
                                const nextSymtab = copyRefTypesSymtab(tmpSC.symtab);
                                let hadNonNeverInSymtab = false;
                                resolvedCallArguments.forEach((carg,cargidx)=>{
                                    //const symbol=carg.symbol;
                                    const leftoverType = oneLeftoverMapping[cargidx];
                                    const got = nextSymtab.get(carg.symbol);
                                    if (got) {
                                        nextSymtab.set(carg.symbol, leftoverType);
                                        //got.type = leftoverType; // might be never.
                                        if (!isNeverType(leftoverType)) hadNonNeverInSymtab = true;
                                    }
                                    else {
                                        Debug.fail("unexpected"); // ???
                                    }
                                });
                                //nextSymtab;
                                let nextConstraintItem = nextSC.constraintItem;
                                if (compilerOptions.mrNarrowConstraintsEnable) {
                                    allLeftoverMappings.push(oneLeftoverMapping);
                                    // the combination (logical and / intersection) of allLeftoverMappings might evaluate to never, if so then finished->true
                                    // We might wonder if the simple per-position intersection of of allLeftoverMappings would be enough to imply finished ...
                                    // but it is not so because it is the cross product of all inputs combinations that must be accounted for.
                                    // Each leftoverMapping is treated as a cross product, and the intesection of those cross products is what is calculated here.
                                    // If that is never, then all input cross products have been accounted for.
                                    cumLeftoverConstraintItem = calculateNextLeftovers(oneLeftoverMapping,cumLeftoverConstraintItem,arrCargSymbols,getDeclaredType);
                                    if (isNeverConstraint(cumLeftoverConstraintItem)) finished1 = true;
                                    if (!finished1){
                                        nextConstraintItem = calculateNextLeftovers(oneLeftoverMapping,nextSC.constraintItem,arrCargSymbols,getDeclaredType);
                                    }
                                }
                                nextSC = { symtab:nextSymtab, constraintItem:nextConstraintItem };
                                if (!hadNonNeverInSymtab && isNeverConstraint(nextSC.constraintItem)) finished1 = true;
                            }

                        }
                        // eslint-disable-next-line prefer-const
                        //if (pass1) arrAssigned.push(tmpAssigned);
                        if (getMyDebug()){
                            if (!finished1) {
                                dbgRefTypesSymtabConstrinatItemToStrings(nextSC).forEach(s=>{
                                    consoleLog(`mrNarrowTypesByCallExpression rttridx:${rttridx}/${pre.unmergedPassing.length}, sigidx:${sigidx}/${arrsig.length}, nextSC: ${s}`);
                                });
                            }
                            consoleLog(`mrNarrowTypesByCallExpression rttridx:${rttridx}/${pre.unmergedPassing.length}, sigidx:${sigidx}/${arrsig.length}, pass1:${pass1}, finshed1:${finished1}`);
                        }
                        return finished1;
                    });
                    // if not all possible assignment combinations have been covered then ...
                }

                if (!finished) {
                    sigGroupFailedCount++;
                    // "not finished" means there could be uncovered/unexpected arguments passed to the function and therefore the result is unknown.
                    // This situation can always be prevented if the user declares a final overload - `function [functionName](...args: any[]): never;`
                    // which could be backed up by terminating in case of unexpected inputs.
                    // This next added return is the same as the user declaring a final overload - `function [functionName](...args: any[]): unknown;`
                    // If the user declares `function [functionName](...args: any[]): unknown;` and the processing "finishes" before reaching it, then the
                    // function return effectively becomes never.
                    arrRefTypesTableReturn.push({
                        kind: RefTypesTableKind.return,
                        type: createRefTypesType(checker.getUnknownType()),
                        sci:scResolvedArgs
                    });
                }
                if (getMyDebug()){
                    consoleLog(`mrNarrowTypesByCallExpression rttridx:${rttridx}/${pre.unmergedPassing.length}, finished:${finished}`);
                }
            });
            setOfTransientCallArgumentSymbol.forEach(symbol=>_mrState.symbolFlowInfoMap.delete(symbol));
            if (getMyDebug()){
                consoleLog(`mrNarrowTypesByCallExpression sigGroupFailedCount:${sigGroupFailedCount}/${pre.unmergedPassing.length}`);
                consoleGroupEnd();
            }
            return { unmerged: arrRefTypesTableReturn };
        }


        type InferRefTypesPreAccessRtnType = & {
            kind: "immediateReturn",
            retval: MrNarrowTypesInnerReturn
        } | {
            kind: "normal",
            passing: RefTypesTableReturn,
            unmergedPassing: RefTypesTableReturn[]
            //byNode: ESMap<Node, Type>,
        };
        /**
         * In JS runtime
         *   {}.foo, [].foo, 1n.foo, "".foo, (1).foo (()=>1)().foo return undefined
         *   1.foo, undefined.foo, null.foo, (undefined).foo, (null).foo -> TypeError runtime exception
         * InferRefTypesPreAccess assists in handling the predecessor `return undefined` branch, if present, by pushing that `undefined` branch
         * to `qdotfallout` if `questionDotToken` is defined, othwise producing an an Error. By default that branch processing is then finsihed for the caller.
         * If undefined is the only branch then {kind:"immediateReturn", retval} is returned, with an appropriate value for retval.
         * Otherwise {kind:"normal", passing} is returned, where `passing` is the predecessor passing branch.
         * @param param0
         * @param symbolOfRtnType
         * @returns
         */
        function InferRefTypesPreAccess({ sci:{ symtab: refTypes, constraintItem}, expr: condExpr, /*crit,*/ qdotfallout, inferStatus }: InferRefInnerArgs & {expr: {expression: Expression}}): InferRefTypesPreAccessRtnType{
        if (getMyDebug()){
            consoleGroup(`InferRefTypesPreAccess[in] expr: ${dbgNodeToString(condExpr)}`);
        }
        try{
            const mntr = mrNarrowTypes(
                { sci:{ symtab:refTypes,constraintItem }, expr: condExpr.expression, crit: { kind:InferCritKind.notnullundef, negate: false, alsoFailing:true }, qdotfallout, inferStatus });

            const { passing, failing } = applyCrit(mntr,{ kind:InferCritKind.notnullundef, alsoFailing:true },inferStatus.groupNodeToTypeMap);
            Debug.assert(failing);
            if (!isNeverType(failing.type)){
                if (isPropertyAccessExpression(condExpr) && condExpr.questionDotToken){
                    qdotfallout.push(failing); // The caller of InferRefTypesPreAccess need deal with this no further.
                    if (getMyDebug()){
                        dbgRefTypesTableToStrings(failing).forEach(s=>{
                            consoleLog(`InferRefTypesPreAccess[dbg] failling->qdotfallout: ${s}`);
                        });
                    }
                }
                else {
                    /**
                     * If isNeverType and if !condExpr.questionDotToken, then what should happen to the failing node value in byNode?
                     * Doesn't matter if there is going to be an error anyway.
                     */
                    if (getMyDebug()) consoleLog(`Error: expression ${dbgNodeToString(condExpr)} cannot be applied to undefined or null.  Add '?' or '!' if appropriate.`);
                }
            }
            if (isNeverType(passing.type)){
                return { kind:"immediateReturn", retval: { unmerged:[] } };
            }
            const unmergedPassing: RefTypesTableReturn[] = [];
            mntr.unmerged?.forEach(rttr=>{
                const type = subtractFromType(createRefTypesType([nullType,undefinedType]),rttr.type);
                if (isNeverType(type)) return;
                // if (rttr.symbol){
                //     rttr = andRttrSymbolTypeIntoSymtabConstraint({ ...rttr,type }, inferStatus);
                //     if (!isNeverType(rttr.type) && !isNeverConstraint(rttr.constraintItem)) {
                //         unmergedPassing.push(rttr);
                //     }
                // }
                unmergedPassing.push({ ...rttr, type });
            });
            if (getMyDebug()){
                dbgRefTypesTableToStrings(passing).forEach(s=>{
                    consoleLog(`InferRefTypesPreAccess[dbg] passing: ${s}`);
                });
                unmergedPassing.forEach((umrttr,umidx)=>{
                    dbgRefTypesTableToStrings(umrttr).forEach(s=>{
                        consoleLog(`InferRefTypesPreAccess[dbg] unmergedPassing[${umidx}]: ${s}`);
                    });
                });
            }
            return { kind:"normal", passing, unmergedPassing };
        }
        finally {
            if (getMyDebug()){
                consoleLog(`InferRefTypesPreAccess[out]`);
                consoleGroupEnd();
            }
        }
        }

        function mrNarrowTypesByPropertyAccessExpression({ sci:{ symtab:refTypesSymtab, constraintItem }, expr: condExpr, /*crit,*/ qdotfallout, inferStatus }: InferRefInnerArgs): MrNarrowTypesInnerReturn {
            if (getMyDebug()) consoleGroup(`mrNarrowTypesByPropertyAccessExpression[in]`);
            const r = mrNarrowTypesByPropertyAccessExpression_aux({ sci:{ symtab:refTypesSymtab, constraintItem }, expr: condExpr, /*crit,*/ qdotfallout, inferStatus });
            if (getMyDebug()) {
                r.unmerged.forEach((rttr,idx)=>{
                    dbgRefTypesTableToStrings(rttr).forEach(s=>consoleLog(`mrNarrowTypesByPropertyAccessExpression[out] arrRefTypesTableReturn[${idx}] ${s}`));
                });
                consoleLog(`mrNarrowTypesByPropertyAccessExpression[out]`);
                consoleGroupEnd();
            }
            return r;
        }

        /**
         *
         * @param param0
         * @returns
         */
        function mrNarrowTypesByPropertyAccessExpression_aux({sci:{symtab:refTypesSymtabIn,constraintItem:constraintItemIn}, expr, /*crit,*/ qdotfallout, inferStatus}: InferRefInnerArgs): MrNarrowTypesInnerReturn {
            /**
             * It doesn't really make much sense for the PropertyAccessExpression to have a symbol because the property name is simply a key
             * that may be used to lookup across totally unrelated objects that are present only ambiently in the code - unless the precursor is a constant.
             * In that way it not so much different from a call expression, which never has a symbol.
             *
             * On the other hand, if the looked up properties are symbols - which the standard case - then it doesn't make sense to ignore those symbols because they may correspond to
             * identifiers with symbol and constrained values that should be added to the refTypes if not already there -
             * and if already existing in refTypes then the possibly narrowed existing type range should be
             * used to constrain the return value (rather than the declared value.)
             *
             * For the above reasons we will ignore the symbol `getNodeLinks(condExpr).resolvedSymbol;`
             * but address any looked-up property symbols as discussed above.
             *
             * An implication is that constraints imposed by crit or successor NonNullExpression (!) operator must be applied to multiple symbols if neccesary,
             * so `symbolOfRtnType` must be changed `symbolsOfRtnType`.
             */
            Debug.assert(isPropertyAccessExpression(expr));
            Debug.assert(expr.expression);
            const pre = InferRefTypesPreAccess({ sci:{ symtab:refTypesSymtabIn,constraintItem: constraintItemIn }, expr, /* crit,*/ qdotfallout, inferStatus });
            if (pre.kind==="immediateReturn") {
                return pre.retval;
            }
            /**
             * Each lookup should be treated as a separate virtual branch, with it's own RefTypesReturn, because the crit might distinguish between them.
             * We get by here with arrTypeSymtab, only because the symtab is added to directly: `refTypesSymtab.set(propSymbol, value); `
             *
             * In replayMode, we don't use the node type from byNode here for two reasons -
             * (1) The node type is already squashed so the infer info is lost
             * (2) We don't need it, because the types passed back from preAccess must be correct - identical to what is here (only squashed). Can be verified.
.             * */
            // const accessedTypes: {baseType: Type, type: Type, declaredType?: Type, lookupFail?: true, optional: boolean, readonlyProp?: boolean, narrowable?: boolean}[]=[];
            const keystr = expr.name.escapedText as string;
            //const arrTypeSymtab: [RefTypesType,RefTypesSymtab][] = []; //
            const arrRttr: RefTypesTableReturn[]=[];

            // nope
            //const {symbol: sfiPropSymbol, symbolFlowInfo } = getSymbolFlowInfoForIdentifier(expr.name,_mrState);

            pre.unmergedPassing.forEach(prePassing=>{
                if (isRefTypesSymtabConstraintItemNever(prePassing.sci)) return;
                /**
                 * Each prePassing.type is a potential compound type.  For each primitive type of that compound type, a new branch is generated.
                 * For each new branch a RefTypesTableReturn is created and pushed to arrRttr.
                 *
                 */
                forEachRefTypesTypeType(prePassing.type, t => {
                    if (t===undefinedType||t===nullType) {
                        return;
                    }
                    // let symtab = prePassing.sci.symtab!;
                    // let constraintItem = prePassing.sci.constraintItem;
                    let sc = prePassing.sci;
                    let type = createRefTypesType(t);
                    if (prePassing.symbol) {
                        ({type,sc}=andSymbolTypeIntoSymtabConstraint(
                            {symbol:prePassing.symbol, type, isconst:prePassing.isconst, sc,
                            getDeclaredType, mrNarrow }));
                    }
                    if (isArrayOrTupleType(t)||t===stringType) {
                        if (getMyDebug()) consoleLog(`mrNarrowTypesByPropertyAccessExpression[dbg] isArrayOrTupleType(t)||t===stringType`);
                        if (keystr==="length") {
                            arrRttr.push({
                                kind: RefTypesTableKind.return,
                                symbol: undefined,
                                type: createRefTypesType(numberType),
                                sci:sc,
                            });
                        }
                        else {
                            Debug.fail("not yet implemented ");
                            // arrRttr.push({
                            //     kind: RefTypesTableKind.return,
                            //     symbol: undefined,
                            //     type: createRefTypesType(undefinedType),
                            //     symtab,
                            //     constraintItem
                            // });
                        };
                        return;
                    }
                    /**
                     * Add propSymbol, resolvedType to a copy of refTypesSymtab
                     *
                     */
                    const propSymbol = checker.getPropertyOfType(t, keystr);
                    if (propSymbol) {
                        if (getMyDebug()) consoleLog(`mrNarrowTypesByPropertyAccessExpression[dbg] propSymbol ${dbgSymbolToStringSimple(propSymbol)}, ${Debug.formatSymbolFlags(propSymbol.flags)}`);
                        if (propSymbol.flags & SymbolFlags.EnumMember){
                            // treat it as a literal type, not a symbol
                            const tstype = enumMemberSymbolToLiteralTsType(propSymbol);
                            arrRttr.push({
                                kind: RefTypesTableKind.return,
                                type: createRefTypesType(tstype),
                                sci:sc,
                            });
                            return;
                        }
                        let symbolFlowInfo = _mrState.symbolFlowInfoMap.get(propSymbol);
                        if (!symbolFlowInfo){
                            const effectiveDeclaredTsType = getTypeOfSymbol(propSymbol);
                            symbolFlowInfo = {
                                passCount: 0,
                                isconst: checker.isReadonlyProperty(propSymbol),
                                effectiveDeclaredTsType,
                                effectiveDeclaredType: createRefTypesType(effectiveDeclaredTsType),
                            };
                            _mrState.symbolFlowInfoMap.set(propSymbol,symbolFlowInfo);
                        }
                        else {
                            if (extraAsserts){
                                Debug.assert(symbolFlowInfo.effectiveDeclaredTsType===getTypeOfSymbol(propSymbol));
                            }
                        }
                        if (extraAsserts){
                            debugDevExpectEffectiveDeclaredType(expr,symbolFlowInfo);
                        }
                        const {type, sc:propSC} = andSymbolTypeIntoSymtabConstraint(
                            {symbol:propSymbol, type:symbolFlowInfo.effectiveDeclaredType!, isconst: symbolFlowInfo.isconst, sc,
                            getDeclaredType, mrNarrow });
                        // if (doInvolved && inferStatus.involved){
                        //     /**
                        //      * (1) Note that by setting the symbol here, it does include any possible 'undefined' resulting from optional '?'
                        //      * accesses to left.  It must be so, because the same symbol can potentially be set or read from a different lhs.
                        //      * (2) Only the first occurence of a symbol in the group is used to initialize.
                        //      * (3) Cannot use initialize here because (unlike identifiers) propSymbols may change, so we have to be prepared to add new ones.
                        //      */
                        //     const involved = inferStatus.involved;
                        //     if (!involved.inEncountered.has(propSymbol)) {
                        //         (involved.involvedSymbolTypeCache.in.propertyAccessMap
                        //             ?? (involved.involvedSymbolTypeCache.in.propertyAccessMap = new Map<Symbol,RefTypesType>()))
                        //                 .set(propSymbol,type);
                        //         involved.inEncountered.add(propSymbol);
                        //     }
                        // }

                        arrRttr.push({
                            kind: RefTypesTableKind.return,
                            symbol: propSymbol,
                            isconst: symbolFlowInfo.isconst,
                            type, //symbolFlowInfo.effectiveDeclaredType!,
                            sci: propSC
                        });
                        return;
                    }
                    if (!(t.flags & TypeFlags.Object) && t!==stringType){
                        if (getMyDebug()) consoleLog(`mrNarrowTypesByPropertyAccessExpression[dbg] (!(t.flags & TypeFlags.Object) && t!==stringType)`);
                        let tstype: Type;
                        if (t===numberType) tstype = errorType;  // special case ERROR TYPE for t===numberType
                        else tstype = undefinedType;
                        const type = createRefTypesType(tstype);
                        arrRttr.push({
                            kind: RefTypesTableKind.return,
                            symbol: undefined,
                            type,
                            sci:sc
                        });
                        return;
                    }
                    Debug.fail("unexpected");
                });
            });
            return { unmerged: arrRttr };
        }

        function createMrNarrowTypesReturn(unmerged: RefTypesTableReturn[], nodeForMap: Node): MrNarrowTypesReturn {
            return {
                unmerged,
                nodeForMap
            };
        }

        function createRefTypesTableReturn(type: RefTypesType, sci: RefTypesSymtabConstraintItem, symbol?: Symbol, isconst?: boolean, isAssign?: boolean): RefTypesTableReturn {
            if (!symbol){
                return {
                    kind: RefTypesTableKind.return,
                    type,sci
                };
            }
            else {
                return {
                    kind: RefTypesTableKind.return,
                    type,sci,symbol,
                    isconst,
                    isAssign
                };
            }
        }

        /**
         * @param param0
         * @returns
         */
        function mrNarrowTypes({sci, expr:expr, inferStatus, qdotfallout, crit }: MrNarrowTypesArgs): MrNarrowTypesReturn {
            if (!sci.symtab){
                Debug.assert(isRefTypesSymtabConstraintItemNever(sci));
                return {
                    unmerged: [{
                        kind: RefTypesTableKind.return,
                        type: createRefTypesType(), // never
                        sci: createRefTypesSymtabConstraintItemNever()
                    }],
                    nodeForMap: expr,
                };
            }
            if (expr.kind===SyntaxKind.Identifier){
                return mrNarrowIdentifier();
            }
            if (expr.kind===SyntaxKind.ParenthesizedExpression){
                const mntr = mrNarrowTypes({
                    expr:(expr as ParenthesizedExpression).expression,qdotfallout,sci,inferStatus, crit
                });
                applyCritNoneUnion(mntr,inferStatus.groupNodeToTypeMap);
                return mntr;
            }
            return mrNarrowTypesAux({
                expr,qdotfallout,sci,inferStatus, crit
            });

            function mrNarrowIdentifier(): MrNarrowTypesReturn {
                if (getMyDebug()) consoleGroup(`mrNarrowIdentifier [in] ${dbgNodeToString(expr)}`);
                function mrNarrowIdentifierAux(): MrNarrowTypesReturn {
                    Debug.assert(isIdentifier(expr));

                    const symbol = getResolvedSymbol(expr); // getSymbolOfNode()?

                    // There is a unique symbol for the type undefined - that gets converted directly to the undefined type here.
                    if (checker.isUndefinedSymbol(symbol)){
                        return createMrNarrowTypesReturn([createRefTypesTableReturn(
                            createRefTypesType(undefinedType),
                            sci)],
                            expr,
                        );
                    }
                    if (symbol.flags & SymbolFlags.Function){
                        return createMrNarrowTypesReturn([createRefTypesTableReturn(
                            createRefTypesType(getTypeOfSymbol(symbol)),
                            sci)],
                            expr,
                        );
                    }
                    let symbolFlowInfo = _mrState.symbolFlowInfoMap.get(symbol);
                    if (!symbolFlowInfo){
                        const effectiveDeclaredTsType = getTypeOfSymbol(symbol);
                        const isconst = checker.isConstantReference(expr);
                        symbolFlowInfo = {
                            passCount:0,
                            effectiveDeclaredTsType,
                            isconst
                        };
                        _mrState.symbolFlowInfoMap.set(symbol,symbolFlowInfo);
                    }

                    if (inferStatus.replayables.has(symbol)){
                        if (getMyDebug()){
                            consoleLog(`mrNarrowTypesInner[dbg]: start replay for ${dbgSymbolToStringSimple(symbol)}`);
                        }
                        const replayable = inferStatus.replayables.get(symbol)!;
                        /**
                         * Replay with new constraints
                         * The existing inferStatus.groupNodeToTypeMap should not be overwritten during replay.
                         * Therefore we substitute in a dummy map.
                         * NOTE: tests show this causes no harm, but don't have a test case that shows it is necessary.
                         */
                        const replayableInType = sci.symtab?.get(symbol);
                        //sci.symtab?.delete(symbol);  -- don't acutally HAVE to delete it.  TODO: check that
                        const dummyNodeToTypeMap = new Map<Node,Type>();
                        const mntr = mrNarrowTypes({
                            expr: replayable?.expr,
                            crit: { kind:InferCritKind.none },
                            sci,
                            qdotfallout: undefined,
                            inferStatus: { ...inferStatus, inCondition:true, currentReplayableItem:replayable, groupNodeToTypeMap: dummyNodeToTypeMap }
                        });
                        if (getMyDebug()){
                            consoleLog(`mrNarrowTypesInner[dbg]: end replay for ${dbgSymbolToStringSimple(symbol)}`);
                        }

                        /**
                         * Try this instead of global doIdentifierExpandTypeOnCondition=true, which is expensive. Works for _caxnc-rp-001.
                         */
                        if (inferStatus.inCondition && replayable.expr.kind===SyntaxKind.Identifier && mntr.unmerged.length===1){
                            const unmerged: RefTypesTableReturn[] = [];
                            forEachRefTypesTypeType(mntr.unmerged[0].type, t => unmerged.push({
                                ...mntr.unmerged[0],
                                type: createRefTypesType(t)
                            }));
                            mntr.unmerged=unmerged;
                        }

                        // if (!inferStatus.inCondition){
                            /**
                             * These tests fail when this is enabled:
                             * _caxnc-eqneq-0003
                             * _caxnc-eqneq-0013
                             * _caxnc-rp-0003
                             * _caxnc-rp-0004
                             */
                            // const rttr = applyCritNone1Union(mntr.unmerged,expr,/**/ undefined); // don't write here because the type is not narrowed yet.
                            // const narrowerTypeOut = (replayableInType && !isASubsetOfB(rttr.type,replayableInType) && intersectionOfRefTypesType(rttr.type, replayableInType)) || undefined;
                            // return {
                            //     unmerged:[{
                            //         ...rttr,
                            //         symbol,
                            //         isconst: replayable.isconst,
                            //         ...(narrowerTypeOut ? { type:narrowerTypeOut } : {})
                            //     }],
                            //     nodeForMap: expr,
                            //     ...(mntr.typeof ? { typeof:mntr.typeof } : {})
                            // };
                        // }
                        // else
                        {
                            const unmerged: RefTypesTableReturn[] = [];
                            mntr.unmerged.forEach((rttr)=>{
                                const narrowerTypeOut = (replayableInType && !isASubsetOfB(rttr.type,replayableInType) && intersectionOfRefTypesType(rttr.type, replayableInType)) || undefined;
                                if (narrowerTypeOut && isNeverType(narrowerTypeOut)) return;
                                rttr = applyCritNoneToOne({ ...rttr,type:narrowerTypeOut??rttr.type },expr,/**/ undefined); // don't write here because the original symbol is from replay.
                                unmerged.push({
                                    ...rttr,
                                    symbol,
                                    isconst: replayable.isconst,
                                    ...(narrowerTypeOut ? { type:narrowerTypeOut } : {})
                                });
                            });
                            return {
                                unmerged,
                                nodeForMap: expr,
                                ...(mntr.typeof ? { typeof:mntr.typeof } : {})
                            };
                        }

                    } // endof if (inferStatus.replayables.has(symbol))

                    let type: RefTypesType | undefined;
                    const isconst = symbolFlowInfo.isconst;
                    type = sci.symtab?.get(symbol) ?? getSymbolFlowInfoInitializerOrDeclaredTypeFromSymbolFlowInfo(symbolFlowInfo);
                    Debug.assert(type);
                    if (inferStatus.currentReplayableItem){
                        // If the value of the symbol has definitely NOT changed since the defintion of the replayable.
                        // then we can continue on below to find the value via constraints.  Otherwise, we must use the value of the symbol
                        // at the time of the definition of the replayable, as recorded in the replayables byNode map.
                        // Currently `isconst` is equivalent to "definitely NOT changed".
                        if (!isconst){
                            const tstype = inferStatus.currentReplayableItem.nodeToTypeMap.get(expr)!;
                            Debug.assert(type);
                            type = createRefTypesType(tstype);
                            return {
                                unmerged:[{
                                    kind: RefTypesTableKind.return,
                                    // symbol and isconst are not passed back because in replay non-const is treated as a hardwired type
                                    type,
                                    sci
                                }],
                                nodeForMap:expr
                            };
                        }
                    }
                    if (doIdentifierExpandTypeOnCondition && inferStatus.inCondition){
                        const unmerged: RefTypesTableReturn[] = [];
                        forEachRefTypesTypeType(type, (t)=>{
                            unmerged.push({
                                kind: RefTypesTableKind.return,
                                symbol,
                                isconst,
                                type: createRefTypesType(t),
                                sci
                            });
                        });
                        return {
                            unmerged,
                            nodeForMap: expr
                        };
                    }
                    return {
                        unmerged:[{
                            kind: RefTypesTableKind.return,
                            symbol,
                            isconst,
                            type,
                            sci
                        }],
                        nodeForMap: expr
                    };
                } // endof mrNarrowIdentifierAux()
                const ret =  mrNarrowIdentifierAux();

                if (getMyDebug()) {
                    ret.unmerged.forEach((rttr,i)=>{
                        dbgRefTypesTableToStrings(rttr).forEach(s=>consoleLog(`  mrNarrowTypes[dbg]: unmerged[${i}]: ${s}`));
                    });
                    consoleLog(`mrNarrowIdentifier[out] mrNarrowTypesReturn.typeof: ${ret.typeof}`);

                    consoleLog(`mrNarrowIdentifier[out] groupNodeToTypeMap.size: ${inferStatus.groupNodeToTypeMap.size}`);
                    inferStatus.groupNodeToTypeMap.forEach((t,n)=>{
                        for(let ntmp = n; ntmp.kind!==SyntaxKind.SourceFile; ntmp=ntmp.parent){
                            if (ntmp===expr){
                                consoleLog(`mrNarrowIdentifier[out] groupNodeToTypeMap: node: ${dbgNodeToString(n)}, type: ${typeToString(t)}`);
                                break;
                            }
                        }
                    });
                    consoleLog(`mrNarrowIdentifier [out] ${dbgNodeToString(expr)}`);
                    consoleGroupEnd();
                }
                return ret;
            } // endof mrNarrowIdentifier()
        }
        function mrNarrowTypesAux({ sci, expr:expr, inferStatus, qdotfallout: qdotfalloutIn }: MrNarrowTypesArgsX): MrNarrowTypesReturn {
            assertCastType<RefTypesSymtabConstraintItemNotNever>(sci);
            if (getMyDebug()) {
                consoleGroup(`mrNarrowTypes[in] expr:${dbgNodeToString(expr)}}, `
                +`inferStatus:{inCondition:${inferStatus.inCondition}, currentReplayable:${inferStatus.currentReplayableItem?`{symbol:${dbgSymbolToStringSimple(inferStatus.currentReplayableItem.symbol)}}`:undefined}}, `
                +`qdotfalloutIn: ${!qdotfalloutIn ? "<undef>" : `length: ${qdotfalloutIn.length}`}`);
                consoleLog(`mrNarrowTypes[in] refTypesSymtab:`);
                dbgRefTypesSymtabToStrings(sci.symtab).forEach(str=> consoleLog(`  ${str}`));
                consoleLog(`mrNarrowTypes[in] constraintItemIn:`);
                dbgConstraintItem(sci.constraintItem).forEach(str=> consoleLog(`  ${str}`));
            }
            const qdotfallout = qdotfalloutIn??([] as RefTypesTableReturn[]);
            const innerret = mrNarrowTypesInner({ sci, expr, qdotfallout,
                inferStatus });
            let finalArrRefTypesTableReturn = innerret.unmerged;
            if (getMyDebug()){
                consoleLog(`mrNarrowTypes[dbg]: qdotfallout.length: ${qdotfallout.length}`);
                qdotfallout.forEach((rttr,i)=>{
                    dbgRefTypesTableToStrings(rttr).forEach(str=>{
                        consoleLog(`mrNarrowTypes[dbg]:  qdotfallout[${i}]: ${str}`);
                    });
                });
            }
            if (!qdotfalloutIn){
                /**
                 * !qdotfallout so merge the temporary qdotfallout into the array for RefTypesTableReturn before applying crit
                 */
                if (getMyDebug()){
                    consoleLog(`mrNarrowTypes[dbg]: ${dbgNodeToString(expr)}: Merge the temporary qdotfallout into the array for RefTypesTableReturn before applying crit:`);
                    qdotfallout.forEach((rttr,i)=>{
                        dbgRefTypesTableToStrings(rttr).forEach(str=>{
                            consoleLog(`mrNarrowTypes[dbg]:  qdotfallout[${i}]: ${str}`);
                        });
                    });
                }
                finalArrRefTypesTableReturn = [...qdotfallout, ...innerret.unmerged];
            }
            const mrNarrowTypesReturn: MrNarrowTypesReturn = {
                unmerged: finalArrRefTypesTableReturn.filter(rttr=>!isRefTypesSymtabConstraintItemNever(rttr.sci)),
                nodeForMap: expr,
            };
            if (innerret.typeof) mrNarrowTypesReturn.typeof = innerret.typeof;

            if (getMyDebug()) {
                mrNarrowTypesReturn.unmerged.forEach((rttr,i)=>{
                        dbgRefTypesTableToStrings(rttr).forEach(s=>consoleLog(`  mrNarrowTypes[dbg]: unmerged[${i}]: ${s}`));
                    });
                // consoleGroup("mrNarrowTypes[out] mrNarrowTypesReturn.byNode:");
                consoleLog(`mrNarrowTypes[out] mrNarrowTypesReturn.typeof: ${mrNarrowTypesReturn.typeof}`);

                consoleLog(`mrNarrowTypes[out] groupNodeToTypeMap.size: ${inferStatus.groupNodeToTypeMap.size}`);
                inferStatus.groupNodeToTypeMap.forEach((t,n)=>{
                    for(let ntmp = n; ntmp.kind!==SyntaxKind.SourceFile; ntmp=ntmp.parent){
                        if (ntmp===expr){
                            consoleLog(`mrNarrowTypes[out] groupNodeToTypeMap: node: ${dbgNodeToString(n)}, type: ${typeToString(t)}`);
                            break;
                        }
                    }
                });
                // consoleGroupEnd();
                consoleLog(`mrNarrowTypes[out] ${dbgNodeToString(expr)}`);
                consoleGroupEnd();
            }
            return mrNarrowTypesReturn;
        }

        function mrNarrowTypesInner({ sci: {symtab:refTypesSymtabIn,constraintItem }, expr: expr, qdotfallout, inferStatus }: InferRefInnerArgs): MrNarrowTypesInnerReturn {
            if (getMyDebug()){
                consoleGroup(`mrNarrowTypesInner[in] expr:${dbgNodeToString(expr)}, inferStatus:{inCondition:${inferStatus.inCondition}, currentReplayableItem:${inferStatus.currentReplayableItem?`{symbol:${dbgSymbolToStringSimple(inferStatus.currentReplayableItem.symbol)}}`:undefined}`);
                consoleLog(`mrNarrowTypesInner[in] refTypesSymtab:`);
                dbgRefTypesSymtabToStrings(refTypesSymtabIn).forEach(str=> consoleLog(`mrNarrowTypesInner[in] refTypesSymtab:  ${str}`));
                consoleLog(`mrNarrowTypesInner[in] constraintItemIn:`);
                if (constraintItem) dbgConstraintItem(constraintItem).forEach(str=> consoleLog(`mrNarrowTypesInner[in] constraintItemIn:  ${str}`));
            }
            const innerret = mrNarrowTypesInnerAux({ sci:{ symtab: refTypesSymtabIn, constraintItem }, expr, qdotfallout, inferStatus });
            if (getMyDebug()){
                innerret.unmerged.forEach((rttr,i)=>{
                    dbgRefTypesTableToStrings(rttr).forEach(str=>{
                        consoleLog(`mrNarrowTypesInner[out]:  innerret.arttr[${i}]: ${str}`);
                    });
                });
                inferStatus.groupNodeToTypeMap.forEach((type,node)=>{
                    for(let ntmp = node; ntmp.kind!==SyntaxKind.SourceFile; ntmp=ntmp.parent){
                        if (ntmp===expr){
                            consoleLog(`mrNarrowTypesInner[out]:  innerret.byNode: { node: ${dbgNodeToString(node)}, type: ${typeToString(type)}`);
                            break;
                        }
                    }
                });
                consoleLog(`mrNarrowTypesInner[out] expr:${dbgNodeToString(expr)}, inferStatus:{inCondition:${inferStatus.inCondition}, currentReplayableItem:${inferStatus.currentReplayableItem?`{symbol:${dbgSymbolToStringSimple(inferStatus.currentReplayableItem.symbol)}}`:undefined}`);
                consoleGroupEnd();
            }
            // if (!useConstraintsV2()) {
            //     innerret.arrRefTypesTableReturn.forEach((rttr)=>{
            //         assertSymtabConstraintInvariance({ symtab:rttr.symtab, constraintItem:rttr.constraintItem }, createGetDeclaredTypeFn(inferStatus) ,mrNarrow);
            //     });
            // }
            return innerret;
        }

        /**
         *
         * @param param0
         * @returns
         */
        function mrNarrowTypesInnerAux({sci:{symtab: refTypesSymtabIn, constraintItem:constraintItemIn}, expr, qdotfallout, inferStatus}: InferRefInnerArgs): MrNarrowTypesInnerReturn {
            Debug.assert(!isNeverConstraint(constraintItemIn));
            Debug.assert(refTypesSymtabIn);
            switch (expr.kind){
                /**
                 * Identifier
                 */
                case SyntaxKind.Identifier:
                    Debug.fail("unexpected");
                // {
                //     if (getMyDebug()) consoleLog(`mrNarrowTypesInner[dbg] case SyntaxKind.Identifier`);
                //     Debug.assert(isIdentifier(expr));

                //     const symbol = getResolvedSymbol(expr); // getSymbolOfNode()?

                //     // There is a unique symbol for the type undefined - that gets converted directly to the undefined type here.
                //     if (checker.isUndefinedSymbol(symbol)){
                //         return {
                //             arrRefTypesTableReturn:[{
                //                 kind: RefTypesTableKind.return,
                //                 type: createRefTypesType(undefinedType),
                //                 sci: {
                //                     symtab: refTypesSymtabIn,
                //                     constraintItem: constraintItemIn
                //                 }
                //             }]
                //         };
                //     }
                //     if (symbol.flags & SymbolFlags.Function){
                //         return {
                //             arrRefTypesTableReturn:[{
                //                 kind: RefTypesTableKind.return,
                //                 type: createRefTypesType(getTypeOfSymbol(symbol)),
                //                 sci: {
                //                     symtab: refTypesSymtabIn,
                //                     constraintItem: constraintItemIn
                //                 }
                //             }]
                //         };
                //     }
                //     let symbolFlowInfo = _mrState.symbolFlowInfoMap.get(symbol);
                //     if (!symbolFlowInfo){
                //         const effectiveDeclaredTsType = getTypeOfSymbol(symbol);
                //         const isconst = checker.isConstantReference(expr);
                //         symbolFlowInfo = {
                //             passCount:0,
                //             effectiveDeclaredTsType,
                //             isconst
                //         };
                //         _mrState.symbolFlowInfoMap.set(symbol,symbolFlowInfo);
                //     }

                //     if (inferStatus.replayables.has(symbol)){
                //         if (getMyDebug()){
                //             consoleLog(`mrNarrowTypesInner[dbg]: start replay for ${dbgSymbolToStringSimple(symbol)}`);
                //         }
                //         const replayable = inferStatus.replayables.get(symbol)!;
                //         /**
                //          * Replay with new constraints
                //          * The existing inferStatus.groupNodeToTypeMap should not be overwritten during replay.
                //          * Therefore we substitute in a dummy map.
                //          * NOTE: tests show this causes no harm, but don't have a test case that shows it is necessary.
                //          */
                //         const dummyNodeToTypeMap = new Map<Node,Type>();
                //         const mntr = mrNarrowTypes({
                //             expr: replayable?.expr,
                //             crit: { kind:InferCritKind.none },
                //             sci:{
                //                 symtab: refTypesSymtabIn,
                //                 constraintItem: constraintItemIn,
                //             },
                //             qdotfallout: undefined,
                //             inferStatus: { ...inferStatus, inCondition:true, currentReplayableItem:replayable, groupNodeToTypeMap: dummyNodeToTypeMap }
                //         });
                //         if (getMyDebug()){
                //             consoleLog(`mrNarrowTypesInner[dbg]: end replay for ${dbgSymbolToStringSimple(symbol)}`);
                //         }

                //         if (inferStatus.inCondition){
                //             return {
                //                 arrRefTypesTableReturn: mntr.inferRefRtnType.unmerged.map(rttr=>{
                //                     rttr = applyCritNoneToOne(rttr,expr,inferStatus.currentReplayableItem?undefined:inferStatus.groupNodeToTypeMap);
                //                     return {
                //                         ...rttr,
                //                         symbol,
                //                         isconst: replayable.isconst
                //                     };
                //                 })
                //             };
                //         }
                //         else {
                //             return {
                //                 arrRefTypesTableReturn: [{
                //                     ...applyCritNone1Union(mntr.inferRefRtnType.unmerged,expr,inferStatus.currentReplayableItem?undefined:inferStatus.groupNodeToTypeMap),
                //                     symbol,
                //                     isconst: replayable.isconst
                //                 }]
                //             };
                //         }
                //     } // endof if (inferStatus.replayables.has(symbol))
                //     let type: RefTypesType | undefined;
                //     const isconst = symbolFlowInfo.isconst;
                //     type = refTypesSymtabIn.get(symbol) ?? getSymbolFlowInfoInitializerOrDeclaredTypeFromSymbolFlowInfo(symbolFlowInfo);
                //     Debug.assert(type);
                //     if (inferStatus.currentReplayableItem){
                //         // If the value of the symbol has definitely NOT changed since the defintion of the replayable.
                //         // then we can continue on below to find the value via constraints.  Otherwise, we must use the value of the symbol
                //         // at the time of the definition of the replayable, as recorded in the replayables byNode map.
                //         // Currently `isconst` is equivalent to "definitely NOT changed".
                //         if (!isconst){
                //             const tstype = inferStatus.currentReplayableItem.nodeToTypeMap.get(expr)!;
                //             Debug.assert(type);
                //             type = createRefTypesType(tstype);
                //             return {
                //                 arrRefTypesTableReturn:[{
                //                     kind: RefTypesTableKind.return,
                //                     // symbol and isconst are not passed back because in replay non-const is treated as a hardwired type
                //                     type,
                //                     sci:{
                //                         symtab: refTypesSymtabIn,
                //                         constraintItem: constraintItemIn
                //                     }
                //                 }],
                //             };
                //         }
                //     }
                //     const scout: RefTypesSymtabConstraintItem = {
                //         symtab: refTypesSymtabIn,
                //         constraintItem: constraintItemIn
                //     };
                //     const rttr: RefTypesTableReturn = {
                //         kind: RefTypesTableKind.return,
                //         symbol,
                //         isconst,
                //         type,
                //         sci: scout
                //     };
                //     const mrNarrowTypesInnerReturn: MrNarrowTypesInnerReturn = {
                //         arrRefTypesTableReturn: [rttr],
                //     };
                //     return mrNarrowTypesInnerReturn;
                // }
                /**
                 * NonNullExpression
                 */
                break;
                case SyntaxKind.NonNullExpression: {
                    Debug.assert(isNonNullExpression(expr));
                    /**
                     * Typescript documentation on "Non-null assertion operator":
                     * https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator
                     * > A new ! post-fix expression operator may be used to assert that its operand
                     * > is non-null and non-undefined in contexts where the type checker is unable
                     * > to conclude that fact. Specifically, the operation x! produces a value of
                     * > the type of x with null and undefined excluded. Similar to type assertions
                     * > of the forms <T>x and x as T, the ! non-null assertion operator is simply
                     * > removed in the emitted JavaScript code.
                     * However, the operator precedence was not specified in the documentation.
                     * Should it be the same as the ? operator (defined by JS runtime), binding only to the last element?
                     * In that case `qdotfallout` are not filtered here.
                     *
                     * It could be defined to apply to all preceding elements in a chain.
                     * That would require defining the limits of the chain -
                     * Does that cross getters, elements access, parentheses, call expressions, etc?
                     * In that case `qdotfallout` would filtered here, and the chain limits are where `qdotfallout` are terminated.
                     * It would be easy enough to filter `qdotfallout` here if required for, e.g., back compat.
                     *
                     *
                     */
                     const innerret = mrNarrowTypesInner({ sci:{ symtab: refTypesSymtabIn,constraintItem: constraintItemIn }, expr: expr.expression,
                        qdotfallout, inferStatus });

                    /**
                     * Apply notnullundef criteria without squashing the result into passing/failing
                     * Note that innerret.byNode is not altered, under the assumption that byNode does not yet include the types to be discriminated.
                     */
                    const applyNotNullUndefCritToRefTypesTableReturn = (arrRttr: Readonly<RefTypesTableReturn[]>): Readonly<RefTypesTableReturn[]> => {
                        const arrOut: RefTypesTableReturn[] = [];
                        arrRttr.forEach(rttr=>{
                            const type = createRefTypesType();
                            applyCritToRefTypesType(rttr.type,{ kind: InferCritKind.notnullundef }, (tstype, bpass, _bfail)=>{
                                if (bpass) addTypeToRefTypesType({ source:tstype,target:type });
                            });
                            if (!isNeverType(type)){
                                arrOut.push({
                                    ... rttr,
                                    type
                                });
                            }

                        });
                        return arrOut;
                    };
                    return {
                        unmerged: applyNotNullUndefCritToRefTypesTableReturn(innerret.unmerged),
                    };
                }
                case SyntaxKind.ParenthesizedExpression:
                    Debug.fail("unexpected"); // now handled on entry to mrNarrowTypes
                    break;
                /**
                 * ConditionalExpression
                 */
                case SyntaxKind.ConditionalExpression:{
                    if (getMyDebug()) consoleLog(`mrNarrowTypesInner[dbg] case SyntaxKind.ConditionalExpression`);
                    const {condition, whenTrue, whenFalse} = (expr as ConditionalExpression);
                    if (getMyDebug()) consoleLog(`mrNarrowTypesInner[dbg] case SyntaxKind.ConditionalExpression ; condition:${dbgNodeToString(condition)}`);
                    const rcond = applyCrit(mrNarrowTypes({
                        sci:{
                            symtab: refTypesSymtabIn,
                            constraintItem: constraintItemIn
                        },
                        expr: condition,
                        crit: { kind: InferCritKind.truthy, alsoFailing: true },
                        inferStatus: { ...inferStatus, inCondition: true },
                    }),{ kind: InferCritKind.truthy, alsoFailing: true },inferStatus.groupNodeToTypeMap);

                    if (getMyDebug()) consoleLog(`mrNarrowTypesInner[dbg] case SyntaxKind.ConditionalExpression ; whenTrue`);
                    const retTrue = applyCritNoneUnion(mrNarrowTypes({
                        sci: rcond.passing.sci,
                        expr: whenTrue,
                        crit: { kind: InferCritKind.none },
                        inferStatus, //: { ...inferStatus, inCondition: true }
                    }),inferStatus.groupNodeToTypeMap);

                    if (getMyDebug()) consoleLog(`mrNarrowTypesInner[dbg] case SyntaxKind.ConditionalExpression ; whenFalse`);
                    const retFalse = applyCritNoneUnion(mrNarrowTypes({
                        sci: rcond.failing!.sci,
                        expr: whenFalse,
                        crit: { kind: InferCritKind.none },
                        inferStatus, //: { ...inferStatus, inCondition: true }
                    }),inferStatus.groupNodeToTypeMap);

                    const arrRefTypesTableReturn: RefTypesTableReturn[] = [];
                    arrRefTypesTableReturn.push(retTrue);
                    arrRefTypesTableReturn.push(retFalse);
                    const retval: MrNarrowTypesInnerReturn = {
                        unmerged: arrRefTypesTableReturn
                    };
                    return retval;
                }
                break;
                /**
                 * PropertyAccessExpression
                 */
                // IWOZERE
                case SyntaxKind.PropertyAccessExpression:
                    if (getMyDebug()) consoleLog(`mrNarrowTypesInner[dbg] case SyntaxKind.PropertyAccessExpression`);
                    return mrNarrowTypesByPropertyAccessExpression({ sci:{ symtab:refTypesSymtabIn,constraintItem: constraintItemIn }, expr, /* crit, */ qdotfallout, inferStatus });
                /**
                 * CallExpression
                 */
                case SyntaxKind.CallExpression:{
                    if (getMyDebug()) consoleLog(`mrNarrowTypesInner[dbg] case SyntaxKind.CallExpression`);
                    Debug.assert(isCallExpression(expr));
                    return mrNarrowTypesByCallExpression({ sci:{ symtab:refTypesSymtabIn,constraintItem: constraintItemIn }, expr, /*crit, */ qdotfallout, inferStatus });
                }
                case SyntaxKind.PrefixUnaryExpression:
                    if ((expr as PrefixUnaryExpression).operator === SyntaxKind.ExclamationToken) {
                        const ret = applyCrit(mrNarrowTypes({
                            sci:{ symtab:refTypesSymtabIn, constraintItem:constraintItemIn },
                            expr:(expr as PrefixUnaryExpression).operand,
                            crit:{ negate: true, kind: InferCritKind.truthy, alsoFailing: true },
                            qdotfallout: undefined, inferStatus: { ...inferStatus, inCondition: true },
                        }),{ negate: true, kind: InferCritKind.truthy, alsoFailing: true },inferStatus.groupNodeToTypeMap);
                        /**
                         * The crit was already set with negate: true to reverse the passing and failing.
                         * Below, the symbols are set to undefined, and the types converted to booleans.
                         */
                        const nodeTypes: Type[] = [];
                        //ret.inferRefRtnType.passing.symbol = undefined;
                        if (!isNeverType(ret.passing.type)){
                            const ttype = checker.getTrueType();
                            nodeTypes.push(ttype);
                            ret.passing.type = createRefTypesType(ttype);
                        }
                        //ret.inferRefRtnType.failing!.symbol = undefined;
                        if (!isNeverType(ret.failing!.type)){
                            const ftype = checker.getFalseType();
                            nodeTypes.push(ftype);
                            ret.failing!.type = createRefTypesType(ftype);
                        }
                        //mergeOneIntoNodeToTypeMaps(expr, getUnionType(nodeTypes),inferStatus.groupNodeToTypeMap);
                        return {
                            unmerged: [ret.passing, ret.failing!]
                        };
                    }
                    Debug.fail("unexpected");
                    break;
                case SyntaxKind.VariableDeclaration: {
                    Debug.assert(isVariableDeclaration(expr));
                    Debug.assert(expr.initializer);
                    const initializer = expr.initializer;

                    const rhs = applyCritNoneUnion(mrNarrowTypes({
                        sci:{
                            symtab: refTypesSymtabIn,
                            constraintItem: constraintItemIn
                        },
                        expr:initializer, crit:{ kind: InferCritKind.none }, qdotfallout:undefined,
                        inferStatus: { ...inferStatus, inCondition: false },
                    }),inferStatus.groupNodeToTypeMap);

                    // NOTE: in case of inferStatus.withinLoop, no action should be required here because the effect is already incorporated on the rhs
                    if (isIdentifier(expr.name)){

                        const symbol = getSymbolOfNode(expr); // not condExpr.name
                        let symbolFlowInfo: SymbolFlowInfo | undefined= _mrState.symbolFlowInfoMap.get(symbol);
                        if (!symbolFlowInfo){
                            let effectiveDeclaredType: RefTypesType | undefined = rhs.type;
                            let effectiveDeclaredTsType: Type;
                            let typeNodeTsType: Type | undefined;
                            if (symbol.valueDeclaration===expr) {
                                // primary
                                if (expr.type) {
                                    typeNodeTsType = checker.getTypeFromTypeNode(expr.type);
                                    effectiveDeclaredTsType = typeNodeTsType;
                                    effectiveDeclaredType = undefined;
                                }
                                else {
                                    /**
                                     * The effectiveDeclaredTsType is always a widened type.
                                     * widenLiteralInitializersInLoop is used inside `` to control whether `initializerType` type is
                                     * used in preference to `effectiveDeclaredType`.
                                     */
                                    const tsType = getTypeFromRefTypesType(rhs.type);
                                    effectiveDeclaredTsType = checker.widenTypeInferredFromInitializer(expr,checker.getFreshTypeOfLiteralType(tsType));
                                    effectiveDeclaredType = undefined;
                                }
                            }
                            else {
                                Debug.fail("unexpected");
                            }

                            symbolFlowInfo = {
                                passCount: 0,
                                isconst: isConstVariable(symbol),
                                effectiveDeclaredTsType, //: createRefTypesType(actualDeclaredTsType),
                                initializerType: rhs.type,
                            };
                            if (effectiveDeclaredType) symbolFlowInfo.effectiveDeclaredType = effectiveDeclaredType;
                            if (typeNodeTsType) symbolFlowInfo.typeNodeTsType = typeNodeTsType; // TODO KILL
                            _mrState.symbolFlowInfoMap.set(symbol,symbolFlowInfo);
                        }
                        else {
                            // if called more than once, must be in a loop,
                            symbolFlowInfo.passCount++;
                            symbolFlowInfo.initializerType = unionOfRefTypesType([symbolFlowInfo.initializerType!,rhs.type]);
                            if (extraAsserts && expr.type){
                                Debug.assert(symbolFlowInfo.typeNodeTsType);
                                const typeNodeTsType = checker.getTypeFromTypeNode(expr.type);
                                Debug.assert(checker.isTypeRelatedTo(typeNodeTsType,symbolFlowInfo.typeNodeTsType, checker.getRelations().identityRelation));
                            }
                            if (!expr.type){
                                const tsType = getTypeFromRefTypesType(symbolFlowInfo.initializerType);
                                symbolFlowInfo.effectiveDeclaredTsType = checker.widenTypeInferredFromInitializer(expr,checker.getFreshTypeOfLiteralType(tsType));
                                delete symbolFlowInfo.effectiveDeclaredType; // will be created on demand if necessary
                            }
                            // In _caxnc-rp-003 this happens because a statement get thrown into the heap on multiple occasions. See ISSUE.md
                            // Debug.fail("unexpected: VariableDeclaration symbolFlowInfo already exists");
                        }
                        if (extraAsserts){
                            debugDevExpectEffectiveDeclaredType(expr.parent,symbolFlowInfo);
                        }
                        const isconstVar = symbolFlowInfo.isconst; // isConstVariable(symbol);
                        if (refTypesSymtabIn.has(symbol)){
                            Debug.assert("unexpected"); // because symbols are removed as they go out of scope in processLoop.
                        }

                        if (isconstVar){
                            const replayableItem: ReplayableItem = {
                                expr: expr.initializer,
                                symbol,
                                isconst: isconstVar,
                                nodeToTypeMap: new Map<Node,Type>(inferStatus.groupNodeToTypeMap)
                            };
                            symbolFlowInfo.replayableItem = replayableItem;
                            inferStatus.replayables.set(symbol,replayableItem);
                            if (getMyDebug()){
                                const shdr = `mrNarrowTypesInner[dbg] case SyntaxKind.VariableDeclaration +replayable `;
                                consoleLog(shdr);
                                const as: string[]=[];
                                as.push(`symbol: ${dbgSymbolToStringSimple(replayableItem.symbol)}, isconst: ${replayableItem.isconst}`);
                                as.push(`expr: ${dbgNodeToString(replayableItem.expr)}`);
                                as.forEach(s=>consoleLog(`${shdr}: ${s}`));
                            };
                            return {unmerged:[{
                                kind:RefTypesTableKind.return,
                                //symbol,  // TODO: symbol will be needed in cases where an isconst is not replayable (currently never).
                                type:rhs.type,
                                sci:{
                                    symtab: refTypesSymtabIn,
                                    constraintItem: constraintItemIn
                                }
                            }]};
                        }
                        const passing = rhs as RefTypesTableReturn;
                        passing.symbol = symbol;
                        passing.isconst = isconstVar;
                        passing.isAssign = true;
                        return { unmerged:[passing] };
                    }
                    else {
                        // could be binding, or could a proeprty access on the lhs
                        Debug.fail("not yet implemented");
                    }
                }
                break;
                case SyntaxKind.BinaryExpression:{
                    return mrNarrowTypesByBinaryExpression({ sci:{ symtab: refTypesSymtabIn, constraintItem: constraintItemIn }, expr: expr as BinaryExpression, /*crit, */ qdotfallout, inferStatus });
                }
                break;
                case SyntaxKind.TypeOfExpression:{
                    return mrNarrowTypesByTypeofExpression({ sci:{ symtab: refTypesSymtabIn, constraintItem: constraintItemIn }, expr: expr as TypeOfExpression, /*crit, */ qdotfallout, inferStatus });
                    /**
                     * For a TypeOfExpression not as the child of a binary expressionwith ops  ===,!==,==,!=
                     */

                }
                break;
                case SyntaxKind.TrueKeyword:
                case SyntaxKind.FalseKeyword:
                case SyntaxKind.NumericLiteral:
                case SyntaxKind.StringLiteral:{
                    let type: Type;
                    switch (expr.kind){
                        case SyntaxKind.TrueKeyword:
                            type = checker.getTrueType();
                            break;
                        case SyntaxKind.FalseKeyword:
                            type = checker.getFalseType();
                            break;
                        case SyntaxKind.NumericLiteral:
                            type = checker.getNumberLiteralType(Number((expr as any).text ?? getSourceTextOfNodeFromSourceFile(sourceFile,expr)));
                            break;
                        case SyntaxKind.StringLiteral:{
                            let str = (expr as any).text;
                            if (!str) {
                                str = getSourceTextOfNodeFromSourceFile(sourceFile,expr);
                                Debug.assert(str.length>=2);
                                str = str.slice(1,-1);
                            }
                            type = checker.getStringLiteralType(str);
                        }
                            break;
                        default:
                            Debug.fail("unexpected");
                    }
                    return {
                        unmerged: [{
                            kind: RefTypesTableKind.return,
                            symbol: undefined,
                            type: createRefTypesType(type),
                            sci:{
                                symtab: refTypesSymtabIn,
                                constraintItem: constraintItemIn
                            }
                        }]
                    };
                }
                break;
                case SyntaxKind.ArrayLiteralExpression:{
                    // Calling getTypeAtLocation would result in an endless loop
                    // const type: Type = checker.getTypeAtLocation(expr);
                    /**
                     * The array itself is created above the mrNarrowTypes level, in "function checkArrayLiteral", checker.ts.
                     * So we don't set the byNode entry for expr.
                     * However, the variable types within the literal array must be set herein.
                     */
                    assertCastType<Readonly<ArrayLiteralExpression>>(expr);
                    let sci: RefTypesSymtabConstraintItem = { symtab:refTypesSymtabIn,constraintItem:constraintItemIn };
                    for (const e of expr.elements){
                        ({sci}=applyCritNoneUnion(mrNarrowTypes({
                            sci,
                            expr:(e.kind===SyntaxKind.SpreadElement) ? (e as SpreadElement).expression : e,
                            crit:{ kind: InferCritKind.none },
                            qdotfallout: undefined, inferStatus,
                        }),inferStatus.groupNodeToTypeMap));
                    }

                    const arrayType = inferStatus.getTypeOfExpressionShallowRecursion(sci, expr);
                    if (getMyDebug()) consoleLog(`mrNarrowTypesInner[dbg]: case SyntaxKind.ArrayLiteralExpression: arrayType: ${dbgTypeToString(arrayType)}`);
                    return {
                        unmerged: [{
                            kind: RefTypesTableKind.return,
                            type: createRefTypesType(arrayType),
                            sci
                        }]
                    };
                }
                break;
                case SyntaxKind.AsExpression:{
                    assertCastType<Readonly<AsExpression>>(expr);
                    const {expression:lhs,type:typeNode} = expr;
                    const rhs = applyCritNoneUnion(mrNarrowTypes({
                        sci:{
                            symtab: refTypesSymtabIn,
                            constraintItem: constraintItemIn
                        },
                        expr:lhs,
                        crit:{ kind: InferCritKind.none },
                        qdotfallout: undefined, inferStatus,
                    }),inferStatus.groupNodeToTypeMap);
                    // When the typeNode is "const" checker.getTypeFromTypeNode will reparse the whole parent of typeNode expression,
                    // triggering an unwanted recursion in mrNarrowType.  A solution to this problem is to call inferStatus.getTypeOfExpression(expr) instead.
                    // Because that might extra work when typeNode is NOT const, we check first.

                    const {symtab,constraintItem} = rhs.sci;

                    let tstype: Type;
                    if (typeNode.kind===SyntaxKind.TypeReference &&
                        (typeNode as TypeReferenceNode).typeName.kind===SyntaxKind.Identifier &&
                        ((typeNode as TypeReferenceNode).typeName as Identifier).escapedText === "const"){
                        tstype = inferStatus.getTypeOfExpressionShallowRecursion({ symtab, constraintItem }, expr);
                    }
                    else {
                        tstype = checker.getTypeFromTypeNode(typeNode);
                    }
                    return {
                        unmerged: [{
                            kind: RefTypesTableKind.return,
                            type: createRefTypesType(tstype),
                            sci:{ symtab,constraintItem }
                        }]
                    };


                    // const type: Type = checker.getTypeAtLocation(expr);
                }
                break;
                case SyntaxKind.SpreadElement:{
                    Debug.fail("mrNarrowTypesInner[dbg] context of caller is important, getTypeOfExpressionShallowRecursion ignore type.target.readonly");
                }
                break;

                default: Debug.fail("unexpected");
            }
        }

        return mrNarrow;
    } // createMrNarrow
}
