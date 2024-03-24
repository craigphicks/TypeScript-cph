import {
    BranchKind, FloughFlags, FloughLabel,
    FloughNode,
    FlowExpressionStatement, SourceFileWithFloughNodes,
    FloughNodeBase,
    NodeWithFlough, FloughWithAntecedent, FloughWithAntecedents,
} from "./floughTsExtensions";

import { TypeFacts } from "./checker";
import {
    LogicalObjectAccessReturn,
} from "./floughLogicalObjectInner";
import {
    RefTypesType,
    FloughType,
} from "./floughType";
import {
    RefTypesSymtab,
} from "./floughGroupRefTypesSymtab";
import {
    Type,
    Node,
    Expression,
    ElementAccessExpression,
    PropertyAccessExpression,
    LiteralType,
    TupleTypeReference,
    TypeReference,
    ObjectType,
    Symbol,
    Identifier,
    RelationComparisonResult,
    PseudoBigInt,
    TypeFlags,
    VariableDeclaration,
    ElementFlags,
    NamedTupleMember,
    ParameterDeclaration,
    SourceFile,
} from "./types";

import {
    TypeChecker as TSTypeChecker,
} from "./types";
import { FloughSymtab } from "./floughSymtab";



export interface Relations {
    subtypeRelation: RelationMap;
    strictSubtypeRelation: RelationMap;
    assignableRelation: RelationMap;
    comparableRelation: RelationMap;
    identityRelation: RelationMap;
    enumRelation: RelationMap;
}


export type FloughTypeChecker = TSTypeChecker & {
    loadFloughStateForSourceFile(sourceFile: SourceFile): void; // called from harnessIO.ts
    getFlowNodeId(node: FloughNode): number;
    getIntersectionType(types: Type[]): Type;
    getUnionType(types: Type[]): Type;
    forEachType<T>(type: Type, f: (t: Type) => T | undefined): T | undefined,
    isArrayOrTupleType(type: Type): boolean;
    isTupleType(type: Type): type is TupleTypeReference;
    isArrayOrTupleType(type: Type): type is TypeReference;
    isReadonlyArrayType(type: Type): boolean;
    createReaonlyTupleTypeFromTupleType(type: TupleTypeReference): Type;
    createArrayType(elementType: Type, readonly?: boolean): ObjectType;
    getUnknownType(): Type;
    getErrorType(): Type;
    everyContainedType(type: Type, f: (t: Type) => boolean): boolean;
    getAssignableRelation(): RelationMap;
    isConstVariable(symbol: Symbol): boolean;
    getResolvedSymbol(node: Identifier, noDiagnostics?: boolean): Symbol;
    getSymbolOfNode(node: Node): Symbol | undefined;
    getFlowNodeId(flowNode: FloughNode): number;
    getTypeOfExpression(node: Expression): Type;
    createLiteralType(flags: TypeFlags, value: string | number | PseudoBigInt, symbol?: Symbol, regularType?: LiteralType): LiteralType;
    getTypeFacts(type: Type, callerOnlyNeeds: TypeFacts): TypeFacts;
    isTypeRelatedTo(source: Type, target: Type, relation: Map<string, RelationComparisonResult>): boolean;
    isConstantReference(node: Node): boolean;
    getRelations(): Relations;
    widenTypeInferredFromInitializer(node: VariableDeclaration, type: Type): Type;
    getFreshTypeOfLiteralType(type: Type): Type;
    createTupleType(elementTypes: readonly Type[], elementFlags?: readonly ElementFlags[],
        readonly?: boolean, namedMemberDeclarations?: readonly (NamedTupleMember | ParameterDeclaration | undefined)[]): Type;
};

type RelationMap = Map<string, RelationComparisonResult>;

export type PartitionForEqualityCompareItemTpl<TT> = {
    left?: Readonly<TT>;
    right?: Readonly<TT>;
    both?: Readonly<TT>;
    leftts?: Type[];
    rightts?: Type[];
    bothts?: Type;
    true?: boolean;
    false?: boolean;
};

export type LogicalObjecAccessData = {
    logicalObjectAccessReturn: LogicalObjectAccessReturn;
    finalTypeIdx: number;
};

