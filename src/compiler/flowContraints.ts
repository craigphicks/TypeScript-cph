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
    export function createFlowConstraintLeaf(symbol: Symbol, type: RefTypesType): ConstraintItemLeaf {
        return {
            kind: ConstraintItemKind.leaf,
            symbol, type
        };
    }
    // @ts-expect-error
    export function mrNarrowTypeByConstraint({symbol, type, constraintNode}: {symbol: Symbol, type: RefTypesType, constraintNode: ConstraintItemNode}): RefTypesType {
        return type;
    }
}
