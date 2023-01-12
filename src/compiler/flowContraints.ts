/* eslint-disable no-null/no-null */
namespace ts {

    // @ts-expect-error
    type GetDeclaredTypeFn = (symbol: Symbol) => RefTypesType;

    export function createFlowConstraintNodeAnd({negate, constraints}: {negate?: boolean, constraints: ConstraintItem[]}): ConstraintItemNode {
        if (constraints.length<=1) Debug.fail("unexpected constraints.length<=1");
        const c: ConstraintItemNodeAnd = {
            kind: ConstraintItemKind.node,
            op: ConstraintItemNodeOp.and,
            constraints
        };
        return negate ? createFlowConstraintNodeNot(c) : c;
    }
    export function createFlowConstraintNodeOr({negate, constraints}: {negate?: boolean, constraints: (ConstraintItem)[]}): ConstraintItemNode {
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
    export function createFlowConstraintLeaf(symbol: Symbol, type: RefTypesType): ConstraintItemLeaf {
        return {
            kind: ConstraintItemKind.leaf,
            symbol, type
        };
    }
    export function createFlowConstraintNever(): ContstraintItemNever {
        return { kind:ConstraintItemKind.never };
    }

    // @ts-ignore
    export function isNeverConstraint(c: ConstraintItem): boolean {
        return (c.kind===ConstraintItemKind.never);
    }
    export function createFlowConstraintAlways(): ConstraintItemAlways {
        return { kind:ConstraintItemKind.always };
    }
    // @ts-ignore
    export function isAlwaysConstraint(c: ConstraintItem): boolean {
        return (c.kind===ConstraintItemKind.always);
    }

    export function evalTypeOverConstraint({cin, symbol, typeRange, negate, /*refDfltTypeOfSymbol,*/ mrNarrow, depth}: {
        cin: Readonly<ConstraintItem>, symbol: Readonly<Symbol>, typeRange: Readonly<RefTypesType>, negate?: boolean, /*refDfltTypeOfSymbol: [RefTypesType | undefined],*/ mrNarrow: MrNarrow, depth?: number
    }): RefTypesType {
        depth=depth??0;
        if (false && getMyDebug()){
            const as: string[] = [];
            consoleGroup(`evalTypeOverConstraint[in][${depth}]`);
            as.push(`evalTypeOverConstraint[in][${depth}]: depth:${depth}, symbol:${symbol.escapedName}, negate:${negate}, typeRange: ${mrNarrow.dbgRefTypesTypeToString(typeRange)}.`);
            if (!cin) as.push(`evalTypeOverConstraint[in][${depth}]: constraint: undefined`);
            else mrNarrow.dbgConstraintItem(cin).forEach(s=>as.push(`evalTypeOverConstraint[in][${depth}]: constraint: ${s}`));
            as.forEach(s=>consoleLog(s));
        }
        const r = evalTypeOverConstraint_aux({ cin, symbol, typeRange, negate, mrNarrow, depth });
        if (false && getMyDebug()){
            consoleLog(`evalTypeOverConstraint[out][${depth}]: ${mrNarrow.dbgRefTypesTypeToString(r)}`);
            consoleGroupEnd();
        }
        return r;
    }
    function evalTypeOverConstraint_aux({cin, symbol, typeRange, negate, /*refDfltTypeOfSymbol,*/ mrNarrow, depth}: {
        cin: Readonly<ConstraintItem>, symbol: Readonly<Symbol>, typeRange: Readonly<RefTypesType>, negate?: boolean, /*refDfltTypeOfSymbol: [RefTypesType | undefined],*/ mrNarrow: MrNarrow, depth?: number
    }): RefTypesType {
        depth=depth??0;
        if (mrNarrow.isNeverType(typeRange)){
            return typeRange;
        }
        if (mrNarrow.isAnyType(typeRange) || mrNarrow.isUnknownType(typeRange)){
            Debug.fail("TODO:  mrNarrow.isAnyType(type) || mrNarrow.isUnknownType(type)");
        }
        if (cin.kind===ConstraintItemKind.always) return !negate ? typeRange : mrNarrow.createRefTypesType();
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
                return mrNarrow.subtractFromType(cin.type,typeRange);
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
     * A(BC) = A ((AB)/A(AC)/A)
     * A(B+C) = A ((AB)/A)+(AC)/A)
     * A!(BC) = A (A!B/A + A!C/A)
     * A!(B+C) = A (A!B/A)(A!C/A)
     * Therefore this andDistributeDivide function prepares for a top level "and" using the following tranforms.
     * (BC) => ((AB)/A)(AC)/A)
     * (B+C) => ((AB)/A+(AC)/A)
     * !(BC) => (A!B/A + A!C/A)
     * !(B+C) => (A!B)/A(A!C)/A
     *
     * TODO: change parameter name from typeRange to declaredType
     */
    export function andDistributeDivide({
        symbol, type, declaredType, cin, negate, mrNarrow, refCountIn, refCountOut, depth}:
        {symbol: Symbol, type: RefTypesType, declaredType: RefTypesType, cin: ConstraintItem, negate?: boolean | undefined, mrNarrow: MrNarrow, refCountIn?: [number], refCountOut?: [number], depth?: number
    }): ConstraintItem {
        if (!refCountIn) refCountIn=[0];
        if (!refCountOut) refCountOut=[0];
        const doLog = true;
        if (doLog && getMyDebug()){
            consoleGroup(`andDistributeDivide[in][${depth??0}] symbol:${symbol.escapedName}, type: ${mrNarrow.dbgRefTypesTypeToString(type)}, typeRange: ${mrNarrow.dbgRefTypesTypeToString(declaredType)}, negate: ${negate??false}}, countIn: ${refCountIn[0]}, countOut: ${refCountOut[0]}`);
            mrNarrow.dbgConstraintItem(cin).forEach(s=>{
                consoleLog(`andDistributeDivide[in][${depth??0}] constraint: ${s}`);
            });
        }
        const creturn = andDistributeDivideAux({ symbol, type, declaredType, cin, negate, mrNarrow, refCountIn, refCountOut, depth });
        if (doLog && getMyDebug()){
            consoleLog(`andDistributeDivide[out][${depth??0}] countIn: ${refCountIn[0]}, countOut: ${refCountOut[0]}`);
            mrNarrow.dbgConstraintItem(creturn).forEach(s=>{
                consoleLog(`andDistributeDivide[out][${depth??0}] constraint: ${s}`);
            });
            consoleGroupEnd();
        }
        return creturn;
    }
    export function andDistributeDivideAux({
        symbol, type, declaredType: declaredType, cin, negate, mrNarrow, refCountIn, refCountOut, depth}:
        {symbol: Symbol, type: RefTypesType, declaredType: RefTypesType, cin: ConstraintItem, negate?: boolean | undefined, mrNarrow: MrNarrow, refCountIn: [number], refCountOut: [number], depth?: number
    }): ConstraintItem {
        if (mrNarrow.isAnyType(type)) Debug.fail("not yet implemented");
        if (mrNarrow.isUnknownType(type)) Debug.fail("not yet implemented");
        depth = depth??0;
        refCountIn[0]++;
        refCountOut[0]++;
        if (mrNarrow.isNeverType(type)) return createFlowConstraintNever();
        if (mrNarrow.isASubsetOfB(declaredType,type)) return createFlowConstraintAlways();
        if ((cin.kind===ConstraintItemKind.never && !negate) || (cin.kind===ConstraintItemKind.always && negate)) return createFlowConstraintNever();
        if ((cin.kind===ConstraintItemKind.never && negate) || (cin.kind===ConstraintItemKind.always && !negate)) return createFlowConstraintAlways();
        if (cin.kind===ConstraintItemKind.leaf){
            if (symbol===cin.symbol){
                if (mrNarrow.isNeverType(cin.type)) Debug.fail("unexpected");
                //if (mrNarrow.isASubsetOfB(typeRange,cin.type)) Debug.fail("unexpected, cin should be always");
                if (mrNarrow.isAnyType(cin.type)) Debug.fail("not yet implemented");
                if (mrNarrow.isUnknownType(cin.type)) Debug.fail("not yet implemented");
            }
            if (!negate) {
                if (symbol!==cin.symbol) {
                    return cin; //createFlowConstraintLeaf(cin.symbol, cin.type);
                }
                else {
                    // @ ts-expect-error
                    const isectType = mrNarrow.intersectRefTypesTypes(cin.type, type);
                    if (mrNarrow.isNeverType(isectType)) return createFlowConstraintNever();
                    if (!mrNarrow.isASubsetOfB(type,isectType)) return createFlowConstraintLeaf(symbol,isectType);
                    return createFlowConstraintAlways();
                }
            }
            else {
                if (symbol!==cin.symbol) {
                    refCountOut[0]++;
                    return createFlowConstraintNodeNot(cin);
                }
                else {
                    const isectInvType = mrNarrow.intersectRefTypesTypes(mrNarrow.subtractFromType(cin.type, declaredType), type);
                    if (mrNarrow.isNeverType(isectInvType)) return createFlowConstraintNever();
                    if (!mrNarrow.isASubsetOfB(type,isectInvType)) return createFlowConstraintLeaf(symbol,isectInvType);
                    return createFlowConstraintAlways();
                }
            }
        }
        else {
            Debug.assert(cin.kind===ConstraintItemKind.node);
            if (cin.op===ConstraintItemNodeOp.not){
                return andDistributeDivide({ symbol, type, declaredType, cin:cin.constraint, negate:!negate, mrNarrow, refCountIn, refCountOut, depth: depth+1 });
            }
            else if ((cin.op===ConstraintItemNodeOp.and && !negate) || (cin.op===ConstraintItemNodeOp.or && negate)){
                const constraints: (ConstraintItem)[]=[];
                for (const subc of cin.constraints){
                    const subcr = andDistributeDivide({ symbol, type, declaredType, cin:subc, negate, mrNarrow, refCountIn, refCountOut, depth: depth+1 });
                    if (!subcr) {
                        refCountOut[0]--;
                        continue;
                    }
                    if (isNeverConstraint(subcr)) {
                        refCountOut[0]-=(constraints.length-1);
                        return subcr;
                    }
                    constraints.push(subcr);
                }
                if (constraints.length===0) return createFlowConstraintAlways();
                if (constraints.length===1) return constraints[0];
                return createFlowConstraintNodeAnd({ constraints });
            }
            else if ((cin.op===ConstraintItemNodeOp.or && !negate) || (cin.op===ConstraintItemNodeOp.and && negate)){
                const constraints: (ConstraintItem)[]=[];
                for (const subc of cin.constraints){
                    const subcr = andDistributeDivide({ symbol, type, declaredType, cin:subc, negate, mrNarrow, refCountIn, refCountOut, depth: depth+1 });
                    if (!subcr) {
                        refCountOut[0]-=(constraints.length-1);
                        return createFlowConstraintAlways();
                    }
                    if (isNeverConstraint(subcr)) {
                        refCountOut[0]--;
                        continue;
                    }
                    constraints.push(subcr);
                }
                if (constraints.length===0) return createFlowConstraintNever();
                if (constraints.length===1) return constraints[0];
                return createFlowConstraintNodeOr({ constraints });
            }
            Debug.fail();
        }
    }

