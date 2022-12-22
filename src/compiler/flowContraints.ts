/* eslint-disable no-null/no-null */
namespace ts {

    export function createFlowConstraintNodeAnd({negate, constraints}: {negate?: boolean, constraints: ConstraintItem[]}): ConstraintItemNode {
        if (constraints.length<=1) Debug.fail("unexpected constraints.length<=1");
        const c: ConstraintItemNodeAnd = {
            kind: ConstraintItemKind.node,
            op: ConstraintItemNodeOp.and,
            constraints
        };
        return negate ? createFlowConstraintNodeNot(c) : c;
    }
    export function createFlowConstraintNodeOr({negate, constraints}: {negate?: boolean, constraints: ConstraintItem[]}): ConstraintItemNode {
        if (constraints.length<=1) Debug.fail("unexpected constraints.length<=1");
        const c: ConstraintItemNodeOr = {
            kind: ConstraintItemKind.node,
            op: ConstraintItemNodeOp.or,
            constraints
        };
        return negate ? createFlowConstraintNodeNot(c) : c;
    }
    export function createFlowConstraintNodeNot(constraint: ConstraintItem): ConstraintItemNode {
        return {
            kind: ConstraintItemKind.node,
            op: ConstraintItemNodeOp.not,
            constraint
        };
    }
    export function createFlowConstraintLeaf(symbol: Symbol, type: RefTypesType, negate?: boolean): ConstraintItem {
        return negate? createFlowConstraintNodeNot(
        {
            kind: ConstraintItemKind.leaf,
            symbol, type
        }) : {
            kind: ConstraintItemKind.leaf,
            symbol, type
        };
    }
    /**
     * Generally speaking the constraintItem must be kept in a canonical state via substitution for mrNarrowTypeByConstraint to work well.
     * That means simplifyConstraintBySubstitution should be called before mrNarrowTypeByConstraint,
     * @param param0
     * @param mrNarrow
     * @returns
     */
    // @ ts-expect-error
    export function mrNarrowTypeByConstraint({symbol, type, constraintItem, negateResultType}: {symbol: Symbol, type: RefTypesType, constraintItem: ConstraintItem | null, negateResultType?: boolean}, mrNarrow: MrNarrow): RefTypesType {
        if (!constraintItem) return type;
        if (constraintItem.kind===ConstraintItemKind.leaf){
            if (constraintItem.symbol!==symbol) return type;
            if (!negateResultType){
                // intersection type, constraintItem.type
                return mrNarrow.intersectRefTypesTypes(type, constraintItem.type);
            }
            else {
                // intersection type, inverse of constraintItem.type
                return mrNarrow.inverseType(constraintItem.type, type);
            }
        }
        else if (constraintItem.kind===ConstraintItemKind.node){
            if (constraintItem.op===ConstraintItemNodeOp.and){
                /**
                 * return the intersection of constraints
                 */
                let tmpTypeI = type;
                constraintItem.constraints.forEach(c=>{
                    const t = mrNarrowTypeByConstraint({ symbol,type:tmpTypeI,constraintItem:c }, mrNarrow);
                    if (t===tmpTypeI) return;
                    tmpTypeI = mrNarrow.intersectRefTypesTypes(tmpTypeI,t);
                });
                if (negateResultType) tmpTypeI = mrNarrow.inverseType(tmpTypeI, type);
                return tmpTypeI;
            }
            else if (constraintItem.op===ConstraintItemNodeOp.or) {
                // Debug.assert(constraintItem.op===ConstraintItemNodeOp.or);
                /**
                 * return the union of constraints
                 */
                 let tmpTypeU = mrNarrow.createRefTypesType(); // never / empty
                 constraintItem.constraints.forEach(c=>{
                     const t = mrNarrowTypeByConstraint({ symbol,type,constraintItem:c }, mrNarrow);
                     mrNarrow.mergeToRefTypesType({ source:t,target:tmpTypeU });
                 });
                 if (negateResultType) {
                    tmpTypeU = mrNarrow.inverseType(tmpTypeU, type);
                    //tmpTypeU = mrNarrow.intersectRefTypesTypes(tmpTypeU, type);
                 }
                 return tmpTypeU;
            }
            else if (constraintItem.op===ConstraintItemNodeOp.not) {
                return mrNarrowTypeByConstraint({ constraintItem, symbol, type, negateResultType: !negateResultType }, mrNarrow);
            }
        }
        Debug.fail();
        //return type;
    }

    // function getDefaultType(sym: Symbol, mrNarrow: MrNarrow): RefTypesType {
    //     const tstype = mrNarrow.checker.getTypeOfSymbol(sym);
    //     const type = mrNarrow.createRefTypesType(tstype);
    //     return type;
    // }


