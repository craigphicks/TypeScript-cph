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
    export function mrNarrowTypeByConstraint({symbol, type, constraintItemNode}: {symbol: Symbol, type: RefTypesType, constraintItemNode: ConstraintItemNode}): RefTypesType {
        return type;
    }

    export function trySimplifyConstraintBySubstitution(
        // @ts-expect-error
        constraintItemNode: ConstraintItemNode, symbol: Symbol, type: RefTypesType
        // @ts-expect-error
    ): {success: boolean, constraintItemNode?: ConstraintItemNode}{

    }
    // @ts-expect-error
    export function andIntoConstrainTrySimplify({symbol, type, constraintItemNode}: {symbol: Symbol, type: RefTypesType, constraintItemNode: ConstraintItemNode}): ConstraintItemNode {

    }
}
