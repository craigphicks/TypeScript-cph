function getTupleTargetType(elementFlags: readonly ElementFlags[], readonly: boolean, namedMemberDeclarations?: readonly (NamedTupleMember | ParameterDeclaration)[]): GenericType {
            if (elementFlags.length === 1 && elementFlags[0] & ElementFlags.Rest) {
                // [...X[]] is equivalent to just X[]
                return readonly ? globalReadonlyArrayType : globalArrayType;
            }
            const key = map(elementFlags, f => f & ElementFlags.Required ? "#" : f & ElementFlags.Optional ? "?" : f & ElementFlags.Rest ? "." : "*").join() +
                (readonly ? "R" : "") +
                (namedMemberDeclarations && namedMemberDeclarations.length ? "," + map(namedMemberDeclarations, getNodeId).join(",") : "");
            let type = tupleTypes.get(key);
            if (!type) {
                tupleTypes.set(key, type = createTupleTargetType(elementFlags, readonly, namedMemberDeclarations));
            }
            return type;
        }

        function getTypeFromArrayOrTupleTypeNode(node: ArrayTypeNode | TupleTypeNode): Type {
            const links = getNodeLinks(node);
            if (!links.resolvedType) {
                const target = getArrayOrTupleTargetType(node);
                if (target === emptyGenericType) {
                    links.resolvedType = emptyObjectType;
                }
                else if (!(node.kind === SyntaxKind.TupleType && some(node.elements, e => !!(getTupleElementFlags(e) & ElementFlags.Variadic))) && isDeferredTypeReferenceNode(node)) {
                    links.resolvedType = node.kind === SyntaxKind.TupleType && node.elements.length === 0 ? target :
                        createDeferredTypeReference(target, node, /*mapper*/ undefined);
                }
                else {
                    const elementTypes = node.kind === SyntaxKind.ArrayType ? [getTypeFromTypeNode(node.elementType)] : map(node.elements, getTypeFromTypeNode);
                    links.resolvedType = createNormalizedTypeReference(target, elementTypes);
                }
            }
            return links.resolvedType;
        }


from private writeTypeOrSymbol(node: ts.Node, isSymbolWalk: boolean)

                    typeString = this.checker.typeToString(type, node.parent, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.AllowUniqueESSymbolType);
                    if (ts.isIdentifier(node) && ts.isTypeAliasDeclaration(node.parent) && node.parent.name === node && typeString === ts.idText(node)) {
                        // for a complex type alias `type T = ...`, showing "T : T" isn't very helpful for type tests. When the type produced is the same as
                        // the name of the type alias, recreate the type string without reusing the alias name
                        typeString = this.checker.typeToString(type, node.parent, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.AllowUniqueESSymbolType | ts.TypeFormatFlags.InTypeAlias);
                    }


formatStringFromArgs (/mnt/common/github/TypeScript-cph/src/compiler/utilities.ts:6036)
chainDiagnosticMessages (/mnt/common/github/TypeScript-cph/src/compiler/utilities.ts:6200)
reportError (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:18504)
reportRelationError (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:18577)
reportErrorResults (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:18804)
isRelatedTo (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:18759)
propertiesRelatedTo (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:20213)
structuredTypeRelatedTo (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:19776)
recursiveTypeRelatedTo (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:19225)
isRelatedTo (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:18730)
checkTypeRelatedTo (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:18317)
checkTypeRelatedToAndOptionallyElaborate (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:17463)
checkTypeAssignableToAndOptionallyElaborate (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:17448)
-> checkVariableLikeDeclaration (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:37777)
checkVariableDeclaration (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:37857)
checkSourceElementWorker (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:41294)
checkSourceElement (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:41133)
forEach (/mnt/common/github/TypeScript-cph/src/compiler/core.ts:38)
checkVariableStatement (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:37869)
checkSourceElementWorker (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:41263)


            const type = convertAutoToAny(getTypeOfSymbol(symbol));
            if (node === symbol.valueDeclaration) {
                // Node is the primary declaration of the symbol, just validate the initializer
                // Don't validate for-in initializer as it is already an error
                const initializer = getEffectiveInitializer(node);
                if (initializer) {
                    const isJSObjectLiteralInitializer = isInJSFile(node) &&
                        isObjectLiteralExpression(initializer) &&
                        (initializer.properties.length === 0 || isPrototypeAccess(node.name)) &&
                        !!symbol.exports?.size;
                    if (!isJSObjectLiteralInitializer && node.parent.parent.kind !== SyntaxKind.ForInStatement) {
                        checkTypeAssignableToAndOptionallyElaborate(checkExpressionCached(initializer), type, node, initializer, /*headMessage*/ undefined);
                    }
                }
                if (symbol.declarations && symbol.declarations.length > 1) {
                    if (some(symbol.declarations, d => d !== node && isVariableLike(d) && !areDeclarationFlagsIdentical(d, node))) {
                        error(node.name, Diagnostics.All_declarations_of_0_must_have_identical_modifiers, declarationNameToString(node.name));
                    }
                }
            }