    export function evalTypeOverConstraint({cin, symbol, typeRange, negate, /*refDfltTypeOfSymbol,*/ mrNarrow, depth}: {
        cin: Readonly<ConstraintItem | null>, symbol: Readonly<Symbol>, typeRange: Readonly<RefTypesType>, negate?: boolean, /*refDfltTypeOfSymbol: [RefTypesType | undefined],*/ mrNarrow: MrNarrow, depth?: number
    }): RefTypesType {
        depth=depth??0;
        if (getMyDebug()){
            const as: string[] = [];
            consoleGroup(`evalTypeOverConstraint[in][${depth}]`);
            as.push(`evalTypeOverConstraint[in][${depth}]: depth:${depth}, symbol:${symbol.escapedName}, negate:${negate}, typeRange: ${mrNarrow.dbgRefTypesTypeToString(typeRange)}.`);
            if (!cin) as.push(`evalTypeOverConstraint[in][${depth}]: constraint: undefined`);
            else mrNarrow.dbgConstraintItem(cin).forEach(s=>as.push(`evalTypeOverConstraint[in][${depth}]: constraint: ${s}`));
            as.forEach(s=>consoleLog(s));
        }
        const r = evalTypeOverConstraint_aux({ cin, symbol, typeRange, negate, mrNarrow, depth });
        if (getMyDebug()){
            consoleLog(`evalTypeOverConstraint[out][${depth}]: ${mrNarrow.dbgRefTypesTypeToString(r)}`);
            consoleGroupEnd();
        }
        return r;
    }
    function evalTypeOverConstraint_aux({cin, symbol, typeRange, negate, /*refDfltTypeOfSymbol,*/ mrNarrow, depth}: {
        cin: Readonly<ConstraintItem | null>, symbol: Readonly<Symbol>, typeRange: Readonly<RefTypesType>, negate?: boolean, /*refDfltTypeOfSymbol: [RefTypesType | undefined],*/ mrNarrow: MrNarrow, depth?: number
    }): RefTypesType {
        depth=depth??0;
        if (mrNarrow.isNeverType(typeRange)){
            return typeRange;
        }
        if (mrNarrow.isAnyType(typeRange) || mrNarrow.isUnknownType(typeRange)){
            Debug.fail("TODO:  mrNarrow.isAnyType(type) || mrNarrow.isUnknownType(type)");
        }
        if (!cin) return !negate ? typeRange : mrNarrow.createRefTypesType();
        if (cin.kind===ConstraintItemKind.never){
            if (!negate) return mrNarrow.createRefTypesType(); // never
            return typeRange;
        }
        if (cin.kind===ConstraintItemKind.leaf){
            if (!negate){
                if (cin.symbol!==symbol) return typeRange;
                return mrNarrow.intersectRefTypesTypes(cin.type,typeRange);
            }
            else {
                if (cin.symbol!==symbol) return mrNarrow.createRefTypesType(); // never
                return mrNarrow.inverseType(cin.type,typeRange);
            }
        }
        else if (cin.kind===ConstraintItemKind.node){
            //Debug.assert(cin.kind===ConstraintItemKind.node);
            if (cin.op===ConstraintItemNodeOp.not){
                return evalTypeOverConstraint({ cin:cin.constraint, symbol, typeRange, negate:!negate, mrNarrow, depth:depth+1 });
            }
            if (cin.op===ConstraintItemNodeOp.and && !negate || cin.op===ConstraintItemNodeOp.or && negate){
                let isectType = typeRange;
                for (const subc of cin.constraints){
                    const subType = evalTypeOverConstraint({ cin:subc, symbol, typeRange:isectType, mrNarrow, depth:depth+1 });
                    if (mrNarrow.isNeverType(subType)) return subType;
                    if (subType!==isectType && !mrNarrow.isASubsetOfB(isectType,subType)) isectType=subType;
                }
                return isectType;
            }
            if (cin.op===ConstraintItemNodeOp.or && !negate || cin.op===ConstraintItemNodeOp.and && negate){
                const unionType = mrNarrow.createRefTypesType(); // never
                for (const subc of cin.constraints){
                    const subType = evalTypeOverConstraint({ cin:subc, symbol, typeRange, mrNarrow, depth:depth+1 });
                    mrNarrow.mergeToRefTypesType({ source:subType, target:unionType });
                    if (mrNarrow.isASubsetOfB(typeRange,unionType)) return typeRange;
                }
                return unionType;
            }
        }
        Debug.fail();
    }

