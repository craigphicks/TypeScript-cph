namespace ts {

    // function castType<X>(x: any): x is X {
    //     return true;
    // };
    // @ts-expect-error TS6133: 'x' is declared but its value is never read.
    function assertType<X>(x: any): asserts x is X {};


    export function isRefTypesTableLeaf(x: RefTypesTable): x is RefTypesTableLeaf {
        return x.kind===RefTypesTableKind.leaf;
    }
    export function isRefTypesTableReturn(x: RefTypesTable): x is RefTypesTableReturn {
        return x.kind===RefTypesTableKind.return;
    }
    export function isRefTypesTableNonLeaf(x: RefTypesTable): x is RefTypesTableNonLeaf {
        return x.kind===RefTypesTableKind.nonLeaf;
    }


    export interface MrNarrow {
        mrNarrowTypes({ refTypesSymtab: refTypes, expr: condExpr, crit, qdotfallout, inferStatus }: InferRefArgs): MrNarrowTypesReturn;
        createRefTypesSymtab(): RefTypesSymtab;
        createRefTypesType(type?: Readonly<Type>): RefTypesType;
        dbgRefTypesTypeToString(rt: Readonly<RefTypesType>): string;
        dbgRefTypesTableToStrings(t: RefTypesTable): string[],
        dbgRefTypesSymtabToStrings(t: RefTypesSymtab): string[],
        dbgConstraintItem(ci: ConstraintItem | undefined): string[];
        equalRefTypesTypes(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): boolean;
        mergeToRefTypesType({source,target}: { source: Readonly<RefTypesType>, target: RefTypesType}): void,
        unionOfRefTypesType(types: Readonly<RefTypesType[]>): RefTypesType,
        mergeArrRefTypesTableReturnToRefTypesTableReturn(
            symbol: Symbol | undefined, isconst: boolean | undefined, arr: Readonly<RefTypesTableReturn[]>): RefTypesTableReturn,
        createNodeToTypeMap(): NodeToTypeMap,
        mergeIntoNodeToTypeMaps(source: Readonly<NodeToTypeMap>, target: NodeToTypeMap): void,
        mergeArrRefTypesSymtab(arr: Readonly<RefTypesSymtab>[]): RefTypesSymtab,
        intersectRefTypesTypes(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): RefTypesType,
        //intersectRefTypesTypesIfNotAImpliesB(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): RefTypesType | null;
        intersectRefTypesTypesImplies(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): [RefTypesType, boolean];
        typeImplies(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): boolean;
        isASubsetOfB(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): boolean;
        subtractFromType(subtrahend: Readonly<RefTypesType>, minuend: Readonly<RefTypesType>): RefTypesType;
        isNeverType(t: Readonly<RefTypesType>): boolean,
        isAnyType(t: Readonly<RefTypesType>): boolean,
        isUnknownType(t: Readonly<RefTypesType>): boolean,
        applyCritToRefTypesType<F extends (t: Type, pass: boolean, fail: boolean) => void>(rt: RefTypesType,crit: InferCrit, func: F): void,
        // dbgGetNodeText(node: Node): string,
        // dbgFlowToString(flow: FlowNode | undefined): string,
        // dbgFlowTypeToString(flowType: FlowType): string,
        checker: TypeChecker
    };

    export function createMrNarrow(checker: TypeChecker, _mrState: MrState): MrNarrow {

        const mrNarrow: MrNarrow = {
            mrNarrowTypes,
            createRefTypesSymtab,
            createRefTypesType,
            dbgRefTypesTypeToString,
            dbgRefTypesTableToStrings,
            dbgRefTypesSymtabToStrings,
            dbgConstraintItem,
            equalRefTypesTypes,
            mergeToRefTypesType,
            unionOfRefTypesType,
            mergeArrRefTypesTableReturnToRefTypesTableReturn,
            createNodeToTypeMap,
            mergeIntoNodeToTypeMaps,
            mergeArrRefTypesSymtab,
            intersectRefTypesTypes,
            intersectRefTypesTypesImplies,
            typeImplies,
            isASubsetOfB:typeImplies,
            subtractFromType,
            isNeverType,
            isAnyType,
            isUnknownType,
            applyCritToRefTypesType,
            // dbgGetNodeText,
            // dbgFlowToString,
            // dbgFlowTypeToString,
            checker,
        };


        let myDebug = getMyDebug();

        // function getFlowNodeId(flow: FlowNode): number {
        //     if (!flow.id || flow.id < 0) {
        //         flow.id = getAndIncrNextFlowId();
        //     }
        //     return flow.id;
        // }
        // function dbgGetNodeText(node: Node): string {
        //     return ((node as any).getText && node.pos>=0) ? (node as any).getText() : (node as Identifier).escapedText??"";
        // };
        // function dbgFlowToString(flow: FlowNode | undefined): string {
        //     if (!flow) return "<undef>";
        //     let str = "";
        //     //if (isFlowWithNode(flow)) str += `[${(flow.node as any).getText()}, (${flow.node.pos},${flow.node.end})]`;
        //     str += `[f${getFlowNodeId(flow)}], ${Debug.formatFlowFlags(flow.flags)}, `;
        //     if ((flow as FlowLabel).branchKind) str += `branchKind:${((flow as FlowLabel).branchKind)}, `;
        //     if (isFlowWithNode(flow)) str += dbgNodeToString(flow.node);
        //     if (isFlowJoin(flow)) str += `[joinNode:${dbgNodeToString(flow.joinNode)}`;
        //     return str;
        // };
        // function dbgFlowTypeToString(flowType: FlowType): string {
        //     if (!flowType.flags) return "IncompleteType";
        //     return checker.typeToString(flowType as Type);
        // };



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
        const neverType = checker.getNeverType();
        const undefinedType = checker.getUndefinedType();
        const unknownType = checker.getUnknownType();
        const errorType = checker.getErrorType();
        const nullType = checker.getNullType();
        const stringType = checker.getStringType();
        const numberType = checker.getNumberType();
        const anyType = checker.getAnyType();
        // 'checker' has a function 'forEach(t,f)', but it unexpectedly works like 'some' returning immediately if f(t) return a truthy value.
        // Confusingly, 'checker' also has a function 'some(t,f)', that works as expected.
        // TODO: Internally, just use Set until rendering.
        const forEachTypeIfUnion = <F extends ((t: Type) => any)>(type: Type, f: F)=>{
            type.flags & TypeFlags.Union ? (type as UnionType).types.forEach(t => f(t)) : f(type);
        };
        const typeToString = checker.typeToString;
        const getTypeOfSymbol = checker.getTypeOfSymbol;
        const isArrayType = checker.isArrayType;
        const isArrayOrTupleType = checker.isArrayOrTupleType;
        const getElementTypeOfArrayType = checker.getElementTypeOfArrayType;
        const getReturnTypeOfSignature = checker.getReturnTypeOfSignature;
        const isReadonlyProperty = checker.isReadonlyProperty;
        const isConstVariable = checker.isConstVariable;
        // @ts-ignore-error
        const isConstantReference = checker.isConstantReference;
        // @ts-ignore-error
        const getNodeLinks = checker.getNodeLinks;
        const getUnionType = checker.getUnionType;
        const getResolvedSymbol = checker.getResolvedSymbol; // for Identifiers only
        const getSymbolOfNode = checker.getSymbolOfNode;

        const {
            //dbgGetNodeText,
            //dbgFlowToString,
            //dbgFlowTypeToString,
            dbgNodeToString,
            dbgSignatureToString,
            dbgSymbolToStringSimple,
                //dbgWriteSignatureArray,
            //dbgFlowNodeGroupToString
            //dbgRefTypesRtnToStrings
        } = createDbgs(checker);

        function arrayFromSet<T>(set: Set<T>): T[] {
            // @ts-expect-error 2769
            return Array.from(set.keys()); //as Readonly<T[]>
        }

        // function typeToSet(type: Readonly<Type>): Set<Type> {
        //     const set = new Set<Type>();
        //     forEachTypeIfUnion(type, t=>{
        //         if (t!==neverType) set.add(t);
        //     });
        //     return set;
        // }

        // function setToType(set: Readonly<Set<Type>>): Type {
        //     // @ts-expect-error 2769
        //     return getUnionType(Array.from(set.keys()), UnionReduction.Literal);
        // }

        // @ts-expect-error
        function createRefTypesTypeAny(): RefTypesTypeAny {
            return { _flags: RefTypesTypeFlags.any, _set: undefined };
        }
        function createRefTypesTypeUnknown(): RefTypesTypeUnknown {
            return { _flags: RefTypesTypeFlags.unknown, _set: undefined };
        }
        function createRefTypesType(type?: Readonly<Type>): RefTypesType {
            if (type===anyType) return { _flags: RefTypesTypeFlags.any, _set: undefined };
            if (type===unknownType) return { _flags: RefTypesTypeFlags.unknown, _set: undefined };
            const _set = new Set<Type>();
            if (type===neverType || !type) return { _flags: RefTypesTypeFlags.none, _set };
            forEachTypeIfUnion(type, t=>{
                Debug.assert(t!==neverType);
                Debug.assert(t!==anyType);
                Debug.assert(t!==unknownType);
                _set.add(t);
            });
            return {
                _flags: RefTypesTypeFlags.none,
                _set
            };
        }
        function cloneRefTypesType(t: Readonly<RefTypesType>): RefTypesType{
            return { _flags: t._flags, _set: t._set? new Set(t._set) : undefined } as any as RefTypesType;
        }

        function addTypeToRefTypesType({source:t,target:target}: { source: Readonly<Type>, target: RefTypesType}): void {
            if (target._flags){
                if (target._flags===RefTypesTypeFlags.any) return;
                else if (t===anyType){
                    (target as any as RefTypesTypeAny)._flags=RefTypesTypeFlags.any;
                    return;
                }
                return; // target._flags=RefTypesTypeFlags.unknown
            }
            if (!(t.flags & TypeFlags.Union)) {
                if (t===anyType) {
                    (target as any as RefTypesTypeAny)._set=undefined;
                    (target as any as RefTypesTypeAny)._flags=RefTypesTypeFlags.any;
                }
                else if (t===unknownType){
                    (target as any as RefTypesTypeUnknown)._set=undefined;
                    (target as any as RefTypesTypeUnknown)._flags=RefTypesTypeFlags.unknown;
                }
                else if (t!==neverType) target._set.add(t);
            }
            else {
                // let hadAny = false;
                // let hadUnknown = false;
                forEachTypeIfUnion(t, tt=> {
                    Debug.assert(t!==anyType);
                    Debug.assert(t!==unknownType);
                    // if (t===anyType) hadAny = true;
                    // if (t===unknownType) hadUnknown = true;
                    if (t!==neverType) target._set.add(tt);
                });
                // if (hadAny) {
                //     rt._set.clear();
                //     rt._flags=RefTypesTypeFlags.any;
                // }
                // else if (hadUnknown){
                //     rt._set.clear();
                //     rt._flags=RefTypesTypeFlags.unknown;
                // }
            }
        }
        function mergeToRefTypesType({source,target}: { source: Readonly<RefTypesType>, target: RefTypesType}): void {
            if (isNeverType(source)) return;
            if (isAnyType(source)){
                (target as any as RefTypesTypeAny)._flags = RefTypesTypeFlags.any;
                (target as any as RefTypesTypeAny)._set = undefined;
                return;
            }
            if (isAnyType(target)) return;
            if (isUnknownType(source)){
                (target as any as RefTypesTypeUnknown)._flags = RefTypesTypeFlags.unknown;
                (target as any as RefTypesTypeUnknown)._set = undefined;
                return;
            }
            if (isUnknownType(target)) return;
            (source as RefTypesTypeNormal)._set.forEach(t=>{
               (target as RefTypesTypeNormal)._set.add(t);
            });
        }
        function unionOfRefTypesType(types: Readonly<RefTypesType[]>): RefTypesType {
            let hasUnknown = false;
            const target = createRefTypesType();//never
            for (const type of types){
                if (isAnyType(type)) {
                    return { _flags: RefTypesTypeFlags.any, _set: undefined };
                }
                if (isUnknownType(type)){
                    hasUnknown = true;
                    continue;
                }
                if (hasUnknown) continue;
                (type as RefTypesTypeNormal)._set.forEach(t=>{
                    (target as RefTypesTypeNormal)._set.add(t);
                 });
            }
            if (hasUnknown) return { _flags: RefTypesTypeFlags.unknown, _set: undefined };
            return target;
        }

        /**
         * How to deal with unknown type?
         * If either is never then return never.
         * Else if both are unknown return unknown.
         * Else if either is unknown, and the other is not any, then the answer is a specific non-any type that need to be confirmed before use, but such a category doesn't exist in Typescript.
         * - solutions? (1) return unknown, (2) return the type of other, (3) Debug fail. Start with Debug fail and see what happens.
         * @param a
         * @param b
         * @returns
         */
        function intersectRefTypesTypes(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): RefTypesType {
            if (isAnyType(a)) return cloneRefTypesType(b);
            if (isAnyType(b)) return cloneRefTypesType(a);
            if (isUnknownType(a)||isUnknownType(b)) return createRefTypesTypeUnknown();
            const c = createRefTypesType() as RefTypesTypeNormal;
            (a as RefTypesTypeNormal)._set.forEach(t=>{
                if ((b as RefTypesTypeNormal)._set.has(t)) c._set.add(t);
            });
            return c;
        }
        /**
         * If a is a subset of b returns true, else false.
         * @param a
         * @param b
         */
         function typeImplies(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>) {
            if (isAnyType(a)) return isAnyType(b) ? true : false;
            if (isUnknownType(a)) return false;
            // eslint-disable-next-line no-null/no-null
            if (isAnyType(b)||isUnknownType(b)) return false;
            for (let titer = (a as RefTypesTypeNormal)._set.keys(), ti = titer.next(); !ti.done; ti=titer.next()){
                if (!(b as RefTypesTypeNormal)._set.has(ti.value)) return false;
            }
            return true;
        }
        function intersectRefTypesTypesImplies(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>): [RefTypesType, boolean] {
            // TODO: could be optimized because computations in intersectRefTypesTypes and typeImplies overlap
            return [ intersectRefTypesTypes(a,b), typeImplies(a,b)];
        }
        /**
         * If part of subtrahend set does not exist in minuend it will be ignored.
         * @param subtrahend: the set subtracted from the minuend
         * @param minuend: the set from which the subtrahend set will be removed
         * @returns
         */
        function subtractFromType(subtrahend: Readonly<RefTypesType>, minuend: Readonly<RefTypesType>): RefTypesType {
            if (isNeverType(subtrahend)) return minuend;
            if (isAnyType(subtrahend)) return createRefTypesType(neverType);
            if (isUnknownType(subtrahend)||isUnknownType(minuend)) Debug.fail("inverseType: input is unknownType");
            const c = createRefTypesType() as RefTypesTypeNormal;
            (minuend as RefTypesTypeNormal)._set.forEach(t=>{
                if (!(subtrahend as RefTypesTypeNormal)._set.has(t)) c._set.add(t);
            });
            return c;
        }
        // @ts-ignore-error
        function copyRefTypesType(rt: Readonly<RefTypesType>): RefTypesType {
            const _set = rt._set;
            return { _set: _set? new Set(_set) : undefined, _flags: rt._flags } as RefTypesType;
        }
        function getTypeFromRefTypesType(rt: Readonly<RefTypesType>): Type {
            if (rt._flags===RefTypesTypeFlags.any) return anyType;
            if (rt._flags===RefTypesTypeFlags.unknown) return unknownType;
            if (rt._set.size===0) return neverType;
            return getUnionType(arrayFromSet(rt._set),UnionReduction.Literal);
        }
        function isNeverType(type: Readonly<RefTypesType>): boolean {
            return type._flags===RefTypesTypeFlags.none && type._set.size===0;
        }
        function isAnyType(type: Readonly<RefTypesType>): boolean {
            return type._flags===RefTypesTypeFlags.any;
        }
        function isUnknownType(type: Readonly<RefTypesType>): boolean {
            return type._flags===RefTypesTypeFlags.unknown;
        }
        function forEachRefTypesTypeType<F extends (t: Type) => any>(r: Readonly<RefTypesType>, f: F): void {
            if (r._flags){
                if (r._flags===RefTypesTypeFlags.any) f(anyType);
                else f(unknownType);
            }
            else if (r._set.size===0) f(neverType);
            else r._set.forEach(t=>f(t));
        }
        function equalRefTypesTypes(a: Readonly<RefTypesType>, b: Readonly<RefTypesType>){
            if (a._flags===RefTypesTypeFlags.any || b._flags===RefTypesTypeFlags.any) return true;
            if (a._flags===RefTypesTypeFlags.unknown || b._flags===RefTypesTypeFlags.unknown) return false;
            if (a._flags !== b._flags) return false;
            if (a._set.size !== b._set.size) return false;
            let subset = true;
            a._set.forEach(v=>subset&&=b._set.has(v));
            if (!subset) return false;
            subset = true;
            b._set.forEach(v=>subset&&=a._set.has(v));
            return subset;
        }


        function createRefTypesTableLeaf(symbol: Symbol | undefined , isconst: boolean | undefined, type?: RefTypesType): RefTypesTableLeaf {
            return {
                kind:RefTypesTableKind.leaf,
                symbol, isconst, type: type ?? createRefTypesType()
            };
        }
        // function copyRefTypesTableLeaf(rtt: RefTypesTableLeaf): RefTypesTableLeaf {
        //     return {
        //         ...rtt,
        //         type: copyRefTypesType(rtt.type)
        //     };
        // }
        // // function createRefTypesTableReturn(symbol: Symbol | undefined , isconst: boolean | undefined, type: RefTypesType, symtab: RefTypesSymtab): RefTypesTableReturn {
        //     return {
        //         kind:RefTypesTableKind.return,
        //         symbol, isconst, type, symtab
        //     };
        // }
        // function createRefTypesTableNonLeaf(symbol: Symbol | undefined , isconst: boolean | undefined, preReqByTypeIn: [RefTypesType, RefTypesSymtab][] | ESMap<RefTypesType, RefTypesSymtab>
        //     ): MakeRequired<RefTypesTableNonLeaf, "preReqByType"> {
        //     const preReqByType = isArray(preReqByTypeIn) ? new Map<RefTypesType, RefTypesSymtab>(preReqByTypeIn) : (preReqByTypeIn instanceof Map) ? preReqByTypeIn : Debug.fail("preReqByTypeIn illegal type");
        //     return {
        //         kind: RefTypesTableKind.nonLeaf,
        //         symbol, isconst, preReqByType
        //     };
        // }
        // function getRefTypesTypeFromRefTypesTable(t: Readonly<RefTypesTable>): RefTypesType {
        //     if (isRefTypesTableNonLeaf(t)){
        //         const type = createRefTypesType();
        //         t.preReqByType?.forEach((_,t)=>{
        //             mergeToRefTypesType({ source:t, target:type });
        //         });
        //         return type;
        //     }
        //     else return t.type;
        // }
        // function getTypeFromRefTypesTable(t: Readonly<RefTypesTable>): Type {
        //     return getTypeFromRefTypesType(getRefTypesTypeFromRefTypesTable(t));
        // }
        function createRefTypesSymtab(): RefTypesSymtab {
            return new Map<Symbol, RefTypesSymtabValue>();
        }
        function copyRefTypesSymtab(symtab: Readonly<RefTypesSymtab>): RefTypesSymtab {
            return new Map<Symbol, RefTypesSymtabValue>(symtab);
        }
        /**
         * Does NOT make a copy of target before modification.
         * @param param0
         */
        function mergeIntoRefTypesSymtab({source,target}: { source: Readonly<RefTypesSymtab>, target: RefTypesSymtab }): void {
            const iter=source.values();
            for (let next = iter.next(); !next.done; next=iter.next()){
                mergeLeafIntoRefTypesSymtab({ source: next.value.leaf, target });
            }
        }
        function mergeArrRefTypesSymtab(arr: Readonly<RefTypesSymtab>[]): RefTypesSymtab {
            const target = createRefTypesSymtab();
            const symmap = new Map<Symbol, boolean>();
            arr.forEach(st=>{
                st.forEach((x,sym)=>symmap.set(sym, x.leaf.isconst??false));
            });
            symmap.forEach((isconst,sym)=>{
                arr.forEach(st=>{
                    const x = st.get(sym);
                    const sttype = x ? x?.leaf.type : createRefTypesType(getTypeOfSymbol(sym));
                    const y = target.get(sym);
                    if (y){
                        mergeToRefTypesType({ source:sttype, target:y.leaf.type });
                    }
                    else {
                        const leaf: RefTypesTableLeaf = {
                            kind:RefTypesTableKind.leaf,
                            symbol:sym,
                            isconst,
                            type:sttype
                        };
                        target.set(sym, { leaf });
                    }
                });
            });
            return target;
        }
        function mergeLeafIntoRefTypesSymtab({source,target}: { source: Readonly<RefTypesTableLeaf>, target: RefTypesSymtab }): void {
            if (!source.symbol) return;
            //const sourceSymbol = source.symbol!;
            const got = target.get(source.symbol);
            if (!got) target.set(source.symbol, { leaf: { ... source, type: copyRefTypesType(source.type) } });
            else {
                if (!(!got.leaf.symbol || !!got.leaf.isconst===!!source.isconst)){
                    Debug.assert(!got.leaf.symbol || !!got.leaf.isconst===!!source.isconst);
                }
                mergeToRefTypesType({ source: source.type, target: got.leaf.type });
            }
        }

        // function mergeArrRefTypesTableReturnToRefTypesTableNonLeaf(symbol: Symbol | undefined, isconst: boolean | undefined, arr: Readonly<RefTypesTableReturn[]>): RefTypesTableNonLeaf {
        //     const arrTypeSymtab: [RefTypesType,RefTypesSymtab][] = arr.map(t=>{
        //         return [t.type,t.symtab];
        //     });
        //     return createRefTypesTableNonLeaf(symbol, isconst, arrTypeSymtab);
        // };
        /**
         * Requires: that every RefTypesTableReturn in "arr" have undefined values for symbol and isconst.
         * arr[i].type, for all i, will be merged (union).
         * arr[i].symtab, for all i, will be merged (union).
         * arr[i].constraintItem, for all i, will be merged (union) by joining under a single "or"-kind constraintItem
         *
         * @param symbol
         * @param isconst
         * @param arr
         * @returns
         */
        function mergeArrRefTypesTableReturnToRefTypesTableReturn(symbol: Symbol | undefined, isconst: boolean | undefined, arr: Readonly<RefTypesTableReturn[]>): RefTypesTableReturn {
            if (arr.length===0) Debug.fail("arr.length unexpectedly 0");
            arr.forEach(rttr=>{
                Debug.assert(rttr.symbol===undefined || rttr.symbol===symbol, "rttr.symbol!==undefined");
                Debug.assert(rttr.isconst!==true || rttr.isconst===isconst, "rttr.isconst===true");
            });
            if (arr.length===1){
                return arr[0];
            }
            const type = createRefTypesType();
            const symtab = createRefTypesSymtab();
            const arrConstr: ConstraintItem[]=[];
            arr.forEach(rttr=>{
                mergeToRefTypesType({ source:rttr.type, target:type });
                mergeIntoRefTypesSymtab({ source: rttr.symtab, target: symtab });
                if (rttr.constraintItem) arrConstr.push(rttr.constraintItem);
            });
            const constraintItem = (arrConstr.length === 0) ? undefined : (arrConstr.length === 1) ? arrConstr[0]: createFlowConstraintNodeOr({ constraints: arrConstr });
            return {
                kind: RefTypesTableKind.return,
                symbol,
                isconst,
                type,
                symtab,
                constraintItem
            };
        };

        function dbgRefTypesTypeToString(rt: Readonly<RefTypesType>): string {
            const astr: string[]=[];
            forEachRefTypesTypeType(rt, t=>astr.push(typeToString(t)));
            return astr.join(" | ");
            // return typeToString(getTypeFromRefTypesType(rt));
        }
        function dbgConstraintItem(ci: ConstraintItem | undefined): string[] {
            if (!ci) return ["undefined"];
            const as: string[]=["{"];
            as.push(` kind: ${ci.kind},`);
            if (ci.kind===ConstraintItemKind.never){/**/}
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
        function dbgRefTypesTableToStrings(rtt: RefTypesTable): string[] {
            const as: string[]=["{"];
            as.push(`  kind: ${rtt.kind},`);
            as.push(`  symbol: ${dbgSymbolToStringSimple(rtt.symbol)},`);
            as.push(`  isconst: ${rtt.isconst},`);
            if (isRefTypesTableLeaf(rtt)||isRefTypesTableReturn(rtt)){
                as.push(`  type: ${dbgRefTypesTypeToString(rtt.type)},`);
            }
            if (isRefTypesTableNonLeaf(rtt)){
                as.push("  preReqByType: [");
                rtt.preReqByType?.forEach((symtab,type)=>{
                    as.push("    {");
                    as.push(`      type: ${dbgRefTypesTypeToString(type)}`);
                    dbgRefTypesSymtabToStrings(symtab).forEach((str,i)=>as.push(((i===0)?"      symtab: ":"        ")+str));
                    as.push("    },");
                });
            }
            if (isRefTypesTableReturn(rtt)){
                dbgRefTypesSymtabToStrings(rtt.symtab).forEach((str,i)=>as.push(((i===0)?"  symtab: ":"  ")+str));
                if (!rtt.constraintItem){
                    as.push("  constraintItem: undefined");
                }
                else {
                    const ciss = dbgConstraintItem(rtt.constraintItem);
                    as.push("  constraintItem: " + ciss[0]);
                    ciss.slice(1).forEach(s=>as.push("    "+s));
                }
            }
            as.push("}");
            return as;
        }
        function dbgRefTypesSymtabToStrings(x: RefTypesSymtab): string[] {
            const as: string[]=["["];
            x.forEach((t,_s)=>{
                as.push("  "+dbgRefTypesTableToStrings(t.leaf).join(""));
            });
            as.push("]");
            return as;
        }




        function createNodeToTypeMap(): NodeToTypeMap {
            return new Map<Node,Type>();
        }
        function mergeIntoNodeToTypeMaps(source: Readonly<NodeToTypeMap>, target: NodeToTypeMap): void {
            source.forEach((t,n)=>{
                const gott = target.get(n);
                if (!gott) target.set(n,t);
                else {
                    const tt = getUnionType([gott,t], UnionReduction.Literal);
                    target.set(n,tt);
                }
            });
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
                forEachRefTypesTypeType(rt, type => {
                    if (type===anyType || type===unknownType){
                        func(type, /* pass */ true, /* fail */ true);
                        return;
                    }
                    else if (type===neverType){
                        func(type, /* pass */ false, /* fail */ false);
                        return;
                    }
                    let rel: boolean;
                    if (crit.typeofString===InferCritTypeofStrings.undefined) rel = (type===undefinedType);
                    else if (crit.typeofString===InferCritTypeofStrings.boolean) rel = !!(type.flags & TypeFlags.BooleanLike);
                    else if (crit.typeofString===InferCritTypeofStrings.number) rel = !!(type.flags & TypeFlags.NumberLike);
                    else if (crit.typeofString===InferCritTypeofStrings.bigint) rel = !!(type.flags & TypeFlags.BigIntLike);
                    else if (crit.typeofString===InferCritTypeofStrings.string) rel = !!(type.flags & TypeFlags.StringLike);
                    else if (crit.typeofString===InferCritTypeofStrings.symbol) rel = !!(type.flags & TypeFlags.ESSymbolLike);
                    else if (crit.typeofString===InferCritTypeofStrings.function || crit.typeofString===InferCritTypeofStrings.object) {
                        const isFunc = !!(checker.getSignaturesOfType(type, SignatureKind.Call).length || checker.getSignaturesOfType(type, SignatureKind.Construct).length);
                        const isObj = !!(type.flags & TypeFlags.Object);
                        if (crit.typeofString===InferCritTypeofStrings.function) rel = isFunc;
                        else rel = isObj && !isFunc;
                    }
                    else Debug.fail();
                    if (crit.negate) rel = !rel;
                    func(type, rel, !rel);
                });
            }
            else {
                Debug.assert(false, "", ()=>crit.kind);
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


        /**
         *
         * @param param0
         */
        function mrNarrowTypesByTypeof({
            refTypesSymtab:refTypesSymtabIn, expr: typeofArgExpr, inferStatus: inferStatusIn
        }: Omit<InferRefInnerArgs, "qdotfallout">, negateCrit: boolean, typeString: string): MrNarrowTypesInnerReturn {
            const critTypeofString: InferCritTypeofStrings | undefined = (()=>{
                switch (typeString){
                    case InferCritTypeofStrings.undefined: return InferCritTypeofStrings.undefined;
                    case InferCritTypeofStrings.boolean: return InferCritTypeofStrings.boolean;
                    case InferCritTypeofStrings.number: return InferCritTypeofStrings.number;
                    case InferCritTypeofStrings.bigint: return InferCritTypeofStrings.bigint;
                    case InferCritTypeofStrings.string: return InferCritTypeofStrings.string;
                    case InferCritTypeofStrings.symbol: return InferCritTypeofStrings.symbol;
                    case InferCritTypeofStrings.function: return InferCritTypeofStrings.function;
                    case InferCritTypeofStrings.object: return InferCritTypeofStrings.object;
                }
            })();
            if (!critTypeofString) {
                return {
                    byNode: createNodeToTypeMap().set(typeofArgExpr, errorType),
                    arrRefTypesTableReturn: []
                };
            };
            const {/* inCondition, */ replayItemStack, replayables} = inferStatusIn;
            const { inferRefRtnType: {passing,failing}, byNode } = mrNarrowTypes({
                refTypesSymtab: refTypesSymtabIn,
                expr: typeofArgExpr,
                crit: {
                    kind: InferCritKind.typeof,
                    typeofString: critTypeofString,
                    negate: negateCrit,
                    alsoFailing: true
                },
                qdotfallout: undefined,
                inferStatus: { inCondition:true, replayItemStack, replayables }
            });
            const arrRefTypesTableReturn: RefTypesTableReturn[]=[];
            arrRefTypesTableReturn.push(passing, failing!);
            return {
                byNode,
                arrRefTypesTableReturn
            };
        }


        function mrNarrowTypesByBinaryExpression({
            refTypesSymtab:refTypesSymtabIn, expr:binaryExpression, /* crit,*/ qdotfallout: _qdotFalloutIn, inferStatus, constraintItem: constraintItemIn
        }: InferRefInnerArgs & {expr: BinaryExpression}): MrNarrowTypesInnerReturn {
            const {left:leftExpr,operatorToken,right:rightExpr} = binaryExpression;
            switch (operatorToken.kind) {
                case SyntaxKind.EqualsToken:
                case SyntaxKind.BarBarEqualsToken:
                case SyntaxKind.AmpersandAmpersandEqualsToken:
                case SyntaxKind.QuestionQuestionEqualsToken:
                    Debug.fail("not yet implemented: "+Debug.formatSyntaxKind(binaryExpression.operatorToken.kind));
                    break;
                    //return narrowTypeByTruthiness(narrowType(type, expr.right, assumeTrue), expr.left, assumeTrue);
                case SyntaxKind.EqualsEqualsToken:
                case SyntaxKind.ExclamationEqualsToken:
                case SyntaxKind.EqualsEqualsEqualsToken:
                case SyntaxKind.ExclamationEqualsEqualsToken:
                    if (leftExpr.kind === SyntaxKind.TypeOfExpression || rightExpr.kind === SyntaxKind.TypeOfExpression){
                        let typeofArgExpr: Expression | undefined;
                        let typeofString: string | undefined;
                        if (isTypeOfExpression(leftExpr) && isStringLiteral(rightExpr)){
                            typeofArgExpr = leftExpr.expression;
                            typeofString = rightExpr.text;
                        }
                        else if (isTypeOfExpression(rightExpr) && isStringLiteral(leftExpr)){
                            typeofArgExpr = rightExpr.expression;
                            typeofString = leftExpr.text;
                        }
                        if (typeofArgExpr && typeofString){
                            const negateCrit = operatorToken.kind===SyntaxKind.ExclamationEqualsEqualsToken || operatorToken.kind===SyntaxKind.ExclamationEqualsToken;
                            return mrNarrowTypesByTypeof({ refTypesSymtab:refTypesSymtabIn, expr:typeofArgExpr, inferStatus }, negateCrit, typeofString);
                        }
                        else {
                            // still required to process for side effects
                            const arrRttr: RefTypesTableReturn[]=[];
                            const byNode = createNodeToTypeMap();
                            const rl = mrNarrowTypesInner({ refTypesSymtab:refTypesSymtabIn, expr:leftExpr, qdotfallout: _qdotFalloutIn, inferStatus });
                            const rr = mrNarrowTypesInner({ refTypesSymtab:refTypesSymtabIn, expr:leftExpr, qdotfallout: _qdotFalloutIn, inferStatus });
                            mergeIntoNodeToTypeMaps(rl.byNode, byNode);
                            mergeIntoNodeToTypeMaps(rr.byNode, byNode);
                            arrRttr.push(...rl.arrRefTypesTableReturn);
                            arrRttr.push(...rr.arrRefTypesTableReturn);
                            return {
                                byNode, arrRefTypesTableReturn: arrRttr
                            };
                        }

                    }
                    Debug.fail("not yet implemented: "+Debug.formatSyntaxKind(binaryExpression.operatorToken.kind));
                    break;
                case SyntaxKind.InstanceOfKeyword:
                    Debug.fail("not yet implemented: "+Debug.formatSyntaxKind(binaryExpression.operatorToken.kind));
                    //return narrowTypeByInstanceof(type, expr, assumeTrue);
                    break;
                case SyntaxKind.InKeyword:
                    Debug.fail("not yet implemented: "+Debug.formatSyntaxKind(binaryExpression.operatorToken.kind));
                    break;
                case SyntaxKind.CommaToken:
                    Debug.fail("not yet implemented: "+Debug.formatSyntaxKind(binaryExpression.operatorToken.kind));
                    break;
                case SyntaxKind.BarBarToken:
                case SyntaxKind.AmpersandAmpersandToken:{
                    if (myDebug) consoleLog(`case SyntaxKind.(AmpersandAmpersandToken START`);
                    const {left:leftExpr,right:rightExpr}=binaryExpression;
                    if (myDebug) consoleLog(`case SyntaxKind.(AmpersandAmpersand|BarBar)Token left`);
                    const leftRet = mrNarrowTypes({
                        refTypesSymtab: refTypesSymtabIn,
                        crit: { kind:InferCritKind.truthy, alsoFailing:true },
                        expr: leftExpr,
                        inferStatus,
                        constraintItem: constraintItemIn
                    });
                    const byNode = leftRet.byNode;

                    let constraintItemPassing: ConstraintItem | undefined;
                    let constraintItemFailing: ConstraintItem | undefined;
                    let symtabPassing: RefTypesSymtab | undefined;
                    let symtabFailing: RefTypesSymtab | undefined;
                    if (operatorToken.kind===SyntaxKind.AmpersandAmpersandToken){
                        if (myDebug) consoleLog(`case SyntaxKind.AmpersandAmpersandToken right (for left passing)`);
                        const rightRet = mrNarrowTypes({
                            refTypesSymtab: copyRefTypesSymtab(leftRet.inferRefRtnType.passing.symtab),
                            crit: { kind:InferCritKind.truthy, alsoFailing:true },
                            expr: rightExpr,
                            inferStatus,
                            constraintItem: leftRet.inferRefRtnType.passing.constraintItem
                        });
                        mergeIntoNodeToTypeMaps(rightRet.byNode, byNode);
                        constraintItemPassing = rightRet.inferRefRtnType.passing.constraintItem;
                        constraintItemFailing = orIntoConstraints([leftRet.inferRefRtnType.failing!.constraintItem, rightRet.inferRefRtnType.failing!.constraintItem]);
                        symtabPassing = rightRet.inferRefRtnType.passing.symtab;
                        symtabFailing = mergeArrRefTypesSymtab([leftRet.inferRefRtnType.failing!.symtab, rightRet.inferRefRtnType.failing!.symtab ]);
                    }
                    else if (operatorToken.kind===SyntaxKind.BarBarToken){
                        if (myDebug) consoleLog(`case SyntaxKind.BarBarToken right (for left passing)`);
                        const rightRet = mrNarrowTypes({
                            refTypesSymtab: copyRefTypesSymtab(leftRet.inferRefRtnType.failing!.symtab),
                            crit: { kind:InferCritKind.truthy, alsoFailing:true },
                            expr: rightExpr,
                            inferStatus,
                            constraintItem: leftRet.inferRefRtnType.failing!.constraintItem
                        });
                        mergeIntoNodeToTypeMaps(rightRet.byNode, byNode);
                        constraintItemPassing = orIntoConstraints([leftRet.inferRefRtnType.passing.constraintItem, rightRet.inferRefRtnType.passing.constraintItem]);
                        constraintItemFailing = rightRet.inferRefRtnType.failing!.constraintItem;
                        symtabFailing = rightRet.inferRefRtnType.failing!.symtab;
                        symtabPassing= mergeArrRefTypesSymtab([leftRet.inferRefRtnType.passing.symtab, rightRet.inferRefRtnType.passing.symtab]);
                    }
                    else Debug.fail();
                    return {
                        byNode,
                        arrRefTypesTableReturn:[
                            {
                                kind: RefTypesTableKind.return,
                                symbol: undefined,
                                symtab: symtabPassing,
                                type: createRefTypesType(checker.getTrueType()),
                                constraintItem: constraintItemPassing
                            },
                            {
                                kind: RefTypesTableKind.return,
                                symbol: undefined,
                                symtab: symtabFailing,
                                type: createRefTypesType(checker.getFalseType()),
                                constraintItem: constraintItemFailing
                            },
                        ]
                    };
                }
                    break;
                default:
                    Debug.fail("mrNarrowTypesByBinaryExpression, token kind not yet implemented: "+Debug.formatSyntaxKind(binaryExpression.operatorToken.kind));

            }
    }

        function mrNarrowTypesByCallExpression({refTypesSymtab:refTypesIn, expr:callExpr, /* crit,*/ qdotfallout, inferStatus}: InferRefInnerArgs & {expr: CallExpression}): MrNarrowTypesInnerReturn {
            //return undefined as any as InferRefRtnType;
            Debug.assert(qdotfallout);
            // First duty is to call the precursors
            const pre = InferRefTypesPreAccess({ refTypesSymtab:refTypesIn, expr:callExpr, /*crit,*/ qdotfallout, inferStatus });
            if (pre.kind==="immediateReturn") return pre.retval;
            const prePassing = pre.passing;
            //const prePassingRefTypesType = prePassing.type;
            if (myDebug) {
                consoleLog(`candidates by return of pre: [${prePassing.map(preRttr=>dbgRefTypesTypeToString(preRttr.type)).join(", ")}]`);
                //forEachRefTypesTypeType(prePassingRefTypesType, t => consoleLog(typeToString(t)));
                //consoleLog("end of candidates by return of pre");
            }
            /**
             * Collect all of the individual signatures from each candidate to create a single signature candidate set.
             * PreAccess RefTypesTables should be correlated with signatures
             */
            //const allSigAnd: {sig: Signature, : RefTypesTableReturn}
            const allSigAndContext: {
                sig: Signature,
                preRttr: RefTypesTableReturn,
                //byNode: ESMap<Node, Type>
            }[] = [];

            prePassing.forEach(rttr=>{
                const prePassingRefTypesType = rttr.type;
                forEachRefTypesTypeType(prePassingRefTypesType, (t: Type) => {
                    // ts.Type : getCallSignatures(): readonly Signature[];
                    const sigs = checker.getSignaturesOfType(t, SignatureKind.Call);
                    if (sigs.length===0){
                        if (myDebug) consoleLog(`Error: ${typeToString(t)}, type mismatch, has no call signatures`);
                        // TODO: add error?
                        return;
                    }
                    /**
                     * If the number of sigs is 1 there are no overloads, but if it is more than one than there are overloads.
                     * In case of overloads skip the last one, because it is just union of all the others.
                     */
                    sigs.slice(0,/*Math.max(1, sigs.length-1)*/ sigs.length).forEach(s=>{
                        allSigAndContext.push({
                            sig: s,
                            preRttr: rttr
                        });
                    });
                });
            });

            // const allsigs: Signature[]=[];
            // prePassing.forEach(rttr=>{
            //     const prePassingRefTypesType = rttr.type;
            //     forEachRefTypesTypeType(prePassingRefTypesType, (t: Type) => {
            //         // ts.Type : getCallSignatures(): readonly Signature[];
            //         const sigs = checker.getSignaturesOfType(t, SignatureKind.Call);
            //         if (sigs.length===0){
            //             //someSigLookupFailed = true;
            //             //hadError = true;
            //             // we can still carry on.
            //             if (myDebug) consoleLog(`Error: ${typeToString(t)}, type mismatch, has no call signatures`);
            //             // TODO: add error
            //             return;
            //         }
            //         sigs.forEach(s=>allsigs.push(s));
            //     });
            // });
            /**
             * Perform the argument matching to each signature candidate as a separate virtual branch.
             *
             */
            type MatchedSig = & {
                pass: boolean;
                sig: Readonly<Signature>;
                //refTypesRtn?: RefTypesReturn; // only when pass is true
                signatureReturnType?: Type; // only when pass is true
                symtab?: RefTypesSymtab; // only when pass is true
                byNode?: ESMap<Node,Type>; // only when pass is true
            };
            if (myDebug){
                consoleGroup("allSigAndContext:");
                allSigAndContext.map((x,idx)=>{
                    consoleLog(`[${idx}] type: ${dbgRefTypesTypeToString(x.preRttr.type)}`);
                    consoleLog(`[${idx}] sig: ${dbgSignatureToString(x.sig)}`);
                });
                consoleGroupEnd();
            }

            const matchedSigs = allSigAndContext.map((sigWithContext: Readonly<{
                sig: Signature,
                preRttr: RefTypesTableReturn,
                //byNode: ESMap<Node, Type>
            }>,_sigidx: number): MatchedSig => {
                const {sig, preRttr} = sigWithContext;
                let sargidx = -1;
                let sargRestElemType: Type | undefined;
                let sargRestSymbol: Symbol | undefined;
                //let rtsrtn: RefTypesTable = { rtnType:neverType, refTypes, symbolOfRtnType:undefined };
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
                const cargsNodeToType = createNodeToTypeMap();
                let sigargsRefTypesSymtab = preRttr.symtab;
                let signatureReturnType: Type | undefined;

                const pass = cargs.every((carg,_cargidx)=>{
                    sargidx++;
                    if (sargidx>=sigParamsLength && !sargRestElemType) {
                        if (myDebug){
                            consoleLog(`Deferred Error: excess calling parameters starting at ${dbgNodeToString(carg)} in call ${dbgNodeToString(callExpr)}`);
                        }
                        return false;
                    }
                    //let targetSymbol: Symbol;
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
                    if (targetType===errorType){
                        if (myDebug) {
                            consoleLog(`Error: in signature ${
                                sig.declaration?dbgNodeToString(sig.declaration):"???"
                            }, definition of parameter ${targetSymbol.escapedName} is invalid`);
                        }
                        return false;
                    }
                    /**
                     * Check the result is assignable to the signature
                     */
                    const qdotfallout: RefTypesTableReturn[]=[];
                    const { inferRefRtnType: {passing,failing}, byNode } = mrNarrowTypes({
                        refTypesSymtab: sigargsRefTypesSymtab,
                        expr: carg,
                        crit: {
                            kind: InferCritKind.assignable,
                            target: targetType,
                            // negate: false,
                            alsoFailing:true,
                        },
                        qdotfallout,
                        inferStatus
                    });
                    sigargsRefTypesSymtab = createRefTypesSymtab();
                    mergeIntoRefTypesSymtab({ source:passing.symtab, target: sigargsRefTypesSymtab });
                    //passing.forEach(rttr=>mergeIntoRefTypesSymtab({ source:rttr.symtab, target: sigargsRefTypesSymtab }));
                    //sigargsRefTypesSymtab = passing.symtab;
                    if (qdotfallout.length && !targetTypeIncludesUndefined){
                        consoleLog(
                            `Deferred Error: possible type of undefined/null can not be assigned to param ${targetSymbol.escapedName} with type ${typeToString(targetType)}`);
                        return false;
                    }
                    else if (failing && !isNeverType(failing.type)) {
                        consoleLog(
                            `Deferred Error: possible type of ${
                                typeToString(getTypeFromRefTypesType(failing.type))
                            } can not be assigned to param ${targetSymbol.escapedName} with type ${typeToString(targetType)}`);
                        return false;
                    }
                    mergeIntoNodeToTypeMaps(byNode, cargsNodeToType);
                    return true;
                });
                if (!pass){
                    return { pass:false, sig };
                }
                else {
                    if (sig.resolvedReturnType) signatureReturnType = sig.resolvedReturnType;
                    else signatureReturnType = getReturnTypeOfSignature(sig); // TODO: this could be problematic
                    cargsNodeToType.set(callExpr, signatureReturnType);
                    return { pass:true, sig, signatureReturnType, symtab: sigargsRefTypesSymtab, byNode: cargsNodeToType };
                }
            });

            if (myDebug) {
                matchedSigs.forEach((ms,msidx)=>{
                    consoleGroup(`sig[${msidx}], pass:${ms.pass}, rtnType: ${ms.signatureReturnType ? typeToString(ms.signatureReturnType):"N/A"}}`);
                    consoleGroup(dbgSignatureToString(ms.sig));
                    if (ms.pass){
                        //dbgLogRefTypes();
                    }
                    consoleGroupEnd();
                    consoleGroupEnd();
                });
            }
            const byNode = createNodeToTypeMap();
            // const mapTypeSymtab = new Map<RefTypesType,RefTypesSymtab>();
            const arrRttr: RefTypesTableReturn[]=[];
            const totalType = createRefTypesType();
            matchedSigs.forEach(ms=>{
                if (ms.pass) {
                    const type = createRefTypesType(ms.signatureReturnType);
                    arrRttr.push({
                        kind:RefTypesTableKind.return,
                        symbol:undefined,
                        type,
                        symtab: ms.symtab!
                    });
                    mergeToRefTypesType({ source: type, target: totalType });
                    // mapTypeSymtab.set(createRefTypesType(ms.signatureReturnType), ms.symtab!);
                    mergeIntoNodeToTypeMaps(ms.byNode!, byNode);
                }
            });
            // const refTypesTable: RefTypesTableNonLeaf = createRefTypesTableNonLeaf(/* symbol*/ undefined, /* isconst */ undefined, mapTypeSymtab);
            mergeIntoNodeToTypeMaps(pre.byNode, byNode);
            byNode.set(callExpr, getTypeFromRefTypesType(totalType));
            // /**
            //  * TODO:
            //  * Do something so the queries on CallExpression yield only the passed signatures as valid candidates.
            //  * In no signatures are valid it is an error.
            //  */
            /**
             * Note: if there were no passed signatures then 'never' return type will (should) occur with no extra work.
             */
            return { arrRefTypesTableReturn: arrRttr, byNode };
        }

        type InferRefTypesPreAccessRtnType = & {
            kind: "immediateReturn",
            retval: MrNarrowTypesInnerReturn
        } | {
            kind: "normal",
            passing: RefTypesTableReturn[],
            byNode: ESMap<Node, Type>,
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
            const { inferRefRtnType:{ passing, failing }, byNode:byNodePre } = mrNarrowTypes(
                { refTypesSymtab: refTypes, expr: condExpr.expression, crit: { kind:InferCritKind.notnullundef, negate: false, alsoFailing:true }, qdotfallout, inferStatus,constraintItem });
            //Debug.assert(!_saveByNodeForReplayPre);
            Debug.assert(failing);

            // if (qdotbypass && !isNeverType(failing.type)){
            //     if (isPropertyAccessExpression(condExpr) && condExpr.questionDotToken){
            //         qdotbypass.push(constraints.failing!); // The caller of InferRefTypesPreAccess need deal with this no further.
            //     }
            // }

//            failing.forEach(rttr=>{
                if (!isNeverType(failing.type)){
                    if (isPropertyAccessExpression(condExpr) && condExpr.questionDotToken){
                        qdotfallout.push(failing); // The caller of InferRefTypesPreAccess need deal with this no further.
                    }
                    else {
                        /**
                         * If isNeverType and if !condExpr.questionDotToken, then what should happen to the failing node value in byNode?
                         * Doesn't matter if there is going to be an error anyway.
                         */
                        if (myDebug) consoleLog(`Error: expression ${dbgNodeToString(condExpr)} cannot be applied to undefined or null.  Add '?' or '!' if appropriate.`);
                    }
                }
            // });
            //const passingOut = passing.filter(rttr=>!isNeverType(rttr.type));

            if (isNeverType(passing.type)){
                return { kind:"immediateReturn", retval: { arrRefTypesTableReturn:[], byNode: byNodePre } };
            }
            return { kind:"normal", passing: [passing], byNode: byNodePre };
        }

        function mrNarrowTypesByPropertyAccessExpression({refTypesSymtab, expr: condExpr, /*crit,*/ qdotfallout, inferStatus, constraintItem}: InferRefInnerArgs): MrNarrowTypesInnerReturn {
            if (myDebug) consoleGroup(`mrNarrowTypesByPropertyAccessExpression[in]`);
            const r = mrNarrowTypesByPropertyAccessExpression_aux({ refTypesSymtab, expr: condExpr, /*crit,*/ qdotfallout, inferStatus, constraintItem });
            if (myDebug) {
                consoleLog(`mrNarrowTypesByPropertyAccessExpression[out]`);
                consoleGroupEnd();
            }
            return r;
        }

        /**
         *
         * @param param0
         * @returns
         * TODO: use _constraintItem
         */
        function mrNarrowTypesByPropertyAccessExpression_aux({refTypesSymtab:refTypesSymtabIn, expr: condExpr, /*crit,*/ qdotfallout, inferStatus, constraintItem:_constraintItem}: InferRefInnerArgs): MrNarrowTypesInnerReturn {
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
            //const condExprSymbol = getNodeLinks(condExpr).resolvedSymbol; // may or may not exist
            //if (myDebug && !condExprSymbol) consoleLog(`mrNarrowTypesByPropertyAccessExpression[dbg]: condExpr: ${dbgNodeToString(condExpr)}, getNodeLinks(condExpr).resolvedSymbol is undefined`);
            Debug.assert(isPropertyAccessExpression(condExpr));
            Debug.assert(condExpr.expression);


            const pre = InferRefTypesPreAccess({ refTypesSymtab:refTypesSymtabIn, expr: condExpr, /* crit,*/ qdotfallout, inferStatus });
            if (pre.kind==="immediateReturn") return pre.retval;



            /**
             * Use refTypes from pre.
             */
            //const refTypesSymtab = prePassing.symtab;
            // Debug.assert(condExprSymbol);
            // Debug.assert(refTypes.bySymbol.has(condExprSymbol));
            // const condExprRefType = refTypes.bySymbol.get(condExprSymbol)!;


            /**
             * Each lookup should be treated as a separate virtual branch, with it's own RefTypesReturn, because the crit might distinguish between them.
             * We get by here with arrTypeSymtab, only because the symtab is added to directly: `refTypesSymtab.set(propSymbol, value); `
             *
             * In replayMode, we don't use the node type from byNode here for two reasons -
             * (1) The node type is already squashed so the infer info is lost
             * (2) We don't need it, because the types passed back from preAccess must be correct - identical to what is here (only squashed). Can be verified.
.             * */

            const accessedTypes: {baseType: Type, type: Type, declaredType?: Type, lookupFail?: true, optional: boolean, readonlyProp?: boolean, narrowable?: boolean}[]=[];
            const keystr = condExpr.name.escapedText as string;
            //const arrRttl: RefTypesTableReturn[] = []; //
            const arrTypeSymtab: [RefTypesType,RefTypesSymtab][] = []; //
            const arrRttr: RefTypesTableReturn[]=[];
            pre.passing.forEach(prePassing=>{

                /**
                 * Each prePassing.type is a potential compound type.  For each primitive type of that compound type, a new branch is generated.
                 * For each new branch a RefTypesTableReturn is created and pushed to arrRttr.
                 *
                 */

                const preRefTypesSymtab = prePassing.symtab;
                const preConstraintItemNode = prePassing.constraintItem;
                forEachRefTypesTypeType(prePassing.type, t => {
                    if (t===undefinedType||t===nullType) {
                        Debug.assert(false);
                    }
                    if (!(t.flags & TypeFlags.Object) && t!==stringType){
                        let tstype: Type;
                        if (t===numberType) tstype = errorType;  // special case ERROR TYPE for t===numberType
                        else tstype = undefinedType;
                        const type = createRefTypesType(tstype);
                        accessedTypes.push({ baseType: t, type:tstype, lookupFail: true, optional:false });
                        arrTypeSymtab.push([createRefTypesType(undefinedType), preRefTypesSymtab]);
                        arrRttr.push({
                            kind: RefTypesTableKind.return,
                            symbol: undefined,
                            type,
                            symtab: preRefTypesSymtab,
                            constraintItem: preConstraintItemNode
                        });
                        return;
                    }
                    if (isArrayOrTupleType(t)||t===stringType) {
                        if (keystr==="length") {
                            accessedTypes.push({ baseType: t, type:numberType, optional:false });
                            arrTypeSymtab.push([createRefTypesType(numberType), preRefTypesSymtab]);
                            arrRttr.push({
                                kind: RefTypesTableKind.return,
                                symbol: undefined,
                                type: createRefTypesType(numberType),
                                symtab: preRefTypesSymtab,
                                constraintItem: preConstraintItemNode
                            });
                        }
                        else {
                            accessedTypes.push({ baseType: t, type:undefinedType, lookupFail: true, optional:false });
                            arrTypeSymtab.push([createRefTypesType(undefinedType), preRefTypesSymtab]);
                            arrRttr.push({
                                kind: RefTypesTableKind.return,
                                symbol: undefined,
                                type: createRefTypesType(undefinedType),
                                symtab: preRefTypesSymtab,
                                constraintItem: preConstraintItemNode
                            });
                        };
                        return;
                    }
                    /**
                     * Add propSymbol, resolvedType to a copy of refTypesSymtab
                     *
                     */
                    const propSymbol = checker.getPropertyOfType(t, keystr);
                    if (propSymbol) {
                        let readonlyProp = isReadonlyProperty(propSymbol);
                        const optionalProp = !!(propSymbol.flags & SymbolFlags.Optional);
                        const declaredType = getTypeOfSymbol(propSymbol);
                        //const declaredType = createRefTypesType(getTypeOfSymbol(propSymbol));
                        let resolvedType = createRefTypesType(declaredType);
                        let narrowable = optionalProp || declaredType===anyType || !!(declaredType.flags & TypeFlags.Union);

                        const declarations = propSymbol.declarations;
                        if (declarations){
                            const kind: SyntaxKind = declarations[0].kind;
                            readonlyProp ||= !!(kind===SyntaxKind.MethodSignature); // e.g. { foo():number[]; }, foo cannot be changed
                            narrowable &&= (kind!==SyntaxKind.MethodSignature); // MethodSignature are invariant, including overloads.
                            if (declarations.length>1){
                                Debug.assert(declarations.every(d=>d.kind===SyntaxKind.MethodSignature)); // could only be overloads?
                            }
                        }
                        /**
                         * If narrowable the symbol should be in refTypes
                         */
                        /**
                         * TODO: resolved type should also be narrowed by constraintItemNode.
                         *
                         */
                         let value = preRefTypesSymtab.get(propSymbol);
                        if (value){
                            resolvedType = value.leaf.type;
                            Debug.assert(value.leaf.isconst===readonlyProp);
                        }
                        else {
                            if (myDebug) {
                                consoleLog(`mrNarrowTypesByPropertyAccessExpression[dbg]: adding new symbol to ref types, {symbol:<${
                                    propSymbol.escapedName},${getSymbolId(propSymbol)}>, type ${typeToString(declaredType)}, const:${readonlyProp}`);
                            }
                            value = { leaf: { kind: RefTypesTableKind.leaf, symbol: propSymbol, isconst:readonlyProp, type: resolvedType } };
                            //symtab = copyRefTypesSymtab(refTypesSymtab);
                            //refTypesSymtab.set(propSymbol, value);
                        }
                        arrTypeSymtab.push([resolvedType, preRefTypesSymtab]);
                        accessedTypes.push({ baseType: t, type: getTypeFromRefTypesType(resolvedType), declaredType, optional: optionalProp, readonlyProp, narrowable });
                        arrRttr.push({
                            kind: RefTypesTableKind.return,
                            symbol: propSymbol,
                            isconst: readonlyProp,
                            type: value.leaf.type,
                            symtab: preRefTypesSymtab,
                            constraintItem: preConstraintItemNode
                        });
                    return;
                    }
                    Debug.assert(false);
                });
            });

            if (myDebug){
                consoleLog(`propertyTypes:`);
                accessedTypes.forEach(t=> {
                    consoleLog(`baseType:${typeToString(t.baseType)}, propType:${typeToString(t.type)}, optional:${t.optional}, lookupFail:${t.lookupFail}, readonlyProp: ${t.readonlyProp}, narrowable: ${t.narrowable} `);
                });
                consoleLog(`end propertyTypes:`);
            }
            if (myDebug && inferStatus.replayItemStack.length){
                // verify type is correct
                const checkType = createRefTypesType();
                arrRttr.forEach(x=>mergeToRefTypesType({ source:x.type, target:checkType }));
                //arrTypeSymtab.forEach(x=>mergeToRefTypesType({ source:x[0], target:checkType }));
                const recordedTsType = inferStatus.replayItemStack.slice(-1)[0].nodeToTypeMap.get(condExpr)!;
                Debug.assert(recordedTsType);
                const recordedType = createRefTypesType(recordedTsType);
                if (!equalRefTypesTypes(checkType, recordedType)){
                    equalRefTypesTypes(checkType, recordedType);
                    Debug.fail(`checkType:${dbgRefTypesTypeToString(checkType)} !== recordedType:${dbgRefTypesTypeToString(recordedType)}`);
                }
            }
            // const refTypesTableNonLeaf = createRefTypesTableNonLeaf(/* symbol*/ undefined, /* isconst */ undefined, arrTypeSymtab);
            // if (myDebug){
            //     dbgRefTypesTableToStrings(refTypesTableNonLeaf).forEach(s=>consoleLog(s));
            // }
            const hasFailedLookup = accessedTypes.some(x=>x.lookupFail);
            const hasSuccessLookup = accessedTypes.some(x=>!x.lookupFail);
            let requirePropertyDefinedForEachSubtype = false;
            requirePropertyDefinedForEachSubtype = false;
            if (requirePropertyDefinedForEachSubtype && hasFailedLookup){
                if (myDebug) consoleLog(`inferTypesByPropertyAccessExpression[dbg]: Error: some lookup(s) were unsuccessful`);
            }
            else if (!hasSuccessLookup){
                if (myDebug) consoleLog(`inferTypesByPropertyAccessExpression[dbg]: Error: no lookups were successful`);
            }
            const totalType = createRefTypesType();
            arrRttr.forEach(rttr=>mergeToRefTypesType({ source: rttr.type, target: totalType }));
            pre.byNode.set(condExpr, getTypeFromRefTypesType(totalType));

            return { arrRefTypesTableReturn: arrRttr, byNode: pre.byNode };
        }

        type RefTypesTableReturnCritOut = Omit<RefTypesTableReturn,"symbol">;
        /**
         *
         * @param arrRttr
         * @param crit
         * @returns
         */

        /**
         * If "rttr.symbol" is defined and "rtti.isconst" is true,
         * then and/simplify "rtti.constraint" and "rtti.symtab" with assertion "type of rtti.symbol is in rtti.type"
         * @param rttr
         * @returns type RefTypesTableReturnCritOut which has no "symbol" or "isconst" members.
         *
         */
        const mergeTypeIntoNewSymtabAndNewConstraint = (rttr: Readonly<RefTypesTableReturn /* & {symbol: Symbol}*/ >): RefTypesTableReturnCritOut => {
            Debug.assert(rttr.symbol);
            const { type, symbol, isconst } = rttr;
            let { symtab, constraintItem: tmpConstraintItem } = rttr;
            let setTypeTmp = type;
            if (symbol && isconst) {
                const got = symtab.get(symbol);
                if (got) setTypeTmp = intersectRefTypesTypes(got.leaf.type, type);
                // export function andDistributeDivide({
                //     symbol, type, typeRange, cin, negate, mrNarrow, refCountIn, refCountOut}:
                //     {symbol: Symbol, type: RefTypesType, typeRange: RefTypesType, cin: ConstraintItem | undefined, negate?: boolean | undefined, mrNarrow: MrNarrow, refCountIn: [number], refCountOut: [number]
                // }): ConstraintItem | undefined {
                const declType = createRefTypesType(getTypeOfSymbol(symbol));
                const refCountIn = [0] as [number];
                const refCountOut = [0] as [number];
                tmpConstraintItem = andDistributeDivide({ symbol, type: setTypeTmp, typeRange: declType, cin: tmpConstraintItem, mrNarrow, refCountIn, refCountOut });
                tmpConstraintItem = andIntoConstraint({ symbol, type: setTypeTmp, constraintItem: tmpConstraintItem });
                symtab = copyRefTypesSymtab(rttr.symtab);
                symtab.set(
                    symbol,
                    {leaf: {
                        kind: RefTypesTableKind.leaf,
                        symbol,
                        isconst,
                        type: setTypeTmp,
                    },
                });
            }
            return { kind:RefTypesTableKind.return, symtab, type: setTypeTmp, constraintItem: tmpConstraintItem };
        };

        /**
         * "arrRttr" is an array of type RefTypesTableReturn that are implicitly or-ed together - they are alternate assertions about symbol+type constraints.
         * "crit" projects the net or-ed result onto passing and (optionally) failing assertions.
         * "_inferStatus" is obsolete.
         * The return values {passing, failing} are each arrays of length no larger than 1. (TODO??: return undefined or value instead of array)
         */
        const applyCritToArrRefTypesTableReturn = (arrRttr: Readonly<RefTypesTableReturn[]>, crit: Readonly<InferCrit>, _inferStatus: InferStatus): {
            passing: RefTypesTableReturnCritOut[], failing?: RefTypesTableReturnCritOut[]
        } =>{
            if (arrRttr.length===0) {
                return crit.alsoFailing ? { passing:[], failing:[] } : { passing: [] };
            }
            if (crit.kind===InferCritKind.none && arrRttr.length===1){
                if (!arrRttr[0].symbol) return { passing: [...arrRttr] };
                return { passing: [arrRttr[0]] };
//                return { passing: [mergeTypeIntoNewSymtabAndNewConstraint(arrRttr[0])] };
            }
            if (crit.kind===InferCritKind.none){
                // const arrRttrco: RefTypesTableReturnCritOut[] = arrRttr.map(rttr=> {
                //     if (!rttr.symbol) return rttr;
                //     return mergeTypeIntoNewSymtabAndNewConstraint(rttr);
                // });
                const rttrco: RefTypesTableReturnCritOut = {
                    kind: RefTypesTableKind.return,
                    symtab: createRefTypesSymtab(),
                    type: createRefTypesType(), // never
                    constraintItem: undefined
                };
                const arrConstraint: ConstraintItem[] = [];
                arrRttr.forEach(rttr2=>{
                    mergeIntoRefTypesSymtab({ source:rttr2.symtab, target:rttrco.symtab });
                    mergeToRefTypesType({ source: rttr2.type, target: rttrco.type });
                    if (rttr2.constraintItem) {
                        arrConstraint.push(rttr2.constraintItem);
                    }
                });
                // TODO: There is no simplication here when or'ing together.  However, if any of the or'ed constraints are
                // effectively "always" (i.e., the set of types is complete) then the set of constraints should be removed - i.e. return { passing:[] }
                if (arrConstraint.length===1) rttrco.constraintItem = arrConstraint[0];
                else if (arrConstraint.length) rttrco.constraintItem = createFlowConstraintNodeOr({ constraints: arrConstraint });
                return { passing: [rttrco] };
            }

            {
                const arrRttrcoPassing: RefTypesTableReturnCritOut[] = [];
                const arrRttrcoFailing: RefTypesTableReturnCritOut[] = [];
                arrRttr.forEach(rttr=>{
                    let localSymtabPassing: RefTypesSymtab | undefined;
                    const localTypePassing = createRefTypesType();
                    let localSymtabFailing: RefTypesSymtab | undefined;
                    const localTypeFailing = createRefTypesType();
                    applyCritToRefTypesType(rttr.type, crit, (tstype, bpass, bfail)=>{
                        if (bpass) {
                            addTypeToRefTypesType({ source: tstype, target: localTypePassing });
                            localSymtabPassing = rttr.symtab;
                        }
                        if (crit.alsoFailing && bfail) {
                            addTypeToRefTypesType({ source: tstype, target: localTypeFailing });
                            localSymtabFailing = rttr.symtab;
                        }
                    });
                    if (!rttr.symbol){
                        if (!isNeverType(localTypePassing)){
                            arrRttrcoPassing.push({
                                kind: RefTypesTableKind.return,
                                type: localTypePassing,
                                symtab: localSymtabPassing ?? createRefTypesSymtab(),
                                isconst: rttr.isconst,
                                constraintItem: rttr.constraintItem
                            });
                        }
                        if (!isNeverType(localTypeFailing)){
                            arrRttrcoFailing.push({
                            kind: RefTypesTableKind.return,
                            type: localTypeFailing,
                            symtab: localSymtabFailing ?? createRefTypesSymtab(),
                            isconst: rttr.isconst,
                            constraintItem: rttr.constraintItem
                            });
                        }
                    }
                    else {
                        arrRttrcoPassing.push(mergeTypeIntoNewSymtabAndNewConstraint({
                            kind: RefTypesTableKind.return,
                            symbol: rttr.symbol,
                            type: localTypePassing,
                            symtab: localSymtabPassing ?? createRefTypesSymtab(),
                            isconst: rttr.isconst,
                            constraintItem: rttr.constraintItem
                        }));
                        arrRttrcoFailing.push(mergeTypeIntoNewSymtabAndNewConstraint({
                            kind: RefTypesTableKind.return,
                            symbol: rttr.symbol,
                            type: localTypeFailing,
                            symtab: localSymtabFailing ?? createRefTypesSymtab(),
                            isconst: rttr.isconst,
                            constraintItem: rttr.constraintItem
                        }));

                    }
                });
                const rttrcoPassing: RefTypesTableReturnCritOut = {
                    kind: RefTypesTableKind.return,
                    symtab: createRefTypesSymtab(),
                    type: createRefTypesType(), // never
                    constraintItem: undefined // createFlowConstraintNodeOr({ constraints:[] }),
                };
                const passingOredConstraints: ConstraintItem[] = [];
                arrRttrcoPassing.forEach(rttr2=>{
                    mergeIntoRefTypesSymtab({ source:rttr2.symtab, target:rttrcoPassing.symtab });
                    mergeToRefTypesType({ source: rttr2.type, target: rttrcoPassing.type });
                    if (rttr2.constraintItem) passingOredConstraints.push(rttr2.constraintItem);
                });
                if (isNeverType(rttrcoPassing.type)) rttrcoPassing.constraintItem = createFlowConstraintNever();
                else if (passingOredConstraints.length===1) rttrcoPassing.constraintItem = passingOredConstraints[0];
                else if (passingOredConstraints.length) rttrcoPassing.constraintItem = createFlowConstraintNodeOr({ constraints:passingOredConstraints });
                const rttrcoFailing: RefTypesTableReturnCritOut = {
                    kind: RefTypesTableKind.return,
                    symtab: createRefTypesSymtab(),
                    type: createRefTypesType(), // never
                    constraintItem: undefined // createFlowConstraintNodeOr({ constraints:[] }),
                };
                const failingOredConstraints: ConstraintItem[] = [];
                arrRttrcoFailing.forEach(rttr2=>{
                    mergeIntoRefTypesSymtab({ source:rttr2.symtab, target:rttrcoFailing.symtab });
                    mergeToRefTypesType({ source: rttr2.type, target: rttrcoFailing.type });
                    if (rttr2.constraintItem) failingOredConstraints.push(rttr2.constraintItem);
                });
                if (isNeverType(rttrcoFailing.type)) rttrcoFailing.constraintItem = createFlowConstraintNever();
                if (failingOredConstraints.length===1) rttrcoFailing.constraintItem = failingOredConstraints[0];
                else if (failingOredConstraints.length) rttrcoFailing.constraintItem = createFlowConstraintNodeOr({ constraints:failingOredConstraints });
                const rtn: {
                    passing: RefTypesTableReturnCritOut[], failing?: RefTypesTableReturnCritOut[]
                } = { passing:[rttrcoPassing] };
                if (crit.alsoFailing){
                    rtn.failing = [rttrcoFailing];
                }
                return rtn;
            }
        };

        /**
         *
         * (1) Replay functionality
         *   If !!inferStatus.on, then perform replay iff expr is replayable - which is true when both following
         *     (a) expr is an identifier. property access, or a declaration, and therefore has a symbol
         *     (b) the symbol is in inferStatus.replayables, which is a map from symbols to node-to-type maps.
         *
         * @param param0
         * @returns
         */
        function mrNarrowTypes({refTypesSymtab: refTypesSymtabIn, constraintItem: constraintItemIn, expr:expr, inferStatus, crit: critIn, qdotfallout: qdotfalloutIn }: InferRefArgs): MrNarrowTypesReturn {
            myDebug = getMyDebug();
            if (myDebug) {
                const inReplay = inferStatus.replayItemStack.length;
                const replayItem = inferStatus.replayItemStack.length ? inferStatus.replayItemStack.slice(-1)[0] : undefined;
                    consoleGroup(`mrNarrowTypes[in] condExpr:${dbgNodeToString(expr)}, crit.kind: ${critIn.kind}, crit.negate: ${critIn.negate}, crit.alsoFailing ${
                    critIn.alsoFailing
                }, inferStatus.replayItemStack.length: ${inferStatus.replayItemStack.length}, inferStatus.inCondition: ${inferStatus.inCondition}`);
                if (inReplay) {
                    consoleGroup(`mrNarrowTypes[in] replayData: {symbol: ${replayItem?.symbol}, isconst: ${replayItem?.isconst}, expr: ${replayItem?.expr}}`);
                    consoleLog("mrNarrowTypes[in] replayData.byNode:");
                    replayItem?.nodeToTypeMap.forEach((t,n)=>{
                        consoleLog(`mrNarrowTypes[in]    node: ${dbgNodeToString(n)}, type: ${typeToString(t)}`);
                    });
                    consoleGroupEnd();
                }
                consoleLog(`mrNarrowTypes[in] qdotfalloutIn: ${!qdotfalloutIn ? "<undef>" : `length: ${qdotfalloutIn.length}`}`);
                consoleLog(`mrNarrowTypes[in] refTypesSymtab:`);
                dbgRefTypesSymtabToStrings(refTypesSymtabIn).forEach(str=> consoleLog(`  ${str}`));
                consoleLog(`mrNarrowTypes[in] constraintItemIn:`);
                if (constraintItemIn) dbgConstraintItem(constraintItemIn).forEach(str=> consoleLog(`  ${str}`));
            }
            const savedInCondition = inferStatus.inCondition ;
            const inCondition = inferStatus.inCondition || critIn.kind!==InferCritKind.none;
            if (inCondition && !inferStatus.inCondition) inferStatus.inCondition = true;
            /**
             * Judge whether expr refers to a replayable
             */
            let newReplayItem: ReplayableItem | undefined;
            if (isIdentifier(expr) && inferStatus.inCondition){
                const symbol = getResolvedSymbol(expr);
                const got = inferStatus.replayables.get(symbol);
                if (got) {
                    /**
                     * Replace the replay data
                     */
                    newReplayItem = got;
                    inferStatus.replayItemStack.push(got);
                    if (myDebug){
                        consoleLog("mrNarrowTypes[dbg] new replayable detected");
                        consoleGroup(`mrNarrowTypes[dbg] newReplayItem: {symbol: ${newReplayItem?.symbol}, isconst: ${newReplayItem?.isconst}, expr: ${newReplayItem?.expr}}`);
                        consoleLog("mrNarrowTypes[dbg] newReplayItem.byNode:");
                        newReplayItem?.nodeToTypeMap.forEach((t,n)=>{
                            consoleLog(`mrNarrowTypes[dbg]    node: ${dbgNodeToString(n)}, type: ${typeToString(t)}`);
                        });
                        consoleGroupEnd();
                    }
                    Debug.fail(); // use of replay obviated by constraints
                }
                else {
                    if (myDebug) consoleLog("mrNarrowTypes[dbg] new replayable NOT detected");
                }
            }

            const qdotfallout = qdotfalloutIn??([] as RefTypesTableReturn[]);
            const replaySymtab = newReplayItem ? createRefTypesSymtab() : undefined;
            // const replayQotfallout = newReplayItem ? [] : qdotfallout;

            // const qdotbypass = qdotbypassIn??[] as TypeAndConstraint[];

            const innerret = mrNarrowTypesInner({ refTypesSymtab: replaySymtab??refTypesSymtabIn, constraintItem: constraintItemIn, expr: newReplayItem?.expr?? expr, qdotfallout,
                inferStatus });

            if (newReplayItem) inferStatus.replayItemStack.pop();
            inferStatus.inCondition = savedInCondition;


            let finalArrRefTypesTableReturn = innerret.arrRefTypesTableReturn;
            if (myDebug){
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
                if (myDebug){
                    consoleLog("mrNarrowTypes[dbg]: Merge the temporary qdotfallout into the array for RefTypesTableReturn before applying crit");
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
            const crit = { ...critIn };
            const critret = applyCritToArrRefTypesTableReturn(finalArrRefTypesTableReturn, crit, inferStatus);
            if (myDebug){
                consoleLog("mrNarrowTypes[dbg], applyCritToArrRefTypesTableReturn return passing:");
                critret.passing.forEach((rttr,idx)=>{
                    dbgRefTypesTableToStrings(rttr as RefTypesTableReturn).forEach(str=>{
                        consoleLog(`mrNarrowTypes[dbg], critret passing[${idx}]  ${str}`);
                    });
                });
                if (critret.failing){
                    consoleLog("mrNarrowTypes[dbg], applyCritToArrRefTypesTableReturn return failing:");
                    critret.failing.forEach((rttr,idx)=>{
                        dbgRefTypesTableToStrings(rttr as RefTypesTableReturn).forEach(str=>{
                            consoleLog(`mrNarrowTypes[dbg], critret failing[${idx}]  ${str}`);
                        });
                    });
                }
            }
            let finalByNode: NodeToTypeMap | undefined;
            const unmergedPassing: RefTypesTableReturn[]=[];
            const unmergedFailing: RefTypesTableReturn[]=[];
            let mrNarrowTypesReturn: MrNarrowTypesReturn;
            if (newReplayItem) {
                //Debug.assert(innerret.assignmentData && innerret.assignmentData.symbol===replaySymbol);
                Debug.assert(critIn.kind!==InferCritKind.none);
                /**
                 * The actual return symbol must be replaySymbol, and that must also be added to symtabs.
                 * (1) The return byNode is the lhs node, not the rhs initializer used for replay.  Taken from the input refTypesSymtab.
                 * (2) The replay passing/failing? symtab member results corespond to the symbol states at the point of declaration, then narrowed.
                 *     But the actual symbols states may differ because in the interum between the declaration and the replay -
                 *     (a) They are !isconst symbols which have been redefined or widened by branches joining
                 *     (b) They are any symbol which have been narrowed, but not affected by (a). (!!isconst symbols cant be assigned)
                 *     Re: (a), for the time being don't pass the types of !isconst symbols as replay output.  As a future improvement, symbol updates could be marked with an incremented sequence number,
                 *     to test for validity.
                 *     Re: (b), the types are narrowed by intersection with the input refTypesSymtab
                 * (3) passing.type and failing.type are also intersected with input type from input refTypesSymtab corresponding to replaySymbol,
                 *     and their symbol is set to replaySymbol
                 */
                const nodeleaf = refTypesSymtabIn.get(newReplayItem.symbol)?.leaf;
                if (!nodeleaf){
                    Debug.assert(nodeleaf);
                }
                else {
                    if (myDebug){
                        consoleLog(`refTypesSymtab.get(newReplayItem.symbol)?.leaf.type : ${typeToString(getTypeFromRefTypesType(nodeleaf.type))}`);
                    }
                }
                {
                    // (1)
                    finalByNode = new Map<Node, Type>([[ expr, getTypeFromRefTypesType(nodeleaf.type) ]]);
                }
                {
                    // (2)
                    critret.passing.forEach(rttr=>{
                        const passingSymtab = copyRefTypesSymtab(rttr.symtab);
                        rttr.symtab.forEach((rttl,_symbol)=>{
                            if (!rttl.leaf.isconst) return;
                            const got = passingSymtab.get(_symbol);
                            Debug.assert(got);
                            got.leaf.type = intersectRefTypesTypes(rttl.leaf.type, got.leaf.type);
                        });
                        // (3)
                        const passingType = intersectRefTypesTypes(rttr.type, nodeleaf.type);
                        passingSymtab.set(newReplayItem!.symbol, { leaf: createRefTypesTableLeaf(newReplayItem!.symbol, newReplayItem!.isconst, passingType) });

                        const passing: RefTypesTableReturn = {
                            kind: RefTypesTableKind.return,
                            symbol: newReplayItem!.symbol,
                            isconst: newReplayItem!.isconst,
                            type: passingType,
                            symtab: passingSymtab
                        };
                        unmergedPassing.push(passing);

                    });
                    if (critret.failing){
                        critret.failing.forEach(rttr=>{
                            const failingSymtab = copyRefTypesSymtab(rttr.symtab);
                            rttr.symtab.forEach((rttl,_symbol)=>{
                                if (!rttl.leaf.isconst) return;
                                const got = failingSymtab.get(_symbol);
                                Debug.assert(got);
                                got.leaf.type = intersectRefTypesTypes(rttl.leaf.type, got.leaf.type);
                            });
                            const failingType = intersectRefTypesTypes(rttr.type, nodeleaf.type);
                            failingSymtab.set(newReplayItem!.symbol, { leaf: createRefTypesTableLeaf(newReplayItem!.symbol, newReplayItem!.isconst, failingType) });
                            const failing: RefTypesTableReturn = {
                                kind: RefTypesTableKind.return,
                                symbol: newReplayItem!.symbol,
                                isconst: newReplayItem!.isconst,
                                type: failingType,
                                symtab: failingSymtab
                            };
                            unmergedFailing.push(failing);
                        });
                    }
                }
                mrNarrowTypesReturn = {
                    byNode: finalByNode,
                    inferRefRtnType: {
                        passing: mergeArrRefTypesTableReturnToRefTypesTableReturn(newReplayItem.symbol, newReplayItem.isconst, unmergedPassing),
                    }
                };
                if (crit.alsoFailing){
                    mrNarrowTypesReturn.inferRefRtnType.failing = mergeArrRefTypesTableReturnToRefTypesTableReturn(newReplayItem.symbol, newReplayItem.isconst, unmergedFailing);
                }
            } // if replaySymbol
            else {
                critret.passing.forEach(rttr=>{
                    const passing: RefTypesTableReturn = {
                        kind: RefTypesTableKind.return,
                        symbol: innerret.assignmentData?.symbol,
                        isconst: innerret.assignmentData?.isconst,
                        type: rttr.type,
                        symtab: rttr.symtab,
                        constraintItem: rttr.constraintItem
                    };
                    unmergedPassing.push(passing);
                });
                if (critret.failing){
                    critret.failing.forEach(rttr=>{
                        const failing: RefTypesTableReturn = {
                            kind: RefTypesTableKind.return,
                            symbol: innerret.assignmentData?.symbol,
                            isconst: innerret.assignmentData?.isconst,
                            type: rttr.type,
                            symtab: rttr.symtab,
                            constraintItem: rttr.constraintItem
                        };
                        unmergedFailing.push(failing);
                    });
                }
                finalByNode = innerret.byNode;
                mrNarrowTypesReturn = {
                    byNode: finalByNode,
                    inferRefRtnType: {
                        passing: mergeArrRefTypesTableReturnToRefTypesTableReturn(innerret.assignmentData?.symbol, innerret.assignmentData?.isconst, unmergedPassing),
                    }
                };
                if (crit.alsoFailing){
                    mrNarrowTypesReturn.inferRefRtnType.failing = mergeArrRefTypesTableReturnToRefTypesTableReturn(innerret.assignmentData?.symbol, innerret.assignmentData?.isconst, unmergedFailing);
                }
            }


            if (myDebug) {
                consoleLog("mrNarrowTypes[dbg]: passing:");
                    unmergedPassing.forEach(rttr=>{
                        dbgRefTypesTableToStrings(rttr).forEach(s=>consoleLog("mrNarrowTypes[dbg]: passing:  "+s));
                    });
                //if (r.failing) {
                    consoleLog("mrNarrowTypes[dbg]: failing:");
                    unmergedFailing.forEach(rttr=>{
                        dbgRefTypesTableToStrings(rttr).forEach(s=>consoleLog("mrNarrowTypes[dbg]: failing:  "+s));
                    });
                //}
                consoleGroup("mrNarrowTypes[dbg] byNode:");
                finalByNode.forEach((t,n)=>{
                    consoleLog(`mrNarrowTypes[dbg] byNode: node: ${dbgNodeToString(n)}, type: ${typeToString(t)}`);
                });
                consoleGroupEnd();
                consoleGroupEnd();
            }
            return mrNarrowTypesReturn;
        }

        function mrNarrowTypesInner({refTypesSymtab: refTypesSymtabIn, expr: condExpr, qdotfallout, inferStatus, constraintItem }: InferRefInnerArgs): MrNarrowTypesInnerReturn {
            if (myDebug){
                consoleGroup(`mrNarrowTypes_inner[in] condExpr:${dbgNodeToString(condExpr)}, inferStatus.replayItemStack.length: ${
                    inferStatus.replayItemStack.length
                }, inferStatus.inCondition: ${inferStatus.inCondition}`);
                //dbgRefTypesSymtabToStrings
                consoleLog(`mrNarrowTypesInner[in] refTypesSymtab:`);
                dbgRefTypesSymtabToStrings(refTypesSymtabIn).forEach(str=> consoleLog(`  ${str}`));
                consoleLog(`mrNarrowTypesInner[in] constraintItemIn:`);
                if (constraintItem) dbgConstraintItem(constraintItem).forEach(str=> consoleLog(`  ${str}`));
            }
            const innerret = mrNarrowTypesInnerAux({ refTypesSymtab: refTypesSymtabIn, expr: condExpr, qdotfallout, inferStatus, constraintItem });
            if (myDebug){
                innerret.arrRefTypesTableReturn.forEach((rttr,i)=>{
                    dbgRefTypesTableToStrings(rttr).forEach(str=>{
                        consoleLog(`mrNarrowTypes_inner[dbg]:  innerret.arttr[${i}]: ${str}`);
                    });
                });
                innerret.byNode.forEach((type,node)=>{
                    consoleLog(`mrNarrowTypes_inner[dbg]:  innerret.byNode: { node: ${dbgNodeToString(node)}, type: ${typeToString(type)}`);
                });
                if (innerret.assignmentData){
                    consoleLog(`mrNarrowTypes_inner[dbg]: innerret.assignmentData: { symbol: ${
                        dbgSymbolToStringSimple(innerret.assignmentData?.symbol)
                    }, isconst: ${
                        innerret.assignmentData?.isconst
                    }`);
                }
                else {
                    consoleLog(`mrNarrowTypes_inner[dbg]: innerret.assignmentData: <undef>`);
                }
                consoleLog(`mrNarrowTypes_inner[out] condExpr:${dbgNodeToString(condExpr)}, inferStatus.replayItemStack.length: ${
                    inferStatus.replayItemStack.length
                }, inferStatus.inCondition: ${inferStatus.inCondition}`);
                consoleGroupEnd();
            }
            return innerret;
        }

        /**
         *
         * @param param0
         * @returns
         */
        function mrNarrowTypesInnerAux({refTypesSymtab: refTypesSymtabIn, expr, qdotfallout, inferStatus, constraintItem:constraintItemIn}: InferRefInnerArgs): MrNarrowTypesInnerReturn {
            switch (expr.kind){
                /**
                 * Identifier
                 */
                case SyntaxKind.Identifier:{
                    if (myDebug) consoleLog(`case SyntaxKind.Identifier`);
                    Debug.assert(isIdentifier(expr));
                    const condSymbol = getResolvedSymbol(expr); // getSymbolOfNode()?
                    let type: RefTypesType | undefined;
                    let isconst = false;
                    let tstype: Type | undefined;
                    let refTypesSymtabOut = refTypesSymtabIn;
                    //let constraintItemOut = constraintItem;
                    if (inferStatus.replayItemStack.length){
                        tstype = inferStatus.replayItemStack.slice(-1)[0].nodeToTypeMap.get(expr);
                        if (!tstype){
                            Debug.assert(tstype);
                        }
                        type = createRefTypesType(tstype);
                        Debug.fail();
                    }
                    else {
                        const leaf = refTypesSymtabIn.get(condSymbol)?.leaf;//.type;
                        if (!leaf){
                            const tstype = getTypeOfSymbol(condSymbol);
                            if (tstype===errorType){
                                Debug.assert(false);
                            }
                            type = createRefTypesType(tstype);
                            isconst = isConstantReference(expr);
                        }
                        else {
                            type = leaf.type;
                            isconst = leaf.isconst??false;
                        }
                        if (isconst && constraintItemIn){
                            // Could this narrowing be postponed until applyCritToArrRefTypesTableReturn? No.
                            // If done here, then the constrained result is reflected in byNode.  That could result in better error messages if it were never.
                            // However, the constraintItem is postponed until applyCritToArrRefTypesTableReturn.
                            type = evalTypeOverConstraint({ cin:constraintItemIn, symbol:condSymbol, typeRange: type, mrNarrow });
                            if (!leaf || (type !== leaf.type && !mrNarrow.isASubsetOfB(leaf.type,type))){
                                refTypesSymtabOut = copyRefTypesSymtab(refTypesSymtabOut).set(condSymbol,{ leaf:createRefTypesTableLeaf(condSymbol,isconst,type) });
                            }
                        }
                        tstype = getTypeFromRefTypesType(type);
                    }
                    const byNode = createNodeToTypeMap();
                    byNode.set(expr, tstype);
                    const rttr: RefTypesTableReturn = {
                        kind: RefTypesTableKind.return,
                        symbol: condSymbol,
                        isconst,
                        type,
                        symtab: refTypesSymtabIn,
                        constraintItem: constraintItemIn
                    };
                    const mrNarrowTypesInnerReturn: MrNarrowTypesInnerReturn = {
                        byNode,
                        arrRefTypesTableReturn: [rttr],
                        assignmentData: {
                            isconst,
                            symbol: condSymbol
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
                     const innerret = mrNarrowTypesInner({refTypesSymtab: refTypesSymtabIn, expr: expr.expression,
                        //crit: {kind: InferCritKind.twocrit, crits:[{ kind:InferCritKind.notnullundef }, crit]},
                        qdotfallout, inferStatus, constraintItem: constraintItemIn });

                    /**
                     * Apply notnullundef criteria without squashing the result into passing/failing
                     * Note that innerret.byNode is not altered, under the assumption that byNode does not yet include the types to be discriminated.
                     */
                    const applyNotNullUndefCritToRefTypesTableReturn = (arrRttr: RefTypesTableReturn[]): RefTypesTableReturn[] => {
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
                        byNode: innerret.byNode,
                        arrRefTypesTableReturn: applyNotNullUndefCritToRefTypesTableReturn(innerret.arrRefTypesTableReturn),
                        //arrTypeAndConstraint: innerret.arrTypeAndConstraint
                    };
                }
                case SyntaxKind.ParenthesizedExpression:{
                    if (myDebug) consoleLog(`mrNarrowTypes[dbg]: case ParenthesizedExpression [start]`);
                    const ret = mrNarrowTypes({ refTypesSymtab: refTypesSymtabIn, expr: (expr as ParenthesizedExpression).expression,
                        crit: inferStatus.inCondition ? { kind: InferCritKind.truthy, alsoFailing: true } : { kind: InferCritKind.none },
                        inferStatus, constraintItem: constraintItemIn });
                    if (myDebug) consoleLog(`mrNarrowTypes[dbg]: case ParenthesizedExpression [end]`);
                    const arrRefTypesTableReturn = [ret.inferRefRtnType.passing];
                    if (ret.inferRefRtnType.failing) arrRefTypesTableReturn.push(ret.inferRefRtnType.failing);
                    return {
                        byNode: ret.byNode,
                        arrRefTypesTableReturn,
                    };
                }
                break;
                /**
                 * ConditionalExpression
                 */
                case SyntaxKind.ConditionalExpression:{
                    if (myDebug) consoleLog(`mrNarrowTypes[dbg]: case SyntaxKind.ConditionalExpression`);
                    const {condition, whenTrue, whenFalse} = (expr as ConditionalExpression);
                    const byNodeSinglepath = createNodeToTypeMap();
                    if (myDebug) consoleLog(`mrNarrowTypes[dbg]: case SyntaxKind.ConditionalExpression ; condition:${dbgNodeToString(condition)}`);
                    const rcond = mrNarrowTypes({
                        refTypesSymtab: refTypesSymtabIn,
                        expr: condition,
                        crit: { kind: InferCritKind.truthy, alsoFailing: true },
                        inferStatus: { ...inferStatus, inCondition: true },
                        constraintItem: constraintItemIn
                    });
                    mergeIntoNodeToTypeMaps(rcond.byNode, byNodeSinglepath);
                    //andIntoConstrainTrySimplify({})

                    if (myDebug) consoleLog(`mrNarrowTypes[dbg]: case SyntaxKind.ConditionalExpression ; whenTrue`);
                    const retTrue = mrNarrowTypes({
                        refTypesSymtab: rcond.inferRefRtnType.passing.symtab,
                        expr: whenTrue,
                        crit: { kind: InferCritKind.none },
                        inferStatus, //: { ...inferStatus, inCondition: true }
                        constraintItem: rcond.inferRefRtnType.passing.constraintItem
                    });
                    mergeIntoNodeToTypeMaps(retTrue.byNode, byNodeSinglepath);

                    if (myDebug) consoleLog(`mrNarrowTypes[dbg]: case SyntaxKind.ConditionalExpression ; whenFalse`);
                    const retFalse = mrNarrowTypes({
                        refTypesSymtab: rcond.inferRefRtnType.failing!.symtab,
                        expr: whenFalse,
                        crit: { kind: InferCritKind.none },
                        inferStatus, //: { ...inferStatus, inCondition: true }
                        constraintItem: rcond.inferRefRtnType.failing!.constraintItem
                    });
                    mergeIntoNodeToTypeMaps(retFalse.byNode, byNodeSinglepath);

                    const retval: MrNarrowTypesInnerReturn = {
                        byNode: byNodeSinglepath,
                        arrRefTypesTableReturn: []
                    };
                    retval.arrRefTypesTableReturn.push(retTrue.inferRefRtnType.passing);
                    retval.arrRefTypesTableReturn.push(retFalse.inferRefRtnType.passing);
                    return retval;
                }
                break;
                /**
                 * PropertyAccessExpression
                 */
                // IWOZERE
                case SyntaxKind.PropertyAccessExpression:
                    if (myDebug) consoleLog(`mrNarrowTypes[dbg]: case SyntaxKind.PropertyAccessExpression`);
                    return mrNarrowTypesByPropertyAccessExpression({ refTypesSymtab: refTypesSymtabIn, expr, /* crit, */ qdotfallout, inferStatus });
                /**
                 * CallExpression
                 */
                case SyntaxKind.CallExpression:{
                    if (myDebug) consoleLog(`mrNarrowTypes[dbg]: case SyntaxKind.CallExpression`);
                    Debug.assert(isCallExpression(expr));
                    return mrNarrowTypesByCallExpression({ refTypesSymtab: refTypesSymtabIn, expr, /*crit, */ qdotfallout, inferStatus });
                }
                case SyntaxKind.PrefixUnaryExpression:
                    if ((expr as PrefixUnaryExpression).operator === SyntaxKind.ExclamationToken) {
                        const ret = mrNarrowTypes({
                            refTypesSymtab: refTypesSymtabIn, expr:(expr as PrefixUnaryExpression).operand,
                            crit:{ negate: true, kind: InferCritKind.truthy, alsoFailing: true },
                            qdotfallout: undefined, inferStatus: { ...inferStatus, inCondition: true }
                        });
                        /**
                         * The crit was already set with negate: true to reverse the passing and failing.
                         * Below, the symbols are set to undefined, and the types converted to booleans.
                         */
                        const nodeTypes: Type[] = [];
                        ret.inferRefRtnType.passing.symbol = undefined;
                        if (!isNeverType(ret.inferRefRtnType.passing.type)){
                            const ttype = checker.getTrueType();
                            nodeTypes.push(ttype);
                            ret.inferRefRtnType.passing.type = createRefTypesType(ttype);
                        }
                        ret.inferRefRtnType.failing!.symbol = undefined;
                        if (!isNeverType(ret.inferRefRtnType.failing!.type)){
                            const ftype = checker.getFalseType();
                            nodeTypes.push(ftype);
                            ret.inferRefRtnType.failing!.type = createRefTypesType(ftype);
                        }
                        ret.byNode.set(expr, getUnionType(nodeTypes));
                        return {
                            byNode: ret.byNode,
                            arrRefTypesTableReturn: [ret.inferRefRtnType.passing, ret.inferRefRtnType.failing!]
                        };
                    }
                    Debug.assert(false);
                    break;
                case SyntaxKind.VariableDeclaration: {
                    Debug.assert(isVariableDeclaration(expr));
                    Debug.assert(expr.initializer);
                    const initializer = expr.initializer;
                    const rhs = mrNarrowTypesInner({ refTypesSymtab: refTypesSymtabIn, expr:initializer, /* crit:{ kind: InferCritKind.none }, */ qdotfallout, inferStatus });
                    if (isIdentifier(expr.name)){
                        /**
                         * More processing and error checking of the lhs is taking place higher up in checkVariableLikeDeclaration.
                         *
                         * Setting "saveByNodeForReplay" makes this symbol a replayable.
                         * Currently only "isconst" symbols are set.
                         * Note: the rhs is not required to be all const. If at least one const is on the rhs, replay is meaningful.
                         * However, pure const only rhs could be a condition.
                         */
                        const symbol = getSymbolOfNode(expr); // not condExpr.name
                        const isconstVar = isConstVariable(symbol);
                        const saveByNodeForReplay = isconstVar; // isConstVariable(symbol) && isConstantReference(initializer);
                        if (saveByNodeForReplay){
                            inferStatus.replayables.set(symbol,{
                                expr: initializer,
                                isconst: isconstVar,
                                symbol,
                                nodeToTypeMap: rhs.byNode
                            });
                            if (myDebug){
                                consoleLog(`mrNarrowTypes_inner: replayable added: { symbol:${dbgSymbolToStringSimple(symbol)}, isconst:${isconstVar}, expr: ${dbgNodeToString(initializer)}}`);
                            }
                        }
                        const retval: MrNarrowTypesInnerReturn = {
                            ... rhs,
                            assignmentData: {
                                symbol,
                                isconst: isconstVar,
                            }
                        };
                        return retval;
                    }
                    else {
                        // could be binding, or could a proeprty access on the lhs
                        Debug.fail(`not yet implemented: `+Debug.formatSyntaxKind(expr.name.kind));
                    }
                }
                break;
                case SyntaxKind.BinaryExpression:{
                    return mrNarrowTypesByBinaryExpression({ refTypesSymtab: refTypesSymtabIn, constraintItem: constraintItemIn, expr: expr as BinaryExpression, /*crit, */ qdotfallout, inferStatus });
                }
                break;
                case SyntaxKind.TypeOfExpression:{
                    /**
                     * For a TypeOfExpression not as the child of a binary expressionwith ops  ===,!==,==,!=
                     */
                    return mrNarrowTypesInner({ refTypesSymtab: refTypesSymtabIn, expr: (expr as TypeOfExpression).expression, qdotfallout, inferStatus });
                }
                break;
                case SyntaxKind.TrueKeyword:
                case SyntaxKind.FalseKeyword:
                case SyntaxKind.NumericLiteral:
                case SyntaxKind.StringLiteral:{
                    const type: Type = checker.getTypeAtLocation(expr);
                    return {
                        byNode: createNodeToTypeMap().set(expr, type),
                        arrRefTypesTableReturn: [{
                            kind: RefTypesTableKind.return,
                            symbol: undefined,
                            type: createRefTypesType(type),
                            symtab: refTypesSymtabIn
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
                    assertType<Readonly<ArrayLiteralExpression>>(expr);
                    const aret: RefTypesTableReturn[] = [];
                    let byNodeOut: NodeToTypeMap | undefined;
                    for (const e of expr.elements){
                        if (e.kind === SyntaxKind.SpreadElement) continue;
                        const {byNode, inferRefRtnType} = mrNarrowTypes({
                            refTypesSymtab: refTypesSymtabIn, expr:e,
                            crit:{ kind: InferCritKind.none },
                            qdotfallout: undefined, inferStatus,
                            constraintItem: constraintItemIn
                        });
                        if (!byNodeOut) byNodeOut = byNode;
                        else mergeIntoNodeToTypeMaps(byNode, byNodeOut);
                        aret.push({ ...inferRefRtnType.passing, symbol: undefined, isconst: undefined });
                    }
                    const rttrOut = mergeArrRefTypesTableReturnToRefTypesTableReturn(/*symbol*/ undefined, /*isconst*/ undefined, aret);
                    return {
                        byNode:byNodeOut??createNodeToTypeMap(),
                        arrRefTypesTableReturn: [rttrOut]
                    };
                }
                break;
                default: Debug.assert(false, "", ()=>`${Debug.formatSyntaxKind(expr.kind)}, ${dbgNodeToString(expr)}`);
            }
        }

        return mrNarrow;
        // return {
        //     mrNarrowTypes,
        //     createRefTypesSymtab,
        //     dbgRefTypesTableToStrings,
        //     dbgRefTypesSymtabToStrings,
        //     mergeArrRefTypesTableReturnToRefTypesTableReturn,
        //     createNodeToTypeMap,
        //     mergeIntoNodeToTypeMaps,
        //     mergeArrRefTypesSymtab,
        //     intersectRefTypesTypes
        // };




    } // createMrNarrow




}
