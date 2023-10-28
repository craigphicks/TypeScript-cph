import {
    SymbolLinks,
    NodeLinks,
    TransientSymbolLinks,
    MappedSymbolLinks,
    ReverseMappedSymbolLinks,
} from "./_namespaces/ts";

export type ExtendedSymbolLinks = SymbolLinks & Partial<TransientSymbolLinks & MappedSymbolLinks & ReverseMappedSymbolLinks>;

export const extendedSymbolLinksKeys = [
    //"_symbolLinksBrand",
    "immediateTarget",
    "aliasTarget",
    "target",
    "type",
    "writeType",
    "nameType",
    "uniqueESSymbolType",
    "declaredType",
    "typeParameters",
    "outerTypeParameters",
    "instantiations",
    "aliasSymbol",
    "aliasTypeArguments",
    "inferredClassSymbol",
    "mapper",
    "referenced",
    "constEnumReferenced",
    "containingType",
    "leftSpread",
    "rightSpread",
    "syntheticOrigin",
    "isDiscriminantProperty",
    "resolvedExports",
    "resolvedMembers",
    "exportsChecked",
    "typeParametersChecked",
    "isDeclarationWithCollidingName",
    "bindingElement",
    "exportsSomeValue",
    "enumKind",
    "originatingImport",
    "lateSymbol",
    "specifierCache",
    "extendedContainers",
    "extendedContainersByFile",
    "variances",
    "deferralConstituents",
    "deferralWriteConstituents",
    "deferralParent",
    "cjsExportMerged",
    "typeOnlyDeclaration",
    "typeOnlyExportStarMap",
    "typeOnlyExportStarName",
    "isConstructorDeclaredProperty",
    "tupleLabelDeclaration",
    "accessibleChainCache",
    "filteredIndexSymbolCache",
    "checkFlags",
    "mappedType",
    "keyType",
    "propertyType",
    "constraintType",
] as const;

{
    type ExtendedSymbolLinksKeysFromArray = typeof extendedSymbolLinksKeys[number];
    type ExtendedSymbolLinksKeysFromObject = Exclude<keyof ExtendedSymbolLinks, "_symbolLinksBrand">;
    type T1 = Exclude<ExtendedSymbolLinksKeysFromObject, ExtendedSymbolLinksKeysFromArray>;
    type T2 = Exclude<ExtendedSymbolLinksKeysFromArray, ExtendedSymbolLinksKeysFromObject>;
    // mouse on T1, T2 if error
    (null as any as T1) satisfies never;
    (null as any as T2) satisfies never;
}

export const nodeLinksKeys = [
    "flags",
    "resolvedType",
    "resolvedEnumType",
    "resolvedSignature",
    "resolvedSymbol",
    "resolvedIndexInfo",
    "effectsSignature",
    "enumMemberValue",
    "isVisible",
    "containsArgumentsReference",
    "hasReportedStatementInAmbientContext",
    "jsxFlags",
    "resolvedJsxElementAttributesType",
    "resolvedJsxElementAllAttributesType",
    "resolvedJSDocType",
    "switchTypes",
    "jsxNamespace",
    "jsxImplicitImportContainer",
    "contextFreeType",
    "deferredNodes",
    "capturedBlockScopeBindings",
    "outerTypeParameters",
    "isExhaustive",
    "skipDirectInference",
    "declarationRequiresScopeChange",
    "serializedTypes",
    "decoratorSignature",
    "spreadIndices",
    "parameterInitializerContainsUndefined",
    "fakeScopeForSignatureDeclaration",
    "assertionExpressionType",
] as const;

{
    type NodeLinksKeysFromArray = typeof nodeLinksKeys[number];
    type NodeLinksKeysFromObject = keyof NodeLinks;
    type T1 = Exclude<NodeLinksKeysFromObject, NodeLinksKeysFromArray>;
    type T2 = Exclude<NodeLinksKeysFromArray, NodeLinksKeysFromObject>;
    // mouse on T1, T2 if error
    (null as any as T1) satisfies never;
    (null as any as T2) satisfies never;
}