export type RefTypesTable = RefTypesTableReturn | RefTypesTableReturnNoSymbol;

export type RefTypesTableReturnNoSymbol = {
    type: RefTypesType;
    sci: RefTypesSymtabConstraintItem;
    logicalObjectAccessData?: LogicalObjecAccessData;
};
export type RefTypesTableReturn = {
    symbol?: Symbol | undefined;
    isconst?: boolean;
    isAssign?: boolean; // don't need assignType because it will always be whole type.
    critsense?: "passing" | "failing"; // TODO: remove this
    type: RefTypesType;
    sci: RefTypesSymtabConstraintItem;
    logicalObjectAccessData?: LogicalObjecAccessData;
};
export enum FloughCritKind {
    none = "none",
    truthy = "truthy",
    notnullundef = "notnullundef",
    assignable = "assignable",
    subtype = "subtype",
    equalLiteral = "equalLiteral",
}
export type FloughCrit =
    & (
        | {
            kind: typeof FloughCritKind.none; // this is just to get the resulting type without any criteria
            negate?: false;
        }
        | {
            kind: typeof FloughCritKind.truthy;
            negate?: boolean;
        }
        | {
            kind: typeof FloughCritKind.notnullundef;
            negate?: boolean;
        }
        | {
            kind: typeof FloughCritKind.assignable;
            negate?: boolean;
            target: Type;
        }
        | {
            kind: typeof FloughCritKind.subtype;
            negate?: boolean;
            target: Type;
        }
        | {
            kind: typeof FloughCritKind.equalLiteral;
            negate?: boolean;
            targetFloughType: FloughType;
        }
    )
    & { alsoFailing?: boolean; done?: true; }; // also output failing, in addition to passing

export type ReplayableItem = {
    symbol: Symbol;
    isconst: boolean;
    expr: Node;
    nodeToTypeMap: NodeToTypeMap;
};

export type RefTypesSymtabConstraintItemNotNever = {
    fsymtab?: FloughSymtab | undefined;
    symtab: RefTypesSymtab;
    constraintItem: ConstraintItemNotNever;
};
export type RefTypesSymtabConstraintItemNever = {
    constraintItem: ConstraintItemNever;
};

export interface RefTypesSymtabConstraintItem {
    fsymtab?: FloughSymtab | undefined;
    symtab?: RefTypesSymtab | undefined;
    constraintItem: ConstraintItem;
}

// export type RefDeltaInferState = {
//     symtab: RefTypesSymtab;
//     constraintItem: ConstraintItem;
//     deltaNodeToTypeMap: Map<Node, Type>;
//     floughStatus: FloughStatus;
// };

export type ReplayData = {
    byNode: NodeToTypeMap;
};

export type TypeCheckerFn = (...args: any[]) => any;

export type FloughStatus = {
    inCondition: boolean;
    currentReplayableItem?: undefined | ReplayableItem;
    replayables: WeakMap<Symbol, ReplayableItem>;
    groupNodeToTypeMap: Map<Node, Type>;
    accumBranches: boolean;
    isInLoop?: boolean;
    isAsConstObject?: boolean | undefined; // Passed from AsExpression to floughObjectLiteralExprssion
    /**
     * This allows checker.getTypeOfExpression(expr) to be called on any node in groupNodeToTypeMap, which may be conputed deep within a speculative branch,
     * e.g., floughByCallExpression.  (In test _cax-fn-0020.ts it is called in SpreadElement deep under floughByCallExpression)
     * @param expr
     * @param checker
     */
    getTypeOfExpressionShallowRecursion(sc: RefTypesSymtabConstraintItem, expr: Expression, returnErrorTypeOnFail?: boolean): Type;
    callCheckerFunctionWithShallowRecursion<FN extends TypeCheckerFn>(expr: Expression, sc: RefTypesSymtabConstraintItem, returnErrorTypeOnFail: boolean, checkerFn: FN, ...args: Parameters<FN>): ReturnType<FN>;
};

/**
 * 'roots' is an array of entries to the access chain, not intermediate nodes.
 * However, 'keyTypes' is an array of FloughTypes, each entry corresponding to one level of the access chain.
 * 'roots' and 'keyTypes' may therefore be different lengths.
 * 'expressions' are the nodes corresponding to the access chain objects, and are the same length as 'keyTypes'.
 */
