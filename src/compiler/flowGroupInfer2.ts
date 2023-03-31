/* eslint-disable no-double-space */
namespace ts {

    export function isRefTypesTableReturn(x: RefTypesTable): x is RefTypesTableReturn {
        return x.kind===RefTypesTableKind.return;
    }

    export interface MrNarrow {
        mrNarrowTypes({ sci, expr, crit, qdotfallout, inferStatus }: InferRefArgs): MrNarrowTypesReturn;
        createRefTypesSymtab(): RefTypesSymtab;
        copyRefTypesSymtab(symtab: Readonly<RefTypesSymtab>): RefTypesSymtab;
        createRefTypesType(type?: Readonly<Type> | Readonly<Type[]>): RefTypesType;
        dbgRefTypesTypeToString(rt: Readonly<RefTypesType>): string;
        dbgRefTypesTableToStrings(t: RefTypesTable): string[],
        dbgRefTypesSymtabToStrings(t: RefTypesSymtab): string[],
        dbgConstraintItem(ci: Readonly<ConstraintItem>): string[];
        dbgSymbolToStringSimple(symbol: Symbol): string,
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
        // 'checker' has a function 'forEach(t,f)', but it unexpectedly works like 'some' returning immediately if f(t) return a truthy value.
        // Confusingly, 'checker' also has a function 'some(t,f)', that works as expected.
        // TODO: Internally, just use Set until rendering.
        // const forEachTypeIfUnion = <F extends ((t: Type) => any)>(type: Type, f: F)=>{
        //     type.flags & TypeFlags.Union ? (type as UnionType).types.forEach(t => f(t)) : f(type);
        // };
        const typeToString = checker.typeToString;
        const getTypeOfSymbol = checker.getTypeOfSymbol;
        const isArrayType = checker.isArrayType;
        const isArrayOrTupleType = checker.isArrayOrTupleType;
        const getElementTypeOfArrayType = checker.getElementTypeOfArrayType;
        const getReturnTypeOfSignature = checker.getReturnTypeOfSignature;
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
            dbgSignatureToString,
            dbgSymbolToStringSimple,
            dbgTypeToString,
            // @ts-expect-error
            dbgTypeToStringDetail,
        } = createDbgs(checker);

