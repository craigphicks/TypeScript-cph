// @strict
declare enum SyntaxKind {
    BreakStatement = 1,
    Other = 2
};
declare type BreakOrContinueStatement = Record<string,any> & { kind: SyntaxKind };
declare type FlowLabel = Record<string,any> 
declare function addAntecedent(flowLabel:FlowLabel, currentFlow:FlowLabel):void;
declare let currentFlow: FlowLabel;
declare const unreachableFlow: FlowLabel;

function bindBreakOrContinueFlow(node: BreakOrContinueStatement, breakTarget: FlowLabel | undefined, continueTarget: FlowLabel | undefined) {
    const flowLabel = node.kind === SyntaxKind.BreakStatement ? breakTarget : continueTarget;
    if (flowLabel) {
        addAntecedent(flowLabel, currentFlow);
        currentFlow = unreachableFlow;
    }
}