    export function andIntoConstraintShallow({symbol, type, constraintItem, mrNarrow}: {symbol: Symbol, type: RefTypesType, constraintItem: ConstraintItem, mrNarrow: MrNarrow}): ConstraintItem {
        if (mrNarrow.isNeverType(type)) return createFlowConstraintNever();
        // TODO: if there was a symbol table input we could check for always
        if (constraintItem.kind===ConstraintItemKind.always){
            return { kind: ConstraintItemKind.leaf, symbol, type };
        }
        if (constraintItem.kind===ConstraintItemKind.never) return constraintItem;
        if (constraintItem.kind===ConstraintItemKind.leaf){
            if (constraintItem.symbol===symbol){
                const isecttype = mrNarrow.intersectRefTypesTypes(type, constraintItem.type);
                if (mrNarrow.isNeverType(isecttype)) return createFlowConstraintNever();
                // TODO: if there was a symbol table input we could check for "always"
                return createFlowConstraintLeaf(symbol, type);
            }
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
    export function orIntoConstraintsShallow(acin: Readonly<(ConstraintItem)[]>): ConstraintItem {
        const ac: ConstraintItem[]=[];
        for (const c of acin){
            if (isAlwaysConstraint(c)) return createFlowConstraintAlways();;
            if (!isNeverConstraint(c)) ac.push(c);
        }
        if (ac.length===0) Debug.fail("unexpected"); //return createFlowConstraintNever();
        if (ac.length===1) return ac[0];
        return createFlowConstraintNodeOr({ constraints:ac });
    }

    export function andSymtabConstraintsWithSimplifyHelper(cia: Readonly<ConstraintItem>, cib: Readonly<ConstraintItem>): ConstraintItem {
        if (isAlwaysConstraint(cia)) return cib;
        if (isAlwaysConstraint(cib)) return cia;
        if (isNeverConstraint(cia)) return cia;
        if (isNeverConstraint(cib)) return cib;
        if (cia.kind===ConstraintItemKind.leaf && cib.kind===ConstraintItemKind.node && cib.op===ConstraintItemNodeOp.and){
            return createFlowConstraintNodeAnd({ constraints:[cia, ...cib.constraints] });
        }
        if (cib.kind===ConstraintItemKind.leaf && cia.kind===ConstraintItemKind.node && cia.op===ConstraintItemNodeOp.and){
            return createFlowConstraintNodeAnd({ constraints:[cib, ...cia.constraints] });
        }
        return createFlowConstraintNodeAnd({ constraints:[cia,cib] });
    }

    // @ ts-ignore
    export function andSymtabConstraintsWithSimplify(sc0: Readonly<RefTypesSymtabConstraintItem>, sc1: Readonly<RefTypesSymtabConstraintItem>, mrNarrow: MrNarrow, getDeclaredType: (symbol: Symbol) => RefTypesType): RefTypesSymtabConstraintItem {
        if (getMyDebug()){
            consoleGroup(`andSymtabConstraintsWithSimplify[in]`);
            mrNarrow.dbgRefTypesSymtabToStrings(sc0.symtab).forEach(s=>consoleLog(`andSymtabConstraintsWithSimplify[in] sc0.symtab: ${s}`));
            mrNarrow.dbgConstraintItem(sc0.constraintItem).forEach(s=>consoleLog(`andSymtabConstraintsWithSimplify[in] sc0.constraintItem: ${s}`));
            mrNarrow.dbgRefTypesSymtabToStrings(sc1.symtab).forEach(s=>consoleLog(`andSymtabConstraintsWithSimplify[in] sc1.symtab: ${s}`));
            mrNarrow.dbgConstraintItem(sc1.constraintItem).forEach(s=>consoleLog(`andSymtabConstraintsWithSimplify[in] sc1.constraintItem: ${s}`));
        }
        const symtab = mrNarrow.createRefTypesSymtab();
        sc0.symtab.forEach(({leaf},symbol)=>{
            symtab.set(symbol,{ leaf });
        });
        sc1.symtab.forEach(({leaf},symbol)=>{
            const got = symtab.get(symbol);
            if (!got) symtab.set(symbol,{ leaf });
            else symtab.set(symbol,{ leaf: { ...leaf, type: mrNarrow.intersectRefTypesTypes(leaf.type, got.leaf.type) } });
        });
        const tmpConstraint0 = andSymtabConstraintsWithSimplifyHelper(sc0.constraintItem,sc1.constraintItem);
        let constraintItem: ConstraintItem = tmpConstraint0;
        symtab.forEach(({leaf},symbol)=>{
            const refCountIn: [number]=[0];
            const refCountOut: [number]=[0];
            constraintItem = andDistributeDivide({ symbol,type:leaf.type,declaredType:getDeclaredType(symbol), cin:constraintItem, mrNarrow, refCountIn, refCountOut, depth:0 });
        });
        if (getMyDebug()){
            consoleLog(`andSymtabConstraintsWithSimplify[out]`);
            mrNarrow.dbgRefTypesSymtabToStrings(symtab).forEach(s=>consoleLog(`andSymtabConstraintsWithSimplify[out] symtab: ${s}`));
            mrNarrow.dbgConstraintItem(constraintItem).forEach(s=>consoleLog(`andSymtabConstraintsWithSimplify[out] constraintItem: ${s}`));
            consoleGroupEnd();
        }
        return { symtab,constraintItem };
    }

    /**
     * TODO: Not at all sure about this.
     * @param cin
     * @param rmset
     * @param _mrNarrow
     * @returns
     */
    export function removeSomeVariablesFromConstraint(cin: ConstraintItem, rmset: { has(s: Symbol): boolean}, _mrNarrow: MrNarrow): ConstraintItem {
        const call = (cin: ConstraintItem): ConstraintItem => {
            if (cin.kind===ConstraintItemKind.always || cin.kind===ConstraintItemKind.never) return cin;
            if (cin.kind===ConstraintItemKind.leaf){
                if (rmset.has(cin.symbol)) return createFlowConstraintAlways();
                else return cin;
            }
            else if (cin.kind===ConstraintItemKind.node){
                if (cin.op===ConstraintItemNodeOp.not){
                    const cout = call(cin.constraint);
                    if (isAlwaysConstraint(cout)) return createFlowConstraintNever();
                    if (isNeverConstraint(cout)) return createFlowConstraintAlways();
                    return createFlowConstraintNodeNot(cout);
                }
                if (cin.op===ConstraintItemNodeOp.and){
                    const acout: (ConstraintItem)[]=[];
                    for (const c of cin.constraints){
                        const cout = call(c);
                        if (isAlwaysConstraint(cout)) continue;
                        if (isNeverConstraint(cout)) return createFlowConstraintNever();
                        acout.push(c);
                    }
                    if (acout.length===0) return createFlowConstraintAlways();
                    if (acout.length===1) return acout[0];
                    return { ...cin, constraints: acout };
                }
                if (cin.op===ConstraintItemNodeOp.or){
                    const acout: (ConstraintItem)[]=[];
                    for (const c of cin.constraints){
                        const cout = call(c);
                        if (isAlwaysConstraint(cout)) return createFlowConstraintAlways();
                        if (isNeverConstraint(cout)) continue;
                        acout.push(c);
                    }
                    if (acout.length===0) return createFlowConstraintNever();
                    if (acout.length===1) return acout[0];
                    return { ...cin, constraints: acout };
                }
            }
            Debug.fail();
        };
        return call(cin);
    }

    export function testOfEvalTypeOverConstraint(checker: TypeChecker, mrNarrow: MrNarrow): void {
        type InType = Parameters<typeof evalTypeOverConstraint>;
        type OutType = ReturnType<typeof evalTypeOverConstraint>;

        const rttbool = mrNarrow.createRefTypesType(checker.getBooleanType());
        const rtttrue = mrNarrow.createRefTypesType(checker.getTrueType());
        const rttfalse = mrNarrow.createRefTypesType(checker.getFalseType());
        const symx = { escapedName:"x" } as any as Symbol;
        const symy = { escapedName:"y" } as any as Symbol;

        // @ts-expect-error
        const rttNum = mrNarrow.createRefTypesType(checker.getNumberType());
        // @ts-expect-error
        const rttStr = mrNarrow.createRefTypesType(checker.getStringType());
        const rttNumStr = mrNarrow.createRefTypesType([checker.getNumberType(), checker.getStringType()]);
        const rttLitNum0 = mrNarrow.createRefTypesType(checker.createLiteralType(TypeFlags.NumberLiteral,0));
        // @ts-expect-error
        const rttLitNum1 = mrNarrow.createRefTypesType(checker.createLiteralType(TypeFlags.NumberLiteral,1));

        const datum: {in: InType[0],out: OutType}[] = [
            {
                in: {
                    cin: createFlowConstraintNodeNot(createFlowConstraintLeaf(symx, rttfalse)),
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
                    cin: createFlowConstraintAlways(),
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

        //andDistributeDivide
        type DDArgs = Parameters<typeof andDistributeDivide>["0"];
        const dddata: { in: DDArgs, out: (cout: ConstraintItem) => void }[] = [
            {
                in: {
                    symbol:symx, type:rttLitNum0, declaredType: rttNumStr,
                    cin: createFlowConstraintLeaf(symx, rttNumStr),
                    mrNarrow, refCountIn:[0], refCountOut:[0]
                },
                out: (cout: ConstraintItem) => {
                    Debug.assert(isAlwaysConstraint(cout));
                }
            }
        ];
        dddata.forEach(dda=>{
            // @ts-expect-error
            const r = andDistributeDivide(dda.in);
        });

    }


}