type = [number, ...(string | boolean | undefined)[], "$"]
initializer.getText(`[1,"$"]`)
checkExpressionCached(initializer) ... [number,string]


       function createBaseBindingLikeDeclaration<T extends PropertyDeclaration | VariableDeclaration | ParameterDeclaration | BindingElement>(
            kind: T["kind"],
            decorators: readonly Decorator[] | undefined,
            modifiers: readonly Modifier[] | undefined,
            name: string | T["name"] | undefined,
            initializer: Expression | undefined
        ) {
            const node = createBaseNamedDeclaration(
                kind,
                decorators,
                modifiers,
                name
            );
            node.initializer = initializer;
            node.transformFlags |= propagateChildFlags(node.initializer);
            return node;
        }




-> checkArrayLiteral (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:27550)
checkExpressionWorker (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:34830)
checkExpression (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:34743)
checkExpressionCached (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:34380)
checkVariableLikeDeclaration (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:37777)
checkVariableDeclaration (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:37857)
checkSourceElementWorker (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:41294)
checkSourceElement (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:41133)
forEach (/mnt/common/github/TypeScript-cph/src/compiler/core.ts:38)
checkVariableStatement (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:37869)
checkSourceElementWorker (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:41263)
checkSourceElement (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:41133)
forEach (/mnt/common/github/TypeScript-cph/src/compiler/core.ts:38)
checkSourceFileWorker (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:41508)
checkSourceFile (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:41468)
checkSourceFileWithEagerDiagnostics (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:41593)
getDiagnosticsWorker (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:41606)
getDiagnostics (/mnt/common/github/TypeScript-cph/src/compiler/checker.ts:41569)
<anonymous> (/mnt/common/github/TypeScript-cph/src/compiler/program.ts:2198)
runWithCancellationToken (/mnt/common/github/TypeScript-cph/src/compiler/program.ts:2152)


modify checkArrayLiteral 

match from the back first until contextualType.elementFlags[i]!==ElementFlags.Required

Then match from the front normally.

is the middle element ... ?  

contextualType.checker.isTupleType(contextualType) -> true 
contextualType.elementFlags[]
iterate until contextualType.elementFlags[i]===ElementFlags.Rest



        function getContextualTypeForElementExpression(arrayContextualType: Type | undefined, index: number): Type | undefined {
            return arrayContextualType && (
                getTypeOfPropertyOfContextualType(arrayContextualType, "" + index as __String)
                || mapType(
                    arrayContextualType,
                    t => getIteratedTypeOrElementType(IterationUse.Element, t, undefinedType, /*errorNode*/ undefined, /*checkAssignability*/ false),
                    /*noReductions*/ true));
        }

mapType(contextualType,t => getIteratedTypeOrElementType(IterationUse.Element, t, undefinedType, /*errorNode*/ undefined, /*checkAssignability*/ false),/*noReductions*/ true))


- `isRelatedToWorker(source: Type, target: Type, reportErrors: boolean)`
  - effectively *source extends target*

            function isRelatedToWorker(source: Type, target: Type, reportErrors: boolean) {
                return isRelatedTo(source, target, RecursionFlags.Both, reportErrors);
            }

- `function isTypeRelatedTo(source: Type, target: Type, relation: ESMap<string, RelationComparisonResult>)` 
  - returns boolean

Even better 
```
function isTypeAssignableTo(source: Type, target: Type): boolean {
    return isTypeRelatedTo(source, target, assignableRelation);
}
```

excessPropertyCheckWithUnions
controlFlowBindingPatternOrder
Test failure:
Correct type/symbol baselines for tests/cases/conformance/controlFlow/controlFlowBindingPatternOrder.ts
  [▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬............................................................]
Test failure:
Correct type/symbol baselines for tests/cases/conformance/es6/destructuring/declarationsAndAssignments.ts

Test failure:
Correct type/symbol baselines for tests/cases/conformance/es6/destructuring/destructuringArrayBindingPatternAndAssignment1ES5.ts

Test failure:
Correct type/symbol baselines for tests/cases/conformance/es6/destructuring/destructuringArrayBindingPatternAndAssignment1ES5iterable.ts

Test failure:
Correct type/symbol baselines for tests/cases/conformance/es6/destructuring/destructuringArrayBindingPatternAndAssignment1ES6.ts

Test failure:
Correct errors for tests/cases/conformance/es6/destructuring/destructuringParameterDeclaration2.ts

Test failure:
Correct type/symbol baselines for tests/cases/conformance/es6/destructuring/destructuringParameterDeclaration2.ts
  [▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬...........................................................]
Test failure:
Correct type/symbol baselines for tests/cases/conformance/es6/destructuring/destructuringVariableDeclaration1ES5.ts

Test failure:
Correct type/symbol baselines for tests/cases/conformance/es6/destructuring/destructuringVariableDeclaration1ES5iterable.ts

Test failure:
Correct type/symbol baselines for tests/cases/conformance/es6/destructuring/destructuringVariableDeclaration1ES6.ts

Test failure:
Correct type/symbol baselines for tests/cases/conformance/es6/destructuring/destructuringVariableDeclaration2.ts

Test failure:
Correct type/symbol baselines for tests/cases/conformance/es6/destructuring/destructuringWithLiteralInitializers.ts

Test failure:
Correct type/symbol baselines for tests/cases/conformance/es6/destructuring/destructuringWithLiteralInitializers2.ts