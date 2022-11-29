namespace ts {

    export function createFlowConstraintNodeAnd({negate, constraints}: {negate?: boolean, constraints: ConstraintItem[]}): ConstraintItemNode {
        return {
            kind: ConstraintItemKind.node,
            op: ConstraintItemNodeOp.and,
            negate,
            constraints
        };
    }
    export function createFlowConstraintNodeOr({negate, constraints}: {negate?: boolean, constraints: ConstraintItem[]}): ConstraintItemNode {
        return {
            kind: ConstraintItemKind.node,
            op: ConstraintItemNodeOp.or,
            negate,
            constraints
        };
    }
    export function createFlowConstraintLeaf(symbol: Symbol, type: RefTypesType, negate?: boolean): ConstraintItemLeaf {
        return negate? {
            kind: ConstraintItemKind.leaf,
            symbol, type, negate
        } : {
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
    export function mrNarrowTypeByConstraint({symbol, type, constraintItem}: {symbol: Symbol, type: RefTypesType, constraintItem: ConstraintItem | null}, mrNarrow: MrNarrow): RefTypesType {
        if (!constraintItem) return type;
        if (constraintItem.kind===ConstraintItemKind.leaf){
            if (constraintItem.symbol!==symbol) return type;
            if (!constraintItem.negate){
                return mrNarrow.intersectRefTypesTypes(type, constraintItem.type);
            }
            else {
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
                if (constraintItem.negate) tmpTypeI = mrNarrow.inverseType(tmpTypeI, type);
                return tmpTypeI;
            }
            else {
                // Debug.assert(constraintItem.op===ConstraintItemNodeOp.or);
                /**
                 * return the union of constraints
                 */
                 let tmpTypeU = mrNarrow.createRefTypesType(); // never / empty
                 constraintItem.constraints.forEach(c=>{
                     const t = mrNarrowTypeByConstraint({ symbol,type,constraintItem:c }, mrNarrow);
                     mrNarrow.mergeToRefTypesType({ source:t,target:tmpTypeU });
                 });
                 if (constraintItem.negate) {
                    tmpTypeU = mrNarrow.inverseType(tmpTypeU, type);
                    //tmpTypeU = mrNarrow.intersectRefTypesTypes(tmpTypeU, type);
                 }
                 return tmpTypeU;
            }
        }
        return type;
    }





    function getDefaultType(sym: Symbol, mrNarrow: MrNarrow): RefTypesType {
        const tstype = mrNarrow.checker.getTypeOfSymbol(sym);
        const type = mrNarrow.createRefTypesType(tstype);
        return type;
    }


    function simplifyConstraintBySubstitution2(
        cin: ConstraintItem | null, symbol: Symbol, type: RefTypesType, dfltTypeOfSymbol: RefTypesType | undefined, mrNarrow: MrNarrow,
        // @ts-expect-error
    ): [ConstraintItem | null, RefTypesType ] {
        function calcIntersectionIfNotImplied(tsub: Readonly<RefTypesType>, ctype: RefTypesType, negateType: boolean): null | RefTypesType {
            if (!negateType) return mrNarrow.intersectRefTypesTypesIfNotAImpliesB(tsub, ctype);
            else {
                if (!dfltTypeOfSymbol) dfltTypeOfSymbol = getDefaultType(symbol, mrNarrow);
                const useType: RefTypesType = mrNarrow.inverseType(ctype, dfltTypeOfSymbol);
                return mrNarrow.intersectRefTypesTypesIfNotAImpliesB(tsub, useType);
            }
        }

        // eslint-disable-next-line no-null/no-null
        if (!cin) return [ null, type ];
        if (cin.kind===ConstraintItemKind.leaf){
            if (cin.symbol!==symbol) return [cin, type];

            const tmpType = calcIntersectionIfNotImplied(type, cin.type, cin.negate??false);
            // eslint-disable-next-line no-null/no-null
            if (!tmpType) return [null, type];
            return [
                { kind: ConstraintItemKind.leaf, symbol, type: tmpType },
                tmpType
            ];
        }

        if (cin.op===ConstraintItemNodeOp.and){
            /**
             * case and:
             * For each member constr of cin
             *   If tsub implies constr, then remove constr, else replace tsub with and(tsub,constr).
             * Finally, if (type!==tsub) then add tsub as constraint
             */
            let tsub = type;
            let changed = true;
            let hadAnyChange0 = false;
            //const removedIdxs: number[] = [];
            let constraints = cin.constraints;
            while (changed) {
                changed = false;
                //const changedContent: [idx:number, ct: ConstraintItem][] = [];
                const removedIdxSet = new Set<number>();
                const changedConstraints: ConstraintItem[] = [];
                constraints.forEach((c,idx)=>{
                    const [c1,tsub1] = simplifyConstraintBySubstitution2(c, symbol, tsub, dfltTypeOfSymbol, mrNarrow);
                    if (c1!==c){
                        removedIdxSet.add(idx);
                        if (c1) changedConstraints.push(c1);
                    }
                    if (tsub1!==tsub) {
                        tsub = tsub1;
                        changed = true;
                    }
                });
                if (removedIdxSet.size){
                    hadAnyChange0 = true;
                    changed = true;
                    constraints = constraints.filter((_c,idx)=>removedIdxSet.has(idx));
                    constraints.push(...changedConstraints);
                }

            } // while changed
            // eslint-disable-next-line no-null/no-null
            if (!hadAnyChange0) return [cin, type];
            if (constraints.length===0) {
                // eslint-disable-next-line no-null/no-null
                if (tsub===type) return [null, type];
                return [{
                    kind: ConstraintItemKind.leaf,
                    type: tsub,
                    negate: false,
                    symbol
                }, tsub];
            }
            if (tsub!==type) {
                constraints.push({
                    kind: ConstraintItemKind.leaf,
                    type: tsub,
                    negate: false,
                    symbol
                });
            }
            return [{
                ...cin,
                constraints
            }, tsub];
        }
        else if (cin.op===ConstraintItemNodeOp.or){
            /**
             * case or:
             * If for any member constr of cin, type implies constr, then type implies cin, so return null.
             */
            const removedIdxSet = new Set<number>();
            const changedConstraints: ConstraintItem[] = [];
            let constraints = cin.constraints;
            for (let idx=0; idx<constraints.length; idx++){
                const c = constraints[idx];
                const [c1] = simplifyConstraintBySubstitution2(c, symbol, type, dfltTypeOfSymbol, mrNarrow);
                // eslint-disable-next-line no-null/no-null
                if (!c1) return [ null, type];
                if (c1!==c){
                    removedIdxSet.add(idx);
                    if (c1) changedConstraints.push(c1);
                }
            }
            let hadAnyChange = false;
            if (removedIdxSet.size||changedConstraints.length){
                constraints = constraints.filter((_c,idx)=>removedIdxSet.has(idx));
                constraints.push(...changedConstraints);
                hadAnyChange = true;
            }
            if (!hadAnyChange) return [cin, type];
            // eslint-disable-next-line no-null/no-null
            if (constraints.length===0) return [null, type];
            return [{
                ...cin,
                constraints
            }, type];
        }
    }


    // function simplifyConstraintBySubstitution(
    //     cin: ConstraintItemNode, symbol: Symbol, type: RefTypesType, mrNarrow: MrNarrow
    //     // @ts-expect-error
    // ): [ConstraintItem | null, RefTypesType ] {
    //     let dfltTypeOfSymbol: RefTypesType | undefined;
    //     function calcIntersectionIfNotImplied(tsub: Readonly<RefTypesType>, ctype: RefTypesType, negateType: boolean): null | RefTypesType {
    //         if (!negateType) return mrNarrow.intersectRefTypesTypesIfNotAImpliesB(tsub, ctype);
    //         else {
    //             if (!dfltTypeOfSymbol) dfltTypeOfSymbol = getDefaultType(symbol, mrNarrow);
    //             const useType: RefTypesType = mrNarrow.inverseType(ctype, dfltTypeOfSymbol);
    //             return mrNarrow.intersectRefTypesTypesIfNotAImpliesB(tsub, useType);
    //         }
    //     }
    //     if (cin.op===ConstraintItemNodeOp.and){
    //         /**
    //          * case and:
    //          * For each member constr of cin
    //          *   If tsub implies constr, then remove constr, else replace tsub with and(tsub,constr).
    //          * Finally, if (type!==tsub) then add tsub as constraint
    //          */
    //         let tsub = type;
    //         let changed = true;
    //         let hadAnyChange0 = false;
    //         //const removedIdxs: number[] = [];
    //         let constraints = cin.constraints;
    //         while (changed) {
    //             changed = false;
    //             //const changedContent: [idx:number, ct: ConstraintItem][] = [];
    //             const removedIdxSet = new Set<number>();
    //             const changedConstraints: ConstraintItem[] = [];
    //             constraints.forEach((c,idx)=>{
    //                 //if (removedIdxs.includes(idx)) return;
    //                 if (c.kind===ConstraintItemKind.leaf){
    //                     if (c.symbol===symbol){
    //                         /**
    //                          * if tsub is not a superset of c.type, then leaf will be replaced by intersection
    //                          */
    //                         //const cNegate = pushNegate ? !(c.negate??false) : (c.negate??false);
    //                         const tmpType = calcIntersectionIfNotImplied(tsub, c.type, c.negate??false);
    //                         removedIdxSet.add(idx);
    //                         if (tmpType){
    //                             tsub = tmpType;
    //                         }
    //                     }
    //                 }
    //                 else {
    //                     Debug.assert(c.kind===ConstraintItemKind.node);
    //                     const [c1,tsub1] = simplifyConstraintBySubstitution(c, symbol, tsub, mrNarrow);
    //                     if (c1!==c){
    //                         removedIdxSet.add(idx);
    //                         if (c1) changedConstraints.push(c1);
    //                     }
    //                     if (tsub1!==tsub) {
    //                         tsub = tsub1;
    //                         changed = true;
    //                     }
    //                 }
    //             });
    //             if (removedIdxSet.size){
    //                 hadAnyChange0 = true;
    //                 changed = true;
    //                 constraints = constraints.filter((_c,idx)=>removedIdxSet.has(idx));
    //                 constraints.push(...changedConstraints);
    //             }

    //         } // while changed
    //         // eslint-disable-next-line no-null/no-null
    //         if (!hadAnyChange0) return [cin, type];
    //         if (constraints.length===0) {
    //             // eslint-disable-next-line no-null/no-null
    //             if (tsub===type) return [null, type];
    //             return [{
    //                 kind: ConstraintItemKind.leaf,
    //                 type: tsub,
    //                 negate: false,
    //                 symbol
    //             }, tsub];
    //         }
    //         if (tsub!==type) {
    //             constraints.push({
    //                 kind: ConstraintItemKind.leaf,
    //                 type: tsub,
    //                 negate: false,
    //                 symbol
    //             });
    //         }
    //         return [{
    //             ...cin,
    //             constraints
    //         }, tsub];
    //     }
    //     else if (cin.op===ConstraintItemNodeOp.or){
    //         /**
    //          * case or:
    //          * If for any member constr of cin, type implies constr, then type implies cin, so return null.
    //          */
    //         const removedIdxSet = new Set<number>();
    //         const changedConstraints: ConstraintItem[] = [];
    //         let constraints = cin.constraints;
    //         for (let idx=0; idx<constraints.length; idx++){
    //             const c = constraints[idx];
    //             if (c.kind===ConstraintItemKind.leaf){
    //                 if (c.symbol===symbol){
    //                     const tmpType = calcIntersectionIfNotImplied(type, c.type, c.negate??false);
    //                     // tmpType will be null if type implies c
    //                     // eslint-disable-next-line no-null/no-null
    //                     if (!tmpType) return [ null, type];
    //                     removedIdxSet.add(idx);
    //                     changedConstraints.push({
    //                         kind: ConstraintItemKind.leaf,
    //                         type: tmpType,
    //                         negate: false,
    //                         symbol
    //                     });
    //                 }
    //             }
    //             else if (c.kind===ConstraintItemKind.node){
    //                 const [c1] = simplifyConstraintBySubstitution(c, symbol, type, mrNarrow);
    //                 // eslint-disable-next-line no-null/no-null
    //                 if (!c1) return [ null, type];
    //                 if (c1!==c){
    //                     removedIdxSet.add(idx);
    //                     if (c1) changedConstraints.push(c1);
    //                 }
    //             }
    //             else Debug.assert(false);
    //         }
    //         let hadAnyChange = false;
    //         if (removedIdxSet.size||changedConstraints.length){
    //             constraints = constraints.filter((_c,idx)=>removedIdxSet.has(idx));
    //             constraints.push(...changedConstraints);
    //             hadAnyChange = true;
    //         }
    //         if (!hadAnyChange) return [cin, type];
    //         // eslint-disable-next-line no-null/no-null
    //         if (constraints.length===0) return [null, type];
    //         return [{
    //             ...cin,
    //             constraints
    //         }, type];
    //     }
    // }

    // @ ts-expect-error
    export function andIntoConstrainTrySimplify({symbol, type, constraintItem: constraintItemNode, mrNarrow}: {symbol: Symbol, type: RefTypesType, constraintItem: ConstraintItem | undefined, mrNarrow: MrNarrow}): [ConstraintItemNode, RefTypesType] {
        if (!constraintItemNode){
            return [
                { kind: ConstraintItemKind.node, op: ConstraintItemNodeOp.and, constraints: [{ kind: ConstraintItemKind.leaf, symbol, type }] },
                type
            ];
        }
        const x = simplifyConstraintBySubstitution2(constraintItemNode, symbol, type, /* dfltTypeOfSymbol */ undefined, mrNarrow);
        if (!x[0]) {
            return [
                { kind: ConstraintItemKind.node, op: ConstraintItemNodeOp.and, constraints: [{ kind: ConstraintItemKind.leaf, symbol, type }] },
                type
            ];
        }
        else if (x[0].kind===ConstraintItemKind.leaf){
            return [
                { kind: ConstraintItemKind.node, op: ConstraintItemNodeOp.and, constraints: [x[0]] },
                type
            ];
        }
        else {
            //Debug.assert(x[0] && x[0].kind===ConstraintItemKind.node);
            return x as [ConstraintItemNode, RefTypesType];
        }
    }
}