export type AccessArgsRoot = RefTypesTableReturn;
export type AccessArgs = {
    roots: AccessArgsRoot[] | undefined;
    keyTypes: FloughType[];
    expressions: Expression[];
};
export type FloughArgs = {
    sci: RefTypesSymtabConstraintItem;
    expr: Readonly<Node>;
    qdotfallout?: RefTypesTableReturn[];
    floughStatus: FloughStatus;
    crit: FloughCrit;
    accessDepth?: number;
    refAccessArgs?: [{
        roots: AccessArgsRoot[] | undefined; // the length of this array is the number of branches in the root
        keyTypes: FloughType[]; // the length of this array is the depth of the access chain
        expressions: (ElementAccessExpression | PropertyAccessExpression)[]; // the length of this array is the depth of the access chain
    }]; // a tuple of an array, only set by callees which are accessor expressions
};

export type NodeToTypeMap = Map<Node, Type>;
export type FloughReturn = {
    unmerged: Readonly<RefTypesTableReturn[]>;
    nodeForMap: Readonly<Node>;
    typeof?: {
        map: Map<Type, RefTypesType>;
        argSymbol: Symbol;
    };
};

export type FloughRefInnerArgs = {
    sci: RefTypesSymtabConstraintItemNotNever;
    expr: Readonly<Node>;
    qdotfallout?: RefTypesTableReturn[] | undefined;
    floughStatus: FloughStatus;
};

export type FloughInnerReturn = {
    unmerged: Readonly<RefTypesTableReturn[]>;
    typeof?: {
        map: Map<Type, RefTypesType>;
        argSymbol: Symbol;
    };
};
export enum ConstraintItemKind {
    node = "node",
    leaf = "leaf",
    never = "never",
    always = "always",
}
export enum ConstraintItemNodeOp {
    or = "or",
    and = "and",
    not = "not",
}
export type ConstraintItemBase = {
    kind: ConstraintItemKind;
    symbolsInvolved?: Set<Symbol>;
};
export type ConstraintItemNodeAnd = ConstraintItemBase & {
    kind: ConstraintItemKind.node;
    op: ConstraintItemNodeOp.and;
    constraints: (ConstraintItem)[];
};
export type ConstraintItemNodeOr = ConstraintItemBase & {
    kind: ConstraintItemKind.node;
    op: ConstraintItemNodeOp.or;
    constraints: (ConstraintItem)[];
};
export type ConstraintItemNodeNot = ConstraintItemBase & {
    kind: ConstraintItemKind.node;
    op: ConstraintItemNodeOp.not;
    constraint: ConstraintItem;
};
export type ConstraintItemNode = ConstraintItemNodeAnd | ConstraintItemNodeOr | ConstraintItemNodeNot;
export type ConstraintItemLeaf = ConstraintItemBase & {
    kind: ConstraintItemKind.leaf;
    symbol: Symbol;
    type: RefTypesType;
};
export type ConstraintItemNever = ConstraintItemBase & {
    kind: ConstraintItemKind.never;
};
export type ConstraintItemAlways = ConstraintItemBase & {
    kind: ConstraintItemKind.always;
};
export type ConstraintItemNotNever = ConstraintItemLeaf | ConstraintItemNode | ConstraintItemAlways;
export type ConstraintItem = ConstraintItemLeaf | ConstraintItemNode | ConstraintItemNever | ConstraintItemAlways;

export type LiteralTypeNumber = LiteralType & { value: number; };
export type LiteralTypeString = LiteralType & { value: string; };

export function everyForMap<K, V>(m: Map<K, V>, f: (v: V, k: K) => boolean): boolean {
    for (let iter = m.entries(), it = iter.next(); !it.done; it = iter.next()) {
        if (!f(it.value[1], it.value[0])) return false;
    }
    return true;
}
export function everyForSet<K>(m: Set<K>, f: (k: K) => boolean): boolean {
    for (let iter = m.keys(), it = iter.next(); !it.done; it = iter.next()) {
        if (!f(it.value)) return false;
    }
    return true;
}

export function assertCastType<T>(_x: any): asserts _x is T {}
// export function castHereafter<U>(x: any): asserts x is U {}