        const {
            getTypeMemberCount,
            forEachTypeIfUnion, //<F extends ((t: Type) => any)>(type: Type, f: F): void ;
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
            //mergeArrRefTypesTableReturnToRefTypesTableReturn,
            createNodeToTypeMap,
            mergeIntoNodeToTypeMaps: mergeIntoMapIntoNodeToTypeMaps,
            unionArrRefTypesSymtab,
            cloneRefTypesType,
            getEffectiveDeclaredType,
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
            return symbolFlowInfo.initializerType ??
                symbolFlowInfo.effectiveDeclaredType ??
                    (symbolFlowInfo.effectiveDeclaredType=createRefTypesType(symbolFlowInfo.effectiveDeclaredTsType));
        }
        /**
         *
         * @param symbol This is a temporary solution - TODO: don't use RefTypesTableLeaf
         * @returns
         */
        function getDeclaredType(symbol: Symbol): RefTypesType {
            return getSymbolFlowInfoInitializerOrDeclaredType(symbol);
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
            else if (crit.kind===InferCritKind.typeof) {
                Debug.fail("unexpected");
            }
            else {
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

        function mrNarrowTypesByTypeofExpression({
            refTypesSymtab:refTypesSymtabIn, expr, /* crit,*/ qdotfallout: _qdotFalloutIn, inferStatus, constraintItem: constraintItemIn
        }: InferRefInnerArgs & {expr: TypeOfExpression}): MrNarrowTypesInnerReturn {
            const rhs = mrNarrowTypes({ sci:{ symtab:refTypesSymtabIn,constraintItem:constraintItemIn }, expr:expr.expression, qdotfallout: undefined, inferStatus, crit:{ kind:InferCritKind.none } });
            const rhsUnmerged = rhs.inferRefRtnType.unmerged!;
            const arrRefTypesTableReturn: RefTypesTableReturn[]=[];
            rhsUnmerged.forEach(rttr=>{
                if (isNeverType(rttr.type)) return;
                if (isNeverConstraint(rttr.sci.constraintItem)) return;
                if (!inferStatus.inCondition){
                    if (rttr.symbol) rttr = andRttrSymbolTypeIntoSymtabConstraint(rttr, inferStatus);
                    const setOfTypeOfStrings = new Set<string>();
                    forEachRefTypesTypeType(rttr.type, t=>{
                        typeToTypeofStrings(t).forEach(s=>setOfTypeOfStrings.add(s));
                    });
                    const arrStringLiteralType: StringLiteralType[]=[];
                    setOfTypeOfStrings.forEach(str=>{
                        arrStringLiteralType.push(checker.getStringLiteralType(str));
                    });
                    arrRefTypesTableReturn.push({
                        ...rttr,
                        type: createRefTypesType(arrStringLiteralType)
                    });
                }
                else {
                    // infreStatus.inCondition is true
                    const mapTypeOfStringToTypes = new Map<string,Set<Type>>();
                    forEachRefTypesTypeType(rttr.type, t=>{
                        const arrTypeOfString = typeToTypeofStrings(t);
                        arrTypeOfString.forEach(typeOfString=>{
                            const got = mapTypeOfStringToTypes.get(typeOfString);
                            if (!got) mapTypeOfStringToTypes.set(typeOfString, new Set<Type>([t]));
                            else got.add(t);
                        });
                    });
                    mapTypeOfStringToTypes.forEach((setOfTypes,typeOfString)=>{
                        const arrTypes: Type[]=[];
                        setOfTypes.forEach(t=>arrTypes.push(t));
                        let tmpRttr = {
                            ...rttr,
                            type: createRefTypesType(arrTypes),
                        };
                        if (tmpRttr.symbol) tmpRttr = andRttrSymbolTypeIntoSymtabConstraint(tmpRttr, inferStatus);
                        arrRefTypesTableReturn.push({
                            ...tmpRttr,
                            type: createRefTypesType(checker.getStringLiteralType(typeOfString)),
                        });
                    });
                }
            });
            return {
                arrRefTypesTableReturn
            };
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
            refTypesSymtab:refTypesSymtabIn, expr:binaryExpression, /* qdotfallout: _qdotFalloutIn, */ inferStatus, constraintItem: constraintItemIn
        }: InferRefInnerArgs & {expr: BinaryExpression}): MrNarrowTypesInnerReturn {
            if (getMyDebug()){
                consoleGroup(`mrNarrowTypesByBinaryExpressionEqualsEquals[in] ${dbgNodeToString(binaryExpression)}`);
            }
            const ret = mrNarrowTypesByBinaryExpressionEquals_aux({ refTypesSymtab:refTypesSymtabIn, expr:binaryExpression, inferStatus, constraintItem: constraintItemIn, qdotfallout:[] });
            if (getMyDebug()){
                consoleLog(`mrNarrowTypesByBinaryExpressionEqualsEquals[out] ${dbgNodeToString(binaryExpression)}`);
                consoleGroupEnd();
            }
            return ret;
        }

        // @ ts-expect-error
        function mrNarrowTypesByBinaryExpressionEquals_aux({
            refTypesSymtab:refTypesSymtabIn, expr:binaryExpression, /* qdotfallout: _qdotFalloutIn, */ inferStatus, constraintItem: constraintItemIn
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
            leftRet.inferRefRtnType.unmerged?.forEach((rttrLeft, _leftIdx)=>{
                let tmpSymtabConstraintLeft: RefTypesSymtabConstraintItem = { symtab:rttrLeft.sci.symtab,constraintItem:rttrLeft.sci.constraintItem };
                // May not need this? - Needed for compilerOptions.mrNarrowConstraintsEnable===false
                if (rttrLeft.symbol){
                    tmpSymtabConstraintLeft = andRttrSymbolTypeIntoSymtabConstraint(rttrLeft, inferStatus).sci;
                }
                if (getMyDebug()){
                    consoleLog(`mrNarrowTypesByBinaryExpressionEqualsEquals[dbg] start right mrNarrowTypes for left#${_leftIdx} `);
                }
                 const rhs1 = mrNarrowTypes({
                    expr:rightExpr, crit:{ kind:InferCritKind.none }, qdotfallout: undefined, inferStatus:{ ...inferStatus, inCondition:true },
                    sci: tmpSymtabConstraintLeft,
                });
                if (getMyDebug()){
                    consoleLog(`mrNarrowTypesByBinaryExpressionEqualsEquals[dbg] end right mrNarrowTypes for left#${_leftIdx} `);
                }
                rhs1.inferRefRtnType.unmerged?.forEach((rttrRight, _rightIdx)=>{
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
                    if (rttrLeft.symbol /* && rttrLeft.isconst && compilerOptions.mrNarrowConstraintsEnable */) {
                        asym.push({ symbol:rttrLeft.symbol, declared: getSymbolFlowInfoInitializerOrDeclaredType(rttrLeft.symbol)! });
                    }
                    if (rttrRight.symbol /* && rttrRight.isconst && compilerOptions.mrNarrowConstraintsEnable */) {
                        asym.push({ symbol:rttrRight.symbol, declared: getSymbolFlowInfoInitializerOrDeclaredType(rttrRight.symbol)! });
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
                            if (rttrLeft.symbol){
                                ({type:_unusedType, sc:scLeftTmp } = andSymbolTypeIntoSymtabConstraint({
                                    symbol:rttrLeft.symbol, isconst: rttrLeft.isconst, type: mismatchLeft,
                                    sc: scTmp,
                                    getDeclaredType,
                                    mrNarrow}));
                            }
                            if (rttrRight.symbol){
                                ({type:_unusedType, sc:scRightTmp } = andSymbolTypeIntoSymtabConstraint({
                                    symbol:rttrRight.symbol, isconst: rttrRight.isconst, type: mismatchRight,
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
                                    if (rttrLeft.symbol){
                                        ({type:_unusedType, sc:scLeftTmp } = andSymbolTypeIntoSymtabConstraint({
                                            symbol:rttrLeft.symbol, isconst: rttrLeft.isconst,
                                            type:mismatchLeft,
                                            sc: scTmp,
                                            getDeclaredType,
                                            mrNarrow}));
                                    }
                                    if (rttrRight.symbol){
                                        ({type:_unusedType, sc:scRightTmp } = andSymbolTypeIntoSymtabConstraint({
                                            symbol:rttrRight.symbol, isconst: rttrRight.isconst,
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
                arrRefTypesTableReturn
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
            const {refTypesSymtab,constraintItem} = args;

            const rhs = mrNarrowTypes({
                sci: { symtab:refTypesSymtab, constraintItem },
                crit: { kind:InferCritKind.none },
                expr: rightExpr,
                inferStatus: { ...args.inferStatus, inCondition: false }, // because the lhs is definitely not const
            });
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
                const sci = copyRefTypesSymtabConstraintItem(rhs.inferRefRtnType.passing.sci);
                sci.symtab = sci.symtab!.setAsAssigned(symbol,rhs.inferRefRtnType.passing.type);
                // const symtab = copyRefTypesSymtab(rhs.inferRefRtnType.passing.sci.symtab!)
                //     .setAsAssigned(symbol,rhs.inferRefRtnType.passing.type);
                return { arrRefTypesTableReturn: [{
                    ...rhs.inferRefRtnType.passing, symbol, sci
                }]};
            }
            else {
                Debug.fail("not yet implemented");
            }
        }


        function mrNarrowTypesByBinaryExpression({
            refTypesSymtab:refTypesSymtabIn, expr:binaryExpression, /* crit,*/ qdotfallout: _qdotFalloutIn, inferStatus, constraintItem: constraintItemIn
        }: InferRefInnerArgs & {expr: BinaryExpression}): MrNarrowTypesInnerReturn {
            const {left:leftExpr,operatorToken,right:rightExpr} = binaryExpression;
            switch (operatorToken.kind) {
                case SyntaxKind.EqualsToken:
                    return mrNarrowTypesByBinaryExpresionAssign({ refTypesSymtab:refTypesSymtabIn, expr:binaryExpression, /* crit,*/ qdotfallout: _qdotFalloutIn, inferStatus, constraintItem: constraintItemIn });
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
                        { refTypesSymtab:refTypesSymtabIn, constraintItem: constraintItemIn, expr:binaryExpression, inferStatus, qdotfallout:[] });
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
                    const leftRet = mrNarrowTypes({
                        sci: { symtab: refTypesSymtabIn, constraintItem: constraintItemIn },
                        crit: { kind:InferCritKind.truthy, alsoFailing:true },
                        expr: leftExpr,
                        inferStatus,
                    });

                    let arrRefTypesTableReturn: RefTypesTableReturn[];
                    if (getMyDebug()) consoleLog(`case SyntaxKind.AmpersandAmpersandToken right (for left passing)`);
                    const leftTrueRightRet = mrNarrowTypes({
                        sci: leftRet.inferRefRtnType.passing.sci,
                        crit: { kind:InferCritKind.truthy, alsoFailing:true },
                        expr: rightExpr,
                        inferStatus,
                    });
                    if (getMyDebug()) consoleLog(`case SyntaxKind.AmpersandAmpersandToken right (for left failing)`);
                    const leftFalseRightRet = mrNarrowTypes({
                        sci: leftRet.inferRefRtnType.failing!.sci,
                        // refTypesSymtab: copyRefTypesSymtab(leftRet.inferRefRtnType.failing!.symtab),
                        crit: { kind:InferCritKind.truthy, alsoFailing:true },
                        expr: rightExpr,
                        inferStatus,
                        // constraintItem: leftRet.inferRefRtnType.failing!.constraintItem
                    });
                    if (operatorToken.kind===SyntaxKind.AmpersandAmpersandToken){
                        arrRefTypesTableReturn = [
                            leftTrueRightRet.inferRefRtnType.passing,
                            leftTrueRightRet.inferRefRtnType.failing!,
                            { ...leftFalseRightRet.inferRefRtnType.passing, type:leftRet.inferRefRtnType.failing!.type },
                            { ...leftFalseRightRet.inferRefRtnType.failing!, type:leftRet.inferRefRtnType.failing!.type }
                        ];
                    }
                    else if (operatorToken.kind===SyntaxKind.BarBarToken){
                        arrRefTypesTableReturn = [
                            { ...leftTrueRightRet.inferRefRtnType.passing, type:leftRet.inferRefRtnType.passing.type },
                            { ...leftTrueRightRet.inferRefRtnType.failing!, type:leftRet.inferRefRtnType.passing.type },
                            leftFalseRightRet.inferRefRtnType.passing,
                            leftFalseRightRet.inferRefRtnType.failing!
                        ];
                    }
                    else Debug.fail("unexpected");
                    arrRefTypesTableReturn.forEach(rttr=>{
                        rttr.symbol=undefined;
                        rttr.isconst=undefined;
                    });
                    return {
                        arrRefTypesTableReturn,
                    };
                }
                    break;
                default:
                    Debug.fail("unexpected");

            }
        }

        // TODO: remove this function
        type CallExpressionHelperPassReturn = & {
            //pass: true,
            arrReTypesTableReturn: RefTypesTableReturnNoSymbol[],
        };
        // TODO: remove this function
        // @ts-expect-error
        function mrNarrowTypesByCallExpressionHelperAttemptOneSetOfSig(
            sigs: readonly Signature[],
            callExpr: CallExpression,
            symtabIn: RefTypesSymtab,
            constraintItemIn: ConstraintItem,
            inferStatusIn: InferStatus
        ): CallExpressionHelperPassReturn {
            const dbgHdr = `mrNarrowTypesByCallExpressionHelperAttemptOneSetOfSig[dbg] `;
            if (sigs.length===0) return { arrReTypesTableReturn:[] };
            const arrReTypesTableReturn: RefTypesTableReturnNoSymbol[]=[];
            let scnext: RefTypesSymtabConstraintItem | undefined = { symtab: symtabIn, constraintItem: constraintItemIn };
            sigs.forEach((sig,_sigIdx) =>{
                if (getMyDebug()){
                    consoleLog(dbgHdr+`sig[${_sigIdx}]${dbgSignatureToString(sig)}`);
                    if (!scnext) consoleLog(dbgHdr+ "scnext is undefined, skip");
                }
                if (!scnext) return;

                const passingTypesPerPositionBySarg: RefTypesType[]=[];  // sargidx
                const passingTypesPerPositionByCarg: RefTypesType[]=[];  // _cargIndex
                let sargidx = -1;
                let sargRestElemType: Type | undefined;
                let sargRestSymbol: Symbol | undefined;
                /**
                 * Matching the arguments should ideally be a forward only matching,
                 * or at worst require a single "lookahead" that can be undone.
                 * Unfortunately, call parameters are not the same as tuples, so the same code cannot be used for both.
                 * This is allowed
                 * > declare function foo(a:number,b:number,...c:number[]):void;
                 * > foo(...[1,2]); // A spread argument must either have a tuple type or be passed to a rest parameter.(2556)
                 * > foo(...([1,2] as [number,number])); // No error
                 * > const tup:[number,number] = [1,2];
                 * > foo(...tup); // No error;
                 * > const tup2:[number,number,number,...number[]] = [1,2,3,4];
                 * > foo(...tup2); // No error;
                 * but I'm not clear on whether the expansion has already taken place before we get here. (Probably not).
                 * TODO: implement the expansion of tuples if required
                 */
                // Even with exactOptionalPropertyTypes: true, undefined can be passed to optional args, but not to a rest element.
                // But that is only because optional parameter types are forcibly OR'd with undefinedType early on.
                // declare function foo(a?:number,b?:number,...c:number[]):void;
                // foo(); // No error
                // foo(undefined); // No error
                // foo(undefined,undefined); // No error
                // foo(undefined,undefined,undefined);
                // //                      ^ // Argument of type 'undefined' is not assignable to parameter of type 'number'.(2345)

                if (signatureHasRestParameter(sig)) {
                    sargRestSymbol = sig.parameters.slice(-1)[0];
                    const sargRestType = getTypeOfSymbol(sig.parameters.slice(-1)[0]);
                    if (isArrayType(sargRestType)) sargRestElemType = getElementTypeOfArrayType(sargRestType)!;
                    Debug.assert(sargRestElemType, "Error: signatureHasRestParameter but couldn't get element type");
                }
                const sigParamsLength = sargRestElemType ? sig.parameters.length -1 : sig.parameters.length;
                const cargs = callExpr.arguments;
                //const cargsNodeToType = createNodeToTypeMap();
                // The symtab and constraint get "reset"(*) for every sig attempt.
                // (*) However, the search continues from the fail branch state at the first failed carg of the predecessor.
                // If there is no non-never first fail, then the search will already have been terminated.
                let sctmp = { ...scnext };
                let scFirstFail: RefTypesSymtabConstraintItem | undefined;
                let signatureReturnType: Type | undefined;

                if (cargs.length < sig.minArgumentCount){
                    if (getMyDebug()){
                        consoleLog(dbgHdr+` _sigIdx:${_sigIdx}, cargs.length (${cargs.length}) < sig.minArgumentCount (${sig.minArgumentCount}), match fail`);
                        return;
                    }
                }

                // fake NodeToTypeMap until passing result is obtained
                const inferStatusTmp = { ...inferStatusIn, groupNodeToTypeMap: createNodeToTypeMap() };

                // TODO: optional params - is that in the symbol or the type or ...?
                const pass = cargs.every((carg,cargidx)=>{
                    sargidx++;
                    if (getMyDebug()){
                        consoleLog(dbgHdr+`[sigi:${_sigIdx},cargi${cargidx},sargi${sargidx}]${dbgNodeToString(carg)}`);
                    }

                    if (sargidx>=sigParamsLength && !sargRestElemType) {
                        if (getMyDebug()){
                            consoleLog(`param mismatch: excess calling parameters starting at ${dbgNodeToString(carg)} in call ${dbgNodeToString(callExpr)}`);
                        }
                        return false;
                    }
                    let targetType: Type;
                    let targetSymbol: Symbol;
                    if (sargidx<sigParamsLength){
                        targetSymbol = sig.parameters[sargidx];
                        targetType = getTypeOfSymbol(targetSymbol);
                    }
                    else {
                        targetSymbol = sargRestSymbol!; // not the element though
                        targetType = sargRestElemType!;
                    }

                    let targetTypeIncludesUndefined = false;
                    forEachTypeIfUnion(targetType, t=>{
                        if (t===undefinedType) targetTypeIncludesUndefined = true;
                    });
                    if (getMyDebug()){
                        if (getMyDebug()){
                            consoleLog(dbgHdr+`[sigi:${_sigIdx},cargi${cargidx},sargi${sargidx}] `
                            +`targetSymbol:${dbgSymbolToStringSimple(targetSymbol)}, targetType:${dbgTypeToString(targetType)}`);
                        }
                        }
                    if (targetType===errorType){
                        if (getMyDebug()) {
                            consoleLog(`Error?: in signature ${
                                sig.declaration?dbgNodeToString(sig.declaration):"???"
                            }, definition of parameter ${targetSymbol.escapedName} is invalid`);
                        }
                        return false;
                    }
                    /**
                     * Check the result is assignable to the signature
                     */
                    const qdotfallout: RefTypesTableReturn[]=[];
                    const { inferRefRtnType: {passing, failing} } = mrNarrowTypes({
                        sci:sctmp,
                        // refTypesSymtab: sctmp.symtab,
                        // constraintItem: sctmp.constraintItem, // this is the constraintItem from mrNarrowTypesByCallExpression arguments
                        expr: carg,
                        crit: {
                            kind: InferCritKind.assignable,
                            target: targetType,
                            // negate: false,
                            alsoFailing:true,
                        },
                        qdotfallout,
                        inferStatus: inferStatusTmp
                    });
                    if (qdotfallout.length && !targetTypeIncludesUndefined){
                        if (getMyDebug()) {
                            consoleLog(
                            `param mismatch: possible type of undefined/null can not be assigned to param ${targetSymbol.escapedName} with type ${typeToString(targetType)}`);
                        }
                        return false;
                    }
                    sctmp = passing.sci;// { symtab:passing.symtab, constraintItem: passing.constraintItem };
                    if (!scFirstFail && !isNeverType(failing!.type)){
                        scFirstFail = failing!.sci; //{ symtab: failing!.symtab, constraintItem: failing!.constraintItem };
                    }
                    if (!passingTypesPerPositionByCarg[cargidx]) passingTypesPerPositionByCarg[cargidx] = passing.type;
                    else mergeToRefTypesType({ source:passing.type, target:passingTypesPerPositionByCarg[cargidx] });

                    if (!passingTypesPerPositionBySarg[sargidx]) passingTypesPerPositionBySarg[sargidx] = passing.type;
                    else mergeToRefTypesType({ source:passing.type, target:passingTypesPerPositionBySarg[sargidx] });
                    return true;
                }); // per carg
                if (pass){
                    if (sig.resolvedReturnType) signatureReturnType = sig.resolvedReturnType;
                    else signatureReturnType = getReturnTypeOfSignature(sig); // TODO: this could be problematic
                    if (getMyDebug()){
                        // Here
                        let str = dbgHdr + "passingPerCarg: ";
                        passingTypesPerPositionByCarg.forEach((type,cidx)=>str+=`[${cidx}] ${dbgRefTypesTypeToString(type)},`);
                        consoleLog(str);
                        str = dbgHdr + "passingPerSarg: ";
                        passingTypesPerPositionBySarg.forEach((type,sidx)=>str+=`[${sidx}] ${dbgRefTypesTypeToString(type)},`);
                        consoleLog(str);
                        str = dbgHdr + `cum sigReturnType: ${dbgTypeToString(signatureReturnType)}`;
                        consoleLog(str);
                    }
                    arrReTypesTableReturn.push({
                            kind: RefTypesTableKind.return,
                            type: createRefTypesType(signatureReturnType),
                            sci:sctmp,
                            // symtab: sctmp.symtab,
                            // constraintItem: sctmp.constraintItem
                    });
                    scnext = scFirstFail;
                    mergeIntoMapIntoNodeToTypeMaps(inferStatusTmp.groupNodeToTypeMap, inferStatusIn.groupNodeToTypeMap);

                }
            });
            return {
                arrReTypesTableReturn
            };
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
            // function createSymbolAndIntoConstraint(cargidx: number,tupleMember: TransientCallArgumentSymbol["tupleMember"] | undefined, type: RefTypesType, ci: ConstraintItem):
            // {symbol: CallArgumentSymbol,constraintItem: ConstraintItem}{
            //     let name = `cargidx:${cargidx}`;
            //     if (tupleMember) name += `indexInTuple:${tupleMember.indexInTuple}`;
            //     const symbol: CallArgumentSymbol = { ... checker.createSymbol(0, name as __String), cargidx };
            //     inferStatus.declaredTypes.set(symbol as Symbol, createRefTypesTableLeaf(symbol as Symbol, /*isconst*/ true, type));
            //     if (tupleMember) symbol.tupleMember = tupleMember;
            //     return { symbol, constraintItem:andSymbolTypeIntoConstraint({ symbol:symbol as Symbol,type,constraintItem:ci, getDeclaredType: createGetDeclaredTypeFn(inferStatus),mrNarrow }) };
            // }

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
                //inferStatus.declaredTypes.set(symbol,createRefTypesTableLeaf(symbol,/**/ true, type));
                return symbol;
            }

            const resolvedCallArguments: CallExpressionResolvedArg[] = [];
            let sctmp: RefTypesSymtabConstraintItem = scIn;
            callExpr.arguments.forEach((carg,cargidx)=>{
            //for (const carg of callExpr.arguments){
                // do something about spreads "...", don't pass "..." to getTypeOfExpressionShallowRec because it doesn't honor "as const"
                if (carg.kind===SyntaxKind.SpreadElement){
                    //
                    const { inferRefRtnType: {passing, unmerged} } = mrNarrowTypes({
                        sci:sctmp,
                        // refTypesSymtab: sctmp.symtab,
                        // constraintItem: sctmp.constraintItem,
                        expr: (carg as SpreadElement).expression,
                        crit: {
                            kind: InferCritKind.none,
                        },
                        qdotfallout:undefined,
                        inferStatus,
                    });

                    const rttr: RefTypesTableReturn = unmerged?.length===1 ? unmerged[0] : passing;
                    sctmp = rttr.sci; //{ symtab: rttr.symtab, constraintItem: rttr.constraintItem };
                    // The type ought to be a tuple or an array
                    const tstype1 = getTypeFromRefTypesType(rttr.type);
                    if (checker.isArrayOrTupleType(tstype1)){
                        if (checker.isTupleType(tstype1)){
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
                                const tupleSymbol = rttr.symbol ?? createTransientCallArgumentSymbol(cargidx, resolvedCallArguments.length,/**/ undefined, rttr.type);
                                // IWOZERE TODO - should not call andSymbolTypeIntoConstraint - DONE
                                ({sc:sctmp}=andSymbolTypeIntoSymtabConstraint({ symbol:tupleSymbol, isconst:true, type:rttr.type,sc:sctmp,mrNarrow,getDeclaredType }));
                                //sctmp.constraintItem = andSymbolTypeIntoConstraint({ symbol:tupleSymbol, type:rttr.type, constraintItem:sctmp.constraintItem, getDeclaredType, mrNarrow });
                            }
                            else {
                                Debug.fail("unexpected");
                            }
                        }
                        else {
                            const type = rttr.type;
                            const tstype = getTypeFromRefTypesType(type);
                            let {symbol,isconst} = rttr;
                            if (!symbol) {
                                isconst = true;
                                symbol = createTransientCallArgumentSymbol(cargidx,resolvedCallArguments.length,/**/ undefined, type);
                            }
                            else Debug.assert(isconst!==undefined);
                            ({sc:sctmp}=andSymbolTypeIntoSymtabConstraint({ symbol,isconst,type,sc:sctmp,mrNarrow,getDeclaredType }));
                            // const symbol: CallArgumentSymbol = rttr.symbol ?? createTransientCallArgumentSymbol(cargidx, resolvedCallArguments.length,/**/ undefined, type);
                            // if (compilerOptions.mrNarrowConstraintsEnable){
                            //     sctmp.constraintItem = andSymbolTypeIntoConstraint({ symbol, type, constraintItem:sctmp.constraintItem, getDeclaredType, mrNarrow });
                            // }
                            resolvedCallArguments.push({ type,tstype,hasSpread:true, symbol, isconst });
                        }
                    }
                }
                else {
                    const { inferRefRtnType: {passing,unmerged} } = mrNarrowTypes({
                        sci:sctmp,
                        // refTypesSymtab: sctmp.symtab,
                        // constraintItem: sctmp.constraintItem, // this is the constraintItem from mrNarrowTypesByCallExpression arguments
                        expr: carg,
                        crit: {
                            kind: InferCritKind.none,
                        },
                        qdotfallout:undefined,
                        inferStatus,
                    });
                    const rttr: RefTypesTableReturn = unmerged?.length===1 ? unmerged[0] : passing;
                    sctmp = rttr.sci; //{ symtab: rttr.symtab, constraintItem: rttr.constraintItem };
                    const type = rttr.type;
                    const tstype = getTypeFromRefTypesType(type);
                    // const name: __String = `carg:${cargidx}` as __String;
                    // const symbol = { ... checker.createSymbol(0,name), cargidx };
                    let {symbol,isconst} = rttr;
                    if (!symbol) {
                        isconst = true;
                        symbol = createTransientCallArgumentSymbol(cargidx,resolvedCallArguments.length,/**/ undefined, type);
                    }
                    else Debug.assert(isconst!==undefined);
                    ({sc:sctmp}=andSymbolTypeIntoSymtabConstraint({ symbol,isconst,type,sc:sctmp,mrNarrow,getDeclaredType }));
                    //const symbol: CallArgumentSymbol = rttr.symbol ?? createTransientCallArgumentSymbol(cargidx,resolvedCallArguments.length,/**/ undefined, type);
                    // if (compilerOptions.mrNarrowConstraintsEnable){
                    //     sctmp.constraintItem = andSymbolTypeIntoConstraint({ symbol, type, constraintItem:sctmp.constraintItem, getDeclaredType, mrNarrow });
                    // }
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

        function mrNarrowTypesByCallExpression({refTypesSymtab:symtabIn, constraintItem: constraintItemIn, expr:callExpr, /* crit,*/ qdotfallout, inferStatus}: InferRefInnerArgs & {expr: CallExpression}): MrNarrowTypesInnerReturn {
            if (getMyDebug()){
                consoleGroup(`mrNarrowTypesByCallExpression[in]`);
            }
            Debug.assert(qdotfallout);
            // First duty is to call the pre-chain, if any.
            const pre = InferRefTypesPreAccess({ refTypesSymtab:symtabIn, constraintItem: constraintItemIn, expr:callExpr, /*crit,*/ qdotfallout, inferStatus });
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
            return { arrRefTypesTableReturn };
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
        function InferRefTypesPreAccess({refTypesSymtab: refTypes, expr: condExpr, /*crit,*/ qdotfallout, inferStatus, constraintItem}: InferRefInnerArgs & {expr: {expression: Expression}}): InferRefTypesPreAccessRtnType{
        if (getMyDebug()){
            consoleGroup(`InferRefTypesPreAccess[in] expr: ${dbgNodeToString(condExpr)}`);
        }
        try{
            const { inferRefRtnType:{ passing, failing, unmerged } } = mrNarrowTypes(
                { sci:{ symtab:refTypes,constraintItem }, expr: condExpr.expression, crit: { kind:InferCritKind.notnullundef, negate: false, alsoFailing:true }, qdotfallout, inferStatus });
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
                return { kind:"immediateReturn", retval: { arrRefTypesTableReturn:[] } };
            }
            const unmergedPassing: RefTypesTableReturn[] = [];
            unmerged?.forEach(rttr=>{
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

        function mrNarrowTypesByPropertyAccessExpression({refTypesSymtab, expr: condExpr, /*crit,*/ qdotfallout, inferStatus, constraintItem}: InferRefInnerArgs): MrNarrowTypesInnerReturn {
            if (getMyDebug()) consoleGroup(`mrNarrowTypesByPropertyAccessExpression[in]`);
            const r = mrNarrowTypesByPropertyAccessExpression_aux({ refTypesSymtab, expr: condExpr, /*crit,*/ qdotfallout, inferStatus, constraintItem });
            if (getMyDebug()) {
                r.arrRefTypesTableReturn.forEach((rttr,idx)=>{
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
        function mrNarrowTypesByPropertyAccessExpression_aux({refTypesSymtab:refTypesSymtabIn, expr, /*crit,*/ qdotfallout, inferStatus, constraintItem}: InferRefInnerArgs): MrNarrowTypesInnerReturn {
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
            const pre = InferRefTypesPreAccess({ refTypesSymtab:refTypesSymtabIn, constraintItem, expr, /* crit,*/ qdotfallout, inferStatus });
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



            // if (getMyDebug()){
            //     consoleLog(`propertyTypes:`);
            //     accessedTypes.forEach(t=> {
            //         consoleLog(`baseType:${typeToString(t.baseType)}, propType:${typeToString(t.type)}, optional:${t.optional}, lookupFail:${t.lookupFail}, readonlyProp: ${t.readonlyProp}, narrowable: ${t.narrowable} `);
            //     });
            //     consoleLog(`end propertyTypes:`);
            // }
            // const hasFailedLookup = accessedTypes.some(x=>x.lookupFail);
            // const hasSuccessLookup = accessedTypes.some(x=>!x.lookupFail);
            // let requirePropertyDefinedForEachSubtype = false;
            // requirePropertyDefinedForEachSubtype = false;
            // if (requirePropertyDefinedForEachSubtype && hasFailedLookup){
            //     if (getMyDebug()) consoleLog(`inferTypesByPropertyAccessExpression[dbg]: Error: some lookup(s) were unsuccessful`);
            // }
            // else if (!hasSuccessLookup){
            //     if (getMyDebug()) consoleLog(`inferTypesByPropertyAccessExpression[dbg]: Error: no lookups were successful`);
            // }
            // const totalType = createRefTypesType();
            // arrRttr.forEach(rttr=>mergeToRefTypesType({ source: rttr.type, target: totalType }));
            //mergeOneIntoNodeToTypeMaps(expr, getTypeFromRefTypesType(totalType), inferStatus.groupNodeToTypeMap);
            return { arrRefTypesTableReturn: arrRttr };
        }


        /**
         *
         * @param arrRttr
         * @param crit
         * @returns
         */

        /**
         * If "rttr.symbol" is defined and "rtti.isconst" is true, then and/simplify "rtti.constraint" and "rtti.symtab"
         * @param rttr
         * @returns type RefTypesTableReturnCritOut which has no "symbol" or "isconst" members.
         */
        function andRttrSymbolTypeIntoSymtabConstraint(rttr: Readonly<RefTypesTableReturn /* & {symbol: Symbol}*/ >, _inferStatus: InferStatus): RefTypesTableReturnNoSymbol {
            Debug.assert(rttr.symbol);
            // eslint-disable-next-line prefer-const
            let { type, sci:{symtab, constraintItem} } = rttr;
            if (!symtab){
                Debug.assert(isRefTypesSymtabConstraintItemNever(rttr.sci));
                type = createRefTypesType(); // never
            }
            else {
                const { symbol, isconst } = rttr;
                if (!(symbol.flags & (SymbolFlags.ConstEnum | SymbolFlags.RegularEnum))){
                    Debug.assert(!isRefTypesSymtabConstraintItemNever(rttr.sci));
                    // @ts-ignore
                    let _unusedType: RefTypesType;
                    // eslint-disable-next-line prefer-const
                    ({type: _unusedType, sc:{ symtab,constraintItem }}=andSymbolTypeIntoSymtabConstraint({ symbol,isconst,type,sc:{ symtab,constraintItem },
                        getDeclaredType,
                        mrNarrow}));
                    if (symbol){
                        // if (isconst && compilerOptions.mrNarrowConstraintsEnable){
                        //     const cover = evalCoverPerSymbol(constraintItem, getDeclaredType, mrNarrow);
                        //     if (extraAsserts){
                        //         Debug.assert(cover.has(rttr.symbol));
                        //     }
                        //     type = cover.get(symbol)!;
                        // }
                        // else {
                        type = symtab!.get(symbol)!;
                        Debug.assert(type);
                        // }
                    }
                }
            }
            return { kind:RefTypesTableKind.return, type, sci:{ symtab, constraintItem } };
        };

        /**
         * "arrRttr" is an array of type RefTypesTableReturn that are implicitly or-ed together - they are alternate assertions about symbol+type constraints.
         * "crit" projects the net or-ed result onto passing and (optionally) failing assertions.
         */
        function applyCritToArrRefTypesTableReturn(arrRttr: Readonly<RefTypesTableReturn[]>, crit: Readonly<InferCrit>, inferStatus: InferStatus): {
            passing: RefTypesTableReturnNoSymbol, failing?: RefTypesTableReturnNoSymbol, unmerged?: Readonly<RefTypesTableReturn[]>
        }{
            //Debug.assert(arrRttr.length);
            arrRttr = arrRttr.filter(rttr=>!isRefTypesSymtabConstraintItemNever(rttr.sci));
            if (arrRttr.length===0) return createNeverPassingFailingUnmerged(!!crit.alsoFailing);
            //Debug.assert(arrRttr.every(rttr=>!isRefTypesSymtabConstraintItemNever(rttr.sci)));
            //const templateSymtab = arrRttr[0].sci.symtab!;
            //const outerSymtab = getOuterSymtab(arrRttr[0].symtab);
            Debug.assert(!(crit.kind===InferCritKind.none && crit.negate));
            if (crit.kind===InferCritKind.none){
                if (arrRttr.length===1){
                    const rttr = arrRttr[0];
                    let passing: RefTypesTableReturnNoSymbol;
                    if (isNeverType(rttr.type) || isNeverConstraint(rttr.sci.constraintItem)){
                        return createNeverPassingFailingUnmerged(!!crit.alsoFailing);
                    }
                    else if (rttr.symbol){
                        const {type,sc} = andSymbolTypeIntoSymtabConstraint({ symbol:rttr.symbol,isconst:rttr.isconst,type:rttr.type, getDeclaredType,
                            sc:rttr.sci, mrNarrow});
                        passing = {
                            kind: RefTypesTableKind.return,
                            type,
                            sci:sc
                        };
                    }
                    else {
                        passing = {
                            kind: RefTypesTableKind.return,
                            type: rttr.type,
                            sci:rttr.sci
                        };
                    }
                    return {
                        passing,
                        unmerged: [rttr]
                    };
                }
            }


            {
                const arrRttrcoPassing: RefTypesTableReturnNoSymbol[] = [];
                const arrRttrcoFailing: RefTypesTableReturnNoSymbol[] = [];
                arrRttr.forEach(rttr=>{
                    if (isNeverConstraint(rttr.sci.constraintItem)) return;
                    let localTypePassing = createRefTypesType();
                    let localTypeFailing = createRefTypesType();
                    applyCritToRefTypesType(rttr.type, crit, (tstype, bpass, bfail)=>{
                        if (bpass) {
                            localTypePassing = addTypeToRefTypesType({ source: tstype, target: localTypePassing });
                        }
                        if (crit.alsoFailing && bfail) {
                            localTypeFailing = addTypeToRefTypesType({ source: tstype, target: localTypeFailing });
                        }
                    });
                    if (!rttr.symbol){
                        if (!isNeverType(localTypePassing)){
                            arrRttrcoPassing.push({
                                kind: RefTypesTableKind.return,
                                type: localTypePassing,
                                sci: rttr.sci,
                            });
                        }
                        if (!isNeverType(localTypeFailing)){
                            arrRttrcoFailing.push({
                                kind: RefTypesTableKind.return,
                                type: localTypeFailing,
                                sci: rttr.sci,
                            });
                        }
                    }
                    else {
                        if (!isNeverType(localTypePassing)){
                            const tmpRttr = andRttrSymbolTypeIntoSymtabConstraint({ ...rttr, type:localTypePassing }, inferStatus);
                            if (!isNeverType(tmpRttr.type) && !isNeverConstraint(tmpRttr.sci.constraintItem)) {
                                arrRttrcoPassing.push(tmpRttr);
                            }
                        }
                        if (!isNeverType(localTypeFailing)){
                            const tmpRttr = andRttrSymbolTypeIntoSymtabConstraint({ ...rttr, type:localTypeFailing }, inferStatus);
                            if (!isNeverType(tmpRttr.type) && !isNeverConstraint(tmpRttr.sci.constraintItem)) {
                                arrRttrcoFailing.push(tmpRttr);
                            }
                        }
                    }
                });
                const rttrcoPassing: RefTypesTableReturnNoSymbol = {
                    kind: RefTypesTableKind.return,
                    sci: createRefTypesSymtabConstraintItemNever(),
                    type: createRefTypesType(), // never
                };
                const arrPassingSC: RefTypesSymtabConstraintItem[] = [];
                arrRttrcoPassing.forEach(rttr2=>{
                    mergeToRefTypesType({ source: rttr2.type, target: rttrcoPassing.type });
                    arrPassingSC.push(rttr2.sci);
                });
                if (arrPassingSC.length===0){
                    rttrcoPassing.sci = createRefTypesSymtabConstraintItemNever();
                }
                else {
                    rttrcoPassing.sci = orSymtabConstraints(arrPassingSC,mrNarrow);
                }

                const rttrcoFailing: RefTypesTableReturnNoSymbol = {
                    kind: RefTypesTableKind.return,
                    sci: createRefTypesSymtabConstraintItemNever(),
                    type: createRefTypesType(), // never
                };
                const arrFailingSC: RefTypesSymtabConstraintItem[] = [];
                arrRttrcoFailing.forEach(rttr2=>{
                    mergeToRefTypesType({ source: rttr2.type, target: rttrcoFailing.type });
                    arrFailingSC.push(rttr2.sci);
                });
                if (arrFailingSC.length===0){
                    rttrcoFailing.sci = createRefTypesSymtabConstraintItemNever();
                }
                else {
                    rttrcoFailing.sci = orSymtabConstraints(arrFailingSC,mrNarrow);
                }
                const rtn: ReturnType<typeof applyCritToArrRefTypesTableReturn>  = { passing:rttrcoPassing };
                if (crit.alsoFailing){
                    rtn.failing = rttrcoFailing;
                }
                rtn.unmerged = arrRttr;
                return rtn;
            }
            Debug.fail("unexpected");
        };

        type PassingFailingUnmerged = & {
            passing: RefTypesTableReturnNoSymbol,
            failing?: RefTypesTableReturnNoSymbol,
            unmerged: RefTypesTableReturn[],
        };

        function createNeverPassingFailingUnmerged(alsoFailing: boolean): PassingFailingUnmerged {
            const ret: Partial<PassingFailingUnmerged> = {
                passing: {
                    kind: RefTypesTableKind.return,
                    type: createRefTypesType(), // never
                    sci: createRefTypesSymtabConstraintItemNever()
                },
                unmerged: [{
                    kind: RefTypesTableKind.return,
                    type: createRefTypesType(), // never
                    sci: createRefTypesSymtabConstraintItemNever()
                }]
            };
            if (alsoFailing){
                ret.failing = {
                    kind: RefTypesTableKind.return,
                    type: createRefTypesType(), // never
                    sci: createRefTypesSymtabConstraintItemNever()
                };
            }
            return ret as PassingFailingUnmerged;
        }

        /**
         * @param param0
         * @returns
         */
        function mrNarrowTypes({sci, expr:expr, inferStatus, crit, qdotfallout }: InferRefArgs): MrNarrowTypesReturn {
            if (!sci.symtab){
                Debug.assert(isRefTypesSymtabConstraintItemNever(sci));
                return { inferRefRtnType: createNeverPassingFailingUnmerged(!!crit.alsoFailing) };
                // const ret: MrNarrowTypesReturn = {
                //     inferRefRtnType: {
                //         passing: {
                //             kind: RefTypesTableKind.return,
                //             type: createRefTypesType(), // never
                //             sci
                //         }
                //     }
                // }
                // if (crit.alsoFailing){
                //     ret.inferRefRtnType.failing = {
                //         kind: RefTypesTableKind.return,
                //         type: createRefTypesType(), // never
                //         sci
                //     };
                // }
                // ret.inferRefRtnType.unmerged = [{
                //     kind: RefTypesTableKind.return,
                //     type: createRefTypesType(), // never
                //     sci
                // }];
            }
            return mrNarrowTypesAux({
                expr,crit,qdotfallout,refTypesSymtab:sci.symtab, constraintItem: sci.constraintItem, inferStatus
            });
        }
        function mrNarrowTypesAux({refTypesSymtab: refTypesSymtabIn, constraintItem: constraintItemIn, expr:expr, inferStatus, crit: critIn, qdotfallout: qdotfalloutIn }: InferRefArgs1): MrNarrowTypesReturn {
            if (getMyDebug()) {
                consoleGroup(`mrNarrowTypes[in] expr:${dbgNodeToString(expr)}, crit:{kind:${critIn.kind},negate:${(critIn as any).negate}}, `
                +`inferStatus:{inCondition:${inferStatus.inCondition}, currentReplayable:${inferStatus.currentReplayableItem?`{symbol:${dbgSymbolToStringSimple(inferStatus.currentReplayableItem.symbol)}}`:undefined}}, `
                +`qdotfalloutIn: ${!qdotfalloutIn ? "<undef>" : `length: ${qdotfalloutIn.length}`}`);
                consoleLog(`mrNarrowTypes[in] refTypesSymtab:`);
                dbgRefTypesSymtabToStrings(refTypesSymtabIn).forEach(str=> consoleLog(`  ${str}`));
                consoleLog(`mrNarrowTypes[in] constraintItemIn:`);
                if (constraintItemIn) dbgConstraintItem(constraintItemIn).forEach(str=> consoleLog(`  ${str}`));
            }
            const qdotfallout = qdotfalloutIn??([] as RefTypesTableReturn[]);
            const innerret = mrNarrowTypesInner({ refTypesSymtab: refTypesSymtabIn, constraintItem: constraintItemIn, expr, qdotfallout,
                inferStatus });
            let finalArrRefTypesTableReturn = innerret.arrRefTypesTableReturn;
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
                    consoleLog(`mrNarrowTypes[dbg]: ${dbgNodeToString(expr)}: Merge the temporary qdotfallout into the array for RefTypesTableReturn before applying crit:`
                    + `{kind:${critIn.kind},negate:${(critIn as any).negate}}`);
                    qdotfallout.forEach((rttr,i)=>{
                        dbgRefTypesTableToStrings(rttr).forEach(str=>{
                            consoleLog(`mrNarrowTypes[dbg]:  qdotfallout[${i}]: ${str}`);
                        });
                    });
                }
                finalArrRefTypesTableReturn = [...qdotfallout, ...innerret.arrRefTypesTableReturn];
            }
            /**
             * Apply the crit before handling the replayResult (if any)
             */
            //const crit = { ...critIn };
            const critret = applyCritToArrRefTypesTableReturn(finalArrRefTypesTableReturn, critIn, inferStatus);

            const nodeType = cloneRefTypesType(critret.passing.type);
            if (critret.failing) mergeToRefTypesType({ source:critret.failing.type, target:nodeType });
            mergeOneIntoNodeToTypeMaps(expr,getTypeFromRefTypesType(nodeType),inferStatus.groupNodeToTypeMap, /*dont skip*/ true);
            const mrNarrowTypesReturn: MrNarrowTypesReturn  = {
                inferRefRtnType: { passing: critret.passing }
            };
            if (critret.failing) mrNarrowTypesReturn.inferRefRtnType.failing=critret.failing;
            if (critret.unmerged) mrNarrowTypesReturn.inferRefRtnType.unmerged=critret.unmerged;

            if (getMyDebug()) {
                consoleLog("mrNarrowTypes[out]: mrNarrowTypesReturn.inferRefRtnType.passing:");
                dbgRefTypesTableToStrings(mrNarrowTypesReturn.inferRefRtnType.passing).forEach(s=>consoleLog("  mrNarrowTypes[dbg]: passing:  "+s));
                consoleLog("mrNarrowTypes[out]:mrNarrowTypesReturn.inferRefRtnType.failing:");
                dbgRefTypesTableToStrings(mrNarrowTypesReturn.inferRefRtnType.failing).forEach(s=>consoleLog("  mrNarrowTypes[dbg]: failing:  "+s));
                if (mrNarrowTypesReturn.inferRefRtnType.unmerged){
                    mrNarrowTypesReturn.inferRefRtnType.unmerged.forEach((rttr,i)=>{
                        dbgRefTypesTableToStrings(rttr).forEach(s=>consoleLog(`  mrNarrowTypes[dbg]: unmerged[${i}]: ${s}`));
                    });
                }
                // consoleGroup("mrNarrowTypes[out] mrNarrowTypesReturn.byNode:");
                inferStatus.groupNodeToTypeMap.forEach((t,n)=>{
                    for(let ntmp = n; ntmp.kind!==SyntaxKind.SourceFile; ntmp=ntmp.parent){
                        if (ntmp===expr){
                            consoleLog(`mrNarrowTypes[out] byNode: node: ${dbgNodeToString(n)}, type: ${typeToString(t)}`);
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

        function mrNarrowTypesInner({refTypesSymtab: refTypesSymtabIn, expr: expr, qdotfallout, inferStatus, constraintItem }: InferRefInnerArgs): MrNarrowTypesInnerReturn {
            if (getMyDebug()){
                consoleGroup(`mrNarrowTypesInner[in] expr:${dbgNodeToString(expr)}, inferStatus:{inCondition:${inferStatus.inCondition}, currentReplayableItem:${inferStatus.currentReplayableItem?`{symbol:${dbgSymbolToStringSimple(inferStatus.currentReplayableItem.symbol)}}`:undefined}`);
                consoleLog(`mrNarrowTypesInner[in] refTypesSymtab:`);
                dbgRefTypesSymtabToStrings(refTypesSymtabIn).forEach(str=> consoleLog(`mrNarrowTypesInner[in] refTypesSymtab:  ${str}`));
                consoleLog(`mrNarrowTypesInner[in] constraintItemIn:`);
                if (constraintItem) dbgConstraintItem(constraintItem).forEach(str=> consoleLog(`mrNarrowTypesInner[in] constraintItemIn:  ${str}`));
            }
            const innerret = mrNarrowTypesInnerAux({ refTypesSymtab: refTypesSymtabIn, expr, qdotfallout, inferStatus, constraintItem });
            if (getMyDebug()){
                innerret.arrRefTypesTableReturn.forEach((rttr,i)=>{
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
                if (innerret.assignmentData){
                    consoleLog(`mrNarrowTypesInner[out]: innerret.assignmentData: { symbol: ${
                        dbgSymbolToStringSimple(innerret.assignmentData?.symbol)
                    }, isconst: ${
                        innerret.assignmentData?.isconst
                    }`);
                }
                else {
                    consoleLog(`mrNarrowTypesInner[out]: innerret.assignmentData: <undef>`);
                }
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
        function mrNarrowTypesInnerAux({refTypesSymtab: refTypesSymtabIn, expr, qdotfallout, inferStatus, constraintItem:constraintItemIn}: InferRefInnerArgs): MrNarrowTypesInnerReturn {
            Debug.assert(!isNeverConstraint(constraintItemIn));
            Debug.assert(refTypesSymtabIn);
            switch (expr.kind){
                /**
                 * Identifier
                 */
                case SyntaxKind.Identifier:{
                    if (getMyDebug()) consoleLog(`mrNarrowTypesInner[dbg] case SyntaxKind.Identifier`);
                    Debug.assert(isIdentifier(expr));

                    const symbol = getResolvedSymbol(expr); // getSymbolOfNode()?

                    // There is a unique symbol for the type undefined - that gets converted directly to the undefined type here.
                    if (checker.isUndefinedSymbol(symbol)){
                        return {
                            arrRefTypesTableReturn:[{
                                kind: RefTypesTableKind.return,
                                type: createRefTypesType(undefinedType),
                                sci: {
                                    symtab: refTypesSymtabIn,
                                    constraintItem: constraintItemIn
                                }
                            }]
                        };
                    }
                    if (symbol.flags & SymbolFlags.Function){
                        return {
                            arrRefTypesTableReturn:[{
                                kind: RefTypesTableKind.return,
                                type: createRefTypesType(getTypeOfSymbol(symbol)),
                                sci: {
                                    symtab: refTypesSymtabIn,
                                    constraintItem: constraintItemIn
                                }
                            }]
                        };
                    }
                    let symbolFlowInfo = _mrState.symbolFlowInfoMap.get(symbol);
                    //Debug.assert(symbolFlowInfo);
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
                        const dummyNodeToTypeMap = new Map<Node,Type>();
                        const rhs = mrNarrowTypes({
                            expr: replayable?.expr,
                            crit: { kind:InferCritKind.none },
                            sci:{
                                symtab: refTypesSymtabIn,
                                constraintItem: constraintItemIn,
                            },
                            qdotfallout: undefined,
                            inferStatus: { ...inferStatus, inCondition:true, currentReplayableItem:replayable, groupNodeToTypeMap: dummyNodeToTypeMap }
                        });
                        if (getMyDebug()){
                            consoleLog(`mrNarrowTypesInner[dbg]: end replay for ${dbgSymbolToStringSimple(symbol)}`);
                        }

                        Debug.assert(!rhs.inferRefRtnType.failing);
                        Debug.assert(rhs.inferRefRtnType.unmerged);
                        // if (inferStatus.inCondition && !inferStatus.accumNodeTypes) return { arrRefTypesTableReturn: rhs.inferRefRtnType.unmerged };
                        if (inferStatus.inCondition) return { arrRefTypesTableReturn: rhs.inferRefRtnType.unmerged };
                        else {
                            const type = rhs.inferRefRtnType.passing.type;
                            const scout: RefTypesSymtabConstraintItem = rhs.inferRefRtnType.passing.sci;
                            return {
                                arrRefTypesTableReturn: [{
                                    ...rhs.inferRefRtnType.passing,
                                    type,
                                    sci: scout,
                                }]
                            };
                        }
                    } // endof if (inferStatus.replayables.has(symbol))
                    let type: RefTypesType | undefined;
                    const isconst = symbolFlowInfo.isconst;
                    type = refTypesSymtabIn.get(symbol) ?? getSymbolFlowInfoInitializerOrDeclaredTypeFromSymbolFlowInfo(symbolFlowInfo);
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
                                //byNode: createNodeToTypeMap().set(expr, tstype),
                                arrRefTypesTableReturn:[{
                                    kind: RefTypesTableKind.return,
                                    // symbol and isconst are not passed back because in replay non-const is treated as a hardwired type
                                    type,
                                    sci:{
                                        symtab: refTypesSymtabIn,
                                        constraintItem: constraintItemIn
                                    }
                                }],
                            };
                        }
                    }
                    const scout: RefTypesSymtabConstraintItem = {
                        symtab: refTypesSymtabIn,
                        constraintItem: constraintItemIn
                    };
                    const rttr: RefTypesTableReturn = {
                        kind: RefTypesTableKind.return,
                        symbol,
                        isconst,
                        type,
                        sci: scout
                    };
                    const mrNarrowTypesInnerReturn: MrNarrowTypesInnerReturn = {
                        arrRefTypesTableReturn: [rttr],
                        assignmentData: {
                            isconst:isconst??false,
                            symbol
                        }
                    };
                    return mrNarrowTypesInnerReturn;

                }
                /**
                 * NonNullExpression
                 */
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
                     const innerret = mrNarrowTypesInner({ refTypesSymtab: refTypesSymtabIn, expr: expr.expression,
                        qdotfallout, inferStatus, constraintItem: constraintItemIn });

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
                        arrRefTypesTableReturn: applyNotNullUndefCritToRefTypesTableReturn(innerret.arrRefTypesTableReturn),
                    };
                }
                case SyntaxKind.ParenthesizedExpression:{
                    if (getMyDebug()) consoleLog(`mrNarrowTypesInner[dbg] case ParenthesizedExpression [start]`);
                    const ret = mrNarrowTypes({
                        sci:{
                            symtab: refTypesSymtabIn,
                            constraintItem: constraintItemIn
                        },
                        expr: (expr as ParenthesizedExpression).expression,
                        crit: { kind: InferCritKind.none },
                        inferStatus
                    });
                    if (getMyDebug()) consoleLog(`mrNarrowTypesInner[dbg] case ParenthesizedExpression [end]`);
                    // TODO: in case of inferStatus.inCondition===true, return ret.inferRefRtnType.unmerged
                    let arrRefTypesTableReturn: Readonly<RefTypesTableReturn[]> = [];
                    if (ret.inferRefRtnType.unmerged){
                        arrRefTypesTableReturn = ret.inferRefRtnType.unmerged!;
                    }
                    else {
                        const arr = [ret.inferRefRtnType.passing];
                        if (ret.inferRefRtnType.failing) arr.push(ret.inferRefRtnType.failing);
                        arrRefTypesTableReturn = arr as Readonly<RefTypesTableReturn[]>;
                    }
                    return {
                        arrRefTypesTableReturn,
                    };
                }
                break;
                /**
                 * ConditionalExpression
                 */
                case SyntaxKind.ConditionalExpression:{
                    if (getMyDebug()) consoleLog(`mrNarrowTypesInner[dbg] case SyntaxKind.ConditionalExpression`);
                    const {condition, whenTrue, whenFalse} = (expr as ConditionalExpression);
                    if (getMyDebug()) consoleLog(`mrNarrowTypesInner[dbg] case SyntaxKind.ConditionalExpression ; condition:${dbgNodeToString(condition)}`);
                    const rcond = mrNarrowTypes({
                        sci:{
                            symtab: refTypesSymtabIn,
                            constraintItem: constraintItemIn
                        },
                        expr: condition,
                        crit: { kind: InferCritKind.truthy, alsoFailing: true },
                        inferStatus: { ...inferStatus, inCondition: true },
                    });

                    if (getMyDebug()) consoleLog(`mrNarrowTypesInner[dbg] case SyntaxKind.ConditionalExpression ; whenTrue`);
                    const retTrue = mrNarrowTypes({
                        sci: rcond.inferRefRtnType.passing.sci,
                        expr: whenTrue,
                        crit: { kind: InferCritKind.none },
                        inferStatus, //: { ...inferStatus, inCondition: true }
                    });

                    if (getMyDebug()) consoleLog(`mrNarrowTypesInner[dbg] case SyntaxKind.ConditionalExpression ; whenFalse`);
                    const retFalse = mrNarrowTypes({
                        sci: rcond.inferRefRtnType.failing!.sci,
                        expr: whenFalse,
                        crit: { kind: InferCritKind.none },
                        inferStatus, //: { ...inferStatus, inCondition: true }
                    });

                    const arrRefTypesTableReturn: RefTypesTableReturn[] = [];
                    arrRefTypesTableReturn.push(retTrue.inferRefRtnType.passing);
                    arrRefTypesTableReturn.push(retFalse.inferRefRtnType.passing);
                    const retval: MrNarrowTypesInnerReturn = {
                        arrRefTypesTableReturn
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
                    return mrNarrowTypesByPropertyAccessExpression({ refTypesSymtab: refTypesSymtabIn, expr, /* crit, */ qdotfallout, inferStatus, constraintItem: constraintItemIn });
                /**
                 * CallExpression
                 */
                case SyntaxKind.CallExpression:{
                    if (getMyDebug()) consoleLog(`mrNarrowTypesInner[dbg] case SyntaxKind.CallExpression`);
                    Debug.assert(isCallExpression(expr));
                    return mrNarrowTypesByCallExpression({ refTypesSymtab: refTypesSymtabIn, expr, /*crit, */ qdotfallout, inferStatus, constraintItem: constraintItemIn });
                }
                case SyntaxKind.PrefixUnaryExpression:
                    if ((expr as PrefixUnaryExpression).operator === SyntaxKind.ExclamationToken) {
                        const ret = mrNarrowTypes({
                            sci:{ symtab:refTypesSymtabIn, constraintItem:constraintItemIn },
                            expr:(expr as PrefixUnaryExpression).operand,
                            crit:{ negate: true, kind: InferCritKind.truthy, alsoFailing: true },
                            qdotfallout: undefined, inferStatus: { ...inferStatus, inCondition: true },
                        });
                        /**
                         * The crit was already set with negate: true to reverse the passing and failing.
                         * Below, the symbols are set to undefined, and the types converted to booleans.
                         */
                        const nodeTypes: Type[] = [];
                        //ret.inferRefRtnType.passing.symbol = undefined;
                        if (!isNeverType(ret.inferRefRtnType.passing.type)){
                            const ttype = checker.getTrueType();
                            nodeTypes.push(ttype);
                            ret.inferRefRtnType.passing.type = createRefTypesType(ttype);
                        }
                        //ret.inferRefRtnType.failing!.symbol = undefined;
                        if (!isNeverType(ret.inferRefRtnType.failing!.type)){
                            const ftype = checker.getFalseType();
                            nodeTypes.push(ftype);
                            ret.inferRefRtnType.failing!.type = createRefTypesType(ftype);
                        }
                        //mergeOneIntoNodeToTypeMaps(expr, getUnionType(nodeTypes),inferStatus.groupNodeToTypeMap);
                        return {
                            arrRefTypesTableReturn: [ret.inferRefRtnType.passing, ret.inferRefRtnType.failing!]
                        };
                    }
                    Debug.fail("unexpected");
                    break;
                case SyntaxKind.VariableDeclaration: {
                    Debug.assert(isVariableDeclaration(expr));
                    Debug.assert(expr.initializer);
                    const initializer = expr.initializer;

                    const rhs = mrNarrowTypes({
                        sci:{
                            symtab: refTypesSymtabIn,
                            constraintItem: constraintItemIn
                        },
                        expr:initializer, crit:{ kind: InferCritKind.none }, qdotfallout:undefined,
                        inferStatus: { ...inferStatus, inCondition: false },
                    });

                    // NOTE: in case of inferStatus.withinLoop, no action should be required here because the effect is already incorporated on the rhs
                    Debug.assert(!rhs.inferRefRtnType.failing);
                    Debug.assert(rhs.inferRefRtnType.unmerged);
                    if (isIdentifier(expr.name)){

                        const symbol = getSymbolOfNode(expr); // not condExpr.name
                        let symbolFlowInfo: SymbolFlowInfo | undefined= _mrState.symbolFlowInfoMap.get(symbol);
                        if (!symbolFlowInfo){
                            let effectiveDeclaredType: RefTypesType | undefined = rhs.inferRefRtnType.passing.type;
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
                                    const tsType = getTypeFromRefTypesType(rhs.inferRefRtnType.passing.type);
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
                                initializerType: rhs.inferRefRtnType.passing.type,
                            };
                            if (effectiveDeclaredType) symbolFlowInfo.effectiveDeclaredType = effectiveDeclaredType;
                            if (typeNodeTsType) symbolFlowInfo.typeNodeTsType = typeNodeTsType; // TODO KILL
                            _mrState.symbolFlowInfoMap.set(symbol,symbolFlowInfo);
                        }
                        else {
                            // if called more than once, must be in a loop,
                            symbolFlowInfo.passCount++;
                            symbolFlowInfo.initializerType = unionOfRefTypesType([symbolFlowInfo.initializerType!,rhs.inferRefRtnType.passing.type]);
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
                        }
                        if (extraAsserts){
                            debugDevExpectEffectiveDeclaredType(expr.parent,symbolFlowInfo);
                        }
                        const isconstVar = symbolFlowInfo.isconst; // isConstVariable(symbol);
                        if (refTypesSymtabIn.has(symbol)){
                            Debug.assert("unexpected"); // because symbols are removed as they go out of scope in processLoop.
                        }

                        if (isconstVar){
                            // Note: not set to symbolTable
                            // TODO: more restrictive
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
                            //mergeOneIntoNodeToTypeMaps(expr,getTypeFromRefTypesType(rhs.inferRefRtnType.passing.type),inferStatus.groupNodeToTypeMap);
                            return {arrRefTypesTableReturn:[{
                                kind:RefTypesTableKind.return,
                                type:rhs.inferRefRtnType.passing.type,
                                sci:{
                                    symtab: refTypesSymtabIn,
                                    constraintItem: constraintItemIn
                                }
                            }]};
                        }
                        const passing = rhs.inferRefRtnType.passing as RefTypesTableReturn;
                        passing.symbol = symbol;
                        passing.isconst = isconstVar;
                        passing.sci.symtab!.setAsAssigned(symbol,passing.type);
                        return { arrRefTypesTableReturn:[passing] };
                    }
                    else {
                        // could be binding, or could a proeprty access on the lhs
                        Debug.fail("not yet implemented");
                    }
                }
                break;
                case SyntaxKind.BinaryExpression:{
                    return mrNarrowTypesByBinaryExpression({ refTypesSymtab: refTypesSymtabIn, constraintItem: constraintItemIn, expr: expr as BinaryExpression, /*crit, */ qdotfallout, inferStatus });
                }
                break;
                case SyntaxKind.TypeOfExpression:{
                    return mrNarrowTypesByTypeofExpression({ refTypesSymtab: refTypesSymtabIn, constraintItem: constraintItemIn, expr: expr as TypeOfExpression, /*crit, */ qdotfallout, inferStatus });
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
                            type = checker.getNumberLiteralType(Number(getSourceTextOfNodeFromSourceFile(sourceFile,expr)));
                            break;
                        case SyntaxKind.StringLiteral:{
                            let str = getSourceTextOfNodeFromSourceFile(sourceFile,expr);
                            Debug.assert(str.length>=2);
                            str = str.slice(1,-1);
                            type = checker.getStringLiteralType(str);
                        }
                            break;
                        default:
                            Debug.fail("unexpected");
                    }
                    return {
                        arrRefTypesTableReturn: [{
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
                        if (e.kind ===SyntaxKind.SpreadElement){
                            assertCastType<SpreadElement>(e);
                            ({inferRefRtnType:{ passing:{sci}}}= mrNarrowTypes({
                                sci,
                                expr:e.expression,
                                crit:{ kind: InferCritKind.none },
                                qdotfallout: undefined, inferStatus,
                            }));
                        }
                        else {
                            ({ inferRefRtnType:{passing:{sci}}} = mrNarrowTypes({
                                sci,
                                expr:e,
                                crit:{ kind: InferCritKind.none },
                                qdotfallout: undefined, inferStatus,
                            }));
                        }
                    }

                    const arrayType = inferStatus.getTypeOfExpressionShallowRecursion(sci, expr);
                    if (getMyDebug()) consoleLog(`mrNarrowTypesInner[dbg]: case SyntaxKind.ArrayLiteralExpression: arrayType: ${dbgTypeToString(arrayType)}`);
                    return {
                        arrRefTypesTableReturn: [{
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
                    const rhs = mrNarrowTypes({
                        sci:{
                            symtab: refTypesSymtabIn,
                            constraintItem: constraintItemIn
                        },
                        expr:lhs,
                        crit:{ kind: InferCritKind.none },
                        qdotfallout: undefined, inferStatus,
                    });
                    // When the typeNode is "const" checker.getTypeFromTypeNode will reparse the whole parent of typeNode expression,
                    // triggering an unwanted recursion in mrNarrowType.  A solution to this problem is to call inferStatus.getTypeOfExpression(expr) instead.
                    // Because that might extra work when typeNode is NOT const, we check first.

                    const {symtab,constraintItem} = rhs.inferRefRtnType.passing.sci;

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
                        arrRefTypesTableReturn: [{
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