    /**
     * A possibly simplifying transformation
     * The following identities hold:
     * A(BC) = A ((AB)/A)(AC)/A)
     * A(B+C) = A ((AB)/A)+(AC)/A)
     * A!(BC) = A (A!B/A + A!C/A)
     * A!(B+C) = A (A!B/A)(A!C/A)
     * Therefore this andDistributeDivide function prepares for a top level "and" with by the tranforms.
     * They are without the leading A on the rhs.
     * (BC) => ((AB)/A)(AC)/A)
     * (B+C) => ((AB)/A)+(AC)/A)
     * !(BC) => (A!B/A + A!C/A)
     * !(B+C) => (A!B/A)(A!C/A)
     */
    export function andDistributeDivide({
        symbol, type, typeRange, cin, negate, mrNarrow, refCountIn, refCountOut}:
        {symbol: Symbol, type: RefTypesType, typeRange: RefTypesType, cin: ConstraintItem | undefined, negate?: boolean | undefined, mrNarrow: MrNarrow, refCountIn: [number], refCountOut: [number]
    }): ConstraintItem | undefined {
        refCountIn[0]++;
        refCountOut[0]++;
        if (!cin) return cin;
        if (cin.kind===ConstraintItemKind.never) return cin;
        if (cin.kind===ConstraintItemKind.leaf){
            if (!negate) {
                if (symbol!==cin.symbol) return createFlowConstraintLeaf(cin.symbol, cin.type);
                else createFlowConstraintLeaf(cin.symbol, mrNarrow.inverseType(cin.type, type));
            }
            else {
                if (symbol!==cin.symbol) return { kind: ConstraintItemKind.never };
                else createFlowConstraintLeaf(cin.symbol, mrNarrow.inverseType(mrNarrow.inverseType(cin.type, typeRange), typeRange));
            }
        }
        else {
            Debug.assert(cin.kind===ConstraintItemKind.node);
            if (cin.op===ConstraintItemNodeOp.not){
                return andDistributeDivide({ symbol, type, typeRange, cin:cin.constraint, negate:!negate, mrNarrow, refCountIn, refCountOut });
            }
            else if ((cin.op===ConstraintItemNodeOp.and && !negate) || (cin.op===ConstraintItemNodeOp.or && negate)){
                const constraints: (ConstraintItem | undefined)[]=[];
                for (const subc of cin.constraints){
                    const subcr = andDistributeDivide({ symbol, type, typeRange, cin:subc, negate, mrNarrow, refCountIn, refCountOut });
                    if (!subcr) {
                        refCountOut[0]--;
                        continue;
                    }
                    if (subcr.kind===ConstraintItemKind.never) {
                        refCountOut[0]-=(constraints.length-1);
                        return subcr;
                    }
                    constraints.push(subcr);
                }
                if (constraints.length===0) return undefined;
                if (constraints.length===1) return constraints[0];
                return createFlowConstraintNodeAnd({ constraints:constraints as ConstraintItem[] });
            }
            else if ((cin.op===ConstraintItemNodeOp.or && !negate) || (cin.op===ConstraintItemNodeOp.and && negate)){
                const constraints: (ConstraintItem | undefined)[]=[];
                for (const subc of cin.constraints){
                    const subcr = andDistributeDivide({ symbol, type, typeRange, cin:subc, negate, mrNarrow, refCountIn, refCountOut });
                    if (!subcr) {
                        refCountOut[0]-=(constraints.length-1);
                        return undefined;
                    }
                    if (subcr.kind===ConstraintItemKind.never) {
                        refCountOut[0]--;
                        continue;
                    }
                    constraints.push(subcr);
                }
                if (constraints.length===0) return { kind:ConstraintItemKind.never };
                if (constraints.length===1) return constraints[0];
                return createFlowConstraintNodeOr({ constraints:constraints as ConstraintItem[] });
            }
            Debug.fail();
        }
    }

    export function andIntoConstraint({symbol, type, constraintItem}: {symbol: Symbol, type: RefTypesType, constraintItem: ConstraintItem | undefined}): ConstraintItem {
        if (!constraintItem){
            return { kind: ConstraintItemKind.leaf, symbol, type };
        }
        if (constraintItem.kind===ConstraintItemKind.never){
            return constraintItem; // identical constraintItem out is required for clean merging of if-branches
        }
        if (constraintItem.kind===ConstraintItemKind.leaf){
            return {
                kind: ConstraintItemKind.node, op: ConstraintItemNodeOp.and, constraints:[
                    { kind: ConstraintItemKind.leaf, symbol, type },
                    constraintItem
            ]};
        }
        else if (constraintItem.kind===ConstraintItemKind.node){
            if (constraintItem.op===ConstraintItemNodeOp.not || constraintItem.op===ConstraintItemNodeOp.or) {
                return {
                    kind: ConstraintItemKind.node, op: ConstraintItemNodeOp.and, constraints: [
                        { kind: ConstraintItemKind.leaf, symbol, type },
                        constraintItem
                ]};
            }
            else if (constraintItem.op===ConstraintItemNodeOp.and){
                return {
                    kind: ConstraintItemKind.node, op: ConstraintItemNodeOp.and, constraints: [
                    ...constraintItem.constraints, { kind: ConstraintItemKind.leaf, symbol, type }
                ]};
            }
        }
        Debug.fail("unexpected");
    }
    export function orIntoConstraints(acin: Readonly<(ConstraintItem | undefined)[]>): ConstraintItem | undefined {
        const ac: ConstraintItem[]=[];
        for (const c of acin){
            if (!c) return undefined;
            if (c.kind!==ConstraintItemKind.never) ac.push(c);
        }
        if (ac.length===0) return { kind:ConstraintItemKind.never };
        if (ac.length===1) return ac[0];
        return createFlowConstraintNodeOr({ constraints:ac });
    }

