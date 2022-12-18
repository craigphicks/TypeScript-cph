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

    function getDefaultType(sym: Symbol, mrNarrow: MrNarrow): RefTypesType {
        const tstype = mrNarrow.checker.getTypeOfSymbol(sym);
        const type = mrNarrow.createRefTypesType(tstype);
        return type;
    }

    /**
     * - The constraints "cin" are simplified under the assumption that "type of symbol is in the set type" is an additional constraint.
     * In other words that "type of symbol is in the set type" is anded with constraint.
     * If negateConstraintType is true then the sense of constraint is reversed, without explicitly rewriting the constraint.
     * We don't want to explicly rewrite the constraint because, generally speaking, the programmer entered expression of "and", "or", and "not" is already
     * approximately optimal in terms of space, while rewriting that - e.g. to get rid of nots or convert to all ands, could greatly expand the space requirements.
     * @param param0
     * @returns
     *
     * - The return value is a tuple [ConstraintItem | null, RefTypesType ]
     * - The first element "cout" is the simplified constraint. A value of "null" indicates the constraint has been completely replaced by the "symbol,type" assumption.
     * - The second element "typeOut" is indicates that the type of "symbol" is further constrained to be in the set "typeOut".
     * If "typeOut"==="type" that means no such further constraint was detected. "typeOut" is used internally in recursive calls for "and" calculations.
     */
    function simplifyConstraintBySubstitution2(
        {cin, negateConstraintType, symbol, type, dfltTypeOfSymbol, mrNarrow, depth}: {
            cin: ConstraintItem | null, negateConstraintType: boolean, symbol: Symbol, type: RefTypesType, dfltTypeOfSymbol: RefTypesType | undefined, mrNarrow: MrNarrow, depth?: number},
    ): [cout: ConstraintItem | null, typeOut: RefTypesType, implies: boolean ] {
        // function calcIntersectionIfNotImplied(tsub: Readonly<RefTypesType>, ctype: RefTypesType, negateType: boolean): null | RefTypesType {
        //     if (!negateType) return mrNarrow.intersectRefTypesTypesIfNotAImpliesB(tsub, ctype);
        //     else {
        //         if (!dfltTypeOfSymbol) dfltTypeOfSymbol = getDefaultType(symbol, mrNarrow);
        //         const useType: RefTypesType = mrNarrow.inverseType(ctype, dfltTypeOfSymbol);
        //         return mrNarrow.intersectRefTypesTypesIfNotAImpliesB(tsub, useType);
        //     }
        // }
        function calcIntersectionImplies(tsub: Readonly<RefTypesType>, ctype: RefTypesType, negateType: boolean): [isect: RefTypesType, implies: boolean] {
            if (!negateType) return mrNarrow.intersectRefTypesTypesImplies(tsub, ctype);
            else {
                if (!dfltTypeOfSymbol) dfltTypeOfSymbol = getDefaultType(symbol, mrNarrow);
                const useType: RefTypesType = mrNarrow.inverseType(ctype, dfltTypeOfSymbol);
                return mrNarrow.intersectRefTypesTypesImplies(tsub, useType);
            }
        }

        // eslint-disable-next-line no-null/no-null
        if (!cin) return [ null, type, false ];
        if (cin.kind===ConstraintItemKind.leaf){
            if (cin.symbol!==symbol) return [cin, type, false];

            /**
             * type relation to (possibly negated)cin.type (call it c) => [return constraint, return type]
             * return constraint of null means it can be removed
             * equal => [null, type]
             * strict subset => [null, type]
             * superset => [c.in, c.type] - constraint not removed because c.type is more restrictive than type (or maybe we can?)
             * strict intersection => [intersection constraint, intersection type]) - ditto not removed
             */
            // "implied" means type is a subset of cin.type in which case calcIntersectionIfNotImplied return null
            const [tmpType, implies] = calcIntersectionImplies(type, cin.type, negateConstraintType);
            // eslint-disable-next-line no-null/no-null
            // nbif (!tmpType) return [null, type];
            return [
                // eslint-disable-next-line no-null/no-null
                null, //{ kind: ConstraintItemKind.leaf, symbol, type: tmpType },
                tmpType,
                implies
            ];
        }

        if (cin.op===ConstraintItemNodeOp.not){
            return simplifyConstraintBySubstitution2({ cin, symbol, type, dfltTypeOfSymbol, negateConstraintType: !negateConstraintType, mrNarrow, depth:(depth??0)+1 });
        }
        if ((cin.op===ConstraintItemNodeOp.and && !negateConstraintType) || (cin.op===ConstraintItemNodeOp.or && negateConstraintType)) {
            if (depth && depth>=3){
                consoleLog("depth && depth>=3");
            }
            /**
             * case and:
             * For each member constr of cin
             *   If tsub implies constr, then remove constr, else replace tsub with and(tsub,constr).
             * Finally, if (type!==tsub) then add tsub as constraint
             */
            let changed = true;
            let tsub = type;
            let constraints = cin.constraints;
            let implies = true;
            let dbgCount = 0;
            while (changed) {
                implies = true;
                changed = false;
                //const changedContent: [idx:number, ct: ConstraintItem][] = [];
                const removedIdxSet = new Set<number>();
                const changedConstraints: ConstraintItem[] = [];
                constraints.forEach((c,idx)=>{
                    // _implies is not used in "and" processing
                    const [c1,tsub1, impliesout] = simplifyConstraintBySubstitution2({ cin:c, symbol, type:tsub, dfltTypeOfSymbol, negateConstraintType, mrNarrow, depth:(depth??0)+1 });
                    implies &&= impliesout;
                    if (c1!==c){
                        removedIdxSet.add(idx);
                        if (c1) changedConstraints.push(c1);
                    }
                    if (!mrNarrow.equalRefTypesTypes(tsub1,tsub)) { //if (tsub1!==tsub)
                        tsub = tsub1;
                        changed = true;
                    }
                });
                if (removedIdxSet.size){
                    changed = true;
                    constraints = constraints.filter((_c,idx)=>!removedIdxSet.has(idx));
                    constraints.push(...changedConstraints);
                }
                dbgCount++;
                if (dbgCount===3){
                    consoleLog("mybad");
                }
            } // while changed
            // eslint-disable-next-line no-null/no-null
            if (constraints.length===0) return [null, tsub, implies];
            if (constraints.length===1) return [constraints[0], tsub, implies];
            if (constraints===cin.constraints) return [cin, tsub, implies];
            return [createFlowConstraintNodeAnd({ constraints }), tsub, implies];
        }
        if ((cin.op===ConstraintItemNodeOp.or && !negateConstraintType) || (cin.op===ConstraintItemNodeOp.and && negateConstraintType)) {
            /**
             * case or:
             * constraints out := if (any returned subimplies is true || all returned subconstraints are null) then null else cin.contraints
             * typeout := union of all returned subtypes
             * impliesout := typeout equivalent to cin.type && countraints out is null
             */

            // const results: ReturnType<typeof simplifyConstraintBySubstitution2>[] = cin.constraints.map(subcin=>{
            //     simplifyConstraintBySubstitution2({ cin: subcin, symbol, type, dfltTypeOfSymbol, negateConstraintType, mrNarrow });
            // });
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let idx=0; idx<cin.constraints.length; idx++){
                const subcin = cin.constraints[idx];
                const [_subconstr, _subtype, subimplies] = simplifyConstraintBySubstitution2({ cin: subcin, symbol, type, dfltTypeOfSymbol, negateConstraintType, mrNarrow, depth:(depth??0)+1 });
                if (subimplies){
                    return [null, type, true];
                }
            }
            return [
                //createFlowConstraintNodeAnd({ constraints: [createFlowConstraintLeaf(symbol,type),cin] }),
                cin,
                type,
                false
            ];

            // const removedIdxSet = new Set<number>();
            // const changedConstraints: ConstraintItem[] = [];
            // let constraints = cin.constraints;
            // //let tunion = mrNarrow.createRefTypesType(); // never
            // const typesForUnion: RefTypesType[] = [];
            // let anySubImplies = false;
            // let anySubTypeWasType = false;
            // for (let idx=0; idx<constraints.length; idx++){
            //     const subcin = constraints[idx];
            //     const [subconstr, subtype, subimplies] = simplifyConstraintBySubstitution2({ cin: subcin, symbol, type, dfltTypeOfSymbol, negateConstraintType, mrNarrow });
            //     anySubImplies ||= subimplies;
            //     anySubTypeWasType ||= (subtype===type);
            //     if (subconstr!==subcin){
            //         removedIdxSet.add(idx);
            //         if (subconstr) changedConstraints.push(subconstr);
            //     }
            // }
            // // (A) TODO: Uncomment this after the testing (B) below is remove
            // if (anySubImplies){
            //     // eslint-disable-next-line no-null/no-null
            //     return [null, type, true];
            // }
            // //let hadAnyChange = false;
            // if (removedIdxSet.size||changedConstraints.length){
            //     constraints = constraints.filter((_c,idx)=>removedIdxSet.has(idx));
            //     constraints.push(...changedConstraints);
            //     //hadAnyChange = true;
            // }
            // /* eslint prefer-const: ["error", {"destructuring": "all"}]*/
            // let [typeout, typeoutEquivTypein] = anySubTypeWasType ? [type, true] : [mrNarrow.unionOfRefTypesType(typesForUnion), false];
            // if (!typeoutEquivTypein){
            //     if (mrNarrow.equalRefTypesTypes(type, typeout)) typeoutEquivTypein = true;
            // }
            // let impliesout = false;
            // let constraintItemOut: ConstraintItem | null;
            // // In order not to increase space requirements, and because distributing type (or )
            // if (constraints.length===0){
            //     // eslint-disable-next-line no-null/no-null
            //     constraintItemOut = null;
            //     impliesout = typeoutEquivTypein;
            // }
            // else {
            //     constraintItemOut = cin;
            // }
            // // (B) TODO: Comment this when (A) above is activated
            // // if (anySubImplies) {
            // //     Debug.assert(!constraintItemOut);
            // //     Debug.assert(typeoutEquivTypein);
            // //     Debug.assert(impliesout);
            // // }
            // return [constraintItemOut, typeout, impliesout];

        }
        Debug.fail("unexpected");
    }

    export function andIntoConstrainTrySimplify_aux({symbol, type, constraintItem, mrNarrow}: {symbol: Symbol, type: RefTypesType, constraintItem: ConstraintItem | undefined, mrNarrow: MrNarrow}): [ConstraintItem, RefTypesType] {
        if (!constraintItem){
            return [{ kind: ConstraintItemKind.leaf, symbol, type }, type];
        }
        const [cout, typeout] = simplifyConstraintBySubstitution2({ cin:constraintItem, negateConstraintType:false, symbol, type, dfltTypeOfSymbol: undefined, mrNarrow });
        if (!cout) {
            return [{ kind: ConstraintItemKind.leaf, symbol, type:typeout }, typeout];
        }
        else if (cout.kind===ConstraintItemKind.leaf){
            return [
                { kind: ConstraintItemKind.node, op: ConstraintItemNodeOp.and, constraints: [
                    cout,
                    { kind: ConstraintItemKind.leaf, symbol, type:typeout }
                ] }, typeout ];
        }
        else if (cout.kind===ConstraintItemKind.node){
            if (cout.op===ConstraintItemNodeOp.not || cout.op===ConstraintItemNodeOp.or) {
                return [
                    { kind: ConstraintItemKind.node, op: ConstraintItemNodeOp.and, constraints: [
                        cout,
                        { kind: ConstraintItemKind.leaf, symbol, type:typeout }
                    ] }, typeout ];
            }
            else if (cout.op===ConstraintItemNodeOp.and){
                cout.constraints.push({ kind: ConstraintItemKind.leaf, symbol, type:typeout });
                return [cout, type];
            }
        }
        Debug.fail("unexpected");
    }
    export function andIntoConstrainTrySimplify({symbol, type, constraintItem, mrNarrow}: {symbol: Symbol, type: RefTypesType, constraintItem: ConstraintItem | undefined, mrNarrow: MrNarrow}): [ConstraintItem, RefTypesType] {
        const [c,r] = andIntoConstrainTrySimplify_aux({ symbol, type, constraintItem, mrNarrow });
        //testCompareBeforeAfter({ symbol, type, c:constraintItem }, { c }, mrNarrow);
        return [c,r];


    }

    ////////////////////////////////////////////////
    /**
     * For testing only, remove for production
     */

    /**
     * - Testing: Want to ensure "before" and after of logical transformation retain the same results.
     * This is done by forming an exhaustive table of results for each case, and comparing the tables.
     * 1. Extract all the symbols in "before" to a set.  (Will be a superset of the symbols in "after").
     * 2.1. For each symbol in set, enumerate, and recursively to the same with the set remainder.
     * 2.2. At each recursion leaf, evaluate "before" and "after" reps, which should share the same boolean result.
     */
    // @ts-expect-error
    function testCompareBeforeAfter(before: { c: ConstraintItem | undefined, symbol: Symbol, type: RefTypesType }, after: {c: ConstraintItem}, mrNarrow: MrNarrow): void {
        function getSymbols(ci0: ConstraintItem){
            //const map = new Map<Symbol, RefTypesType>();
            const set = new Set<Symbol>();
            function getSymbols1(ci1: ConstraintItem){
                if (ci1.kind===ConstraintItemKind.leaf){
                    set.add(ci1.symbol);
                }
                else {
                    if (ci1.op===ConstraintItemNodeOp.not){
                        getSymbols1(ci1.constraint);
                    }
                    else {
                        ci1.constraints.forEach(ci2=>getSymbols1(ci2));
                    }
                }
            }
            getSymbols1(ci0);
            return set;
        }
        function evalConstraintWithExplicitTypes(ctop: Readonly<ConstraintItem>, map: ESMap<Symbol, Type>): boolean {
            function evalSub(c: Readonly<ConstraintItem>): boolean{
                if (c.kind===ConstraintItemKind.leaf){
                    //const rtt = !negate ? c.type : mrNarrow.inverseType(c.type, getDefaultType(c.symbol, mrNarrow));
                    const rtt = c.type;
                    const mapt = map.get(c.symbol);
                    Debug.assert(mapt);
                    const x = mrNarrow.intersectRefTypesTypes(mrNarrow.createRefTypesType(mapt), rtt);
                    let [ pass, fail ] = [false,false];
                    mrNarrow.applyCritToRefTypesType(x, { kind:InferCritKind.truthy }, (_xt,p,f)=>{
                        pass||=p;
                        fail||=f;
                    });
                    Debug.assert(!(pass&&fail));
                    Debug.assert(pass||fail);
                    return pass;
                }
                else {
                    if (c.op===ConstraintItemNodeOp.not){
                        return !evalSub(c.constraint);
                    }
                    else if (c.op===ConstraintItemNodeOp.and){
                        const b: boolean = c.constraints.every(cs=>evalSub(cs));
                        return b;
                    }
                    else if (c.op===ConstraintItemNodeOp.or){
                        const b: boolean = c.constraints.some(cs=>evalSub(cs));
                        return b;
                    }
                    Debug.fail();
                }
            }
            return evalSub(ctop);
        }
        function compareOverSymbolsAndTypes(ci0: Readonly<ConstraintItem>, ci1: Readonly<ConstraintItem>, arrsym: Readonly<Symbol[]>){
            const map = new Map<Symbol, Type>();
            function sub1(a: Readonly<Symbol[]>){
                if (a.length===0){
                    const b0 = evalConstraintWithExplicitTypes(ci0, map);
                    const b1 = evalConstraintWithExplicitTypes(ci1, map);
                    if (b0!==b1){
                        Debug.fail("testCompareBeforeAfter failed");
                    }
                }
                else {
                    const twhole = getDefaultType(a[0], mrNarrow);
                    let t1: Type | undefined;
                    if (mrNarrow.isAnyType(twhole)) t1 = mrNarrow.checker.getAnyType();
                    else if (mrNarrow.isUnknownType(twhole)) t1 = mrNarrow.checker.getUnknownType();
                    else if (mrNarrow.isNeverType(twhole)) t1 = mrNarrow.checker.getNeverType();
                    if (t1){
                        map.set(a[0], t1);
                        sub1(a.slice(1));
                    }
                    else {
                        (twhole as RefTypesTypeNormal)._set.forEach(tt=>{
                            map.set(a[0], tt);
                            sub1(a.slice(1));
                        });
                    }
                }
            }
            sub1(arrsym);

        }
        const c0: ConstraintItem = before.c? {
            kind: ConstraintItemKind.node,
            op: ConstraintItemNodeOp.and,
            constraints:[before.c,{ kind: ConstraintItemKind.leaf, symbol:before.symbol, type:before.type }]
        } : { kind: ConstraintItemKind.leaf, symbol:before.symbol, type:before.type };
        const c1 = after.c;

        const set = getSymbols(c0);
        const arrsym: Symbol[] = [];
        set.forEach(s=>arrsym.push(s));
        compareOverSymbolsAndTypes(c0,c1,arrsym);
    }


    export function testOfSimplifyConstraintBySubstitution2(checker: TypeChecker, mrNarrow: MrNarrow): void {
        type InType = Parameters<typeof simplifyConstraintBySubstitution2>;
        type OutType = ReturnType<typeof simplifyConstraintBySubstitution2>;

        const rtrbool = mrNarrow.createRefTypesType(checker.getBooleanType());
        const rtrtrue = mrNarrow.createRefTypesType(checker.getTrueType());
        const rtrfalse = mrNarrow.createRefTypesType(checker.getFalseType());

        const datum: {in: InType[0],out: OutType}[] = [
            {
                in: {
                    cin: null,
                    negateConstraintType: false,
                    symbol: "x" as any as Symbol,
                    type: rtrbool,
                    dfltTypeOfSymbol: rtrbool,
                    mrNarrow,
                },
                out: [null, rtrbool, false]
            },
            {
                in: {
                    cin: createFlowConstraintLeaf("x" as any as Symbol, rtrfalse),
                    negateConstraintType: false,
                    symbol: "x" as any as Symbol,
                    type: rtrbool,
                    dfltTypeOfSymbol: rtrbool,
                    mrNarrow,
                },
                out: [null, rtrfalse, false]
            },
            {
                in: {
                    cin: createFlowConstraintLeaf("x" as any as Symbol, rtrtrue),
                    negateConstraintType: false,
                    symbol: "x" as any as Symbol,
                    type: rtrbool,
                    dfltTypeOfSymbol: rtrbool,
                    mrNarrow,
                },
                out: [null, rtrtrue, false]
            },
            {
                in: {
                    cin: createFlowConstraintLeaf("x" as any as Symbol, rtrfalse),
                    negateConstraintType: false,
                    symbol: "x" as any as Symbol,
                    type: rtrfalse,
                    dfltTypeOfSymbol: rtrbool,
                    mrNarrow,
                },
                out: [null, rtrfalse, true]
            },
        ];
        const constraintDeepEqual = (ctest: ConstraintItem | null, cexp: ConstraintItem | null): void => {
            if (!cexp || !ctest) {
                Debug.assert(!ctest === !cexp);
                return;
            }
            Debug.assert(cexp.kind===ctest.kind);
            if (cexp.kind===ConstraintItemKind.leaf){
                Debug.assert(ctest.kind===ConstraintItemKind.leaf);
                Debug.assert(cexp.symbol===ctest.symbol);
                Debug.assert(mrNarrow.equalRefTypesTypes(cexp.type,ctest.type));
            }
            else {
                Debug.assert(cexp.kind===ConstraintItemKind.node);
                Debug.assert(ctest.kind===ConstraintItemKind.node);
                if (cexp.op===ConstraintItemNodeOp.not){
                    Debug.assert(ctest.op===ConstraintItemNodeOp.not);
                    constraintDeepEqual(ctest.constraint,cexp.constraint);
                }
                else if (cexp.op===ConstraintItemNodeOp.and){
                    Debug.assert(ctest.op===ConstraintItemNodeOp.and);
                    Debug.assert(cexp.constraints.length===ctest.constraints.length);
                    for (let i = 0; i<cexp.constraints.length; i++) {
                        Debug.assert(constraintDeepEqual(cexp.constraints[i],ctest.constraints[i]));
                    }
                }
                else if (cexp.op===ConstraintItemNodeOp.or){
                    Debug.assert(ctest.op===ConstraintItemNodeOp.or);
                    Debug.assert(cexp.constraints.length===ctest.constraints.length);
                    for (let i = 0; i<cexp.constraints.length; i++) {
                        Debug.assert(constraintDeepEqual(cexp.constraints[i],ctest.constraints[i]));
                    }
                }
            }
        };

        datum.forEach((data,_iter)=>{
            if (_iter<0) return;
            const [constraint, type, implies] = simplifyConstraintBySubstitution2(data.in);
            constraintDeepEqual(data.out[0], constraint);
            Debug.assert(mrNarrow.equalRefTypesTypes(data.out[1],type));
            Debug.assert(data.out[2]===implies);
        });

    }


}


