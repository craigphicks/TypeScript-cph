/* eslint-disable no-null/no-null */
namespace ts {

    // @ ts-expect-error
    export type GetDeclaredTypeFn = (symbol: Symbol) => RefTypesType;

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
                return mrNarrow.intersectionOfRefTypesType(cin.type,typeRange);
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
        symbol, type, declaredType, cin, negate, getDeclaredType, mrNarrow, refCountIn, refCountOut, depth}:
        {symbol: Symbol, type: RefTypesType, declaredType: RefTypesType, cin: ConstraintItem, negate?: boolean | undefined, getDeclaredType: GetDeclaredTypeFn,
            mrNarrow: MrNarrow, refCountIn?: [number], refCountOut?: [number], depth?: number
    }): ConstraintItem {
        if (!refCountIn) refCountIn=[0];
        if (!refCountOut) refCountOut=[0];
        const doLog = false;
        if (doLog && getMyDebug()){
            consoleGroup(`andDistributeDivide[in][${depth??0}] symbol:${symbol.escapedName}, type: ${mrNarrow.dbgRefTypesTypeToString(type)}, typeRange: ${mrNarrow.dbgRefTypesTypeToString(declaredType)}, negate: ${negate??false}}, countIn: ${refCountIn[0]}, countOut: ${refCountOut[0]}`);
            mrNarrow.dbgConstraintItem(cin).forEach(s=>{
                consoleLog(`andDistributeDivide[in][${depth??0}] constraint: ${s}`);
            });
        }
        const creturn = andDistributeDivideAux({ symbol, type, declaredType, cin, negate, getDeclaredType, mrNarrow, refCountIn, refCountOut, depth });
        if (doLog && getMyDebug()){
            consoleLog(`andDistributeDivide[out][${depth??0}] countIn: ${refCountIn[0]}, countOut: ${refCountOut[0]}`);
            mrNarrow.dbgConstraintItem(creturn).forEach(s=>{
                consoleLog(`andDistributeDivide[out][${depth??0}] constraint: ${s}`);
            });
            consoleGroupEnd();
        }
        return creturn;
    }
    function andDistributeDivideAux({
        symbol, type, declaredType: declaredType, cin, negate, getDeclaredType, mrNarrow, refCountIn, refCountOut, depth}:
        {symbol: Symbol, type: RefTypesType, declaredType: RefTypesType, cin: ConstraintItem, negate?: boolean | undefined, getDeclaredType: GetDeclaredTypeFn,
            mrNarrow: MrNarrow, refCountIn: [number], refCountOut: [number], depth?: number
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
                    const isectType = mrNarrow.intersectionOfRefTypesType(cin.type, type);
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
                    const isectInvType = mrNarrow.intersectionOfRefTypesType(mrNarrow.subtractFromType(cin.type, declaredType), type);
                    if (mrNarrow.isNeverType(isectInvType)) return createFlowConstraintNever();
                    if (!mrNarrow.isASubsetOfB(type,isectInvType)) return createFlowConstraintLeaf(symbol,isectInvType);
                    return createFlowConstraintAlways();
                }
            }
        }
        else {
            Debug.assert(cin.kind===ConstraintItemKind.node);
            if (cin.op===ConstraintItemNodeOp.not){
                return andDistributeDivide({ symbol, type, declaredType, cin:cin.constraint, negate:!negate, getDeclaredType, mrNarrow, refCountIn, refCountOut, depth: depth+1 });
            }
            else if ((cin.op===ConstraintItemNodeOp.and && !negate) || (cin.op===ConstraintItemNodeOp.or && negate)){
                const constraints: (ConstraintItem)[]=[];
                const mapSymbolLeafs = new Map<Symbol, Set<ConstraintItemLeaf>>(); // for gathering same symbol leafs
                for (const subc of cin.constraints){
                    const subcr = andDistributeDivide({ symbol, type, declaredType, cin:subc, negate, getDeclaredType, mrNarrow, refCountIn, refCountOut, depth: depth+1 });
                    if (isAlwaysConstraint(subcr)) {
                        refCountOut[0]--;
                        continue;
                    }
                    if (isNeverConstraint(subcr)) {
                        refCountOut[0]-=(constraints.length-1);
                        return subcr;
                    }
                    if (subcr.kind===ConstraintItemKind.leaf){
                        const got = mapSymbolLeafs.get(subcr.symbol);
                        if (!got) mapSymbolLeafs.set(subcr.symbol, new Set<ConstraintItemLeaf>([subcr]));
                        else got.add(subcr);
                        continue;
                    }
                    constraints.push(subcr);
                }
                let hasNeverLeaf = false;
                mapSymbolLeafs.forEach((setc,csymbol)=>{
                    if (setc.size===1) constraints.push(setc.values().next().value as ConstraintItem);
                    else {
                        const atype: RefTypesType[] = [];
                        setc.forEach(cleaf=>atype.push(cleaf.type));
                        const ctype = mrNarrow.intersectionOfRefTypesType(...atype);
                        if (mrNarrow.isNeverType(ctype)) hasNeverLeaf = true;
                        constraints.push({ kind:ConstraintItemKind.leaf,symbol:csymbol,type:ctype });
                    }
                });
                if (hasNeverLeaf) return createFlowConstraintNever();
                if (constraints.length===0) return createFlowConstraintAlways();
                if (constraints.length===1) return constraints[0];
                return createFlowConstraintNodeAnd({ constraints });
            }
            else if ((cin.op===ConstraintItemNodeOp.or && !negate) || (cin.op===ConstraintItemNodeOp.and && negate)){
                const constraints: (ConstraintItem)[]=[];
                const mapSymbolLeafs = new Map<Symbol, Set<ConstraintItemLeaf>>(); // for gathering same symbol leafs
                for (const subc of cin.constraints){
                    const subcr = andDistributeDivide({ symbol, type, declaredType, cin:subc, negate, getDeclaredType, mrNarrow, refCountIn, refCountOut, depth: depth+1 });
                    if (isAlwaysConstraint(subcr)) {
                        refCountOut[0]-=(constraints.length-1);
                        return createFlowConstraintAlways();
                    }
                    if (isNeverConstraint(subcr)) {
                        refCountOut[0]--;
                        continue;
                    }
                    if (subcr.kind===ConstraintItemKind.leaf){
                        const got = mapSymbolLeafs.get(subcr.symbol);
                        if (!got) mapSymbolLeafs.set(subcr.symbol, new Set<ConstraintItemLeaf>([subcr]));
                        else got.add(subcr);
                        continue;
                    }
                    constraints.push(subcr);
                }
                let hasAlwaysLeaf = false;
                mapSymbolLeafs.forEach((setc,csymbol)=>{
                    if (setc.size===1) constraints.push(setc.values().next().value as ConstraintItem);
                    else {
                        const atype: RefTypesType[] = [];
                        setc.forEach(cleaf=>atype.push(cleaf.type));
                        const ctype = mrNarrow.unionOfRefTypesType(atype);
                        const cdeclType = getDeclaredType(csymbol);
                        if (mrNarrow.isASubsetOfB(cdeclType,ctype)) hasAlwaysLeaf = true;
                        constraints.push({ kind:ConstraintItemKind.leaf,symbol:csymbol,type:ctype });
                    }
                });
                if (hasAlwaysLeaf) return createFlowConstraintAlways();
                if (constraints.length===0) return createFlowConstraintNever();
                if (constraints.length===1) return constraints[0];
                return createFlowConstraintNodeOr({ constraints });
            }
            Debug.fail();
        }
    }

    function andIntoConstraintShallow({symbol, type, constraintItem, mrNarrow}: {symbol: Symbol, type: RefTypesType, constraintItem: ConstraintItem, mrNarrow: MrNarrow}): ConstraintItem {
        if (mrNarrow.isNeverType(type)) return createFlowConstraintNever();
        // TODO: if there was a symbol table input we could check for always
        if (constraintItem.kind===ConstraintItemKind.always){
            return { kind: ConstraintItemKind.leaf, symbol, type };
        }
        if (constraintItem.kind===ConstraintItemKind.never) return constraintItem;
        if (constraintItem.kind===ConstraintItemKind.leaf){
            if (constraintItem.symbol===symbol){
                const isecttype = mrNarrow.intersectionOfRefTypesType(type, constraintItem.type);
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
    function orIntoConstraintsShallow(acin: Readonly<(ConstraintItem)[]>): ConstraintItem {
        const ac: ConstraintItem[]=[];
        for (const c of acin){
            if (isAlwaysConstraint(c)) return createFlowConstraintAlways();;
            if (!isNeverConstraint(c)) ac.push(c);
        }
        if (ac.length===0) return createFlowConstraintNever();
        if (ac.length===1) return ac[0];
        return createFlowConstraintNodeOr({ constraints:ac });
    }

    /**
     *  Calculate "or" (union) of array of RefTypesSymtabConstraintItem
     * @param asc
     * @param getDeclaredType
     * Prior to combining under an or node, each sub-constraint is shallow anded with each of its symtab entries {symbol,type} if necessary,
     * where necessity exists if type is a strict subset of unionSymtab.get(symbol).
     */
    export function orSymtabConstraints(asc: Readonly<RefTypesSymtabConstraintItem>[], mrNarrow: MrNarrow /*, getDeclaredType: GetDeclaredTypeFn*/): RefTypesSymtabConstraintItem{
        const mapSymbolCount = new Map<Symbol,number>();
        asc.forEach(sc=>sc.symtab.forEach((_,symbol)=>{
            const got = mapSymbolCount.get(symbol);
            if (!got) mapSymbolCount.set(symbol,1);
            else mapSymbolCount.set(symbol,got+1);
        }));
        const unionSymtab = mrNarrow.unionArrRefTypesSymtab(asc.map(x=>x.symtab)); // isconst===false symbols get properly handled here
        const arrCI: ConstraintItem[] = [];
        asc.forEach(({symtab,constraintItem})=>{
            symtab.forEach(({leaf:{isconst,type}},symbol)=>{
                if (isconst && mapSymbolCount.get(symbol)!>1 && !mrNarrow.isASubsetOfB(unionSymtab.get(symbol)!.leaf.type, type)) {
                    constraintItem = andIntoConstraintShallow({ symbol,type,constraintItem,mrNarrow });
                }
            });
            arrCI.push(constraintItem);
        });
        return { symtab: unionSymtab, constraintItem: orIntoConstraintsShallow(arrCI) };
    }

    export function andSymbolTypeIntoSymtabConstraint({symbol,isconst,type,sc, mrNarrow, getDeclaredType}: Readonly<{
        symbol: Readonly<Symbol>,
        readonly isconst: undefined | boolean,
        type: Readonly<RefTypesType>,
        sc: RefTypesSymtabConstraintItem,
        getDeclaredType: GetDeclaredTypeFn,
        mrNarrow: MrNarrow}>): { type: RefTypesType, sc: RefTypesSymtabConstraintItem } {

        assertSymtabConstraintInvariance({ symtab: sc.symtab, constraintItem: sc.constraintItem }, mrNarrow);

        let { symtab, constraintItem: tmpConstraintItem } = sc;
        let setTypeTmp = type;
        const got = symtab.get(symbol);
        symtab = mrNarrow.copyRefTypesSymtab(symtab); // for now always make this copy even though it might not be modified TODO:
        if (got) {
            setTypeTmp = mrNarrow.intersectionOfRefTypesType(got.leaf.type, type);
        }
        else {
            // There is no possibility that the constraints contain symbol that the
            symtab.set(symbol,{ leaf:mrNarrow.createRefTypesTableLeaf(symbol,isconst,setTypeTmp) });
        }

        if (isconst){  // shouldn't need to do this if isASubsetOfB(type,setTypeTmp)
            const declType = getDeclaredType(symbol);
            // if (!declType){
            //     Debug.assert(declType);
            // }
            if (true){
            // Expecting that setTypeTmp can be a strict subset of setTypeTmpCheck, but not the reverse.
                const evaledType = evalTypeOverConstraint({ cin:tmpConstraintItem, symbol, typeRange: type, mrNarrow });
                if (mrNarrow.isASubsetOfB(evaledType, setTypeTmp) && !mrNarrow.isASubsetOfB(setTypeTmp, evaledType)){
                    const astr: string[]=[];
                    astr.push("[before andDistributeDivide] mrNarrow.isASubsetOfB(evaledType, setTypeTmp) && !mrNarrow.isASubsetOfB(setTypeTmp, evaledType)");
                    astr.push(`symbol: ${mrNarrow.dbgSymbolToStringSimple(symbol)}`);
                    astr.push(`type: ${mrNarrow.dbgRefTypesTypeToString(type)}`);
                    astr.push(`setTypeTmp: ${mrNarrow.dbgRefTypesTypeToString(setTypeTmp)}`);
                    astr.push(`evaledType:${mrNarrow.dbgRefTypesTypeToString(evaledType)}`);
                    mrNarrow.dbgRefTypesSymtabToStrings(symtab).forEach(s=> astr.push(`symtab: ${s}`));
                    mrNarrow.dbgConstraintItem(tmpConstraintItem).forEach(s=> astr.push(`constraintItem: ${s}`));
                    Debug.fail(astr.join(`\n`));
                }
                // if (mrNarrow.isASubsetOfB(setTypeTmp, setTypeTmpCheck) && !mrNarrow.isASubsetOfB(setTypeTmpCheck, setTypeTmp)){
                //     Debug.fail();
                // }
            }
            const refCountIn = [0] as [number];
            const refCountOut = [0] as [number];
            tmpConstraintItem = andDistributeDivide({ symbol, type: setTypeTmp, declaredType: declType, cin: tmpConstraintItem, mrNarrow, getDeclaredType, refCountIn, refCountOut });

            if (true){
                // Would running evalTypeOverConstraint help? It doesn't seem to change the type.  This development test assert the type is not changed.
                const evaledType = evalTypeOverConstraint({ cin:tmpConstraintItem, symbol, typeRange: setTypeTmp, mrNarrow });
                if (mrNarrow.isASubsetOfB(evaledType, setTypeTmp) && !mrNarrow.isASubsetOfB(setTypeTmp, evaledType)){
                    Debug.fail();
                }
                if (mrNarrow.isASubsetOfB(setTypeTmp, evaledType) && !mrNarrow.isASubsetOfB(evaledType, setTypeTmp)){
                    const astr: string[]=[];
                    astr.push("[after andDistributeDivide] mrNarrow.isASubsetOfB(setTypeTmp, evaledType) && !mrNarrow.isASubsetOfB(evaledType, setTypeTmp)");
                    astr.push(`symbol: ${mrNarrow.dbgSymbolToStringSimple(symbol)}`);
                    astr.push(`type: ${mrNarrow.dbgRefTypesTypeToString(type)}`);
                    astr.push(`setTypeTmp: ${mrNarrow.dbgRefTypesTypeToString(setTypeTmp)}`);
                    astr.push(`evaledType:${mrNarrow.dbgRefTypesTypeToString(evaledType)}`);
                    mrNarrow.dbgConstraintItem(tmpConstraintItem).forEach(s=> astr.push(`tmpConstraintItem: ${s}`));
                    Debug.fail(astr.join(`\n`));
                }
            }

            // TODO: Could this be optimized by evaluating all symbols together in a single pass, instead of calling once per symbol?
            // Seems like either way it is O(#(tree nodes) * #(symbols)), but might be less function calls in a single pass.
            //
            // Some subconstraints may have collapsed thus destroying the SymtabConstraint invariance, and so the symtab must be corrected before returning.
            symtab.forEach(({leaf},tmpSymbol)=>{
                if (!leaf.isconst) return;
                if (tmpSymbol===symbol) return;
                const evaledType = evalTypeOverConstraint({ cin:tmpConstraintItem, symbol:tmpSymbol, typeRange: leaf.type, mrNarrow });
                symtab.set(
                    tmpSymbol,
                    {leaf: {
                        kind: RefTypesTableKind.leaf,
                        symbol:tmpSymbol,
                        isconst,
                        type: evaledType,
                    },
                });
            });
        } // if (isconst)
        symtab.set(
            symbol,
            {leaf: {
                kind: RefTypesTableKind.leaf,
                symbol,
                isconst,
                type: setTypeTmp,
            },
        });
        assertSymtabConstraintInvariance({ symtab, constraintItem: tmpConstraintItem }, mrNarrow);
        return { type: setTypeTmp, sc:{ symtab, constraintItem: tmpConstraintItem } };
    };

    function visitDNF(ciTop: Readonly<ConstraintItem>, visitor: (aci: Readonly<ConstraintItemLeaf[]>) => void): void {
        function worker(aleaf: Readonly<ConstraintItemLeaf>[], ciLeft: Readonly<ConstraintItem>, negate: boolean, aciRight: Readonly<ConstraintItem>[]): void{
            if (ciLeft.kind===ConstraintItemKind.never || ciLeft.kind===ConstraintItemKind.always) Debug.fail("not yet implemented");
            if (ciLeft.kind===ConstraintItemKind.leaf){
                if (aciRight.length) worker([...aleaf, ciLeft], aciRight[0], negate, aciRight.slice(1));
                else visitor([...aleaf, ciLeft]);
            }
            else if (ciLeft.kind===ConstraintItemKind.node){
                if (ciLeft.op===ConstraintItemNodeOp.not) worker(aleaf, ciLeft.constraint, !negate, aciRight);
                else if ((ciLeft.op===ConstraintItemNodeOp.or && !negate) || (ciLeft.op===ConstraintItemNodeOp.and && negate)){
                    ciLeft.constraints.forEach(ciOfOr=>{
                        worker(aleaf, ciOfOr, negate, aciRight);
                    });
                }
                else if ((ciLeft.op===ConstraintItemNodeOp.and && !negate) || (ciLeft.op===ConstraintItemNodeOp.or && negate)){
                    worker(aleaf, ciLeft.constraints[0], negate, [...ciLeft.constraints.slice(1), ...aciRight]); // OK?
                }
            }
        };
        worker([],ciTop,/*negate*/ false,[]);
    }

    // @ ts-expect-error
    function collectSymbolsInvolvedInConstraints(ciTop: ConstraintItem): Set<Symbol>{
        const set = new Set<Symbol>();
        const func = (ci: ConstraintItem) => {
            if (ci.kind===ConstraintItemKind.leaf){
                set.add(ci.symbol);
            }
            else if (ci.kind===ConstraintItemKind.node){
                if (ci.op===ConstraintItemNodeOp.not) func(ci.constraint);
                else ci.constraints.forEach(citmp=>func(citmp));
            }
        };
        func(ciTop);
        return set;
    }

    export function assertSymtabConstraintInvariance({symtab,constraintItem}: Readonly<RefTypesSymtabConstraintItem>, mrNarrow: MrNarrow): void {
        // assert that every symbol involved in constraints is also in symtab
        const set = collectSymbolsInvolvedInConstraints(constraintItem);
        set.forEach(symbol=>{
            if (!symtab.has(symbol)){
                const astr: string[]=[];
                astr.push("assertSymtabConstraintInvariance symtab must containt all symbol involved in constraint");
                astr.push(`symbol: ${mrNarrow.dbgSymbolToStringSimple(symbol)}`);
                mrNarrow.dbgRefTypesSymtabToStrings(symtab).forEach(s=>astr.push(`symtab: ${s}`));
                mrNarrow.dbgConstraintItem(constraintItem).forEach(s=>astr.push(`constraintItem:${s}`));
                Debug.fail(astr.join(`\n`));
            }
        });
        symtab.forEach(({leaf:{isconst,type}},symbol)=>{
            if (!isconst) return;
            const evaledType = evalTypeOverConstraint({ symbol,typeRange:type,cin:constraintItem,mrNarrow });
            // evaledType and type must be equal
            if (!mrNarrow.isASubsetOfB(evaledType,type) || !mrNarrow.isASubsetOfB(type,evaledType)){
                const astr: string[]=[];
                astr.push("assertSymtabConstraintInvariance evaledType and type must be equal");
                astr.push(`symbol: ${mrNarrow.dbgSymbolToStringSimple(symbol)}`);
                astr.push(`type: ${mrNarrow.dbgRefTypesTypeToString(type)}`);
                astr.push(`evaledType:${mrNarrow.dbgRefTypesTypeToString(evaledType)}`);
                mrNarrow.dbgRefTypesSymtabToStrings(symtab).forEach(s=> astr.push(`symtab: ${s}`));
                mrNarrow.dbgConstraintItem(constraintItem).forEach(s=> astr.push(`constraintItem: ${s}`));
                Debug.fail(astr.join(`\n`));
            }
        });
    }

    /**
     * TODO: Not at all sure about this.  We cannot remove variables are they go out of scope because returns or other jumps means the variable still plays a role
     * because it is entangled with other variables outside the scope.
     * Another way to say it that the scope (in terms of flow) really doesn't end (despite lexically ending).
     * @param cin
     * @param rmset
     * @param _mrNarrow
     * @returns
     */
    export function removeSomeVariablesFromConstraint(cin: ConstraintItem, rmset: { has(s: Symbol): boolean}, _mrNarrow: MrNarrow): ConstraintItem {
        Debug.fail();
        // const call = (cin: ConstraintItem): ConstraintItem => {
        //     if (cin.kind===ConstraintItemKind.always || cin.kind===ConstraintItemKind.never) return cin;
        //     if (cin.kind===ConstraintItemKind.leaf){
        //         if (rmset.has(cin.symbol)) return createFlowConstraintAlways();
        //         else return cin;
        //     }
        //     else if (cin.kind===ConstraintItemKind.node){
        //         if (cin.op===ConstraintItemNodeOp.not){
        //             const cout = call(cin.constraint);
        //             if (isAlwaysConstraint(cout)) return createFlowConstraintNever();
        //             if (isNeverConstraint(cout)) return createFlowConstraintAlways();
        //             return createFlowConstraintNodeNot(cout);
        //         }
        //         if (cin.op===ConstraintItemNodeOp.and){
        //             const acout: (ConstraintItem)[]=[];
        //             for (const c of cin.constraints){
        //                 const cout = call(c);
        //                 if (isAlwaysConstraint(cout)) continue;
        //                 if (isNeverConstraint(cout)) return createFlowConstraintNever();
        //                 acout.push(c);
        //             }
        //             if (acout.length===0) return createFlowConstraintAlways();
        //             if (acout.length===1) return acout[0];
        //             return { ...cin, constraints: acout };
        //         }
        //         if (cin.op===ConstraintItemNodeOp.or){
        //             const acout: (ConstraintItem)[]=[];
        //             for (const c of cin.constraints){
        //                 const cout = call(c);
        //                 if (isAlwaysConstraint(cout)) return createFlowConstraintAlways();
        //                 if (isNeverConstraint(cout)) continue;
        //                 acout.push(c);
        //             }
        //             if (acout.length===0) return createFlowConstraintNever();
        //             if (acout.length===1) return acout[0];
        //             return { ...cin, constraints: acout };
        //         }
        //     }
        //     Debug.fail();
        // };
        // return call(cin);
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
        // @ts-expect-error
        const rttNumStr = mrNarrow.createRefTypesType([checker.getNumberType(), checker.getStringType()]);
        // @ts-expect-error
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

        // Have to remove this test until the new arg "getDeclaredType" is provided
        //andDistributeDivide
        // type DDArgs = Parameters<typeof andDistributeDivide>["0"];
        // const dddata: { in: DDArgs, out: (cout: ConstraintItem) => void }[] = [
        //     {
        //         in: {
        //             symbol:symx, type:rttLitNum0, declaredType: rttNumStr,
        //             cin: createFlowConstraintLeaf(symx, rttNumStr),
        //             mrNarrow, refCountIn:[0], refCountOut:[0]
        //         },
        //         out: (cout: ConstraintItem) => {
        //             Debug.assert(isAlwaysConstraint(cout));
        //         }
        //     }
        // ];
        // dddata.forEach(dda=>{
        //     // @ts-expect-error
        //     const r = andDistributeDivide(dda.in);
        // });

    }


}