    export function testOfEvalTypeOverConstraint(checker: TypeChecker, mrNarrow: MrNarrow): void {
        type InType = Parameters<typeof evalTypeOverConstraint>;
        type OutType = ReturnType<typeof evalTypeOverConstraint>;

        const rttbool = mrNarrow.createRefTypesType(checker.getBooleanType());
        const rtttrue = mrNarrow.createRefTypesType(checker.getTrueType());
        const rttfalse = mrNarrow.createRefTypesType(checker.getFalseType());
        const symx = { escapedName:"x" } as any as Symbol;
        const symy = { escapedName:"y" } as any as Symbol;

        const datum: {in: InType[0],out: OutType}[] = [
            {
                in: {
                    cin: createFlowConstraintLeaf(symx, rttfalse, /*negate*/ true),
                    symbol: symx,
                    typeRange: rttbool,
                    // refDfltTypeOfSymbol: [rttbool],
                    mrNarrow,
                },
                out: rtttrue
            },
            {
                in: {
                    cin: createFlowConstraintNodeAnd({negate:true, constraints:[
                        createFlowConstraintLeaf(symx, rtttrue),
                        createFlowConstraintLeaf(symy, rtttrue),
                    ]}),
                    symbol: symx,
                    typeRange: rttbool,
                    // refDfltTypeOfSymbol: [rttbool],
                    mrNarrow,
                },
                out: rttbool
            },
            {
                in: {
                    cin: null,
                    symbol: symx,
                    typeRange: rttbool,
                    // refDfltTypeOfSymbol: [rttbool],
                    mrNarrow,
                },
                out: rttbool
            },
            {
                in: {
                    cin: createFlowConstraintLeaf(symx, rttfalse),
                    symbol: symx,
                    typeRange: rttbool,
                    // refDfltTypeOfSymbol: [rttbool],
                    mrNarrow,
                },
                out: rttfalse
            },
            {
                in: {
                    cin: createFlowConstraintLeaf(symx, rtttrue),
                    symbol: symx,
                    typeRange: rttbool,
                    // refDfltTypeOfSymbol: [rttbool],
                    mrNarrow,
                },
                out: rtttrue,
            },
            {
                in: {
                    cin: createFlowConstraintLeaf(symx, rttfalse),
                    symbol: symx,
                    typeRange: rttfalse,
                    // refDfltTypeOfSymbol: [rttbool],
                    mrNarrow,
                },
                out: rttfalse,
            },
            {
                in: {
                    cin: createFlowConstraintNodeOr({constraints:[
                        createFlowConstraintLeaf(symx, rtttrue),
                        createFlowConstraintNodeAnd({constraints:[
                            createFlowConstraintLeaf(symx, rttfalse),
                            createFlowConstraintLeaf(symy, rtttrue),
                        ]}),
                        createFlowConstraintNodeAnd({constraints:[
                            createFlowConstraintLeaf(symx, rttfalse),
                            createFlowConstraintLeaf(symy, rttfalse),
                        ]}),
                    ]}),
                    symbol: symx,
                    typeRange: rttbool,
                    // refDfltTypeOfSymbol: [rttbool],
                    mrNarrow,
                },
                out: rttbool
            },
            {
                in: {
                    cin: createFlowConstraintNodeAnd({negate: true, constraints:[
                        createFlowConstraintLeaf(symx, rtttrue),
                        createFlowConstraintNodeAnd({constraints:[
                            createFlowConstraintLeaf(symx, rttfalse),
                            createFlowConstraintLeaf(symy, rtttrue),
                        ]}),
                        createFlowConstraintNodeAnd({constraints:[
                            createFlowConstraintLeaf(symx, rttfalse),
                            createFlowConstraintLeaf(symy, rttfalse),
                        ]}),
                    ]}),
                    symbol: symy,
                    typeRange: rttbool,
                    // refDfltTypeOfSymbol: [rttbool],
                    mrNarrow,
                },
                out: rttbool
            },
        ];
        datum.forEach((data,_iter)=>{
            if (_iter<0) return;
            const type = evalTypeOverConstraint(data.in);
            Debug.assert(mrNarrow.equalRefTypesTypes(data.out,type));
        });
    }

}


