import { Expression, ExpressionStatement, FlowLabel, FlowNode, FlowNodeBase, LocalsContainer, Node, SourceFile } from "./types";


export const enum FloughFlags {
    Unreachable    = 1 << 0,  // Unreachable code
    Start          = 1 << 1,  // Start of flow graph
    BranchLabel    = 1 << 2,  // Non-looping junction
    LoopLabel      = 1 << 3,  // Looping junction
    Assignment     = 1 << 4,  // Assignment
    TrueCondition  = 1 << 5,  // Condition known to be true
    FalseCondition = 1 << 6,  // Condition known to be false
    SwitchClause   = 1 << 7,  // Switch statement clause
    ArrayMutation  = 1 << 8,  // Potential array mutation
    Call           = 1 << 9,  // Potential assertion call
    ReduceLabel    = 1 << 10, // Temporarily reduce antecedents of label
    Referenced     = 1 << 11, // Referenced as antecedent once
    Shared         = 1 << 12, // Referenced as antecedent more than once
    ExpressionStatement = 1<<13, // Plain expression statement
    Label = BranchLabel | LoopLabel,
    Condition = TrueCondition | FalseCondition,
};

//export type FloughNodeBase = FlowNodeBase; // doesn't work well because of { flags: FlowFlags; }
export type FloughNodeBase = {
    flags: FloughFlags;
    id?: number; // Node id used by flow type cache in checker
}

export type FloughNode = FlowNode | FlowExpressionStatement;

export interface FlowExpressionStatement extends FloughNodeBase {
    node: Expression; // was ExpressionStatement;
    antecedent: FlowNode;
};

export interface FloughWithAntecedent extends FlowNodeBase {
    antecedent: FloughNode;
}
export interface FloughWithAntecedents extends FlowNodeBase {
    antecedents: FloughNode[];
}

export interface NodeWithFlough extends Node {
    flowNode: FloughNode;
}

export const enum BranchKind {
    none = "none",
    then = "then",
    else = "else",
    postIf = "postIf",
    // while loop labels - these may change
    preWhileLoop = "preWhileLoop",
    preWhileBody = "preWhileBody",
    postWhileLoop = "postWhileLoop",
    // loop= "loop",
    // loopConitinue= "loopContinue",
    // postLoop= "postLoop",
    block = "block",
    postBlock = "postBlock",
}


export interface FloughLabel extends FlowLabel {
    antecedents: FlowNode[] | undefined;
    branchKind?: BranchKind;
    // In case of branchKind===BranchKind.postIf originatingExpression refers to the condtion of the corresponding if statement.
    // In case of branchKind===BranchKind.postBlock originatingExpression refers to the ???
    originatingExpression?: Node; // currently only present when branchKind===BranchKind.postIf
    controlExits?: FlowNode[];
};

export interface SourceFileWithFloughNodes extends SourceFile {
    allFlowNodes?: FloughNode[];
    allNodesWithFlowOneSourceFile?: (NodeWithFlough /*& LocalsContainer*/)[];
};

